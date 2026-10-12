import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../planning.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function sectionBetween(id, nextId) {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf(`id="${nextId}"`, start);
  assert.ok(start !== -1 && end > start, `${id} section`);
  return html.slice(start, end);
}

function revealOverride(id) {
  const match = css.match(new RegExp(`html\\.js #${id} \\.reveal\\s*\\{([^}]*)\\}`));
  assert.ok(match, `${id} reveal override`);
  return match[1];
}

test("planning uses the live tour calendar without the removed quote form", () => {
  const section = sectionBetween("quote", "footer");
  assert.equal(section.includes('<form'), false);
  assert.match(section, /data-booking-opener/);
  assert.match(section, /https:\/\/bookings\.cloud\.microsoft\/book\//);
  assert.match(html, /mailto:info@lajollacoralgables\.com/);
  assert.equal(section.includes('id="inquiry-selection"'), false);
});

test("the public script has no form delivery or external mail dependency", () => {
  assert.equal(js.includes("api.web3forms.com"), false);
  assert.equal(js.includes("/api/inquiries"), false);
  assert.equal(js.includes("initLocalForm"), false);
});

test("visit section reveal overrides are fully opaque without autoAlpha 0", () => {
  for (const id of ["quote"]) {
    const override = revealOverride(id);
    assert.match(override, /opacity:\s*1\b/);
    assert.match(override, /transform:\s*none/);
    assert.equal(override.includes("0.08"), false);
    assert.equal(/translateY\s*\(\s*calc/.test(override), false);
  }

});
