// GoDaddy managed MySQL. All data tables are isolated by an allowlisted namespace.
import { createPool } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { createTokenCipher } from './mail-vault.mjs';

export function managedMysqlConfig(env = process.env) {
  const port = Number(env.DB_PORT);
  if (!env.DB_HOST || !env.DB_NAME || !env.DB_USER || !env.DB_PASSWORD || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('managed_database_configuration_required');
  return { host: env.DB_HOST, port, database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD,
    connectionLimit: 4, connectTimeout: 10000, charset: 'utf8mb4', supportBigNumbers: true,
    bigNumberStrings: false, multipleStatements: false };
}

export async function openManagedMysql(env = process.env) {
  const namespace = env.INQUIRY_STORAGE_NAMESPACE || 'preview';
  if (!['preview', 'live'].includes(namespace)) throw new Error('invalid_database_namespace');
  const prefix = `lajolla_${namespace}_v1_`;
  const pool = createPool(managedMysqlConfig(env));
  try {
    await pool.execute(`CREATE TABLE IF NOT EXISTS ${prefix}inquiries (
      request_key VARCHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
      fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      reference VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin UNIQUE NOT NULL,
      payload LONGTEXT NOT NULL, state VARCHAR(16) CHARACTER SET ascii NOT NULL,
      created_at BIGINT NOT NULL, next_attempt_at BIGINT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB`);
    await pool.execute(`CREATE TABLE IF NOT EXISTS ${prefix}rate_windows (
      bucket VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, hits BIGINT NOT NULL, expires_at BIGINT NOT NULL
    ) ENGINE=InnoDB`);
    await pool.execute(`CREATE TABLE IF NOT EXISTS ${prefix}mail_connection (
      id TINYINT PRIMARY KEY, encrypted LONGTEXT NOT NULL
    ) ENGINE=InnoDB`);
    await pool.execute(`CREATE TABLE IF NOT EXISTS ${prefix}mail_setup_metadata (
      name VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY, value TEXT NOT NULL
    ) ENGINE=InnoDB`);
  } catch { await pool.end(); throw new Error('managed_database_unavailable'); }
  const select = async (query, values) => (await pool.execute(query, values))[0];
  const store = {
    async get(key) { return (await select(`SELECT * FROM ${prefix}inquiries WHERE request_key=?`, [key]))[0]; },
    async create(key, fingerprint, payload, now) {
      // Do not swallow truncation, schema or disk errors through INSERT IGNORE.
      await pool.execute(`INSERT INTO ${prefix}inquiries
        (request_key,fingerprint,reference,payload,state,created_at) VALUES (?,?,?,?,'queued',?)
        ON DUPLICATE KEY UPDATE request_key=request_key`, [key, fingerprint, 'LJ-' + randomUUID(), JSON.stringify(payload), now]);
      return this.get(key);
    },
    async claim(key, now) {
      const [result] = await pool.execute(`UPDATE ${prefix}inquiries SET state='sending'
        WHERE request_key=? AND state IN ('queued','retryable') AND next_attempt_at<=?`, [key, now]);
      return result.affectedRows === 1;
    },
    async settle(key, state, nextAttempt = 0) { await pool.execute(`UPDATE ${prefix}inquiries SET state=?,next_attempt_at=? WHERE request_key=?`, [state, nextAttempt, key]); },
    async rate(bucket, now, limit, windowMs) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(`INSERT INTO ${prefix}rate_windows(bucket,hits,expires_at) VALUES(?,1,?)
          ON DUPLICATE KEY UPDATE hits=IF(expires_at<=?,1,hits+1), expires_at=IF(expires_at<=?,?,expires_at)`, [bucket, now + windowMs, now, now, now + windowMs]);
        const [rows] = await connection.execute(`SELECT hits,expires_at FROM ${prefix}rate_windows WHERE bucket=?`, [bucket]);
        await connection.commit();
        return { allowed: rows[0].hits <= limit, retryAfter: Math.max(1, Math.ceil((rows[0].expires_at - now) / 1000)) };
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async purge(now) {
      await pool.execute(`DELETE FROM ${prefix}rate_windows WHERE expires_at<=?`, [now]);
      await pool.execute(`DELETE FROM ${prefix}inquiries WHERE created_at<? AND state='accepted'`, [now - 30 * 86400000]);
    },
    close: () => pool.end()
  };
  const metadata = async name => {
    await pool.execute(`INSERT INTO ${prefix}mail_setup_metadata(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE name=name`, [name, randomUUID()]);
    return (await select(`SELECT value FROM ${prefix}mail_setup_metadata WHERE name=?`, [name]))[0].value;
  };
  return { store, namespace,
    async openVault(config) {
      const cipher = createTokenCipher(config);
      return {
        storageMarker: await metadata('storage-marker'), technicalTestKey: await metadata('technical-test-key'),
        ensureMetadata: metadata,
        async readMetadata(name) { return (await select(`SELECT value FROM ${prefix}mail_setup_metadata WHERE name=?`, [name]))[0]?.value; },
        async writeMetadata(name, value) { await pool.execute(`INSERT INTO ${prefix}mail_setup_metadata(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)`, [name, value]); },
        async get() {
          const row = (await select(`SELECT encrypted FROM ${prefix}mail_connection WHERE id=1`, []))[0];
          return row ? cipher.decrypt(row.encrypted) : null;
        },
        async set(value) { await pool.execute(`INSERT INTO ${prefix}mail_connection(id,encrypted) VALUES(1,?) ON DUPLICATE KEY UPDATE encrypted=VALUES(encrypted)`, [cipher.encrypt(value)]); },
        async delete() { await pool.execute(`DELETE FROM ${prefix}mail_connection WHERE id=1`); },
        close() { cipher.close(); }
      };
    },
    // Pool ownership belongs to this runtime; borrowers must not close it separately.
    close: () => pool.end()
  };
}
