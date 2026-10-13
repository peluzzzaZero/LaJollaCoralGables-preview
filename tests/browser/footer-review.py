"""Regression review of contact layout at both sides of responsive breakpoints."""
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
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width in [320, 390, 768, 884, 901, 1024, 1280]:
            for route in ['index.html', 'planning.html']:
                page = await browser.new_page(viewport={'width': width, 'height': 884})
                await page.goto(base + route)
                await page.evaluate('document.fonts.ready')
                for language in ['en', 'es']:
                    await page.locator(f'[data-lang="{language}"]').click()
                    await page.locator('#footer').scroll_into_view_if_needed()
                    await page.wait_for_timeout(350)
                    geometry = await page.locator('#footer').evaluate('''footer => {
                        const cards = [...footer.querySelectorAll('.footer-grid > div')];
                        const out = cards.flatMap(card => [...card.querySelectorAll('a,p,h3')]
                            .filter(el => {const r=el.getBoundingClientRect(), c=card.getBoundingClientRect();
                                return r.left<c.left-1 || r.right>c.right+1;})
                            .map(el=>el.textContent));
                        const footerRect = footer.getBoundingClientRect();
                        return {overflow: out, height:footerRect.height,
                            pageOverflow:document.documentElement.scrollWidth>innerWidth+1,
                            background:getComputedStyle(footer).backgroundColor,
                            columns:cards.map(el=>el.getBoundingClientRect().toJSON())};
                    }''')
                    assert not geometry['overflow'] and not geometry['pageOverflow'], geometry
                    assert geometry['height'] < (660 if width < 481 else 400), geometry
                    boxes = geometry['columns']
                    for i, a in enumerate(boxes):
                        for b in boxes[i+1:]:
                            assert not (min(a['right'],b['right'])>max(a['left'],b['left'])+1 and
                                        min(a['bottom'],b['bottom'])>max(a['top'],b['top'])+1), geometry
                    assert await page.locator('#footer a[href^="mailto:"]').count() == 1
                    assert await page.locator('#footer a[href="terms.html"]').count() == 1
                    assert await page.locator('#footer a[href="privacy.html"]').count() == 1
                    if route == 'index.html':
                        assert geometry['background'] == 'rgb(16, 32, 25)'
                    await page.screenshot(path=str(output / f'{route[:-5]}-{width}-{language}.png'))
                    results.append({'route':route,'width':width,'language':language,**geometry})
                await page.close()
        await browser.close()
    (output/'results.json').write_text(json.dumps(results,indent=2))
    print(f'Footer: {len(results)} responsive/language combinations passed.')

if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--output', type=Path, default=Path('review-artifacts/footer')); args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try: asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output))
    finally: server.shutdown()
