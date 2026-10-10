import { createHash } from 'node:crypto';
import { MailFailure } from './graph.mjs';

const SERVICES = new Set(['planning','catering','florals','furniture','photo','entertainment','av','builds','interactive','staff']);
const TYPES = new Set(['wedding','quince','social','corporate','brand','production','film','gala','dining','alcazar','rental','other']);
const LOCATIONS = new Set(['','la-jolla','south-florida','exploring']);
const quoteFields = ['name','email','phone','eventDate','guestCount','eventType','eventLocation','selectedServices','selectedServiceIds','rentalInterest','comments'];
const vendorFields = ['name','email','company','service'];
const hash = value => createHash('sha256').update(value).digest('hex');

export function validateInquiry(raw) {
  if (!raw || Array.isArray(raw) || typeof raw !== 'object' || !['quote','vendor'].includes(raw.kind)) throw new Error('invalid_inquiry');
  const fields = raw.kind === 'quote' ? quoteFields : vendorFields;
  if (Object.keys(raw).some(key => ![...fields, 'kind', 'botcheck'].includes(key)) || raw.botcheck) throw new Error('invalid_inquiry');
  const value = { kind: raw.kind };
  for (const field of fields) {
    if (raw[field] !== undefined && typeof raw[field] !== 'string') throw new Error('invalid_inquiry');
    value[field] = (raw[field] || '').trim();
    if (value[field].length > (['comments','rentalInterest','selectedServices'].includes(field) ? 4000 : 320)) throw new Error('invalid_inquiry');
  }
  if (!value.name || /[\r\n\x00-\x1f]/.test(value.name)) throw new Error('invalid_inquiry');
  if (!/^[^\s<>@,;\x00-\x1f]+@[^\s<>@,;\x00-\x1f]+\.[^\s<>@,;\x00-\x1f]+$/.test(value.email)) throw new Error('invalid_inquiry');
  if (raw.kind === 'quote') {
    if (!value.phone || /[\r\n\x00-\x1f]/.test(value.phone)) throw new Error('invalid_inquiry');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.eventDate) || Number.isNaN(Date.parse(value.eventDate))
      || new Date(value.eventDate).toISOString().slice(0,10) !== value.eventDate) throw new Error('invalid_inquiry');
    if (!/^\d+$/.test(value.guestCount) || Number(value.guestCount) < 1 || Number(value.guestCount) > 500
      || !TYPES.has(value.eventType) || !LOCATIONS.has(value.eventLocation)) throw new Error('invalid_inquiry');
    const ids = value.selectedServiceIds ? value.selectedServiceIds.split(',') : [];
    if (ids.some(id => !SERVICES.has(id)) || new Set(ids).size !== ids.length) throw new Error('invalid_inquiry');
  } else if (!value.company || !value.service) throw new Error('invalid_inquiry');
  return value;
}

export function createInquiryService({ store, mailer, origins, rateSecret, now = Date.now }) {
  const allowed = new Set(origins);
  const response = (status, body, origin, retryAfter) => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'Vary':'Origin',
      ...(allowed.has(origin) ? { 'Access-Control-Allow-Origin':origin, 'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type, Idempotency-Key' } : {}),
      ...(retryAfter ? { 'Retry-After':String(retryAfter) } : {}) }
  });
  return async function handle(request, remoteIp) {
    const origin = request.headers.get('Origin');
    if (!allowed.has(origin)) return response(403, { success:false, code:'origin_not_allowed' });
    if (request.method === 'OPTIONS') return response(200, {}, origin);
    if (request.method !== 'POST') return response(405, { success:false, code:'method_not_allowed' }, origin);
    if (!mailer.configured || !rateSecret || rateSecret.length < 32) return response(503, { success:false, code:'service_not_configured' }, origin);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return response(415, { success:false, code:'json_required' }, origin);
    const key = request.headers.get('Idempotency-Key') || '';
    if (!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(key)) return response(400, { success:false, code:'idempotency_key_required' }, origin);
    let inquiry;
    try {
      // The HTTP adapter also enforces the byte limit before buffering a request.
      const body = await request.text();
      if (new TextEncoder().encode(body).length > 16384) return response(413, { success:false, code:'request_too_large' }, origin);
      inquiry = validateInquiry(JSON.parse(body));
    } catch { return response(400, { success:false, code:'invalid_inquiry' }, origin); }
    const fingerprint = hash(JSON.stringify(inquiry));
    const time = now();
    try {
      let row = await store.get(key);
      if (row && row.fingerprint !== fingerprint) return response(409, { success:false, code:'idempotency_conflict' }, origin);
      if (row?.state === 'accepted') return response(200, { success:true, reference:row.reference, mailStatus:'accepted', bookingConfirmed:false }, origin);
      if (row && ['sending','uncertain'].includes(row.state)) return response(409, { success:false, reference:row.reference, code:'delivery_requires_review' }, origin);
      if (row && row.next_attempt_at > time) return response(429, { success:false, reference:row.reference, code:'retry_later' }, origin, Math.ceil((row.next_attempt_at-time)/1000));
      // Per-IP and global protection: technical throughput ceilings, never billing quotas.
      for (const [bucket, limit, windowMs] of [
        [hash(rateSecret + ':' + remoteIp),10,600000], ['global-mail',25,60000]
      ]) {
        const rate = await store.rate(bucket, time, limit, windowMs);
        if (!rate.allowed) return response(429, { success:false, code:'rate_limited' }, origin, rate.retryAfter);
      }
      row = await store.create(key, fingerprint, inquiry, time);
      if (row.fingerprint !== fingerprint) return response(409, { success:false, code:'idempotency_conflict' }, origin);
      if (!await store.claim(key, time)) return response(409, { success:false, reference:row.reference, code:'delivery_requires_review' }, origin);
      try {
        await mailer.send(row.reference, inquiry);
        await store.settle(key,'accepted');
        await store.purge(time);
        return response(200, { success:true, reference:row.reference, mailStatus:'accepted', bookingConfirmed:false }, origin);
      } catch (error) {
        const known = error instanceof MailFailure;
        const uncertain = !known || error.uncertain;
        const delay = known ? error.retryAfter : 60;
        await store.settle(key, uncertain ? 'uncertain' : 'retryable', time + delay*1000);
        return response(503, { success:false, reference:row.reference, code:uncertain ? 'delivery_requires_review' : 'delivery_unavailable' }, origin, delay);
      }
    } catch {
      // Includes storage failures after provider acceptance. The row remains in-flight
      // and must be reconciled; no automatic resend or false success.
      return response(503, { success:false, code:'service_unavailable' }, origin);
    }
  };
}
