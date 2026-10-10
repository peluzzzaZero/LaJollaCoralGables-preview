import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createMailAdmin } from '../mail-admin.mjs';

const origin = 'https://preview.example';
const secret = 'FAKE-PRIVATE-SETUP-KEY-AT-LEAST-32-CHARACTERS';
async function fixture() {
  const metadata = new Map(); let finishCalls = 0; let testCalls = 0; let connected = false; let delivery;
  const vault = { storageMarker: 'fake-marker', readMetadata: n => metadata.get(n), writeMetadata: (n,v) => metadata.set(n,v) };
  const authorization = { status: () => ({ connected }), start: () => ({ state: 'fake-state', nonce: 'fake-nonce', expiresAt: Date.now() + 600000,
    url: 'https://login.microsoftonline.com/fake/authorize?state=fake-state' }), finish: async () => { finishCalls++; connected = true; } };
  const admin = createMailAdmin({ origin, setupSecret: secret, authorization, vault, testStatus: () => delivery,
    technicalTest: async () => { testCalls++; if (!delivery) delivery = { state: 'accepted', reference: 'LJ-fake-technical-reference' }; return { success: true }; } });
  const server = createServer((req,res) => { admin.handle(req,res).catch(() => { res.writeHead(500); res.end(); }); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = ''; let csrf;
  const request = async (path, values, options = {}) => {
    const r = await fetch(base + path, { redirect: 'manual', method: values ? 'POST' : 'GET', headers: { ...(cookie ? { Cookie: cookie } : {}),
      ...(values ? { Origin: options.origin || origin, 'Content-Type': 'application/x-www-form-urlencoded' } : {}) }, ...(values ? { body: new URLSearchParams(values) } : {}) });
    if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0]; return r;
  };
  const login = async () => {
    const r = await request('/admin/mail/connect', { setup_secret: secret }); assert.equal(r.status, 303);
    assert.match(r.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax; Path=\//);
    const html = await (await request('/admin/mail')).text(); csrf = /name="csrf" value="([^"]+)"/.exec(html)[1]; return csrf;
  };
  return { request, login, get csrf() { return csrf; }, metadata, calls: () => ({ finishCalls, testCalls }),
    close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}

test('private setup hides account state and requires secret, same-origin POST and CSRF', async () => {
  const f = await fixture();
  try {
    const get = await f.request('/admin/mail'); assert.equal(get.status, 200);
    const html = await get.text(); assert.equal(html.includes('fake-marker'), false); assert.equal(html.includes(secret), false);
    assert.equal(get.headers.get('referrer-policy'), 'no-referrer'); assert.match(get.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal((await f.request('/admin/mail/test', { confirmed: 'yes' })).status, 401);
    assert.equal((await f.request('/admin/mail/connect', { setup_secret: 'wrong' })).status, 401);
    assert.equal((await f.request('/admin/mail/connect', { setup_secret: secret }, { origin: 'https://other.example' })).status, 403);
    await f.login();
    assert.equal((await f.request('/admin/mail/test', { confirmed: 'yes', csrf: 'wrong' })).status, 403);
    assert.equal((await f.request('/admin/mail/test', { confirmed: 'yes', csrf: f.csrf })).status, 409);
    assert.deepEqual(f.calls(), { finishCalls: 0, testCalls: 0 });
  } finally { await f.close(); }
});

test('callback is bound to owner cookie and state and cannot be replayed', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.request('/admin/mail/callback?state=fake-state&code=fake-code')).status, 400);
    await f.login();
    await f.request('/admin/mail/storage', { csrf: f.csrf, confirmed: 'yes' });
    const start = await f.request('/admin/mail/connect', { csrf: f.csrf });
    assert.match(start.headers.get('location'), /^https:\/\/login.microsoftonline.com/);
    assert.equal((await f.request('/admin/mail/callback?state=wrong&code=fake-code')).status, 400);
    assert.equal(f.calls().finishCalls, 0);
    await f.request('/admin/mail/connect', { csrf: f.csrf });
    const callback = await f.request('/admin/mail/callback?state=fake-state&code=fake-code');
    assert.equal(callback.status, 303); assert.equal(callback.headers.get('location'), '/admin/mail');
    assert.equal((await f.request('/admin/mail/callback?state=fake-state&code=fake-code')).status, 400);
    assert.equal(f.calls().finishCalls, 1);
  } finally { await f.close(); }
});

test('technical mail and owner receipt require separate explicit actions; display never claims automatic receipt', async () => {
  const f = await fixture();
  try {
    await f.login(); await f.request('/admin/mail/storage', { csrf: f.csrf, confirmed: 'yes' });
    await f.request('/admin/mail/connect', { csrf: f.csrf }); await f.request('/admin/mail/callback?state=fake-state&code=fake-code');
    assert.equal((await f.request('/admin/mail/receipt', { csrf: f.csrf, confirmed: 'yes' })).status, 409);
    const page = await (await f.request('/admin/mail')).text(); assert.equal(f.calls().testCalls, 0);
    assert.equal((await f.request('/admin/mail/test', { csrf: f.csrf })).status, 400);
    assert.equal(f.calls().testCalls, 0);
    assert.equal((await f.request('/admin/mail/test', { csrf: f.csrf, confirmed: 'yes' })).status, 303);
    const result = await (await f.request('/admin/mail')).text(); assert.match(result, /Eso no confirma su recepción/);
    assert.equal(f.metadata.has('receipt-reference'), false);
    await f.request('/admin/mail/receipt', { csrf: f.csrf, confirmed: 'yes' });
    assert.equal(f.metadata.get('receipt-reference'), 'LJ-fake-technical-reference');
    await f.request('/admin/mail/logout', { csrf: f.csrf });
    assert.equal((await f.request('/admin/mail/test', { csrf: f.csrf, confirmed: 'yes' })).status, 401);
  } finally { await f.close(); }
});

test('wrong setup secret is rate limited and never starts authorization', async () => {
  const f = await fixture();
  try {
    for (let i = 0; i < 10; i++) assert.equal((await f.request('/admin/mail/connect', { setup_secret: 'wrong' })).status, 401);
    assert.equal((await f.request('/admin/mail/connect', { setup_secret: secret })).status, 429);
    assert.deepEqual(f.calls(), { finishCalls: 0, testCalls: 0 });
  } finally { await f.close(); }
});
