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


async def check_navigation(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            await page.goto(base, wait_until="networkidle")
            if language == "es":
                await page.locator('[data-lang="es"]').click()
                await page.wait_for_timeout(100)
            expected = await page.locator(".rentals-quiet-link span").first.text_content()
            # Let browser focus/auto-scroll jump to a service from the opening.
            # The native scroll event may not have reached Lenis when clicked.
            await page.locator(".rentals-quiet-link").first.click()
            assert await page.locator(".rentals-quiet-link").first.get_attribute("aria-pressed") == "true"
            await page.locator(".selection-continue").click()
            await page.wait_for_function("document.activeElement.id === 'quote-title'")
            await page.wait_for_function("""() => {
              const r = document.getElementById('quote-title').getBoundingClientRect();
              return r.top >= 68 && r.bottom <= innerHeight;
            }""", timeout=5000)
            assert await page.locator("#selected-services").input_value() == expected
            await snapshot(page, output, f"navigation-{width}-{language}-service")
            await scroll(page, 0)
            await page.locator(".inquire-link").click()
            await page.wait_for_function("document.activeElement.id === 'quote-title'")
            await page.wait_for_function("""() => {
              const r = document.getElementById('quote-title').getBoundingClientRect();
              return r.top >= 68 && r.bottom <= innerHeight;
            }""", timeout=5000)
            await snapshot(page, output, f"navigation-{width}-{language}-header")
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            results.append({"width": width, "language": language, "service": "passed", "header": "passed"})
            await page.close()
    return results


async def review_viewport(browser, base, output, width, height, language):
    folder = output / f"{width}-{language}"
    folder.mkdir(parents=True, exist_ok=True)
    context = await browser.new_context(viewport={"width": width, "height": height}, record_video_dir=str(folder), record_video_size={"width": width, "height": height})
    await context.route("https://api.web3forms.com/**", lambda route: route.abort())
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    await page.goto(base, wait_until="networkidle")
    await page.evaluate("document.fonts.ready")
    if language == "es":
        await page.locator('[data-lang="es"]').click()
        await page.wait_for_timeout(100)
    assert await page.locator("html").get_attribute("lang") == language
    await scroll(page, 0)
    for selector in ("#hero-title", ".arrival-description", ".arrival-actions .btn"):
        r = await page.locator(selector).bounding_box()
        assert r and r["y"] >= 68 and r["y"] + r["height"] <= height, f"First-paint offer unavailable: {selector}"
    await snapshot(page, folder, "hero-start")

    minimum_coverage = 1
    assert await page.evaluate("!ScrollTrigger.getAll().some(t => t.trigger.id === 'hero' && t.vars.pin)")
    for index in range(4):
        await page.locator(f'[data-shot="{index}"]').click()
        await page.wait_for_timeout(550)
        assert await page.locator(f'[data-shot="{index}"]').get_attribute("aria-pressed") == "true"
        assert await page.locator(".reel-shot.is-current img").evaluate("img => img.complete && img.naturalWidth > 0")
        await snapshot(page, folder, f"hero-{index}")
    await page.locator('[data-shot="0"]').click()
    for y in (0, 150, 300):
        await scroll(page, y)
        assert await page.locator('[data-shot="0"]').get_attribute("aria-pressed") == "true", "Scrolling changed the entrance photo"
    await scroll(page, 0)

    assert await page.locator(".rentals-quiet li").count() == 10
    assert await page.locator(".brand-card").count() == 7
    assert await page.locator(".team-card").count() == 2
    assert await page.locator("#testimonial").is_hidden()
    assert await page.evaluate("!ScrollTrigger.getAll().some(t => t.trigger.id === 'history' && t.vars.pin)")
    for section in ("possibilities", "history", "visit", "moment", "events", "alcazar", "rentals", "gallery", "team", "quote", "vendors"):
        await position(page, section)
        await snapshot(page, folder, section)
        for element in await page.locator(f"#{section} .reveal").all():
            assert await element.evaluate("e => Number(getComputedStyle(e).opacity)") == 1
    await position(page, "moment")
    await snapshot(page, folder, "moment")
    assert await page.locator(".quote-bleed-media").count() == 0
    quote_box = await page.locator(".quote-bleed-text p").bounding_box()
    frame_box = await page.locator(".moment-pin").bounding_box()
    assert quote_box["x"] >= frame_box["x"] and quote_box["x"] + quote_box["width"] <= frame_box["x"] + frame_box["width"] + 1
    history_image = page.locator(".history-photo img")
    assert await history_image.evaluate("img => img.complete && img.naturalWidth === 768 && getComputedStyle(img).objectFit === 'contain'")
    await position(page, "gallery")
    track = page.locator(".brand-track")
    for index, card in enumerate(await page.locator(".brand-card").all()):
        await track.evaluate("(track, index) => { track.scrollLeft = track.children[index].offsetLeft; }", index)
        await page.wait_for_timeout(200)
        await card.locator("img").evaluate("img => img.loading = 'eager'")
        await page.wait_for_function("index => { const img = document.querySelectorAll('.brand-card img')[index]; return img.complete && img.naturalWidth > 0; }", arg=index)
    await track.evaluate("track => track.scrollLeft = 0")
    await page.wait_for_function("!document.querySelector('.gallery-next').disabled && document.querySelector('.gallery-position').textContent.startsWith('01')")
    await page.locator(".gallery-next").focus()
    await page.keyboard.press("Enter")
    await page.wait_for_function("() => { const t = document.querySelector('.brand-track'); return Math.abs(t.scrollLeft - t.children[1].offsetLeft) < 2; }")
    await snapshot(page, folder, "gallery-next")
    await page.locator(".gallery-prev").click()
    await page.wait_for_function("document.querySelector('.brand-track').scrollLeft < 2")
    assert await page.locator(".alcazar-visual img").evaluate("e => getComputedStyle(e).objectFit") == "contain"
    # Every occasion is keyboard discoverable; its approved description can be opened.
    for occasion in await page.locator(".occasion").all():
        await occasion.locator("summary").focus()
        if not await occasion.evaluate("e => e.open"):
            await page.keyboard.press("Enter")
        assert await occasion.locator(".occasion-body p").is_visible()
        assert await occasion.locator(".occasion-body a").is_visible()
    await page.locator(".services-about summary").click()
    assert await page.locator('[data-i18n="rentals.intro"]').is_visible()
    # The additional interior view remains a native keyboard disclosure.
    await page.locator(".venue-more summary").focus()
    await page.keyboard.press("Enter")
    assert await page.locator(".venue-more img").is_visible()
    # Walk the full page and inspect every image after lazy loading.
    await scroll(page, 0)
    total = await page.evaluate("document.documentElement.scrollHeight - innerHeight")
    for y in range(0, total + height, max(1, height // 2)):
        await scroll(page, min(y, total))
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Horizontal overflow"
        await page.wait_for_timeout(70)
    await page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth)")
    await snapshot(page, folder, "footer")
    assert not errors, errors
    video = page.video
    await context.close()
    await video.save_as(str(folder / "scroll.webm"))
    return {"width": width, "height": height, "language": language, "coverage": minimum_coverage, "errors": errors, "first_paint_offer": "passed", "occasions_keyboard": "passed", "natural_history": "passed"}


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
    await page.goto(base, wait_until="networkidle")
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

        failures = [( {"success": False}, 200, "json"), ({}, 200, "json"), ({"success": True}, 503, "json"), ({}, 200, "offline"), ({}, 200, "invalid-json")]
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
            if form == "quote-form":
                assert await page.locator("#selected-services").input_value() == expected
                assert await page.locator("#q-interest").input_value() == "Additional written detail"

        response, status, mode = {"success": True}, 200, "json"
        count = len(requests)
        await page.locator(f"#{form}").evaluate("f => { f.requestSubmit(); f.requestSubmit(); }")
        await page.locator(f"#{prefix}-success").wait_for(state="visible")
        await page.wait_for_timeout(200)
        assert len(requests) == count + 1, "Duplicate submission was sent"
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


async def check_variants(browser, base, output):
    page = await browser.new_page(viewport={"width": 1280, "height": 900})
    await page.goto(base, wait_until="networkidle")
    for width, height in ((390, 844), (1280, 900), (768, 1024)):
        await page.set_viewport_size({"width": width, "height": height})
        await page.wait_for_timeout(300)
        await scroll(page, 0)
        assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.trigger.id === 'hero').length") == 2
        assert not await page.evaluate("!!ScrollTrigger.getAll().find(t => t.trigger.id === 'hero').vars.pin")
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    await page.emulate_media(reduced_motion="reduce")
    await page.wait_for_timeout(200)
    assert not await page.locator("html").evaluate("e => e.classList.contains('has-gsap')")
    assert await page.evaluate("ScrollTrigger.getAll().length") == 0
    await page.emulate_media(reduced_motion="no-preference")
    await page.wait_for_timeout(200)
    assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.trigger.id === 'hero').length") == 2
    await page.close()
    page = await browser.new_page(viewport={"width": 390, "height": 667})
    await page.goto(base, wait_until="networkidle")
    await page.locator('[data-lang="es"]').click()
    await snapshot(page, output, "short-screen-arrival")
    r = await page.locator(".arrival-actions .btn").bounding_box()
    assert r["y"] + r["height"] <= 667
    await position(page, "history")
    await snapshot(page, output, "short-screen-history")
    assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    await page.close()
    for width, height in ((320, 667), (375, 667)):
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.route("https://api.web3forms.com/**", lambda route: route.abort())
        await page.goto(base, wait_until="networkidle")
        await page.locator('[data-lang="es"]').click()
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), f"{width}: narrow form overflow"
        await position(page, "quote")
        await snapshot(page, output, f"narrow-inquiry-{width}")
        for field in await page.locator("#quote-form input:not([type=hidden]), #quote-form select, #quote-form textarea").all():
            box = await field.bounding_box()
            assert box["x"] >= 0 and box["x"] + box["width"] <= width
        await page.locator(".mobile-menu > summary").click()
        box = await page.locator(".mobile-chapters").bounding_box()
        assert box["x"] >= 0 and box["x"] + box["width"] <= width
        await snapshot(page, output, f"narrow-menu-{width}")
        await page.close()
    for variant in ("reduced-motion", "no-gsap", "no-page-script", "no-javascript"):
        context = await browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce" if variant == "reduced-motion" else "no-preference", java_script_enabled=variant != "no-javascript")
        await context.route("https://api.web3forms.com/**", lambda route: route.abort())
        if variant == "no-gsap":
            await context.route("**/assets/vendor/gsap.min.js", lambda route: route.abort())
        if variant == "no-page-script":
            await context.route("**/script.js?*", lambda route: route.abort())
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(base, wait_until="networkidle")
        assert not errors, errors
        assert await page.locator("#hero h1").is_visible()
        assert await page.locator(".reel-shot").count() == 4
        await page.locator(".occasion").nth(1).locator("summary").click()
        assert await page.locator(".occasion").nth(1).locator(".occasion-body").is_visible()
        if variant == "no-page-script":
            assert await page.locator("#quote-form button[type=submit]").is_disabled()
            assert await page.locator(".inquiry-contact a[href^='mailto:']").is_visible()
        if variant == "no-javascript":
            assert await page.locator("#quote-form").is_hidden()
            assert await page.locator("#quote noscript a[href^='mailto:']").is_visible()
        await page.screenshot(path=str(output / f"{variant}.png"), full_page=True)
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        await context.close()
    return {"responsive_resize": "passed", "short_screen": "passed", "dynamic_reduced_motion": "passed", "missing_gsap": "passed", "no_javascript_contact": "passed", "missing_page_script_safe_contact": "passed", "narrow_320_375": "passed"}


