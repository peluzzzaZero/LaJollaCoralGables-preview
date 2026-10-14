import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function chapter() {
  const start = html.indexOf('<article id="collection"');
  const end = html.indexOf("</article>", start);
  assert.ok(start !== -1 && end > start, "collection chapter");
  return html.slice(start, end);
}

test("the Sapphire Collection sits between services and Instagram", () => {
  const order = ["rentals", "collection", "social"].map((id) => html.indexOf(`<article id="${id}"`));
  assert.ok(order.every((index) => index > 0), order.join());
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("the collection never publishes a price, deposit or fee figure", () => {
  const keys = Array.from(js.matchAll(/"(collection\.[^"]+)":\s*"([^"]*)"/g), (m) => m[2]);
  assert.ok(keys.length >= 80, "EN and ES copy");
  for (const text of [chapter(), ...keys]) {
    assert.doesNotMatch(text, /[$€]\s?\d|\d\s?(?:USD|dollars|dólares)|\d+\s?%|valued at|valorad/i, text.slice(0, 80));
    assert.doesNotMatch(text, /ballroom/i);
  }
});

test("every collection text has an English and Spanish translation", () => {
  const used = new Set(Array.from(chapter().matchAll(/data-i18n="([^"]+)"/g), (m) => m[1]));
  assert.ok(used.size >= 35);
  for (const key of used) {
    const count = (js.match(new RegExp(`"${key.replace(/\./g, "\\.")}":`, "g")) || []).length;
    assert.equal(count, 2, key);
  }
});

test("brochure styling uses the official sage and the existing self-hosted fonts", () => {
  assert.match(css, /--brand-sage:\s*#5e7060/);
  assert.match(css, /\.lockup-script\s*\{[^}]*var\(--font-script\)/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
  assert.match(chapter(), /class="flourish"[^>]*aria-hidden="true"/);
});

test("retired bar media is not published and not referenced", async () => {
  const { retiredMedia } = await import("../scripts/build-site.mjs");
  for (const path of retiredMedia) {
    assert.ok(readFileSync(new URL(`../assets/${path}`, import.meta.url)).length > 0, path);
    for (const file of [html, js, css]) assert.equal(file.includes(path), false, path);
  }
});
