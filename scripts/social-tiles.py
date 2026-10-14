"""Rebuild the house mosaic from assets/social/tiles.json.

Edit tiles.json (order, source image, link, owner approval and, for a post
link, its EN/ES label), then run `python scripts/social-tiles.py`. It crops new
or changed sources to 4:5 WebP at 640 and 320 px, refreshes
assets/social/source.json, rewrites the mosaic list in index.html and the post
labels in script.js. `--check` changes nothing and fails when a file is out of
date. Requires Pillow only when an image has to be (re)built.
"""
import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TILES = ROOT / 'assets/social/tiles.json'
MANIFEST = ROOT / 'assets/social/source.json'
INDEX = ROOT / 'index.html'
SCRIPT = ROOT / 'script.js'
PROFILE = 'https://www.instagram.com/lajollacoralgables/'
# Post URLs carry no account name: the owner confirms in `ownerApproval` that
# each post was published by La Jolla's own account.
POSTS = [re.compile(p) for p in (
    r'https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]{5,40}/$',
    r'https://www\.tiktok\.com/@lajollacoralgables/video/[0-9]{8,25}$',
    r'https://www\.pinterest\.com/pin/[0-9]{6,25}/$',
)]
LARGE = 'Centered 4:5 crop of the approved image, resized to 640x800, WebP quality 78; no other edits'
SMALL = '640x800 tile resized to 320x400, WebP quality 78'
LIST = re.compile(r'(<ul class="house-grid"[^>]*>\n)(.*?)(</ul>)', re.S)
LABELS = re.compile(r'(      // house-tiles:start[^\n]*\n)(.*?)(      // house-tiles:end\n)', re.S)


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha256(path):
    return sha256_bytes((ROOT / path).read_bytes())


def load_tiles():
    tiles = json.loads(TILES.read_text())
    if len(tiles) not in (3, 6, 9, 12):
        sys.exit('The mosaic needs 3, 6, 9 or 12 tiles so the 3- and 6-column rows stay full.')
    files = set()
    for tile in tiles:
        name, source, href = tile.get('name', ''), tile.get('source', ''), tile.get('href', '')
        if not re.fullmatch(r'[a-z][a-z0-9]*(-[a-z0-9]+)*', name) or re.search(r'-320$', name):
            sys.exit(f'Tile names are lowercase-kebab words not ending in -320: {name!r}')
        for file in (f'{name}.webp', f'{name}-320.webp'):
            if file in files:
                sys.exit(f'{name}: {file} would overwrite another tile')
            files.add(file)
        if not re.fullmatch(r'assets/(venue|brand|instagram)/[A-Za-z0-9._/-]+', source) or '..' in source \
                or not (ROOT / source).is_file():
            sys.exit(f'{name}: source must be an existing file in assets/venue, assets/brand or assets/instagram: {source!r}')
        if not tile.get('ownerApproval', '').strip():
            sys.exit(f'{name}: record the owner approval for this image')
        if href == PROFILE:
            continue
        if not any(post.match(href) for post in POSTS):
            sys.exit(f'{name}: href must be the Instagram profile or a post permalink: {href!r}')
        label = tile.get('label', {})
        if not all(isinstance(label.get(lang), str) and 8 <= len(label[lang].strip()) <= 160 for lang in ('en', 'es')):
            sys.exit(f'{name}: a post link needs a label with "en" and "es" text describing the post')
    return tiles


