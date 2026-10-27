"""Rebuild the images taken from the owners' "LA JOLLA pictures extra" PDF.

The PDF stays in media/extra/, which git ignores; its SHA-256 is recorded below.
Each photograph is read from the PDF's embedded image (by object number), cropped
as recorded, resized and written as AVIF (served first) and WebP fallback in
assets/venue/web/, in sRGB and without metadata. The floor plan is the PDF's
vector page 2 with every word, measurement, area and red dimension line removed,
written to assets/tour/floor-plan.webp. The café menu board on page 3 (it shows
prices) is always outside the crop.
assets/venue/web/extra-photos.json records every hash and treatment.
`--check` needs neither the PDF nor PyMuPDF: it fails when a file differs from the record.
"""
import argparse
import hashlib
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'media/extra/la-jolla-pictures-extra.pdf'
PDF_SHA256 = '3847cc8a9a5820ac8e807fb1f4a44e64a61434e237d1d67ebbef48155395c4be'
MANIFEST = ROOT / 'assets/venue/web/extra-photos.json'
AVIF_QUALITY, WEBP_QUALITY = 62, 82
APPROVAL = ('PDF "LA JOLLA pictures extra" supplied by the venue owners to Dan (site owner) on 2026-10-27 to be published on the website; '
            'the pictures show La Jolla\'s own brand (the LJ 1928 mark and the house\'s "Maison de Thé" tea salon), no third-party brand; '
            'the facade, salon and lounge pictures may be renderings; Dan decided on 2026-10-27 to show them without a styling-concept label; '
            'placement approved by Dan in the project thread on 2026-10-27 ("me encanta.. adelante")')

# assets/venue/web/<name>.{avif,webp}: (PDF page, image object, crop box, output size, treatment)
WEB = {
    'lexington-lounge': (4, 134, (330, 0, 2969, 3299), (960, 1200),
                         'Dark lounge, centred 4:5 crop of the 3299x3299 image, resized to 960x1200'),
    'inspiration-facade': (3, 130, (100, 0, 760, 825), None,
                           'Facade dressed as the house\'s tea salon, 4:5 crop 660x825 at x 100-760; the priced menu board (x>760) is excluded'),
    'inspiration-salon': (4, 135, (0, 93, 2490, 3205), (960, 1200),
                          'Tea salon, centred 4:5 crop of the 2490x3299 image, resized to 960x1200'),
    'inspiration-plaque': (1, 109, (0, 0, 1122, 1402), (800, 1000),
                           'Welcome plaque with flowers (same picture as assets/brand/flower-plaque.jpg), resized to 800x1000'),
}
PLAN = 'assets/tour/floor-plan.webp'
# At 150 dpi the drawing (both floors) spans x 222-2270, y 77-1500; the LJ logo sits at x 2211-2474, y 1313-1584.
PLAN_BOX, LOGO = (200, 50, 2300, 1510), (2200, 1300, 2550, 1650)
PLAN_TREATMENT = ('Page 2 rendered at 150 dpi after redacting every text span (measurements, areas, ceiling heights, '
                  'room and build notes); red and pink dimension lines whitened; logo removed; both floors in a 2100x1460 crop, WebP q80')


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def to_srgb(image):
    image = image.convert('RGB')
    image.info.clear()
    return image


def encode(image, ext):
    out = io.BytesIO()
    if ext == 'avif':
        image.save(out, 'AVIF', quality=AVIF_QUALITY, speed=4, max_threads=1)
    else:
        image.save(out, 'WEBP', quality=WEBP_QUALITY, method=6)
    return out.getvalue()


def build():
    import pymupdf
    import numpy as np
    from PIL import Image
    if not PDF.is_file():
        sys.exit(f'Put the owners\' PDF at {PDF.relative_to(ROOT)} to rebuild.')
    data = PDF.read_bytes()
    if sha256_bytes(data) != PDF_SHA256:
        sys.exit(f'{PDF.relative_to(ROOT)} is not the recorded PDF')
    doc = pymupdf.open(stream=data, filetype='pdf')
    files, records = {}, []
    for name, (page, xref, box, size, treatment) in WEB.items():
        pix = pymupdf.Pixmap(doc, xref)
        if pix.alpha:
            pix = pymupdf.Pixmap(pix, 0)
        image = to_srgb(Image.frombytes('RGB', (pix.width, pix.height), pix.samples)).crop(box)
        if size:
            image = image.resize(size, Image.LANCZOS)
        for ext in ('avif', 'webp'):
            path = f'assets/venue/web/{name}.{ext}'
            files[path] = encode(image, ext)
            records.append({'asset': path, 'pdfPage': page, 'pdfImage': xref, 'size': list(image.size),
                            'treatment': treatment, 'sha256': sha256_bytes(files[path])})
    page = doc[1]
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for span in line['spans']:
                page.add_redact_annot(span['bbox'])
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE, graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    if page.get_text().strip():
        sys.exit('floor plan: text remains after redaction')
    pix = page.get_pixmap(dpi=150)
    plan = np.asarray(Image.frombytes('RGB', (pix.width, pix.height), pix.samples)).astype(int)
    # Red and pink dimension lines and their anti-aliased fringes; the plan itself is black and grey.
    red = (plan[..., 0] > 140) & (plan[..., 0] - plan[..., 1] > 25) & (plan[..., 0] - plan[..., 2] > 25)
    plan[red] = 255
    plan[LOGO[1]:LOGO[3], LOGO[0]:LOGO[2]] = 255
    plan = Image.fromarray(plan.astype('uint8')).crop(PLAN_BOX)
    grey = np.asarray(plan.convert('L'))
    if min(grey[:, :8].min(), grey[:, -8:].min(), grey[:8].min(), grey[-8:].min()) < 200:
        sys.exit('floor plan: the drawing touches the crop edge')
    out = io.BytesIO()
    plan.save(out, 'WEBP', quality=80, method=6)
    files[PLAN] = out.getvalue()
    records.append({'asset': PLAN, 'pdfPage': 2, 'size': list(plan.size), 'treatment': PLAN_TREATMENT,
                    'sha256': sha256_bytes(files[PLAN])})
    for path, content in files.items():
        (ROOT / path).write_bytes(content)
    MANIFEST.write_text(json.dumps({'source': {'file': 'LA JOLLA pictures extra.pdf', 'pages': 4, 'sha256': PDF_SHA256},
                                    'approval': APPROVAL, 'assets': records}, indent=2) + '\n')
    print(f'{len(files)} files written; record: {MANIFEST.relative_to(ROOT)}')


def check():
    record = json.loads(MANIFEST.read_text())
    expected = {f'assets/venue/web/{n}.{e}' for n in WEB for e in ('avif', 'webp')} | {PLAN}
    listed = {entry['asset'] for entry in record['assets']}
    if listed != expected:
        sys.exit(f'record lists {sorted(listed ^ expected)} unexpectedly')
    for entry in record['assets']:
        if sha256_bytes((ROOT / entry['asset']).read_bytes()) != entry['sha256']:
            sys.exit(f'{entry["asset"]} differs from the record')
    print(f'{len(listed)} files match {MANIFEST.relative_to(ROOT)}')


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='verify committed files against the record')
    check() if parser.parse_args().check else build()


if __name__ == '__main__':
    main()
