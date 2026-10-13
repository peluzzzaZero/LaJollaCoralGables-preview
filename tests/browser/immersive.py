"""Verify a continuous visit, in-frame contact and inert live-content adapters."""
import argparse, asyncio, functools, json, threading
from pathlib import Path
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler, travel, POSITIONS

async def main(base, output, webkit=False):
    output.mkdir(parents=True, exist_ok=True)
    rows=[]
    async with async_playwright() as p:
        for engine in [p.chromium]+([p.webkit] if webkit else []):
            browser=await engine.launch()
            for width,height in [(320,600),(390,844),(884,884),(1366,500),(1366,768)]:
                context=await browser.new_context(viewport={'width':width,'height':height})
                page=await context.new_page(); requests=[]; errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                async def provider(route):
                    requests.append(route.request.url)
                    await route.fulfill(content_type='text/html',body='<html><body><h1>Mock calendar</h1><button>Calendar</button></body></html>')
                await context.route('https://bookings.cloud.microsoft/**',provider)
                await page.route('**/*.mp4',lambda route:route.abort())
                await page.route('**/*.webm',lambda route:route.abort())
                await page.goto(base)
                await page.evaluate('document.fonts.ready')
                assert not requests
                for language in ['en','es']:
                    await page.locator(f'[data-lang="{language}"]').click()
                    for n,progress in enumerate(POSITIONS):
                        await travel(page,progress,n)
                        footer=page.locator('#footer')
                        assert await footer.is_visible()
                        bounds=await footer.bounding_box();stage=await page.locator('.cinema-stage').bounding_box()
                        assert bounds['y']>=stage['y'] and bounds['y']+bounds['height']<=stage['y']+stage['height']+1
                        assert bounds['x']>=0 and bounds['x']+bounds['width']<=width
                        assert bounds['y']>=height-96,'Contact must stay at the bottom of the film frame'
                    before=await page.evaluate('scrollY');url=page.url
                    await page.locator('.inquire-link').click()
                    await page.frame_locator('.booking-frame').locator('h1').wait_for()
                    assert page.url==url and len(requests)==1
                    await page.screenshot(path=str(output/f'calendar-{engine.name}-{width}-{language}.png'))
                    await page.keyboard.press('Escape')
                    await page.wait_for_function('!document.body.classList.contains("booking-open")')
                    assert abs(await page.evaluate('scrollY')-before)<2
                    assert await page.locator('.inquire-link').evaluate('e=>e===document.activeElement')
                    await page.locator('.contact-directory > summary').click()
                    panel=page.locator('.contact-panel');rect=await panel.bounding_box()
                    await page.screenshot(path=str(output/f'contact-{engine.name}-{width}-{language}.png'))
                    assert rect['x']>=0 and rect['x']+rect['width']<=width+1 and rect['y']>=68 and rect['y']+rect['height']<=height,(width,height,rect)
                    assert await panel.locator('a[href^="mailto:"]').is_visible()
                    await page.screenshot(path=str(output/f'contact-{engine.name}-{width}-{language}.png'))
                    await page.locator('.contact-close').click()
                    assert await page.locator('.contact-directory > summary').evaluate('e=>e===document.activeElement')
                    await page.locator('.cinema-inquiry:visible').click()
                    await page.frame_locator('.booking-frame').locator('h1').wait_for()
                    assert page.url==url and len(requests)==1,'Booking session must be preserved'
                    await page.keyboard.press('Escape')
                    await page.wait_for_function('!document.body.classList.contains("booking-open")')
                    rows.append({'engine':engine.name,'width':width,'language':language,'persistent_contact':True,'direct_calendar':True})
                assert not errors,errors
                await context.close()
            context=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
            page=await context.new_page();await page.goto(base)
            assert 'bookings.cloud.microsoft' in await page.locator('.inquire-link').get_attribute('href')
            await page.locator('.contact-directory > summary').scroll_into_view_if_needed()
            await page.locator('.contact-directory > summary').click()
            panel=page.locator('.contact-panel');assert await panel.is_visible()
            bounds=await panel.bounding_box();assert bounds['y']>=0 and bounds['x']>=0,bounds
            assert await panel.locator('a[href^="mailto:"]').is_visible()
            assert await page.locator('.contact-close').is_hidden()
            assert await page.locator('.social-load').is_hidden()
            await context.close()
            await browser.close()
    (output/'results.json').write_text(json.dumps(rows,indent=2))
    print(f'Immersive visit: {len(rows)} language/viewport/browser cases passed; no real bookings.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/immersive'));parser.add_argument('--webkit',action='store_true');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args.webkit))
    finally:server.shutdown()
