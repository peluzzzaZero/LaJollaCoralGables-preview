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

test("hero reel height is 100dvh", () => {
  assert.match(css, /\.hero\.reel[\s\S]{0,180}100dvh/);
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

test("opening copy and inquiry live outside the changing photograph frame", () => {
  const opening = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  const copyEnd = opening.indexOf('class="arrival-visual"');
  assert.ok(copyEnd > 0);
  const copy = opening.slice(0, copyEnd);
  assert.match(copy, /<h1[^>]*aria-label="La Jolla"/);
  assert.equal((copy.match(/class="title-letter"/g) || []).length, 7);
  assert.match(copy, /href="#quote"/);
  assert.match(copy, /data-i18n="hero.offer"/);
  assert.match(css, /\.arrival-script[^}]*var\(--font-script\)/);
});

test("1928 remains in the arrival and history without repeating the history paragraph", () => {
  const opening = html.slice(html.indexOf('id="hero"'), html.indexOf('id="history"'));
  assert.match(opening, /Est\. 1928/);
  assert.equal(opening.includes('data-i18n="history.lede"'), false);
  assert.match(html, /class="lede history-line"[^>]*>Since 1928/);
});

test("opening photo changes are requested rather than tied to a scroll pin", () => {
  assert.match(html, /class="reel-controls"/);
  assert.match(js, /function selectShot/);
  assert.equal(js.includes('pin: desktop'), false);
});
