"""Render the preview, exercise its forms, and save scroll evidence without emailing anyone."""

import argparse
import asyncio
import functools
import json
import os
from pathlib import Path
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from playwright.async_api import async_playwright


ROOT = Path(__file__).resolve().parents[2]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


async def scroll(page, y):
    await page.evaluate("""y => {
      if (window.__ljLenis) window.__ljLenis.scrollTo(y, {immediate: true});
      else window.scrollTo(0, y);
      if (window.ScrollTrigger) window.ScrollTrigger.update();
    }""", y)
    await page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")


async def position(page, section, progress=0):
    y = await page.evaluate("""({section, progress}) => {
      const el = document.getElementById(section);
      const st = window.ScrollTrigger && ScrollTrigger.getAll().find(t => t.trigger === el && t.vars.pin);
      return st ? st.start + (st.end - st.start) * progress
        : el.getBoundingClientRect().top + scrollY - 80 + el.offsetHeight * progress;
    }""", {"section": section, "progress": progress})
    await scroll(page, max(0, y))


async def snapshot(page, output, name):
    # Wait for native smooth scrolling to finish before recording fixed layers.
    await page.evaluate("""() => new Promise(resolve => {
      let last = scrollY, stable = 0, frames = 0;
      const sample = () => {
        const current = scrollY;
        stable = Math.abs(current - last) < .5 ? stable + 1 : 0;
        last = current;
        if (stable >= 5 || ++frames > 180) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    })""")
    await page.wait_for_timeout(200)
    header = await page.locator("#header").bounding_box()
    assert header and abs(header["y"]) <= 1, "Fixed navigation moves out of the viewport"
    await page.screenshot(path=str(output / f"{name}.png"))


