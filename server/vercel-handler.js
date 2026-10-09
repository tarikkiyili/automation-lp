import { createRuntime } from './runtime.js';

// Reuse the MongoClient pool across invocations in each warm function instance.
let runtime;
export default async function handler(req, res) {
  try {
    runtime ??= createRuntime().catch(error => { runtime = undefined; throw error; });
    const { app } = await runtime;
    return app(req, res);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Service temporarily unavailable.' }));
  }
}
