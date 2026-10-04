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
  const end = js.indexOf("if (lenis)", start);
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
  const motion = eventsScript();
  assert.equal(/autoAlpha:\s*0\b/.test(motion), false);
  assert.equal(/opacity:\s*0\b/.test(motion), false);
});
