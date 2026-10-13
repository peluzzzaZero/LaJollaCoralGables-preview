# La Jolla Coral Gables

A bilingual editorial website for La Jolla Coral Gables, using approved brand assets and descriptions. Static HTML, CSS and JavaScript with a Node backend; locally vendored GSAP/ScrollTrigger and native scrolling. Visits are scheduled through the business-owned Microsoft Bookings page.

## Preview and checks

```sh
python -m http.server 4173
node --check script.js
node --test tests/*.test.mjs
python -m pip install -r tests/browser/requirements.txt
python -m playwright install chromium ffmpeg
python tests/browser/review.py --output review-artifacts
```

The browser runner starts its own local server. It reviews 320×600, 390×667, 390×844, 768×1024, 838×884 and 1280×900 in English and Spanish, saving screenshots and JSON results. Checks cover one complete film timeline, forward/reverse decoding, distinct reading positions, native disclosures, complete films and photo modals, chapter/deep-link navigation, safe internal form context, reduced-motion changes, short screens, SaveData, unavailable GSAP/page JavaScript and denied storage. Email requests are intercepted; no real emails are sent.

## Versions and publication

`VERSION`, the HTML application-version metadata, CSS/JavaScript cache keys and `tests/releases/vVERSION.md` must agree. Use semantic versions: new capabilities increment the minor version; fixes increment the patch version; incompatible changes increment the major version. The first numbered redesign is 1.0.0; the current version is 1.16.5. PRs to main must increase the version numerically before their checks can pass.

Work follows `feature/*` → pull request to `develop` → Claude CLI Sonnet high review (Sol medium only after a recorded failure) and tests → pull request to `main`. The **Quality and versioned release** workflow runs static and browser checks on both branches and their pull requests. On `main`, successful review creates an annotated immutable `vVERSION` tag and a GitHub release. An existing tag must point to the same commit; it is never moved or replaced.

GitHub Pages publishes `main` for https://lajollacoralgables.com. The owner selected GitHub hosting and retired the temporary jolla.peluzzza.com alias. Domain registration, DNS and Microsoft 365 email remain in GoDaddy. Verify the live version, assets, navigation and legal pages after each deployment. The release workflow does not claim that inbox delivery or the Pages deployment has been verified.

See [the current roadmap](tests/ROADMAP.md), [release policy](tests/RELEASES.md), [v1.16.5 notes](tests/releases/v1.16.5.md) and [the latest review](tests/reviews/v1.16.2.md) and [the historical review](tests/REVIEW-2026-10-04.md).

## Content requirements

Keep the year 1928, The Lexington, Julie Arias (Executive Director), Patricia Mir (Managing Director), ten services, seven brand plates and their captions. Spanish uses usted. MonteCarlo is an accent. No prices, invented testimonials, biographies, vendors or stand-in café images. No wipes, edge-on tilts, cream overlay bands or transitions through an empty dark frame.

The user authorized rethinking the old composition and scroll timings. Tests for the old exact crops, pinned history and duplicated opening paragraphs have been updated to protect the new behavior; brand and content requirements remain covered. High-resolution approved photography, Pat's final tagline, an approved guest quote and actual inbox confirmation remain external decisions.

The homepage now presents all approved public content within one nine-chapter full-screen film timeline. Expanded native chapter disclosures retain complete details. The visit action lives at `planning.html`; language follows the visitor. Service descriptions are informational, with no selection or submission controls. Reduced motion, short screens, SaveData and unavailable JavaScript retain a readable native document.

The owner requested one scheduling action in v1.16.2: **Schedule a visit**. The planning route contains a compact introduction, that action, the existing Microsoft Bookings calendar and direct contact in the footer. Quote/vendor forms and service selection controls are removed. The homepage preserves all ten service descriptions and its approved cinematic presentation.

The calendar loads only on request and requires HTTPS; its ordinary link works without JavaScript or as an embed fallback. It schedules venue tours and does not automatically reserve event spaces. Creation/cancellation business notifications were verified separately; the owner also tested rescheduling and received its email. That does not independently verify the specific custom update-flow email or venue-time formatting. Local native mail remains disabled and is no longer required by any public form.

## Optional native mail preparation and Node hosting

The v1.13.0 preparation supports GoDaddy hosted MySQL and a private browser setup at `/admin/mail`. See [the browser connection guide](server/inquiries/CONEXION_NAVEGADOR_ES.md). GoDaddy injects its five `DB_*` variables; the application creates only versioned La Jolla tables with separate preview/live namespaces. Existing tables remain unchanged. The actual GoDaddy preview at v1.12.0 was verified for startup, health, video seeking, mobile/desktop motion and planning navigation; mail and business-database persistence are not yet verified.

Two notification modes are available: GoDaddy's built-in gateway (platform sender, configured business recipient and visitor Reply-To), or browser-authorized Microsoft 365 (signed single-tenant identity and account verification, delegated Mail.Send/profile access and encrypted persisted tokens). Provider choice, hosted persistence and marked actual receipt remain owner steps. This optional preparation does not certify unlimited sending/pricing or replace the old production site/domain. The public visit calendar is independent of this backend. The shared Microsoft credential must be revoked before Microsoft mode is used; save its replacement only in private hosting settings.

Use the platform Node version within the declared range, `npm ci`, `npm run build` and `npm start`. The server listens on its assigned `PORT`. Native public delivery and private setup default off; adding credentials alone does not enable either. `/healthz` reports process health and enabled state only. Public pages/assets are allowed, private files/source are denied, and HTTP byte ranges preserve the approved films.

Node-served planning forms use the same-origin API without a Web3Forms fallback. Static GitHub Pages retains its old transport while the migration is pending. Activate only after the private setup records verified storage, mailbox authorization when applicable and manually confirmed technical receipt. Contact fields are retained on failed submissions; UUIDs prevent accepted unchanged retries from being resent during the browser session, and uncertain saved records need owner reconciliation. Automated tests use isolated fake providers and a local/CI MySQL container, never real mail or the business database.

## Cinematic art direction

The interface pairs self-hosted Cormorant Garamond titles with Manrope body copy and controls, opaque forest chapter readers, factual room/occasion copy and an adaptive full-screen camera with an accessible chapter directory. The ballroom is supported by its original photograph, and detail captions distinguish house/brand imagery from verified room views. Desktop avoids enlarging portrait recordings; phones retain native captured frames. See [the art-direction review](tests/CINEMATIC-ART-DIRECTION.md) and the source manifest. No additional generation or production launch is implied.

## Public-only Pages deployment

`npm run build` creates ignored `dist/` from a closed list of public pages and assets. Development source, tests, configuration, package files and media provenance stay in GitHub rather than on the commercial domain. Browser CI serves the actual `dist/` tree and verifies excluded paths return404. On main, quality and the immutable release must pass before Pages deploys the uploaded artifact. In Settings → Pages, Source must be **GitHub Actions**, preserving `lajollacoralgables.com` and Enforce HTTPS. Public capacities/policies require confirmed owner data; forms/prices and new contact channels are excluded from this correction.
