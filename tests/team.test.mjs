import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function teamSection() {
  const start = html.indexOf('id="team"');
  const end = html.indexOf('<article id="planning"');
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
  const end = js.indexOf("ScrollTrigger.refresh();", start);
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
});

test("team shows Julie's and Patricia's portraits as round photographs", () => {
  const section = teamSection();
  const julie = section.indexOf('src="assets/team/julie-arias.webp"');
  const patricia = section.indexOf('src="assets/team/patricia-mir.webp"');
  assert.ok(julie !== -1 && patricia > julie, "Julie's portrait, then Patricia's");
  assert.ok(julie < section.indexOf("Julie Arias</h3>") && patricia < section.indexOf("Patricia Mir</h3>"), "each portrait above its name");
  assert.ok(patricia > section.indexOf("Julie Arias</h3>"), "Patricia's portrait in her own card");
  assert.match(section, /alt="Portrait of Julie Arias"/);
  assert.match(section, /alt="Portrait of Patricia Mir"/);
  assert.equal(/monogram|ballroom/i.test(section), false);
  assert.match(js, /"team\.julie\.photo": "Retrato de Julie Arias"/);
  assert.match(js, /"team\.pat\.photo": "Retrato de Patricia Mir"/);
  const rule = css.match(/\.team-photo\s*\{([^}]*)\}/);
  assert.ok(rule, "portrait rule");
  assert.match(rule[1], /border-radius:\s*50%/);
  assert.match(rule[1], /object-fit:\s*cover/);
  const manifest = JSON.parse(readFileSync(new URL("../assets/team/source.json", import.meta.url), "utf8"));
  for (const name of ["julie-arias", "patricia-mir"]) {
    const bytes = readFileSync(new URL(`../assets/team/${name}.webp`, import.meta.url));
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    assert.equal(bytes.subarray(12, 16).toString(), "VP8 ");
    assert.equal(bytes.readUInt16LE(26) & 0x3fff, 480, `${name} width`);
    assert.equal(bytes.readUInt16LE(28) & 0x3fff, 480, `${name} height`);
    assert.ok(bytes.length < 60_000, `${name} stays light`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.assets[`${name}.webp`].sha256, `${name} matches its manifest`);
  }
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

});
