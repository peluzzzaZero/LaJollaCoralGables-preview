import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { createMailboxAuthorization, MAIL_SCOPES } from '../mail-oauth.mjs';
import { createGraphMailer, BUSINESS_MAILBOX } from '../graph.mjs';

const tenantId = '11111111-1111-4111-8111-111111111111';
const clientId = '22222222-2222-4222-8222-222222222222';
const accountId = '33333333-3333-4333-8333-333333333333';
const config = { tenantId, clientId, clientSecret: 'FAKE-TEST-SECRET', redirectUri: 'https://preview.example/admin/mail/callback' };
const { publicKey, privateKey } = await generateKeyPair('RS256');
const publicJwk = { ...await exportJWK(publicKey), kid: 'test-key', alg: 'RS256', use: 'sig' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function fixture(options = {}) {
  let connection = null; let challenge; let clock = Date.now(); const calls = [];
  const vault = { get: () => connection, set: value => { connection = value; } };
  const mockFetch = async (url, request) => {
    url = String(url); calls.push({ url, request });
    if (url.endsWith('/discovery/v2.0/keys')) return json({ keys: [publicJwk] });
    if (url.endsWith('/token')) {
      const form = request.body;
      assert.equal(form.get('client_secret'), 'FAKE-TEST-SECRET');
      if (form.get('grant_type') === 'refresh_token') {
        if (options.refreshError) return json({ error: options.refreshError, error_description: 'Must never be leaked' }, 400);
        return json({ access_token: 'FAKE-REFRESHED-ACCESS', refresh_token: 'FAKE-ROTATED-REFRESH', token_type: 'Bearer', expires_in: 3600, scope: 'Mail.Send User.Read' });
      }
      assert.equal(form.get('grant_type'), 'authorization_code');
      assert.equal(form.get('redirect_uri'), config.redirectUri);
      assert.equal(form.get('code_verifier'), challenge.verifier);
      const identity = { tid: options.tenant || tenantId, oid: accountId, nonce: options.nonce || challenge.nonce };
      const signed = await new SignJWT(identity).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).setAudience(options.audience || clientId)
        .setIssuer(`https://login.microsoftonline.com/${tenantId}/v2.0`).setSubject('fake-subject').setIssuedAt().setExpirationTime('5m').sign(privateKey);
      return json({ access_token: 'FAKE-ACCESS-TOKEN', refresh_token: 'FAKE-REFRESH-TOKEN', id_token: options.badSignature ? signed.slice(0, -8) + 'abcdefgh' : signed,
        token_type: 'Bearer', expires_in: 3600, scope: options.scope || 'Mail.Send User.Read' });
    }
    if (url.includes('/me?$select=')) return json({ id: options.profileId || accountId, mail: options.mailbox || BUSINESS_MAILBOX, userPrincipalName: BUSINESS_MAILBOX });
    throw new Error('Unexpected network destination in test');
  };
  const authorization = createMailboxAuthorization(config, vault, { fetchImpl: mockFetch, now: () => clock });
  challenge = authorization.start();
  return { authorization, challenge, vault, calls, expire: () => { clock += 3600000; }, finish: () => authorization.finish('FAKE-CODE', challenge) };
}

test('browser authorization uses tenant authority, single-use challenge, PKCE S256 and delegated scopes', () => {
  const f = fixture(); const url = new URL(f.challenge.url);
  assert.equal(url.origin, 'https://login.microsoftonline.com');
  assert.equal(url.pathname, `/${tenantId}/oauth2/v2.0/authorize`);
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), MAIL_SCOPES);
  assert.equal(url.searchParams.get('login_hint'), BUSINESS_MAILBOX);
  assert.equal(url.searchParams.has('client_secret'), false);
  assert.notEqual(f.challenge.state, f.authorization.start().state);
});

test('signed identity and Graph profile bind the stored connection to the business mailbox', async () => {
  const f = fixture(); await f.finish();
  assert.equal((await f.authorization.status()).connected, true);
  assert.equal(f.vault.get().mailbox, BUSINESS_MAILBOX);
  assert.equal(await f.authorization.acquireToken(), 'FAKE-ACCESS-TOKEN');
});

for (const [name, options] of Object.entries({
  'wrong tenant': { tenant: '99999999-9999-4999-8999-999999999999' },
  'wrong audience': { audience: 'wrong-client' },
  'wrong nonce': { nonce: 'wrong-nonce' },
  'bad signature': { badSignature: true },
  'different mailbox': { mailbox: 'someone-else@example.com' },
  'different account id': { profileId: 'another-id' },
  'missing send scope': { scope: 'User.Read' },
  'extra message reading scope': { scope: 'User.Read Mail.Send Mail.Read' }
})) test(`authorization rejects ${name} without replacing credentials`, async () => {
  const f = fixture(options); await assert.rejects(f.finish()); assert.equal(f.vault.get(), null);
});

test('expired authorization never contacts the provider', async () => {
  const f = fixture(); f.expire(); await assert.rejects(f.finish(), { code: 'mail_authorization_expired' }); assert.equal(f.calls.length, 0);
});

test('concurrent refreshes run once, recheck the account and persist rotated credentials', async () => {
  const f = fixture(); await f.finish(); f.expire();
  const tokens = await Promise.all([f.authorization.acquireToken(), f.authorization.acquireToken()]);
  assert.deepEqual(tokens, ['FAKE-REFRESHED-ACCESS', 'FAKE-REFRESHED-ACCESS']);
  assert.equal(f.calls.filter(c => c.request?.body?.get?.('grant_type') === 'refresh_token').length, 1);
  assert.equal(f.vault.get().refreshToken, 'FAKE-ROTATED-REFRESH');
});

test('revoked connection requires owner login and never falls back to application-wide credentials', async () => {
  const f = fixture({ refreshError: 'invalid_grant' }); await f.finish(); f.expire();
  await assert.rejects(f.authorization.acquireToken(), { code: 'mail_reconnect_required' });
  assert.equal((await f.authorization.status()).reconnectRequired, true);
  assert.equal(f.vault.get().refreshToken, '');
  const requests = f.calls.length;
  await assert.rejects(f.authorization.acquireToken(), { code: 'mail_reconnect_required' });
  assert.equal(f.calls.length, requests);
});

test('delegated sending uses only /me/sendMail, fixes the recipient and does not replay a 401', async () => {
  let invalidated = 0; let sends = 0;
  const authorization = { acquireToken: async () => 'FAKE-ACCESS', invalidate: () => { invalidated++; } };
  const mailer = createGraphMailer(config, async (url, request) => {
    assert.equal(url, 'https://graph.microsoft.com/v1.0/me/sendMail'); sends++;
    const payload = JSON.parse(request.body);
    assert.equal(payload.message.toRecipients[0].emailAddress.address, BUSINESS_MAILBOX);
    assert.equal(payload.message.replyTo[0].emailAddress.address, 'fake-visitor@example.com');
    return new Response(null, { status: 401 });
  }, authorization);
  await assert.rejects(mailer.send('LJ-fake', { kind: 'quote', name: 'Fake visitor', email: 'fake-visitor@example.com', to: 'attacker@example.com' }));
  assert.equal(sends, 1); assert.equal(invalidated, 1);
});