async def check_composer(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            await page.goto(base, wait_until="networkidle")
            await page.locator(f'[data-lang="{language}"]').click()
            first = page.locator('[data-service-id="planning"]')
            await first.click()
            await first.focus()
            await page.keyboard.press("Space")
            assert await first.get_attribute("aria-pressed") == "false"
            await page.keyboard.press("Space")
            await page.locator('[data-service-id="catering"]').click()
            await page.locator('[data-service-id="florals"]').click()
            assert await page.locator("#catalog-selection li").count() == 3
            before_ids = await page.locator("#selected-service-ids").input_value()
            # Selection stays in the catalog; there is no forced jump after a choice.
            assert await page.evaluate("document.getElementById('quote-title').getBoundingClientRect().top > innerHeight")
            await position(page, "rentals")
            await snapshot(page, output, f"selection-{width}-{language}")
            await page.locator(".selection-continue").click()
            await page.wait_for_function("""() => { const r = document.getElementById('quote-title').getBoundingClientRect(); return r.top >= 68 && r.bottom <= innerHeight; }""")
            await page.locator("#q-interest").fill("Preserve this written detail")
            await page.locator("#q-comments").fill("Preserve this comment")
            other = "es" if language == "en" else "en"
            await page.locator(f'[data-lang="{other}"]').click()
            assert await page.locator("#selected-service-ids").input_value() == before_ids
            label = await first.locator("span").text_content()
            assert label in await page.locator("#selected-services").input_value()
            assert await page.locator("#q-interest").input_value() == "Preserve this written detail"
            assert await page.locator("#q-comments").input_value() == "Preserve this comment"
            await page.locator(f'[data-lang="{language}"]').click()
            remove = page.locator("#inquiry-selection button").first
            await remove.focus()
            await page.keyboard.press("Enter")
            assert await page.locator("#inquiry-selection li").count() == 2
            assert await page.locator("#inquiry-selection button").first.evaluate("e => e === document.activeElement")
            await page.locator('.occasion').first.locator('a[data-event-type="wedding"]').click()
            assert await page.locator("#q-type").input_value() == "wedding"
            await page.locator("#q-type").select_option("corporate")
            assert await page.locator(".inquiry-occasion").text_content() == ("Let's Start Planning" if language == "en" else "Comencemos a planificar")
            await page.locator('#alcazar [data-event-type="alcazar"]').click()
            assert await page.locator("#q-type").input_value() == "alcazar"
            assert await page.locator('#q-type option[value="alcazar"]').text_content() == "The Lexington"
            try:
                await page.wait_for_function("""() => { const r = document.getElementById('quote-title').getBoundingClientRect(); return r.top >= 68 && r.bottom <= innerHeight; }""")
            except Exception:
                state = await page.evaluate("({scroll:scrollY,active:document.activeElement.id,title:document.getElementById('quote-title').getBoundingClientRect().toJSON(),section:document.getElementById('quote').getBoundingClientRect().toJSON()})")
                (output / f"navigation-failure-{width}-{language}.json").write_text(json.dumps(state,indent=2))
                await page.screenshot(path=str(output / f"navigation-failure-{width}-{language}.png"))
                raise
            await snapshot(page, output, f"inquiry-selection-{width}-{language}")
            # Add every service to expose cramped summaries and unbounded overflow.
            for button in await page.locator("[data-service-id]").all():
                if await button.get_attribute("aria-pressed") != "true":
                    await button.click()
            assert await page.locator("#catalog-selection li").count() == 10
            await page.locator(".selection-continue").click()
            assert await page.locator("#inquiry-selection li").count() == 10
            if width <= 900:
                summary = page.locator(".mobile-menu > summary")
                await summary.focus()
                await page.keyboard.press("Enter")
                menu = await page.locator(".mobile-chapters").bounding_box()
                assert menu["x"] >= 0 and menu["x"] + menu["width"] <= width
                await snapshot(page, output, f"chapter-menu-{width}-{language}")
                await page.keyboard.press("Escape")
                assert not await page.locator(".mobile-menu").evaluate("e => e.open")
                assert await summary.evaluate("e => e === document.activeElement")
                await summary.click()
                await page.locator('.mobile-chapters a[href="#rentals"]').click()
                assert not await page.locator(".mobile-menu").evaluate("e => e.open")
                await summary.click()
                await page.locator("#rentals-title").click()
                assert not await page.locator(".mobile-menu").evaluate("e => e.open")
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            await page.reload(wait_until="networkidle")
            assert await page.locator("html").get_attribute("lang") == language
            assert await page.locator("#catalog-selection li").count() == 0
            assert not await page.locator("#vendor-details").evaluate("e => e.open")
            await page.locator('footer a[href="#vendors"]').click()
            assert await page.locator("#vendor-details").evaluate("e => e.open")
            results.append({"width": width, "language": language, "selection": "passed", "translation": "passed", "keyboard_remove_focus": "passed", "occasion": "passed", "menu": "passed" if width <= 900 else "desktop navigation", "all_ten": "passed", "language_preference": "passed"})
            await page.close()
    return results


async def check_paths(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            await page.goto(base, wait_until="networkidle")
            await page.locator(f'[data-lang="{language}"]').click()
            assert await page.locator("#q-location").input_value() == "", "Default assumes a setting"
            assert await page.locator("#q-location").get_attribute("required") is None
            await page.locator(".arrival-actions .text-link").click()
            await snapshot(page, output, f"paths-{width}-{language}")
            title = await page.locator("#possibilities-title").bounding_box()
            assert title and 68 <= title["y"] < height, "Opening link misses the two offers"
            for value, target in (("la-jolla", "events"), ("south-florida", "rentals")):
                link = page.locator(f'.offering-path[data-inquiry-location="{value}"]')
                await link.focus()
                await page.keyboard.press("Enter")
                await snapshot(page, output, f"path-{value}-{width}-{language}")
                assert await page.locator("#q-location").input_value() == value
                title = await page.locator(f"#{target}-title").bounding_box()
                assert title and 68 <= title["y"] < height, f"Path misses {target}"
            await page.locator('[data-service-id="catering"]').click()
            await page.locator(".selection-continue").click()
            await page.locator("#q-location").select_option("exploring")
            await page.locator("#q-comments").fill("Test vision: keep this wording")
            await page.locator("#q-type").select_option("other")
            # Labels translate; explicit corrections, notes and service IDs do not change.
            other = "en" if language == "es" else "es"
            await page.locator(f'[data-lang="{other}"]').click()
            assert await page.locator("#q-location").input_value() == "exploring"
            assert await page.locator("#q-type").input_value() == "other"
            assert await page.locator("#q-comments").input_value() == "Test vision: keep this wording"
            assert await page.locator("#selected-service-ids").input_value() == "catering"
            setting = await page.locator("#q-location option:checked").text_content()
            assert setting in await page.locator(".inquiry-location").text_content()
            await page.locator(f'[data-lang="{language}"]').click()
            await page.locator('#alcazar a[data-event-type="alcazar"]').click()
            assert await page.locator("#q-type").input_value() == "alcazar"
            assert await page.locator('#q-type option[value="alcazar"]').text_content() == "The Lexington"
            assert await page.locator("#q-location").input_value() == "la-jolla"
            await page.locator("#q-location").select_option("south-florida")
            assert await page.locator("#q-location").input_value() == "south-florida", "Prefill cannot be corrected"
            await position(page, "quote")
            await snapshot(page, output, f"correspondence-{width}-{language}")
            await page.locator(".inquiry-group").first.evaluate("e => window.scrollTo({top:e.getBoundingClientRect().top + scrollY - 90, behavior:'instant'})")
            await snapshot(page, output, f"contact-fields-{width}-{language}")
            await page.locator(".inquiry-group").nth(1).evaluate("e => window.scrollTo({top:e.getBoundingClientRect().top + scrollY - 90, behavior:'instant'})")
            await snapshot(page, output, f"occasion-fields-{width}-{language}")
            # Browsing without making a venue choice is still a valid inquiry.
            await page.locator("#q-location").select_option("")
            assert await page.locator("#q-location").evaluate("e => e.checkValidity()")
            assert await page.locator(".inquiry-location").is_hidden()
            assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            results.append({"width": width, "language": language, "native_paths": "passed", "editable_location": "passed", "optional_location": "passed", "translated_context": "passed"})
            await page.close()
    return results


async def check_living_story(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (838, 884), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            await page.goto(base, wait_until="networkidle")
            await page.evaluate("document.fonts.ready")
            await page.locator(f'[data-lang="{language}"]').click()
            assert await page.locator("#hero-title").get_attribute("aria-label") == "La Jolla"
            assert await page.locator(".title-letter").count() == 7
            assert await page.locator(".paths-decoration").get_attribute("aria-hidden") == "true"
            assert (ROOT / "assets/editorial/hydrangea-study.webp").stat().st_size < 12000
            assert await page.locator("main > #cinema").count() == 1, "The approved film scene must remain its own chapter"
            assert await page.locator("#cinema").evaluate("e => {const probe=document.createElement('span');probe.style.color='var(--sage-deep)';e.append(probe);const expected=getComputedStyle(probe).color;probe.remove();return getComputedStyle(e).backgroundColor===expected;}")
            assert await page.locator("#visit .venue-ballroom").count() == 0, "The giant duplicate ballroom returned"
            await scroll(page, 0)
            await page.wait_for_timeout(900)
            start_type = await page.locator(".title-line").first.evaluate("e => gsap.getProperty(e,'x')")
            await scroll(page, 250)
            await page.wait_for_timeout(600)
            end_type = await page.locator(".title-line").first.evaluate("e => gsap.getProperty(e,'x')")
            assert end_type < start_type - 1, "The opening typography does not respond to scroll"
            for side, art in enumerate(await page.locator(".path-art").all()):
                destination = await art.evaluate("e => e.getBoundingClientRect().top+scrollY-innerHeight*.93")
                await scroll(page, destination)
                await page.wait_for_timeout(700)
                depth_before = await art.locator(".path-composition").evaluate("e=>Number(gsap.getProperty(e,'scaleX'))")
                before = await art.locator(".photo-shard").evaluate_all("es => es.map(e=>Number(getComputedStyle(e).opacity))")
                await snapshot(page, output, f"aligned-panels-entry-{width}-{language}-{side}")
                await scroll(page, destination + height*.5)
                await page.wait_for_timeout(700)
                depth_after = await art.locator(".path-composition").evaluate("e=>Number(gsap.getProperty(e,'scaleX'))")
                assert depth_before>1.03 and abs(depth_after-1)<.001, (depth_before,depth_after)
                after = await art.locator(".photo-shard").evaluate_all("es => es.map(e=>Number(getComputedStyle(e).opacity))")
                assert min(before) < .2 and min(after) > .99, "Aligned photographic panels do not reveal"
                assert await art.locator('.photo-shard').evaluate_all("es=>es.every(e=>getComputedStyle(e).transform==='none')"), "Photographic strips displace parts of the building"
                assert await art.evaluate("""art => {
                  const base=art.querySelector('.path-photo'), frame=base.getBoundingClientRect(), style=getComputedStyle(base);
                  return Array.from(art.querySelectorAll('.photo-shard img')).every(image=>{
                    const r=image.getBoundingClientRect(), s=getComputedStyle(image);
                    return image.complete && image.currentSrc===base.currentSrc && s.objectFit===style.objectFit && s.objectPosition===style.objectPosition && ['x','y','width','height'].every(key=>Math.abs(r[key]-frame[key])<.1);
                  });
                }"""), "Photo strips do not share the complete original framing"
                await snapshot(page, output, f"aligned-panels-complete-{width}-{language}-{side}")
                assert await art.locator('.path-photo').evaluate("e=>e.complete && e.naturalWidth>0 && Number(getComputedStyle(e).opacity)>=.75")
                await scroll(page, destination)
                await page.wait_for_timeout(700)
                reverse = await art.locator(".photo-shard").evaluate_all("es => es.map(e=>Number(getComputedStyle(e).opacity))")
                assert max(abs(a-b) for a,b in zip(before,reverse)) < .05
            assert await page.locator('.paths-decoration').evaluate('e=>e.complete && e.naturalWidth===320')
            text = page.locator('.history-copy [data-i18n="history.lede"]')
            destination = await text.evaluate("e=>e.getBoundingClientRect().top+scrollY-innerHeight*.88")
            await scroll(page, destination)
            await page.wait_for_timeout(650)
            before = await text.locator('.scroll-word').evaluate_all("es=>es.map(e=>Number(getComputedStyle(e).opacity))")
            contrast = await text.evaluate("""el => {
              const rgb = value => value.match(/[0-9.]+/g).slice(0,3).map(Number);
              const luminance = color => color.map(c=>c/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
              let background=el;
              while (background.parentElement && getComputedStyle(background).backgroundColor==='rgba(0, 0, 0, 0)') background=background.parentElement;
              const bg=rgb(getComputedStyle(background).backgroundColor);
              return Math.min(...Array.from(el.querySelectorAll('.scroll-word'), word=>{
                const fg=rgb(getComputedStyle(word).color), alpha=Number(getComputedStyle(word).opacity);
                const rendered=fg.map((c,i)=>c*alpha+bg[i]*(1-alpha));
                return (luminance(bg)+.05)/(luminance(rendered)+.05);
              }));
            }""")
            assert contrast >= 4.5, (width, language, contrast)
            await scroll(page, destination + height*.4)
            await page.wait_for_timeout(650)
            after = await text.locator('.scroll-word').evaluate_all("es=>es.map(e=>Number(getComputedStyle(e).opacity))")
            assert min(before) >= .75 and min(before) < .85 and min(after) > .99, "Text does not reveal with readable contrast"
            await snapshot(page, output, f'living-text-{width}-{language}')
            essay = page.locator('.venue-essay')
            for photo in await essay.locator('figure').all():
                timing = await photo.evaluate("e=>{const t=ScrollTrigger.getAll().find(t=>t.trigger===e);return {start:t.start,end:t.end};}")
                await scroll(page,timing['start']+(timing['end']-timing['start'])*.02)
                await page.wait_for_timeout(700)
                before = await photo.evaluate("e=>({y:Number(gsap.getProperty(e,'y')),scale:Number(gsap.getProperty(e,'scaleX'))})")
                await scroll(page,timing['end']+2)
                await page.wait_for_timeout(700)
                after = await photo.evaluate("e=>({y:Number(gsap.getProperty(e,'y')),scale:Number(gsap.getProperty(e,'scaleX'))})")
                assert before['y']>10 and after['y']<.2 and before['scale']<.99 and after['scale']>.999, (width, language, before, after)
                assert await photo.evaluate("e=>Number(gsap.getProperty(e,'rotation'))===0"), "Architectural photographs should remain upright"
            assert await essay.locator('img').evaluate_all("es=>es.every(e=>e.complete && e.naturalWidth>0 && getComputedStyle(e).objectFit==='contain')")
            await snapshot(page, output, f'living-photos-{width}-{language}')
            # Switching language rebuilds only the translated words, preserving their reading progress.
            await page.locator(f'[data-lang="{"es" if language=="en" else "en"}"]').click()
            assert await text.locator('.scroll-word').count() > 10
            assert (await text.text_content()).startswith('Desde 1928' if language=='en' else 'Since 1928')
            assert await page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
            await page.emulate_media(reduced_motion="reduce")
            await page.wait_for_function("ScrollTrigger.getAll().length === 0")
            assert await text.locator('.scroll-word').evaluate_all("es=>es.every(e=>Number(getComputedStyle(e).opacity)===1)")
            assert await page.locator('.photo-shard,.path-composition,.venue-detail').evaluate_all("es=>es.every(e=>getComputedStyle(e).transform==='none')")
            results.append({"width":width,"language":language,"type_scroll":"passed","aligned_photo_reveal_reverse":"passed","readable_word_fade_translation":"passed","real_photo_essay":"passed","reduced_cleanup":"passed"})
            await page.close()
    return results


async def check_cinematic(browser, base, output):
    results = []
    for width, height in ((390, 844), (768, 1024), (838, 884), (1280, 900)):
        for language in ("en", "es"):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.route("https://api.web3forms.com/**", lambda route: route.abort())
            transfers = []
            page.on("request", lambda request: transfers.append(request.url))
            await page.goto(base, wait_until="networkidle")
            await page.locator(f'[data-lang="{language}"]').click()
            assert not any("/cinematic/" in url and url.endswith((".mp4", ".webm")) for url in transfers), "Film transferred on first paint"
            assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.vars.id === 'cinematic-journey').length") == 1
            times = []
            for progress, scene, count in ((.02, "-1", 0), (.16, "0", 1), (.29, "-1", 0), (.39, "1", 2), (.62, "2", 3), (.82, "3", 4), (.97, "4", 4), (.16, "0", 1)):
                await position(page, "cinema", progress)
                await page.wait_for_function("scene => document.getElementById('cinema').dataset.scene === scene", arg=scene)
                await page.wait_for_function("""fraction => {
                  const v=document.querySelector('[data-cinema-film="journey"]');
                  return v.readyState >= 2 && !v.seeking && Math.abs(v.currentTime-v.duration*fraction)<.15 && v.getVideoPlaybackQuality().totalVideoFrames>0;
                }""", arg=progress, timeout=15000)
                video = page.locator('[data-cinema-film="journey"]')
                assert await video.evaluate("v => v.paused && v.muted && (v.dataset.format === 'mp4' ? v.videoWidth === 1280 && v.videoHeight === 720 : v.videoWidth === 960 && v.videoHeight === 540)")
                times.append(await video.evaluate("v=>v.currentTime"))
                await page.wait_for_timeout(400)
                box = await page.locator('.cinema-media').bounding_box()
                assert abs(box['x'])<1 and abs(box['y'])<1 and abs(box['width']-width)<1 and abs(box['height']-height)<2, (width,box)
                assert await page.locator('.cinema-detail:visible').count() == count, "Detail composition must build and reverse"
                assert await page.locator('.cinema-detail:visible img').evaluate_all("es=>es.every(e=>e.complete&&e.naturalWidth>0&&getComputedStyle(e).objectFit==='contain')")
                if scene == '-1':
                    assert await page.locator('.cinema-story:visible').count() == 0, "Breathing interval is covered by copy"
                    assert await page.locator('button[data-scene][aria-pressed="true"]').count() == 0
                else:
                    story=page.locator(f'[data-scene-copy="{scene}"]')
                    assert await story.is_visible()
                    assert await story.evaluate("e=>Number(getComputedStyle(e).opacity)>.99"), "Chapter must be fully readable during its reading interval"
                    assert await page.locator(f'button[data-scene="{scene}"]').get_attribute('aria-pressed') == 'true'
                    r=await story.bounding_box()
                    assert r['y']>=68 and r['y']+r['height']<height-44, (width,language,r)
                    for detail in await page.locator('.cinema-detail:visible').all():
                        d=await detail.bounding_box()
                        assert d['x']>=0 and d['x']+d['width']<=width+1 and d['y']>=68 and d['y']+d['height']<height-44
                        assert r['x']+r['width']<=d['x'] or d['x']+d['width']<=r['x'] or r['y']+r['height']<=d['y'] or d['y']+d['height']<=r['y'], "Copy and photographs overlap"
                assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
                await snapshot(page, output, f"cinema-{width}-{language}-{progress}-{len(times)}")
            assert times[-2]>4.7 and abs(times[-1]-times[1])<.15, "The complete film must advance and reverse"
            for gap in (.51, .73, .92):
                await position(page, 'cinema', gap)
                await page.wait_for_function("document.getElementById('cinema').dataset.scene==='-1'")
                assert await page.locator('.cinema-story:visible,.cinema-detail:visible').count()==0
            await position(page,'cinema',.999)
            await page.wait_for_function("()=>{const v=document.querySelector('[data-cinema-film]');return !v.seeking&&v.currentTime>=v.duration-.04;}")
            await page.locator('button[data-scene="2"]').focus()
            await page.keyboard.press('Enter')
            await page.wait_for_function("document.getElementById('cinema').dataset.scene==='2'")
            await page.locator('.cinema-skip').click()
            await page.wait_for_function("()=>{const r=document.getElementById('visit-title').getBoundingClientRect();return r.top>=68&&r.top<innerHeight;}")
            await position(page,'cinema',.97)
            await page.wait_for_function("document.getElementById('cinema').dataset.scene==='4'")
            await page.locator('.cinema-inquiry').click()
            await page.wait_for_function("document.activeElement.id==='quote-title'")
            results.append({"width":width,"language":language,"full_screen":"passed","complete_decoded_forward_reverse":"passed","five_chapters_and_film_only_intervals":"passed","cumulative_small_photos_and_reverse":"passed","no_overlapping_copy":"passed","keyboard_skip_inquiry":"passed"})
            await page.close()
    for failure in ('mp4','all'):
        page=await browser.new_page(viewport={"width":838,"height":884})
        await page.route('https://api.web3forms.com/**',lambda route:route.abort())
        await page.route('**/assets/venue/cinematic/*.mp4',lambda route:route.abort())
        if failure=='all':
            await page.route('**/assets/venue/cinematic/*.webm',lambda route:route.abort())
        await page.goto(base,wait_until='networkidle')
        await position(page,'cinema',.62)
        if failure=='mp4':
            await page.wait_for_function("()=>{const v=document.querySelector('[data-cinema-film]');return v.dataset.format==='webm'&&v.readyState>=2&&!v.seeking&&v.currentTime>2;}")
        else:
            await page.wait_for_timeout(800)
            assert await page.locator('.cinema-media>img').evaluate('i=>i.complete&&i.naturalWidth>0')
            assert await page.locator('.cinema-media>video').evaluate('v=>Number(getComputedStyle(v).opacity)===0')
        await snapshot(page,output,f'cinema-fallback-{failure}')
        await page.emulate_media(reduced_motion='reduce')
        await page.wait_for_function("!ScrollTrigger.getById('cinematic-journey')")
        assert await page.locator('.cinema-media>video').evaluate("v=>!v.getAttribute('src')&&v.paused")
        assert await page.locator('.cinema-story:visible').count()==5
        await page.locator('button[data-scene="2"]').click()
        assert await page.locator('[data-scene-copy="2"]').evaluate('e=>document.activeElement===e')
        await page.close()
    for variant in ('reduced','short','tiny','save-data','no-gsap','no-page-script','no-javascript'):
        height=667 if variant=='short' else 540 if variant=='tiny' else 844
        context=await browser.new_context(viewport={"width":390,"height":height},reduced_motion='reduce' if variant=='reduced' else 'no-preference',java_script_enabled=variant!='no-javascript')
        if variant=='save-data':
            await context.add_init_script("Object.defineProperty(navigator,'connection',{value:{saveData:true}});")
        if variant=='no-gsap':
            await context.route('**/*gsap*',lambda route:route.abort())
            await context.route('**/*ScrollTrigger*',lambda route:route.abort())
        if variant=='no-page-script':
            await context.route('**/script.js*',lambda route:route.abort())
        transfers=[]
        page=await context.new_page()
        await page.route('https://api.web3forms.com/**',lambda route:route.abort())
        page.on('request',lambda request:transfers.append(request.url))
        await page.goto(base,wait_until='networkidle')
        if variant=='short':
            await position(page,'cinema',.82)
            await page.wait_for_function("document.getElementById('cinema').dataset.scene==='3'")
            r=await page.locator('[data-scene-copy="3"]').bounding_box()
            d=await page.locator('.cinema-details').bounding_box()
            assert r['y']+r['height']<d['y'], ('short',r,d)
        else:
            await page.locator('#cinema-title').scroll_into_view_if_needed()
            assert not any('/cinematic/' in url and url.endswith(('.mp4','.webm')) for url in transfers)
            assert await page.locator('.cinema-story:visible').count()==5
            assert await page.locator('.cinema-detail:visible').count()==4
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        await page.screenshot(path=str(output/f'cinema-{variant}.png'))
        await context.close()
    return {"scenes":results,"format_failure_and_posters":"passed","reduced_short_data_no_gsap_no_script":"passed","real_emails_sent":0}


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
            await position(page, "possibilities")
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
            await opener.click()
            await viewer.locator(".film-close").click()
            assert await viewer.is_hidden()
            await page.locator('[data-i18n="visit.cta"]').click()
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


async def main(args, base):
    args.output.mkdir(parents=True, exist_ok=True)
    launch = {"headless": True}
    executable = args.browser or shutil.which("chromium")
    if executable:
        launch["executable_path"] = executable
    if os.environ.get("HTTPS_PROXY"):
        launch["proxy"] = {"server": os.environ["HTTPS_PROXY"], "bypass": "localhost,127.0.0.1"}
    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch)
        results = []
        for width, height in ((390, 844), (768, 1024), (1280, 900)):
            for language in ("en", "es"):
                result = await review_viewport(browser, base, args.output, width, height, language)
                results.append(result)
                print(f"PASS {width}px {language}: editorial journey, offer, keyboard disclosures, no overflow", flush=True)
        navigation = await check_navigation(browser, base, args.output)
        print("PASS inquiry navigation: service and header, three widths, both languages", flush=True)
        composer = await check_composer(browser, base, args.output)
        print("PASS multi-selection, translation, keyboard removal, occasion context and chapter menu", flush=True)
        paths = await check_paths(browser, base, args.output)
        print("PASS two offering paths, editable optional setting and translated inquiry context", flush=True)
        venue_media = await check_venue_media(browser, base, args.output)
        print("PASS real venue films: decoded playback, manual loading, pause, posters, no-script fallback", flush=True)
        living_story = await check_living_story(browser, base, args.output)
        print("PASS living story: type, reversible photo layers, readable text fades, translation and reduced motion", flush=True)
        cinematic = await check_cinematic(browser, base, args.output)
        print("PASS cinematic scene: decoded forward/reverse frames, chapters, fallbacks", flush=True)
        forms = await check_forms(browser, base)
        print("PASS forms: simulated delivery, validation, failure, retry, duplicate submissions", flush=True)
        variants = await check_variants(browser, base, args.output)
        print("PASS resize, reduced motion, missing GSAP, no JavaScript", flush=True)
        report = {"viewports": results, "navigation": navigation, "forms": forms, "variants": variants, "composer": composer, "paths": paths, "venue_media": venue_media, "cinematic": cinematic, "living_story": living_story}
        (args.output / "results.json").write_text(json.dumps(report, indent=2) + "\n")
        await browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("/tmp/lajolla-browser-review"))
    parser.add_argument("--browser", help="Optional path to Chromium")
    args = parser.parse_args()
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(main(args, f"http://127.0.0.1:{server.server_port}"))
    finally:
        server.shutdown()
        server.server_close()
