import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
  const end = js.indexOf('gsap.utils.toArray(".brand-card img")', start);
  assert.ok(start !== -1 && end > start, "alcazar script");
  return js.slice(start, end);
}

test("alcazar title is The Alcazar Room", () => {
  const section = alcazarSection();
  assert.match(
    section,
    /<h2 id="alcazar-title"[^>]*>The Alcazar Room<\/h2>/
  );
});

test("alcazar drawing is the awning-mark bitmap", () => {
  const section = alcazarSection();
  assert.match(section, /<figure class="alcazar-visual">/);
  assert.match(section, /src="assets\/brand\/awning-mark\.jpg"/);
  assert.equal(/<svg[\s>]/.test(section), false);
  assert.equal(section.includes("cafe-garden"), false);
  assert.equal(section.includes("cafe-table"), false);
  assert.equal(section.includes("cafe-detail"), false);
});

test("alcazar does not wipe with a clip-path inset or tilt with rotateY", () => {
  const section = alcazarSection();
  const style = alcazarCss();
  const motion = alcazarScript();
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
