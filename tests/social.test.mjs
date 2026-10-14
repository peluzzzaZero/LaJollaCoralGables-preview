import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../assets/social/source.json", import.meta.url), "utf8"));
const instagram = "https://www.instagram.com/lajollacoralgables/";
const tileList = JSON.parse(readFileSync(new URL("../assets/social/tiles.json", import.meta.url), "utf8"));
const allowedLinks = [/^https:\/\/www\.instagram\.com\/lajollacoralgables\/$/, /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]{5,40}\/$/,
  /^https:\/\/www\.tiktok\.com\/@lajollacoralgables\/video\/[0-9]{8,25}$/, /^https:\/\/www\.pinterest\.com\/pin\/[0-9]{6,25}\/$/];
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

test("the house stream shows the recorded tiles.json photos, each opening La Jolla's own profile or post", () => {
  const stream = houseStream();
  assert.ok(html.indexOf('<div class="house-stream">') > html.indexOf('id="team"'), "inside the team chapter");
  const tiles = [...stream.matchAll(/<li><a class="house-tile" href="([^"]+)"([^>]*)>(.*?)<\/a><\/li>/g)];
  assert.equal(tiles.length, tileList.length);
  assert.ok([6, 12].includes(tiles.length), "full rows at 3 and 6 columns");
  for (const [index, [, href, attributes, inner]] of tiles.entries()) {
    assert.equal(href, tileList[index].href, "index.html follows tiles.json; run python scripts/social-tiles.py");
    assert.ok(allowedLinks.some((link) => link.test(href)), href);
    if (href === instagram) assert.match(attributes, /tabindex="-1" aria-hidden="true"/, "the handle link is the accessible route");
    else {
      const key = `social.tile.${tileList[index].name}`;
      assert.match(attributes, new RegExp(`aria-label="[^"]{8,}" data-i18n="${key.replaceAll(".", "\\.")}" data-i18n-attr="aria-label"`));
      assert.doesNotMatch(attributes, /tabindex|aria-hidden/);
      const label = tileList[index].label.en.trim().replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      assert.ok(attributes.includes(`aria-label="${label}"`), "the HTML label is the English tiles.json label");
      const labels = [...js.matchAll(new RegExp(`"${key.replaceAll(".", "\\.")}": ("(?:[^"\\\\]|\\\\.)*")`, "g"))].map((m) => JSON.parse(m[1]));
      assert.deepEqual(labels, [tileList[index].label.en.trim(), tileList[index].label.es.trim()], key);
      assert.ok(tileList[index].postApproval?.trim(), `${key} records the owner's post confirmation`);
    }
    const [tag, src] = inner.match(/<img src="([^"]+)"[^>]*>/);
    const entry = manifest.find((item) => item.asset === src);
    assert.ok(entry, `${src} is recorded in assets/social/source.json`);
    assert.equal(src, `assets/social/${tileList[index].name}.webp`);
    assert.equal(entry.source, tileList[index].source);
    assert.ok(entry.ownerApproval?.trim(), `${src} records the owner approval`);
    assert.equal(entry.ownerApproval, tileList[index].ownerApproval.trim(), "tiles.json and source.json agree");
    assert.equal(sha256(src), entry.sha256, src);
    if (entry.source.startsWith("assets/")) assert.equal(sha256(entry.source), entry.sourceSha256, entry.source);
    else assert.match(entry.sourceSha256, /^[0-9a-f]{64}$/, "git-ignored owner original keeps its recorded hash");
    assert.match(entry.source, /^(assets\/(venue|brand)|media\/instagram)\//);
    assert.deepEqual(webpSize(src), [640, 800], src);
    assert.match(tag, /alt="" width="640" height="800" loading="lazy"/);
    const small = src.replace(".webp", "-320.webp");
    assert.match(tag, new RegExp(`srcset="${small} 320w, ${src} 640w"`));
    const variant = manifest.find((item) => item.asset === small);
    assert.ok(variant && variant.source === src && variant.sourceSha256 === entry.sha256, small);
    assert.equal(sha256(small), variant.sha256, small);
    assert.deepEqual(webpSize(small), [320, 400], small);
  }
  for (const [tag] of html.slice(html.indexOf('<div class="house-stream">'), html.indexOf("</nav>", html.indexOf('<div class="house-stream">'))).matchAll(/<a [^>]*>/g)) {
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test("assets/social publishes only recorded mosaic images", () => {
  const published = readdirSync(new URL("../assets/social/", import.meta.url))
    .filter((file) => /\.(svg|png|jpe?g|webp|avif|ico|mp4|webm)$/i.test(file)).sort();
  assert.deepEqual(published, manifest.map((entry) => entry.asset.replace("assets/social/", "")).sort());
});

test("social content loads no third-party embeds, scripts or video", () => {
  const team = html.slice(html.indexOf('id="team"'), html.indexOf('<article id="planning"'));
  assert.doesNotMatch(team, /<iframe|<script|<video/);
  assert.doesNotMatch(html, /instagram\.com\/embed|tiktok\.com\/embed|pinit\.js|connect\.facebook\.net/);
});

test("the mosaic strings exist in both languages and no profile description is invented", () => {
  for (const key of ["social.instagramFollow", "social.instagramGrid"]) {
    assert.equal(js.split(`"${key}":`).length, 3, key);
    assert.ok(html.includes(`data-i18n="${key}"`), key);
  }
  const cards = html.slice(html.indexOf('<nav class="social-links"'), html.indexOf("</nav>", html.indexOf('<nav class="social-links"')));
  for (const card of cards.match(/<a [^]*?<\/a>/g)) assert.match(card, /^<a [^>]*><span>[A-Za-z]+<\/span><small>[^<]+<\/small><span aria-hidden="true">↗<\/span><\/a>$/);
});

test("reviews and location share one chapter with real links and no preloaded map", () => {
  const start = html.indexOf('<article id="location"');
  const end = html.indexOf("</article>", html.indexOf('class="location-card"'));
  assert.ok(start !== -1 && end > start, "location chapter");
  assert.ok(start > html.indexOf('<article id="team"') && start < html.indexOf('<article id="planning"'), "between the team and the invitation");
  const section = html.slice(start, end);
  assert.match(section, /data-guest-reviews/);
  assert.equal(html.match(/data-guest-reviews/g).length, 1, "one reviews component");
  assert.match(section, /href="https:\/\/search\.google\.com\/local\/writereview\?placeid=ChIJWbeTzJu32YgRbGDUdwzI0W0"/);
  assert.match(section, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=[^"]+&amp;destination_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0"/);
  assert.match(section, /301 Alcazar Avenue/);
  assert.match(section, /href="tel:\+17862908813"/);
  assert.equal(section.includes("<iframe"), false, "the map loads only on request");
  assert.doesNotMatch(section, /★|\b[1-5](\.\d)? ?\/ ?5\b|aggregateRating/, "no invented rating");
  for (const key of ["nav.location", "location.title", "location.mapLoad", "location.directions", "location.reviewsWrite"])
    assert.equal(js.split(`"${key}":`).length - 1, 2, `${key} in EN and ES`);
});

test("the quiet site credit sits at the very bottom of the footer", () => {
  const footer = html.slice(html.indexOf('<footer id="footer"'), html.indexOf("</footer>"));
  assert.match(footer, /<p class="wrap footer-credit" translate="no">powered by peluzzza<\/p>\n<\/div>\n?$/);
});
