"""Open chapter readers during their entrance/exit fades, as in the owner video."""
import argparse
import asyncio
import functools
import json
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler, travel, check_reader_legibility

READERS = [('history',1,.12,.21),('visit',2,.23,.32),('events',3,.34,.43),
           ('alcazar',4,.45,.54),('rentals',5,.56,.65),('gallery',6,.67,.76),('team',7,.78,.87)]

async def main(base, output, webkit=False):
    output.mkdir(parents=True, exist_ok=True)
    results=[]
    async with async_playwright() as p:
        for engine in ['chromium'] + (['webkit'] if webkit else []):
            browser=await getattr(p,engine).launch()
            for width,height in [(390,844),(884,884),(1366,768)]:
                page=await browser.new_page(viewport={'width':width,'height':height})
                # Video download/decoder timing is independent of reader opacity.
                await page.route('**/assets/venue/cinematic/*.mp4',lambda route: route.abort())
                await page.route('**/assets/venue/cinematic/*.webm',lambda route: route.abort())
                await page.goto(base)
                await page.evaluate('document.fonts.ready')
                for language in ['en','es']:
                    await page.locator(f'[data-lang="{language}"]').click()
                    for chapter,index,start,end in READERS:
                        for edge,progress in [('entry',start+.003),('exit',end-.003)]:
                            await travel(page,progress,index)
                            before=await page.evaluate('scrollY')
                            summary=page.locator(f'#{chapter} .chapter-more > summary')
                            await summary.click()
                            await page.wait_for_function('document.body.classList.contains("reading-details")')
                            body=page.locator(f'#{chapter} .chapter-body')
                            state=await body.evaluate('''e=>{
                                const panel=e.closest('.cinema-story');
                                let opacity=1;for(let n=e;n;n=n.parentElement) opacity*=Number(getComputedStyle(n).opacity);
                                return {opacity,background:getComputedStyle(panel).backgroundColor,
                                        chapter:panel.id,captionOpacity:Number(panel.style.opacity)};
                            }''')
                            assert state['captionOpacity']<.8, 'Fixture did not reach the fade band'
                            assert state['opacity']>=.999, ('Open reader is translucent',engine,width,language,chapter,edge,state)
                            assert state['background']=='rgb(16, 32, 25)', state
                            await check_reader_legibility(body)
                            assert await body.evaluate('e=>e.closest(".cinema-story").scrollWidth <= e.closest(".cinema-story").clientWidth'), ('Reader content overflows horizontally',engine,width,language,chapter,edge,await body.evaluate('e=>{const p=e.closest(".cinema-story");return {client:p.clientWidth,scroll:p.scrollWidth,wide:[...e.querySelectorAll("*")].filter(n=>n.getBoundingClientRect().right>p.getBoundingClientRect().right).map(n=>({tag:n.tagName,cls:n.className,width:n.getBoundingClientRect().width}))}}'))
                            assert await page.evaluate('document.fonts.check("500 32px Cormorant Garamond")'), 'Editorial font failed to load'
                            reader=page.locator(f'#{chapter}')
                            await reader.evaluate('e=>{e.scrollTop=e.scrollHeight}')
                            assert abs(await page.evaluate('scrollY')-before)<2,'Reading moved the film'
                            if chapter=='events' and language=='en' and edge=='entry':
                                await reader.evaluate('e=>{e.scrollTop=0}')
                                await page.screenshot(path=str(output/f'{engine}-{width}-events.png'))
                            await page.keyboard.press('Escape')
                            await page.wait_for_function('!document.body.classList.contains("reading-details")')
                            assert await summary.evaluate('e=>e===document.activeElement')
                            closed=await reader.evaluate('e=>Number(getComputedStyle(e).opacity)')
                            assert closed<.8,'Closing failed to restore the caption fade'
                            assert abs(await page.evaluate('scrollY')-before)<2
                            results.append({'engine':engine,'width':width,'language':language,'chapter':chapter,'edge':edge,**state})
                await page.close()
            await browser.close()
    (output/'results.json').write_text(json.dumps(results,indent=2))
    print(f'Reader transitions: {len(results)} cases passed.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/readers'));parser.add_argument('--webkit',action='store_true');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args.webkit))
    finally:server.shutdown()
