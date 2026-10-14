import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const visit = html.slice(html.indexOf('id="visit"'), html.indexOf('id="events"'));
const media = (name) => new URL('../assets/venue/cinematic/' + name, import.meta.url);

test('the venue doorway film sits over the approved hall photograph and never autoplays from markup', () => {
  const hall = visit.slice(visit.indexOf('class="hall-photo"'), visit.indexOf('</figure>'));
  assert.match(hall, /hall-piano\.webp/);
  const video = hall.match(/<video\b[^>]*>/)[0];
  assert.match(video, /data-venue-entrance=""/);
  assert.match(video, /muted=""/);
  assert.match(video, /preload="none"/);
  assert.doesNotMatch(video, /autoplay|loop|src=/);
  assert.match(hall, /class="venue-replay" type="button" hidden="" data-i18n="visit.enterAgain"/);
  assert.match(js, /"visit\.enterAgain": "Volver a entrar"/);
});

test('reduced motion and data saving keep the photograph; the film plays once', () => {
  const fn = js.slice(js.indexOf('function initVenueEntrance'), js.indexOf('function initLandingMotion'));
  assert.match(fn, /prefers-reduced-motion: reduce/);
  assert.match(fn, /saveData/);
  assert.match(fn, /played = true; observer\.disconnect\(\)/);
  assert.doesNotMatch(fn, /loop|pin:/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.venue-entrance, \.venue-replay \{ display: none; \} \}/);
});

test('doorway files are short, silent, light and faststart', () => {
  for (const [name, budget] of Object.entries({ 'entrance-walk.mp4': 1_600_000, 'entrance-walk.webm': 1_600_000,
    'entrance-walk-mobile.mp4': 700_000, 'entrance-walk-mobile.webm': 900_000, 'entrance-walk-poster.webp': 80_000 })) {
    assert.ok(statSync(media(name)).size < budget, name);
  }
  for (const name of ['entrance-walk.mp4', 'entrance-walk-mobile.mp4', 'entrance-walk.webm', 'entrance-walk-mobile.webm']) {
    let probe;
    try { probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name', '-of', 'json', media(name).pathname])); }
    catch { return; } // ffprobe is optional on contributor machines.
    assert.deepEqual(probe.streams.map((s) => s.codec_type), ['video'], name);
    const duration = Number(probe.format.duration);
    assert.ok(duration > 6 && duration < 8, name);
    if (name.endsWith('.mp4')) {
      const bytes = readFileSync(media(name));
      assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), name);
    }
  }
});
