# La Jolla Coral Gables

A bilingual landing page for La Jolla Coral Gables, using approved brand assets and descriptions. Static HTML, CSS and JavaScript with a Node backend; locally vendored GSAP/ScrollTrigger and native scrolling. Visits are scheduled through the business-owned Microsoft Bookings page.

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

`VERSION`, the HTML application-version metadata, CSS/JavaScript cache keys and `tests/releases/vVERSION.md` must agree. Use semantic versions: new capabilities increment the minor version; fixes increment the patch version; incompatible changes increment the major version. The first numbered redesign is 1.0.0; the current version is 1.23.0. PRs to main must increase the version numerically before their checks can pass.

Work follows `feature/*` → pull request to `develop` → Claude CLI Sonnet high review (Sol medium only after a recorded failure) and tests → pull request to `main`. The **Quality and versioned release** workflow runs static and browser checks on both branches and their pull requests. On `main`, successful review creates an annotated immutable `vVERSION` tag and a GitHub release. An existing tag must point to the same commit; it is never moved or replaced.

GitHub Pages publishes `main` for https://lajollacoralgables.com. The owner selected GitHub hosting and retired the temporary jolla.peluzzza.com alias. Domain registration, DNS and Microsoft 365 email remain in GoDaddy. Verify the live version, assets, navigation and legal pages after each deployment. The release workflow does not claim that inbox delivery or the Pages deployment has been verified.

See [the current roadmap](tests/ROADMAP.md), [release policy](tests/RELEASES.md), [v1.23.0 notes](tests/releases/v1.23.0.md) and [the latest review](tests/reviews/v1.16.2.md) and [the historical review](tests/REVIEW-2026-10-04.md).

## Optional live guest reviews

The owner confirmed the Google Maps place `ChIJWbeTzJu32YgRbGDUdwzI0W0`. The homepage loads social providers only on explicit visitor actions. The facebook.com/lajollaballroom page once linked here is not La Jolla Coral Gables’ account (owner, 14 October 2026); no Facebook link is published until the owner supplies the correct one. Reviews use the official Places JavaScript API and select attributed five-star examples in Google's relevance order, preserving original text, dates and individual review links. They are not an overall venue rating. No review bodies are committed or cached to public JSON/localStorage.

To activate reviews, configure repository variable `GOOGLE_MAPS_BROWSER_KEY` with an explicitly browser-public Maps key. Enable Maps JavaScript API and Places API (New), restrict website referrers to the owned apex/www domains (and only approved preview domains), restrict API access and set appropriate quotas/billing controls. The build places this browser key in a dedicated homepage meta field; it is intentionally visible to the browser. Never put a private server credential there. Without this variable, the direct Google Maps review link works and the API-loading button stays hidden. No Google account, payment or billable request is created by tooling/tests.

