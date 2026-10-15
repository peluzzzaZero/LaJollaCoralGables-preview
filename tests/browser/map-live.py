"""Open the real Google map embed used in the Location chapter and report what it shows.

Needs network access to Google, so CI runs it as an informational step. It prints whether
the embed resolved the street address and a small JPEG of the frame for reviewers.
"""
import asyncio, base64, re, sys
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
async def main():
    html=(ROOT/'index.html').read_text()
    src=re.search(r'<iframe class="location-map-frame" src="([^"]+)"',html).group(1).replace('&amp;','&')
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={'width':640,'height':420},locale='en-US')
        # The embed refuses to render as a top-level page, so host it the way the site does.
        await page.set_content(f'<body style="margin:0"><iframe src="{src}" style="border:0;width:640px;height:420px"></iframe></body>')
        await page.wait_for_timeout(8000)
        frame=page.frames[1]
        # Google draws the place card in a nested frame, so read every frame's text.
        texts=[]
        for f in page.frames[1:]:
            try: texts.append(await f.evaluate('document.body ? document.body.innerText : ""'))
            except Exception: pass
        text='\n'.join(texts)
        print('MAP-LIVE frame url:',frame.url)
        print('MAP-LIVE url:',src)
        print('MAP-LIVE resolved address:', 'Alcazar' in text)
        print('MAP-LIVE text:',' | '.join(t.strip() for t in text.splitlines() if t.strip())[:400])
        shot=await page.screenshot(type='jpeg',quality=45)
        print('MAP-LIVE jpeg base64:',base64.b64encode(shot).decode())
        await browser.close()
asyncio.run(main())
