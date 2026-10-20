import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// iOS draws many Unicode arrows and symbols (↗, ↘, ➚, ⬈…) as blue emoji tiles, and
// U+FE0F forces emoji presentation on anything. Visitors must only ever see drawn icons.
const files = ["index.html", "planning.html", "privacy.html", "terms.html", "script.js", "social.js", "styles.css"];
const read = (name) => {
  const text = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
  if (name.endsWith(".css")) return text.replace(/\/\*[^]*?\*\//g, "");
  if (name.endsWith(".html")) return text.replace(/<!--[^]*?-->/g, "");
  return text;
};
const banned = /[←-⇿⌀-⏿☀-☄☆-➿⟰-⟿⤀-⥿⬀-⯿️⃣]|[\u{1F000}-\u{1FAFF}]/gu;
const arrowIcon = /<svg class="icon-arrow[^"]*" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="[^"]+"\/><\/svg>/;

test("no emoji-capable arrows or symbols reach visitors", () => {
  for (const name of files) {
    const found = [...read(name).matchAll(banned)].map((m) => `U+${m[0].codePointAt(0).toString(16).toUpperCase()}`);
    assert.deepEqual(found, [], `${name} contains characters iOS can render as emoji`);
  }
});

test("link arrows are drawn icons that follow the text colour", () => {
  const html = read("index.html");
  const css = read("styles.css");
  for (const span of html.match(/<span class="link-arrow"[^>]*>[^]*?<\/span>/g) ?? []) assert.equal(span, '<span class="link-arrow" aria-hidden="true"></span>');
  const icons = html.match(/<svg class="icon-arrow[^]*?<\/svg>/g) ?? [];
  assert.ok(icons.length >= 5, "social cards, Instagram handle and arrival hint use the drawn arrow");
  for (const icon of icons) assert.match(icon, arrowIcon);
  assert.match(css, /\.icon-arrow \{[^}]*fill: none;[^}]*stroke: currentColor;/);
});
