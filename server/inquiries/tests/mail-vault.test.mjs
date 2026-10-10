import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openMailVault } from '../mail-vault.mjs';

test('OAuth secrets are encrypted on disk and connection/test marker survive restarting storage', () => {
  const directory = mkdtempSync(join(tmpdir(), 'lajolla-vault-')); let vault;
  const config = { path: join(directory, 'private.sqlite'), secret: 'FAKE-RANDOM-SETUP-SECRET-AT-LEAST-32-CHARACTERS', tenantId: 'fake-tenant', clientId: 'fake-app' };
  try {
    vault = openMailVault(config); const marker = vault.storageMarker; const testKey = vault.technicalTestKey;
    vault.set({ accessToken: 'FAKE-VERY-DISTINCT-ACCESS', refreshToken: 'FAKE-VERY-DISTINCT-REFRESH', accountId: 'fake-account' });
    vault.writeMetadata('storage-confirmed', 'yes');
    for (const file of readdirSync(directory)) {
      const raw = readFileSync(join(directory, file));
      assert.equal(raw.includes('FAKE-VERY-DISTINCT-ACCESS'), false); assert.equal(raw.includes('FAKE-VERY-DISTINCT-REFRESH'), false);
    }
    assert.equal(statSync(config.path).mode & 0o777, 0o600);
    vault.close(); vault = openMailVault(config);
    assert.equal(vault.storageMarker, marker); assert.equal(vault.technicalTestKey, testKey);
    assert.equal(vault.get().refreshToken, 'FAKE-VERY-DISTINCT-REFRESH');
    assert.equal(vault.readMetadata('storage-confirmed'), 'yes');
    vault.close(); vault = openMailVault({ ...config, secret: 'DIFFERENT-PRIVATE-SECRET-AT-LEAST-32-CHARS' });
    assert.throws(() => vault.get(), /cannot_be_decrypted/);
    vault.close(); vault = openMailVault({ ...config, clientId: 'other-app' });
    assert.throws(() => vault.get(), /cannot_be_decrypted/);
  } finally { vault?.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('memory-only storage and short setup secrets are rejected', () => {
  assert.throws(() => openMailVault({ path: ':memory:', secret: 'x'.repeat(32) }));
  assert.throws(() => openMailVault({ path: '/unused.sqlite', secret: 'short' }));
});
