import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("the landing has exactly one Schedule a visit button", () => {
  const openers = html.match(/<a [^>]*data-booking-opener[^>]*>[^<]*<\/a>/g) || [];
  const visits = openers.filter((a) => /data-i18n="form\.planning"/.test(a));
  assert.equal(visits.length, 1, visits.join("\n"));
  assert.match(visits[0], /id="visit-cta"/);
  assert.match(visits[0], /href="https:\/\/bookings\.cloud\.microsoft\/book\/[^"]+" data-booking-opener/);
  for (const gone of ["occasion-visit", "section-action", "tour-cta", "venue-inquiry", 'class="inquire-link"']) {
    assert.equal(html.includes(gone), false, gone);
  }
});

test("its three resting places are hidden, same-shaped slots in arrival, floating and Let's begin", () => {
  const slots = [...html.matchAll(/<span class="btn visit-cta-shape visit-cta-slot" data-cta-slot="(\w+)" aria-hidden="true"><span data-i18n="form\.planning">Schedule a visit<\/span><\/span>/g)].map((m) => m[1]);
  assert.deepEqual(slots, ["float", "start", "end"]);
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  const planning = html.slice(html.indexOf('id="planning"'), html.indexOf('id="footer"'));
  assert.match(hero, /data-cta-slot="start"/);
  assert.match(planning, /data-cta-slot="end"/);
});

test("the button is touch-sized, respects reduced motion and never sits over the booking dialog", () => {
  assert.match(css, /\.landing-page \.btn\.visit-cta-shape \{[^}]*min-height: 48px/);
  assert.match(css, /\.visit-cta-slot \{ visibility: hidden; pointer-events: none; \}/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.landing-page \.btn\.visit-cta \{ transition: none; \} \}/);
  assert.match(css, /body\.booking-open \.visit-cta \{ visibility: hidden; \}/);
  assert.match(js, /function initVisitCta\(\)/);
  assert.match(js, /if \(reduced\.matches\) \{ out = out < \.5 \? 0 : 1;/);
});
