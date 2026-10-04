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


async def review_viewport(browser, base, output, width, height, language):
    folder = output / f"{width}-{language}"
    folder.mkdir(parents=True, exist_ok=True)
    context = await browser.new_context(
        viewport={"width": width, "height": height},
        record_video_dir=str(folder), record_video_size={"width": width, "height": height},
    )
    # All email requests are intercepted, including accidental submissions during review.
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

    # Check the entire crossfade, not just its endpoints. The photographs must cover the background.
    minimum_coverage = 1
    for step in range(101):
        await position(page, "hero", step / 100)
        coverage = await page.evaluate("""() => 1 - [...document.querySelectorAll('.reel-shot')]
          .reduce((remaining, shot) => remaining * (1 - Number(getComputedStyle(shot).opacity)), 1)""")
        minimum_coverage = min(minimum_coverage, coverage)
        assert coverage > .95, f"{width}/{language}: opening exposes its empty background at {step}%"

    scales = []
    for i in range(4):
        pair = []
        for time in (.35, 1.1):
            await position(page, "hero", (i * 1.4 + time) / 5.6)
            pair.append(await page.evaluate("i => Number(gsap.getProperty(document.querySelectorAll('.reel-shot img')[i], 'scaleX'))", i))
        assert pair[1] > pair[0] + .01, f"Photo {i} does not zoom"
        scales.append(pair)
        bounds = await page.locator(".reel-beat").nth(i).bounding_box()
        assert bounds and bounds["x"] >= 0 and bounds["x"] + bounds["width"] <= width + 1
        assert bounds["y"] >= 68 and bounds["y"] + bounds["height"] <= height
        await snapshot(page, folder, f"hero-{i}")
    await position(page, "hero", 0)
    assert await page.locator("#hero h1").is_visible(), "Opening title is missing at first paint"
    assert "MonteCarlo" in await page.locator("#hero h1").evaluate("e => getComputedStyle(e).fontFamily")
    await snapshot(page, folder, "hero-start")

    for section in ("history", "moment"):
        for progress in (0, .5, 1):
            await position(page, section, progress)
            if section == "history":
                title = await page.locator("#history .eyebrow").bounding_box()
                assert title["y"] >= 68, "Header covers the history introduction"
                picture = await page.locator(".history-photo").bounding_box()
                assert picture["height"] >= 200, "History text collapses the photo"
                body = await page.locator("#history .lede").bounding_box()
                assert body["y"] + body["height"] <= height, "History copy is clipped"
            await snapshot(page, folder, f"{section}-{progress}")

    assert await page.locator(".rentals-quiet li").count() == 10
    assert await page.locator(".brand-card").count() == 7
    assert await page.locator(".team-card").count() == 2
    assert await page.locator("#testimonial").is_hidden()
    for section in ("events", "alcazar", "rentals", "gallery", "team", "quote", "vendors"):
        for progress in (0, .45):
            await position(page, section, progress)
            await snapshot(page, folder, f"{section}-{progress}")
        for element in await page.locator(f"#{section} .reveal").all():
            assert await element.evaluate("e => Number(getComputedStyle(e).opacity)") == 1
    assert await page.locator(".alcazar-visual img").evaluate("e => getComputedStyle(e).objectFit") == "contain"

    # Record one uninterrupted journey through every section in this language and viewport.
    await scroll(page, 0)
    total = await page.evaluate("document.documentElement.scrollHeight - innerHeight")
    for y in range(0, total + height, max(1, height // 3)):
        await scroll(page, min(y, total))
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Horizontal overflow"
        await page.wait_for_timeout(80)
    await snapshot(page, folder, "footer")
    missing = await page.locator("img").evaluate_all("images => images.filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src'))")
    assert not missing, f"Missing images: {missing}"
    assert not errors, errors
    video = page.video
    await context.close()
    await video.save_as(str(folder / "scroll.webm"))
    return {"width": width, "height": height, "language": language, "coverage": minimum_coverage, "zoom": scales, "errors": errors}


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
    assert await page.locator("#q-interest").input_value() == expected
    assert await page.locator("#q-type").input_value() == "rental"

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
    return {"simulated_requests": len(requests), "real_emails_sent": 0, "validation": "passed", "failure_and_retry": "passed", "timeout": "passed", "invalid_json": "passed", "duplicate_guard": "passed"}


async def check_variants(browser, base, output):
    page = await browser.new_page(viewport={"width": 1280, "height": 900})
    await page.goto(base, wait_until="networkidle")
    for width, height in ((390, 844), (1280, 900), (768, 1024)):
        await page.set_viewport_size({"width": width, "height": height})
        await page.wait_for_timeout(300)
        await scroll(page, 0)
        origin = await page.locator(".reel-shot img").first.evaluate("e => getComputedStyle(e).objectPosition")
        assert origin == ("0% 100%" if width <= 800 else "8% 96%"), f"Resize keeps the old crop: {origin}"
        assert await page.evaluate("ScrollTrigger.getAll().filter(t => t.trigger.id === 'hero').length") == 1
    await page.close()
    page = await browser.new_page(viewport={"width": 390, "height": 667})
    await page.goto(base, wait_until="networkidle")
    await page.locator('[data-lang="es"]').click()
    await page.wait_for_timeout(100)
    assert await page.evaluate("!ScrollTrigger.getAll().find(t => t.trigger.id === 'history').vars.pin")
    await position(page, "history")
    await snapshot(page, output, "short-screen-history-copy")
    await page.locator(".history-photo").scroll_into_view_if_needed()
    await snapshot(page, output, "short-screen-history-photo")
    assert (await page.locator(".history-photo").bounding_box())["height"] >= 256
    assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    await page.close()
    for variant in ("reduced-motion", "no-gsap", "no-javascript"):
        context = await browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce" if variant == "reduced-motion" else "no-preference", java_script_enabled=variant != "no-javascript")
        if variant == "no-gsap":
            await context.route("**/assets/vendor/gsap.min.js", lambda route: route.abort())
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(base, wait_until="networkidle")
        assert not errors, errors
        assert await page.locator("#hero h1").is_visible()
        assert await page.locator(".reel-shot").count() == 4
        await page.screenshot(path=str(output / f"{variant}.png"), full_page=True)
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        await context.close()
    return {"responsive_resize": "passed", "short_screen_history": "passed", "reduced_motion": "passed", "missing_gsap": "passed", "no_javascript": "passed"}


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
                print(f"PASS {width}px {language}: sections 1–9, zoom, crossfades, no overflow", flush=True)
        forms = await check_forms(browser, base)
        print("PASS forms: simulated delivery, validation, failure, retry, duplicate submissions", flush=True)
        variants = await check_variants(browser, base, args.output)
        print("PASS resize, reduced motion, missing GSAP, no JavaScript", flush=True)
        report = {"viewports": results, "forms": forms, "variants": variants}
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
