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

async def main(base,output):
    output.mkdir(parents=True,exist_ok=True)
    reports = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width, height in [(390,844),(1920,1080)]:
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
            await travel(page,.595,5)
            await page.wait_for_function('''() => {const v=document.querySelector('[data-cinema-film="ballroom"]');return v.readyState>=2&&!v.seeking&&v.currentTime>0;}''')
            await page.wait_for_function('''() => Array.from(document.querySelectorAll('[data-scene-detail="5"] .photo-slice img')).every(e=>e.complete&&e.naturalWidth>0)''')
            assert await page.locator('[data-scene-detail="5"] .photo-fragments').evaluate('e=>getComputedStyle(e).display')!='none'
            if width<650:
                mobile=await page.locator('[data-cinema-film="ballroom"]').evaluate('v=>({width:v.videoWidth,height:v.videoHeight})')
                assert mobile['width']<mobile['height']
            await page.screenshot(path=str(output/f'motion-{width}.png'))
            await travel(page,.965,8)
            for photo in await page.locator('.cinema-detail:visible').all():
                await photo.locator('.photo-slice img').first.wait_for()
                assert await photo.locator('.photo-fragments').evaluate('e=>getComputedStyle(e).display')!='none'
            reports.append({'viewport':[width,height],'word_reveal':'passed','translation':'passed','photo_assembly':'passed','decoded_source':actual})
            await page.close()
        await browser.close()
    print(json.dumps(reports,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/motion'));args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output))
    finally:server.shutdown()
