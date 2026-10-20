import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const social = readFileSync(new URL("../social.js", import.meta.url), "utf8");
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
  assert.ok(html.indexOf('<div class="house-stream">') > html.indexOf('<article id="social"') && html.indexOf('<div class="house-stream">') < html.indexOf('<article id="team"'), "inside the social chapter");
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
  for (const id of ["team", "social", "tour"]) {
    const start = html.indexOf(`<article id="${id}"`);
    assert.ok(start > 0, id);
    assert.doesNotMatch(html.slice(start, html.indexOf("</article>", start)), /<iframe|<script|<video/, id);
  }
  assert.doesNotMatch(html, /instagram\.com\/embed|tiktok\.com\/embed|pinit\.js|connect\.facebook\.net/);
});

test("the mosaic strings exist in both languages and no profile description is invented", () => {
  for (const key of ["social.instagramFollow", "social.instagramGrid"]) {
    assert.equal(js.split(`"${key}":`).length, 3, key);
    assert.ok(html.includes(`data-i18n="${key}"`), key);
  }
  const cards = html.slice(html.indexOf('<nav class="social-links"'), html.indexOf("</nav>", html.indexOf('<nav class="social-links"')));
  for (const card of cards.match(/<a [^]*?<\/a>/g)) assert.match(card, /^<a [^>]*><span>[A-Za-z]+<\/span><small>[^<]+<\/small><span aria-hidden="true"><svg class="icon-arrow"[^>]*><path d="[^"]+" fill="none" stroke="currentColor"\/><\/svg><\/span><\/a>$/);
});

test("the social chapter replaces the brand wall: photographs, guest reviews, then profiles", () => {
  const start = html.indexOf('<article id="social"');
  const end = html.indexOf('<article id="team"');
  assert.ok(start > html.indexOf('<article id="rentals"') && end > start, "social chapter after the services");
  assert.equal(html.includes('id="gallery"'), false);
  assert.equal(html.includes("brand-card"), false);
  const section = html.slice(start, end);
  const order = ['class="house-stream"', 'data-guest-reviews', 'class="social-links"'].map((marker) => section.indexOf(marker));
  assert.ok(order.every((at, index) => at > (order[index - 1] ?? 0)), "mosaic, reviews, profiles");
  assert.equal(html.match(/data-guest-reviews/g).length, 1, "one reviews component");
  assert.match(section, /href="https:\/\/search\.google\.com\/local\/writereview\?placeid=ChIJWbeTzJu32YgRbGDUdwzI0W0"/);
  assert.doesNotMatch(section, /★|\b[1-5](\.\d)? ?\/ ?5\b|aggregateRating/, "no invented rating");
  // Written excerpts of real five-star Google reviews supplied by the owner: short, attributed by first name and initial.
  const quotes = section.match(/<li class="review-quote">[^]*?<\/li>/g) || [];
  assert.equal(quotes.length, 4, "four guest excerpts");
  // The planner the older reviews name is from the previous team (owner, 20 October 2026).
  for (const page of ["index.html", "planning.html", "privacy.html", "terms.html"]) {
    assert.doesNotMatch(readFileSync(new URL(`../${page}`, import.meta.url), "utf8"), /\bra[uú]l\b|martinez/i, `${page} names no former team member`);
  }
  assert.match(readFileSync(new URL("../social.js", import.meta.url), "utf8"), /!mentionsFormerTeam\(review\)/, "Google reviews naming the former planner are skipped");
  for (const quote of quotes) {
    assert.match(quote, /<blockquote lang="en"><p>“[^<]{20,160}”<\/p><\/blockquote>/);
    assert.match(quote, /<span translate="no">[A-Z][a-z]+( and [A-Z][a-z]+( [A-Z][a-z]+)?)? [A-Z]\.<\/span>/);
  }
  assert.ok(section.indexOf("data-review-quotes") < section.indexOf('class="review-invite"'), "excerpts before the Google invitation");
  assert.match(section, /<ul class="review-quotes" role="list" tabindex="0"/, "keyboard users can scroll the excerpt row");
  const workflow = readFileSync(new URL("../.github/workflows/quality-and-release.yml", import.meta.url), "utf8");
  assert.match(workflow, /LAJOLLA_WEB_ROOT: \$\{\{ runner\.temp \}\}\/site-under-test/, "browser tests run on the keyless copy");
  assert.ok(!/LAJOLLA_WEB_ROOT: \$\{\{ github\.workspace \}\}\/dist/.test(workflow), "browser tests never run on the keyed build");
  assert.ok(!/else load\(\)/.test(readFileSync(new URL("../social.js", import.meta.url), "utf8")), "reviews never load without the visitor approaching");
  // Every excerpt and reviewer must match the owner-approved provenance record.
  const record = readFileSync(new URL("./REVIEW-EXCERPTS.md", import.meta.url), "utf8");
  for (const quote of quotes) {
    const text = quote.match(/<p>(“[^<]+”)<\/p>/)[1], name = quote.match(/<span translate="no">([^<]+)<\/span>/)[1];
    assert.ok(record.includes(`| ${name} |`) && record.includes(`| ${text} |`), `${name} excerpt is recorded`);
  }
});

