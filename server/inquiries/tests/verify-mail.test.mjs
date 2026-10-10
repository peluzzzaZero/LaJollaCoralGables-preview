import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openStore } from '../store.mjs';
import { MailFailure, BUSINESS_MAILBOX } from '../graph.mjs';
import { runTechnicalTest } from '../verify-mail.mjs';

const origin = 'https://jolla.peluzzza.com';
const rateSecret = 'test-only-rate-secret-32-characters';

test('operator test requires explicit flag and valid request key before attempting mail',async()=>{
  let calls=0;
  for (const args of [[],['--send-technical-test'],['--send-technical-test','not-a-uuid'],['--other',randomUUID()]]) {
    const result=await runTechnicalTest({args,mailer:{configured:true,send:()=>calls++},origin,rateSecret});
    assert.equal(result.code,'explicit_test_flag_and_uuid_required');
  }
  assert.equal(calls,0);
});

test('technical message is marked, business-only, stored and not duplicated on replay',async()=>{
  const store=openStore(':memory:');const args=['--send-technical-test',randomUUID()];let calls=0;
  try {
    const mailer={configured:true,send:async(reference,inquiry)=>{
      calls++;assert.match(reference,/PRUEBA TECNICA.*NO ES UNA CONSULTA NI RESERVA/);
      assert.equal(inquiry.email,BUSINESS_MAILBOX);assert.match(inquiry.name,/PRUEBA TECNICA/);
      assert.equal(store.get(args[1]).state,'sending');
    }};
    const first=await runTechnicalTest({args,store,mailer,origin,rateSecret});
    assert.equal(first.success,true);assert.equal(first.inboxReceiptVerified,false);assert.equal(first.bookingConfirmed,false);
    const replay=await runTechnicalTest({args,store,mailer,origin,rateSecret});
    assert.deepEqual(replay,first);assert.equal(calls,1);
  } finally {store.close();}
});

test('lost technical-test response requires reconciliation and cannot trigger another send',async()=>{
  const store=openStore(':memory:');const args=['--send-technical-test',randomUUID()];let calls=0;
  try {
    const mailer={configured:true,send:async()=>{calls++;throw new MailFailure('mail_delivery_unknown',{uncertain:true});}};
    const first=await runTechnicalTest({args,store,mailer,origin,rateSecret});
    assert.equal(first.success,false);assert.equal(first.code,'delivery_requires_review');
    await runTechnicalTest({args,store,mailer,origin,rateSecret});assert.equal(calls,1);
  } finally {store.close();}
});
