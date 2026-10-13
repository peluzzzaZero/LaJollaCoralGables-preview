"""Verify visible, bounded decoration without moving or concealing the reading flow."""
import json
from playwright.async_api import async_playwright
from review import run, verify_flow

async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  for engine in [p.chromium]+([p.webkit] if args.webkit else []):
   browser=await engine.launch()
   for width,height in [(390,844),(884,884),(1440,900)]:
    page=await browser.new_page(viewport={'width':width,'height':height})
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    # Real decoding is covered separately; decoration must also work on the poster.
    await page.route('**/*.mp4',lambda route:route.abort())
    await page.route('**/*.webm',lambda route:route.abort())
    await page.goto(base);await page.evaluate('document.fonts.ready')
    for language in ['en','es']:
     await page.locator(f'[data-lang="{language}"]').click()
     poses=[]
     for fraction in [.15,.52,.9]:
      await page.evaluate('p=>{const t=__ljEntrance.trigger;scrollTo(0,t.start+(t.end-t.start)*p);ScrollTrigger.update()}',fraction)
      await page.wait_for_timeout(800)
      state=await page.locator('.entrance-copy').evaluate('e=>({transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity,top:e.getBoundingClientRect().top})')
      assert state['opacity']=='1';poses.append(state['transform'])
      heading=await page.locator('#hero-title').bounding_box()
      assert heading['y']>=68 and heading['y']+heading['height']<=height,(width,heading)
      caption=page.locator('.entrance-phrase')
      active=await caption.evaluate_all('items=>items.filter(e=>Number(getComputedStyle(e).opacity)>.99).length')
      assert active==1,(width,fraction,active)
      phrase=await caption.evaluate_all('items=>items.find(e=>Number(getComputedStyle(e).opacity)>.99).getBoundingClientRect().bottom')
      assert phrase<state['top'],(width,fraction,phrase,state)
      assert await page.locator('.entrance-actions [data-booking-opener]').is_visible()
      await page.screenshot(path=str(output/f'arrival-{engine.name}-{width}-{language}-{fraction}.png'))
     assert len(set(poses))==3,'Entrance typography must accompany the zoom'
     image=page.locator('.history-photo img')
     await image.evaluate('e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.2)')
     await page.wait_for_timeout(1400)
     before=await image.evaluate('e=>getComputedStyle(e).transform')
     await page.evaluate('scrollBy(0,100)');await page.wait_for_timeout(200)
     after=await image.evaluate('e=>getComputedStyle(e).transform')
     assert before!=after and after!='none','Selected photography must have measured scroll depth'
     assert await image.evaluate('e=>getComputedStyle(e).clipPath')=='inset(0px)', 'Image reveal must finish'
     await verify_flow(page)
     first=await page.locator('.events-list > li').first.bounding_box()
     other=await page.locator('.events-list > li').nth(1).bounding_box()
     if width>=884:assert first['width']>other['width']*1.8,'Weddings must span the occasion list'
     sizes=await page.locator('.occasion h3').evaluate_all('items=>items.map(e=>parseFloat(getComputedStyle(e).fontSize))')
     assert sizes[0]>max(sizes[1:]),'Only the wedding title should receive the larger treatment'
     window=page.locator('.ballroom-photo .photo-window')
     await window.scroll_into_view_if_needed();await page.wait_for_timeout(1000)
     picture=await window.bounding_box();caption=await page.locator('.ballroom-photo figcaption').bounding_box()
     assert picture['y']+picture['height']<=caption['y'], 'Photo movement must not paint over its caption'
     assert await window.evaluate('e=>getComputedStyle(e).overflow') in ['clip','hidden']
     assert await page.evaluate('ScrollTrigger.getAll().filter(t=>t.pin).length')==1,'Later posts must never be pinned'
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     await page.screenshot(path=str(output/f'depth-{engine.name}-{width}-{language}.png'))
     rows.append({'engine':engine.name,'width':width,'language':language,'arrival_layers':True,'photo_depth':True,'reading_flow':True})
    await page.emulate_media(reduced_motion='reduce');await page.wait_for_timeout(150)
    assert await image.evaluate('e=>getComputedStyle(e).transform')=='none'
    assert await image.evaluate('e=>getComputedStyle(e).clipPath')=='none'
    assert await page.evaluate('!__ljEntrance.trigger')
    assert await page.locator('.landing-reading-progress').is_hidden()
    await verify_flow(page);assert not errors,errors;await page.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2))
 print(f'Landing decoration: {len(rows)} EN/ES engine/viewport cases passed; visible reading and reduced-motion reset.')
if __name__=='__main__':run(main)
