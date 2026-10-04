import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');
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
  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
    for (const language of ['en', 'es']) assert.ok(dict[language][key]?.trim(), `${language}: ${key}`);
  }
});

test('referenced local images, scripts and styles exist', () => {
  for (const [, path] of html.matchAll(/(?:src|href)="((?:assets\/|script\.js|styles\.css)[^"]+)"/g)) {
    assert.ok(existsSync(new URL('../' + path.split('?')[0], import.meta.url)), path);
  }
});

test('release tags depend on passing review and are restricted to main', () => {
  const workflow = read('.github/workflows/quality-and-release.yml');
  assert.match(workflow, /needs: review/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /git tag -a/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /test .*git rev-list -n 1/);
});
