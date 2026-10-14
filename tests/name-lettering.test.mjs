import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const css = read("styles.css");
const svg = read("assets/brand/la-jolla-script.svg");

test("the name lettering is the brochure's own vector outline, with no embedded font or image", () => {
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 212\.23 74\.54">/);
  assert.doesNotMatch(svg, /<(image|text|script|style|font)\b|href=/i);
  assert.ok(svg.length < 20000, "small enough to load with the stylesheet");
});

test("only the name uses the lettering, and it follows the surrounding color", () => {
  const rule = css.match(/\.logo-text b, \.entrance-copy h1, \.footer-logo, \.location-name \{([^}]*)\}/);
  assert.ok(rule, "name lettering rule");
  assert.match(rule[1], /mask: url\("assets\/brand\/la-jolla-script\.svg"\)/);
  assert.match(rule[1], /-webkit-mask: url\("assets\/brand\/la-jolla-script\.svg"\)/);
  assert.match(rule[1], /background: currentColor/);
  assert.equal((css.match(/la-jolla-script\.svg/g) || []).length, 2);
});

test("the name stays real text for screen readers, translation and search", () => {
  const index = read("index.html");
  assert.match(index, /<b>La Jolla<\/b>/);
  assert.match(index, /<h1 id="hero-title">La Jolla<span class="sr-only"/);
  assert.match(index, /<p class="footer-logo">La Jolla<\/p>/);
  assert.match(index, /<span class="location-name" translate="no">La Jolla<\/span>/);
  for (const page of ["privacy.html", "terms.html", "planning.html"]) assert.match(read(page), /La Jolla<\/b>/);
});
