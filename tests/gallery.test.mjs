import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

const PLATES = [
  ["assets/brand/stationery-sage.jpg", "Stationery"],
  ["assets/brand/stripe-monogram.jpg", "Monogram"],
  ["assets/brand/balcony-line.jpg", "Balcony mark"],
  ["assets/brand/oval-monogram.jpg", "Oval monogram"],
  ["assets/brand/landscape-mark.jpg", "Brand mood"],
  ["assets/brand/lockup-events.jpg", "Events & experiences"],
  ["assets/brand/lockup-ballroom.jpg", "Ballroom & catering"],
];

function gallerySection() {
  const start = html.indexOf('id="gallery"');
  const end = html.indexOf('id="team"');
  assert.ok(start !== -1 && end > start, "gallery section");
  return html.slice(start, end).replaceAll("&amp;", "&");
}

test("gallery keeps the seven brand plates in order", () => {
  const section = gallerySection();
  let cursor = -1;
  for (const [src, caption] of PLATES) {
    const imageAt = section.indexOf(src);
    const captionAt = section.indexOf(caption);
    assert.ok(imageAt > cursor, src);
    assert.ok(captionAt > imageAt, caption);
    cursor = captionAt;
  }
  const images = section.match(/<img\b/g) || [];
  assert.equal(images.length, 7);
  assert.equal(section.includes("cafe-garden.png"), false);
  assert.equal(section.includes("cafe-table.png"), false);
  assert.equal(section.includes("cafe-detail.png"), false);
});

test("gallery marks are not faded in from nothing", () => {
  const section = gallerySection();
  assert.equal(/opacity:\s*0\b/.test(section), false);
  const rules = [...css.matchAll(/\.brand-[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(rules.length > 0, "gallery wall rules");
  for (const body of rules) {
    assert.equal(/opacity:\s*0(?:\s|;|!|$)/.test(body), false, body);
    assert.equal(/opacity:\s*calc\(\s*0\.08/.test(body), false);
  }
  assert.match(css, /scroll-snap-type: x mandatory/);
  assert.match(html, /class="brand-track"[^>]*tabindex="0"/);
  assert.match(html, /class="gallery-next"/);
});
