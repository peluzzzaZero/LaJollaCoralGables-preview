import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, customFetch } from 'jose';
import { BUSINESS_MAILBOX, MailFailure } from './graph.mjs';

export const MAIL_SCOPES = 'openid profile offline_access https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Send';
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const safeToken = value => typeof value === 'string' && value.length > 0 && value.length < 32768;

export function createMailboxAuthorization(config, vault, { fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  if (!uuid.test(config.tenantId || '') || !uuid.test(config.clientId || '') || !config.clientSecret) throw new Error('mail_oauth_configuration_required');
  const issuer = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  const authority = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0`;
  const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${config.tenantId}/discovery/v2.0/keys`), { timeoutDuration: 10000, [customFetch]: fetchImpl });
  const validateIdentity = async token => (await jwtVerify(token, jwks, {
    issuer, audience: config.clientId, algorithms: ['RS256'], requiredClaims: ['exp', 'iat', 'sub', 'tid', 'oid', 'nonce']
  })).payload;
  const request = (url, options) => fetchImpl(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(10000) });
  let pending;
  async function tokens(parameters) {
    let response;
    try { response = await request(authority + '/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, scope: MAIL_SCOPES, ...parameters }) }); }
    catch { throw new MailFailure('mail_authorization_unavailable'); }
    let data;
    try { data = await response.json(); } catch { throw new MailFailure('mail_authorization_failed'); }
    if (!response.ok) {
      if (data.error === 'invalid_grant') throw new MailFailure('mail_reconnect_required');
      throw new MailFailure('mail_authorization_failed');
    }
    const scopes = new Set((data.scope || '').split(' ').map(s => s.replace('https://graph.microsoft.com/', '')));
    const permitted = new Set(['openid', 'profile', 'email', 'offline_access', 'User.Read', 'Mail.Send']);
    if (!safeToken(data.access_token) || data.token_type?.toLowerCase() !== 'bearer' || !Number.isFinite(data.expires_in) || data.expires_in <= 60
      || !scopes.has('Mail.Send') || !scopes.has('User.Read') || [...scopes].some(scope => !permitted.has(scope))) {
      throw new MailFailure('mail_authorization_scope_invalid');
    }
    return data;
  }
  async function checkMailbox(accessToken, expectedId) {
    let response; let profile;
    try {
      response = await request('https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName', { headers: { Authorization: `Bearer ${accessToken}` } });
      profile = await response.json();
    } catch { throw new MailFailure('mail_identity_unavailable'); }
    const address = profile.mail || profile.userPrincipalName;
    if (!response.ok || profile.id !== expectedId || typeof address !== 'string' || address.toLowerCase() !== BUSINESS_MAILBOX) {
      throw new MailFailure('mail_wrong_account');
    }
  }
  return {
    start() {
      const state = randomBytes(32).toString('base64url');
      const nonce = randomBytes(32).toString('base64url');
      const verifier = randomBytes(32).toString('base64url');
      const params = new URLSearchParams({ client_id: config.clientId, response_type: 'code', response_mode: 'query',
        redirect_uri: config.redirectUri, scope: MAIL_SCOPES, state, nonce, prompt: 'select_account', login_hint: BUSINESS_MAILBOX,
        code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' });
      return { state, nonce, verifier, expiresAt: now() + 600000, url: authority + '/authorize?' + params };
    },
    async finish(code, challenge) {
      if (!safeToken(code) || !challenge || challenge.expiresAt <= now()) throw new MailFailure('mail_authorization_expired');
      const data = await tokens({ grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, code_verifier: challenge.verifier });
      let identity;
      try { identity = await validateIdentity(data.id_token); } catch { throw new MailFailure('mail_identity_invalid'); }
      if (identity.tid !== config.tenantId || identity.nonce !== challenge.nonce || !uuid.test(identity.oid || '') || !safeToken(data.refresh_token)) {
        throw new MailFailure('mail_identity_invalid');
      }
      await checkMailbox(data.access_token, identity.oid);
      await vault.set({ accountId: identity.oid, mailbox: BUSINESS_MAILBOX, accessToken: data.access_token, refreshToken: data.refresh_token,
        expiresAt: now() + (data.expires_in - 60) * 1000, connectedAt: now(), reconnectRequired: false });
    },
    async status() {
      const connection = await vault.get();
      return { connected: !!connection && !connection.reconnectRequired, reconnectRequired: !!connection?.reconnectRequired };
    },
    async acquireToken() {
      const connection = await vault.get();
      if (!connection || connection.reconnectRequired) throw new MailFailure('mail_reconnect_required');
      if (connection.mailbox !== BUSINESS_MAILBOX || !uuid.test(connection.accountId || '')) throw new MailFailure('mail_wrong_account');
      if (connection.expiresAt > now()) return connection.accessToken;
      if (pending) return pending;
      pending = (async () => {
        let data;
        try { data = await tokens({ grant_type: 'refresh_token', refresh_token: connection.refreshToken }); }
        catch (error) {
          if (error.code === 'mail_reconnect_required') await vault.set({ ...connection, accessToken: '', refreshToken: '', reconnectRequired: true });
          throw error;
        }
        await checkMailbox(data.access_token, connection.accountId);
        if (data.refresh_token !== undefined && !safeToken(data.refresh_token)) throw new MailFailure('mail_authorization_failed');
        await vault.set({ ...connection, accessToken: data.access_token, refreshToken: data.refresh_token || connection.refreshToken,
          expiresAt: now() + (data.expires_in - 60) * 1000 });
        return data.access_token;
      })().finally(() => { pending = undefined; });
      return pending;
    },
    async invalidate() {
      const connection = await vault.get();
      if (connection) await vault.set({ ...connection, expiresAt: 0 });
    }
  };
}
