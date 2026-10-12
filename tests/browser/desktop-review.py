"""Desktop regressions: native wheel, decoded frames, resizing and readable geometry."""
import asyncio, argparse, functools, json, threading
from pathlib import Path
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler, travel

async def main(base, output):
 output.mkdir(parents=True, exist_ok=True);reports=[]
 async with async_playwright() as p:
  b=await p.chromium.launch()
  for w,h in [(1024,600),(1366,768),(1920,1080),(2560,1080)]:
   page=await b.new_page(viewport={'width':w,'height':h})
   await page.goto(base,wait_until='networkidle');await page.evaluate('document.fonts.ready')
   for language in ['en','es']:
    await page.locator('[data-lang='+language+']').click()
    for i,progress in enumerate([.035,.155,.265,.375,.485,.595,.705,.815,.965]):
     await travel(page,progress,i)
     card=await page.locator('.cinema-story:visible').bounding_box()
     bottom=await page.locator('.cinema-bottom').bounding_box()
     assert card['y']>=80 and card['y']+card['height']<bottom['y']-6,(w,h,language,i,card,bottom)
     assert await page.locator('.cinema-story:visible').count()==1
     for photo in await page.locator('.cinema-detail:visible').all():
      box=await photo.bounding_box();overlap=min(box['x']+box['width'],card['x']+card['width'])-max(box['x'],card['x'])>0 and min(box['y']+box['height'],card['y']+card['height'])-max(box['y'],card['y'])>0
      assert not overlap,(w,h,language,i,'photo overlaps copy')
      assert box['y']>=80 and box['y']+box['height']<bottom['y']-6,(w,h,language,i,'photo clips')
     if language=='es' and i in [0,1,2,4,5,6,7,8]:await page.screenshot(path=str(output/f'chapter-{w}-{i}.png'))
   # Actual wheel input, rather than test navigation alone, must drive decoded frames.
   await travel(page,.455,4)
   await page.wait_for_function("()=>{const v=document.querySelector('[data-cinema-film=stair-wide]');return v.readyState>=2&&!v.seeking&&v.currentTime<.5}")
   first=await page.locator('[data-cinema-film=stair-wide]').evaluate('v=>v.currentTime')
   distance=await page.evaluate("()=>{const s=ScrollTrigger.getById('cinematic-journey');return(s.end-s.start)*.08}")
   for _ in range(12):await page.mouse.wheel(0,distance/12);await page.wait_for_timeout(80)
   await page.wait_for_function("()=>{const v=document.querySelector('[data-cinema-film=stair-wide]');return !v.seeking&&v.currentTime>3.5}")
   last=await page.locator('[data-cinema-film=stair-wide]').evaluate('v=>v.currentTime');assert last-first>3
   await page.wait_for_timeout(600)
   held=await page.locator('[data-cinema-film=stair-wide]').evaluate('v=>v.currentTime');await page.wait_for_timeout(400)
   assert abs(held-await page.locator('[data-cinema-film=stair-wide]').evaluate('v=>v.currentTime'))<.03
   await page.set_viewport_size({'width':w,'height':600 if h!=600 else 768})
   await page.wait_for_timeout(500)
   span=await page.evaluate("()=>{const s=ScrollTrigger.getById('cinematic-journey');return(s.end-s.start)/innerHeight}")
   assert abs(span-11)<.05,('height-only refresh',span)
   if w==1366:
    await page.set_viewport_size({'width':1920,'height':768});await travel(page,.055,0)
    await page.wait_for_function("()=>document.querySelector('[data-cinema-film=journey]').dataset.source==='journey-hd'")
    await page.set_viewport_size({'width':1366,'height':768});await travel(page,.055,0)
    await page.wait_for_function("()=>document.querySelector('[data-cinema-film=journey]').dataset.source==='journey'")
   reports.append({'viewport':[w,h],'languages':['en','es'],'nine_chapters':'passed','wheel_seconds_advanced':last-first,'paused_reading':'passed','height_only_resize':'passed'})
   await page.close()
  # Desktop clips must not transfer into the approved phone camera.
  page=await b.new_page(viewport={'width':390,'height':844});requests=[]
  page.on('request',lambda r:requests.append(r.url));await page.goto(base,wait_until='networkidle')
  for i,pr in enumerate([.035,.155,.265,.375,.485,.595,.705,.815,.965]):await travel(page,pr,i)
  assert len(await page.evaluate('window.__ljStory.cameraSegments'))==8
  assert not any(any(name in url for name in ['history-wide','room-wide','stair-wide','identity-wide']) for url in requests),requests
  reports.append({'mobile':'passed','desktop_asset_transfers':0})
  await b.close()
 print(json.dumps(reports,indent=2))

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--base');a.add_argument('--output',type=Path,default=Path('review-artifacts/desktop'));args=a.parse_args()
 server=None
 if not args.base:
  server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
  threading.Thread(target=server.serve_forever,daemon=True).start()
 try:asyncio.run(main(args.base or f'http://127.0.0.1:{server.server_port}/',args.output))
 finally:
  if server:server.shutdown()
