"""The chat assistant on the home page: AI notice, safe links, errors and a hung request (assistant stubbed)."""
import argparse, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
from review import ASSISTANT, mock_booking, run

CORS={'access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS'}
def assistant(mode):
 async def handler(route):
  if route.request.method=='OPTIONS':await route.fulfill(status=204,headers=CORS);return
  if mode=='hang':return  # never answers
  if mode=='error':await route.fulfill(status=500,headers=CORS,body='');return
  reply={'text':'Welcome. Call 786-290-8813.','quickReplies':[{'label':'Schedule a tour','value':'schedule a tour'}],'link':{'label':'Unsafe','url':'javascript:alert(1)'}}
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
    # Phones: no keyboard over the welcome; the sheet fills the screen.
    focused=await page.evaluate('document.activeElement.classList.contains("ljc-in")')
    assert focused==(width>=600),(width,focused)
    await page.wait_for_timeout(400);await page.screenshot(path=str(output/f'chat-{width}-{language}.png'))
    assert not errors,errors
    rows.append({'language':language,'width':width,'ai_notice':True,'safe_links':True});await page.close()
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
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Chat: {len(rows)} AI-notice, link, error and timeout cases passed with the assistant stubbed.')
if __name__=='__main__':run(lambda base,out,args:main(base,out))
