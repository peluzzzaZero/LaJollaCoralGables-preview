import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { buildSite, publicFiles } from '../scripts/build-site.mjs';

const root = new URL('../', import.meta.url);
test('only an explicit restricted browser key can fill the public reviews configuration', async () => {
  const source = await fixture();
  try {
    await writeFile(resolve(source, 'index.html'), '<meta name="google-maps-browser-key" content=""/>');
    let built = await buildSite(source, { browserKey: '' });
    assert.equal(await readFile(resolve(built.destination, 'index.html'), 'utf8'), '<meta name="google-maps-browser-key" content=""/>');
    built = await buildSite(source, { browserKey: 'FAKE_BROWSER_KEY_FOR_ISOLATED_TEST' });
    assert.match(await readFile(resolve(built.destination, 'index.html'), 'utf8'), /content="FAKE_BROWSER_KEY_FOR_ISOLATED_TEST"/);
    await assert.rejects(buildSite(source, { browserKey: 'bad"><script>' }), /Invalid Maps browser key/);
  } finally { await rm(source, { recursive: true, force: true }); }
});
async function fixture() {
  const path = await mkdtemp(resolve(tmpdir(), 'lajolla-public-'));
  await mkdir(resolve(path, 'assets/vendor'), { recursive: true });
  for (const file of publicFiles) await writeFile(resolve(path, file), `Public ${file}`);
  return path;
}

test('publishing excludes internal/future root files and private asset metadata and clears stale output', async () => {
  const source = await fixture();
  try {
    await mkdir(resolve(source, 'server'));
    await writeFile(resolve(source, 'server/app.mjs'), 'private backend');
    for (const file of ['AGENTS.md', 'package.json', '.env', 'future-private.txt']) await writeFile(resolve(source, file), 'PRIVATE');
    for (const file of ['provenance.json', 'secrets.txt', 'tool.js']) await writeFile(resolve(source, 'assets', file), 'PRIVATE');
    await writeFile(resolve(source, 'assets/photo.webp'), 'approved image');
    await writeFile(resolve(source, 'assets/vendor/gsap.min.js'), 'approved library');
    await mkdir(resolve(source, 'dist/server'), { recursive: true });
    await writeFile(resolve(source, 'dist/server/app.mjs'), 'stale private file');
    const { destination } = await buildSite(source, { browserKey: '' });
    for (const file of ['server/app.mjs', 'AGENTS.md', 'package.json', '.env', 'future-private.txt',
      'assets/provenance.json', 'assets/secrets.txt', 'assets/tool.js']) {
      await assert.rejects(access(resolve(destination, file)), { code: 'ENOENT' });
    }
    assert.equal(await readFile(resolve(destination, 'assets/photo.webp'), 'utf8'), 'approved image');
    assert.equal(await readFile(resolve(destination, 'assets/vendor/gsap.min.js'), 'utf8'), 'approved library');
    for (const file of publicFiles) assert.equal(await readFile(resolve(destination, file), 'utf8'), `Public ${file}`);
  } finally { await rm(source, { recursive: true, force: true }); }
});

test('a symlink cannot bring files outside the approved assets into the publication', async () => {
  const source = await fixture();
  try {
    await writeFile(resolve(source, 'private.webp'), 'not a public asset');
    await symlink(resolve(source, 'private.webp'), resolve(source, 'assets/leak.webp'));
    await assert.rejects(buildSite(source, { browserKey: '' }), /Symlink is not a public asset/);
  } finally { await rm(source, { recursive: true, force: true }); }
});

test('the actual public package preserves pages, fonts and seekable media bytes', async () => {
  for (const file of [...publicFiles, 'assets/venue/cinematic/journey.mp4',
    'assets/venue/cinematic/details-mobile-hq.mp4', 'assets/fonts/CormorantGaramond-latin.woff2']) {
    let actual = await readFile(new URL(`dist/${file}`, root));
    if (file === 'index.html') {
      actual = Buffer.from(actual.toString().replace(/(<meta name="google-maps-browser-key" content=")[A-Za-z0-9_-]*("\/>)/, '$1$2'));
    }
    assert.deepEqual(actual, await readFile(new URL(file, root)), file);
  }
});

test('share metadata is page-specific and uses an existing public image and verified venue data', async () => {
  const descriptions = new Set();
  for (const file of ['index.html', 'planning.html', 'privacy.html', 'terms.html']) {
    const html = await readFile(new URL(file, root), 'utf8');
    const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(!descriptions.has(description), `Repeated description: ${file}`);
    descriptions.add(description);
    const image = html.match(/property="og:image" content="https:\/\/lajollacoralgables.com\/([^"]+)"/)[1];
    await access(new URL(`dist/${image}`, root));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@context'], 'https://schema.org');
    const objects = schema['@graph'] || [schema];
    assert.equal(objects.find(o => o['@type'] === 'WebPage').url,
      'https://lajollacoralgables.com/' + (file === 'index.html' ? '' : file));
    for (const object of objects) {
      for (const unknown of ['maximumAttendeeCapacity', 'priceRange', 'aggregateRating', 'openingHours', 'foundingDate']) {
        assert.equal(object[unknown], undefined, `Unconfirmed business data: ${unknown}`);
      }
    }
  }
});

test('Pages deploys the public artifact only after quality and the immutable release', async () => {
  const workflow = await readFile(new URL('.github/workflows/quality-and-release.yml', root), 'utf8');
  assert.match(workflow, /uses: actions\/upload-pages-artifact@v3\s+with:\s+path: dist/);
  assert.match(workflow, /publish:[\s\S]*?needs: \[review, review-v14, release\]/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
});


test('public ARIA relationships resolve to real page elements', async () => {
  for (const file of ['index.html', 'planning.html', 'privacy.html', 'terms.html']) {
    const html = await readFile(new URL(file, root), 'utf8');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const [, references] of html.matchAll(/\baria-(?:labelledby|describedby)="([^"]+)"/g)) {
      for (const id of references.split(/\s+/)) assert.ok(ids.has(id), `${file}: Missing ARIA target ${id}`);
    }
  }
});
