import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const instagram = "https://www.instagram.com/lajollacoralgables/";

function houseStream() {
  const start = html.indexOf('<div class="house-stream">');
  const end = html.indexOf("</div>", start);
  assert.ok(start !== -1 && end > start, "house stream");
  return html.slice(start, end);
}

test("the house stream shows approved local images that open the Instagram profile", () => {
  const stream = houseStream();
  const team = html.indexOf('id="team"');
  assert.ok(html.indexOf('<div class="house-stream">') > team, "inside the team chapter");
  const images = [...stream.matchAll(/<img src="([^"]+)"[^>]*>/g)];
  assert.equal(images.length, 6);
  for (const [tag, src] of images) {
    assert.match(src, /^assets\/social\/house-[a-z]+\.webp$/);
    assert.ok(existsSync(new URL(`../${src}`, import.meta.url)), src);
    assert.match(tag, /loading="lazy"/);
    assert.match(tag, /alt="[^"]{12,}"/);
  }
  const links = [...stream.matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(links.length, 7);
  for (const [tag, href] of links) {
    assert.equal(href, instagram);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test("social content loads no third-party embeds, scripts or video", () => {
  const team = html.slice(html.indexOf('id="team"'), html.indexOf('<article id="planning"'));
  assert.doesNotMatch(team, /<iframe|<script/);
  assert.doesNotMatch(html, /instagram\.com\/embed|tiktok\.com\/embed|pinit\.js|connect\.facebook\.net/);
  assert.doesNotMatch(houseStream(), /<video/);
});

test("every social network card carries a short description in both languages", () => {
  for (const key of ["social.instagramFollow", "social.instagramGrid", "social.instagramNote", "social.tiktokNote",
    "social.pinterestNote", "social.facebookNote", "social.alt.facade", "social.alt.suite"]) {
    assert.equal(js.split(`"${key}":`).length, 3, key);
    assert.ok(html.includes(`data-i18n="${key}"`), key);
  }
});
