"""Rebuild the event photographs from the owner's originals.

The owner's originals stay in media/events/, which git ignores; their SHA-256
is recorded below and in tests/VENUE-MEDIA.md. For each photograph the script
writes an AVIF (served first) and a WebP fallback in assets/venue/web/, at the
source's own size with only the recorded crop, converted to sRGB and written
without metadata. Sources the house mosaic and the occasion records read from
assets/venue/ are copied there without metadata (re-encoded only when cropped).
assets/venue/web/event-photos.json records every hash and treatment.
`--check` needs no originals: it fails when a file differs from the record.
"""
import argparse
import hashlib
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'media/events'
MANIFEST = ROOT / 'assets/venue/web/event-photos.json'
AVIF_QUALITY, WEBP_QUALITY = 62, 82
APPROVAL = ('Delivered by Dan (site owner) on 2026-10-20 as the venue\'s own promotional material, cleared for '
            'publication with the couple\'s consent (recorded in tests/VENUE-MEDIA.md)')

# Owner originals, delivered on 2026-10-20 at the best quality available to him.
ORIGINALS = {
    'first-dance': 'f5e538d139294413a19181c557a817926db4d459fc8592ff32a599d940c17949',
    'bougainvillea': 'f84150eda132e2e0f0661ca6f8927fb72179a4fd5717c5b3cd9eb7f243617bdd',
    'facade-night': 'c6c072068a5dab0386031e9dc7ad723c6f081202236f6c6869406150c2354eb3',
    'tablescape': 'ba158ae9d7115330872dc1baf40a5f46f63ce41fe234e6f7b2a3882f0e8d7856',
    'mood-ivory': '4d5ac49fb64b219da05db6e1941f75f90d0a3d34c9cb51dfb83511f69a9dfd51',
    'mood-amethyst': 'ca3005be1c614bc0dfc85e440ba0de1b2ea204f8be9cbe80238ac21d13a01190',
    'mood-amber': '8618809034d50aefee7d0a556ae59d3f1d081bf1e6cfd0008beaa171f3fa4e27',
    'mood-coral': '5124b4b497eb3650505c1a513da63c092590a4ecb68c0a429323d43d67641a1e',
    'mood-emerald': 'bb618ea028ff8ea2459146b9d51f84cece06f4fcd0240e5f303bf2d517c274ab',
    'balcony-couple': '9e7dc00cc752202da47ba3737adf4f2adb905b512f6824cdfcd7060c03c91011',
    'dessert-table': 'e64447ce305c193de928b59d768efb4a23a876af4d9ac3ef1a126a03cb5627ea',
    'holiday-party': '9565ef02504b2db80b2208a45df5b4da8c8a9b04b29e234b82689407d1085f70',
    'first-dance-wide': 'c0ce5ff21c3ab8e67a2502616b99df4245891cf9e75dea2d5d6777887a52ebba',
    'dance-floor-toast': '0c668f11dc5622ecf89c4f53f48ae524c943886b3008074cb09bd0c18a1c0b9b',
    'tables-lilac': '76989d80554af9d915cad4bba279ca5c47f7195e489e2ea9bb5a226c1d0fe604',
    'reception-white': 'c6034ee5d602a867a5e43fbcbeae3e418bfe9cb2a698e8ce0e145de440220a86',
    'reception-floral': '010e0b59ec998c99852947a3ab372683fd0bb0539c067e78ff1a3e20cde7d85d',
    'orchids-emerald': 'f011a4feb89cd0dffd79b191594eed95796616d475b90195d2303982dd55b1c2',
    'rose-centerpiece': 'b8bf4d4b7fb5520f81f7597f14058b5023ce0c4f6ef0ac397011c5014acebf23',
}

# assets/venue/<name>.jpg: (original, crop box or None, treatment)
SOURCES = {
    'balcony-couple': ('balcony-couple', None, 'Original JPEG, metadata removed'),
    'dessert-table': ('dessert-table', None, 'Original JPEG, metadata removed'),
    'holiday-party': ('holiday-party', None, 'Original JPEG, metadata removed'),
    'first-dance-wide': ('first-dance-wide', None, 'Original JPEG, metadata removed'),
    'dance-floor-toast': ('dance-floor-toast', None, 'Original JPEG, metadata removed'),
    'tables-lilac': ('tables-lilac', None, 'Original JPEG, metadata removed'),
    'reception-white': ('reception-white', (0, 22, 804, 565), 'Black letterbox bars removed (rows 22-564 kept), JPEG q95'),
    'reception-floral': ('reception-floral', (0, 17, 804, 583), 'Black letterbox bars removed (rows 17-582 kept), JPEG q95'),
    'orchids-emerald': ('orchids-emerald', None, 'Original JPEG, metadata removed'),
    'rose-centerpiece': ('rose-centerpiece', None, 'Original JPEG, metadata removed'),
}

