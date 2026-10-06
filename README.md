# La Jolla Coral Gables

A bilingual editorial website for La Jolla Coral Gables, using approved brand assets and descriptions. Static HTML, CSS and JavaScript; locally vendored GSAP/ScrollTrigger; native scrolling; Web3Forms inquiries.

## Preview and checks

```sh
python -m http.server 4173
node --check script.js
node --test tests/*.test.mjs
python -m pip install -r tests/browser/requirements.txt
python -m playwright install chromium ffmpeg
python tests/browser/review.py --output review-artifacts
```

The browser runner starts its own local server. It checks 390, 768 and 1280 px in English and Spanish, saves screenshots and recordings, tests keyboard disclosures, navigation, resizing, short and 320/375 px viewports, changing reduced-motion preferences, missing page JavaScript/GSAP and JavaScript-disabled contact alternatives. Email requests are intercepted; no real emails are sent.

## Versions and publication

`VERSION`, the HTML application-version metadata, CSS/JavaScript cache keys and `tests/releases/vVERSION.md` must agree. Use semantic versions: new capabilities increment the minor version; fixes increment the patch version; incompatible changes increment the major version. The first numbered redesign is 1.0.0; the current cinematic release is 1.8.0. PRs to main must increase the version numerically before their checks can pass.

Work follows `feature/*` → pull request to `dev` → review and tests → pull request to `main`. The **Quality and versioned release** workflow runs static and browser checks on both branches and their pull requests. On `main`, successful review creates an annotated immutable `vVERSION` tag and a GitHub release. An existing tag must point to the same commit; it is never moved or replaced.

GitHub Pages publishes `main` at https://jolla.peluzzza.com. Verify the live version, assets, navigation and legal pages after each deployment. The release workflow does not claim that inbox delivery or the Pages deployment has been verified.

See [the current roadmap](tests/ROADMAP.md), [release policy](tests/RELEASES.md), [v1.8.0 notes](tests/releases/v1.8.0.md) and [the latest review](tests/reviews/v1.8.0.md) and [the historical review](tests/REVIEW-2026-10-04.md).

## Content requirements

Keep the year 1928, The Lexington, Julie Arias (Executive Director), Patricia Mir (Managing Director), ten services, seven brand plates and their captions. Spanish uses usted. MonteCarlo is an accent. No prices, invented testimonials, biographies, vendors or stand-in café images. No wipes, edge-on tilts, cream overlay bands or transitions through an empty dark frame.

The user authorized rethinking the old composition and scroll timings. Tests for the old exact crops, pinned history and duplicated opening paragraphs have been updated to protect the new behavior; brand and content requirements remain covered. High-resolution approved photography, Pat's final tagline, an approved guest quote and actual inbox confirmation remain external decisions.
