import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const section = html.slice(html.indexOf('<article id="planning"'), html.indexOf('class="cinema-details"'));
test("moment keeps the approved gathering quote", () => { assert.match(section, /Where every gathering becomes a memory worth keeping/); });
test("moment is a readable typographic pause with a complete mark", () => {
  assert.match(section, /logo-lj-oval-cream\.png/);
  assert.equal(section.includes('leaves-monogram.jpg'), false);
  assert.equal(section.includes('quote-bleed-media'), false);
});
