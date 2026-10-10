# Native inquiry mail — activation pending

The project's Node server stores quote/vendor inquiries before notifying `info@lajollacoralgables.com`. GoDaddy's hosted MySQL is supported; Node automatically reads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD`. Only `lajolla_preview_v1_*` or `lajolla_live_v1_*` tables are created, based on a strict namespace allowlist. Existing unrelated tables are not modified. SQLite remains available for an explicitly configured private persistent host and isolated tests.

Follow [the browser setup guide](CONEXION_NAVEGADOR_ES.md). `/admin/mail` is off by default. Once explicitly configured, a private setup password, HttpOnly/Secure/SameSite owner session, exact-origin POST and CSRF token gate its actions. Microsoft additionally uses a cookie-bound single-use state, nonce, PKCE and verified signed identity. Its Graph profile must identify the business account before encrypted tokens are stored. Refreshes recheck the account, save rotated tokens and require owner login when access is revoked. No mailbox password, local PC installation, device-code login, message-reading or calendar permission is used.

Notification options are distinct:

- GoDaddy gateway: documented fixed loopback helper, platform-selected sender, `CONTACT_FORM_RECIPIENT_EMAIL` restricted to the business mailbox, visitor Reply-To. No Microsoft credential is required. Gateway acceptance is not inbox receipt; undocumented quotas or prices are not promised.
- Microsoft: delegated Mail.Send plus profile-only User.Read; send via `/me/sendMail` from the authorized business account to the business mailbox. No fallback to app-wide credentials. The earlier application-only Graph provider remains an advanced scoped-Exchange alternative; its permissions were never applied. A client secret shared in chat must be revoked and replaced privately before use.

## Acceptance and duplicates

POST `/api/inquiries` with approved Origin, JSON, `kind: quote` or `kind: vendor`, named planning fields and a UUID Idempotency-Key. Reject unknown fields, caller destinations/senders, invalid dates/types/services and oversized bodies. Save before sending; conditionally claim a queued request before contacting the provider. Exact accepted retries return their saved reference. Conflicting payloads return 409; in-flight/uncertain records require owner reconciliation. No blind resend occurs after a lost response. No public record lookup or background resend dashboard is provided.

A success means saved and accepted by the provider, not received, booked or scheduled. Both native forms retain written fields on failure, use the same in-memory UUID for unchanged retries, and show a saved reference for uncertain delivery. The Node-served page always uses the same-origin API; static Pages retains its legacy transport while migration is pending. No contacts or tokens are stored in browser storage.

Ten attempts per IP per ten minutes and 25 globally per minute protect throughput; these are not monthly billing quotas. Origin/CORS is not visitor authentication. Socket IP is used unless an explicitly trusted loopback proxy overwrites X-Real-IP. Accepted records expire after 30 days; uncertain/failed records remain for reconciliation. Database errors fail closed and provider bodies/secrets are not exposed.

## Owner verification and activation

Native setup and public delivery are independently off by default. The owner verifies the same storage marker after restarting and redeploying, authorizes Microsoft if chosen, deliberately sends a marked technical test through the private page and confirms its reference in the inbox. Test UUIDs and receipt confirmation are provider-specific and persist in storage. Switching providers cannot reuse proof from another provider. Only then may `INQUIRY_ENABLED=true` activate the prepared native endpoint in Preview. The legacy operator-only technical CLI remains available for the scoped application provider; never run it or the browser test with real credentials in CI.

The actual hosted persistence, chosen provider, real technical receipt and both form receipts remain unverified. No old production site, domain/DNS or calendar has been changed. Keep namespace `preview` until the business explicitly authorizes production deployment. Backups, account plan limits and operational reconciliation remain owner responsibilities.

## Isolated checks

`npm test` runs mock-only tests and skips MySQL integration unless `MAIL_MYSQL_TEST=true`. CI supplies an isolated MySQL 8.4 service on local port 13316 using fake credentials; tests never consume business DB values. The explicit MySQL checks cover concurrency, persistence, unrelated tables, namespace isolation, throughput and encrypted token storage. `tests/browser/native-forms.py` intercepts every delivery call while testing both Node-served forms, UUID reuse, uncertain references and languages. No automated test sends real mail.
