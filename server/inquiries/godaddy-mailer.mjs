import { sendEmail } from './godaddy-email.mjs';
import { BUSINESS_MAILBOX, MailFailure } from './graph.mjs';

export function createGoDaddyMailer(env = process.env, send = sendEmail) {
  const recipient = env.CONTACT_FORM_RECIPIENT_EMAIL;
  const configured = typeof recipient === 'string' && recipient.toLowerCase() === BUSINESS_MAILBOX;
  return { configured,
    async send(reference, inquiry) {
      if (!configured) throw new MailFailure('mail_not_configured');
      const text = ['La Jolla inquiry — ' + reference,
        'This is a request, not a confirmed appointment or event reservation.', '',
        ...Object.entries(inquiry).map(([key, value]) => key + ': ' + value)].join('\n');
      try {
        await send({ to: recipient, replyTo: inquiry.email,
          subject: `La Jolla ${inquiry.kind === 'vendor' ? 'vendor note' : 'inquiry'} — ${reference}`, text });
        // Gateway acceptance alone does not prove delivery to the inbox.
      } catch {
        // The helper intentionally exposes no retry contract. A lost response
        // can follow delivery; keep the saved request for owner reconciliation.
        throw new MailFailure('mail_delivery_unknown', { uncertain: true });
      }
    }
  };
}
