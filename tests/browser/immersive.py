"""Test same-page visit sessions, focus and visible contact on the landing."""
import json
from playwright.async_api import async_playwright
from review import run, position
async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  for engine in [p.chromium]+([p.webkit] if args.webkit else []):
   browser=await engine.launch()
   for width,height in [(320,600),(390,844),(884,884),(1366,500),(1366,768)]:
    context=await browser.new_context(viewport={'width':width,'height':height});page=await context.new_page();requests=[];errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    async def provider(route):
     requests.append(route.request.url);await route.fulfill(content_type='text/html',body='<html><body><h1>Mock calendar</h1><button>Calendar</button></body></html>')
    await context.route('https://bookings.cloud.microsoft/**',provider)
    await page.goto(base);assert not requests
    for language in ['en','es']:
     await page.locator(f'[data-lang="{language}"]').click();await position(page,'planning')
     opener=page.locator('#planning [data-booking-opener]');await opener.scroll_into_view_if_needed()
     before=await page.evaluate('scrollY');url=page.url
     await opener.click()
     await page.frame_locator('.booking-frame').locator('h1').wait_for();assert page.url==url and len(requests)==1
     rect=await page.locator('#booking-viewer').bounding_box();assert rect['x']>=-1 and rect['y']>=-1 and rect['x']+rect['width']<=width+1 and rect['y']+rect['height']<=height+1
     fallback=page.locator('.booking-fallback a')
     for state in ['normal','hover','focus']:
      if state=='hover':await fallback.hover()
      if state=='focus':await fallback.focus()
      ratio=await fallback.evaluate('''e=>{const lum=s=>{const c=s.match(/[\\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};const a=lum(getComputedStyle(e).color),b=lum(getComputedStyle(e.closest('dialog')).backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}''')
      assert ratio>=4.5,(engine.name,width,state,ratio)
     await page.screenshot(path=str(output/f'calendar-{engine.name}-{width}-{language}.png'))
     await page.keyboard.press('Escape');await page.wait_for_function('!document.body.classList.contains("booking-open")')
     after=await page.evaluate('scrollY');focused=await opener.evaluate('e=>e===document.activeElement')
     assert abs(after-before)<2 and focused,(engine.name,width,language,before,after,focused)
     await page.locator('#header .inquire-link').click();await page.frame_locator('.booking-frame').locator('h1').wait_for();assert len(requests)==1
     await page.locator('.booking-close').click();await position(page,'footer')
     assert await page.locator('#footer a[href^="mailto:"]').is_visible()
     assert await page.locator('#footer a[href^="tel:"]').is_visible()
     assert await page.locator('.contact-directory').count()==0
     await page.screenshot(path=str(output/f'contact-{engine.name}-{width}-{language}.png'))
     rows.append({'engine':engine.name,'width':width,'language':language,'same_page_session':True,'contact_visible':True})
    assert not errors,errors
    await context.close()
   context=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844});page=await context.new_page();await page.goto(base)
   assert 'bookings.cloud.microsoft' in await page.locator('.inquire-link').get_attribute('href')
   await position(page,'footer');assert await page.locator('#footer a[href^="mailto:"]').is_visible()
   assert await page.locator('.social-links a').count()==3
   await context.close();await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Visit/contact: {len(rows)} EN/ES browser/viewport cases passed; no real bookings.')
if __name__=='__main__':run(main)
