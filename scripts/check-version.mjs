import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function isNewerVersion(next, previous) {
  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  if (!pattern.test(next) || !pattern.test(previous)) return false;
  const a = next.split('.').map(Number);
  const b = previous.split('.').map(Number);
  const different = a.findIndex((part, index) => part !== b[index]);
  return different !== -1 && a[different] > b[different];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = process.argv[2];
  if (!base) throw new Error('Provide the reviewed main base commit.');
  const current = readFileSync('VERSION', 'utf8').trim();
  const previous = execFileSync('git', ['show', `${base}:VERSION`], { encoding: 'utf8' }).trim();
  if (!isNewerVersion(current, previous)) throw new Error(`main requires a newer version: ${previous} → ${current}`);
  console.log(`Release version: ${previous} → ${current}`);
}
