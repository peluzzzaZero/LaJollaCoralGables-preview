import { copyFile, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const publicFiles = Object.freeze(['index.html', 'planning.html', 'privacy.html', 'terms.html', 'social.js',
  'styles.css', 'script.js', 'robots.txt', 'sitemap.xml', 'CNAME']);
const mediaTypes = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.mp4', '.webm']);
// Retired originals stay in the repository as evidence but are never published:
// the stakeholder asked that the bar photograph and its films stop being shown.
export const retiredMedia = Object.freeze(new Set(['venue/hall.jpg', 'venue/cinematic/hall.mp4',
  'venue/cinematic/hall.webm', 'venue/cinematic/hall-poster.webp', 'venue/cinematic/hall-mobile.mp4',
  'venue/cinematic/hall-mobile.webm', 'venue/cinematic/hall-mobile-poster.webp']));
const supportFiles = new Set(['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js',
  'fonts/OFL.txt', 'fonts/Manrope-OFL.txt', 'fonts/CormorantGaramond-OFL.txt']);

function publicAsset(path) {
  if (retiredMedia.has(path)) return false;
  if (supportFiles.has(path)) return true;
  const extension = extname(path).toLowerCase();
  return mediaTypes.has(extension) || (path.startsWith('fonts/') && ['.woff', '.woff2', '.ttf'].includes(extension));
}

// A closed root-file list and asset-type list keep source, credentials, tooling
// and review documents out of Pages. Rebuild instead of retaining stale files.
export async function buildSite(sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..'), options = {}) {
  const destination = resolve(sourceRoot, 'dist');
  for (const path of publicFiles) {
    if (!(await lstat(resolve(sourceRoot, path))).isFile()) throw new Error(`Not a regular public file: ${path}`);
  }
  if (!(await lstat(resolve(sourceRoot, 'assets'))).isDirectory()) throw new Error('Assets must be a regular directory.');
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  let count = 0;
  async function copy(path) {
    const target = resolve(destination, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(sourceRoot, path), target);
    count++;
  }
  for (const path of publicFiles) await copy(path);
  const browserKey = options.browserKey ?? process.env.GOOGLE_MAPS_BROWSER_KEY ?? '';
  if (browserKey) {
    if (!/^[A-Za-z0-9_-]{20,120}$/.test(browserKey)) throw new Error('Invalid Maps browser key format.');
    const homepage = resolve(destination, 'index.html');
    const html = await readFile(homepage, 'utf8');
    const marker = '<meta name="google-maps-browser-key" content=""/>';
    if (!html.includes(marker)) throw new Error('Missing Maps browser configuration marker.');
    await writeFile(homepage, html.replace(marker, `<meta name="google-maps-browser-key" content="${browserKey}"/>`));
  }
  async function assets(directory = '') {
    for (const entry of await readdir(resolve(sourceRoot, 'assets', directory), { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const path = directory ? `${directory}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not a public asset: ${path}`);
      if (entry.isDirectory()) await assets(path);
      else if (entry.isFile() && publicAsset(path)) await copy(`assets/${path}`);
    }
  }
  await assets();
  await writeFile(resolve(destination, '.nojekyll'), '');
  return { destination, files: count + 1 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildSite();
  console.log(`Public website: ${result.files} files in ${result.destination}`);
}
