import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

export function openStore(path) {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS inquiries (
      request_key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, reference TEXT UNIQUE NOT NULL,
      payload TEXT NOT NULL, state TEXT NOT NULL, created_at INTEGER NOT NULL,
      next_attempt_at INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS rate_windows (bucket TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);`);
  return {
    get(key) { return db.prepare('SELECT * FROM inquiries WHERE request_key=?').get(key); },
    create(key, fingerprint, payload, now) {
      db.prepare(`INSERT OR IGNORE INTO inquiries
        (request_key,fingerprint,reference,payload,state,created_at) VALUES (?,?,?,?,'queued',?)`)
        .run(key, fingerprint, 'LJ-' + randomUUID(), JSON.stringify(payload), now);
      return this.get(key);
    },
    claim(key, now) {
      return db.prepare("UPDATE inquiries SET state='sending' WHERE request_key=? AND state IN ('queued','retryable') AND next_attempt_at<=?").run(key, now).changes === 1;
    },
    settle(key, state, nextAttempt = 0) {
      db.prepare('UPDATE inquiries SET state=?,next_attempt_at=? WHERE request_key=?').run(state, nextAttempt, key);
    },
    rate(bucket, now, limit, windowMs) {
      const row = db.prepare(`INSERT INTO rate_windows(bucket,hits,expires_at) VALUES(?,1,?)
        ON CONFLICT(bucket) DO UPDATE SET
          hits=CASE WHEN expires_at<=? THEN 1 ELSE hits+1 END,
          expires_at=CASE WHEN expires_at<=? THEN ? ELSE expires_at END
        RETURNING hits,expires_at`).get(bucket, now + windowMs, now, now, now + windowMs);
      return { allowed: row.hits <= limit, retryAfter: Math.max(1, Math.ceil((row.expires_at-now)/1000)) };
    },
    purge(now) {
      db.prepare('DELETE FROM rate_windows WHERE expires_at<=?').run(now);
      db.prepare("DELETE FROM inquiries WHERE created_at<? AND state='accepted'").run(now - 30*86400000);
      // Uncertain, in-flight and failed inquiries require owner reconciliation; never discard silently.
    },
    close() { db.close(); }
  };
}
