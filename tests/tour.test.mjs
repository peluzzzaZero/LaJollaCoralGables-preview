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

test("the tour relies on the single floating visit button, with email as the secondary path", () => {
  const section = chapter();
  assert.equal(section.includes("data-booking-opener"), false);
  assert.match(section, /href="mailto:info@lajollacoralgables\.com"/);
});

test("Good to know links its calendar sentence to the booking calendar as text, not as a second button (Dan, 29 Oct)", () => {
  const links = chapter().match(/<a [^>]*data-calendar-link[^>]*>[^<]*<\/a>/g) || [];
  assert.equal(links.length, 1, links.join("\n"));
  assert.match(links[0], /class="text-link tour-calendar-link" href="https:\/\/bookings\.cloud\.microsoft\/book\/[^"]+"/);
  assert.match(links[0], /data-i18n="tour\.info\.appointmentLink">choose an available time in the calendar<\/a>/);
  assert.doesNotMatch(links[0], /\bbtn\b/);
  assert.match(js, /"tour\.info\.appointmentLink": "elija un horario disponible en el calendario"/);
  // The site's own Bookings dialog opens it; without JavaScript it is an ordinary link to the calendar.
  assert.match(js, /querySelectorAll\("\[data-booking-opener\], \[data-calendar-link\]"\)/);
  assert.match(css, /\.tour-paper \.tour-calendar-link \{[^}]*color: var\(--brand-sage\)/);
});

test("no commercial terms from the brochure: prices, packages, capacity, partners or inclusions", () => {
  assert.ok(copy().length >= 32, "EN and ES copy");
  for (const text of [chapter(), ...copy()]) {
    assert.doesNotMatch(text, /[$€]\s?\d|\d+\s?%|\b265\b|price|precio|package|paquete|collection|colecci|sapphire|includ|inclu|capacity|capacidad|partner|socio|ballroom/i, text.slice(0, 80));
  }
});

test("every tour text has an English and Spanish translation", () => {
  const used = new Set(Array.from(chapter().matchAll(/data-i18n="([^"]+)"/g), (m) => m[1]));
  assert.ok(used.size >= 14);
  for (const key of used) {
    assert.equal((js.match(new RegExp(`"${key.replace(/\./g, "\\.")}":`, "g")) || []).length, 2, key);
  }
});

test("brochure styling uses the official sage, existing fonts and light photographs", () => {
  assert.match(css, /--brand-sage:\s*#5e7060/);
  assert.match(css, /\.lockup-script\s*\{[^}]*var\(--font-script\)/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
  assert.match(chapter(), /class="flourish"[^>]*aria-hidden="true"/);
  // Brochure photographs stay off the page until their rights and location are confirmed;
  // the only picture is the floor plan the owners supplied for the website, without measurements, areas or notes.
  const images = Array.from(chapter().matchAll(/<img\b[^>]*>/g), (m) => m[0]);
  assert.equal(images.length, 1);
  assert.match(images[0], /src="assets\/tour\/floor-plan\.webp"/);
});

test("retired bar media is not published and not referenced", async () => {
  const { retiredMedia } = await import("../scripts/build-site.mjs");
  for (const path of retiredMedia) {
    assert.ok(readFileSync(new URL(`../assets/${path}`, import.meta.url)).length > 0, path);
    for (const file of [html, js, css]) assert.equal(file.includes(path), false, path);
  }
});

test("every tour image has recorded brochure provenance and owner approval", async () => {
  const { createHash } = await import("node:crypto");
  const { readdirSync } = await import("node:fs");
  const record = JSON.parse(readFileSync(new URL("../assets/tour/source.json", import.meta.url), "utf8"));
  const files = readdirSync(new URL("../assets/tour/", import.meta.url)).filter((f) => f.endsWith(".webp")).sort();
  assert.deepEqual(Object.keys(record.assets).sort(), files);
  for (const [name, entry] of Object.entries(record.assets)) {
    const bytes = readFileSync(new URL(`../assets/tour/${name}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, name);
    assert.match(entry.approvedBy, /\S/, `${name} approvedBy`);
    assert.match(entry.approvedOn, /^\d{4}-\d{2}-\d{2}$/, `${name} approvedOn`);
    assert.match(entry.rights, /\S/, `${name} rights`);
    assert.ok(bytes.length < 150_000, `${name} delivery budget`);
  }
});

test("the paper card's background is valid CSS with the colour in the final layer", () => {
  const rule = css.match(/\.tour-paper\s*\{[^}]*\}/)[0];
  const background = rule.match(/background:\s*([^;]+);/)[1];
  const layers = background.split(/,(?![^(]*\))/).map((layer) => layer.trim());
  assert.ok(layers.length >= 2);
  for (const layer of layers.slice(0, -1)) assert.doesNotMatch(layer, /^#[0-9a-f]{3,8}\b|\s#[0-9a-f]{3,8}$/i, layer);
  assert.match(background, /url\(assets\/tour\/paper\.webp\)/);
});

test("the build leaves retired bar media out of the published site", async () => {
  const { publicAsset, retiredMedia } = await import("../scripts/build-site.mjs");
  for (const path of retiredMedia) assert.equal(publicAsset(path), false, path);
  assert.equal(publicAsset("tour/paper.webp"), true);
  assert.equal(publicAsset("venue/hall-piano.jpg"), true);
});
