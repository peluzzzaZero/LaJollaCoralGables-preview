import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('the supplied cinematic film ships within its delivery budget with auditable asset hashes', () => {
  const root = new URL('../assets/venue/cinematic/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('journey-source.json', root), 'utf8'));
  assert.equal(manifest.source_dimensions.join('x'), '1920x1080');
  assert.match(manifest.source_sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.source_duration_seconds, 5.041667);
  for (const [name, budget] of Object.entries({'journey.mp4':3_000_000,'journey.webm':2_500_000,'journey-poster.jpg':250_000})) {
    const bytes = readFileSync(new URL(name, root));
    assert.ok(bytes.length <= budget, `${name} exceeds its delivery budget`);
    assert.equal(bytes.length, manifest.assets[name].bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.assets[name].sha256);
  }
});

test('temporary preview pages request no indexing until the production launch', () => {
  for (const name of ['index.html', 'privacy.html', 'terms.html']) {
    const html = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow, noarchive"\s*\/>/, name);
  }
});

test('the three actual shots stay within a combined delivery budget with unchanged asset hashes', () => {
  const root = new URL('../assets/venue/cinematic/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('sequence-source.json', root), 'utf8'));
  let mp4Bytes = 0, webmBytes = 0;
  for (const name of ['journey', 'arrival', 'balcony']) {
    for (const format of ['mp4', 'webm']) {
      const filename = `${name}.${format}`, bytes = readFileSync(new URL(filename, root));
      assert.equal(bytes.length, manifest.assets[filename].bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.assets[filename].sha256);
      assert.ok(manifest.assets[filename].duration_seconds >= 5);
      if (format === 'mp4') mp4Bytes += bytes.length; else webmBytes += bytes.length;
    }
  }
  assert.ok(mp4Bytes < 4_400_000);
  assert.ok(webmBytes < 3_700_000);
});
