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
  for (const name of ["hero-facade", "welcome-table", "mood-card-flowers", "flower-plaque"]) {
    assert.equal(js.includes(name), true, name);
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

test("desktop facade crop stays, and the phone crop keeps the door wordmark out", () => {
  assert.match(js, /"hero-facade": \{ from: "8% 96%", to: "8% 96%", fromScale: 1\.9, scale: [\d.]+ \}/);
  assert.match(js, /max-width: 800px[\s\S]{0,220}openingCrops\["hero-facade"\] = \{ from: "0% 100%", to: "0% 100%", fromScale: 4\.2, scale: [\d.]+ \}/);
  assert.match(css, /img\[src\*="hero-facade"\] \{[^}]*object-position: 8% 96%[^}]*scale\(1\.9\)/);
  assert.match(css, /@media \(max-width: 800px\) \{[^}]*hero-facade[\s\S]*?object-position: 0% 100%[\s\S]*?scale\(4\.2\)/);
});

test("Since 1928 stays on the table line, in history, and off the flower shot", () => {
  assert.match(html, /reel-on--table"[^>]*>Since 1928/);
  assert.equal(/reel-on--bloom[^>]*>[^<]*Since 1928/.test(html), false);
  assert.equal(/reel-on--table"\)\) return;/.test(js), false);
  assert.match(html, /class="lede history-line"[^>]*>Since 1928/);
});