async def check_forms(browser, base):
    context = await browser.new_context(viewport={"width": 390, "height": 844})
    page = await context.new_page()
    requests = []
    response = {"success": True}
    status = 200
    mode = "json"

    async def mail(route):
        nonlocal response, status, mode
        requests.append(route.request.post_data_json)
        await asyncio.sleep(.1)
        if mode == "timeout":
            return  # Leave the intercepted request pending until the client's timeout aborts it.
        if mode == "offline":
            await route.abort("failed")
        else:
            await route.fulfill(status=status, content_type="application/json", body="{invalid" if mode == "invalid-json" else json.dumps(response))

    await page.route("https://api.web3forms.com/**", mail)
    await page.goto(base + "planning.html", wait_until="networkidle")
    await page.locator('[data-lang="es"]').click()
    expected = await page.locator(".rentals-quiet-link span").first.text_content()
    await page.locator(".rentals-quiet-link").first.click()
    await page.locator(".selection-continue").click()
    # A CSS-visible form elsewhere in the document is insufficient: navigation
    # must actually bring its heading into this viewport after a native jump.
    await page.wait_for_function("""() => {
      const r = document.getElementById('quote-title').getBoundingClientRect();
      return r.top >= 68 && r.bottom <= innerHeight;
    }""", timeout=5000)
    assert await page.locator("#selected-services").input_value() == expected
    assert await page.locator("#q-type").input_value() == "rental"
    await scroll(page, 0)
    await page.locator(".inquire-link").click()
    await page.wait_for_function("""() => {
      const r = document.getElementById('quote-title').getBoundingClientRect();
      return r.top >= 68 && r.bottom <= innerHeight;
    }""", timeout=5000)

    async def fill_quote():
        if await page.locator('[data-service-id="planning"]').get_attribute("aria-pressed") != "true":
            await page.locator('[data-service-id="planning"]').click()
            await page.locator(".selection-continue").click()
        await page.locator("#q-interest").fill("Additional written detail")
        await page.locator("#q-comments").fill("Celebración & detalles? #sí + private note")
        for field, value in {"q-name": " Browser test ", "q-email": " browser@example.com ", "q-phone": "+13055550100", "q-date": "2027-02-15", "q-guests": "40"}.items():
            await page.locator(f"#{field}").fill(value)
        await page.locator("#q-type").select_option("wedding")
        await page.locator("#q-location").select_option("exploring")

    async def fill_vendor():
        for field, value in {"v-name": " Browser test ", "v-company": "Test company", "v-service": "Test service", "v-email": " browser@example.com "}.items():
            await page.locator(f"#{field}").fill(value)

    for form, prefix, fill in (("quote-form", "form", fill_quote), ("vendor-form", "vendor", fill_vendor)):
        if form == "vendor-form":
            await page.locator("#vendor-details summary").click()
        await page.locator(f"#{form}").evaluate("f => f.reset()")
        await page.wait_for_timeout(50)
        await page.locator(f"#{form}").evaluate("f => f.requestSubmit()")
        assert await page.locator(f"#{prefix}-error").is_visible()
        assert not requests or form == "vendor-form"
        await fill()
        name = "q-name" if form == "quote-form" else "v-name"
        await page.locator(f"#{name}").fill("   ")
        count = len(requests)
        await page.locator(f"#{form}").evaluate("f => f.requestSubmit()")
        assert len(requests) == count, "Whitespace-only name submitted"
        assert await page.locator(f"#{name}").get_attribute("aria-invalid") == "true"
        await fill()

        failures = [( {"success": False, "message": "<script>private-contact@example.com</script>"}, 400, "json"), ({"success": False}, 429, "json"), ( {"success": False}, 200, "json"), ({}, 200, "json"), ({"success": True}, 503, "json"), ({}, 200, "offline"), ({}, 200, "invalid-json")]
        if form == "quote-form":
            failures.append(({}, 200, "timeout"))
        for bad_response, bad_status, bad_mode in failures:
            response, status, mode = bad_response, bad_status, bad_mode
            await page.locator(f"#{form}").evaluate("f => f.requestSubmit()")
            await page.locator(f"#{prefix}-send-error").wait_for(state="visible")
            assert await page.locator(f"#{prefix}-success").is_hidden()
            assert await page.locator(f"#{name}").input_value() == "Browser test", "Failure discarded the form"
            if form == "quote-form":
                assert await page.locator("#q-location").input_value() == "exploring", "Failure discarded the setting"
            assert await page.locator(f"#{form} button[type=submit]").is_enabled()
            assert await page.locator(f"#{form} .inquiry-recovery").is_visible()
            assert "private-contact@example.com" not in await page.locator(f"#{prefix}-send-error").text_content()
            # Explicit recovery builds a draft with current values, safely encoded.
            await page.locator(f"#{form} .inquiry-email-draft").evaluate("a => a.addEventListener('click', e => e.preventDefault())")
            draft = await page.locator(f"#{form} .inquiry-email-draft").evaluate("a => { a.click(); return a.href; }")
            from urllib.parse import urlsplit, parse_qs
            parsed = urlsplit(draft)
            assert parsed.path == "info@lajollacoralgables.com"
            body = parse_qs(parsed.query)["body"][0]
            assert "Browser test" in body
            assert "browser@example.com" in body
            if form == "quote-form":
                assert "Celebración & detalles? #sí + private note" in body
                assert expected in body
                assert "2027-02-15" in body
                assert "Additional written detail" in body
                assert "+13055550100" in body
            else:
                assert "Test company" in body and "Test service" in body
            await page.wait_for_timeout(20)
            assert await page.locator(f"#{form} .inquiry-email-draft").get_attribute("href") == "mailto:info@lajollacoralgables.com"

            if form == "quote-form":
                assert await page.locator("#selected-services").input_value() == expected
                assert await page.locator("#q-interest").input_value() == "Additional written detail"

        response, status, mode = {"success": True}, 200, "json"
        count = len(requests)
        await page.locator(f"#{form}").evaluate("f => { f.requestSubmit(); f.requestSubmit(); }")
        await page.locator(f"#{prefix}-success").wait_for(state="visible")
        await page.wait_for_timeout(200)
        assert len(requests) == count + 1, "Duplicate submission was sent"
        assert await page.locator(f"#{form} .inquiry-recovery").is_hidden()
        assert requests[-1]["email"] == "browser@example.com"
        assert requests[-1]["replyto"] == "browser@example.com"
        assert requests[-1]["ccemail"] == "info@lajollacoralgables.com"
        if form == "quote-form":
            assert requests[-1]["selectedServices"] == expected
            assert requests[-1]["selectedServiceIds"] == "planning"
            assert requests[-1]["rentalInterest"] == "Additional written detail"
            assert await page.locator("#selected-services").input_value() == ""
            assert await page.locator("#catalog-selection li").count() == 0
            assert requests[-1]["eventLocation"] == "exploring"
            assert await page.locator("#q-location").input_value() == ""
        assert await page.locator(f"#{name}").input_value() == ""
        assert await page.locator(f"#{form} button[type=submit]").is_enabled()
        assert await page.locator(f"#{form}").get_attribute("aria-busy") is None
    await context.close()
    return {"simulated_requests": len(requests), "real_emails_sent": 0, "inquiry_in_viewport": "passed", "validation": "passed", "failure_and_retry": "passed", "timeout": "passed", "invalid_json": "passed", "duplicate_guard": "passed"}



