import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = new Set(['index.html', 'planning.html', 'terms.html', 'privacy.html', 'styles.css', 'script.js']);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.ico':'image/x-icon', '.mp4':'video/mp4', '.webm':'video/webm', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf' };
const mailEnabled = process.env.INQUIRY_ENABLED === 'true';
// Preview startup needs no Microsoft credential, database or outbound connection.
let inquiry;
if (mailEnabled) {
  if (!process.env.INQUIRY_DATABASE || !process.env.INQUIRY_RATE_SECRET || process.env.INQUIRY_RATE_SECRET.length < 32
      || !process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    throw new Error('Inquiry activation requires private credentials, a rate secret and an explicitly configured persistent database.');
  }
  const { createInquiryRuntime } = await import('./inquiries/http.mjs');
  inquiry = createInquiryRuntime();
}
const json = (req, res, status, value) => {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Content-Length':Buffer.byteLength(body) });
  res.end(req.method === 'HEAD' ? undefined : body);
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/healthz' && ['GET', 'HEAD'].includes(req.method)) return json(req,res,200,{ status:'ok', mailEnabled });
    if (pathname === '/api/inquiries') {
      if (!mailEnabled) return json(req,res,503,{ success:false, code:'service_not_enabled' });
      // The API adapter validates the exact route, size, origin and idempotency.
      return await inquiry.handle(req,res);
    }
    if (!['GET', 'HEAD'].includes(req.method)) return json(req,res,405,{ success:false, code:'method_not_allowed' });
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const extension = extname(relative).toLowerCase();
    const asset = relative.startsWith('assets/') && !!mime[extension] && !relative.split('/').some(part=>part.startsWith('.'));
    if ((!pages.has(relative) && !asset) || relative.includes('\0') || relative.includes('\\')) return json(req,res,404,{ success:false, code:'not_found' });
    const file = await realpath(resolve(root,relative));
    if (asset && !file.startsWith(resolve(root,'assets') + sep)) return json(req,res,404,{ success:false, code:'not_found' });
    const info = await stat(file);
    if (!info.isFile()) return json(req,res,404,{ success:false, code:'not_found' });
    let start = 0; let end = info.size - 1; let status = 200;
    // Video seeking is required by the approved scroll-controlled films.
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) {
        res.writeHead(416,{'Content-Range':`bytes */${info.size}`}); return res.end();
      }
      if (!match[1]) start = Math.max(0,info.size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(end,Number(match[2])); }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= info.size) {
        res.writeHead(416,{'Content-Range':`bytes */${info.size}`}); return res.end();
      }
      status = 206;
    }
    const headers = { 'Content-Type':mime[extension], 'Content-Length':end - start + 1, 'Accept-Ranges':'bytes',
      'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff', ...(status === 206 ? { 'Content-Range':`bytes ${start}-${end}/${info.size}` } : {}) };
    res.writeHead(status,headers);
    if (req.method === 'HEAD' || info.size === 0) return res.end();
    createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
  } catch {
    if (!res.headersSent) json(req,res,404,{ success:false, code:'not_found' });
    else res.destroy();
  }
});
server.requestTimeout = 15000; server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 3000),process.env.HOST || '0.0.0.0',()=>console.log(`La Jolla web server listening on port ${server.address().port}; mail ${mailEnabled ? 'enabled' : 'disabled'}.`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{inquiry?.close();process.exit(0);}));
