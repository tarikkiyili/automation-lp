import { createRuntime } from './runtime.js';

// Reuse the MongoClient pool across invocations in each warm function instance.
let runtime;
// Only our fixed diagnostic messages may reach logs. Never print driver errors,
// stack traces or environment values, which can contain connection secrets.
const safeStartupMessages = new Set([
  'MONGODB_URI is required',
  'Invalid MONGODB_DB_NAME',
  'MongoDB connection failed. Check credentials, network access and DNS.',
  'Invalid TRUST_PROXY_HOPS',
  'Invalid REQUESTS_PER_MINUTE',
  'Invalid PUBLIC_ORIGIN',
  'Invalid DATABASE_DRIVER',
  'Vercel requires MongoDB storage',
]);
export default async function handler(req, res) {
  try {
    runtime ??= createRuntime().catch(error => { runtime = undefined; throw error; });
    const { app } = await runtime;
    return app(req, res);
  } catch (error) {
    const reason = safeStartupMessages.has(error?.message)
      ? error.message
      : error?.code === 'ERR_INVALID_URL' ? 'Invalid PUBLIC_ORIGIN' : 'Unexpected startup error';
    console.error('API startup failed:', reason);
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Service temporarily unavailable.' }));
  }
}
