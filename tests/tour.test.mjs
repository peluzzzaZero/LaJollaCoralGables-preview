import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function chapter() {
  const start = html.indexOf('<article id="tour"');
  const end = html.indexOf("</article>", start);
  assert.ok(start !== -1 && end > start, "tour chapter");
  return html.slice(start, end);
}
const copy = () => Array.from(js.matchAll(/"(tour\.[^"]+)":\s*"([^"]*)"/g), (m) => m[2]);

test("the tour invitation sits between services and Instagram and is in the header", () => {
  const order = ["rentals", "tour", "social"].map((id) => html.indexOf(`<article id="${id}"`));
  assert.ok(order.every((index) => index > 0), order.join());
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.equal((html.match(/<a href="#tour" data-i18n="nav.tour">/g) || []).length, 2);
});

test("the tour leads to the visit calendar, with email as the secondary path", () => {
  const section = chapter();
  const tour = section.indexOf("data-booking-opener");
  assert.ok(tour > 0 && section.indexOf('href="mailto:') > tour);
  assert.match(section, /href="https:\/\/bookings\.cloud\.microsoft\/book\/[^"]+" data-booking-opener/);
});

test("no commercial terms from the brochure: prices, packages, capacity, partners or inclusions", () => {
  assert.ok(copy().length >= 40, "EN and ES copy");
  for (const text of [chapter(), ...copy()]) {
    assert.doesNotMatch(text, /[$€]\s?\d|\d+\s?%|\b265\b|price|precio|package|paquete|collection|colecci|sapphire|includ|inclu|capacity|capacidad|partner|socio|ballroom/i, text.slice(0, 80));
  }
});

test("every tour text has an English and Spanish translation", () => {
  const used = new Set(Array.from(chapter().matchAll(/data-i18n="([^"]+)"/g), (m) => m[1]));
  assert.ok(used.size >= 18);
  for (const key of used) {
    assert.equal((js.match(new RegExp(`"${key.replace(/\./g, "\\.")}":`, "g")) || []).length, 2, key);
  }
});

test("brochure styling uses the official sage, existing fonts and light photographs", () => {
  assert.match(css, /--brand-sage:\s*#5e7060/);
  assert.match(css, /\.lockup-script\s*\{[^}]*var\(--font-script\)/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
  assert.match(chapter(), /class="flourish"[^>]*aria-hidden="true"/);
  for (const [, src] of chapter().matchAll(/<img src="([^"]+)"/g)) {
    assert.match(src, /^assets\/tour\/[a-z-]+\.webp$/);
    assert.ok(readFileSync(new URL(`../${src}`, import.meta.url)).length < 150_000, src);
  }
});

test("retired bar media is not published and not referenced", async () => {
  const { retiredMedia } = await import("../scripts/build-site.mjs");
  for (const path of retiredMedia) {
    assert.ok(readFileSync(new URL(`../assets/${path}`, import.meta.url)).length > 0, path);
    for (const file of [html, js, css]) assert.equal(file.includes(path), false, path);
  }
});
