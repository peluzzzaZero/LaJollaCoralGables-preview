import { createGraphMailer } from './graph.mjs';
import { openInquiryStorage } from './storage.mjs';
import { createInquiryService } from './service.mjs';

export async function createInquiryRuntime({ mailer: suppliedMailer, storage: suppliedStorage, rateSecret: suppliedRateSecret, origins: suppliedOrigins } = {}) {
  const storage = suppliedStorage || await openInquiryStorage();
  const store = storage.store;
  const mailer = suppliedMailer || createGraphMailer({ tenantId:process.env.MICROSOFT_TENANT_ID,
    clientId:process.env.MICROSOFT_CLIENT_ID, clientSecret:process.env.MICROSOFT_CLIENT_SECRET });
  const handle = createInquiryService({ store, mailer,
    origins:suppliedOrigins || (process.env.INQUIRY_ALLOWED_ORIGINS || 'https://jolla.peluzzza.com').split(',').map(s=>s.trim()),
    rateSecret:suppliedRateSecret || process.env.INQUIRY_RATE_SECRET });

  const handleHttp = async (req,res) => {
    const send = (status,code) => { res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify({success:false,code})); };
    if (req.url !== '/api/inquiries') return send(404,'not_found');
    let body = []; let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) { send(413,'request_too_large'); return; }
        body.push(chunk);
      }
      const headers = new Headers();
      for (const [key,value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key,value);
      const request = new Request('http://localhost/api/inquiries',{ method:req.method, headers,
        ...(!['GET','HEAD'].includes(req.method) ? { body:Buffer.concat(body) } : {}) });
      // Origin headers are not visitor authentication. Never trust forwarded IPs
      // unless the documented loopback reverse proxy replaces X-Real-IP itself.
      const remote = req.socket.remoteAddress || 'unknown';
      const loopback = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote);
      const ip = process.env.INQUIRY_TRUST_LOOPBACK_PROXY === 'true' && loopback ? req.headers['x-real-ip'] || remote : remote;
      const result = await handle(request,String(ip));
      res.writeHead(result.status,Object.fromEntries(result.headers)); res.end(await result.text());
    } catch { if (!res.headersSent) send(503,'service_unavailable'); }
  };
  return { handle:handleHttp, close:()=>suppliedStorage ? undefined : storage.close() };
}
