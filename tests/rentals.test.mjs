import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

const LABELS = [
  "Planning, coordination & production",
  "Catering & bar services",
  "Florals, design & décor",
  "Furniture, linens & tabletop rentals",
  "Photography & videography",
  "Entertainment & specialty performers",
  "Audio, lighting, AV & staging",
  "Custom builds, branding & signage",
  "Interactive experiences & photo activations",
  "Valet, security & event staffing",
];

function rentalsSection() {
  const start = html.indexOf('id="rentals"');
  const end = html.indexOf('id="testimonial"');
  assert.ok(start !== -1 && end > start, "rentals section");
  return html.slice(start, end).replaceAll("&amp;", "&");
}

function rentalsScript() {
  const start = js.indexOf('var rentals = document.querySelector("#rentals")');
  const end = js.indexOf("ScrollTrigger.refresh();", start);
  assert.ok(start !== -1 && end > start, "rentals script");
  return js.slice(start, end);
}

test("rentals keeps the ten service labels in order", () => {
  const section = rentalsSection();
  let cursor = -1;
  for (const label of LABELS) {
    const at = section.indexOf(label);
    assert.ok(at > cursor, label);
    cursor = at;
  }
  const items = section.match(/<li\b/g) || [];
  assert.equal(items.length, 10);
});

test("rentals section has no price", () => {
  assert.equal(/\$/.test(rentalsSection()), false);
});

test("rentals text is not left on the 0.08 reveal fade", () => {
  const section = rentalsSection();
  assert.match(section, /class="[^"]*\breveal\b/);
  const overrides = [...css.matchAll(/html\.js #rentals \.reveal\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(overrides.length > 0, "rentals still inherit the 0.08 reveal fade");
  for (const body of overrides) {
    assert.equal(body.includes("0.08"), false, body);
    assert.match(body, /opacity:\s*1\b/);
    assert.equal(/translateY\(\s*calc\(\s*\(1\s*-\s*var\(--p/.test(body), false);
  }
  const rules = [...css.matchAll(/#rentals[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
  for (const body of rules) {
    assert.equal(/opacity:\s*calc\(\s*0\.08/.test(body), false);
    assert.equal(/opacity:\s*0(?:\s|;|!|$)/.test(body), false);
  }

});
