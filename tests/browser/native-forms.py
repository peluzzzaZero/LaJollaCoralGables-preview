"""Check the Node-served visit route while local inquiry delivery is disabled."""
import argparse
import asyncio
import json
import os
from pathlib import Path
import shutil
from playwright.async_api import async_playwright
from review import third_party_map_error

async def review(base, output):
    output.mkdir(parents=True, exist_ok=True)
    reports = []
    launch = {'headless': True, 'executable_path': shutil.which('chromium')}
    if not launch['executable_path']:
        del launch['executable_path']
    if os.environ.get('HTTPS_PROXY'):
        launch['proxy'] = {'server': os.environ['HTTPS_PROXY'], 'bypass': 'localhost,127.0.0.1'}
    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch)
        for width, language in [(390, 'es'), (1280, 'en')]:
            context = await browser.new_context(viewport={'width': width, 'height': 900})
            page = await context.new_page()
            mail_requests = []; errors = []
            page.on('pageerror', lambda error: errors.append(str(error)) if not third_party_map_error(error) else None)
            async def deny_mail(route):
                mail_requests.append(route.request.url)
                await route.abort()
            await page.route('**/api/inquiries', deny_mail)
            await page.route('https://api.web3forms.com/**', deny_mail)
            await page.goto(base.rstrip('/') + '/planning.html', wait_until='networkidle')
            await page.locator(f'[data-lang="{language}"]').click()
            assert await page.locator('form, input, textarea').count() == 0
            assert await page.locator('[data-booking-opener]').count() == 1
            opener = page.locator('[data-booking-opener]')
            assert await opener.is_visible()
            assert 'bookings.cloud.microsoft/book/' in await opener.get_attribute('href')
            assert await page.locator('.booking-frame').get_attribute('src') is None
            assert await page.locator('#vendors, #rentals, #inquiry-selection').count() == 0
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert not mail_requests and not errors
            await page.screenshot(path=str(output / f'visit-{width}.png'))
            reports.append({'viewport': width, 'language': language, 'single_visit_action': True, 'forms_removed': True, 'local_mail_requests': 0, 'real_emails_sent': 0})
            await context.close()
        await browser.close()
    (output / 'results.json').write_text(json.dumps(reports, indent=2) + '\n')
    print('PASS Node visit route: single Bookings action, no forms, no local mail dependency or requests', flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(review(args.base, args.output))
