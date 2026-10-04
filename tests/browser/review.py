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
    # Give the browser compositor time to paint a pin after a programmatic scroll jump.
    await page.wait_for_timeout(200)
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
            await page.wait_for_function("""() => {
              const r = document.getElementById('quote-title').getBoundingClientRect();
              return r.top >= 68 && r.bottom <= innerHeight;
            }""", timeout=5000)
            assert await page.locator("#q-interest").input_value() == expected
            await snapshot(page, output, f"navigation-{width}-{language}-service")
            await scroll(page, 0)
            await page.locator(".inquire-link").click()
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
    if width > 900:
        for step in range(101):
            await position(page, "hero", step / 100)
            coverage = await page.evaluate("""() => 1 - [...document.querySelectorAll('.reel-shot')]
              .reduce((remaining, shot) => remaining * (1 - Number(getComputedStyle(shot).opacity)), 1)""")
            minimum_coverage = min(minimum_coverage, coverage)
            assert coverage > .95, f"Opening exposes its background at {step}%"
            assert await page.locator(".arrival-actions .btn").is_visible()
        for i in range(4):
            await position(page, "hero", (i + .4) / 4)
            await snapshot(page, folder, f"hero-{i}")
        # Copy and CTA stay within the pinned frame, even at the last photograph.
        r = await page.locator(".arrival-actions .btn").bounding_box()
        assert r["y"] >= 68 and r["y"] + r["height"] <= height

    assert await page.locator(".rentals-quiet li").count() == 10
    assert await page.locator(".brand-card").count() == 7
    assert await page.locator(".team-card").count() == 2
    assert await page.locator("#testimonial").is_hidden()
    assert await page.evaluate("!ScrollTrigger.getAll().some(t => t.trigger.id === 'history' && t.vars.pin)")
    for section in ("history", "moment", "events", "alcazar", "rentals", "gallery", "team", "quote", "vendors"):
        await position(page, section)
        await snapshot(page, folder, section)
        for element in await page.locator(f"#{section} .reveal").all():
            assert await element.evaluate("e => Number(getComputedStyle(e).opacity)") == 1
    # The painted oval has known bounds in the approved leaves artwork. Ensure
    # the quote does not intersect it after object-fit, crop and transform.
    for progress in (0, .5, 1):
        await position(page, "moment", progress)
        overlap = await page.evaluate("""() => {
          const img = document.querySelector('.quote-bleed-media img');
          const box = img.getBoundingClientRect();
          const q = document.querySelector('.quote-bleed-text p').getBoundingClientRect();
          const pos = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
          const fit = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
          const x = box.left + (box.width - img.naturalWidth * fit) * pos[0];
          const y = box.top + (box.height - img.naturalHeight * fit) * pos[1];
          const oval = {left:x+370*fit,right:x+710*fit,top:y+480*fit,bottom:y+870*fit};
          return q.left < oval.right && q.right > oval.left && q.top < oval.bottom && q.bottom > oval.top;
        }""")
        assert not overlap, f"{width}/{language}: quote crosses painted monogram"
    await position(page, "moment")
    await snapshot(page, folder, "moment")
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
    # A CSS-visible form elsewhere in the document is insufficient: navigation
    # must actually bring its heading into this viewport after a native jump.
    await page.wait_for_function("""() => {
      const r = document.getElementById('quote-title').getBoundingClientRect();
      return r.top >= 68 && r.bottom <= innerHeight;
    }""", timeout=5000)
    assert await page.locator("#q-interest").input_value() == expected
    assert await page.locator("#q-type").input_value() == "rental"
    await scroll(page, 0)
    await page.locator(".inquire-link").click()
    await page.wait_for_function("""() => {
      const r = document.getElementById('quote-title').getBoundingClientRect();
      return r.top >= 68 && r.bottom <= innerHeight;
    }""", timeout=5000)

    async def fill_quote():
        for field, value in {"q-name": " Browser test ", "q-email": " browser@example.com ", "q-phone": "+13055550100", "q-date": "2027-02-15", "q-guests": "40"}.items():
            await page.locator(f"#{field}").fill(value)
        await page.locator("#q-type").select_option("wedding")

    async def fill_vendor():
        for field, value in {"v-name": " Browser test ", "v-company": "Test company", "v-service": "Test service", "v-email": " browser@example.com "}.items():
            await page.locator(f"#{field}").fill(value)

    for form, prefix, fill in (("quote-form", "form", fill_quote), ("vendor-form", "vendor", fill_vendor)):
        await page.locator(f"#{form}").evaluate("f => f.reset()")
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
            assert await page.locator(f"#{form} button[type=submit]").is_enabled()

        response, status, mode = {"success": True}, 200, "json"
        count = len(requests)
        await page.locator(f"#{form}").evaluate("f => { f.requestSubmit(); f.requestSubmit(); }")
        await page.locator(f"#{prefix}-success").wait_for(state="visible")
        await page.wait_for_timeout(200)
        assert len(requests) == count + 1, "Duplicate submission was sent"
        assert requests[-1]["email"] == "browser@example.com"
        assert requests[-1]["replyto"] == "browser@example.com"
        assert requests[-1]["ccemail"] == "info@lajollacoralgables.com"
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
        assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.trigger.id === 'hero').length") == 1
        assert await page.evaluate("!!ScrollTrigger.getAll().find(t => t.trigger.id === 'hero').vars.pin") == (width > 900)
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    await page.emulate_media(reduced_motion="reduce")
    await page.wait_for_timeout(200)
    assert not await page.locator("html").evaluate("e => e.classList.contains('has-gsap')")
    assert await page.evaluate("ScrollTrigger.getAll().length") == 0
    await page.emulate_media(reduced_motion="no-preference")
    await page.wait_for_timeout(200)
    assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.trigger.id === 'hero').length") == 1
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
    for variant in ("reduced-motion", "no-gsap", "no-javascript"):
        context = await browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce" if variant == "reduced-motion" else "no-preference", java_script_enabled=variant != "no-javascript")
        await context.route("https://api.web3forms.com/**", lambda route: route.abort())
        if variant == "no-gsap":
            await context.route("**/assets/vendor/gsap.min.js", lambda route: route.abort())
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(base, wait_until="networkidle")
        assert not errors, errors
        assert await page.locator("#hero h1").is_visible()
        assert await page.locator(".reel-shot").count() == 4
        await page.locator(".occasion").nth(1).locator("summary").click()
        assert await page.locator(".occasion").nth(1).locator(".occasion-body").is_visible()
        if variant == "no-javascript":
            assert await page.locator("#quote-form").is_hidden()
            assert await page.locator("#quote noscript a[href^='mailto:']").is_visible()
        await page.screenshot(path=str(output / f"{variant}.png"), full_page=True)
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        await context.close()
    return {"responsive_resize": "passed", "short_screen": "passed", "dynamic_reduced_motion": "passed", "missing_gsap": "passed", "no_javascript_contact": "passed"}


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
        forms = await check_forms(browser, base)
        print("PASS forms: simulated delivery, validation, failure, retry, duplicate submissions", flush=True)
        variants = await check_variants(browser, base, args.output)
        print("PASS resize, reduced motion, missing GSAP, no JavaScript", flush=True)
        report = {"viewports": results, "navigation": navigation, "forms": forms, "variants": variants}
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
