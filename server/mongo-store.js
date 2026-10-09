import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';

export async function openMongoStore({ uri, database = 'randevu' }) {
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri)) throw new Error('MONGODB_URI is required');
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(database)) throw new Error('Invalid MONGODB_DB_NAME');
  const client = new MongoClient(uri, {
    maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000,
    socketTimeoutMS: 10000, waitQueueTimeoutMS: 5000,
    retryWrites: true, writeConcern: { w: 'majority', wtimeoutMS: 5000 },
  });
  try {
    await client.connect();
    await client.db(database).command({ ping: 1 });
  } catch {
    await client.close();
    // Driver errors can include hosts or connection information.
    throw new Error('MongoDB connection failed. Check credentials, network access and DNS.');
  }
  const collection = client.db(database).collection('requests');
  return {
    async save(data, key) {
      const id = randomUUID();
      try {
        // MongoDB's unique _id index makes concurrent retries atomic, without
        // a read-then-insert race or a multi-document transaction.
        await collection.insertOne({ _id: key, id, ...data, createdAt: new Date() });
        return { id, replayed: false };
      } catch (error) {
        if (error.code !== 11000) throw error;
        const previous = await collection.findOne({ _id: key });
        if (!previous) throw new Error('Unable to confirm existing request');
        const matches = ['name', 'surname', 'email', 'service', 'description'].every(field => previous[field] === data[field]);
        return matches ? { id: previous.id, replayed: true } : { conflict: true };
      }
    },
    ping: () => client.db(database).command({ ping: 1 }),
    close: () => client.close(),
  };
}
