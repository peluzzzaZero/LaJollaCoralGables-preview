import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function historySection() {
  const start = html.indexOf('id="history"');
  const end = html.indexOf('id="moment"');
  assert.ok(start !== -1 && end > start, "history section");
  return html.slice(start, end);
}

function historyScript() {
  const start = js.indexOf("var history =");
  const end = js.indexOf("var alcazarVisual");
  assert.ok(start !== -1 && end > start, "history script");
  return js.slice(start, end);
}

test("history uses the facade photo", () => {
  assert.match(historySection(), /hero-facade\.jpg/);
});

test("history photo tween is not only an x pan", () => {
  const block = historyScript();
  assert.match(block, /objectPosition:\s*"2% 100%"/);
  assert.match(block, /objectPosition:\s*"52% 100%"/);
  assert.match(block, /scale:\s*3\.55/);
  assert.match(block, /scale:\s*3\.35/);
  assert.equal(/fromTo\(historyPhoto,\s*\{\s*x:/.test(block), false);
  assert.equal(block.includes('objectPosition: "left bottom"'), false);
});

test("Since 1928 lede is in #history", () => {
  assert.match(historySection(), /Since 1928/);
});

test("opening welcome-table starts on the candle detail at scale 6.2", () => {
  assert.match(
    js,
    /"welcome-table":\s*\{\s*from:\s*"100% 50%",\s*to:\s*"100% 50%",\s*fromScale:\s*6\.2,\s*scale:\s*[\d.]+\s*\}/
  );
});
