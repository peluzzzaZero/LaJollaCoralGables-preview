import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

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
  assert.doesNotMatch(fn, /loop|pin:|ScrollTrigger|\.poster/);
  // Only a muted play/pause prime (as the opening film does), never playback.
  assert.equal((fn.match(/\.play\(/g) || []).length, 1);
  assert.match(fn, /video\.play\(\)\?\.then\(\(\) => finishPrime\(generation\), \(\) => finishPrime\(generation\)\)/);
  assert.match(fn, /generation !== primeGeneration/);
  assert.match(css, /\.venue-walk\.is-walking figcaption \{(?![^}]*opacity)[^}]*\}/);
  assert.match(fn, /useNativeSource/);
  assert.match(css, /\.venue-walk\.is-walking \.hall-photo \{ position: sticky;/);
  assert.match(css, /\.venue-walk-steps, \.venue-walk-film \{ display: none; \}/);
  // The approved hall photograph shows until the film decodes, and returns if no source loads.
  assert.match(css, /\.venue-walk\.is-walking \.venue-walk-film \{[^}]*visibility: hidden; \}/);
  assert.match(css, /\.venue-walk\.is-walking \.venue-walk-film\.is-decoded \{ visibility: visible; \}/);
  assert.match(fn, /function collapse\(\) \{[^}]*classList\.remove\('is-walking'\)/);
  assert.match(fn, /function giveUp\(\) \{ collapse\(\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.venue-walk\.is-walking \{ height: auto; \}/);
});

test('walk files match their provenance record and stay light', () => {
  const record = JSON.parse(readFileSync(media('venue-walk-source.json'), 'utf8'));
  assert.equal(record.source, 'LA Jolla.mov');
  assert.match(record.source_sha256, /^[0-9a-f]{64}$/);
  assert.match(record.provenance, /Owner's own film/);
  const budgets = { 'venue-walk.mp4': 2_400_000, 'venue-walk.webm': 3_200_000, 'venue-walk-mobile.mp4': 1_300_000, 'venue-walk-mobile.webm': 2_000_000 };
  assert.deepEqual(Object.keys(record.assets).sort(), Object.keys(budgets).sort());
  for (const [name, budget] of Object.entries(budgets)) {
    const bytes = readFileSync(media(name));
    const asset = record.assets[name];
    assert.equal(bytes.length, asset.bytes, name);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, name);
    assert.ok(bytes.length < budget, name);
    assert.deepEqual(asset.streams, ['video'], name);
    assert.deepEqual(asset.dimensions, name.includes('mobile') ? [720, 720] : [1280, 720], name);
    assert.ok(asset.duration_seconds > 6 && asset.duration_seconds < 8, name);
    if (name.endsWith('.mp4')) assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), name);
  }
});

test('walk files probe as recorded', (t) => {
  try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); }
  catch { t.skip('ffprobe is not installed'); return; }
  const record = JSON.parse(readFileSync(media('venue-walk-source.json'), 'utf8'));
  for (const [name, asset] of Object.entries(record.assets)) {
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height', '-of', 'json', media(name).pathname]));
    assert.deepEqual(probe.streams.map((s) => s.codec_type), asset.streams, name);
    assert.equal(probe.streams[0].codec_name, asset.codec, name);
    assert.deepEqual([probe.streams[0].width, probe.streams[0].height], asset.dimensions, name);
    assert.ok(Math.abs(Number(probe.format.duration) - asset.duration_seconds) < .01, name);
  }
});
