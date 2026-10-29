"""The chat assistant on the home page: AI notice, safe links, errors and a hung request (assistant stubbed)."""
import argparse, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
from review import ASSISTANT, mock_booking, run

CORS={'access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS'}
# Stands in for Cloudflare Turnstile. pass/fail: answers after 300 ms; silent: never answers;
# tap: asks for a tap at once and waits. Every render is kept in window.tsCalls.
def turnstile(mode):
 act={'pass':"setTimeout(function(){o.callback('test-token')},300)",'fail':"setTimeout(function(){o['error-callback']()},300)",'silent':'','tap':"o['before-interactive-callback']()"}[mode]
 body="window.tsCalls=[];window.turnstile={render:function(el,o){window.tsOptions=o;window.tsCalls.push(o);var b=document.createElement('div');b.className='test-turnstile';b.style.cssText='width:'+(o.size==='compact'?150:300)+'px;height:65px';el.appendChild(b);%s;return 'w'+window.tsCalls.length},remove:function(){}};"%act
 return lambda route:route.fulfill(content_type='application/javascript',body=body)
def assistant(mode):
 async def handler(route):
  if route.request.method=='OPTIONS':await route.fulfill(status=204,headers=CORS);return
  if mode=='hang':return  # never answers
  if mode=='slow' and json.loads(route.request.post_data)['message'] in ('Hello','Hola'):await asyncio.sleep(1.5)
  if mode=='error':await route.fulfill(status=500,headers=CORS,body='');return
  if mode=='verify' and 'turnstile' not in json.loads(route.request.post_data):
   await route.fulfill(status=403,headers=CORS,content_type='application/json',body=json.dumps({'error':'verification_required','siteKey':'test-site-key'}));return
  reply={'text':'Welcome. Call 786-290-8813 or write to info@lajollacoralgables.com. Follow us on Instagram (https://www.instagram.com/lajollacoralgables/) and see our reviews: https://www.google.com/maps/search/?api=1&query=La%20Jolla%20Coral%20Gables. Pay here (https://evil.example/pay).','quickReplies':[{'label':'Schedule a tour','value':'schedule a tour'}],'link':{'label':'Unsafe','url':'javascript:alert(1)'}}
  await route.fulfill(status=200,headers=CORS,content_type='application/json',body=json.dumps({'replies':[reply]}))
 return handler
async def page_for(browser,base,mode,language,width):
 page=await browser.new_page(viewport={'width':width,'height':844 if width<600 else 900},has_touch=width<600,is_mobile=width<600)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.route('https://bookings.cloud.microsoft/**',mock_booking)
 await page.route('https://www.google.com/maps/**',lambda r:r.fulfill(content_type='text/html',body='<html></html>'))
 await page.route(ASSISTANT+'/**',assistant(mode))
 await page.goto(base+('?lang=es' if language=='es' else ''),wait_until='domcontentloaded')
 if language=='es':await page.evaluate('document.documentElement.lang="es"')
 return page,errors