Official sources: [Place Reviews](https://developers.google.com/maps/documentation/javascript/place-reviews), [Places attribution and filtering](https://developers.google.com/maps/documentation/places/web-service/policies), [usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing), [Facebook Page Plugin](https://developers.facebook.com/docs/plugins/page-plugin/). Provider login/cookie/network restrictions can prevent an embed; the source links always remain available. The owner supplied official Instagram/TikTok `lajollacoralgables` and Pinterest `LaJollaCoralGables` profiles. Within the team view, a six-photo mosaic of approved, locally hosted images opens the Instagram profile above the profile cards; the images-only landing does not embed other social media/video or blocked Facebook frames.

To change the mosaic, put the owner-approved originals in `media/instagram/` (git-ignored, so originals never reach the repository or the website; only the cropped tiles, written without metadata, are committed), list 6 or 12 tiles in `assets/social/tiles.json` (order, `name`, `source`, `href`, the owner's approval and, for a post link, a `postApproval` in which the owner confirms La Jolla published that post (post URLs do not name the account, so this confirmation is the only check) and an EN/ES `label` describing it), and run `python scripts/social-tiles.py` (Pillow is needed to build new images). Each `href` is the profile or such a post permalink (`https://www.instagram.com/p/…/`, `…/reel/…/`, a TikTok video of @lajollacoralgables or a Pinterest pin). The script crops to 4:5, writes 640/320 px WebP, refreshes `assets/social/source.json`, removes images no tile uses and rewrites the list in `index.html` and the post labels in `script.js`; profile tiles stay pointer shortcuts, post tiles are focusable, labelled links; `--check` only verifies and runs in CI. `tests/social.test.mjs` fails if the page and `tiles.json` disagree.

## Content requirements

Keep the year 1928, The Lexington, Julie Arias (Executive Director), Patricia Mir (Managing Director), ten services. Nothing on the site says or refers to "ballroom" and there is no Facebook link (client requirements, v1.22); the brand plates were removed at the client's request in v1.22. Nothing commercial from the client's brochure (prices, packages, inclusions, partners, capacity) appears; the tour is the site's goal (v1.23). Spanish uses usted. MonteCarlo is an accent. No prices, invented testimonials, biographies, vendors or stand-in café images. No wipes, edge-on tilts, cream overlay bands or transitions through an empty dark frame.

The user authorized rethinking the old composition and scroll timings. Tests for the old exact crops, pinned history and duplicated opening paragraphs have been updated to protect the new behavior; brand and content requirements remain covered. High-resolution approved photography, Pat's final tagline, an approved guest quote and actual inbox confirmation remain external decisions.

The homepage is told as a visit in scenes, scrubbed by native scroll. The approved five-second approach to the door is the only video and the only GSAP pin; at its end the film settles into an arched doorway. The history and house quote ink in word by word. The four detail photographs of the spaces arrive as printed photographs laid on a table inside one native sticky stage, with a 01–04 counter. The occasion being read is marked; The Lexington changes the page to deep green and gold; service lines settle into place; the house mosaic gathers into its grid; the closing invitation is sealed with the LJ mark. Every scene is reversible, settles on the complete readable layout and keeps all text in the document. All ten occasion descriptions and ten service labels are visible. Bookings opens over the current page and contact is always visible at the end. Reduced motion, SaveData, missing JavaScript or IntersectionObserver, short screens and failed decoding retain the complete static landing (the photographs return to an ordinary grid) and the approved poster.

The owner requested one scheduling action in v1.16.2: **Schedule a visit**. In v1.23 the owner made the tour the site's focus, so the tour chapter's button for that same calendar reads **Schedule your tour**. The planning route contains a compact introduction, that action, the existing Microsoft Bookings calendar and direct contact in the footer. Quote/vendor forms and service selection controls are removed. The homepage preserves all ten service descriptions and its approved cinematic presentation.

The calendar loads only on request and requires HTTPS; its ordinary link works without JavaScript or as an embed fallback. It schedules venue tours and does not automatically reserve event spaces. Creation/cancellation business notifications were verified separately; the owner also tested rescheduling and received its email. That does not independently verify the specific custom update-flow email or venue-time formatting. Local native mail remains disabled and is no longer required by any public form.

## Optional native mail preparation and Node hosting

The v1.13.0 preparation supports GoDaddy hosted MySQL and a private browser setup at `/admin/mail`. See [the browser connection guide](server/inquiries/CONEXION_NAVEGADOR_ES.md). GoDaddy injects its five `DB_*` variables; the application creates only versioned La Jolla tables with separate preview/live namespaces. Existing tables remain unchanged. The actual GoDaddy preview at v1.12.0 was verified for startup, health, video seeking, mobile/desktop motion and planning navigation; mail and business-database persistence are not yet verified.

Two notification modes are available: GoDaddy's built-in gateway (platform sender, configured business recipient and visitor Reply-To), or browser-authorized Microsoft 365 (signed single-tenant identity and account verification, delegated Mail.Send/profile access and encrypted persisted tokens). Provider choice, hosted persistence and marked actual receipt remain owner steps. This optional preparation does not certify unlimited sending/pricing or replace the old production site/domain. The public visit calendar is independent of this backend. The shared Microsoft credential must be revoked before Microsoft mode is used; save its replacement only in private hosting settings.

Use the platform Node version within the declared range, `npm ci`, `npm run build` and `npm start`. The server listens on its assigned `PORT`. Native public delivery and private setup default off; adding credentials alone does not enable either. `/healthz` reports process health and enabled state only. Public pages/assets are allowed, private files/source are denied, and HTTP byte ranges preserve the approved films.

Historical native-form preparation used a same-origin API. Current public pages contain no inquiry forms or external mail transport. Activate only after the private setup records verified storage, mailbox authorization when applicable and manually confirmed technical receipt. Contact fields are retained on failed submissions; UUIDs prevent accepted unchanged retries from being resent during the browser session, and uncertain saved records need owner reconciliation. Automated tests use isolated fake providers and a local/CI MySQL container, never real mail or the business database.

## Cinematic art direction

The interface pairs self-hosted Cormorant Garamond titles with Manrope body copy and controls, warm ivory/beige/taupe, visible factual room/occasion copy and one short entrance zoom followed by normal native scrolling. The main hall is supported by its original photograph (the client asks that the site never call it a ballroom), and detail captions distinguish house/brand imagery from verified room views. Desktop avoids enlarging portrait recordings; phones retain native captured frames. See [the art-direction review](tests/CINEMATIC-ART-DIRECTION.md) and the source manifest. No additional generation or production launch is implied.

## Public-only Pages deployment

`npm run build` creates ignored `dist/` from a closed list of public pages and assets. Development source, tests, configuration, package files and media provenance stay in GitHub rather than on the commercial domain. Browser CI serves the actual `dist/` tree and verifies excluded paths return404. On main, quality and the immutable release must pass before Pages deploys the uploaded artifact. In Settings → Pages, Source must be **GitHub Actions**, preserving `lajollacoralgables.com` and Enforce HTTPS. Public capacities/policies require confirmed owner data; forms/prices and new contact channels are excluded from this correction.
