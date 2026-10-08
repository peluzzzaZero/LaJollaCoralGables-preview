import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');
const planning = read('planning.html');
const js = read('script.js');
const version = read('VERSION').trim();

test('each deployable version has matching cache keys, metadata and release notes', () => {
  assert.match(version, /^\d+\.\d+\.\d+$/);
  assert.ok(html.includes(`name="application-version" content="${version}"`));
  for (const asset of ['styles.css', 'script.js']) assert.ok(html.includes(`${asset}?v=${version}`));
  assert.ok(existsSync(new URL(`./releases/v${version}.md`, import.meta.url)));
});

test('every rendered translation key exists in both languages', () => {
  const match = js.match(/const I18N = (\{[\s\S]*?\n  \});/);
  assert.ok(match);
  const dict = vm.runInNewContext(`(${match[1]})`);
  assert.deepEqual(Object.keys(dict.en).sort(), Object.keys(dict.es).sort());
  for (const [, key] of (html + planning).matchAll(/data-i18n="([^"]+)"/g)) {
    for (const language of ['en', 'es']) assert.ok(dict[language][key]?.trim(), `${language}: ${key}`);
  }
});

test('referenced local images, scripts and styles exist', () => {
  for (const [, path] of (html + planning).matchAll(/(?:src|href)="((?:assets\/|script\.js|styles\.css)[^"]+)"/g)) {
    assert.ok(existsSync(new URL('../' + path.split('?')[0], import.meta.url)), path);
  }
});

test('release tags depend on passing review and are restricted to main', () => {
  const workflow = read('.github/workflows/quality-and-release.yml');
  assert.match(workflow, /needs: \[review, review-v14\]/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /git tag -a/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /test .*git rev-list -n 1/);
});


test('versions increase numerically and reject reused or malformed versions', async () => {
  const { isNewerVersion } = await import('../scripts/check-version.mjs');
  for (const [next, previous] of [['1.0.1', '1.0.0'], ['1.1.0', '1.0.9'], ['1.10.0', '1.9.9'], ['2.0.0', '1.99.99']]) assert.ok(isNewerVersion(next, previous));
  for (const [next, previous] of [['1.0.0', '1.0.0'], ['1.9.0', '1.10.0'], ['0.9.9', '1.0.0'], ['01.1.0', '1.0.0'], ['1.1', '1.0.0']]) assert.equal(isNewerVersion(next, previous), false);
});

test('all IDs remain unique for labels, native navigation and selected summaries', () => {
  const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(ids.includes(target), target);
});

test('the internal planning page has the same version and unique real IDs', () => {
  assert.ok(planning.includes(`name="application-version" content="${version}"`));
  for (const asset of ['styles.css', 'script.js']) assert.ok(planning.includes(`${asset}?v=${version}`));
  const ids = Array.from(planning.matchAll(/\sid="([^"]+)"/g), m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of planning.matchAll(/\bfor="([^"]+)"/g)) assert.ok(ids.includes(target), target);
});

test('all public information remains in nine native chapters and forms have a separate route', () => {
  for (const id of ['hero', 'history', 'visit', 'events', 'alcazar', 'rentals', 'gallery', 'team', 'planning']) {
    assert.match(html, new RegExp(`<article id="${id}"[^>]*data-scene-copy=`));
  }
  assert.equal((html.match(/class="chapter-more"/g) || []).length, 7);
  assert.equal((html.match(/class="occasion"/g) || []).length, 10);
  assert.equal((html.match(/class="brand-card[^"]*"/g) || []).length, 7);
  assert.equal((html.match(/class="team-card reveal"/g) || []).length, 2);
  assert.equal(html.includes('<form'), false);
  for (const id of ['quote-form', 'vendor-form']) assert.ok(planning.includes(`id="${id}"`));
  assert.ok(html.includes('href="planning.html"'));
});
