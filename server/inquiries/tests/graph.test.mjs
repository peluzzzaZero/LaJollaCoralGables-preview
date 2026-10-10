import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESS_MAILBOX, createGraphMailer } from '../graph.mjs';
const config={tenantId:'11111111-1111-4111-8111-111111111111',clientId:'22222222-2222-4222-8222-222222222222',clientSecret:'test-only-private-app-secret'};
const inquiry={kind:'quote',name:'Visitor',email:'visitor@example.com',comments:'line 1\nline 2'};
const token=()=>Response.json({access_token:'test-only-token',expires_in:3600});

test('mail targets only the business mailbox; visitor address is reply-to, not recipient/sender',async()=>{
 const calls=[];const mailer=createGraphMailer(config,async(url,options)=>{calls.push({url,options});return calls.length===1?token():new Response(null,{status:202});});
 await mailer.send('LJ-test',inquiry);const body=JSON.parse(calls[1].options.body);
 assert.equal(calls[0].url,`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`);
 assert.equal(new URLSearchParams(calls[0].options.body).get('grant_type'),'client_credentials');
 assert.equal(calls[1].url,`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(BUSINESS_MAILBOX)}/sendMail`);
 assert.deepEqual(body.message.toRecipients,[{emailAddress:{address:BUSINESS_MAILBOX}}]);
 assert.equal(body.message.replyTo[0].emailAddress.address,inquiry.email);assert.equal(body.saveToSentItems,true);assert.equal(body.message.body.contentType,'Text');assert.ok(body.message.body.content.includes('not a confirmed appointment'));
 assert.equal(body.message.ccRecipients,undefined);assert.equal(body.message.from,undefined);
});

test('token acquisition is shared across concurrent sends and cached before expiry',async()=>{
 let tokens=0,messages=0;const mailer=createGraphMailer(config,async(url)=>{if(url.includes('/token')){tokens++;await new Promise(r=>setTimeout(r,10));return token();}messages++;return new Response(null,{status:202});});
 await Promise.all([mailer.send('a',inquiry),mailer.send('b',inquiry)]);await mailer.send('c',inquiry);assert.equal(tokens,1);assert.equal(messages,3);
});

test('missing configuration never attempts a network request',async()=>{
 let requests=0;const mailer=createGraphMailer({},async()=>{requests++;});assert.equal(mailer.configured,false);await assert.rejects(mailer.send('a',inquiry),{code:'mail_not_configured'});assert.equal(requests,0);
});

test('only Graph 202 is accepted; unknown delivery is not automatically replayed',async()=>{
 for(const mode of ['network',500,200,400,429]){
 let messages=0;const mailer=createGraphMailer(config,async(url)=>{if(url.includes('/token'))return token();messages++;if(mode==='network')throw new Error('private token data');return new Response('provider echo contains private token data',{status:mode,headers:{'Retry-After':'120'}});});
 await assert.rejects(mailer.send('a',inquiry),error=>{
 assert.equal(error.message.includes('private token'),false);assert.equal(error.uncertain,mode==='network'||mode===500);if(mode===429)assert.equal(error.retryAfter,120);return true;
 });assert.equal(messages,1);
 }
});

test('authentication errors expose no provider body and refresh only on a later explicit attempt',async()=>{
 let tokens=0,messages=0;const mailer=createGraphMailer(config,async(url)=>{if(url.includes('/token')){tokens++;return token();}messages++;return new Response('sensitive provider data',{status:401});});
 await assert.rejects(mailer.send('a',inquiry),{code:'mail_rejected'});assert.equal(messages,1);
 await assert.rejects(mailer.send('a',inquiry));assert.equal(tokens,2);assert.equal(messages,2);
 const rejected=createGraphMailer(config,async()=>new Response('sensitive provider data',{status:403}));await assert.rejects(rejected.send('a',inquiry),{code:'mail_authorization_failed'});
});
