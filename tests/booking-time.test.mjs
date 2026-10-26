import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const js = read('script.js');
const pages = ['index.html', 'planning.html', 'privacy.html', 'terms.html'];
const address = '301 Alcazar Avenue, Coral Gables, FL 33134';

// Tours happen in Coral Gables; the Bookings calendar may show the visitor's own zone.
test('booking help names the address and Florida (Eastern) time in both languages', () => {
  const help = language => js.match(new RegExp(`"booking\\.help": "([^"]+)"`, 'g'))[language === 'en' ? 0 : 1];
  assert.ok(help('en').includes(address) && /Florida time \(Eastern Time\)/.test(help('en')));
  assert.ok(help('es').includes(address) && /hora de Florida \(hora del Este\)/.test(help('es')));
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /id="booking-help"[^>]*>Tours take place at the house, 301 Alcazar Avenue, Coral Gables, FL 33134\. Times are Florida time/, page);
  }
});

test('footer map links and structured data carry the full address', () => {
  for (const page of ['index.html', 'planning.html']) {
    const html = read(page);
    assert.ok(!html.includes('query=301+Alcazar+Avenue%2C+Coral+Gables"'), page);
    assert.equal((html.match(/query=La\+Jolla%2C\+301\+Alcazar\+Avenue%2C\+Coral\+Gables%2C\+FL\+33134&amp;query_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0/g) || []).length >= 2, true, page);
  }
  assert.match(read('index.html'), /"addressRegion": "FL",\s*"postalCode": "33134"/);
});
