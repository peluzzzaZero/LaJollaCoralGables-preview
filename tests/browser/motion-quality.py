"""Exercise scroll-driven words, assembled real photos and source selection; no email."""
import asyncio
import argparse
import functools
import json
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler, travel

async def main(base,output,webkit=False,webkit_only=False):
    output.mkdir(parents=True,exist_ok=True)
    reports = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width, height in ([] if webkit_only else [(390,844),(1920,1080)]):
            page = await browser.new_page(viewport={'width':width,'height':height})
            await page.goto(base,wait_until='networkidle')
            await page.locator('[data-lang="en"]').click()
            await travel(page,.13,1)
            words = page.locator('#history > h3 .scroll-word')
            early = await words.evaluate_all('els=>els.map(e=>Number(getComputedStyle(e).opacity))')
            assert early and min(early)<.7, early
            photo = page.locator('[data-scene-detail="1"]')
            separated = await photo.evaluate('e=>Number(e.style.getPropertyValue("--photo-spread"))')
            await travel(page,.19,1)
            late = await words.evaluate_all('els=>els.map(e=>Number(getComputedStyle(e).opacity))')
            assert min(late)>.95 and sum(late)>sum(early), (early,late)
            assembled = await photo.evaluate('e=>Number(e.style.getPropertyValue("--photo-spread"))')
            assert separated>assembled and assembled<.01
            await page.wait_for_function('''() => Array.from(document.querySelectorAll('[data-scene-detail="1"] .photo-slice img')).every(e=>e.complete&&e.naturalWidth>0)''')
            assert await photo.locator('.photo-fragments').evaluate('e=>getComputedStyle(e).display')!='none'
            assert await photo.get_attribute('href')=='assets/venue/architecture.jpg'
            await page.locator('[data-lang="es"]').click()
            assert 'historia' in (await page.locator('#history > h3').text_content()).lower()
            assert await words.count()>0
            await travel(page,.055,0)
            await page.wait_for_function('''() => {const v=document.querySelector('[data-cinema-film="journey"]');return v.readyState>=2&&!v.seeking&&v.currentTime>0;}''')
            actual=await page.locator('[data-cinema-film="journey"]').evaluate('v=>({source:v.dataset.source,width:v.videoWidth})')
            assert actual['source']==('journey-hd' if width>=1500 else 'journey'), actual
            if width>=1500: assert actual['width']==1920
            await travel(page,.485,4)
            await page.wait_for_function('''() => {const v=document.querySelector('[data-cinema-film="details"]');return v.readyState>=2&&!v.seeking&&v.currentTime>0;}''')
            await page.wait_for_function('''() => Array.from(document.querySelectorAll('[data-scene-detail="4"] .photo-slice img')).every(e=>e.complete&&e.naturalWidth>0)''')
            assert await page.locator('[data-scene-detail="4"] .photo-fragments').evaluate('e=>getComputedStyle(e).display')!='none'
            if width<650:
                mobile=await page.locator('[data-cinema-film="details"]').evaluate('v=>({width:v.videoWidth,height:v.videoHeight})')
                assert mobile['width']<mobile['height']
                assert await page.locator('[data-cinema-film=details]').get_attribute('data-source')=='details-mobile'
            await travel(page,.455,4)
            await page.wait_for_function("""() => {const v=document.querySelector('[data-cinema-film=details]');return v.readyState>=2&&!v.seeking&&v.currentTime<.5;}""")
            first=await page.locator('[data-cinema-film="details"]').evaluate('v=>v.currentTime')
            await travel(page,.535,4)
            await page.wait_for_function("""() => {const v=document.querySelector('[data-cinema-film=details]');return !v.seeking&&v.currentTime>3.5;}""")
            last=await page.locator('[data-cinema-film="details"]').evaluate('v=>v.currentTime')
            assert last-first>3, (first,last)
            await travel(page,.485,4)
            await page.screenshot(path=str(output/f'motion-{width}.png'))
            await travel(page,.775)
            await page.wait_for_function("""() => {const v=document.querySelector('[data-cinema-film=house]');return v.readyState>=2&&!v.seeking&&v.currentTime<.08;}""")
            await travel(page,.965,8)
            for photo in await page.locator('.cinema-detail:visible').all():
                await photo.locator('.photo-slice img').first.wait_for()
                assert await photo.locator('.photo-fragments').evaluate('e=>getComputedStyle(e).display')!='none'
            reports.append({'viewport':[width,height],'word_reveal':'passed','translation':'passed','photo_assembly':'passed','decoded_source':actual,'chapter_five_seconds_advanced':last-first})
            await page.close()
        await browser.close()
        if webkit or webkit_only:
            browser=await p.webkit.launch()
            context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
            page=await context.new_page()
            await page.goto(base,wait_until='networkidle')
            await page.locator('[data-lang="en"]').click()
            frames=[]
            for progress,limit in [(.455,.5),(.535,3.5)]:
                await travel(page,progress,4)
                try:
                    await page.wait_for_function("""({progress,limit})=>{const v=document.querySelector('[data-cinema-film=details]');return v.readyState>=2&&!v.seeking&&(progress<.5?v.currentTime<limit:v.currentTime>limit)&&v.currentTime>0;}""",arg={'progress':progress,'limit':limit})
                except Exception:
                    state=await page.evaluate("""() => ({width:innerWidth,height:innerHeight,scroll:scrollY,scene:document.getElementById('cinema').dataset.scene,trigger:ScrollTrigger.getById('cinematic-journey')?.progress,videos:Array.from(document.querySelectorAll('[data-cinema-film]')).map(v=>({name:v.dataset.cinemaFilm,source:v.dataset.source,format:v.dataset.format,time:v.currentTime,duration:Number.isFinite(v.duration)?v.duration:null,ready:v.readyState,network:v.networkState,seeking:v.seeking,paused:v.paused,ended:v.ended,error:v.error?.code,decoded:v.classList.contains('is-decoded'),opacity:getComputedStyle(v).opacity,mp4:v.canPlayType('video/mp4'),webm:v.canPlayType('video/webm')}))})""")
                    print('WEBKIT DIAGNOSTIC '+json.dumps({'requested_progress':progress,'state':state}),flush=True)
                    (output/'webkit-state.json').write_text(json.dumps(state,indent=2))
                    await page.screenshot(path=str(output/'webkit-failed.png'))
                    raise
                frames.append(await page.locator('[data-cinema-film=details]').evaluate("""v=>{const c=document.createElement('canvas');c.width=160;c.height=284;c.getContext('2d').drawImage(v,0,0,160,284);return {time:v.currentTime,source:v.dataset.source,width:v.videoWidth,height:v.videoHeight,pixels:c.toDataURL()};}"""))
            assert frames[1]['time']-frames[0]['time']>3
            assert frames[0]['pixels']!=frames[1]['pixels']
            assert all(f['source']=='details-mobile' and f['width']<f['height'] for f in frames)
            await travel(page,.485,4)
            await page.wait_for_function("""()=>{const v=document.querySelector('[data-cinema-film=details]');return v.paused&&!v.seeking&&v.currentTime>1&&v.currentTime<2;}""")
            held=await page.locator('[data-cinema-film=details]').evaluate('v=>v.currentTime')
            await page.wait_for_timeout(1200)
            assert abs(await page.locator('[data-cinema-film=details]').evaluate('v=>v.currentTime')-held)<.05
            await page.screenshot(path=str(output/'chapter-five-webkit.png'))
            reports.append({'engine':'WebKit mobile emulation','chapter':'05','recorded_video':'passed','decoded_frames_change':'passed','seconds_advanced':frames[1]['time']-frames[0]['time']})
            await browser.close()
    print(json.dumps(reports,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/motion'));parser.add_argument('--webkit',action='store_true');parser.add_argument('--webkit-only',action='store_true');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args.webkit,args.webkit_only))
    finally:server.shutdown()
