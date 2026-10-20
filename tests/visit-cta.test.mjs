import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("the landing has exactly one Schedule a visit button", () => {
  const openers = html.match(/<a [^>]*data-booking-opener[^>]*>.*?<\/a>/g) || [];
  const visits = openers.filter((a) => /data-i18n="form\.planning"/.test(a));
  assert.equal(visits.length, 1, visits.join("\n"));
  assert.match(visits[0], /id="visit-cta"/);
  assert.match(visits[0], /href="https:\/\/bookings\.cloud\.microsoft\/book\/[^"]+" data-booking-opener/);
  for (const gone of ["occasion-visit", "section-action", "tour-cta", "venue-inquiry", 'class="inquire-link"']) {
    assert.equal(html.includes(gone), false, gone);
  }
});

test("it rests as a button in the arrival and Let's begin and as a small monogram seal while reading", () => {
  const slots = [...html.matchAll(/<span class="btn visit-cta-shape visit-cta-slot" data-cta-slot="(\w+)" aria-hidden="true"><span data-i18n="form\.planning">Schedule a visit<\/span><\/span>/g)].map((m) => m[1]);
  assert.deepEqual(slots, ["start", "end"]);
  assert.match(html, /<span class="visit-cta-seal-shape visit-cta-slot" data-cta-slot="float" aria-hidden="true"><\/span>/);
  // The seal is the site's own LJ monogram ringed by the bilingual booking line; the label stays the accessible name.
  assert.match(html, /<a [^>]*id="visit-cta"[^>]*><span class="visit-cta-label" data-i18n="form\.planning">Schedule a visit<\/span><span class="visit-cta-seal" aria-hidden="true">.*?data-i18n="cta\.seal".*?<img src="assets\/brand\/logo-lj-oval-sage\.png" alt=""/);
  assert.equal(js.split('"cta.seal":').length - 1, 2);
  // The ring is the only visible text while floating, so it must contain the accessible name (WCAG 2.5.3).
  const seals = [...js.matchAll(/"cta\.seal": "([^"]+)"/g)].map((m) => m[1]);
  const names = [...js.matchAll(/"form\.planning": "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(seals.length, 2);
  seals.forEach((seal, i) => assert.ok(seal.startsWith(names[i]), seal));
  assert.match(css, /\.visit-cta-seal-shape \{[^}]*width: 64px; height: 64px;/);
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  const planning = html.slice(html.indexOf('id="planning"'), html.indexOf('id="footer"'));
  assert.match(hero, /data-cta-slot="start"/);
  assert.match(planning, /data-cta-slot="end"/);
});

test("the button is touch-sized, respects reduced motion and never sits over the booking dialog", () => {
  assert.match(css, /\.landing-page \.btn\.visit-cta-shape \{[^}]*min-height: 48px/);
  assert.match(css, /visit-cta-label \{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect\(0 0 0 0\)/);
  assert.match(css, /\.visit-cta-slot \{ visibility: hidden; pointer-events: none; \}/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.landing-page \.btn\.visit-cta, \.visit-cta-seal svg \{ transition: none; \}/);
  assert.match(css, /body\.booking-open \.visit-cta \{ visibility: hidden; \}/);
  assert.match(js, /function initVisitCta\(\)/);
  assert.match(js, /if \(reduced\.matches\) \{ out = Math\.round\(out\); home = home < 1 \? 0 : 1; \}/);
});

test("the floating seal beats softly 3s in every 12s while floating and never under reduced motion", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(css, /\.visit-cta\.is-float \.visit-cta-seal \{ animation: visit-cta-beat 12s [^;]* infinite; \}/);
  assert.match(css, /@keyframes visit-cta-beat \{[^\n]*scale\(1\.07\)/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{[^\n]*\.visit-cta\.is-float \.visit-cta-seal, \.landing-page \.btn\.visit-cta\.is-float \{ animation: none !important; \}/);
});

test("the visit invitation is a centred closing line, not an empty band with a light", () => {
  assert.match(html, /<div class="visit-invitation"><p data-i18n="landing\.visitReason">Experience La Jolla in person and discover the possibilities for your next extraordinary occasion\.<\/p><\/div>/);
  assert.match(css, /\.visit-invitation \{[^}]*text-align: center;/);
  assert.doesNotMatch(css, /\.visit-invitation \{[^}]*background/);
  assert.doesNotMatch(css, /\.landing-effects \.visit-invitation/);
  assert.doesNotMatch(js, /querySelectorAll\('[^']*\.visit-invitation/);
  // The pull-up into the pinned walk's empty room must not apply when the walk is collapsed over its caption.
  assert.match(css, /@media \(max-width: 650px\) \{ \.venue-walk\.is-walking \+ \.visit-invitation \{ margin-top: -88px; \} \}/);
});
