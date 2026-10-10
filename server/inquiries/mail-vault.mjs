// Private, encrypted OAuth storage. Never included in the static public routes.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes, randomUUID, hkdfSync, createCipheriv, createDecipheriv } from 'node:crypto';

export function openMailVault({ path, secret, tenantId, clientId }) {
  if (!path || path === ':memory:' || !secret || secret.length < 32) throw new Error('private_mail_storage_required');
  const file = resolve(path);
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  chmodSync(file, 0o600);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS mail_connection (id INTEGER PRIMARY KEY CHECK(id=1), encrypted TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS mail_setup_metadata (name TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  const cipher = createTokenCipher({ secret, tenantId, clientId });
  const metadata = name => {
    db.prepare('INSERT OR IGNORE INTO mail_setup_metadata(name,value) VALUES(?,?)').run(name, randomUUID());
    return db.prepare('SELECT value FROM mail_setup_metadata WHERE name=?').get(name).value;
  };
  return {
    storageMarker: metadata('storage-marker'),
    technicalTestKey: metadata('technical-test-key'),
    ensureMetadata(name) { return metadata(name); },
    readMetadata(name) { return db.prepare('SELECT value FROM mail_setup_metadata WHERE name=?').get(name)?.value; },
    writeMetadata(name, value) { db.prepare('INSERT INTO mail_setup_metadata(name,value) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value').run(name, value); },
    get() {
      const row = db.prepare('SELECT encrypted FROM mail_connection WHERE id=1').get();
      if (!row) return null;
      return cipher.decrypt(row.encrypted);
    },
    set(value) {
      const payload = cipher.encrypt(value);
      db.prepare('INSERT INTO mail_connection(id,encrypted) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET encrypted=excluded.encrypted').run(payload);
    },
    delete() { db.prepare('DELETE FROM mail_connection WHERE id=1').run(); },
    close() { db.close(); cipher.close(); }
  };
}

export function createTokenCipher({ secret, tenantId, clientId }) {
  if (!secret || secret.length < 32) throw new Error('private_mail_storage_required');
  const context = Buffer.from(`LaJolla-Mail-v1:${tenantId}:${clientId}`);
  const key = Buffer.from(hkdfSync('sha256', secret, context, 'oauth-vault', 32));
  return {
    encrypt(value) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv); cipher.setAAD(context);
      const encrypted = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
      return [iv, cipher.getAuthTag(), encrypted].map(v => v.toString('base64url')).join('.');
    },
    decrypt(payload) {
      try {
        const [iv, tag, encrypted] = payload.split('.').map(s => Buffer.from(s, 'base64url'));
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAAD(context); decipher.setAuthTag(tag);
        return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString());
      } catch { throw new Error('mail_storage_cannot_be_decrypted'); }
    },
    close() { key.fill(0); }
  };
}
