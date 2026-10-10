import { createServer } from 'node:http';
import { createInquiryRuntime } from './http.mjs';
const runtime = createInquiryRuntime();
const server = createServer(runtime.handle);
server.requestTimeout = 15000; server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 8787),process.env.INQUIRY_BIND || '127.0.0.1',()=>console.log(`La Jolla inquiry service listening on port ${server.address().port}; no personal data or credentials are logged.`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{runtime.close();process.exit(0);}));