POSITIONS = [.035,.155,.265,.375,.485,.595,.705,.815,.965]
CHAPTERS = ['hero','history','visit','events','alcazar','rentals','gallery','team','planning']

async def travel(page, progress, expected=None):
    await position(page,'cinema',progress)
    if expected is not None:
        await page.wait_for_function("n => document.getElementById('cinema').dataset.scene === String(n)",arg=expected)
    await page.wait_for_timeout(400)

async def review_motion(browser, base, output, viewports=None):
    reports=[]
    for width,height in (viewports or [(320,600),(390,667),(390,844),(768,1024),(838,884),(1280,900)]):
        for language in ['en','es']:
            context=await browser.new_context(viewport={'width':width,'height':height})
            await context.route('https://api.web3forms.com/**',lambda route:route.abort())
            page=await context.new_page();errors=[];transfers=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda request:transfers.append(request.url))
            await page.goto(base,wait_until='networkidle');await page.evaluate('document.fonts.ready')
            await page.locator(f'[data-lang="{language}"]').click()
            assert await page.locator('main > section:not([hidden])').count()==1
            assert await page.locator('form').count()==0
            assert await page.evaluate('ScrollTrigger.getAll().length')==1,'There is more than one motion timeline'
            assert not any('/cinematic/' in u and u.endswith(('.mp4','.webm')) for u in transfers),'Film transferred before scrolling'
            first=await page.locator('#hero').bounding_box()
            assert first['y']>=68 and first['y']+first['height']<=height-85,('opening',width,language,first)
            for n,p in enumerate(POSITIONS):
                await travel(page,p,n)
                assert await page.locator('.cinema-story:visible').count()==1
                assert await page.locator('.cinema-detail:visible').count()==(4 if n==8 else 1)
                card=await page.locator(f'[data-scene-copy="{n}"]').bounding_box()
                assert card['y']>=68 and card['y']+card['height']<=height-85,('reading',width,language,n,card)
                for photo in await page.locator('.cinema-detail:visible').all():
                    d=await photo.bounding_box()
                    assert d['y']>=68 and d['y']+d['height']<=height-85,('photo',width,language,n,d)
                    assert card['x']+card['width']<=d['x']+1 or d['x']+d['width']<=card['x']+1 or card['y']+card['height']<=d['y']+1 or d['y']+d['height']<=card['y']+1,('overlap',width,language,n,card,d)
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                if width in [390,1280] and height in [844,900] and language=='en':
                    await snapshot(page,output,f'chapter-{width}-{n}')
                if n in range(1,8):
                    before=await page.evaluate('scrollY')
                    await page.locator(f'#{CHAPTERS[n]} .chapter-more > summary').click()
                    await page.wait_for_function('document.body.classList.contains("reading-details")')
                    body=page.locator(f'#{CHAPTERS[n]} .chapter-body')
                    assert await body.is_visible()
                    if n==3:assert await body.locator('.occasion').count()==10
                    if n==5:assert await body.locator('[data-service-id]').count()==10
                    if n==6:
                        assert await body.locator('.brand-card').count()==7
                        assert await body.locator('.gallery-position').text_content()=='01 / 07'
                        await body.locator('.gallery-next').click();await page.wait_for_timeout(700)
                        assert await body.locator('.gallery-position').text_content()!='01 / 07'
                    if n==7:assert await body.locator('.team-card').count()==2
                    await page.keyboard.press('Escape')
                    await page.wait_for_function('!document.body.classList.contains("reading-details")')
                    assert abs(await page.evaluate('scrollY')-before)<2,'Reading details lost the film position'
            for gap in [.11,.22,.33,.44,.55,.66,.77,.895]:
                await travel(page,gap,-1)
                assert await page.locator('.cinema-story:visible,.cinema-detail:visible').count()==0
            # Verify real decoding, complete cuts, the finale and reverse seeks.
            for name,p in [('journey',.3399),('arrival',.6699),('balcony',.8999),('journey',.999)]:
                await travel(page,p)
                await page.wait_for_function("name=>{const v=Array.from(document.querySelectorAll('[data-cinema-film]')).find(v=>v.dataset.cinemaFilm===name);return v.readyState>=2&&!v.seeking&&v.currentTime>=v.duration-.04&&v.getVideoPlaybackQuality().totalVideoFrames>0&&v.paused&&v.muted;}",arg=name)
            for p,name in [(.485,'arrival'),(.155,'journey')]:
                await travel(page,p)
                a,b=(0,.34) if name=='journey' else (.34,.67)
                fraction=(p-a)/(b-a)
                await page.wait_for_function("({name,fraction})=>{const v=Array.from(document.querySelectorAll('[data-cinema-film]')).find(v=>v.dataset.cinemaFilm===name);return !v.seeking&&Math.abs(v.currentTime-v.duration*fraction)<.05;}",arg={'name':name,'fraction':fraction})
            await page.locator('button[data-scene="4"]').focus();await page.keyboard.press('Enter')
            await page.wait_for_function('document.querySelector("#cinema").dataset.scene==="4"')
            await page.locator('.cinema-story:visible .cinema-inquiry').click()
            await page.wait_for_url('**/planning.html')
            assert await page.locator('#q-type').input_value()=='alcazar'
            assert await page.locator('html').get_attribute('lang')==language
            assert await page.evaluate("document.activeElement.id==='quote-title'")
            assert not errors,errors
            reports.append({'width':width,'height':height,'language':language,'nine_chapters':'passed','one_motion':'passed','complete_forward_reverse_films':'passed','disclosures_and_gallery':'passed','no_overlap':'passed'})
            await context.close();print(f'PASS single motion {width}x{height} {language}',flush=True)
    return reports

