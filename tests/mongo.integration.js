import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { openMongoStore } from '../server/mongo-store.js';
import { createApp } from '../server/app.js';

const database = process.env.MONGODB_TEST_DB_NAME || 'randevu_test';
if (!database.endsWith('_test') || database === process.env.MONGODB_DB_NAME) throw new Error('Use a separate database name ending in _test');
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI required');
const valid = { name: 'Fictional', surname: 'Example', email: 'fictional@example.com', service: 'appointments', description: 'Fictional appointment automation integration test.' };

test('Atlas: API validation, concurrent retries, conflict, durable read and async storage failure', async t => {
  const keys = [];
  const store = await openMongoStore({ uri: process.env.MONGODB_URI, database });
  let closed = false;
  const reader = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await reader.connect();
  const collection = reader.db(database).collection('requests');
  const server = createApp({ store, limit: 100 }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    if (!closed) await store.close();
    // Only remove this run's fictional documents, never a collection/database.
    try { await collection.deleteMany({ _id: { $in: keys } }); } finally { await reader.close(); }
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body, key) => fetch(`${url}/api/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });
  assert.equal((await fetch(`${url}/api/health`)).status, 200);
  const invalidKey = randomUUID(); keys.push(invalidKey);
  assert.equal((await post({ ...valid, email: 'invalid' }, invalidKey)).status, 422);
  assert.equal(await collection.countDocuments({ _id: invalidKey }), 0);
  const key = randomUUID(); keys.push(key);
  const responses = await Promise.all(Array.from({ length: 6 }, () => post(valid, key)));
  assert.equal(responses.filter(r => r.status === 201).length, 1);
  assert.equal(responses.filter(r => r.status === 200).length, 5);
  const bodies = await Promise.all(responses.map(r => r.json()));
  assert.equal(new Set(bodies.map(b => b.id)).size, 1);
  assert.equal(await collection.countDocuments({ _id: key }), 1);
  assert.equal((await post({ ...valid, surname: 'Changed' }, key)).status, 409);
  await store.close(); closed = true;
  const reopened = await openMongoStore({ uri: process.env.MONGODB_URI, database });
  try { assert.deepEqual(await reopened.save(valid, key), { id: bodies[0].id, replayed: true }); } finally { await reopened.close(); }
  // A closed connection must not be reported as a successful write.
  assert.equal((await post(valid, randomUUID())).status, 503);
  assert.equal((await fetch(`${url}/api/health`)).status, 503);
});
