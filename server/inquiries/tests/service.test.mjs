import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openStore } from '../store.mjs';
import { createInquiryService, validateInquiry } from '../service.mjs';
import { MailFailure } from '../graph.mjs';

const origin='https://jolla.peluzzza.com';
const quote={kind:'quote',name:'Visitor',email:'visitor@example.com',phone:'+13055550100',eventDate:'2027-02-15',guestCount:'40',eventType:'other',eventLocation:'exploring',selectedServiceIds:'planning,florals',selectedServices:'Planning; floral design',rentalInterest:'Details & preferences',comments:'A request, not a reservation.'};
function fixture(send=async()=>{}) {
 const store=openStore(':memory:'); const sent=[]; let time=1000000;
 const mailer={configured:true,async send(...args){sent.push(args);await send(...args);}};
 const handle=createInquiryService({store,mailer,origins:[origin],rateSecret:'test-only-private-rate-value-at-least-32',now:()=>time});
 return {store,sent,mailer,advance(ms){time+=ms;},call(raw=quote,key=randomUUID(),headers={},method='POST'){
   return handle(new Request('https://backend.example/api/inquiries',{method,headers:{Origin:origin,'Content-Type':'application/json','Idempotency-Key':key,...headers},...(!['GET','HEAD'].includes(method)?{body:typeof raw==='string'?raw:JSON.stringify(raw)}:{})}),'192.0.2.1');
 }};
}

test('durably stores the full inquiry before sending; success is not a booking',async()=>{
 const f=fixture(async(reference,body)=>{assert.equal(f.store.get(key).state,'sending');assert.equal(body.comments,quote.comments);assert.ok(reference.startsWith('LJ-'));});
 const key=randomUUID();try{const r=await f.call(quote,key);assert.equal(r.status,200);const body=await r.json();assert.equal(body.success,true);assert.equal(body.bookingConfirmed,false);assert.equal(body.mailStatus,'accepted');assert.equal(f.store.get(key).state,'accepted');assert.equal(f.sent.length,1);}finally{f.store.close();}
});

test('identical replay sends no second mail; reuse for different data is rejected',async()=>{
 const f=fixture(); const key=randomUUID();try{
 const a=await (await f.call(quote,key)).json();const b=await (await f.call(quote,key)).json();assert.equal(a.reference,b.reference);assert.equal(f.sent.length,1);
 assert.equal((await f.call({...quote,comments:'Changed'},key)).status,409);assert.equal(f.sent.length,1);
 }finally{f.store.close();}
});

test('two concurrent submissions cannot send the same inquiry twice',async()=>{
 let release;const pending=new Promise(resolve=>{release=resolve;});const f=fixture(()=>pending);const key=randomUUID();try{
 const first=f.call(quote,key);await new Promise(resolve=>setImmediate(resolve));const second=await f.call(quote,key);assert.equal(second.status,409);release();assert.equal((await first).status,200);assert.equal(f.sent.length,1);
 }finally{f.store.close();}
});

test('unknown delivery is saved for review and is never automatically replayed',async()=>{
 const f=fixture(async()=>{throw new MailFailure('mail_delivery_unknown',{uncertain:true});});const key=randomUUID();try{
 const r=await f.call(quote,key);assert.equal(r.status,503);assert.equal((await r.json()).success,false);assert.equal(f.store.get(key).state,'uncertain');f.advance(3600000);assert.equal((await f.call(quote,key)).status,409);assert.equal(f.sent.length,1);
 }finally{f.store.close();}
});

test('known temporary rejection respects retry timing and retains the inquiry',async()=>{
 let fail=true;const f=fixture(async()=>{if(fail)throw new MailFailure('mail_throttled',{retryAfter:120});});const key=randomUUID();try{
 assert.equal((await f.call(quote,key)).status,503);assert.equal(f.store.get(key).state,'retryable');assert.equal((await f.call(quote,key)).status,429);assert.equal(f.sent.length,1);f.advance(120001);fail=false;assert.equal((await f.call(quote,key)).status,200);assert.equal(f.sent.length,2);
 }finally{f.store.close();}
});