async def review_navigation(browser,base,output):
    results=[]
    for width in [390,838,1280]:
        context=await browser.new_context(viewport={'width':width,'height':884})
        page=await context.new_page();await page.route('https://api.web3forms.com/**',lambda route:route.abort())
        await page.goto(base+'#rentals',wait_until='networkidle')
        await page.wait_for_function('document.querySelector("#cinema").dataset.scene==="5"')
        assert await page.evaluate("document.activeElement.id==='rentals'")
        await page.locator('#rentals .chapter-more > summary').click()
        await page.locator('[data-service-id="planning"]').click();await page.locator('[data-service-id="catering"]').click()
        await page.locator('[data-lang="es"]').click()
        await page.locator('.selection-continue').click();await page.wait_for_url('**/planning.html')
        assert await page.locator('#selected-service-ids').input_value()=='planning, catering'
        assert await page.locator('#q-type').input_value()=='rental'
        assert await page.locator('html').get_attribute('lang')=='es'
        await page.locator('#inquiry-selection button').first.click()
        assert await page.locator('#selected-service-ids').input_value()=='catering'
        await page.locator('#q-name').fill('Do not persist contact')
        stored=await page.evaluate('JSON.stringify(sessionStorage)')
        assert 'Do not persist contact' not in stored
        await page.locator('.logo').click();await page.wait_for_url('**/index.html')
        if width<=900:
            await page.locator('.mobile-menu summary').click();target=page.locator('.mobile-chapters a[href="#visit"]')
        else:target=page.locator('.chapter-nav a[href="#visit"]')
        await target.click();await page.wait_for_function('document.querySelector("#cinema").dataset.scene==="2"')
        assert await page.locator('.mobile-menu').get_attribute('open') is None
        await page.locator('button[data-scene="8"]').click();await page.wait_for_function('document.querySelector("#cinema").dataset.scene==="8"')
        await page.locator('.cinema-inquiry:visible').click();await page.wait_for_url('**/planning.html')
        assert await page.locator('#selected-service-ids').input_value()=='catering'
        await page.goto(base+'planning.html#vendors',wait_until='networkidle')
        assert await page.locator('#vendor-details').get_attribute('open') is not None
        assert await page.evaluate('ScrollTrigger.getAll().length')==0
        results.append({'width':width,'deep_links':'passed','service_language_occasion_context':'passed','no_contact_storage':'passed','vendors':'passed'})
        await context.close()
    return results

