import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const section = html.slice(html.indexOf('id="history"'), html.indexOf('id="visit"'));
test("history uses the supplied architecture photograph with its real proportions", () => {
  assert.match(section, /assets\/venue\/architecture\.jpg/);
  assert.match(section, /width="768" height="1024"/);
  assert.match(css, /\.history-photo img[^}]*object-fit: contain/);
});
test("history has no enlarged poster crop or animated pan", () => {
  assert.equal(js.includes('fromTo(historyPhoto'), false);
  assert.equal(css.includes('scale(3.55)'), false);
});
test("Since 1928 stays in the history", () => { assert.match(section, /Since 1928/); });
