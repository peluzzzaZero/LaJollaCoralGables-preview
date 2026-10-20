"""Exercise the scroll-drawn venue walk: cold load, quick scrubbing, fallbacks."""
import json
from playwright.async_api import async_playwright
from review import run, third_party_map_error
WALK='document.querySelector("[data-venue-walk]")'
async def scroll_to(page,progress):
 await page.evaluate(f'''p=>{{const w={WALK},f=w.querySelector(".hall-photo");const top=w.getBoundingClientRect().top+scrollY;const span=w.offsetHeight-f.offsetHeight-(parseFloat(getComputedStyle(f).top)||0);scrollTo(0,top+p*span)}}''',progress)
async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  engines=([] if args.webkit_only else [p.chromium])+([p.webkit] if args.webkit or args.webkit_only else [])
  for engine in engines:
   browser=await engine.launch()
   for width,height in [(320,640),(390,844),(884,884),(1366,768)]:
    for language in ['en','es']:
     context=await browser.new_context(viewport={'width':width,'height':height});page=await context.new_page();errors=[];walk=[]
     page.on('pageerror',lambda e:errors.append(str(e)) if not third_party_map_error(e) else None)
     async def slow(route):
      # A cold, slow link: the approved photograph must hold the frame meanwhile.
      walk.append(route.request.url);await page.wait_for_timeout(1200);await route.continue_()
     await context.route('**/cinematic/venue-walk*',slow)
     await page.goto(base);await page.locator(f'[data-lang="{language}"]').click();await page.wait_for_timeout(300)
     assert not walk,('fetched before the section was near',walk)
     assert await page.evaluate(f'{WALK}.classList.contains("is-walking")')
     await scroll_to(page,.5);await page.wait_for_timeout(300)
     assert walk and all(('mobile' in u)==(width<=650) for u in walk),walk
     assert await page.evaluate(f'getComputedStyle({WALK}.querySelector(".venue-walk-film")).visibility')=='hidden'
     assert await page.locator('.venue-walk .photo-window > img').is_visible()
     steps=await page.evaluate('(()=>{const s=document.querySelector(".venue-walk-steps");return {over:s.scrollWidth>s.clientWidth,lines:[...s.querySelectorAll("span:not(.venue-walk-track)")].map(e=>Math.round(e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight)))}})()')
     assert not steps['over'] and max(steps['lines'])<=2,(width,language,steps)
     await page.wait_for_function(f'{WALK}.querySelector(".venue-walk-film").classList.contains("is-decoded")',timeout=20000)
     # Quick forward/reverse scrubbing must settle on the final scroll position.
     for target in [.95,.1,.8,.2,1,0,.62]:
      await scroll_to(page,target);await page.wait_for_timeout(40)
     await page.wait_for_timeout(900)
     state=await page.evaluate('({p:window.__ljVenueWalk.progress,t:window.__ljVenueWalk.video.currentTime,d:window.__ljVenueWalk.video.duration})')
     assert abs(state['p']-.62)<.02 and abs(state['t']-state['p']*state['d'])<.07,(engine.name,width,language,state)
     assert await page.evaluate(f'getComputedStyle({WALK}.querySelector(".venue-walk-film")).visibility')=='visible'
     await page.screenshot(path=str(output/f'walk-{engine.name}-{width}-{language}.png'))
     assert not errors,errors;await context.close()
     rows.append({'engine':engine.name,'width':width,'language':language,**state})
   # A collapsing phone toolbar (height only) never toggles the staging;
   # a rotation (width change) re-decides it.
   context=await browser.new_context(viewport={'width':390,'height':844});page=await context.new_page()
   await page.goto(base);await scroll_to(page,.4);await page.wait_for_timeout(300)
   await page.set_viewport_size({'width':390,'height':560});await page.wait_for_timeout(400)
   assert await page.evaluate(f'{WALK}.classList.contains("is-walking")')
   await page.set_viewport_size({'width':844,'height':390});await page.wait_for_timeout(400)
   assert not await page.evaluate(f'{WALK}.classList.contains("is-walking")')
   assert await page.evaluate('getComputedStyle(document.querySelector(".venue-walk .hall-photo img")).transform') in ('none','matrix(1, 0, 0, 1, 0, 0)');await context.close()
   # No source loads: the section returns to the approved photograph and layout.
   context=await browser.new_context(viewport={'width':1366,'height':768});page=await context.new_page()
   await context.route('**/cinematic/venue-walk*',lambda route:route.abort())
   await page.goto(base);await scroll_to(page,.3)
   await page.wait_for_function(f'!{WALK}.classList.contains("is-walking")',timeout=10000)
   assert await page.locator('.venue-walk .hall-photo img').is_visible()
   assert await page.evaluate('getComputedStyle(document.querySelector(".venue-walk .hall-photo img")).transform') in ('none','matrix(1, 0, 0, 1, 0, 0)');await context.close()
   # Reduced motion keeps the photograph and never fetches the film.
   context=await browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=await context.new_page();walk=[]
   page.on('request',lambda r:walk.append(r.url) if '/cinematic/venue-walk' in r.url else None)
   await page.goto(base);await page.locator('[data-venue-walk]').scroll_into_view_if_needed();await page.wait_for_timeout(500)
   assert not walk and not await page.evaluate(f'{WALK}.classList.contains("is-walking")');await context.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Venue walk: {len(rows)} EN/ES browser/viewport cases scrub to the scroll position; fallbacks hold the photograph.')
if __name__=='__main__':run(main)
