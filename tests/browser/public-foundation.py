"""Verify the deployed package's boundaries, metadata and accessible tour navigation."""
import argparse
import asyncio
import functools
import json
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler

async def main(base, output):
    output.mkdir(parents=True, exist_ok=True)
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        request=await p.request.new_context()
        for path in ['AGENTS.md','server/app.mjs','tests/RELEASES.md','scripts/review-feature.py',
                     'package.json','.env','assets/venue/cinematic/journey-source.json']:
            response=await request.get(base+path)
            assert response.status==404, ('Development file is published',path,response.status)
        await request.dispose()
        descriptions=set()
        for width,height in [(320,600),(390,844),(884,884),(1366,768)]:
            page=await browser.new_page(viewport={'width':width,'height':height})
            # This review covers static boundaries, labels and layout; decoder tests are separate.
            await page.route('**/*.mp4',lambda route: route.abort())
            await page.route('**/*.webm',lambda route: route.abort())
            for filename in ['index.html','planning.html','privacy.html','terms.html']:
                if page.url.startswith(base):
                    await page.evaluate('localStorage.removeItem("lajolla-language")')
                await page.goto(base+filename)
                await page.evaluate('document.fonts.ready')
                initial=await page.locator('meta[name=description]').get_attribute('content')
                if width==320:
                    assert initial not in descriptions,'Duplicate page description'
                    descriptions.add(initial)
                schema=json.loads(await page.locator('script[type="application/ld+json"]').text_content())
                assert schema['@context']=='https://schema.org'
                objects=schema.get('@graph',[schema])
                canonical=await page.locator('link[rel=canonical]').get_attribute('href')
                assert next(o for o in objects if o['@type']=='WebPage')['url']==canonical
                assert await page.locator('meta[property="og:url"]').get_attribute('content')==canonical
                languages=['en','es']
                for language in languages:
                    if await page.locator(f'[data-lang="{language}"]').count():
                        await page.locator(f'[data-lang="{language}"]').click()
                    else:
                        await page.evaluate('lang=>localStorage.setItem("lajolla-language",lang)',language)
                        await page.reload()
                        await page.evaluate('document.fonts.ready')
                    await page.wait_for_timeout(100)
                    title=await page.title()
                    desc=await page.locator('meta[name=description]').get_attribute('content')
                    assert await page.locator('meta[property="og:title"]').get_attribute('content')==title
                    assert await page.locator('meta[property="og:description"]').get_attribute('content')==desc
                    assert await page.locator('meta[name="twitter:title"]').get_attribute('content')==title
                    assert await page.locator('meta[property="og:locale"]').get_attribute('content')==language+'_US'
                    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (filename,width,language)
                    assert await page.locator('form').count()==0
                    if filename=='index.html':
                        assert await page.locator('main details').count()==0
                        assert await page.locator('main .landing-section').count()==10
                        header=await page.locator('.header-inner').bounding_box()
                        logo=await page.locator('#header .logo').bounding_box()
                        actions=await page.locator('.header-actions').bounding_box()
                        assert logo['x']+logo['width'] <= actions['x']+1, ('Header overlaps',width,language,logo,actions)
                        cta=page.locator('#visit-cta')
                        assert (await cta.text_content()).strip()==('Schedule a visit' if language=='en' else 'Agende una visita')
                        assert await page.locator('[data-booking-opener][data-i18n="form.planning"]').count()==1
                        box=await cta.bounding_box();inner=await page.evaluate('innerHeight')
                        assert box['height']>=44 and box['x']>=0 and box['x']+box['width']<=width and box['y']>=header['y']+header['height']-1 and box['y']+box['height']<=inner+1,(width,language,box)
                        if width<=900:
                            await page.locator('.mobile-menu > summary').click()
                            link=page.locator('.mobile-chapters a[href="#events"]')
                        else:link=page.locator('.chapter-nav a[href="#events"]')
                        await link.press('Enter')
                        await page.wait_for_function('location.hash==="#events"')
                        assert await page.locator('#events-title').evaluate('e=>e===document.activeElement')
                        assert await page.locator('#events-title').is_visible()
                        await page.screenshot(path=str(output/f'navigation-{width}-{language}.png'))
                    if filename=='planning.html':
                        assert await page.locator('[data-booking-opener]').count()==1
                        assert 'bookings.cloud.microsoft' in await page.locator('[data-booking-opener]').get_attribute('href')
                    results.append({'page':filename,'width':width,'language':language,'metadata':'passed','layout':'passed'})
            await page.close()
        await browser.close()
    (output/'results.json').write_text(json.dumps(results,indent=2))
    print(f'Public package: exclusions, metadata, chapter labels and {len(results)} page/language/width checks passed.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/foundation'));args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output))
    finally:server.shutdown()
