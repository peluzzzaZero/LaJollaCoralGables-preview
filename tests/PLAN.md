> Historical roadmap. The user authorized a redesign and versioned improvement cycles on 4 October 2026. See [ROADMAP.md](ROADMAP.md) and [RELEASES.md](RELEASES.md) for current work. The brand/content requirements below remain; the exact old layouts and motion timings are historical.

# La Jolla preview — section work on `dev`

Main stays untouched until every section below has passed its test and a visual review.
Work on one section at a time, then check its tests and scroll frames. A section is not done until the scroll frames of that section have been looked at.

Do not invent prices, vendor names, bios, or reviews. Do not use cafe-garden.png, cafe-table.png, or cafe-detail.png. Year is 1928. The room name stays The Lexington. Spanish is usted. No wipe, no edge-on tilt, no cream band, no fade to an empty dark field. MonteCarlo is the script accent only, from the brand zip.

## 1. Opening `#hero`
Objective: a presentation. Four photos crossfade and zoom onto pots, a candle, petals, and roses. Each existing line sits on that detail, never on the printed name. Readable at 390px and 1280px. The frame never collapses.
Test: `node --test tests/opening.test.mjs`
Visual: recording shows photos and lines, not a blank brown field.

## 2. History `#history`
Objective: the photo walks from the pots to the door and the sun tile while the sentence is read. The wordmark never enters. Title and body stay readable.
Test: `node --test tests/history.test.mjs`
Visual: pots, then the door, no CORAL GABLES letters in the photo.

## 3. Leaves quote `#moment`
Objective: the leaf light travels. The quote stays on the leaves, off the oval, and is never an empty dark field at the start.
Test: `node --test tests/moment.test.mjs`
Visual: quote readable, oval clear of the sentence.

## 4. Events `#events`
Objective: every event line is readable the whole time. One move with a reason, not a fade from invisible.
Test: `node --test tests/events.test.mjs`
Visual: headings and body can be read.

## 5. Alcazar `#alcazar`
Objective: the line drawing completes. The room name stays The Lexington. Not a photo wipe and not a tilt.
Test: `node --test tests/alcazar.test.mjs`
Visual: the drawing is fully there beside the name.

## 6. Services `#rentals`
Objective: the ten services stay, with no extra heading and no prices. Text is readable, not ghosted.
Test: `node --test tests/rentals.test.mjs`
Visual: the list can be read.

## 7. Gallery `#gallery`
Objective: the marks are on the wall and visible. They do not fade in from nothing.
Test: `node --test tests/gallery.test.mjs`
Visual: marks visible on the cream ground.

## 8. Team `#team`
Objective: Julie Arias, Executive Director, and Patricia Mir, Managing Director, stay large and on screen.
Test: `node --test tests/team.test.mjs`
Visual: both names and titles readable.

## 9. Close `#quote` `#vendors` and the inquiry form
Objective: the form sends email. No prices. Spanish stays usted.
Test: `node --test tests/close.test.mjs`
Visual: the form is usable.

## 10. General
Objective: one pass for type and for 390px, 768px, and 1280px, using MonteCarlo from the brand zip. Then a pull request from `dev` to `main` only after sections 1–9 have passed.
Test: `node --test tests/*.test.mjs`
Visual: one full-page recording, reviewed before the pull request.

## Checkpoint — 2026-10-04

Codex continued the work on `dev` from `de98c11`. Sections 1–9 have passed the existing static checks and the browser review at 390, 768, and 1280 px in English and Spanish. Scroll recordings and section frames were reviewed. The general pass includes responsive resizing, short mobile screens, reduced motion, and fallback rendering without GSAP or JavaScript.

The opening now actually zooms, presents its first line immediately, keeps the mobile crop on the pots, and uses readable cream captions. MonteCarlo is applied to the opening accent. History clears the fixed header and uses natural scrolling on short mobile screens. Form behavior is checked with intercepted Web3Forms responses, including failure, timeout, retry, and duplicate submission prevention. This is not a confirmation of real inbox delivery.

See [the review and reproduction instructions](REVIEW-2026-10-04.md). Keep the pending tagline and guest quote decisions separate from implementation; do not invent them.

## Publication checkpoint — 2026-10-04

[PR #1](https://github.com/peluzzzaZero/LaJollaCoralGables-preview/pull/1) was merged into `main` at `14eda7e`. [GitHub Pages deployment](https://github.com/peluzzzaZero/LaJollaCoralGables-preview/actions/runs/37200670298) completed successfully. The live HTML, JavaScript, and CSS at https://jolla.peluzzza.com were verified byte-for-byte against the reviewed implementation.

Live Chromium checks confirmed the opening, translated service prefill, desktop inquiry navigation, and both legal pages. Inspecting the mobile capture exposed stale scroll coordinates after a native jump: this was corrected by synchronizing Lenis before calculating destinations. Regression checks now require the inquiry heading inside the viewport at all three widths in both languages, rather than merely checking that the form is present. No real email was sent.

The implementation and publication pass is complete. Remaining items require external input or a separately authorized real email submission: confirm inbox delivery, Pat's primary tagline decision, and an approved guest testimonial. No public prices, invented content, or new imagery should be introduced to close these items.