async def review_fallbacks(browser,base,output):
    results=[]
    for mode in ['reduced','short','save-data','no-gsap','no-script','no-javascript','storage-denied']:
        context=await browser.new_context(viewport={'width':390,'height':540 if mode=='short' else 844},reduced_motion='reduce' if mode=='reduced' else 'no-preference',java_script_enabled=mode!='no-javascript')
        if mode=='save-data':await context.add_init_script("Object.defineProperty(navigator,'connection',{value:{saveData:true}})")
        if mode=='storage-denied':await context.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('denied')}});Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}})")
        if mode=='no-gsap':
            await context.route('**/*gsap*',lambda route:route.abort());await context.route('**/*ScrollTrigger*',lambda route:route.abort())
        if mode=='no-script':await context.route('**/script.js*',lambda route:route.abort())
        page=await context.new_page();transfers=[];errors=[];page.on('request',lambda req:transfers.append(req.url));page.on('pageerror',lambda e:errors.append(str(e)))
        await page.route('https://api.web3forms.com/**',lambda route:route.abort());await page.goto(base,wait_until='networkidle')
        if mode!='storage-denied':
            assert await page.locator('.cinema-story:visible').count()==9
            assert not any('/cinematic/' in u and u.endswith(('.mp4','.webm')) for u in transfers)
            await page.locator('#events .chapter-more > summary').click()
            assert await page.locator('#events-content .occasion').count()==10
            assert await page.locator('#events-content').is_visible()
        else:
            await travel(page,.965,8);await page.locator('.cinema-inquiry:visible').click();await page.wait_for_url('**/planning.html')
            assert await page.locator('#quote-form button[type=submit]').is_enabled()
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        assert not errors,errors
        await page.screenshot(path=str(output/f'fallback-{mode}.png'))
        await context.close();results.append({'mode':mode,'complete_content':'passed'})
    for failure in ['mp4','all']:
        page=await browser.new_page(viewport={'width':838,'height':884})
        await page.route('**/assets/venue/cinematic/*.mp4',lambda route:route.abort())
        if failure=='all':await page.route('**/assets/venue/cinematic/*.webm',lambda route:route.abort())
        await page.goto(base,wait_until='networkidle');await travel(page,.485,4)
        if failure=='mp4':await page.wait_for_function("()=>{const v=document.querySelector('[data-cinema-film=arrival]');return v.dataset.format==='webm'&&v.readyState>=2&&!v.seeking}")
        else:
            await page.wait_for_timeout(800)
            assert await page.locator('[data-film-layer="1"] > img').evaluate('i=>i.complete&&i.naturalWidth>0')
            assert await page.locator('.cinema-film video').evaluate_all('vs=>vs.every(v=>!v.classList.contains("is-decoded"))')
        await page.emulate_media(reduced_motion='reduce')
        await page.wait_for_function('!ScrollTrigger.getById("cinematic-journey")')
        assert await page.locator('.cinema-film video').evaluate_all('vs=>vs.every(v=>!v.getAttribute("src")&&v.paused)')
        assert await page.locator('.cinema-story:visible').count()==9
        await page.close();results.append({'mode':failure,'posters_and_reduced_cleanup':'passed'})
    return results

