"""Verify visible, bounded decoration without moving or concealing the reading flow."""
import json
from playwright.async_api import async_playwright
from review import run, verify_flow, third_party_map_error

async def album_at(page,fraction):
 await page.evaluate('f=>{const a=document.querySelector(".venue-album");scrollTo(0,a.getBoundingClientRect().top+scrollY+(a.offsetHeight-innerHeight)*f)}',fraction)
 await page.wait_for_timeout(250)
 return await page.evaluate('()=>({stage:document.querySelector(".album-stage").getBoundingClientRect().top,arrive:[...document.querySelectorAll(".album-print")].map(e=>Number(e.style.getPropertyValue("--arrive"))),index:document.querySelector(".album-index").textContent})')

async def verify_scenes(page,language):
 # The four detail photographs arrive in order inside one sticky stage and reverse.
 assert await page.locator('.album-stage').evaluate('e=>getComputedStyle(e).position')=='sticky'
 start=await album_at(page,0);middle=await album_at(page,.5);end=await album_at(page,1);back=await album_at(page,.5)
 assert start['arrive']==[1,0,0,0] and start['index']=='01',start
 assert abs(middle['stage'])<1 and 0<sum(middle['arrive'])<4,middle
 assert end['arrive']==[1,1,1,1] and end['index']=='04',end
 assert back==middle,(back,middle)
 # Repeated flings in both directions land on identical poses.
 first=await album_at(page,.3)
 for fraction in [.95,.05,.7,.15]:await album_at(page,fraction)
 assert await album_at(page,.3)==first
 # Translating mid-album keeps the stage and its pose.
 other='es' if language=='en' else 'en'
 await page.locator(f'[data-lang="{other}"]').click();await page.wait_for_timeout(300)
 assert (await album_at(page,.3))['arrive']==first['arrive']
 await page.locator(f'[data-lang="{language}"]').click();await page.wait_for_timeout(300)
 # Every occasion, including the right-hand column, becomes the current one.
 seen=set();steps=[];box=await page.locator('.events-list').bounding_box()
 top=await page.evaluate('document.querySelector(".events-list").getBoundingClientRect().top+scrollY')
 for step in range(0,int(box['height'])+200,40):
  # Wait for two rendered frames, not a fixed delay: WebKit can defer rendering
  # while the section's images decode, and the scene updates in the frame.
  await page.evaluate('y=>new Promise(done=>{scrollTo(0,y);requestAnimationFrame(()=>requestAnimationFrame(done))})',top+step-page.viewport_size['height']*.5)
  current=await page.locator('.occasion').evaluate_all('items=>items.map((e,i)=>e.classList.contains("is-current")?i:-1).filter(i=>i>=0)')
  seen.update(current);steps.append(current)
 assert seen==set(range(10)),(page.context.browser.browser_type.name,page.viewport_size,seen,steps)
 for print_ in await page.locator('.album-print').all():
  assert (await print_.locator('figcaption').inner_text()).strip()
 # Inked paragraphs keep their exact translated text and finish fully legible.
 for paragraph in await page.locator('[data-ink]').all():
  key=await paragraph.get_attribute('data-i18n')
  assert await page.evaluate('document.documentElement.lang')==language
  words=await paragraph.locator('.ink-word').all_inner_texts()
  assert ' '.join(words)==' '.join((await paragraph.inner_text()).split()),key
  assert await paragraph.locator('.ink-word').count()>3
  await paragraph.evaluate('e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.3)')
  await page.wait_for_timeout(500)
  assert await paragraph.locator('.ink-word').evaluate_all('w=>w.every(e=>getComputedStyle(e).opacity==="1")'),key
 # Scenes measured from untransformed references retrace the same pose after a fling.
 async def poses():
  return await page.evaluate('()=>[...document.querySelectorAll(".house-grid > li")].map(e=>e.style.getPropertyValue("--scatter")).concat([document.querySelector(".planning-seal").style.getPropertyValue("--stamp")])')
 mid='e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.85)'
 await page.locator('.house-grid').evaluate(mid);await page.wait_for_timeout(300);first=await poses()
 await page.evaluate('scrollTo(0,document.body.scrollHeight)');await page.wait_for_timeout(150)
 await page.evaluate('scrollTo(0,0)');await page.wait_for_timeout(150)
 await page.locator('.house-grid').evaluate(mid);await page.wait_for_timeout(300)
 assert await poses()==first,'Scatter and seal must reverse along the same path'
 # Settled scenes return to the readable layout.
 await page.locator('.house-grid').evaluate('e=>scrollTo(0,e.getBoundingClientRect().bottom+scrollY-innerHeight*.5)')
 await page.wait_for_timeout(300)
 assert await page.locator('.house-grid > li').first.evaluate('e=>Number(e.style.getPropertyValue("--scatter"))')==0
 await page.locator('.rentals-quiet').evaluate('e=>scrollTo(0,e.getBoundingClientRect().bottom+scrollY-innerHeight*.6)')
 await page.wait_for_timeout(300)
 assert await page.locator('.rentals-quiet li').evaluate_all('items=>items.every(e=>Number(e.style.getPropertyValue("--enter"))===0)')
 assert await page.locator('.occasion.is-current').count()<=2

