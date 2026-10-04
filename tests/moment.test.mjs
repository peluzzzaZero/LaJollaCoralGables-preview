import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function momentSection() {
  const start = html.indexOf('id="moment"');
  const end = html.indexOf('id="events"');
  assert.ok(start !== -1 && end > start, "moment section");
  return html.slice(start, end);
}

function momentScript() {
  const start = js.indexOf('var moment = document.querySelector("#moment")');
  const end = js.indexOf('var events =', start);
  assert.ok(start !== -1 && end > start, "moment script");
  return js.slice(start, end);
}

test("moment keeps the gathering quote", () => {
  assert.match(momentSection(), /Where every gathering becomes a memory worth keeping/);
});

test("moment uses the leaves photo", () => {
  assert.match(momentSection(), /leaves-monogram\.jpg/);
});

test("moment tween moves the photo", () => {
  const block = momentScript();
  const scales = [...block.matchAll(/scale:\s*([0-9.]+)/g)].map((m) => m[1]);
  const positions = [...block.matchAll(/objectPosition:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(scales).size > 1 || new Set(positions).size > 1, true);
});

test("moment quote does not start at autoAlpha 0", () => {
  const block = momentScript();
  assert.equal(/autoAlpha:\s*0\b/.test(block), false);
});
