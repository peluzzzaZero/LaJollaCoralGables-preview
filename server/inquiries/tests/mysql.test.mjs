import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createConnection } from 'mysql2/promise';
import { openManagedMysql, managedMysqlConfig } from '../mysql-store.mjs';
import { createInquiryService } from '../service.mjs';
import { MailFailure } from '../graph.mjs';
import { createMailSetup } from '../mail-setup.mjs';

// Explicitly opt in to the isolated local/CI MySQL container. Never use business credentials.
const enabled = process.env.MAIL_MYSQL_TEST === 'true';
const env = { DB_HOST: '127.0.0.1', DB_PORT: '13316', DB_NAME: 'lajolla_test', DB_USER: 'root', DB_PASSWORD: 'FAKE-ISOLATED-TEST-PASSWORD' };
const origin = 'https://preview.example';
const inquiry = { kind: 'vendor', name: 'Isolated test', email: 'fake@example.com', company: 'Fake company', service: 'Technical test only' };
const request = key => new Request('http://local/api/inquiries', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(inquiry) });

test('managed MySQL requires all five hosting variables and rejects caller-defined table namespaces', async () => {
  assert.throws(() => managedMysqlConfig({ ...env, DB_PASSWORD: '' }));
  assert.throws(() => managedMysqlConfig({ ...env, DB_PORT: 'bad' }));
  await assert.rejects(openManagedMysql({ ...env, INQUIRY_STORAGE_NAMESPACE: 'preview;DROP TABLE existing' }));
});

test('MySQL persists inquiry state, isolates namespaces and leaves unrelated tables untouched', { skip: !enabled }, async () => {
  const probe = await createConnection(managedMysqlConfig(env)); let preview; let live;
  const key = randomUUID();
  try {
    await probe.execute('CREATE TABLE IF NOT EXISTS existing_customer_table (id INT PRIMARY KEY, value VARCHAR(50))');
    await probe.execute("INSERT INTO existing_customer_table VALUES (1,'keep-existing-data') ON DUPLICATE KEY UPDATE id=id");
    preview = await openManagedMysql(env);
    const saved = await preview.store.create(key, 'f'.repeat(64), inquiry, Date.now());
    await preview.store.settle(key, 'uncertain'); await preview.close(); preview = await openManagedMysql(env);
    assert.equal((await preview.store.get(key)).reference, saved.reference);
    assert.equal((await preview.store.get(key)).state, 'uncertain');
    assert.equal(await preview.store.claim(key, Date.now()), false);
    live = await openManagedMysql({ ...env, INQUIRY_STORAGE_NAMESPACE: 'live' });
    assert.equal(await live.store.get(key), undefined);
    const [rows] = await probe.execute('SELECT value FROM existing_customer_table WHERE id=1');
    assert.equal(rows[0].value, 'keep-existing-data');
  } finally { await preview?.close(); await live?.close(); await probe.end(); }
});

test('MySQL atomically claims simultaneous submissions and accepted requests are not resent after restarting', { skip: !enabled }, async () => {
  let storage = await openManagedMysql(env); const key = randomUUID(); let sends = 0;
  const mailer = { configured: true, send: async () => { sends++; await new Promise(resolve => setTimeout(resolve, 40)); } };
  try {
    let handle = createInquiryService({ store: storage.store, mailer, origins: [origin], rateSecret: randomUUID() });
    const responses = await Promise.all([handle(request(key), randomUUID()), handle(request(key), randomUUID())]);
    assert.equal(sends, 1); assert.equal(responses.filter(r => r.status === 200).length >= 1, true);
    const reference = (await storage.store.get(key)).reference;
    await storage.close(); storage = await openManagedMysql(env);
    handle = createInquiryService({ store: storage.store, mailer, origins: [origin], rateSecret: randomUUID() });
    const again = await handle(request(key), 'restarted-test'); assert.equal(again.status, 200);
    assert.equal((await again.json()).reference, reference); assert.equal(sends, 1);
  } finally { await storage.close(); }
});

