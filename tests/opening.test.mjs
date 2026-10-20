import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("styles and script are linked with a cache query", () => {
  assert.match(html, /<link[^>]+href="styles\.css\?[^"]+"/);
  assert.match(html, /<script[^>]+src="script\.js\?[^"]+"/);
});

test("the entrance has a stable full-height frame", () => {
  assert.match(css, /\.entrance-stage[^}]*height: 100svh/);
});

test("landing uses the approved venue and styling photographs", () => {
  for (const name of ["venue/web/architecture", "venue/web/tablescape", "venue/web/first-dance"]) {
    assert.equal(html.includes(name), true, name);
  }
});

test("opening markup does not use the cafe stand-ins", () => {
  for (const name of ["cafe-garden", "cafe-table", "cafe-detail"]) {
    assert.equal(html.includes(name), false, name);
  }
});

test("MonteCarlo ships from the brand font file", () => {
  assert.match(css, /MonteCarlo-Regular\.ttf/);
});

test("opening states the offer and opens the tour calendar from the house", () => {
  const opening = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  assert.match(opening, /<h1[^>]*>La Jolla<span class="sr-only" data-i18n="hero.context">/);
  // The single "Schedule a visit" starts its journey here (its slot), then floats along the page.
  assert.match(opening, /<span class="btn visit-cta-shape visit-cta-slot" data-cta-slot="start" aria-hidden="true">/);
  assert.match(opening, /href="#events"/);
  assert.match(opening, /href="#rentals"/);
  assert.match(opening, /data-i18n="hero.offer"/);
});

test("1928 remains in the arrival and history without repeating the history paragraph", () => {
  const opening = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  assert.match(opening, /Est\. 1928/);
  assert.equal(opening.includes('data-i18n="history.lede"'), false);
  assert.match(html, /class="lede history-line"[^>]*>Since 1928/);
});

test("only the entrance film is pinned; later content is in document flow", () => {
  assert.equal(html.includes('class="reel-controls"'), false);
  assert.equal((html.match(/class="entrance-stage"/g) || []).length, 1);
  assert.match(js, /pin: stage/);
  assert.equal((html.match(/<video\b/g) || []).length, 2);
  assert.equal(html.includes('data-scene-copy'), false);
  assert.equal(js.includes('cinematic-journey'), false);
});
