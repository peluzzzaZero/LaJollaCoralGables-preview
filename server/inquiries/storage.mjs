import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export async function openInquiryStorage(env = process.env) {
  const type = env.INQUIRY_STORAGE || (env.DB_HOST ? 'mysql' : 'sqlite');
  if (type === 'mysql') {
    const { openManagedMysql } = await import('./mysql-store.mjs');
    return openManagedMysql(env);
  }
  if (type !== 'sqlite') throw new Error('invalid_inquiry_storage');
  const path = resolve(env.INQUIRY_DATABASE || './private-data/inquiries.sqlite');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const { openStore } = await import('./store.mjs');
  const store = openStore(path); chmodSync(path, 0o600);
  return { store, namespace: 'local', async openVault(config) {
    const { openMailVault } = await import('./mail-vault.mjs');
    return openMailVault({ path, ...config });
  }, close: () => store.close() };
}
