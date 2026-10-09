import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export function openStore(path) {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT NOT NULL CHECK(service IN ('appointments', 'reminders', 'complete')),
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  // Preserve existing requests while adding surname and widening service choices.
  if (!db.prepare('PRAGMA table_info(requests)').all().some(column => column.name === 'surname')) {
    db.exec(`BEGIN IMMEDIATE;
      CREATE TABLE requests_updated (
        id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL, email TEXT NOT NULL, service TEXT NOT NULL,
        description TEXT NOT NULL, created_at TEXT NOT NULL, surname TEXT NOT NULL DEFAULT ''
      );
      INSERT INTO requests_updated (id, idempotency_key, name, email, service, description, created_at)
        SELECT id, idempotency_key, name, email, service, description, created_at FROM requests;
      DROP TABLE requests;
      ALTER TABLE requests_updated RENAME TO requests;
      COMMIT;`);
  }
  const lookup = db.prepare('SELECT * FROM requests WHERE idempotency_key = ?');
  const insert = db.prepare('INSERT INTO requests (id, idempotency_key, name, email, service, description, created_at, surname) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  return {
    save(data, key) {
      // The synchronous transaction also prevents a competing retry from inserting twice.
      db.exec('BEGIN IMMEDIATE');
      try {
        const previous = lookup.get(key);
        if (previous) {
          const matches = ['name', 'surname', 'email', 'service', 'description'].every(field => previous[field] === data[field]);
          db.exec('COMMIT');
          return matches ? { id: previous.id, replayed: true } : { conflict: true };
        }
        const id = randomUUID();
        insert.run(id, key, data.name, data.email, data.service, data.description, new Date().toISOString(), data.surname ?? '');
        db.exec('COMMIT');
        return { id, replayed: false };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close: () => db.close(),
  };
}
