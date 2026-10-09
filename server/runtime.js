import { createApp } from './app.js';
import { openMongoStore } from './mongo-store.js';

export async function createRuntime(env = process.env) {
  const hops = Number(env.TRUST_PROXY_HOPS || 0);
  const limit = Number(env.REQUESTS_PER_MINUTE || 10);
  if (!Number.isInteger(hops) || hops < 0) throw new Error('Invalid TRUST_PROXY_HOPS');
  if (!Number.isInteger(limit) || limit < 1 || limit > 10000) throw new Error('Invalid REQUESTS_PER_MINUTE');
  const publicOrigin = env.PUBLIC_ORIGIN;
  if (publicOrigin) {
    const url = new URL(publicOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== publicOrigin) throw new Error('Invalid PUBLIC_ORIGIN');
  }
  // SQLite remains an explicit offline test/legacy option, never an Atlas fallback.
  const driver = env.DATABASE_DRIVER || 'mongodb';
  if (!['sqlite', 'mongodb'].includes(driver)) throw new Error('Invalid DATABASE_DRIVER');
  if (env.VERCEL && driver !== 'mongodb') throw new Error('Vercel requires MongoDB storage');
  const store = driver === 'sqlite'
    ? (await import('./database.js')).openStore(env.DATABASE_PATH || './data/requests.sqlite')
    : await openMongoStore({ uri: env.MONGODB_URI, database: env.MONGODB_DB_NAME || 'randevu' });
  return { app: createApp({ store, publicOrigin, trustProxyHops: hops, limit }), store };
}
