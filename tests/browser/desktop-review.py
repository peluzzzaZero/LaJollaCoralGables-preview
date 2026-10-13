"""Check native deep links, quick navigation and responsive entrance release."""
import json
from playwright.async_api import async_playwright
from review import run, position, verify_flow
async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  for width,height in [(901,700),(1440,900),(1920,1080)]:
   page=await browser.new_page(viewport={'width':width,'height':height})
   await page.goto(base+'#events');await page.evaluate('document.fonts.ready')
   await page.wait_for_function('document.activeElement.id==="events-title"')
   for language in ['en','es']:
    await page.locator(f'[data-lang="{language}"]').click()
    for name in ['history','visit','rentals','events']:
     await page.locator(f'.chapter-nav a[href="#{name}"]').click()
     await page.wait_for_function('id=>location.hash==="#"+id',arg=name)
     await page.wait_for_timeout(500)
     title=page.locator('#'+name+' h2').first
     assert await title.evaluate('e=>e===document.activeElement')
     assert await title.is_visible()
    await verify_flow(page)
    await page.screenshot(path=str(output/f'native-{width}-{language}.png'))
    rows.append({'width':width,'language':language,'native_navigation':True})
   await page.set_viewport_size({'width':390,'height':844});await verify_flow(page)
   await page.set_viewport_size({'width':1440,'height':500});await verify_flow(page)
   await page.set_viewport_size({'width':390,'height':500});await page.wait_for_function('!window.__ljEntrance.trigger')
   await verify_flow(page);await page.close()
  await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print('Desktop: native anchors, deep links and viewport changes passed in both languages.')
if __name__=='__main__':run(main)
