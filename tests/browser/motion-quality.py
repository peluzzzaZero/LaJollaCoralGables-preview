"""Exercise readable editorial copy, selected photo assembly and video scrubbing; no email."""
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
            if width < 650:
                await page.add_init_script("""{
                    const play=HTMLMediaElement.prototype.play;
                    window.primeRequests=0;
                    HTMLMediaElement.prototype.play=function(){
                        if(this.dataset.cinemaFilm==='details' && ++window.primeRequests===1)
                            return Promise.reject(new DOMException('Isolated decoder retry fixture','NotAllowedError'));
                        return play.call(this);
                    };
                }""")
            await page.goto(base,wait_until='networkidle')
            await page.locator('[data-lang="en"]').click()
            assert await page.locator('.cinema-story .scroll-word').count()==0
            await travel(page,.235,2)
            photo=page.locator('[data-scene-detail="2"]')
            separated=await photo.evaluate('e=>Number(e.style.getPropertyValue("--photo-spread"))')
            await travel(page,.29,2)
            assembled=await photo.evaluate('e=>Number(e.style.getPropertyValue("--photo-spread"))')
            assert separated>assembled and assembled<.01
            await page.wait_for_function("() => Array.from(document.querySelectorAll('[data-scene-detail=\"2\"] .photo-slice img')).every(e=>e.complete&&e.naturalWidth>0)")
            assert await photo.get_attribute('href')=='assets/venue/ballroom.jpg'
            await page.locator('[data-lang="es"]').click()
            assert 'salón' in (await page.locator('#visit > h3').text_content()).lower()
            assert await page.locator('.cinema-position [data-current-chapter]').text_content()=='Espacios'
            await travel(page,.055,0)
            await page.wait_for_function('''() => {const v=document.querySelector('[data-cinema-film="journey"]');return v.readyState>=2&&!v.seeking&&v.currentTime>0;}''')
            actual=await page.locator('[data-cinema-film="journey"]').evaluate('v=>({source:v.dataset.source,width:v.videoWidth})')
            assert actual['source']==('journey-hd' if width>=1500 else 'journey'), actual
            if width>=1500: assert actual['width']==1920
            camera='details' if width<650 else 'stair-wide'
            await travel(page,.455,4)
            await page.wait_for_function("name=>{const v=document.querySelector('[data-cinema-film='+name+']');return v.readyState>=2&&!v.seeking&&v.currentTime>0;}",arg=camera)
            first=await page.locator('[data-cinema-film="'+camera+'"]').evaluate('v=>v.currentTime')
            await travel(page,.535,4)
            await page.wait_for_function("({name,first})=>{const v=document.querySelector('[data-cinema-film='+name+']');return !v.seeking&&v.currentTime>first+3;}",arg={'name':camera,'first':first})
            last=await page.locator('[data-cinema-film="'+camera+'"]').evaluate('v=>v.currentTime')
            assert last-first>3,(first,last)
            if width<650:
                assert await page.evaluate('primeRequests') >= 2, 'Rejected mobile prime did not retry'
                assert await page.locator('[data-cinema-film=details]').get_attribute('data-source')=='details-mobile-hq'
            else:
                assert await page.locator('[data-cinema-film=details]').get_attribute('data-source') is None
            await travel(page,.485,4)
            # After several clips have warmed, scrubbing within one segment must
            # not seek hidden clips. A quick reversal must settle at the latest
            # requested frame rather than an older queued position.
            await travel(page,.79,7)
            await travel(page,.485,4)
            await page.wait_for_timeout(800)
            await page.evaluate("""()=>{window.hiddenSeeks=[];
                document.querySelectorAll('[data-cinema-film]').forEach(v=>v.addEventListener('seeking',()=>{
                    if(v.closest('[data-film-layer]').style.opacity==='0') hiddenSeeks.push(v.dataset.cinemaFilm);
                }));}""")
            for target in [.51,.48,.53,.46,.49]:
                await page.evaluate("""p=>{const t=ScrollTrigger.getById('cinematic-journey');
                    window.scrollTo(0,t.start+(t.end-t.start)*p);ScrollTrigger.update();}""",target)
                await page.wait_for_timeout(45)
            await page.wait_for_timeout(1000)
            assert await page.evaluate('hiddenSeeks') == []
            state=await page.locator('[data-cinema-film="'+camera+'"]').evaluate("""v=>{
                const p=Number(document.querySelector('#cinema').style.getPropertyValue('--world-progress'));
                const x=Math.min(1,Math.max(0,(p-.45)/.11)), c=x-.5;
                const expected=((1-.12)*x+.12*(4*c*c*c+.5))*v.duration;
                return {time:v.currentTime,expected,seeking:v.seeking,paused:v.paused};}""")
            assert abs(state['time']-state['expected'])<.08 and not state['seeking'] and state['paused'],state
            await page.screenshot(path=str(output/f'motion-{width}.png'))
            await page.locator('.cinema-directory > summary').click()
            await page.locator('button[data-scene="6"]').click()
            await page.wait_for_function('document.querySelector("#cinema").dataset.scene==="6"')
            assert await page.locator('.cinema-directory').get_attribute('open') is None
            await page.locator('.cinema-directory > summary').click();await page.keyboard.press('Escape')
            assert await page.locator('.cinema-directory > summary').evaluate('e=>e===document.activeElement')
            reports.append({'viewport':[width,height],'complete_type':'passed','translation':'passed','room_photo_assembly':'passed','chapter_directory':'passed','decoded_source':actual,'chapter_five_seconds_advanced':last-first})
            await page.close()
        await browser.close()
        if webkit or webkit_only:
            for trial in range(3):
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
                        state=await page.evaluate("""() => ({width:innerWidth,height:innerHeight,scroll:scrollY,scene:document.getElementById('cinema').dataset.scene,trigger:ScrollTrigger.getById('cinematic-journey')?.progress,videos:Array.from(document.querySelectorAll('[data-cinema-film]')).map(v=>({name:v.dataset.cinemaFilm,source:v.dataset.source,format:v.dataset.format,time:v.currentTime,duration:Number.isFinite(v.duration)?v.duration:null,ready:v.readyState,network:v.networkState,seeking:v.seeking,paused:v.paused,ended:v.ended,error:v.error?.code,decoded:v.classList.contains('is-decoded'),priming:!!v.priming,primeAttempts:v.primeAttempts,frameRequested:!!v.frameRequested,opacity:getComputedStyle(v).opacity,mp4:v.canPlayType('video/mp4'),webm:v.canPlayType('video/webm')}))})""")
                        print('WEBKIT DIAGNOSTIC '+json.dumps({'requested_progress':progress,'state':state}),flush=True)
                        (output/'webkit-state.json').write_text(json.dumps(state,indent=2))
                        await page.screenshot(path=str(output/'webkit-failed.png'))
                        raise
                    frames.append(await page.locator('[data-cinema-film=details]').evaluate("""v=>{const c=document.createElement('canvas');c.width=160;c.height=284;c.getContext('2d').drawImage(v,0,0,160,284);return {time:v.currentTime,source:v.dataset.source,width:v.videoWidth,height:v.videoHeight,pixels:c.toDataURL()};}"""))
                assert frames[1]['time']-frames[0]['time']>3
                assert frames[0]['pixels']!=frames[1]['pixels']
                assert all(f['source']=='details-mobile-hq' and f['width']<f['height'] for f in frames)
                await travel(page,.485,4)
                await page.wait_for_function("""()=>{const v=document.querySelector('[data-cinema-film=details]');return v.paused&&!v.seeking&&v.currentTime>1&&v.currentTime<2;}""")
                held=await page.locator('[data-cinema-film=details]').evaluate('v=>v.currentTime')
                await page.wait_for_timeout(1200)
                assert abs(await page.locator('[data-cinema-film=details]').evaluate('v=>v.currentTime')-held)<.05
                await page.screenshot(path=str(output/f'chapter-five-webkit-{trial}.png'))
                reports.append({'cold_visit':trial+1,'engine':'WebKit mobile emulation','chapter':'05','recorded_video':'passed','decoded_frames_change':'passed','seconds_advanced':frames[1]['time']-frames[0]['time']})
                await browser.close()
    print(json.dumps(reports,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/motion'));parser.add_argument('--webkit',action='store_true');parser.add_argument('--webkit-only',action='store_true');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args.webkit,args.webkit_only))
    finally:server.shutdown()
