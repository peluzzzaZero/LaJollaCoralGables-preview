"""Keep all copy readable in normal flow, including static and failure modes."""
import json
from playwright.async_api import async_playwright
from review import run, CHAPTERS, position, verify_flow, third_party_map_error
async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  for engine in [p.chromium]+([p.webkit] if args.webkit else []):
   browser=await engine.launch()
   for mode in ['normal','no-js','reduced','save-data','no-gsap','no-media']:
    for width in [320,884]:
     context=await browser.new_context(viewport={'width':width,'height':844},java_script_enabled=mode!='no-js',reduced_motion='reduce' if mode=='reduced' else 'no-preference')
     if mode=='save-data':await context.add_init_script("Object.defineProperty(navigator,'connection',{value:{saveData:true}})")
     if mode=='no-gsap':await context.route('**/gsap.min.js',lambda route:route.abort())
     if mode=='no-media':await context.route('**/*.mp4',lambda route:route.abort());await context.route('**/*.webm',lambda route:route.abort())
     page=await context.new_page();errors=[];media=[];page.on('pageerror',lambda e:errors.append(str(e)) if not third_party_map_error(e) else None)
     page.on('request',lambda r:media.append(r.url) if r.url.endswith(('.mp4','.webm')) else None)
     await page.goto(base);await page.evaluate('document.fonts.ready')
     if mode=='no-media':
      # Exercise a cold entrance load failure before checking the normal landing.
      await page.evaluate('window.scrollTo(0, 160)')
      await page.wait_for_timeout(1000)
      assert media,'A media failure must exercise a real entrance request'
      assert await page.locator('.entrance-film img').is_visible()
      assert not await page.locator('.entrance-video').evaluate('e=>e.classList.contains("is-decoded")')
      assert await page.locator('.entrance-video').evaluate('e=>e.paused')
     for language in ['en','es'] if mode!='no-js' else ['en']:
      if mode!='no-js':await page.locator(f'[data-lang="{language}"]').click()
      await verify_flow(page)
      for name in ['history','events','alcazar','social','team','location']:
       await position(page,name)
       # Body text and all headings must remain opaque, never a hidden reader.
       state=await page.locator('#'+name).evaluate('''e=>({height:e.getBoundingClientRect().height,visible:[...e.querySelectorAll('h2,h3,p')].filter(n=>n.textContent.trim()).every(n=>{let opacity=1;for(let a=n;a;a=a.parentElement)opacity*=Number(getComputedStyle(a).opacity);return opacity>=.999&&!n.closest('[hidden],[inert]')})})''')
       assert state['visible'] and state['height']>100,(mode,name,state)
      assert await page.locator('.mobile-menu').count()==1
      if mode in ['no-js','reduced','save-data','no-gsap']:assert await page.locator('.entrance-video').get_attribute('src') is None
      await page.screenshot(path=str(output/f'flow-{engine.name}-{mode}-{width}-{language}.png'))
      rows.append({'engine':engine.name,'mode':mode,'width':width,'language':language,'full_information':True})
     assert not errors,errors
     await context.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Landing fallbacks: {len(rows)} browser/width/language/mode cases passed; no hidden content.')
if __name__=='__main__':run(main)
