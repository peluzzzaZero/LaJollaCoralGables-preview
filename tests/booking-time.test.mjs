import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const js = read('script.js');
const pages = ['index.html', 'planning.html', 'privacy.html', 'terms.html'];
const address = '301 Alcazar Avenue, Coral Gables, FL 33134';

// Tours happen in Coral Gables; the Bookings calendar may show the visitor's own zone.
test('booking help names the address and Florida (Eastern) time in both languages', () => {
  const dict = vm.runInNewContext(`(${js.match(/const I18N = (\{[\s\S]*?\n  \});/)[1]})`);
  const { en, es } = { en: dict.en['booking.help'], es: dict.es['booking.help'] };
  assert.ok(en.includes(address) && en.includes('Florida time (Eastern Time)'));
  assert.ok(es.includes(address) && es.includes('hora de Florida (hora del Este)'));
  for (const page of pages) assert.ok(read(page).includes(`<p id="booking-help" data-i18n="booking.help">${en}</p>`), page);
});

test('footer map links and structured data carry the full address', () => {
  assert.doesNotMatch(read('index.html'), /Coral\+Gables%2C\+FL&amp;/, 'location card links carry the ZIP');
  for (const page of ['index.html', 'planning.html']) {
    const html = read(page);
    assert.ok(!html.includes('query=301+Alcazar+Avenue%2C+Coral+Gables"'), page);
    assert.equal((html.match(/query=La\+Jolla%2C\+301\+Alcazar\+Avenue%2C\+Coral\+Gables%2C\+FL\+33134&amp;query_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0/g) || []).length >= 2, true, page);
  }
  assert.match(read('index.html'), /"addressRegion": "FL",\s*"postalCode": "33134"/);
});
