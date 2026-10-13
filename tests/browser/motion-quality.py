"""Decode the single entrance forward/reverse and verify a bounded pin/fallbacks."""
import json
from playwright.async_api import async_playwright
from review import run, scroll, position, verify_flow
async def main(base,output,args):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  engines=[p.webkit] if args.webkit_only else [p.chromium]+([p.webkit] if args.webkit else [])
  for engine in engines:
   browser=await engine.launch()
   for width,height in [(390,844),(884,884),(1920,900)]:
    page=await browser.new_page(viewport={'width':width,'height':height});media=[];network=[];errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def record_media(request):
     if request.url.endswith(('.mp4','.webm')):
      media.append(request.url)
      network.append({'url':request.url,'type':request.resource_type,'range':request.headers.get('range')})
    page.on('request',record_media)
    await page.add_init_script('''(() => {
     const original=window.fetch; window.__entranceFetches=[];
     window.fetch=function(input,options) {
      const url=typeof input==='string'?new URL(input,location.href).href:input.url;
      if (/\\/cinematic\\/journey(?:-hd)?\\.(mp4|webm)$/.test(url)) window.__entranceFetches.push(url);
      return original.apply(this,arguments);
     };
    })();''')
    await page.goto(base);await page.evaluate('document.fonts.ready')
    await page.wait_for_function('window.__ljEntrance?.trigger')
    assert not media,'Entrance must not preload until scrolling'
    await page.locator('#hero').click(position={'x':12,'y':90})
    for fraction in [.2,.5,.9,.4,.1,.75]:
     await page.evaluate('p=>{const t=window.__ljEntrance.trigger;window.scrollTo(0,t.start+(t.end-t.start)*p);ScrollTrigger.update()}',fraction)
     try:
      await page.wait_for_function('''p=>{const v=document.querySelector('.entrance-video');return Number.isFinite(v.duration)&&v.paused&&!v.seeking&&v.readyState>=2&&Math.abs(v.currentTime-p*v.duration)<.12&&v.classList.contains('is-decoded')}''',arg=fraction,timeout=20000)
     except Exception:
      print('Entrance diagnostic '+json.dumps({'engine':engine.name,'width':width,'target':fraction,'state':await page.evaluate("()=>{const v=document.querySelector('.entrance-video'),t=__ljEntrance.trigger;return {scroll:scrollY,progress:t.progress,active:t.isActive,time:v.currentTime,duration:v.duration,ready:v.readyState,paused:v.paused,seeking:v.seeking,error:v.error?.message,src:v.currentSrc,class:v.className}}")}),flush=True)
      raise
     state=await page.locator('.entrance-video').evaluate('v=>({time:v.currentTime,duration:v.duration,paused:v.paused,muted:v.muted,src:v.currentSrc})')
     assert state['muted'] and state['paused'] and 4.9<state['duration']<5.2,state
     assert all('/cinematic/journey.' in u or '/cinematic/journey-hd.' in u for u in media),media
     await page.screenshot(path=str(output/f'frame-{engine.name}-{width}-{fraction}.png'))
    t=await page.evaluate('()=>({start:__ljEntrance.trigger.start,end:__ljEntrance.trigger.end})')
    assert 1.2*height<=t['end']-t['start']<=1.3*height
    await position(page,'events');await verify_flow(page)
    paused=await page.locator('.entrance-video').evaluate('v=>v.paused');assert paused
    # Native decoder loads/ranges can also be tagged "fetch" by WebKit.
    # Count explicit JS fetch calls independently of browser request labels.
    fetches=await page.evaluate('window.__entranceFetches')
    assert 1<=len(fetches)<=2 and len(set(fetches))==len(fetches),(fetches,network)
    assert len(set(media))<=2 and all(r['url'] in set(fetches) for r in network),(fetches,network)
    assert not errors,errors
    rows.append({'engine':engine.name,'width':width,'forward_reverse_decoded':True,'one_entrance_clip':True,'format_attempts':len(fetches),'explicit_fetches':fetches,'network_requests':network,'pin_span':t['end']-t['start']})
    await page.close()
   page=await browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
   await page.goto(base);await verify_flow(page)
   assert await page.locator('.entrance-video').get_attribute('src') is None
   assert await page.evaluate('!window.__ljEntrance.trigger')
   await page.emulate_media(reduced_motion='no-preference');await page.wait_for_function('window.__ljEntrance.trigger')
   await page.emulate_media(reduced_motion='reduce');await page.wait_for_function('!window.__ljEntrance.trigger')
   assert await page.locator('.entrance-video').get_attribute('src') is None
   await verify_flow(page);await page.close()
   await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Entrance decode: {len(rows)} real Chromium/WebKit cases passed; one five-second film and bounded pin.')
if __name__=='__main__':run(main)
