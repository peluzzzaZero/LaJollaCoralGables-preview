# First-party inquiry mail service — activation pending

This service belongs to the La Jolla project. It receives quote/vendor data, stores it privately and uses the business's Microsoft 365 account to notify info@lajollacoralgables.com through Microsoft Graph. It does not use Web3Forms, Resend or another transactional email intermediary and has no 250-submission monthly billing quota. Microsoft account sending limits and hosting resource limits still apply. Hosting and existing Microsoft licensing must be verified before promising no incremental cost.

**Current state:** tested server prototype on a feature branch. No Microsoft credentials, real Graph delivery, public endpoint, calendar integration or frontend switch is configured. The Node hosting package is prepared in v1.12.0; deployment and actual mail remain unverified. The v1.11.2 Web3Forms PR is paused after the client's quota objection; its one authorized provider-accepted technical test does not verify Graph or inbox receipt.

The client prefers future GoDaddy hosting, but explicitly withholds authorization to replace the production website. Prepare and verify mail first. [Spanish activation guide](ACTIVACION_ES.md) covers app registration, mailbox-scoped authorization and an operator-only technical test. `verify-mail.mjs --send-technical-test <UUID>` can send one marked real email when deliberately invoked with private runtime credentials; reuse its key and durable database on retry. It never claims inbox receipt and is never run by automated CI with a real provider.

## Request and acceptance

POST `/api/inquiries` with JSON, an allowed Origin and a UUID `Idempotency-Key`. The body contains `kind: "quote"` or `kind: "vendor"`, followed by the existing planning-page named fields. The complete record is committed before asking Microsoft to send the message. Caller-provided sender, recipient, CC and URLs are rejected. Sender and recipient are fixed server-side; the visitor's email is used only for reply-to. The email is plain text and explicitly says the preferred date does not confirm a booking.

HTTP 200/success=true means the inquiry is stored and Microsoft accepted its notification. Microsoft Graph's 202 is not proof of inbox receipt. Real receipt must be separately verified. Retrying the same request key and normalized data returns its original reference without resending accepted mail. A changed payload needs a new key. Failed submissions retain the same key for explicit retries; unknown delivery/in-flight records must be reconciled by an authorized operator before retrying. No automatic blind retries occur. This prototype does not yet provide an owner dashboard or background retry scheduler.

Burst limits protect the account from abuse without monthly submission billing: ten new/send attempts per IP per ten minutes and 25 globally per minute. CORS is not authentication and arbitrary clients can forge Origin. Before public activation, review reverse-proxy IP handling and add appropriate bot protection for actual traffic. No public record lookup is provided; request failures never expose provider bodies, access tokens or contact data.

## Authenticate the business account

1. The client confirms the business email appears in the GoDaddy owner Email & Office dashboard and can be administered. Verify the actual Microsoft 365 mailbox/plan and the available advanced admin center; DNS alone establishes routing, not licensing or permissions. Use the GoDaddy owner login, not merely the email user login.
2. In the business Microsoft Entra tenant, register a single-tenant application called `La Jolla — Inquiries`. Tenant ID and Client ID are identifiers, not passwords. This prototype uses server-to-server client credentials; a mailbox password or ChatGPT Outlook connection cannot authorize it.
3. Give that application only the Exchange Online `Application Mail.Send` role, scoped through Application RBAC to info@lajollacoralgables.com. Test that the business mailbox is in scope and an unrelated mailbox is not. Do not also grant an unrestricted organization-wide Mail.Send permission in Entra: those grants are additive and bypass the narrower RBAC scope. If the GoDaddy account cannot perform the required Microsoft administration, use the business administrator/GoDaddy support; do not disable MFA/security defaults as a shortcut.
4. Configure an application credential only in the private server's secret settings. Never send mailbox passwords/client secrets in chat or commit them. Set the variable names in `.env.example` through that secure channel. Rotate the application credential before expiry. The prototype currently supports an app secret; certificates/federated identity can replace it when the actual host is selected.
5. Keep the sender and primary destination fixed to the business mailbox. No inbox-reading or calendar permissions are needed for notification alone. Real calendar access requires a later scoped integration and business-approved scheduling rules.

## Hosting and connection gate

GitHub Pages cannot execute this server. Owning a GoDaddy domain and mailbox does not establish a server hosting subscription. This portable implementation needs Node >=22.13 with `node:sqlite` and a durable private filesystem (Node 24 also works). It can run on an existing compatible server; do not purchase one or activate metered resources without an agreed hosting plan. It is not a Cloudflare Worker build: a Workers/Sites deployment would require a D1 persistence adapter and its own verified deployment.

Launch `node server/inquiries/index.mjs` with runtime secrets supplied by the server environment. It binds to 127.0.0.1:8787 by default. Place the persistent database outside the public web root, restrict its directory, back it up privately, and expose only the API through an HTTPS reverse proxy. Never expose source directories, .env files, SQLite files or their journals. Enable INQUIRY_TRUST_LOOPBACK_PROXY only when the loopback gateway replaces X-Real-IP and direct public access to the Node listener is blocked. Otherwise IP limits correctly use the socket peer (which may be the gateway).

The client form must switch only after actual credentials and a deployed endpoint work. Its future adapter must generate/reuse UUID request keys in memory, add the correct kind, retain fields on failures, and display only a stored-and-mail-accepted confirmation. It must never report an event reservation. Add the final domain to INQUIRY_ALLOWED_ORIGINS and retest when migrating; do not alter the mailbox destination.

No frontend changes or release/version bump are made for this unactivated prototype. Activation requires syntax/unit/HTTP/storage review, safe account authorization, actual received technical email, deployment and frontend/browser verification. Then use the authorized feature → dev → main cycle with a new semantic version, immutable tag and release. Calendar availability and reservations are a separate gate.

## Tests

`node --test server/inquiries/tests/*.test.mjs`

All network mail calls in tests are mocked. HTTP runtime tests explicitly clear Microsoft credentials and use temporary fake records. Coverage includes persistence across restart, fixed mailbox/reply-to, token acquisition, no secret echo, validation, concurrency, idempotency, throttling, unknown-send reconciliation, configured/unconfigured errors, request limits and private-path rejection. More than 250 accepted mocked inquiries across non-burst windows confirms there is no monthly 250-submit gate.

## Official references

- https://www.godaddy.com/help/access-my-email-office-dashboard-26409
- https://www.godaddy.com/help/change-my-microsoft-365-users-admin-permissions-42235
- https://www.godaddy.com/help/access-advanced-admin-centers-32132
- https://learn.microsoft.com/en-us/graph/auth-v2-service
- https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits
