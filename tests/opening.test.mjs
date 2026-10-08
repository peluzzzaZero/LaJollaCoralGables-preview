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

test("the shared cinema fills the viewport", () => {
  assert.match(css, /\.cinema-scroll \.cinema-stage[^}]*height: 100svh/);
});

test("reel names the four opening photos", () => {
  for (const name of ["venue/facade", "welcome-table", "mood-card-flowers", "flower-plaque"]) {
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

test("opening clearly states the offer and leads to both settings and internal planning", () => {
  const opening = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  assert.match(opening, /<h1[^>]*>La Jolla<\/h1>/);
  assert.match(opening, /href="planning.html"/);
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

test("the homepage uses one shared cinema instead of an independent hero carousel", () => {
  assert.equal(html.includes('class="reel-controls"'), false);
  assert.equal((html.match(/class="cinema-stage"/g) || []).length, 1);
  assert.match(js, /pin: stage/);
});
