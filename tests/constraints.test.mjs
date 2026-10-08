import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const page = html + css + js;

test("directors stay", () => {
  assert.match(html, /Julie Arias/);
  assert.match(html, /Patricia Mir/);
  assert.match(html, /Executive Director/);
  assert.match(html, /Managing Director/);
});

test("room name stays", () => {
  assert.match(html, /The Lexington/);
});

test("no invented cafe shots and no public prices", () => {
  for (const name of ["cafe-garden", "cafe-table", "cafe-detail"]) {
    assert.equal(page.includes(name), false, name);
  }
  assert.equal(/\$\d/.test(html), false);
});

test("MonteCarlo from the brand zip is the script font", () => {
  assert.match(css, /MonteCarlo-Regular\.ttf/);
});

test("opening frame cannot collapse", () => {
  assert.match(css, /\.cinema-scroll \.cinema-stage[^}]*height: 100svh/);
});

test("inquiry form is present", () => {
  const planning = readFileSync(new URL("../planning.html", import.meta.url), "utf8");
  assert.match(planning, /<form[\s\S]+<\/form>/);
  assert.equal(html.includes("<form"), false);
});
