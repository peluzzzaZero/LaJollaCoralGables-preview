import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The owners want no arrows on the site's links at all: not Unicode arrows (iOS draws
// ↗, ↘, ➚, ⬈… as blue emoji tiles, and U+FE0F forces emoji on anything), and not drawn ones.
// The review carousel's previous/next chevrons are controls, not link decorations, and stay,
// as do the flourish and the visit seal's ring text.
const files = ["index.html", "planning.html", "privacy.html", "terms.html", "script.js", "social.js", "styles.css"];
const read = (name) => {
  const text = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
  if (name.endsWith(".css")) return text.replace(/\/\*[^]*?\*\//g, "");
  if (name.endsWith(".html")) return text.replace(/<!--[^]*?-->/g, "");
  return text;
};
const banned = /[‼⁉™ℹⓂ■-◿〰〽㊗㊙←-⇿⌀-⏿☀-☄☆-➿⟰-⟿⤀-⥿⬀-⯿️⃣]|[\u{1F000}-\u{1FAFF}]/gu;

test("no emoji-capable arrows or symbols reach visitors", () => {
  for (const name of files) {
    const found = [...read(name).matchAll(banned)].map((m) => `U+${m[0].codePointAt(0).toString(16).toUpperCase()}`);
    assert.deepEqual(found, [], `${name} contains characters iOS can render as emoji`);
  }
});

test("links carry no drawn arrows either", () => {
  for (const name of files) assert.doesNotMatch(read(name), /link-arrow|icon-arrow/, `${name} still has an arrow decoration`);
  const html = read("index.html");
  const svgs = html.match(/<svg\b[^]*?<\/svg>/g) ?? [];
  const chevrons = html.match(/<button type="button" class="review-rail-btn"[^]*?<\/button>/g) ?? [];
  assert.equal(chevrons.length, 2, "review carousel keeps its previous/next controls");
  for (const svg of svgs) assert.ok(chevrons.some((button) => button.includes(svg)) || svg.startsWith('<svg class="flourish"') || svg.includes('id="visit-cta-ring"'), `unexpected icon: ${svg.slice(0, 80)}`);
});

test("social cards say Follow / Seguir and announce the new tab", () => {
  const html = read("index.html");
  const js = read("script.js");
  const cards = html.slice(html.indexOf('<nav class="social-links"'), html.indexOf("</nav>", html.indexOf('<nav class="social-links"')));
  assert.equal((cards.match(/<span class="social-follow" data-i18n="social.follow">Follow<\/span>/g) ?? []).length, 3);
  assert.equal((cards.match(/data-i18n="a11y.newTab"/g) ?? []).length, 3);
  assert.match(js, /"social.follow": "Follow"/);
  assert.match(js, /"social.follow": "Seguir"/);
  assert.equal(js.split('"a11y.newTab":').length, 3);
});
