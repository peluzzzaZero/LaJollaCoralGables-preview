import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const visit = html.slice(html.indexOf('id="visit"'), html.indexOf('id="events"'));
const fn = js.slice(js.indexOf('function initVenueWalk'), js.indexOf('function initLandingMotion'));
const media = (name) => new URL('../assets/venue/cinematic/' + name, import.meta.url);

test('the venue walk wraps the approved hall photograph and its caption', () => {
  const walk = visit.slice(visit.indexOf('data-venue-walk'), visit.indexOf('</figure>'));
  assert.match(walk, /hall-piano\.webp/);
  assert.match(walk, /data-i18n="visit\.hall"/);
  const video = walk.match(/<video\b[^>]*>/)[0];
  assert.match(video, /muted=""/);
  assert.match(video, /preload="none"/);
  assert.doesNotMatch(video, /autoplay|loop|src=|poster=/);
  for (const key of ['visit.walkDoors', 'visit.walkHall', 'visit.walkWelcome', 'visit.noteWelcome', 'visit.noteHall', 'visit.noteYours']) assert.equal((js.match(new RegExp(`"${key.replace('.', '\\.')}"`, 'g')) || []).length, 2, key);
});

test('the walk is scroll-drawn with native sticky staging, never played or pinned', () => {
  assert.match(fn, /saveData/);
  assert.match(fn, /prefers-reduced-motion: no-preference/);
  assert.doesNotMatch(fn, /\.play\(|loop|pin:|ScrollTrigger/);
  assert.match(css, /\.venue-walk\.is-walking \.hall-photo \{ position: sticky;/);
  assert.match(css, /\.venue-walk-steps, \.venue-walk-film \{ display: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.venue-walk\.is-walking \{ height: auto; \}/);
});

test('walk files are short, silent, seekable and light', () => {
  for (const [name, budget] of Object.entries({ 'venue-walk.mp4': 2_400_000, 'venue-walk.webm': 3_200_000,
    'venue-walk-mobile.mp4': 1_300_000, 'venue-walk-mobile.webm': 2_000_000,
    'venue-walk-poster.webp': 60_000, 'venue-walk-mobile-poster.webp': 60_000 })) {
    assert.ok(statSync(media(name)).size < budget, name);
  }
  for (const name of ['venue-walk.mp4', 'venue-walk-mobile.mp4', 'venue-walk.webm', 'venue-walk-mobile.webm']) {
    let probe;
    try { probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', media(name).pathname])); }
    catch { return; } // ffprobe is optional on contributor machines.
    assert.deepEqual(probe.streams.map((s) => s.codec_type), ['video'], name);
    assert.ok(Number(probe.format.duration) > 6 && Number(probe.format.duration) < 8, name);
    const { width, height } = probe.streams[0];
    assert.deepEqual([width, height], name.includes('mobile') ? [720, 720] : [1280, 720], name);
    if (name.endsWith('.mp4')) {
      const bytes = readFileSync(media(name));
      assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), name);
    }
  }
});