# assets/venue/web/<name>.{avif,webp}: (source, crop box or None, treatment)
WEB = {
    'first-dance': ('media:first-dance', None, 'Full frame 804x1207'),
    'tablescape': ('media:tablescape', None, 'Full frame 804x536'),
    'bougainvillea': ('media:bougainvillea', (264, 0, 942, 905), 'Centred 3:4 crop 678x905'),
    'facade-night': ('media:facade-night', (0, 110, 804, 562), '16:9 crop 804x452 from y=110'),
    'mood-ivory': ('media:mood-ivory', (184, 16, 620, 561), 'White border removed (rows 16-560), centred 4:5 crop 436x545'),
    'mood-amethyst': ('media:mood-amethyst', (0, 20, 480, 620), 'Centred 4:5 crop 480x600'),
    'mood-amber': ('media:mood-amber', (188, 0, 616, 535), 'Centred 4:5 crop 428x535'),
    'mood-coral': ('media:mood-coral', (188, 0, 616, 535), 'Centred 4:5 crop 428x535'),
    'mood-emerald': ('media:mood-emerald', (187, 0, 617, 537), 'Centred 4:5 crop 430x537'),
    'occasion-quince': ('reception-white', None, 'Full frame of assets/venue/reception-white.jpg'),
    'occasion-social': ('dessert-table', None, 'Full frame of assets/venue/dessert-table.jpg'),
    'occasion-corporate': ('holiday-party', None, 'Full frame of assets/venue/holiday-party.jpg'),
    'occasion-galas': ('reception-floral', None, 'Full frame of assets/venue/reception-floral.jpg'),
    'occasion-other': ('orchids-emerald', None, 'Full frame of assets/venue/orchids-emerald.jpg'),
    'services-florals': ('rose-centerpiece', None, 'Full frame of assets/venue/rose-centerpiece.jpg'),
}


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def strip_jpeg(data):
    """Keep only the JFIF header, the ICC profile and the image data, without re-encoding."""
    if data[:2] != b'\xff\xd8':
        sys.exit('not a JPEG')
    out, i = bytearray(data[:2]), 2
    while i < len(data):
        if data[i] != 0xFF:
            sys.exit('malformed JPEG')
        marker = data[i + 1]
        if marker == 0xDA:
            out += data[i:]
            break
        length = int.from_bytes(data[i + 2:i + 4], 'big')
        segment = data[i:i + 2 + length]
        metadata = 0xE0 <= marker <= 0xEF or marker == 0xFE
        if not metadata or (marker == 0xE0 and segment[4:9] == b'JFIF\0') or (marker == 0xE2 and segment[4:16] == b'ICC_PROFILE\0'):
            out += segment
        i += 2 + length
    return bytes(out)


def original(name):
    path = MEDIA / f'{name}.jpg'
    if not path.is_file():
        sys.exit(f'Put the owner original at {path.relative_to(ROOT)} to rebuild it.')
    data = path.read_bytes()
    if sha256_bytes(data) != ORIGINALS[name]:
        sys.exit(f'{path.relative_to(ROOT)} is not the recorded original')
    return data


def to_srgb(image):
    from PIL import ImageCms
    icc = image.info.get('icc_profile')
    image = image.convert('RGB')
    if icc:
        image = ImageCms.profileToProfile(image, ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                                          ImageCms.createProfile('sRGB'), renderingIntent=0, outputMode='RGB')
    # Untagged sRGB: the generated profile carries a creation time and would make builds differ.
    image.info.clear()
    return image


def build():
    from PIL import Image
    files, records = {}, []
    for name, (source, box, treatment) in SOURCES.items():
        data = original(source)
        if box:
            image = Image.open(io.BytesIO(data))
            icc = image.info.get('icc_profile')
            buffer = io.BytesIO()
            image.convert('RGB').crop(box).save(buffer, 'JPEG', quality=95, subsampling=0, **({'icc_profile': icc} if icc else {}))
            data = buffer.getvalue()
        else:
            data = strip_jpeg(data)
        path = f'assets/venue/{name}.jpg'
        files[path] = data
        records.append({'asset': path, 'sha256': sha256_bytes(data), 'original': f'{source}.jpg',
                        'originalSha256': ORIGINALS[source], 'treatment': treatment, 'ownerApproval': APPROVAL})
    for name, (source, box, treatment) in WEB.items():
        if source.startswith('media:'):
            key = source[6:]
            data, origin = original(key), {'original': f'{key}.jpg', 'originalSha256': ORIGINALS[key]}
        else:
            path = f'assets/venue/{source}.jpg'
            data, origin = files[path], {'source': path, 'sourceSha256': sha256_bytes(files[path])}
        image = to_srgb(Image.open(io.BytesIO(data)))
        if box:
            image = image.crop(box)
        for ext, options in (('avif', {'quality': AVIF_QUALITY, 'speed': 4, 'max_threads': 1}),
                             ('webp', {'quality': WEBP_QUALITY, 'method': 6})):
            buffer = io.BytesIO()
            image.save(buffer, ext.upper(), **options)
            path = f'assets/venue/web/{name}.{ext}'
            files[path] = buffer.getvalue()
            records.append({'asset': path, 'sha256': sha256_bytes(files[path]), 'bytes': len(files[path]),
                            'size': f'{image.width}x{image.height}', **origin,
                            'treatment': f'{treatment}, sRGB, {ext.upper()} q{options["quality"]}, no metadata',
                            'ownerApproval': APPROVAL})
    return files, records


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='verify the files against the record; change nothing')
    args = parser.parse_args()
    if args.check:
        records = json.loads(MANIFEST.read_text(encoding='utf-8'))
        stale = [r['asset'] for r in records
                 if not (ROOT / r['asset']).is_file() or sha256_bytes((ROOT / r['asset']).read_bytes()) != r['sha256']]
        expected = {f'assets/venue/{n}.jpg' for n in SOURCES} | {f'assets/venue/web/{n}.{e}' for n in WEB for e in ('avif', 'webp')}
        stale += [r['asset'] for r in records if not r.get('ownerApproval', '').strip()]
        if stale or {r['asset'] for r in records} != expected:
            sys.exit('Event photographs are out of date: ' + ', '.join(stale or sorted(expected ^ {r['asset'] for r in records})))
        print(f'{len(records)} event photograph files match {MANIFEST.relative_to(ROOT)}')
        return
    files, records = build()
    for path, data in files.items():
        (ROOT / path).write_bytes(data)
    MANIFEST.write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {len(files)} files and {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
