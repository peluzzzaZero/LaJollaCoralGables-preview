import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function teamSection() {
  const start = html.indexOf('id="team"');
  const end = html.indexOf('id="quote"');
  assert.ok(start !== -1 && end > start, "team section");
  return html.slice(start, end);
}

function teamCssOverride() {
  const match = css.match(/html\.js #team \.reveal\s*\{([^}]*)\}/);
  assert.ok(match, "team reveal override");
  return match[1];
}

function teamScript() {
  const start = js.indexOf('var team = document.querySelector("#team")');
  const end = js.indexOf("if (lenis)", start);
  assert.ok(start !== -1 && end > start, "team GSAP setup");
  return js.slice(start, end);
}

test("team keeps Julie and Patricia with their roles in order", () => {
  const section = teamSection();
  const julie = section.indexOf("Julie Arias");
  const julieRole = section.indexOf("Executive Director", julie);
  const patricia = section.indexOf("Patricia Mir", julieRole);
  const patriciaRole = section.indexOf("Managing Director", patricia);
  assert.ok(julie !== -1, "Julie Arias");
  assert.ok(julieRole > julie, "Executive Director");
  assert.ok(patricia > julieRole, "Patricia Mir");
  assert.ok(patriciaRole > patricia, "Managing Director");
  assert.match(section, /<span>JA<\/span>/);
  assert.match(section, /<span>PM<\/span>/);
});

test("team has exactly two cards and no public price", () => {
  const section = teamSection();
  assert.equal((section.match(/<article\b[^>]*class="[^"]*\bteam-card\b/g) || []).length, 2);
  assert.equal(/\$/.test(section), false);
});

test("team reveal override is fully opaque without the shared fade", () => {
  const override = teamCssOverride();
  assert.match(override, /opacity:\s*1\b/);
  assert.match(override, /transform:\s*none/);
  assert.equal(override.includes("0.08"), false);
  assert.equal(/translateY\(\s*calc\(\s*\(1\s*-\s*var\(--p/.test(override), false);
  const motion = teamScript();
  assert.match(motion, /autoAlpha:\s*1\b/);
  assert.match(motion, /y:\s*0\b/);
  assert.equal(/autoAlpha:\s*0\b/.test(motion), false);
  assert.equal(/opacity:\s*0(?:\s|;|!|$)/.test(override), false);
});
