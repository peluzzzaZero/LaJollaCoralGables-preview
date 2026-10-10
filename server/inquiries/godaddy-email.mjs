// JavaScript version of GoDaddy's documented sendEmail helper.
// https://github.com/godaddy/nodejs-hosting-agent-skill/blob/main/skills/godaddy-nodejs-hosting/email.md
// Fixed loopback endpoint supplied by Node.js Hosting, never caller-controlled.
const EMAIL_GATEWAY_URL = 'http://127.0.0.1:2525/api/email/send';
const REQUEST_TIMEOUT_MS = 30000;

export async function sendEmail(input) {
  const payload = buildPayload(input);
  let response; let body;
  try {
    response = await fetch(EMAIL_GATEWAY_URL, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    body = await parseBody(response);
  } catch (error) { throw new Error(`email gateway unreachable: ${describeError(error)}`); }
  if (!response.ok || !body.success) {
    const detail = body.error ?? `HTTP ${response.status}`;
    const idSuffix = body.messageId ? ` (messageId=${body.messageId})` : '';
    throw new Error(`email send failed: ${detail}${idSuffix}`);
  }
  if (!body.messageId) throw new Error('email send succeeded but gateway returned no messageId');
  return { messageId: body.messageId };
}
function buildPayload(input) {
  const payload = { to: toArray(input.to), subject: input.subject };
  const cc = toArray(input.cc); if (cc.length) payload.cc = cc;
  const bcc = toArray(input.bcc); if (bcc.length) payload.bcc = bcc;
  if (input.text) payload.text = input.text;
  if (input.html) payload.html = input.html;
  if (input.replyTo) payload.replyTo = input.replyTo;
  if (input.from) payload.from = input.from;
  if (input.attachments?.length) payload.attachments = input.attachments.map(encodeAttachment);
  return payload;
}
function toArray(value) { return value === undefined ? [] : Array.isArray(value) ? value : [value]; }
function encodeAttachment(attachment) {
  const result = { filename: attachment.filename, content: Buffer.from(attachment.content).toString('base64') };
  if (attachment.contentType) result.contentType = attachment.contentType;
  return result;
}
async function parseBody(response) {
  try { return await response.json(); }
  catch (error) {
    if (isAbortLike(error)) throw error;
    return { success: false, error: `non-JSON response (HTTP ${response.status})` };
  }
}
function isAbortLike(error) { return error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name); }
function describeError(error) {
  return error instanceof Error ? isAbortLike(error) ? `timed out after ${REQUEST_TIMEOUT_MS}ms` : error.message : String(error);
}
