import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BANNED_ROOM_WORD, OWNER_ROOM_NAME_STRINGS, withoutOwnerRoomName } from "./owner-copy-exception.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function alcazarSection() {
  const start = html.indexOf('id="alcazar"');
  const end = html.indexOf('id="rentals"');
  assert.ok(start !== -1 && end > start, "alcazar section");
  return html.slice(start, end);
}

function alcazarCss() {
  const start = css.indexOf("/* —— 5. Alcazar Room —— */");
  const end = css.indexOf("/* —— 6. Rentals —— */");
  assert.ok(start !== -1 && end > start, "alcazar css");
  return css.slice(start, end);
}

function alcazarScript() {
  const start = js.indexOf('document.querySelector("#alcazar")');
  const end = js.indexOf('// All commercial', start);
  assert.ok(start !== -1 && end > start, "alcazar script");
  return js.slice(start, end);
}

test("alcazar title is The Lexington", () => {
  const section = alcazarSection();
  assert.match(
    section,
    /<h2 id="alcazar-title"[^>]*>The Lexington<\/h2>/
  );
});

test("The Lexington shows the owners' photograph of the lounge", () => {
  const section = alcazarSection();
  assert.match(section, /<figure class="alcazar-visual"[^>]*>/);
  assert.match(section, /srcset="assets\/venue\/web\/lexington-lounge\.avif"/);
  assert.match(section, /src="assets\/venue\/web\/lexington-lounge\.webp"[^>]*data-i18n="alcazar\.photoAlt"/);
  assert.equal(section.includes("awning-mark"), false);
  assert.equal(/<svg[\s>]/.test(section), false);
  assert.equal(section.includes("cafe-garden"), false);
  assert.equal(section.includes("cafe-table"), false);
  assert.equal(section.includes("cafe-detail"), false);
});

test("alcazar does not wipe with a clip-path inset or tilt with rotateY", () => {
  const section = alcazarSection();
  const style = alcazarCss();
  const motion = js.slice(js.indexOf("function initCinematicWindow"), js.indexOf("function prepareScrollWords"));
  for (const source of [section, style, motion]) {
    assert.equal(/rotateY/.test(source), false, source.slice(0, 80));
    assert.equal(/rotateX/.test(source), false, source.slice(0, 80));
    assert.equal(/inset\s*\(/.test(source), false, source.slice(0, 80));
    assert.equal(/clip-path\s*:\s*inset/i.test(source), false);
    assert.equal(/clipPath\s*:\s*"inset/.test(source), false);
  }
  assert.equal(/autoAlpha:\s*0\b/.test(motion), false);
  assert.equal(/opacity:\s*0\b/.test(motion), false);
});

test("alcazar section has no price", () => {
  assert.equal(/\$/.test(alcazarSection()), false);
});

test("alcazar is not ghosted at opacity 0.08", () => {
  const section = alcazarSection();
  assert.match(section, /class="[^"]*\breveal\b/);
  const overrides = [...css.matchAll(/html\.js #alcazar \.reveal\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(overrides.length > 0, "alcazar still inherits the 0.08 reveal fade");
  for (const body of overrides) {
    assert.equal(body.includes("0.08"), false, body);
    assert.match(body, /opacity:\s*1\b/);
    assert.equal(/translateY\(\s*calc\(\s*\(1\s*-\s*var\(--p/.test(body), false);
  }
  const rules = [...alcazarCss().matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
  for (const body of rules) {
    assert.equal(/opacity:\s*calc\(\s*0\.08/.test(body), false);
    assert.equal(/opacity:\s*0(?:\s|;|!|$)/.test(body), false);
  }
});

test("the walk, album and Lexington use the owners' v1.27.2 copy verbatim in both languages", () => {
  const en = {
    "visit.stair": "Elegance at Every Turn",
    "visit.music": "Historic details, timeless charm",
    "visit.garden": "Architecture and garden beauty",
    "visit.street": "A Coral Gables landmark",
    "visit.noteWelcome": "Every memorable occasion deserves a beautiful beginning.",
    "visit.noteYours": "Imagine the possibilities.",
    "visit.walkDoors": "First impressions",
    "visit.walkHall": "The Grand Ballroom",
    "visit.noteHall": "A timeless setting, thoughtfully designed for extraordinary occasions.",
    "visit.hall": "The Grand Ballroom · A timeless setting for unforgettable occasions.",
    "landing.visitReason": "Experience La Jolla in person and discover the possibilities for your next extraordinary occasion.",
  };
  for (const [key, text] of Object.entries(en)) {
    assert.ok(js.includes(`"${key}": "${text}"`), key);
    assert.ok(html.includes(`data-i18n="${key}">${text}<`), key);
  }
  for (const text of ["Elegancia en cada rincón", "Toda ocasión memorable merece un bello comienzo.", "Consultar por The Lexington"]) assert.ok(js.includes(text), text);
  const section = alcazarSection();
  assert.ok(section.includes(">Rich in deep greens, wine reds, and warm golds, this intimate lounge draws inspiration from distinguished private clubs, classic whiskey lounges, and the elegance of Kentucky racing culture. An intimate setting for cocktails, private dinners, celebrations, and exclusive gatherings, the space offers a distinctive atmosphere of character, warmth, and understated luxury.<"));
  assert.equal(BANNED_ROOM_WORD.test(section), false, "The Lexington never says it");
  assert.equal(BANNED_ROOM_WORD.test(withoutOwnerRoomName(html + js)), false, "only the owners' walk strings say it");
  for (const allowed of OWNER_ROOM_NAME_STRINGS) assert.equal((html + js).split(allowed).length - 1, 1, allowed);
});
