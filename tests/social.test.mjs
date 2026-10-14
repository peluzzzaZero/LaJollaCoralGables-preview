import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../assets/social/source.json", import.meta.url), "utf8"));
const instagram = "https://www.instagram.com/lajollacoralgables/";
const sha256 = (path) => createHash("sha256").update(readFileSync(new URL(`../${path}`, import.meta.url))).digest("hex");

function houseStream() {
  const start = html.indexOf('<div class="house-stream">');
  const end = html.indexOf("</ul>", start);
  assert.ok(start !== -1 && end > start, "house stream");
  return html.slice(start, end);
}

function webpSize(path) {
  const bytes = readFileSync(new URL(`../${path}`, import.meta.url));
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP", path);
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8X") return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
  const bits = bytes.readUInt32LE(21);
  return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
}

test("the house stream shows recorded local photos that open the Instagram profile", () => {
  const stream = houseStream();
  assert.ok(html.indexOf('<div class="house-stream">') > html.indexOf('id="team"'), "inside the team chapter");
  const tiles = [...stream.matchAll(/<li><a class="house-tile" href="([^"]+)"[^>]*>(.*?)<\/a><\/li>/g)];
  assert.equal(tiles.length, manifest.length);
  for (const [, href, inner] of tiles) {
    assert.equal(href, instagram);
    const [tag, src] = inner.match(/<img src="([^"]+)"[^>]*>/);
    const entry = manifest.find((item) => item.asset === src);
    assert.ok(entry, `${src} is recorded in assets/social/source.json`);
    assert.equal(sha256(src), entry.sha256, src);
    assert.equal(sha256(entry.source), entry.sourceSha256, entry.source);
    assert.match(entry.source, /^assets\/(venue|brand)\//);
    assert.deepEqual(webpSize(src), [640, 800], src);
    assert.match(tag, /width="640" height="800" loading="lazy"/);
    assert.match(tag, /alt="[^"]{12,}"/);
    assert.match(inner, /<span class="sr-only" data-i18n="social.instagramOpen">/);
  }
  for (const [tag] of html.slice(html.indexOf('<div class="house-stream">'), html.indexOf("</nav>", html.indexOf('<div class="house-stream">'))).matchAll(/<a [^>]*>/g)) {
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test("social content loads no third-party embeds, scripts or video", () => {
  const team = html.slice(html.indexOf('id="team"'), html.indexOf('<article id="planning"'));
  assert.doesNotMatch(team, /<iframe|<script|<video/);
  assert.doesNotMatch(html, /instagram\.com\/embed|tiktok\.com\/embed|pinit\.js|connect\.facebook\.net/);
});

test("every new social string exists in both languages and is used", () => {
  const keys = [...new Set([...html.matchAll(/data-i18n="(social\.(?:instagram|tiktok|pinterest|facebook)[A-Za-z]+|social\.alt\.[a-z]+)"/g)].map((m) => m[1]))];
  assert.ok(keys.length >= 12, "mosaic, card and alt keys");
  for (const key of keys) assert.equal(js.split(`"${key}":`).length, 3, key);
});