def encode(tile, known):
    """Return (files to write, manifest entries); reuse the files when the source is unchanged."""
    large, small = f"assets/social/{tile['name']}.webp", f"assets/social/{tile['name']}-320.webp"
    source_hash = sha256(tile['source'])
    if (known.get(large, {}).get('source') == tile['source'] and known[large]['sourceSha256'] == source_hash
            and (ROOT / large).is_file() and (ROOT / small).is_file()
            and known[large]['sha256'] == sha256(large) and known.get(small, {}).get('sha256') == sha256(small)):
        large_bytes, small_bytes, files = (ROOT / large).read_bytes(), (ROOT / small).read_bytes(), {}
    else:
        from PIL import Image, ImageOps
        image = ImageOps.exif_transpose(Image.open(ROOT / tile['source']))
        icc = image.info.get('icc_profile')
        image = image.convert('RGB')
        width, height = image.size
        crop_w = min(width, height * 4 // 5)
        crop_h = crop_w * 5 // 4
        if crop_w < 640:
            print(f"Warning: {tile['source']} is smaller than 640x800 and will be enlarged.", file=sys.stderr)
        left, top = (width - crop_w) // 2, (height - crop_h) // 2
        image = image.crop((left, top, left + crop_w, top + crop_h)).resize((640, 800), Image.LANCZOS)
        extra = {'icc_profile': icc} if icc else {}
        buffer = io.BytesIO()
        image.save(buffer, 'WEBP', quality=78, method=6, **extra)
        large_bytes = buffer.getvalue()
        buffer = io.BytesIO()
        Image.open(io.BytesIO(large_bytes)).resize((320, 400), Image.LANCZOS).save(buffer, 'WEBP', quality=78, method=6, **extra)
        small_bytes = buffer.getvalue()
        files = {ROOT / large: large_bytes, ROOT / small: small_bytes}
    approval = tile['ownerApproval'].strip()
    large_hash = sha256_bytes(large_bytes)
    return files, [
        {'asset': large, 'sha256': large_hash, 'source': tile['source'], 'sourceSha256': source_hash,
         'treatment': LARGE, 'ownerApproval': approval},
        {'asset': small, 'sha256': sha256_bytes(small_bytes), 'source': large, 'sourceSha256': large_hash,
         'treatment': SMALL, 'ownerApproval': approval},
    ]


def tile_html(tile):
    large, small = f"assets/social/{tile['name']}.webp", f"assets/social/{tile['name']}-320.webp"
    image = (f'<img src="{large}" srcset="{small} 320w, {large} 640w" sizes="(max-width: 900px) 31vw, 16vw" '
             f'alt="" width="640" height="800" loading="lazy" decoding="async"/>')
    if tile['href'] == PROFILE:
        # The handle link above the grid is the accessible route to the profile.
        return (f'<li><a class="house-tile" href="{PROFILE}" target="_blank" rel="noopener noreferrer" '
                f'tabindex="-1" aria-hidden="true">{image}</a></li>\n')
    key = f"social.tile.{tile['name']}"
    label = tile['label']['en'].strip().replace('&', '&amp;').replace('"', '&quot;')
    return (f'<li><a class="house-tile" href="{tile["href"]}" target="_blank" rel="noopener noreferrer" '
            f'aria-label="{label}" data-i18n="{key}" data-i18n-attr="aria-label">{image}</a></li>\n')


def labels_js(tiles, lang):
    return ''.join(f'      "social.tile.{t["name"]}": {json.dumps(t["label"][lang].strip(), ensure_ascii=False)},\n'
                   for t in tiles if t['href'] != PROFILE)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='fail instead of writing when files are out of date')
    args = parser.parse_args()
    tiles = load_tiles()
    known = {entry['asset']: entry for entry in json.loads(MANIFEST.read_text())}
    images, entries = {}, []
    for tile in tiles:
        files, built = encode(tile, known)
        images.update(files)
        entries += built
    html = INDEX.read_text()
    match = LIST.search(html)
    if not match:
        sys.exit('index.html has no house-grid list.')
    page = html[:match.start(2)] + ''.join(tile_html(tile) for tile in tiles) + html[match.end(2):]
    js = SCRIPT.read_text()
    blocks = list(LABELS.finditer(js))
    if len(blocks) != 2:
        sys.exit('script.js needs one house-tiles block in each language.')
    for block, lang in reversed(list(zip(blocks, ('en', 'es')))):
        js = js[:block.start(2)] + labels_js(tiles, lang) + js[block.end(2):]
    texts = {MANIFEST: json.dumps(entries, indent=2, ensure_ascii=False) + '\n', INDEX: page, SCRIPT: js}
    changed = [path for path, text in texts.items() if path.read_text() != text] + list(images)
    if args.check:
        if changed:
            sys.exit('Out of date, run python scripts/social-tiles.py: ' + ', '.join(str(p.relative_to(ROOT)) for p in changed))
        print(f'House mosaic is up to date: {len(tiles)} tiles.')
        return
    for path, data in images.items():
        path.write_bytes(data)
    for path, text in texts.items():
        path.write_text(text)
    keep = {f"{t['name']}{suffix}.webp" for t in tiles for suffix in ('', '-320')}
    unused = sorted(p.name for p in (ROOT / 'assets/social').glob('*.webp') if p.name not in keep)
    print(f'House mosaic rebuilt: {len(tiles)} tiles.' + (f' Unused images you may delete: {", ".join(unused)}' if unused else ''))


if __name__ == '__main__':
    main()
