import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../store.mjs';

// Isolated fake records; no business credentials or real provider requests.
test('durable SQLite records survive restarting the store',()=>{
 const directory=mkdtempSync(join(tmpdir(),'lajolla-store-test-'));let store;
 try{
 const path=join(directory,'test.sqlite');store=openStore(path);const row=store.create('key','hash',{name:'Fake contact'},1);store.settle('key','accepted');store.close();store=openStore(path);assert.equal(store.get('key').reference,row.reference);assert.equal(store.get('key').state,'accepted');
 }finally{store?.close();rmSync(directory,{recursive:true,force:true});}
});

test('HTTP runtime serves only the inquiry API and rejects unconfigured delivery',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'lajolla-http-test-'));
 const child=spawn(process.execPath,[new URL('../index.mjs',import.meta.url).pathname],{env:{...process.env,PORT:'0',INQUIRY_BIND:'127.0.0.1',INQUIRY_DATABASE:join(directory,'test.sqlite'),MICROSOFT_TENANT_ID:'',MICROSOFT_CLIENT_ID:'',MICROSOFT_CLIENT_SECRET:'',INQUIRY_RATE_SECRET:'',INQUIRY_ALLOWED_ORIGINS:'https://jolla.peluzzza.com'},stdio:['ignore','pipe','pipe']});
 try{
 const port=await new Promise((resolve,reject)=>{
 let output='';const timer=setTimeout(()=>reject(new Error('Server did not start')),10000);child.on('error',reject);child.stdout.on('data',chunk=>{output+=chunk.toString();const match=output.match(/port (\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});child.on('exit',()=>{clearTimeout(timer);reject(new Error('Server exited before startup'));});
 });
 const base=`http://127.0.0.1:${port}`;
 for(const path of ['/','/.env','/private-data/inquiries.sqlite','/api/inquiries/anything'])assert.equal((await fetch(base+path)).status,404);
 const r=await fetch(base+'/api/inquiries',{method:'POST',headers:{Origin:'https://jolla.peluzzza.com','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503);assert.deepEqual(await r.json(),{success:false,code:'service_not_configured'});
 const preflight=await fetch(base+'/api/inquiries',{method:'OPTIONS',headers:{Origin:'https://jolla.peluzzza.com'}});assert.equal(preflight.status,200);
 const disallowed=await fetch(base+'/api/inquiries',{method:'OPTIONS',headers:{Origin:'https://other.example'}});assert.equal(disallowed.status,403);assert.equal(disallowed.headers.has('Access-Control-Allow-Origin'),false);
 }finally{child.kill('SIGTERM');if(child.exitCode===null)await once(child,'exit');rmSync(directory,{recursive:true,force:true});}
});
