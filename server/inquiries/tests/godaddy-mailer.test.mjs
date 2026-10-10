import test from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail } from '../godaddy-email.mjs';
import { createGoDaddyMailer } from '../godaddy-mailer.mjs';
import { BUSINESS_MAILBOX } from '../graph.mjs';

test('GoDaddy mail requires the configured business recipient and never accepts a caller sender or destination', async () => {
  for (const env of [{}, { CONTACT_FORM_RECIPIENT_EMAIL: 'another@example.com' }]) {
    const mailer = createGoDaddyMailer(env, () => { throw new Error('must not send'); });
    assert.equal(mailer.configured, false);
    await assert.rejects(mailer.send('fake-reference', {}), { code: 'mail_not_configured' });
  }
  let sent;
  const mailer = createGoDaddyMailer({ CONTACT_FORM_RECIPIENT_EMAIL: BUSINESS_MAILBOX }, async payload => { sent = payload; });
  await mailer.send('LJ-fake', { kind: 'quote', name: 'Fake visitor', email: 'fake@example.com', to: 'attacker@example.com', from: 'forged@example.com' });
  assert.equal(sent.to, BUSINESS_MAILBOX); assert.equal(sent.replyTo, 'fake@example.com');
  assert.equal(sent.from, undefined); assert.equal(sent.cc, undefined); assert.equal(sent.html, undefined);
  assert.match(sent.text, /not a confirmed appointment/);
});

test('GoDaddy gateway errors are sanitized and delivery uncertainty cannot be blindly retried', async () => {
  const mailer = createGoDaddyMailer({ CONTACT_FORM_RECIPIENT_EMAIL: BUSINESS_MAILBOX }, async () => { throw new Error('PRIVATE_PROVIDER_BODY_AND_DOMAIN_LIST'); });
  await assert.rejects(mailer.send('LJ-fake', { email: 'fake@example.com' }), error => error.uncertain === true && error.message === 'mail_delivery_unknown');
});

test('documented helper uses only the fixed loopback gateway and requires an accepted message id', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:2525/api/email/send');
    assert.equal(options.method, 'POST'); assert.equal(options.signal instanceof AbortSignal, true);
    assert.deepEqual(JSON.parse(options.body), { to: [BUSINESS_MAILBOX], subject: 'fake test', text: 'Fake content' });
    return new Response(JSON.stringify({ success: true, messageId: 'fake-id' }), { status: 200 });
  });
  assert.deepEqual(await sendEmail({ to: BUSINESS_MAILBOX, subject: 'fake test', text: 'Fake content' }), { messageId: 'fake-id' });
});

for (const [name, body] of [['missing message id', '{"success":true}'], ['not JSON', 'not JSON'], ['provider rejection', '{"success":false,"error":"fake rejection"}']]) {
  test(`documented helper rejects ${name}`, async t => {
    t.mock.method(globalThis, 'fetch', async () => new Response(body, { status: 200 }));
    await assert.rejects(sendEmail({ to: BUSINESS_MAILBOX, subject: 'fake', text: 'fake' }));
  });
}
