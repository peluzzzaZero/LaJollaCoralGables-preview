"""Rebuild the house mosaic from assets/social/tiles.json.

Edit tiles.json (order, source image, link, owner approval), then run
`python scripts/social-tiles.py`. It crops new or changed sources to 4:5 WebP
at 640 and 320 px, refreshes assets/social/source.json and rewrites the
mosaic list in index.html. `--check` changes nothing and fails when a file is
out of date. Requires Pillow only when an image has to be (re)built.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TILES = ROOT / 'assets/social/tiles.json'
MANIFEST = ROOT / 'assets/social/source.json'
INDEX = ROOT / 'index.html'
PROFILE = 'https://www.instagram.com/lajollacoralgables/'
LINKS = [re.compile(p) for p in (
    re.escape(PROFILE) + '$',
    r'https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]{5,40}/$',
    r'https://www\.tiktok\.com/@lajollacoralgables/video/[0-9]{8,25}$',
    r'https://www\.pinterest\.com/pin/[0-9]{6,25}/$',
)]
LARGE = 'Centered 4:5 crop of the approved repository image, resized to 640x800, WebP quality 78; no other edits'
SMALL = '640x800 tile resized to 320x400, WebP quality 78'
LIST = re.compile(r'(<ul class="house-grid"[^>]*>\n)(.*?)(</ul>)', re.S)


def sha256(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def load_tiles():
    tiles = json.loads(TILES.read_text())
    names = set()
    for tile in tiles:
        name, source, href = tile.get('name', ''), tile.get('source', ''), tile.get('href', '')
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', name) or name in names:
            sys.exit(f'Tile names must be unique lowercase-kebab words: {name!r}')
        names.add(name)
        if not re.fullmatch(r'assets/(venue|brand|instagram)/[A-Za-z0-9._/-]+', source) or '..' in source \
                or not (ROOT / source).is_file():
            sys.exit(f'{name}: source must be an existing file in assets/venue, assets/brand or assets/instagram: {source!r}')
        if not any(link.match(href) for link in LINKS):
            sys.exit(f'{name}: href must be the Instagram profile or a La Jolla post permalink: {href!r}')
        if not tile.get('ownerApproval', '').strip():
            sys.exit(f'{name}: record the owner approval for this image')
    if not 3 <= len(tiles) <= 12:
        sys.exit('The mosaic needs between 3 and 12 tiles.')
    return tiles


def build_images(tile, write):
    """Return manifest entries; (re)encode only when the source changed."""
    from_manifest = {entry['asset']: entry for entry in json.loads(MANIFEST.read_text())}
    large, small = f"assets/social/{tile['name']}.webp", f"assets/social/{tile['name']}-320.webp"
    known = from_manifest.get(large)
    stale = (not known or known['source'] != tile['source'] or known['sourceSha256'] != sha256(tile['source'])
             or not (ROOT / large).is_file() or not (ROOT / small).is_file()
             or known['sha256'] != sha256(large) or from_manifest.get(small, {}).get('sha256') != sha256(small))
    if stale:
        if not write:
            return None
        from PIL import Image, ImageOps
        image = ImageOps.exif_transpose(Image.open(ROOT / tile['source'])).convert('RGB')
        width, height = image.size
        crop_w = min(width, height * 4 // 5)
        crop_h = crop_w * 5 // 4
        left, top = (width - crop_w) // 2, (height - crop_h) // 2
        image = image.crop((left, top, left + crop_w, top + crop_h)).resize((640, 800), Image.LANCZOS)
        image.save(ROOT / large, 'WEBP', quality=78, method=6)
        image.resize((320, 400), Image.LANCZOS).save(ROOT / small, 'WEBP', quality=78, method=6)
    approval = tile['ownerApproval'].strip()
    return [
        {'asset': large, 'sha256': sha256(large), 'source': tile['source'], 'sourceSha256': sha256(tile['source']),
         'treatment': LARGE, 'ownerApproval': approval},
        {'asset': small, 'sha256': sha256(small), 'source': large, 'sourceSha256': sha256(large),
         'treatment': SMALL, 'ownerApproval': approval},
    ]


def tile_html(tile):
    large, small = f"assets/social/{tile['name']}.webp", f"assets/social/{tile['name']}-320.webp"
    return (f'<li><a class="house-tile" href="{tile["href"]}" target="_blank" rel="noopener noreferrer" '
            f'tabindex="-1" aria-hidden="true"><img src="{large}" srcset="{small} 320w, {large} 640w" '
            f'sizes="(max-width: 900px) 31vw, 16vw" alt="" width="640" height="800" loading="lazy" '
            f'decoding="async"/></a></li>\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='fail instead of writing when files are out of date')
    args = parser.parse_args()
    tiles = load_tiles()
    entries = []
    for tile in tiles:
        built = build_images(tile, not args.check)
        if built is None:
            sys.exit(f"{tile['name']}: images are out of date; run python scripts/social-tiles.py")
        entries += built
    manifest = json.dumps(entries, indent=2, ensure_ascii=False) + '\n'
    html = INDEX.read_text()
    match = LIST.search(html)
    if not match:
        sys.exit('index.html has no house-grid list.')
    page = html[:match.start(2)] + ''.join(tile_html(tile) for tile in tiles) + html[match.end(2):]
    changed = [path for path, text in ((MANIFEST, manifest), (INDEX, page)) if path.read_text() != text]
    if args.check:
        if changed:
            sys.exit('Out of date: ' + ', '.join(str(p.relative_to(ROOT)) for p in changed))
        print(f'House mosaic is up to date: {len(tiles)} tiles.')
        return
    for path, text in ((MANIFEST, manifest), (INDEX, page)):
        path.write_text(text)
    keep = {f"{t['name']}{suffix}.webp" for t in tiles for suffix in ('', '-320')}
    unused = sorted(p.name for p in (ROOT / 'assets/social').glob('*.webp') if p.name not in keep)
    print(f'House mosaic rebuilt: {len(tiles)} tiles.' + (f' Unused images you may delete: {", ".join(unused)}' if unused else ''))


if __name__ == '__main__':
    main()