test('unclassified transport exceptions reveal no personal data or false success',async()=>{
 const f=fixture(async()=>{throw new Error('access_token-secret visitor@example.com');});try{
 const r=await f.call();const body=await r.text();assert.equal(r.status,503);assert.equal(body.includes('visitor@example.com'),false);assert.equal(body.includes('access_token-secret'),false);
 }finally{f.store.close();}
});

test('server fails closed until private credentials are configured',async()=>{
 const f=fixture();f.mailer.configured=false;try{assert.equal((await f.call()).status,503);assert.equal(f.sent.length,0);}finally{f.store.close();}
});

test('disallowed origins, methods, missing request keys and malformed bodies cannot send',async()=>{
 const f=fixture();try{
 for(const [raw,key,headers,method,status] of [
 [quote,randomUUID(),{Origin:'https://other.example'},'POST',403],
 [quote,randomUUID(),{Origin:''},'POST',403],
 [quote,randomUUID(),{},'GET',405],
 [quote,'invalid-key',{},'POST',400],
 [quote,randomUUID(),{'Content-Type':'text/plain'},'POST',415],
 ['{broken',randomUUID(),{},'POST',400],
 ['x'.repeat(16385),randomUUID(),{},'POST',413]
 ])assert.equal((await f.call(raw,key,headers,method)).status,status);
 assert.equal(f.sent.length,0);const preflight=await f.call('',randomUUID(),{},'OPTIONS');assert.equal(preflight.status,200);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
 }finally{f.store.close();}
});

test('honeypot, relay targets, HTML/header injection, bad dates and unknown services are rejected',()=>{
 for(const bad of [null,[],{...quote,botcheck:'yes'},{...quote,to:'other@example.com'},{...quote,ccemail:'other@example.com'},
 {...quote,name:'Person\r\nBcc: victim@example.com'},{...quote,email:'person@example.com\r\nBcc: x@y.com'},
 {...quote,eventDate:'2027-02-30'},{...quote,eventDate:'2027-02-15<script>'},{...quote,guestCount:'0'},
 {...quote,eventLocation:'unknown'},{...quote,selectedServiceIds:'unknown'},{...quote,selectedServiceIds:'planning,planning'},
 {...quote,comments:'x'.repeat(4001)},{...quote,comments:{private:'nested'}}])assert.throws(()=>validateInquiry(bad));
 assert.equal(validateInquiry({...quote,comments:'<script>safe plain text in email body</script>'}).comments.includes('<script>'),true);
});

test('vendor data follows the same fixed-recipient and deduplication path',async()=>{
 const f=fixture();const key=randomUUID();try{
 const vendor={kind:'vendor',name:'Vendor',email:'vendor@example.com',company:'Studio',service:'Florals'};
 assert.equal((await f.call(vendor,key)).status,200);assert.equal((await f.call(vendor,key)).status,200);assert.equal(f.sent.length,1);assert.deepEqual(f.sent[0][1],vendor);
 }finally{f.store.close();}
});

test('rate protection blocks bursts, not a monthly 250-submission quota',async()=>{
 const f=fixture();try{
 for(let i=0;i<10;i++)assert.equal((await f.call()).status,200);
 assert.equal((await f.call()).status,429);assert.equal(f.sent.length,10);
 for(let i=0;i<260;i++){f.advance(600001);assert.equal((await f.call()).status,200);}
 assert.equal(f.sent.length,270);
 }finally{f.store.close();}
});

test('retention deletes old accepted records but preserves uncertain inquiries for reconciliation',()=>{
 const store=openStore(':memory:');try{
 const accepted=randomUUID(),uncertain=randomUUID();store.create(accepted,'a',quote,1);store.create(uncertain,'b',quote,1);store.settle(accepted,'accepted');store.settle(uncertain,'uncertain');store.purge(31*86400000);assert.equal(store.get(accepted),undefined);assert.equal(store.get(uncertain).state,'uncertain');
 }finally{store.close();}
});
