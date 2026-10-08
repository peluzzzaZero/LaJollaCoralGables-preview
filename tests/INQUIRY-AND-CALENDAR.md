# Inquiry delivery and real availability

The client requested notification to info@lajollacoralgables.com, appointment scheduling and management of space availability on 8 October 2026. A real browser screenshot showed Web3Forms submission failure. The exact provider response for that submission has not been captured; the generic error alone does not establish an invalid key, quota, domain rejection or a paid-feature rejection.

## Verified configuration and remaining input

- DNS MX resolves to lajollacoralgables-com.mail.protection.outlook.com. The tenant verification TXT is NETORGFT21116605.onmicrosoft.com. This indicates Microsoft 365 routing; it does not establish mailbox existence, owner access or a Bookings license.
- The site's original key predates the redesign and has no documented verified primary recipient. `ccemail` targets the business address, but Web3Forms documents it as a paid feature. Keep this distinction explicit; changing/removing CC without confirming the primary recipient could misroute leads.
- Public-origin CORS preflight succeeds. A deliberately filled honeypot returns HTTP 400 with the expected rejection and no email dispatch. This verifies connectivity and bot rejection, not successful delivery or the key's recipient.
- Need access to the existing Web3Forms account or a business-owned delivery configuration, plus confirmation that the business inbox actually receives a clearly identified delivery test. Never publish private mail credentials.

## Proposed booking workflow for review

1. Persist each inquiry with an idempotency key, reference, status and delivery state in a private backend. Notify the business address and acknowledge the visitor only after durable acceptance. Track/retry mail failures; a client timeout alone must never trigger duplicate booking or duplicate mail.
2. A successful inquiry is not an event booking. The acknowledgment can offer a tour scheduling link. The client's brief originally names Google Calendar; the present email routing suggests Outlook. Confirm the actual shared calendar before choosing an integration. Avoid two competing calendars as sources of truth.
3. For Outlook, check whether the existing subscription enables Microsoft Bookings. Use a shared tour schedule associated with the business team. Configure real staff availability, approved visit duration, buffers, notice/cancellation windows and America/New_York timezone. Bookings can manage appointment slots; do not assume it provides the complete venue event inventory model.
4. Keep room calendars/resources separate from staff calendars: confirmed business-approved spaces, including The Lexington and the ballroom, with event occupancy and setup/cleanup blocks. A full-house reservation must block all affected rooms. Decide whether two events or a tour and an event may coexist before publishing any availability.
5. Query availability server-side and recheck at confirmation. Use atomic conflict prevention and handle cancellation, rescheduling, expired holds and webhook retries. Show only open slots to visitors; never expose client names or private calendar descriptions.
6. Start with team-confirmed visits unless automatic confirmation is explicitly selected. Pending requests need a bounded hold policy; do not show a confirmed reservation or send a calendar invitation until acceptance.

## Release gates for automation

Verified business account and calendar ownership; actual delivery test received; correct timezone/DST; concurrent visitors cannot book the same constrained slot; event and preparation blocks prevent invalid tours; cancellation frees the correct resources; private data is inaccessible from the public site; failures never display false confirmation.

Sources:
- https://docs.web3forms.com/getting-started/api-reference
- https://docs.web3forms.com/getting-started/pro-features/add-cc-email
- https://docs.web3forms.com/getting-started/troubleshooting
- https://learn.microsoft.com/en-us/microsoft-365/bookings/bookings-overview
- https://learn.microsoft.com/en-us/microsoft-365/bookings/bookings-faq
