# La Jolla Coral Gables preview

Static bilingual preview for La Jolla Coral Gables. The page uses the existing brand photographs and marks, GSAP/ScrollTrigger, Lenis, and Web3Forms for inquiry and vendor submissions.

## Local preview

```sh
python -m http.server 4173
```

Open http://localhost:4173. No build step is required.

## Working state

The reviewed implementation was merged into `main` through [PR #1](https://github.com/peluzzzaZero/LaJollaCoralGables-preview/pull/1) on 4 October 2026 and published at https://jolla.peluzzza.com. `dev` is synchronized with this release and remains the branch for subsequent work. See [the section roadmap](tests/PLAN.md) and [the visual, functional, and publication review](tests/REVIEW-2026-10-04.md).

The opening presents four photographs with overlapping crossfades and gradual detail zooms. MonteCarlo is used only for the opening's script accent. History follows the pots toward the door and sun tile; on short mobile screens it scrolls naturally so the text and photograph remain accessible. The remaining sections retain the approved copy, ten services, seven gallery plates, and the two directors.

## Checks

Static checks, using Node's built-in test runner:

```sh
node --test tests/*.test.mjs
```

Browser review, using Python and Playwright:

```sh
python -m pip install -r tests/browser/requirements.txt
python -m playwright install chromium ffmpeg
python tests/browser/review.py --output review-artifacts
```

The browser runner starts its own local server. If system Chromium is installed, it uses that executable; otherwise it uses Playwright's installed Chromium. `--browser /path/to/chromium` selects an executable explicitly. In proxy environments it uses the inherited HTTPS proxy and bypasses it for the local server.

It checks 390, 768, and 1280 px in English and Spanish, records the scroll, saves section screenshots and `results.json`, and exercises resizing, a short mobile viewport, reduced motion, and missing JavaScript/GSAP. All Web3Forms submissions are intercepted and simulated: **running the review sends no real email**.

## Remaining content decisions

- Pat's choice of primary tagline remains pending. Both approved brand plates stay in the gallery.
- Testimonials remain hidden until an approved guest quote is supplied.
- Actual inbox delivery through the existing Web3Forms configuration requires a separately authorized real submission; browser tests verify the integration with simulated responses.

`CNAME` declares `jolla.peluzzza.com`. GitHub Pages publishes `main` using its generated `pages build and deployment` workflow. The publication checkpoint in the review document records the verified implementation commit and deployment run.