async def main(base,output):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  for language,subtitle,notice in [('en','AI assistant of the La Jolla team','Replies are written by AI.'),('es','Asistente con IA del equipo de La Jolla','Las respuestas las escribe una IA.')]:
   for width in (390,1440):
    page,errors=await page_for(browser,base,'ok',language,width)
    await page.evaluate('window.LaJollaChat.open()')
    await page.locator('.ljc-bot').first.wait_for()
    assert await page.locator('.ljc-head small').inner_text()==subtitle
    assert (await page.locator('.ljc-privacy').inner_text()).startswith(notice)
    # Only https, tel and mailto links become buttons; the phone number is tap-to-call.
    assert await page.locator('.ljc-log a[href^="javascript:"]').count()==0
    assert await page.locator('.ljc-link-text').inner_text()=='Unsafe'
    assert await page.locator('.ljc-tel').get_attribute('href')=='tel:+17862908813'
    # v1.35.0: addresses in the text are short, clickable names; never a raw https:// address.
    assert 'https://' not in await page.locator('.ljc-bot').first.inner_text()
    links=await page.locator('.ljc-bot a.ljc-url').evaluate_all('els=>els.map(e=>[e.textContent,e.getAttribute("href"),e.target])')
    reviews='Read our Google reviews' if language=='en' else 'Leer reseñas en Google'
    assert links==[['info@lajollacoralgables.com','mailto:info@lajollacoralgables.com',''],['Instagram','https://www.instagram.com/lajollacoralgables/','_blank'],[reviews,'https://www.google.com/maps/search/?api=1&query=La%20Jolla%20Coral%20Gables','_blank'],['evil.example','https://evil.example/pay','_blank']],links
    # Phones: no keyboard over the welcome; the sheet fills the screen.
    focused=await page.evaluate('document.activeElement.className')
    assert focused==('ljc-in' if width>=600 else 'ljc-panel'),(width,focused)
    await page.wait_for_timeout(400);await page.screenshot(path=str(output/f'chat-{width}-{language}.png'))
    assert not errors,errors
    rows.append({'language':language,'width':width,'ai_notice':True,'safe_links':True});await page.close()
  # v1.35.0: opened from a section, the first message carries it; a plain open sends none.
  for section in ('lexington',None):
   page,errors=await page_for(browser,base,'ok','en',390)
   sent=[];page.on('request',lambda r:sent.append(json.loads(r.post_data)) if r.method=='POST' and r.url.startswith(ASSISTANT) else None)
   await page.evaluate('s=>window.LaJollaChat.open(s?{section:s}:undefined)',section)
   await page.locator('.ljc-bot').first.wait_for()
   assert sent and sent[0].get('section')==section,(section,sent)
   assert not errors,errors
   rows.append({'section_sent':section});await page.close()
  # v1.36.1: a message typed while the welcome is still on its way is sent right after it, never dropped.
  page,errors=await page_for(browser,base,'slow','en',390)
  sent=[];page.on('request',lambda r:sent.append(json.loads(r.post_data)['message']) if r.method=='POST' and r.url.startswith(ASSISTANT) else None)
  await page.evaluate('window.LaJollaChat.open()');await page.wait_for_timeout(150)
  await page.locator('.ljc-in').fill('early question');await page.locator('.ljc-send').click()
  await page.wait_for_function('document.querySelectorAll(".ljc-bot").length>=2',timeout=6000)
  assert sent==['Hello','early question'],sent
  assert await page.locator('.ljc-me').inner_text()=='early question'
  assert not errors,errors
  rows.append({'queued_first_message':True});await page.close()
  # A saved chat older than 30 days is removed from the browser, not just ignored.
  page,errors=await page_for(browser,base,'ok','en',1440)
  await page.evaluate('localStorage.setItem("lj-chat",JSON.stringify({id:"old",items:[{who:"me",text:"old question"}],at:Date.now()-31*86400000}))')
  await page.reload(wait_until='domcontentloaded')
  assert await page.evaluate('localStorage.getItem("lj-chat")') is None,'expired chat kept'
  await page.evaluate('window.LaJollaChat.open()');await page.locator('.ljc-bot').first.wait_for()
  assert await page.locator('.ljc-me').count()==0
  assert not errors,errors
  rows.append({'expired_chat_removed':True});await page.close()
  # When the assistant asks for the person check, the chat runs Turnstile once and sends the message again with its token.
  for passes in (True,False):
   page,errors=await page_for(browser,base,'verify','es',1440)
   sent=[];page.on('request',lambda r:sent.append(json.loads(r.post_data)) if r.method=='POST' and r.url.startswith(ASSISTANT) else None)
   await page.route('https://challenges.cloudflare.com/**',turnstile('pass' if passes else 'fail'))
   await page.evaluate('window.LaJollaChat.open()')
   await page.locator('.test-turnstile').wait_for(state='attached')
   assert await page.evaluate('[tsOptions.sitekey,tsOptions.appearance,tsOptions.language,tsOptions.size].join()')=='test-site-key,interaction-only,es,normal'
   # An invisible check takes no room in the chat.
   assert await page.evaluate('document.querySelector(".ljc-human").getBoundingClientRect().height')==0
   await page.locator('.ljc-bot').first.wait_for(timeout=5000)
   assert await page.locator('.ljc-human > *').count()==0
   if passes:
    assert (await page.locator('.ljc-bot').first.inner_text()).startswith('Welcome. Call 786-290-8813 or write to info@')
    assert [m.get('turnstile') for m in sent]==[None,'test-token'],sent
   else:
    # A check that cannot run (Cloudflare client error) is not an error for the visitor: the message goes again as
    # "unavailable" and the assistant answers from its fixed rules only. Later messages skip the failed check.
    assert (await page.locator('.ljc-bot').first.inner_text()).startswith('Welcome. Call 786-290-8813 or write to info@')
    assert [m.get('turnstile') for m in sent]==[None,'unavailable'],sent
    await page.locator('.ljc-in').fill('Is there parking?');await page.locator('.ljc-in').press('Enter')
    await page.locator('.ljc-bot').nth(1).wait_for(timeout=5000)
    assert [m.get('turnstile') for m in sent]==[None,'unavailable','unavailable'],sent
    assert await page.evaluate('tsCalls.length')==1
    assert await page.locator('.ljc-bot').filter(has_text='algo falló').count()==0
   assert not errors,errors
   rows.append({'person_check':'passed' if passes else 'failed','answered_without_check':not passes});await page.close()
  # A Turnstile script that the browser blocks (an ad blocker, a firewall) is answered at once without the check.
  page,errors=await page_for(browser,base,'verify','en',1440)
  sent=[];page.on('request',lambda r:sent.append(json.loads(r.post_data)) if r.method=='POST' and r.url.startswith(ASSISTANT) else None)
  await page.route('https://challenges.cloudflare.com/**',lambda route:route.abort())
  await page.evaluate('window.LaJollaChat.open()')
  await page.locator('.ljc-bot').first.wait_for(timeout=5000)
  assert (await page.locator('.ljc-bot').first.inner_text()).startswith('Welcome. Call 786-290-8813 or write to info@')
  assert [m.get('turnstile') for m in sent]==[None,'unavailable'],sent
  assert not [e for e in errors if 'challenges.cloudflare.com' not in e],errors
  rows.append({'person_check':'script_blocked','answered_without_check':True});await page.close()
  # A check that never answers (or a script that never loads) ends after 20 s with the calendar.
  for stall in ('silent','no-script'):
   page,errors=await page_for(browser,base,'verify','en',1440)
   if stall=='silent':await page.route('https://challenges.cloudflare.com/**',turnstile('silent'))
   else:await page.route('https://challenges.cloudflare.com/**',lambda route:None)
   await page.clock.install()
   await page.evaluate('window.LaJollaChat.open()')
   await page.locator('.ljc-typing').wait_for()
   await page.clock.run_for(19000);assert await page.locator('.ljc-bot').count()==0
   await page.clock.run_for(2000)
   await page.locator('.ljc-bot').filter(has_text='something went wrong').wait_for(timeout=5000)
   assert await page.locator('.ljc-log a.ljc-link[href^="https://bookings.cloud.microsoft/"]').count()==1
   assert await page.locator('.ljc-human > *').count()==0 and await page.locator('.ljc-typing').count()==0
   assert not errors,errors
   rows.append({'person_check_stalled':stall,'fallback':True});await page.close()
  # A check that needs a tap is shown, fits a phone, and has no time limit while it waits; "Start over" replaces it cleanly.
  page,errors=await page_for(browser,base,'verify','en',390)
  await page.route('https://challenges.cloudflare.com/**',turnstile('tap'))
  await page.clock.install()
  await page.evaluate('window.LaJollaChat.open()')
  await page.locator('.test-turnstile').wait_for()
  assert await page.evaluate('tsOptions.size')=='compact'
  box=await page.evaluate('(()=>{var h=document.querySelector(".ljc-human");return [h.getBoundingClientRect().height>0,h.scrollWidth<=h.clientWidth]})()')
  assert box==[True,True],box
  await page.clock.run_for(25000);assert await page.locator('.ljc-bot').count()==0
  await page.wait_for_timeout(400);await page.screenshot(path=str(output/'chat-390-person-check.png'))
  await page.locator('.ljc-restart').click()
  await page.locator('.test-turnstile').wait_for()
  assert await page.evaluate('tsCalls.length')==2
  # The first check answering late changes nothing in the new conversation.
  await page.evaluate("tsCalls[0].callback('old-token')")
  assert await page.locator('.ljc-human .test-turnstile').count()==1
  await page.evaluate("tsCalls[1].callback('new-token')")
  await page.locator('.ljc-bot').first.wait_for(timeout=5000)
  assert await page.locator('.ljc-bot').count()==1 and await page.locator('.ljc-human > *').count()==0
  assert not errors,errors
  rows.append({'person_check':'tap','width':390,'start_over':True});await page.close()
  # A failed request offers the calendar; a request that never ends stops after 20 s with the same help.
  for mode in ('error','hang'):
   page,errors=await page_for(browser,base,mode,'en',1440)
   await page.clock.install()
   await page.evaluate('window.LaJollaChat.open()')
   if mode=='hang':
    await page.locator('.ljc-typing').wait_for()
    await page.clock.run_for(19000);assert await page.locator('.ljc-typing').count()==1
    await page.clock.run_for(2000)
   await page.locator('.ljc-bot').filter(has_text='something went wrong').wait_for(timeout=5000)
   assert await page.locator('.ljc-typing').count()==0
   assert await page.locator('.ljc-log a.ljc-link[href^="https://bookings.cloud.microsoft/"]').count()==1
   # The chat is usable again: Start over cancels and asks once more.
   await page.locator('.ljc-restart').click()
   if mode=='hang':
    await page.locator('.ljc-typing').wait_for();assert await page.locator('.ljc-bot').count()==0
   else:await page.wait_for_function('document.querySelectorAll(".ljc-bot").length===1&&!document.querySelector(".ljc-typing")')
   assert not errors,errors
   rows.append({'mode':mode,'fallback':True});await page.close()
  await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Chat: {len(rows)} AI-notice, link, expiry, person-check, error and timeout cases passed with the assistant stubbed.')
if __name__=='__main__':run(lambda base,out,args:main(base,out))
