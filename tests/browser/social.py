"""Use provider doubles to verify lazy loading, attribution and positive selection."""
import argparse, asyncio, functools, json, re, threading
from pathlib import Path
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from review import ROOT, QuietHandler, position

SDK = """window.google={maps:{importLibrary:async()=>({Place:class {
 constructor(options){if(options.id!=='ChIJWbeTzJu32YgRbGDUdwzI0W0')throw Error('Wrong venue');}
 async fetchFields(options){window.__mockFields=options.fields;this.attributions=[];
 const good={rating:5,originalText:'<b>Lovely celebration</b> in this test fixture.',originalTextLanguageCode:'en',publishTime:new Date('2024-06-01T12:00:00Z'),googleMapsURI:'https://www.google.com/maps/reviews/FAKE_REVIEW',authorAttribution:{displayName:'FAKE TEST AUTHOR',uri:'https://www.google.com/maps/contrib/FAKE_TEST_AUTHOR'}};
 this.reviews=[{...good,rating:1,originalText:'FAKE NEGATIVE REVIEW'},good,{...good,authorAttribution:{}},{...good,googleMapsURI:'javascript:alert(1)'}];
 }} })}};window.__lajollaMapsReady();"""

async def main(base, output, webkit=False):
    output.mkdir(parents=True,exist_ok=True);rows=[]
    async with async_playwright() as p:
        for engine in [p.chromium]+([p.webkit] if webkit else []):
            browser=await engine.launch()
            for width,height in [(320,600),(884,884),(1280,800)]:
                for mode in ['success','empty','failure','disabled']:
                    page=await browser.new_page(viewport={'width':width,'height':height});requests=[];errors=[]
                    page.on('pageerror',lambda e:errors.append(str(e)))
                    key='' if mode=='disabled' else 'FAKE_BROWSER_KEY_FOR_ISOLATED_TEST'
                    await page.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const meta=document.querySelector('meta[name=google-maps-browser-key]');if(meta)meta.content="+json.dumps(key)+"});")
                    async def google(route):
                        requests.append('google')
                        if mode=='failure':await route.abort()
                        else:await route.fulfill(content_type='application/javascript',body=SDK.replace('rating:5','rating:1') if mode=='empty' else SDK)
                    await page.route('https://maps.googleapis.com/**',google)
                    async def googleweb(route):
                        requests.append('google-web')
                        await route.fulfill(content_type='text/html',body='<html><body>FAKE GOOGLE MAPS</body></html>')
                    await page.context.route(re.compile(r'^https://www\.google\.com/'),googleweb)
                    await page.route('**/*.mp4',lambda route:route.abort());await page.route('**/*.webm',lambda route:route.abort())
                    await page.goto(base);assert not requests,'Social providers must not preload'
                    await position(page,'social')
                    button=page.locator('.reviews-load')
                    if mode=='disabled':assert await button.is_hidden()
                    else:
                        await button.click()
                        if mode=='success':
                            await page.locator('.guest-review').wait_for()
                            assert await page.locator('.guest-review').count()==1
                            assert await page.locator('.guest-review blockquote').inner_text()=='<b>Lovely celebration</b> in this test fixture.'
                            assert await page.locator('.guest-review blockquote b').count()==0
                            assert 'FAKE NEGATIVE REVIEW' not in await page.locator('.reviews-results').inner_text()
                            assert await page.locator('.review-author a').inner_text()=='FAKE TEST AUTHOR'
                            assert await page.locator('.guest-review time').get_attribute('datetime')=='2024-06-01T12:00:00.000Z'
                            assert await page.locator('.guest-review > a').get_attribute('href')=='https://www.google.com/maps/reviews/FAKE_REVIEW'
                            assert await page.locator('.GMP-attribution').inner_text()=='Google Maps'
                            assert await page.locator('.review-stars').get_attribute('aria-hidden')=='true'
                            assert '5 / 5' in await page.locator('.review-rating').inner_text()
                            assert await page.evaluate('window.__mockFields')==['reviews','attributions']
                            await page.locator('[data-lang=es]').click();assert 'cinco estrellas' in await page.locator('.reviews-selection').inner_text()
                        elif mode=='empty':
                            await page.wait_for_function("document.querySelector('.reviews-status').textContent.includes('Read guest experiences')")
                            assert await page.locator('.guest-review').count()==0
                        else:
                            await page.wait_for_function("document.querySelector('.reviews-status').textContent.includes('unavailable')")
                            await page.locator('[data-lang=es]').click()
                            assert 'no están disponibles' in await page.locator('.reviews-status').inner_text()
                        assert requests==['google']
                    card=page.locator('a.location-map')
                    await card.scroll_into_view_if_needed()
                    box=await card.bounding_box()
                    assert box and box['height']>=200,('The map card needs a real height in every engine',engine.name,width,box)
                    hit=await page.locator('.location-map-load').evaluate('a=>{const r=a.getBoundingClientRect();return a.closest("a.location-map").contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}')
                    assert hit,('The map card must receive taps',engine.name,width)
                    href=await card.get_attribute('href')
                    assert href.startswith('https://www.google.com/maps/search/?api=1&') and 'query_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0' in href and '301+Alcazar+Avenue' in href,href
                    assert await card.get_attribute('target')=='_blank'
                    assert await page.locator('main iframe').count()==0 and 'google-web' not in requests,'No embedded Google map'
                    async with page.expect_popup() as opened:
                        await card.click()
                    popup=await opened.value
                    await popup.wait_for_load_state()
                    assert 'query_place_id=ChIJWbeTzJu32YgRbGDUdwzI0W0' in popup.url and 'FAKE GOOGLE MAPS' in await popup.content(),popup.url
                    assert page.url.startswith(base),'The card opens Google Maps in a new tab and keeps the site open'
                    await popup.close();requests.remove('google-web')
                    for href in ['https://www.google.com/maps/dir/?api=1','https://search.google.com/local/writereview?placeid=ChIJWbeTzJu32YgRbGDUdwzI0W0','tel:+17862908813']:
                        assert await page.locator('main a[href^="'+href+'"]').count()==1,href
                    await page.screenshot(path=str(output/f'reviews-{engine.name}-{width}-{mode}.png'))
                    await position(page,'social')
                    for url in ['https://www.instagram.com/lajollacoralgables/','https://www.tiktok.com/@lajollacoralgables','https://www.pinterest.com/LaJollaCoralGables/']:
                        assert await page.locator('.social-links a[href="'+url+'"]').count()==1
                    assert await page.locator('a[href*="facebook.com"]').count()==0,'No Facebook link until the owner supplies the right account'
                    assert await page.locator('.house-stream iframe').count()==0
                    tiles=page.locator('.house-tile img');assert await tiles.count()==len(json.loads((Path(__file__).resolve().parents[2]/'assets/social/tiles.json').read_text()))
                    await page.locator('.house-stream').scroll_into_view_if_needed()
                    await page.wait_for_function("[...document.querySelectorAll('.house-tile img')].every(i=>i.complete&&i.naturalWidth>0)")
                    assert await page.evaluate("getComputedStyle(document.querySelector('.house-grid')).gridTemplateColumns.split(' ').length")==(6 if width>900 else 3)
                    assert [t['href'] for t in json.loads((Path(__file__).resolve().parents[2]/'assets/social/tiles.json').read_text())]==await page.locator('.house-tile').evaluate_all('a=>a.map(x=>x.getAttribute("href"))')
                    if mode=='success':
                        await page.locator('.house-stream').screenshot(path=str(output/f'house-{engine.name}-{width}-es.png'))
                        assert await page.locator('.house-grid').get_attribute('aria-label')=='La Jolla en Instagram: la casa'
                        assert 'Vea más en Instagram' in await page.locator('.house-handle').inner_text()
                    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
                    assert not errors,errors
                    rows.append({'engine':engine.name,'width':width,'mode':mode,'lazy':True,'only_positive':True})
                    await page.close()
            await browser.close()
    (output/'results.json').write_text(json.dumps(rows,indent=2))
    print(f'Social adapters: {len(rows)} mocked-provider cases passed; no real API calls or fabricated public reviews.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts/social'));parser.add_argument('--webkit',action='store_true');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args.webkit))
    finally:server.shutdown()
