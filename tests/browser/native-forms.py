"""Exercise Node-served native forms with intercepted APIs only; never send email."""
import argparse
import asyncio
import json
import os
from pathlib import Path
import shutil
from playwright.async_api import async_playwright

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
            requests = []; external = []; errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            status = 503
            reference = 'LJ-00000000-0000-4000-8000-000000000001'
            async def api(route):
                requests.append({'payload': route.request.post_data_json, 'key': route.request.headers.get('idempotency-key')})
                body = {'success': True, 'reference': reference, 'mailStatus': 'accepted', 'bookingConfirmed': False} if status == 200 else {'success': False, 'code': 'delivery_requires_review', 'reference': reference}
                await route.fulfill(status=status, content_type='application/json', body=json.dumps(body))
            async def deny_external(route):
                external.append(route.request.url)
                await route.abort()
            await page.route('**/api/inquiries', api)
            await page.route('https://api.web3forms.com/**', deny_external)
            await page.goto(base.rstrip('/') + '/planning.html', wait_until='networkidle')
            assert await page.locator('html').get_attribute('data-inquiry-transport') == 'native'
            await page.locator(f'[data-lang="{language}"]').click()
            for field, value in {'q-name': 'Fake native visitor', 'q-email': 'native-test@example.com', 'q-phone': '+13055550100', 'q-date': '2027-02-15', 'q-guests': '40', 'q-comments': 'FAKE PRIVATE NOTE — not an inquiry'}.items():
                await page.locator('#' + field).fill(value)
            await page.locator('#q-type').select_option('wedding')
            await page.locator('#quote-form [type=submit]').click()
            await page.locator('#form-send-error').wait_for(state='visible')
            assert await page.locator('#q-name').input_value() == 'Fake native visitor'
            assert reference in await page.locator('#form-send-error').text_content()
            other = 'en' if language == 'es' else 'es'
            await page.locator(f'[data-lang="{other}"]').click()
            assert reference in await page.locator('#form-send-error').text_content()
            status = 200
            await page.locator('#quote-form [type=submit]').click()
            await page.locator('#form-success').wait_for(state='visible')
            assert await page.locator('#q-name').input_value() == ''
            assert len(requests) == 2 and requests[0]['key'] == requests[1]['key']
            assert requests[0]['payload']['kind'] == 'quote'
            assert set(requests[0]['payload']) == {'kind', 'name', 'email', 'phone', 'eventDate', 'guestCount', 'eventType', 'eventLocation', 'selectedServices', 'selectedServiceIds', 'rentalInterest', 'comments'}
            await page.locator('#vendor-details > summary').click()
            for field, value in {'v-name': 'Fake native vendor', 'v-company': 'Fake test company', 'v-service': 'Technical native test', 'v-email': 'vendor-test@example.com'}.items():
                await page.locator('#' + field).fill(value)
            await page.locator('#vendor-form [type=submit]').click()
            await page.locator('#vendor-success').wait_for(state='visible')
            assert requests[-1]['payload']['kind'] == 'vendor'
            assert requests[-1]['key'] != requests[0]['key']
            assert set(requests[-1]['payload']) == {'kind', 'name', 'email', 'company', 'service'}
            stored = await page.evaluate('JSON.stringify({local:{...localStorage},session:{...sessionStorage}})')
            assert 'native-test@example.com' not in stored and 'FAKE PRIVATE NOTE' not in stored
            assert not external and not errors
            await page.screenshot(path=str(output / f'native-{width}.png'))
            reports.append({'viewport': width, 'quote_vendor_mapping': 'passed', 'unchanged_retry_uuid': 'passed', 'uncertain_reference_translation': 'passed', 'contact_storage': 'none', 'external_mail_calls': 0, 'real_emails_sent': 0})
            await context.close()
        await browser.close()
    (output / 'results.json').write_text(json.dumps(reports, indent=2) + '\n')
    print('PASS native forms, UUID reuse, saved reference, languages, no external mail calls', flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(review(args.base, args.output))
