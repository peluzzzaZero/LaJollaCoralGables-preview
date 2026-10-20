import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function eventsSection() {
  const start = html.indexOf('id="events"');
  const end = html.indexOf('id="alcazar"');
  assert.ok(start !== -1 && end > start, "events section");
  return html.slice(start, end).replaceAll("&amp;", "&");
}

function eventsScript() {
  const start = js.indexOf('var events = document.querySelector("#events")');
  const end = js.indexOf("ScrollTrigger.refresh();", start);
  assert.ok(start !== -1 && end > start, "events script");
  return js.slice(start, end);
}

test("events keeps the known titles", () => {
  const section = eventsSection();
  for (const title of [
    "Weddings",
    "Quinceañeras",
    "Social celebrations",
    "Corporate events",
    "Brand activations",
    "Film, photo & content",
  ]) {
    assert.equal(section.includes(title), true, title);
  }
});

test("events section has no price", () => {
  assert.equal(/\$/.test(eventsSection()), false);
});

test("events items are not faded in from opacity 0.08", () => {
  const section = eventsSection();
  assert.match(section, /class="[^"]*\breveal\b/);
  const overrides = [...css.matchAll(/html\.js #events \.reveal\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(overrides.length > 0, "events still inherit the 0.08 reveal fade");
  for (const body of overrides) {
    assert.equal(body.includes("0.08"), false, body);
    assert.match(body, /opacity:\s*1\b/);
    assert.equal(/translateY\(\s*calc\(\s*\(1\s*-\s*var\(--p/.test(body), false);
  }
  const eventsRules = [...css.matchAll(/#events[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
  for (const body of eventsRules) {
    assert.equal(/opacity:\s*calc\(\s*0\.08/.test(body), false);
    assert.equal(/opacity:\s*0\b/.test(body), false);
  }

});

test("events shows the hall in several moods with bilingual captions and alt text", () => {
  const section = eventsSection();
  const strip = section.slice(section.indexOf('class="wrap hall-moods'), section.indexOf('class="wrap section-action"'));
  const cards = [...strip.matchAll(/<img src="assets\/venue\/web\/mood-([a-z]+)\.webp" alt="[^"]+" width="\d+" height="\d+" data-i18n="events\.moodAlt\.\1" data-i18n-attr="alt" loading="lazy"/g)].map((m) => m[1]);
  assert.deepEqual(cards, ["ivory", "amethyst", "amber", "coral", "emerald"]);
  for (const key of ["events.moodsTitle", "events.moodsIntro", ...cards.flatMap((k) => [`events.mood.${k}`, `events.moodAlt.${k}`])]) {
    assert.equal(js.split(`"${key}":`).length - 1, 2, key);
  }
  assert.match(css, /\.moods-strip \{[^}]*overflow-x: auto/);
  assert.match(strip, /<ul class="moods-strip" role="list" tabindex="0" aria-label="[^"]+" data-i18n="events\.moodsLabel" data-i18n-attr="aria-label">/, "keyboard users can scroll the strip");
  assert.equal(js.split('"events.moodsLabel":').length - 1, 2);
});

test("every occasion has its own photograph in the frame and on its card", () => {
  const section = eventsSection();
  const slides = [...section.matchAll(/<img class="occasion-slide[^"]*"[^>]*src="([^"]+)"[^>]*data-i18n="([^"]+)"[^>]*data-occasion-photo="(\d+)"/g)];
  assert.equal(slides.length, 10);
  assert.equal(new Set(slides.map((m) => m[1])).size, 10, "ten different photographs");
  assert.deepEqual(slides.map((m) => Number(m[3])), [...Array(10).keys()]);
  assert.equal([...section.matchAll(/<img class="occasion-slide[^"]*" aria-hidden="true"/g)].length, 9, "only the shown slide is exposed");
  const cards = [...section.matchAll(/<li><article class="occasion">\n<img class="occasion-photo" src="([^"]+)"[^>]*data-i18n="([^"]+)"/g)];
  assert.deepEqual(cards.map((m) => m[1]), slides.map((m) => m[1]), "each card carries the frame's photograph");
  for (const [, , key] of slides) assert.equal(js.split(`"${key}":`).length - 1, 2, key);
  assert.equal(/ballroom/i.test(slides.concat(cards).map((m) => m[0]).join(" ")), false);
  assert.match(css, /html:not\(\.js\) \.landing-events \.occasion-photo \{ display: block; \}/);
  assert.match(js, /if \(readingRow\.length > 1 && !reduced\.matches && !saveData && !document\.hidden\)/);
});
