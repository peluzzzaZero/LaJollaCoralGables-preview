"""Every occasion shows its own photograph: the sticky frame follows reading on wide
screens in every motion mode, and each card carries its photograph on narrow ones."""
import json
from playwright.async_api import async_playwright
from review import run

async def centre(page,index):
 await page.locator('.occasion').nth(index).evaluate('e=>{const b=e.parentElement.getBoundingClientRect();scrollTo(0,scrollY+b.top+b.height/2-innerHeight/2)}')
 await page.wait_for_timeout(300)
 return await page.evaluate('''()=>({shown:[...document.querySelectorAll('.occasion-slide')].findIndex(e=>e.classList.contains('is-shown')),
  exposed:[...document.querySelectorAll('.occasion-slide')].filter(e=>e.getAttribute('aria-hidden')!=='true').length,
  label:document.querySelector('.occasion-label').textContent,
  counter:document.querySelector('.occasion-counter').textContent})''')

async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);results=[]
 async with async_playwright() as p:
  engines=([] if args.webkit_only else [p.chromium])+([p.webkit] if args.webkit or args.webkit_only else [])
  for engine in engines:
   browser=await engine.launch()
   for motion in ['no-preference','reduce']:
    for width in [1280,1440]:
     page=await browser.new_page(viewport={'width':width,'height':900},reduced_motion=motion)
     await page.route('**/*',lambda r:r.abort() if any(h in r.request.url for h in ('google','gstatic')) else r.continue_())
     await page.goto(base+'index.html');await page.evaluate('document.fonts.ready')
     sources=await page.locator('.occasion-slide').evaluate_all('e=>e.map(i=>i.getAttribute("src"))')
     assert len(sources)==10 and len(set(sources))==10,sources
     for index in [0,1,3,5,7,9]:
      state=await centre(page,index)
      # A two-card row starts on its first card; the row is the one being read.
      assert state['shown']==index,(motion,width,index,state)
      assert state['exposed']==1,state
      assert state['label']==await page.locator('.occasion h3').nth(index).text_content(),state
      assert state['counter']==f'{index+1:02d}',state
     assert await page.locator('.occasion-slide').evaluate_all('e=>e.every(i=>i.complete&&i.naturalWidth>0)'),'wide slides load'
     # Back up the list: the row being read still decides, and only one slide is exposed.
     for index in [7,3,0]:assert (await centre(page,index))['shown']==index
     # Pointing at the right-hand card of a row shows its photograph.
     await centre(page,4);await page.locator('.occasion').nth(4).hover();await page.wait_for_timeout(300)
     assert (await centre(page,4))['shown']==4
     await page.mouse.move(2,2);await page.wait_for_timeout(400)
     # A resting pointer on a card outside the row being read releases the frame
     # once the page scrolls a little, without the row changing.
     await centre(page,1);box=await page.locator('.occasion').nth(3).bounding_box()
     if box and box['y']+20<900:
      await page.mouse.move(box['x']+box['width']/2,box['y']+10);await page.wait_for_timeout(300)
      assert (await page.evaluate('[...document.querySelectorAll(".occasion-slide")].findIndex(e=>e.classList.contains("is-shown"))'))==3
      await page.mouse.wheel(0,12);await page.wait_for_timeout(400)
      shown=await page.evaluate('[...document.querySelectorAll(".occasion-slide")].findIndex(e=>e.classList.contains("is-shown"))')
      assert shown in (1,2),shown
     assert await page.locator('.occasion-counter').is_visible()
     await page.mouse.move(2,2);await page.wait_for_timeout(400)
     # Keyboard focus on a card's link (pointer parked away) holds its photograph while the page scrolls.
     await page.locator('.occasion').nth(6).locator('a').focus();await page.wait_for_timeout(300)
     shown=lambda:page.evaluate('[...document.querySelectorAll(".occasion-slide")].findIndex(e=>e.classList.contains("is-shown"))')
     first=await shown();assert first==6,('focus',first,await page.evaluate('document.activeElement.outerHTML.slice(0,80)'))
     for step in [120,-240,160]:
      await page.mouse.wheel(0,step);await page.wait_for_timeout(250)
      now=await shown();assert now==6,('scroll',step,now)
     await page.evaluate('document.activeElement.blur()');await page.wait_for_timeout(400)
     # A mouse click on a card's link focuses it but must not pin the frame.
     await page.evaluate('addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation()},{capture:true,once:true})')
     await centre(page,1);await page.locator('.occasion').nth(2).locator('a').click();await page.mouse.move(2,2)
     await page.wait_for_timeout(400)
     await centre(page,5);assert (await centre(page,5))['shown'] in (5,6)
     await page.evaluate('document.activeElement.blur()');await page.wait_for_timeout(300)
     # The Spanish label follows the language switch.
     await page.locator('[data-lang="es"]').click();await page.wait_for_timeout(300)
     label=await page.locator('.occasion-label').text_content()
     assert label in await page.locator('.occasion h3').all_text_contents(),label
     await page.locator('[data-lang="en"]').click();await page.wait_for_timeout(300)
     # Reduced motion never alternates on a timer.
     # Full motion turns once to the row's second card; reduced motion never turns on a timer.
     await centre(page,1);await page.wait_for_timeout(4200);assert (await centre(page,1))['shown']==(1 if motion=='reduce' else 2)
     await page.wait_for_timeout(4000);assert (await centre(page,1))['shown']==(1 if motion=='reduce' else 2)
     await page.screenshot(path=str(output/f'{engine.name}-{motion}-{width}.png'))
     results.append({'engine':engine.name,'motion':motion,'width':width})
     await page.close()
   for width in [320,390,768,884,1024]:
    page=await browser.new_page(viewport={'width':width,'height':844})
    await page.route('**/*',lambda r:r.abort() if any(h in r.request.url for h in ('google','gstatic')) else r.continue_())
    await page.goto(base+'index.html')
    photos=page.locator('.occasion .occasion-photo')
    assert await photos.count()==10
    assert await page.locator('.occasion-stage').evaluate('e=>getComputedStyle(e).display')=='none'
    for index in range(10):
     await photos.nth(index).scroll_into_view_if_needed()
     box=await photos.nth(index).bounding_box()
     assert box and box['width']>200 and box['height']>100,(width,index,box)
     await photos.nth(index).evaluate('i=>i.complete||new Promise(r=>i.addEventListener("load",r,{once:true}))')
     assert await photos.nth(index).evaluate('i=>i.naturalWidth')>0,(width,index)
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
    results.append({'engine':engine.name,'width':width,'cards':10})
    await page.close()
   # Without the page script every card shows its own photograph at any width.
   context=await browser.new_context(viewport={'width':1440,'height':900},java_script_enabled=False)
   page=await context.new_page()
   await page.goto(base+'index.html')
   assert await page.locator('.occasion-stage').evaluate('e=>getComputedStyle(e).display')=='none'
   assert await page.locator('.occasion .occasion-photo').evaluate_all('e=>e.filter(i=>getComputedStyle(i).display!=="none").length')==10
   results.append({'engine':engine.name,'width':1440,'script':False})
   await context.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(results,indent=2))
 print(f'Occasion photographs: {len(results)} engine/width/motion cases passed.')

if __name__=='__main__':run(main)
