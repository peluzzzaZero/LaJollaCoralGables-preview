import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../assets/venue/cinematic/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('scroll-world-source.json', root), 'utf8'));

test('delivered motion files match the probed silent media and stay within web budgets', () => {
  for (const [name, evidence] of Object.entries(manifest.assets)) {
    const bytes = readFileSync(new URL(name, root));
    assert.equal(bytes.length, evidence.bytes, name);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), evidence.sha256, name);
    assert.ok(bytes.length < (name === 'journey-hd.mp4' ? 4_500_000 : name.endsWith('.webp') ? 150_000 : 3_000_000), name);
    if (!evidence.streams) continue;
    assert.equal(evidence.streams.length, 1, `${name}: unexpected audio or extra stream`);
    const video = evidence.streams[0];
    assert.equal(video.codec_type, 'video');
    assert.ok(evidence.duration_seconds >= 4.5 && evidence.duration_seconds < 5.2, name);
    if (name.endsWith('.mp4')) {
      assert.equal(video.codec_name, 'h264');
      assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), `${name}: metadata must precede frames for faststart`);
    }
  }
  const portrait = manifest.assets['hall-mobile.mp4'].streams[0];
  assert.ok(portrait.width < portrait.height);
  assert.match(manifest.sources['hall-mobile'], /first 0\.9 seconds/);
  assert.match(manifest.free_generation_trial.status, /rejected/);
});