async def check_venue_media(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            requests = []
            page.on("request", lambda request: requests.append(request.url))
            await page.goto(base, wait_until="networkidle")
            await page.locator(f'[data-lang="{language}"]').click()
            viewer = page.locator("#film-viewer")
            video = viewer.locator("video")
            assert await viewer.is_hidden()
            assert await video.locator("source").count() == 0
            assert not any(".mp4" in url or ".webm" in url for url in requests)
            await travel(page, POSITIONS[2], 2)
            await page.locator("#visit .chapter-more > summary").click()
            await snapshot(page, output, f"quiet-films-{width}-{language}")
            opener = page.locator('.house-films [data-film="arrival"]')
            await opener.focus()
            await page.keyboard.press("Enter")
            assert await viewer.is_visible()
            assert await video.get_attribute("autoplay") is None
            assert await video.get_attribute("preload") == "none"
            assert await video.get_attribute("aria-label") == ("Arrival at La Jolla" if language == "en" else "La llegada a La Jolla")
            await page.wait_for_function("() => { const v = document.querySelector('#film-viewer video'); return v.currentTime > .2 && v.videoWidth === 480 && v.videoHeight === 854 && v.getVideoPlaybackQuality().totalVideoFrames > 0; }")
            assert await video.evaluate("v => v.muted")
            await snapshot(page, output, f"film-arrival-{width}-{language}")
            # Native modal focus remains inside the viewer, including reverse tabbing.
            for _ in range(9):
                await page.keyboard.press("Tab")
                assert await viewer.evaluate("v => v.contains(document.activeElement)")
            await viewer.locator('[data-film="details"]').click()
            await page.wait_for_function("() => { const v = document.querySelector('#film-viewer video'); return v.currentTime > .2 && /facade-details/.test(v.currentSrc) && v.getVideoPlaybackQuality().totalVideoFrames > 0; }")
            assert await viewer.locator("video").count() == 1
            await snapshot(page, output, f"film-details-{width}-{language}")
            box = await viewer.bounding_box()
            assert box["y"] >= 0 and box["y"] + box["height"] <= height + 1
            await page.keyboard.press("Escape")
            assert await viewer.is_hidden()
            await page.wait_for_function("() => { const v = document.querySelector('#film-viewer video'); return v.paused && v.querySelectorAll('source').length === 0; }")
            assert await video.locator("source").count() == 0
            assert await opener.evaluate("el => document.activeElement === el")
            assert await page.evaluate("document.body.style.overflow !== 'hidden'")
            assert await page.locator("#visit .chapter-more").get_attribute("open") is not None
            await opener.click()
            await viewer.locator(".film-close").click()
            assert await viewer.is_hidden()
            await page.locator('[data-i18n="visit.cta"]').click()
            await page.wait_for_url("**/planning.html")
            assert await page.locator("#q-location").input_value() == "la-jolla"
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            results.append({"width": width, "language": language, "no_initial_video_transfer": "passed", "both_films_decoded": "passed", "single_player": "passed", "modal_keyboard_close_focus": "passed", "venue_inquiry": "passed"})
            await page.close()
    # Without scripts the two real file links remain usable, and no player adds page height.
    context = await browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
    page = await context.new_page()
    await page.goto(base, wait_until="networkidle")
    assert await page.locator("#film-viewer").is_hidden()
    links = page.locator(".house-films a")
    assert await links.count() == 2
    for link in await links.all():
        response = await page.request.get(await link.evaluate("el => el.href"))
        assert response.ok and response.headers["content-type"].startswith("video/")
    await page.locator("#visit .chapter-more > summary").click()
    await page.locator(".venue-more summary").focus()
    await page.keyboard.press("Enter")
    assert await page.locator(".venue-more img").is_visible()
    await page.screenshot(path=str(output / "venue-no-javascript.png"))
    await context.close()
    # Both formats failing keeps the genuine poster, readable error and direct file link.
    for failure in ("mp4", "all"):
        page = await browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        await page.route("https://api.web3forms.com/**", lambda route: route.abort())
        await page.route("**/assets/venue/*.mp4", lambda route: route.abort())
        if failure == "all":
            await page.route("**/assets/venue/*.webm", lambda route: route.abort())
        await page.goto(base, wait_until="networkidle")
        await page.locator("#visit .chapter-more > summary").click()
        await page.locator('.house-films [data-film="arrival"]').click()
        if failure == "mp4":
            await page.wait_for_function("() => { const v = document.querySelector('#film-viewer video'); return v.currentTime > .2 && v.currentSrc.endsWith('.webm'); }")
            assert await page.locator(".venue-film-status").is_hidden()
        else:
            await page.locator(".venue-film-status").wait_for(state="visible")
            assert await page.locator("#film-viewer video").evaluate("v => Boolean(v.poster)")
            assert await page.locator(".venue-film-link").is_visible()
        await snapshot(page, output, f"film-fallback-{failure}")
        await page.locator(".film-close").click()
        await page.close()
    return {"playback": results, "no_javascript_file_access": "passed", "failed_video_fallback": "passed", "webm_fallback_reduced_motion": "passed"}


async def check_photos(browser,base,output):
    reports=[]
    for width in [390,1280]:
        page=await browser.new_page(viewport={"width":width,"height":900})
        await page.goto(base,wait_until="networkidle");await travel(page,.155,1)
        before=await page.evaluate("scrollY");opener=page.locator(".cinema-detail:visible")
        await opener.click();viewer=page.locator("#photo-viewer");await viewer.wait_for(state="visible")
        assert await viewer.locator("img").evaluate("i=>i.complete&&i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain'")
        for _ in range(4):
            await page.keyboard.press("Tab");assert await viewer.evaluate("d=>d.contains(document.activeElement)")
        await snapshot(page,output,f"photo-{width}");await page.keyboard.press("Escape")
        await viewer.wait_for(state="hidden");assert await opener.evaluate("a=>document.activeElement===a")
        assert abs(await page.evaluate("scrollY")-before)<2
        assert await page.locator(".cinema-story:visible").get_attribute("id")=="history"
        await page.close();reports.append({"width":width,"complete_photo_modal_focus_return":"passed"})
    return reports

async def main(args,base):
    args.output.mkdir(parents=True,exist_ok=True)
    launch={'headless':True};executable=args.browser or shutil.which('chromium')
    if executable:launch['executable_path']=executable
    if os.environ.get('HTTPS_PROXY'):launch['proxy']={'server':os.environ['HTTPS_PROXY'],'bypass':'localhost,127.0.0.1'}
    async with async_playwright() as p:
        browser=await p.chromium.launch(**launch)
        motion=await review_motion(browser,base,args.output)
        navigation=await review_navigation(browser,base,args.output);print('PASS internal planning, context and chapter routing',flush=True)
        photos=await check_photos(browser,base,args.output);print("PASS complete photos, modal focus and film position",flush=True)
        media=await check_venue_media(browser,base,args.output);print('PASS both full films, modal focus and native file links',flush=True)
        forms=await check_forms(browser,base);print('PASS mock-only forms: validation, errors, retry and duplicate guard',flush=True)
        fallbacks=await review_fallbacks(browser,base,args.output);print('PASS native alternatives, storage denied and media failures',flush=True)
        (args.output/'results.json').write_text(json.dumps({'motion':motion,'navigation':navigation,'forms':forms,'fallbacks':fallbacks,'media':media,'photos':photos,'real_emails_sent':0},indent=2)+'\n')
        await browser.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,default=Path('/tmp/lajolla-review'));parser.add_argument('--browser');args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:asyncio.run(main(args,f'http://127.0.0.1:{server.server_port}/'))
    finally:server.shutdown();server.server_close()
