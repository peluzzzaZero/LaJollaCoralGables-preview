import { createHash } from 'node:crypto';
import { createMailboxAuthorization } from './mail-oauth.mjs';
import { createMailAdmin } from './mail-admin.mjs';
import { createGraphMailer } from './graph.mjs';
import { createGoDaddyMailer } from './godaddy-mailer.mjs';
import { openInquiryStorage } from './storage.mjs';
import { runTechnicalTest } from './verify-mail.mjs';

export async function createMailSetup(env = process.env) {
  const publicUrl = new URL(env.MAIL_PUBLIC_ORIGIN || 'http://invalid');
  if (publicUrl.protocol !== 'https:' || publicUrl.pathname !== '/' || publicUrl.search || publicUrl.hash || publicUrl.username || publicUrl.password
    || !env.MAIL_SETUP_SECRET || env.MAIL_SETUP_SECRET.length < 32 || (!env.DB_HOST && !env.INQUIRY_DATABASE) || env.INQUIRY_DATABASE === ':memory:') {
    throw new Error('mail_setup_requires_private_configuration');
  }
  const config = { tenantId: env.MICROSOFT_TENANT_ID, clientId: env.MICROSOFT_CLIENT_ID, clientSecret: env.MICROSOFT_CLIENT_SECRET,
    redirectUri: publicUrl.origin + '/admin/mail/callback' };
  const provider = env.MAIL_PROVIDER || 'microsoft';
  if (!['microsoft', 'godaddy'].includes(provider)) throw new Error('invalid_mail_provider');
  // Validate credentials before opening storage. Setup never uses the mailbox password.
  if (provider === 'microsoft' && (!/^[a-f\d-]{36}$/i.test(config.tenantId || '') || !/^[a-f\d-]{36}$/i.test(config.clientId || '') || !config.clientSecret)) throw new Error('mail_setup_credentials_required');
  const storage = await openInquiryStorage(env);
  let vault;
  try {
    const rawVault = await storage.openVault({ secret: env.MAIL_SETUP_SECRET, ...config });
    // Receipt confirmation and test UUID are provider-specific: changing a provider
    // cannot reuse the other provider's successful delivery as proof.
    const testName = 'technical-test-key-' + provider;
    const testKey = await rawVault.ensureMetadata(testName);
    vault = { ...rawVault, technicalTestKey: testKey,
      readMetadata: name => rawVault.readMetadata(name === 'receipt-reference' ? name + '-' + provider : name),
      writeMetadata: (name, value) => rawVault.writeMetadata(name === 'receipt-reference' ? name + '-' + provider : name, value) };
    const mailer = provider === 'godaddy' ? createGoDaddyMailer(env) : undefined;
    const authorization = provider === 'godaddy' ? { status: async () => ({ connected: mailer.configured }) } : createMailboxAuthorization(config, vault);
    const activeMailer = mailer || createGraphMailer(config, globalThis.fetch, authorization);
    const store = storage.store;
    const rateSecret = createHash('sha256').update('LaJolla-technical-test:' + env.MAIL_SETUP_SECRET).digest('hex');
    const testStatus = () => store.get(vault.technicalTestKey);
    const admin = createMailAdmin({ origin: publicUrl.origin, setupSecret: env.MAIL_SETUP_SECRET, authorization, vault, testStatus, provider,
      technicalTest: () => runTechnicalTest({ args: ['--send-technical-test', vault.technicalTestKey], store, mailer: activeMailer, origin: publicUrl.origin, rateSecret }) });
    return { handle: admin.handle, mailer: activeMailer, storage, origins: [publicUrl.origin],
      rateSecret: createHash('sha256').update('LaJolla-public-rate:' + env.MAIL_SETUP_SECRET).digest('hex'),
      async activationReady() {
        const delivery = await testStatus();
        return await vault.readMetadata('storage-confirmed') === 'yes' && (await authorization.status()).connected
          && delivery?.state === 'accepted' && await vault.readMetadata('receipt-reference') === delivery.reference;
      },
      async close() { vault.close(); await storage.close(); } };
  } catch (error) { vault?.close(); await storage.close(); throw error; }
}
