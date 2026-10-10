// Server-only: no mailbox password, browser token or third-party email relay.
export const BUSINESS_MAILBOX = 'info@lajollacoralgables.com';

export class MailFailure extends Error {
  constructor(code, { uncertain = false, retryAfter = 60 } = {}) {
    super(code); this.code = code; this.uncertain = uncertain; this.retryAfter = retryAfter;
  }
}

export function createGraphMailer(config, fetchImpl = globalThis.fetch, delegatedAuthorization) {
  let token; let expiresAt = 0; let acquiring;
  const uuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
  const configured = uuid.test(config.tenantId || '')
    && uuid.test(config.clientId || '') && !!config.clientSecret;
  const request = (url, options) => fetchImpl(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(10000) });
  async function acquireToken() {
    if (delegatedAuthorization) return delegatedAuthorization.acquireToken();
    if (!configured) throw new MailFailure('mail_not_configured');
    if (token && expiresAt > Date.now()) return token;
    if (acquiring) return acquiring;
    acquiring = (async () => {
      let response;
      try {
        response = await request(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret,
            scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' })
        });
      } catch { throw new MailFailure('mail_authorization_unavailable'); }
      if (!response.ok) throw new MailFailure('mail_authorization_failed');
      let data;
      try { data = await response.json(); } catch { throw new MailFailure('mail_authorization_failed'); }
      if (typeof data.access_token !== 'string' || !data.access_token || !Number.isFinite(data.expires_in) || data.expires_in <= 60) {
        throw new MailFailure('mail_authorization_failed');
      }
      token = data.access_token; expiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return token;
    })().finally(() => { acquiring = undefined; });
    return acquiring;
  }
  return {
    configured,
    async send(reference, inquiry) {
      const accessToken = await acquireToken();
      // Both sender and recipient are server-owned. Caller cannot use this as a relay.
      const content = ['La Jolla inquiry — ' + reference,
        'This is a request, not a confirmed appointment or event reservation.', '',
        ...Object.entries(inquiry).map(([key, value]) => key + ': ' + value)].join('\n');
      const payload = { message: {
        subject: `La Jolla ${inquiry.kind === 'vendor' ? 'vendor note' : 'inquiry'} — ${reference}`,
        body: { contentType: 'Text', content },
        toRecipients: [{ emailAddress: { address: BUSINESS_MAILBOX } }],
        replyTo: [{ emailAddress: { address: inquiry.email, name: inquiry.name } }]
      }, saveToSentItems: true };
      let response;
      try {
        response = await request(delegatedAuthorization ? 'https://graph.microsoft.com/v1.0/me/sendMail' : `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(BUSINESS_MAILBOX)}/sendMail`, {
          method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        // A lost response may follow an accepted message. Never blindly resend it.
        throw new MailFailure('mail_delivery_unknown', { uncertain: true });
      }
      if (response.status === 202) return;
      if (response.status === 401) { token = undefined; expiresAt = 0; await delegatedAuthorization?.invalidate(); }
      if (response.status === 429) {
        const header = response.headers.get('Retry-After');
        const seconds = header && /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
        throw new MailFailure('mail_throttled', { retryAfter: Math.min(86400, Math.max(60, Number.isFinite(seconds) ? seconds : 60)) });
      }
      // No provider bodies or tokens reach logs or the public response.
      throw new MailFailure(response.status >= 500 ? 'mail_delivery_unknown' : 'mail_rejected', { uncertain: response.status >= 500 });
    }
  };
}