test("the location chapter shows a lazy map pinned at the address, plus real links", () => {
  const start = html.indexOf('<article id="location"');
  const end = html.indexOf('<article id="planning"');
  assert.ok(start > html.indexOf('<article id="team"') && end > start, "between the team and the invitation");
  const section = html.slice(start, end);
  assert.match(section, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=[^"]+&amp;destination_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0"/);
  assert.match(section, /301 Alcazar Avenue/);
  assert.match(section, /href="tel:\+17862908813"/);
  const frames = section.match(/<iframe [^>]*>/g) || [];
  assert.equal(frames.length, 1, "one visible map");
  // The full street address with ZIP: a bare venue name ("La Jolla") resolves to California or the world view.
  assert.match(frames[0], /src="https:\/\/maps\.google\.com\/maps\?q=301\+Alcazar\+Ave%2C\+Coral\+Gables%2C\+FL\+33134&amp;z=16&amp;hl=en&amp;output=embed"/);
  assert.match(frames[0], /loading="lazy"/);
  assert.match(frames[0], /data-i18n="location\.mapTitle" data-i18n-attr="title"/);
  assert.match(section, /<a class="location-map-load" href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=[^"]*301\+Alcazar\+Avenue[^"]*&amp;query_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0" target="_blank" rel="noopener noreferrer"/);
  assert.equal(html.match(/<iframe /g).length, 2, "only the map and the booking frame");
  assert.doesNotMatch(social + js, /createElement\(\s*["'`]iframe["'`]\s*\)|google\.com\/maps\/embed/i, "no scripted map frames");
  for (const key of ["nav.location", "location.title", "location.mapLoad", "location.mapTitle", "location.directions", "location.reviewsWrite", "social.eyebrow"])
    assert.equal(js.split(`"${key}":`).length - 1, 2, `${key} in EN and ES`);
});

test("no public page, script or published file name says ballroom, except the owners' own walk copy", async () => {
  const { withoutOwnerRoomName, BANNED_ROOM_WORD } = await import("./owner-copy-exception.mjs");
  const { readdirSync, statSync } = await import("node:fs");
  for (const file of ["index.html", "planning.html", "privacy.html", "terms.html", "script.js", "social.js", "styles.css", "sitemap.xml"]) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(withoutOwnerRoomName(text), BANNED_ROOM_WORD, file);
    assert.doesNotMatch(text, /facebook\.com\/(?!privacy)/i, `${file}: no Facebook account is linked until the owner confirms it`);
  }
  const walk = (dir) => readdirSync(new URL(`../${dir}`, import.meta.url)).flatMap((name) =>
    statSync(new URL(`../${dir}/${name}`, import.meta.url)).isDirectory() ? walk(`${dir}/${name}`) : [`${dir}/${name}`]);
  assert.deepEqual(walk("assets").filter((path) => /ballroom/i.test(path)), []);
});

test("the quiet site credit sits at the very bottom of the footer", () => {
  const footer = html.slice(html.indexOf('<footer id="footer"'), html.indexOf("</footer>"));
  assert.match(footer, /<p class="wrap footer-credit" translate="no">powered by peluzzza<\/p>\n<\/div>\n?$/);
});
