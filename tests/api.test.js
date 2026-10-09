import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { openStore } from '../server/database.js';
import { createApp } from '../server/app.js';
import { requestSchema } from '../shared/request-schema.js';

const valid = { name: 'Demo Deniz', surname: 'Örnek', email: 'demo@example.com', service: 'appointments', description: 'Kurgusal salon için randevu takibi istiyoruz.' };
async function fixture(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'randevu-'));
  const path = join(directory, 'test.sqlite');
  const store = openStore(path);
  const app = createApp({ store, logger: { error() {} }, ...options });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    store.close();
    rmSync(directory, { recursive: true, force: true });
  });
  const post = (body = valid, key = randomUUID(), headers = {}) => fetch(`${url}/api/requests`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...headers }, body: JSON.stringify(body),
  });
  return { path, post, url };
}

test('valid request is persisted; retry returns the same id; changed payload conflicts', async t => {
  const { path, post } = await fixture(t);
  const key = randomUUID();
  const first = await post(valid, key);
  assert.equal(first.status, 201);
  const saved = await first.json();
  assert.ok(saved.id);
  const retry = await post(valid, key);
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).id, saved.id);
  assert.equal((await post({ ...valid, name: 'Demo Ada' }, key)).status, 409);
  const reader = new DatabaseSync(path);
  assert.equal(reader.prepare('SELECT COUNT(*) AS count FROM requests').get().count, 1);
  assert.equal(reader.prepare('SELECT email FROM requests').get().email, valid.email);
  reader.close();
});

test('records survive closing and reopening the database', () => {
  const directory = mkdtempSync(join(tmpdir(), 'randevu-persistence-'));
  const path = join(directory, 'test.sqlite');
  const key = randomUUID();
  try {
    const first = openStore(path);
    const saved = first.save(valid, key);
    first.close();
    const second = openStore(path);
    assert.deepEqual(second.save(valid, key), { id: saved.id, replayed: true });
    second.close();
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('server rejects invalid input even when the browser is bypassed', async t => {
  const { post, path } = await fixture(t, { limit: 30 });
  const cases = [{}, { ...valid, surname: '' }, { ...valid, name: ' ' }, { ...valid, email: 'invalid' }, { ...valid, service: 'admin' }, { ...valid, description: 'x' }, { ...valid, description: 'x'.repeat(2001) }, { ...valid, extra: true }, { ...valid, name: 42 }];
  for (const body of cases) assert.equal((await post(body)).status, 422);
  const reader = new DatabaseSync(path);
  assert.equal(reader.prepare('SELECT COUNT(*) AS count FROM requests').get().count, 0);
  reader.close();
});

test('schema trims input and normalizes email', () => {
  assert.equal(requestSchema.parse({ ...valid, email: ' DEMO@EXAMPLE.COM ' }).email, valid.email);
  assert.equal(requestSchema.parse({ ...valid, name: '  Demo Deniz  ' }).name, valid.name);
});

test('storage error never returns success or internal details', async t => {
  const { post } = await fixture(t, { store: { save() { throw new Error('secret database details'); } } });
  const response = await post();
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.id, undefined);
  assert.doesNotMatch(JSON.stringify(body), /secret/);
});

test('malformed JSON, body size, content type, origin and key are checked', async t => {
  const { url, post } = await fixture(t, { publicOrigin: 'https://demo.example', limit: 30 });
  assert.equal((await post(valid, randomUUID(), { Origin: 'https://foreign.example' })).status, 403);
  assert.equal((await post(valid, 'invalid')).status, 400);
  assert.equal((await post(valid, randomUUID(), { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post({ ...valid, description: 'x'.repeat(17000) })).status, 413);
  const malformed = await fetch(`${url}/api/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(`${url}/api/requests`)).status, 404);
});

test('request rate is limited', async t => {
  const { post } = await fixture(t, { limit: 1 });
  assert.equal((await post()).status, 201);
  const limited = await post();
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('retry-after'));
});

test('SQL-looking content is stored as plain text', async t => {
  const { post, path } = await fixture(t);
  const description = "Demo test '); DROP TABLE requests; --";
  assert.equal((await post({ ...valid, description })).status, 201);
  const reader = new DatabaseSync(path);
  assert.equal(reader.prepare('SELECT description FROM requests').get().description, description);
  reader.close();
});

test('new service options and surname persist through the API', async t => {
  const { post, path } = await fixture(t, { limit: 30 });
  const { services } = await import('../shared/request-schema.js');
  for (const service of services) {
    assert.equal((await post({ ...valid, service: service.value })).status, 201);
  }
  const reader = new DatabaseSync(path);
  assert.equal(reader.prepare('SELECT COUNT(*) AS count FROM requests WHERE surname = ?').get(valid.surname).count, services.length);
  reader.close();
});

test('legacy database migration preserves records and accepts expanded services', () => {
  const directory = mkdtempSync(join(tmpdir(), 'randevu-migration-'));
  const path = join(directory, 'legacy.sqlite');
  try {
    const legacy = new DatabaseSync(path);
    legacy.exec(`CREATE TABLE requests (id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL, service TEXT NOT NULL CHECK(service IN ('appointments','reminders','complete')), description TEXT NOT NULL, created_at TEXT NOT NULL)`);
    legacy.prepare('INSERT INTO requests VALUES (?, ?, ?, ?, ?, ?, ?)').run('old-id', 'old-key', 'Kurgusal Deniz', 'test@example.com', 'appointments', 'Kurgusal eski talep', '2026-10-07');
    legacy.close();
    const migrated = openStore(path);
    migrated.save({ ...valid, service: 'branches' }, randomUUID());
    migrated.close();
    const reader = new DatabaseSync(path);
    assert.equal(reader.prepare('SELECT name FROM requests WHERE id = ?').get('old-id').name, 'Kurgusal Deniz');
    assert.equal(reader.prepare('SELECT surname FROM requests WHERE id = ?').get('old-id').surname, '');
    assert.equal(reader.prepare('SELECT COUNT(*) AS count FROM requests').get().count, 2);
    reader.close();
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
