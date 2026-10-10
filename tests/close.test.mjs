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

test("quote keeps its required contact and event fields and local submit wiring", () => {
  const section = sectionBetween("quote", "vendors");
  for (const name of ["name", "email", "phone", "eventDate", "guestCount"]) {
    assert.match(section, new RegExp(`name="${name}"`), name);
  }
  assert.match(section, /<button[^>]+type="submit"/);
  assert.match(js, /initLocalForm\("quote-form"/);
});

test("vendor form keeps name, company, service, and email", () => {
  const section = sectionBetween("vendors", "footer");
  for (const name of ["name", "company", "service", "email"]) {
    assert.match(section, new RegExp(`name="${name}"`), name);
  }
});

test("sendMail uses the business-owned Web3Forms key without paid recipient overrides", () => {
  assert.match(js, /https:\/\/api\.web3forms\.com\/submit/);
  assert.match(js, /var MAIL_KEY = "aec8511b-344f-4b56-bfd6-0b56e746f21b"/);
  assert.equal(js.includes("c13b3e4c-b71b-4df0-84b0-ce0b91be3b84"), false);
  assert.equal(/\bccemail\s*:/.test(js), false);
});

test("quote and vendor sections contain no dollar sign", () => {
  assert.equal(/\$/.test(sectionBetween("quote", "vendors")), false);
  assert.equal(/\$/.test(sectionBetween("vendors", "footer")), false);
});

test("quote and vendor reveal overrides are fully opaque without autoAlpha 0", () => {
  for (const id of ["quote", "vendors"]) {
    const override = revealOverride(id);
    assert.match(override, /opacity:\s*1\b/);
    assert.match(override, /transform:\s*none/);
    assert.equal(override.includes("0.08"), false);
    assert.equal(/translateY\s*\(\s*calc/.test(override), false);
  }

});
