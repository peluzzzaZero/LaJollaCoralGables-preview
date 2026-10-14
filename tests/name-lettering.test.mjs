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

test("the lettering records where it came from and who approved it", async () => {
  const { createHash } = await import("node:crypto");
  const source = JSON.parse(read("assets/brand/la-jolla-script.source.json"));
  assert.equal(source.sha256, createHash("sha256").update(svg).digest("hex"));
  assert.match(source.approvedBy, /owner/);
});

test("the name falls back to plain text where masks are dropped", () => {
  assert.match(css, /@media \(forced-colors: active\), print \{\s*\.logo-text b, \.entrance-copy h1, \.footer-logo, \.location-name \{[^}]*mask: none;[^}]*text-indent: 0;/);
});

test("chapter titles use the self-hosted brochure script, body text does not", () => {
  assert.match(css, /@font-face \{ font-family: 'Great Vibes'; src: url\('assets\/fonts\/GreatVibes-latin\.woff2'\)/);
  assert.match(css, /\.landing-page \{ --font-script: "Great Vibes"/);
  assert.match(css, /\.landing-section \.section-title \{ font-family: var\(--font-script\)/);
  assert.match(read("assets/fonts/GreatVibes-OFL.txt"), /SIL Open Font License/);
  assert.doesNotMatch(css, /fonts\.(googleapis|gstatic)\.com/);
});

test("section photographs fade up once, only with motion allowed", () => {
  const index = read("index.html");
  const js = read("script.js");
  assert.equal((index.match(/<img data-photo-fade=""/g) || []).length, 5);
  assert.match(js, /querySelectorAll\('\[data-photo-fade\], \.house-tile img'\)\.forEach\(photo => reveal\.observe\(photo\)\)/);
  // The reveal observer only exists once reduced motion and save-data are ruled out.
  assert.ok(js.indexOf("[data-photo-fade]") > js.indexOf("if (reduced.matches || saveData"));
  assert.match(css, /\.landing-effects :is\(img\[data-photo-fade\], \.house-tile img\) \{ opacity: \.4; translate: 0 22px;/);
});
