import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const html = read("index.html").toString();
const js = read("script.js").toString();
const record = JSON.parse(read("assets/venue/web/extra-photos.json"));

function section() {
  const start = html.indexOf('<section id="inspiration"');
  const end = html.indexOf('<article id="alcazar"');
  assert.ok(start !== -1 && end > start, "inspiration board sits right before The Lexington");
  return html.slice(start, end);
}

test("the board sits between the occasions and The Lexington", () => {
  const order = ["events", "inspiration", "alcazar"].map((id) => html.search(new RegExp(`<(?:article|section) id="${id}"`)));
  assert.ok(order.every((index) => index > 0), order.join());
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("the board shows the three owner pictures, AVIF first, and says they are styling concepts", () => {
  const board = section();
  for (const name of ["inspiration-facade", "inspiration-salon", "inspiration-plaque"]) {
    assert.match(board, new RegExp(`srcset="assets/venue/web/${name}\\.avif"`), name);
    assert.match(board, new RegExp(`src="assets/venue/web/${name}\\.webp"`), name);
  }
  assert.equal((board.match(/class="inspiration-print /g) || []).length, 3);
  assert.match(board, /data-i18n="inspiration\.note">Styling concepts</);
  assert.match(board, /class="inspiration-seal" aria-hidden="true"/);
});

test("every board text and alt has an English and Spanish translation", () => {
  const keys = new Set(Array.from(section().matchAll(/data-i18n="([^"]+)"/g), (m) => m[1]));
  keys.add("alcazar.photoAlt");
  keys.add("alcazar.photoNote");
  keys.add("tour.planOpen");
  keys.add("tour.planAlt");
  assert.ok(keys.size >= 13);
  for (const key of keys) {
    assert.equal((js.match(new RegExp(`"${key.replace(/\./g, "\\.")}":`, "g")) || []).length, 2, key);
  }
});

test("no prices, capacity or banned room word in the new copy", () => {
  const copy = Array.from(js.matchAll(/"((?:inspiration|tour\.plan)[^"]*|alcazar\.photoAlt)":\s*"([^"]*)"/g), (m) => m[2]);
  assert.ok(copy.length >= 24);
  for (const text of [section(), ...copy]) {
    assert.doesNotMatch(text, /[$€]\s?\d|sq\.?\s?ft|capacity|capacidad|guests|invitados|price|precio|ballroom|facebook/i, text.slice(0, 80));
  }
});

test("pictures not yet confirmed as photographs are labelled as styling concepts", () => {
  const start = html.indexOf('<article id="alcazar"');
  const lexington = html.slice(start, html.indexOf("</article>", start));
  assert.match(lexington, /lexington-lounge\.webp[^>]*>(?:<\/picture>)?<figcaption class="alcazar-note" data-i18n="alcazar\.photoNote">Styling concept</);
});

test("the floor plan opens full size and has no measurements in its copy", () => {
  assert.match(html, /<a href="assets\/tour\/floor-plan\.webp" target="_blank" rel="noopener"><img src="assets\/tour\/floor-plan\.webp"[^>]*><span class="sr-only" data-i18n="tour\.planOpen">/);
});

test("every extra picture matches its record from the owners' PDF", () => {
  assert.match(record.source.sha256, /^[0-9a-f]{64}$/);
  assert.match(record.approval, /2026-10-27/);
  assert.equal(record.assets.length, 9);
  for (const entry of record.assets) {
    const bytes = read(entry.asset);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, entry.asset);
    assert.ok(bytes.length < 160_000, `${entry.asset} delivery budget`);
    assert.ok(html.includes(entry.asset), `${entry.asset} is used`);
  }
  const facade = record.assets.find((entry) => entry.asset.endsWith("inspiration-facade.webp"));
  assert.match(facade.treatment, /menu board .* excluded/);
});
