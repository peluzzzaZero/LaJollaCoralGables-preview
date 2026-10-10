import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../../',import.meta.url).pathname;
test('npm start serves the web on the assigned port with native mail disabled and private files denied',async()=>{
  const dir = mkdtempSync(join(tmpdir(),'lajolla-deploy-'));
  const database = join(dir,'must-not-exist.sqlite');
  // Fake credentials prove that adding secrets alone cannot activate delivery.
  const child = spawn('npm',['start'],{cwd:root,env:{...process.env,PORT:'0',HOST:'127.0.0.1',INQUIRY_ENABLED:'false',
    INQUIRY_DATABASE:database, MICROSOFT_TENANT_ID:'fake',MICROSOFT_CLIENT_ID:'fake',MICROSOFT_CLIENT_SECRET:'FAKE-PRIVATE-VALUE',INQUIRY_RATE_SECRET:'x'.repeat(32)},stdio:['ignore','pipe','pipe'],detached:true});
  let output=''; let errors='';child.stderr.on('data',chunk=>errors+=chunk.toString());
  try {
    const port = await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('npm start timeout')),10000);
      child.stdout.on('data',chunk=>{output+=chunk.toString();const match=output.match(/port (\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});
      child.on('error',err=>{clearTimeout(timer);reject(err);});
      child.on('exit',()=>{clearTimeout(timer);reject(new Error('npm start exited'));});
    });
    const base=`http://127.0.0.1:${port}`;
    const health=await fetch(base+'/healthz'); assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok',mailEnabled:false});
    for(const path of ['/','/planning.html','/privacy.html','/terms.html','/styles.css?v=1.12.0','/script.js?v=1.12.0','/assets/vendor/gsap.min.js'])assert.equal((await fetch(base+path)).status,200,path);
    for(const path of ['/.env','/package.json','/package-lock.json','/.git/config','/server/app.mjs','/server/inquiries/.env.example','/private-data/inquiries.sqlite','/assets/%2e%2e/.env','/assets/../server/app.mjs','/%00'])assert.equal((await fetch(base+path)).status,404,path);
    const api=await fetch(base+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(api.status,503);assert.deepEqual(await api.json(),{success:false,code:'service_not_enabled'});
    assert.equal(existsSync(database),false); assert.equal(output.includes('FAKE-PRIVATE-VALUE'),false);assert.equal(errors.includes('FAKE-PRIVATE-VALUE'),false);
    const videoPath='assets/venue/cinematic/arrival.webm';
    const original=readFileSync(join(root,videoPath));
    const range=await fetch(base+'/'+videoPath,{headers:{Range:'bytes=10-29'}});assert.equal(range.status,206);assert.equal(range.headers.get('Content-Range'),`bytes 10-29/${original.length}`);assert.deepEqual(Buffer.from(await range.arrayBuffer()),original.subarray(10,30));
    const suffix=await fetch(base+'/'+videoPath,{headers:{Range:'bytes=-10'}});assert.equal(suffix.status,206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),original.subarray(-10));
    const invalid=await fetch(base+'/'+videoPath,{headers:{Range:`bytes=${original.length}-`}});assert.equal(invalid.status,416);
    const head=await fetch(base+'/'+videoPath,{method:'HEAD'});assert.equal(head.status,200);assert.equal(Number(head.headers.get('Content-Length')),original.length);assert.equal((await head.arrayBuffer()).byteLength,0);
  } finally {
    if(child.exitCode===null){process.kill(-child.pid,'SIGTERM');await once(child,'exit');}
    rmSync(dir,{recursive:true,force:true});
  }
});

test('enabling native mail without complete private configuration fails closed',async()=>{
  const child=spawn(process.execPath,['server/app.mjs'],{cwd:root,env:{...process.env,INQUIRY_ENABLED:'true',INQUIRY_DATABASE:'',MICROSOFT_CLIENT_SECRET:'',INQUIRY_RATE_SECRET:''},stdio:['ignore','pipe','pipe']});
  let output=''; child.stdout.on('data',chunk=>output+=chunk.toString());child.stderr.resume();
  const [code]=await once(child,'exit');assert.notEqual(code,0);assert.equal(output.includes('listening'),false);
});
