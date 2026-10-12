"""Exercise the tour calendar without booking an appointment or sending mail."""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

BOOKING_URL = 'https://bookings.cloud.microsoft/book/LajollaCoralGables@NETORGFT21116605.onmicrosoft.com/?ismsaljsauthenabled=true'

async def main(base, output):
    output.mkdir(parents=True, exist_ok=True)
    launch = {'headless': True}
    if os.environ.get('HTTPS_PROXY'):
        launch['proxy'] = {'server': os.environ['HTTPS_PROXY'], 'bypass': 'localhost,127.0.0.1'}
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch)
        for width, height in [(320, 600), (390, 844), (1366, 500), (1366, 768)]:
            context = await browser.new_context(viewport={'width': width, 'height': height})
            page = await context.new_page()
            provider_requests = []
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            async def provider(route):
                provider_requests.append(route.request.url)
                await route.fulfill(content_type='text/html', body='<html><body><h1>Mock booking calendar</h1><button>Mock focus target</button></body></html>')
            await context.route('https://bookings.cloud.microsoft/**', provider)
            async def mail(route):
                raise AssertionError('Calendar actions must not submit an inquiry')
            await page.route('**/api/inquiries', mail)
            await page.route('https://api.web3forms.com/**', mail)
            await page.goto(base.rstrip('/') + '/planning.html', wait_until='networkidle')
            assert not provider_requests, 'Microsoft must not load before a user opens the calendar'
            assert await page.locator('#quote-form').count() == 0
            await page.locator('[data-service-id="planning"]').click()
            assert await page.locator('#inquiry-selection li').count() == 1
            opener = page.locator('.inquiry-visit [data-booking-opener]')
            for language in ['en', 'es']:
                await page.locator(f'[data-lang="{language}"]').click()
                await opener.click()
                viewer = page.locator('#booking-viewer')
                assert await viewer.is_visible()
                await page.frame_locator('.booking-frame').locator('h1').wait_for()
                assert await page.locator('.booking-frame').get_attribute('src') == BOOKING_URL
                assert len(provider_requests) == 1, 'Reopening must preserve the unfinished booking'
                assert await page.locator('#form-success').count() == 0
                assert await page.locator('.booking-fallback a').get_attribute('href') == BOOKING_URL
                assert await page.locator('.booking-fallback a').get_attribute('target') == '_blank'
                assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                bounds = await viewer.bounding_box()
                assert bounds['x'] >= -1 and bounds['x'] + bounds['width'] <= width + 1
                assert bounds['y'] >= -1 and bounds['y'] + bounds['height'] <= height + 1
                await page.screenshot(path=str(output / f'calendar-{width}-{language}.png'))
                if language == 'en':
                    await page.locator('.booking-close').click()
                else:
                    await page.frame_locator('.booking-frame').locator('button').focus()
                    # Cross-origin calendars own their keyboard events. Shift-Tab
                    # returns to our close control; Escape then closes the dialog.
                    await page.keyboard.press('Shift+Tab')
                    assert await page.locator('.booking-close').evaluate('e => e === document.activeElement')
                    await page.keyboard.press('Escape')
                await viewer.wait_for(state='hidden')
                assert await opener.evaluate('e => e === document.activeElement')
                assert await page.locator('[data-service-id="planning"]').get_attribute('aria-pressed') == 'true'
                assert await page.locator('#inquiry-selection li').count() == 1
                assert not await page.locator('body').evaluate('e => e.classList.contains("booking-open")')
            assert not errors, errors
            results.append({'width': width, 'height': height, 'lazyLoad': True, 'serviceSelectionPreserved': True, 'quoteFormRemoved': True, 'closeAndEscape': True, 'languages': ['en', 'es']})
            await context.close()
        context = await browser.new_context(java_script_enabled=False)
        page = await context.new_page()
        await page.goto(base.rstrip('/') + '/planning.html')
        assert await page.locator('.inquiry-visit [data-booking-opener]').get_attribute('href') == BOOKING_URL
        assert await page.locator('.booking-frame').get_attribute('src') is None
        await browser.close()
    (output / 'results.json').write_text(json.dumps(results, indent=2))
    print('Bookings-only planning: no duplicate quote form; retained service selection/calendar session; keyboard, EN/ES, mobile/desktop and no-JS fallback passed; no real appointments or emails.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', required=True)
    parser.add_argument('--output', type=Path, default=Path('review-artifacts/bookings'))
    args = parser.parse_args()
    asyncio.run(main(args.base, args.output))
