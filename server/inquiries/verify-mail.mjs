// Operator-only test. Never exposed as an HTTP route or run by CI with real mail.
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, chmodSync } from 'node:fs';
import { BUSINESS_MAILBOX, createGraphMailer } from './graph.mjs';
import { openStore } from './store.mjs';
import { createInquiryService } from './service.mjs';

export function validTestArguments(args) {
  return args.length === 2 && args[0] === '--send-technical-test'
    && /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(args[1]);
}

export async function runTechnicalTest({ args, store, mailer, origin, rateSecret }) {
  if (!validTestArguments(args)) return { success:false, code:'explicit_test_flag_and_uuid_required' };
  const markedMailer = { configured:mailer.configured,
    send:(reference,inquiry)=>mailer.send('PRUEBA TECNICA — NO ES UNA CONSULTA NI RESERVA — ' + reference,inquiry) };
  const handle = createInquiryService({ store, mailer:markedMailer, origins:[origin], rateSecret });
  const response = await handle(new Request('http://localhost/api/inquiries', {
    method:'POST', headers:{ Origin:origin, 'Content-Type':'application/json', 'Idempotency-Key':args[1] },
    body:JSON.stringify({kind:'vendor',name:'PRUEBA TECNICA — La Jolla',email:BUSINESS_MAILBOX,
      company:'La Jolla — prueba interna',service:'Verificacion del correo. No es una consulta, cita ni reserva. No contactar a clientes.'})
  }), 'operator-technical-test');
  return { ...await response.json(), inboxReceiptVerified:false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let store;
  try {
    const args = process.argv.slice(2);
    if (!validTestArguments(args)) throw new Error('test_usage');
    const mailer = createGraphMailer({tenantId:process.env.MICROSOFT_TENANT_ID,
      clientId:process.env.MICROSOFT_CLIENT_ID,clientSecret:process.env.MICROSOFT_CLIENT_SECRET});
    const rateSecret = process.env.INQUIRY_RATE_SECRET;
    // Require persistent storage so repeating the same test key cannot resend accepted mail.
    if (!mailer.configured || !rateSecret || rateSecret.length < 32 || !process.env.INQUIRY_DATABASE
      || process.env.INQUIRY_DATABASE === ':memory:') throw new Error('test_not_configured');
    const path = resolve(process.env.INQUIRY_DATABASE);
    mkdirSync(dirname(path),{recursive:true,mode:0o700});
    store = openStore(path); chmodSync(path,0o600);
    const result = await runTechnicalTest({args,store,mailer,rateSecret,
      origin:(process.env.INQUIRY_ALLOWED_ORIGINS || 'https://jolla.peluzzza.com').split(',')[0].trim()});
    console.log(JSON.stringify(result)); process.exitCode = result.success ? 0 : 1;
  } catch {
    // Never echo environment variables, provider responses or exception details.
    console.error('Technical test not run or could not be verified. Check private configuration. Usage: verify-mail.mjs --send-technical-test <UUID>; reuse the same UUID and database on retry.');
    process.exitCode = 1;
  } finally { store?.close(); }
}
