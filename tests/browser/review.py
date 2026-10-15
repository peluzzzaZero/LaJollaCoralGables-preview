"""Review the complete editorial landing, real media and inert calendar."""
import argparse, asyncio, functools, json, os, re, threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright
ROOT=Path(os.environ.get('LAJOLLA_WEB_ROOT',Path(__file__).resolve().parents[2]))
CHAPTERS=['history','visit','events','alcazar','rentals','tour','social','team','location','planning']
def third_party_map_error(error):
 # WebKit surfaces failures inside Google's cross-origin map frame (blocked tiles) as page errors; they are not this site's.
 return bool(re.search(r'(google\.com/maps|maps\.googleapis\.com|maps\.gstatic\.com)/\S* due to access control checks',str(error)))
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*_):pass
async def mock_booking(route):
 await route.fulfill(content_type='text/html',body='<html><body><h1>Mock calendar</h1><button>Calendar control</button></body></html>')
async def scroll(page,y):
 await page.evaluate('y=>window.scrollTo(0,y)',y)
 await page.wait_for_timeout(150)
async def position(page,section,progress=0):
 await page.locator('#'+section).scroll_into_view_if_needed()
 await page.evaluate('id=>document.getElementById(id).scrollIntoView({block:"start",behavior:"instant"})',section)
 await page.wait_for_timeout(150)
async def verify_flow(page):
 assert await page.locator('main details, .chapter-more, .cinema-story, .brand-track').count()==0
 assert await page.locator('main video').count()==2 and await page.locator('main video.venue-walk-film').count()==1
 assert await page.locator('.occasion').count()==10
 assert await page.locator('.rentals-quiet li').count()==10
 assert await page.locator('.brand-card').count()==0
 assert await page.locator('#social .house-grid > li').count() in (6,12)
 assert await page.locator('.team-card').count()==2
 previous=0
 for name in CHAPTERS:
  e=page.locator('#'+name)
  state=await e.evaluate('''e=>{let opacity=1;for(let n=e;n;n=n.parentElement)opacity*=Number(getComputedStyle(n).opacity);return {top:e.getBoundingClientRect().top+scrollY,bottom:e.getBoundingClientRect().bottom+scrollY,position:getComputedStyle(e).position,opacity,inert:e.inert,hidden:e.hidden}}''')
  assert state['top']>=previous-1,(name,state,previous)
  assert state['position'] in ['relative','static'] and state['opacity']>=.999 and not state['inert'] and not state['hidden'],(name,state)
  previous=state['bottom']
  for prose in await e.locator('h2,h3,p,li,figcaption').all():
   if not (await prose.inner_text()).strip():continue
   assert await prose.is_visible(),(name,await prose.inner_text())
 assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
async def verify_reading_contrast(page):
 data=await page.evaluate("()=>{\n const lum=s=>{const c=s.match(/[\\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};\n return [...document.querySelectorAll('.landing-section h2,.landing-section h3,.landing-section p,.landing-section figcaption,.landing-section .btn,.landing-footer a')].filter(e=>e.textContent.trim()&&!e.closest('[hidden]')).map(e=>{\n let b=e;while(b.parentElement&&getComputedStyle(b).backgroundColor==='rgba(0, 0, 0, 0)')b=b.parentElement;\n const a=lum(getComputedStyle(e).color),c=lum(getComputedStyle(b).backgroundColor),size=parseFloat(getComputedStyle(e).fontSize);\n return {text:e.textContent.trim().slice(0,80),ratio:(Math.max(a,c)+.05)/(Math.min(a,c)+.05),minimum:size>=24?3:4.5};\n });\n}")
 for row in data:assert row['ratio']>=row['minimum'],row
async def check_header(page):
 logo=await page.locator('#header .logo').bounding_box();actions=await page.locator('.header-actions').bounding_box()
 assert logo['x']+logo['width']<=actions['x']+1,(logo,actions)
 box=await page.locator('#header').bounding_box();assert 0<=box['y']<=1 and box['height']<=90
async def main(base,output):
 output.mkdir(parents=True,exist_ok=True);rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  for width,height in [(320,600),(390,844),(768,1024),(884,884),(901,700),(1440,900)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];media=[]
   page.on('pageerror',lambda e:errors.append(str(e)) if not third_party_map_error(e) else None)
   page.on('request',lambda r:media.append(r.url) if r.url.endswith(('.mp4','.webm')) else None)
   await page.route('https://bookings.cloud.microsoft/**',mock_booking)
   await page.goto(base);await page.evaluate('document.fonts.ready')
   assert await page.locator('.booking-frame').get_attribute('src') is None
   for language in ['en','es']:
    await page.locator(f'[data-lang="{language}"]').click()
    await scroll(page,0);await check_header(page)
    await page.screenshot(path=str(output/f'entrance-{width}-{language}.png'))
    await verify_flow(page);await verify_reading_contrast(page)
    for name in CHAPTERS+['footer']:
     await position(page,name);await check_header(page)
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,name,language)
     await page.screenshot(path=str(output/f'{name}-{width}-{language}.png'))
    before=await page.evaluate('scrollY');url=page.url
    opener=page.locator('#header .inquire-link');await opener.click()
    await page.frame_locator('.booking-frame').locator('h1').wait_for()
    assert page.url==url
    await page.keyboard.press('Escape');await page.locator('#booking-viewer').wait_for(state='hidden')
    assert abs(await page.evaluate('scrollY')-before)<2
    assert await opener.evaluate('e=>e===document.activeElement')
    rows.append({'width':width,'language':language,'complete_visible_flow':True,'calendar':True})
   assert not errors,errors
   assert all(any(f'/cinematic/{n}.' in u for n in ('journey','journey-hd','venue-walk','venue-walk-mobile')) for u in media),media
   assert await page.locator('form').count()==0
   await page.close()
  await browser.close()
 (output/'results.json').write_text(json.dumps(rows,indent=2));print(f'Landing review: {len(rows)} responsive/language cases, complete content and same-page calendar passed.')
def run(main):
 parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('review-artifacts'));parser.add_argument('--webkit',action='store_true');parser.add_argument('--webkit-only',action='store_true');args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:asyncio.run(main(f'http://127.0.0.1:{server.server_port}/',args.output,args))
 finally:server.shutdown()
if __name__=='__main__':run(lambda base,out,args:main(base,out))
