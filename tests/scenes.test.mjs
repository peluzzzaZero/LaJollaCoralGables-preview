import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const visit = html.slice(html.indexOf('id="visit"'), html.indexOf('id="events"'));

test('the spaces album keeps the four approved detail photographs and their captions in order', () => {
  const album = visit.slice(visit.indexOf('class="venue-album"'), visit.indexOf('class="venue-inquiry"'));
  let cursor = -1;
  for (const [image, caption] of [['staircase.webp', 'visit.stair'], ['music-detail.webp', 'visit.music'], ['garden.webp', 'visit.garden'], ['ballroom-piano.webp', 'visit.piano']]) {
    const at = album.indexOf(image);
    assert.ok(at > cursor, image);
    assert.ok(album.indexOf(`data-i18n="${caption}"`) > at, caption);
    cursor = at;
  }
  assert.equal((album.match(/class="album-print\b/g) || []).length, 4);
  assert.match(album, /class="album-count" aria-hidden="true"/);
});

test('scenes use native sticky staging; the entrance film remains the only video and GSAP pin', () => {
  assert.equal((html.match(/<video\b/g) || []).length, 1);
  assert.equal((js.match(/pin:/g) || []).length, 1);
  assert.match(css, /\.landing-effects \.is-staged \.album-stage \{ position: sticky;/);
  assert.match(css, /\.landing-effects \.landing-section \{ overflow-x: clip; \}/);
});

test('inked copy keeps its complete translated text in the markup', () => {
  assert.match(html, /data-i18n="history.lede" data-ink="">Since 1928/);
  assert.match(html, /data-i18n="quote.text" data-ink="">“Where every gathering becomes a memory worth keeping\.”/);
  assert.match(js, /addEventListener\('lajolla-language'/);
});

test('every scene settles on the readable layout and is removed without motion', () => {
  // Unset scene variables default to the settled pose.
  for (const fallback of ['var(--ink, 999)', 'var(--arrive, 1)', 'var(--scatter, 0)', 'var(--enter, 0)', 'var(--stamp, 1)', 'var(--entrance-arch, 0)']) {
    assert.ok(css.includes(fallback), fallback);
  }
  const reduced = css.slice(css.indexOf('/* v1.21'));
  assert.match(reduced, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(js, /if \(reduced\.matches \|\| saveData \|\| !\('IntersectionObserver' in window\)\) return;/);
  assert.match(js, /inked\.forEach\(plainWords\)/);
});

test('scenes never hide content with zero opacity, wipes or edge-on tilts', () => {
  const scenes = css.slice(css.indexOf('/* v1.21'));
  assert.equal(/opacity:\s*0(?:\s|;|$)/.test(scenes), false);
  assert.equal(/rotate[XY]\(/.test(scenes), false);
  assert.equal(/clip-path/.test(scenes), false);
  assert.match(scenes, /opacity: clamp\(\.45,/);
});