async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  for engine in [p.chromium]+([p.webkit] if args.webkit else []):
   browser=await engine.launch()
   for width,height in [(390,844),(884,884),(1440,900)]:
    page=await browser.new_page(viewport={'width':width,'height':height})
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)) if not third_party_map_error(error) else None)
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
      active=await caption.evaluate_all('items=>items.filter(e=>getComputedStyle(e).display!=="none"&&Number(getComputedStyle(e).opacity)>.99).length')
      assert active==1,(width,fraction,active)
      phrase=await caption.evaluate_all('items=>items.find(e=>getComputedStyle(e).display!=="none"&&Number(getComputedStyle(e).opacity)>.99).getBoundingClientRect().bottom')
      assert phrase<state['top'],(width,fraction,phrase,state)
      cta=page.locator('#visit-cta');assert await cta.is_visible()
      box=await cta.bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1 and box['y']>=0 and box['y']+box['height']<=height+1,(width,fraction,box)
      await page.screenshot(path=str(output/f'arrival-{engine.name}-{width}-{language}-{fraction}.png'))
     assert len(set(poses))==3,'Entrance typography must accompany the zoom'
     # Two positions inside the same phrase must produce reversible motion.
     phrase_poses=[]
     for fraction in [.12,.25,.12]:
      await page.evaluate('p=>{const t=__ljEntrance.trigger;scrollTo(0,t.start+(t.end-t.start)*p);ScrollTrigger.update()}',fraction)
      await page.wait_for_timeout(100)
      phrase_poses.append(await page.locator('[data-entrance-phase="arrival"]').evaluate('e=>getComputedStyle(e).transform'))
     assert phrase_poses[0]!=phrase_poses[1] and phrase_poses[0]==phrase_poses[2], 'Caption motion must follow and reverse with scroll inside a phrase'

     for fraction in [.15,.52,.9,.52,.15]:
      await page.evaluate('p=>{const t=__ljEntrance.trigger;scrollTo(0,t.start+(t.end-t.start)*p);ScrollTrigger.update()}',fraction)
      await page.wait_for_timeout(30)
      displayed=await page.locator('.entrance-phrase').evaluate_all('items=>items.filter(e=>getComputedStyle(e).display!=="none").length')
      assert displayed==1,'Rapid scrubbing must never overlay different caption strings'
     image=page.locator('.history-photo img')
     await image.evaluate('e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight*.2)')
     await page.wait_for_timeout(1400)
     before=await image.evaluate('e=>getComputedStyle(e).transform')
     await page.evaluate('scrollBy(0,100)');await page.wait_for_timeout(200)
     after=await image.evaluate('e=>getComputedStyle(e).transform')
     assert before!=after and after!='none','Selected photography must have measured scroll depth'
     # Slow CI runners can take longer than the scroll pause to finish the reveal; wait for it rather than sampling once.
     try: await page.wait_for_function('e=>getComputedStyle(e).clipPath=="inset(0px)"',arg=await image.element_handle(),timeout=4000)
     except Exception: pass
     assert await image.evaluate('e=>getComputedStyle(e).clipPath')=='inset(0px)', 'Image reveal must finish'
     await verify_flow(page)
     occasion=page.locator('.occasion').nth(1)
     # Occasions no longer carry their own visit links (one floating Schedule a visit); the pointer drives them.
     assert await occasion.locator('a').count()==0
     await occasion.hover();await page.wait_for_timeout(600)
     if await page.evaluate('matchMedia("(hover: hover)").matches'):
      assert await occasion.locator('h3').evaluate('e=>getComputedStyle(e).transform')!='none', 'The pointer must receive the occasion interaction'
     await page.mouse.move(2,2)
     await occasion.scroll_into_view_if_needed()
     box=await occasion.bounding_box()
     await page.mouse.move(box['x']+box['width']*.25,box['y']+box['height']*.25)
     assert await occasion.evaluate('e=>e.style.getPropertyValue("--light-x")'), 'Editorial light must respond to the pointer'
     first=await page.locator('.events-list > li').first.bounding_box()
     other=await page.locator('.events-list > li').nth(1).bounding_box()
     if width>=884:assert first['width']>other['width']*1.8,'Weddings must span the occasion list'
     sizes=await page.locator('.occasion h3').evaluate_all('items=>items.map(e=>parseFloat(getComputedStyle(e).fontSize))')
     assert sizes[0]>max(sizes[1:]),'Only the wedding title should receive the larger treatment'
     window=page.locator('.hall-photo .photo-window')
     await window.scroll_into_view_if_needed();await page.wait_for_timeout(1000)
     picture=await window.bounding_box();caption=await page.locator('.hall-photo figcaption').bounding_box()
     assert picture['y']+picture['height']<=caption['y'], 'Photo movement must not paint over its caption'
     assert await window.evaluate('e=>getComputedStyle(e).overflow') in ['clip','hidden']
     assert await page.evaluate('ScrollTrigger.getAll().filter(t=>t.pin).length')==1,'Only the entrance film uses a GSAP pin'
     await verify_scenes(page,language)
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     await page.screenshot(path=str(output/f'depth-{engine.name}-{width}-{language}.png'))
     rows.append({'engine':engine.name,'width':width,'language':language,'arrival_layers':True,'photo_depth':True,'reading_flow':True})
    # Short or landscape screens keep the photographs as an ordinary readable grid.
    await page.set_viewport_size({'width':844,'height':390});await page.wait_for_timeout(300)
    assert not await page.locator('.venue-album').evaluate('e=>e.classList.contains("is-staged")')
    assert await page.locator('.album-print').evaluate_all('items=>items.every(e=>getComputedStyle(e).position==="static"&&e.getBoundingClientRect().width>150)')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    await page.set_viewport_size({'width':width,'height':height});await page.wait_for_timeout(300)
    assert await page.locator('.venue-album').evaluate('e=>e.classList.contains("is-staged")')
    await page.emulate_media(reduced_motion='reduce');await page.wait_for_timeout(150)
    assert await image.evaluate('e=>getComputedStyle(e).transform')=='none'
    assert await image.evaluate('e=>getComputedStyle(e).clipPath')=='none'
    assert await page.evaluate('!__ljEntrance.trigger')
    assert await page.locator('.landing-reading-progress').is_hidden()
    await page.locator('.occasion').nth(1).hover()
    await page.wait_for_timeout(500)
    assert await page.locator('.occasion h3').nth(1).evaluate('e=>getComputedStyle(e).transform')=='none', 'Reduced motion must remove occasion travel'
    cta=page.locator('#visit-cta')
    await cta.focus();await page.wait_for_timeout(300)
    assert await cta.evaluate('e=>getComputedStyle(e).transitionDuration.split(",").every(d=>parseFloat(d)===0)'), 'Reduced motion must remove the visit button easing'

    assert await page.locator('.ink-word').count()==0,'Reduced motion must restore plain paragraphs'
    assert await page.locator('.album-stage').evaluate('e=>getComputedStyle(e).position')!='sticky'
    assert await page.locator('.album-print').evaluate_all('items=>items.every(e=>getComputedStyle(e).position==="static"&&getComputedStyle(e).transform==="none")')
    await verify_flow(page);assert not errors,errors;await page.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2))
 print(f'Landing decoration: {len(rows)} EN/ES engine/viewport cases passed; visible reading and reduced-motion reset.')
if __name__=='__main__':run(main)