test('MySQL protects global throughput under concurrency and retains uncertain delivery for review', { skip: !enabled }, async () => {
  const storage = await openManagedMysql(env); const bucket = randomUUID(); const now = Date.now(); const key = randomUUID(); let sends = 0;
  try {
    const rates = await Promise.all(Array.from({ length: 30 }, () => storage.store.rate(bucket, now, 10, 60000)));
    assert.equal(rates.filter(r => r.allowed).length, 10);
    assert.equal((await storage.store.rate(bucket, now + 60000, 10, 60000)).allowed, true);
    const handle = createInquiryService({ store: storage.store, mailer: { configured: true, send: async () => { sends++; throw new MailFailure('mail_delivery_unknown', { uncertain: true }); } }, origins: [origin], rateSecret: randomUUID() });
    const first = await handle(request(key), 'fake-uncertain'); assert.equal(first.status, 503);
    assert.equal((await storage.store.get(key)).state, 'uncertain');
    assert.equal((await handle(request(key), 'fake-uncertain')).status, 409); assert.equal(sends, 1);
  } finally { await storage.close(); }
});

test('MySQL encrypted credentials and persistent setup/test identifiers survive reconnects', { skip: !enabled }, async () => {
  let storage = await openManagedMysql({ ...env, INQUIRY_STORAGE_NAMESPACE: 'live' }); let vault;
  const config = { secret: 'FAKE-PRIVATE-VAULT-KEY-AT-LEAST-32-CHARACTERS', tenantId: 'fake-tenant', clientId: 'fake-app' };
  const probe = await createConnection(managedMysqlConfig(env));
  try {
    vault = await storage.openVault(config); const marker = vault.storageMarker; const testKey = vault.technicalTestKey;
    await vault.set({ refreshToken: 'FAKE-PRIVATE-REFRESH-ONLY-FOR-TESTS', accessToken: 'FAKE-PRIVATE-ACCESS-ONLY-FOR-TESTS' });
    const [rows] = await probe.execute('SELECT encrypted FROM lajolla_live_v1_mail_connection WHERE id=1');
    assert.equal(rows[0].encrypted.includes('FAKE-PRIVATE-REFRESH'), false);
    vault.close(); await storage.close(); storage = await openManagedMysql({ ...env, INQUIRY_STORAGE_NAMESPACE: 'live' });
    vault = await storage.openVault(config); assert.equal(vault.storageMarker, marker); assert.equal(vault.technicalTestKey, testKey);
    assert.equal((await vault.get()).refreshToken, 'FAKE-PRIVATE-REFRESH-ONLY-FOR-TESTS');
    vault.close(); vault = await storage.openVault({ ...config, secret: 'DIFFERENT-PRIVATE-KEY-AT-LEAST-32-CHARACTERS' });
    await assert.rejects(vault.get(), /cannot_be_decrypted/);
  } finally { vault?.close(); await storage.close(); await probe.end(); }
});

test('GoDaddy setup opens managed MySQL without Microsoft credentials or contacting a mail provider; public activation stays gated', { skip: !enabled }, async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Setup must not contact any mail provider'); });
  const setup = await createMailSetup({ ...env, MAIL_PROVIDER: 'godaddy', MAIL_PUBLIC_ORIGIN: origin,
    MAIL_SETUP_SECRET: 'FAKE-PRIVATE-SETUP-KEY-AT-LEAST-32-CHARACTERS', CONTACT_FORM_RECIPIENT_EMAIL: 'info@lajollacoralgables.com' });
  try {
    assert.equal(setup.mailer.configured, true);
    assert.equal(await setup.activationReady(), false);
    assert.deepEqual(setup.origins, [origin]);
    assert.equal(setup.rateSecret.length >= 32, true);
  } finally { await setup.close(); }
});
