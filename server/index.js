import { createRuntime } from './runtime.js';

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
try {
  const { app, store } = await createRuntime();
  const server = app.listen(port, process.env.HOST || '127.0.0.1');
  server.once('listening', () => console.log(`Randevu: http://localhost:${port}`));
  const shutdown = () => server.close(async () => { await store.close(); process.exit(0); });
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  server.on('error', async error => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use. Stop the other API process, then restart npm run dev.`
      : 'Server could not listen. Check HOST and PORT.');
    await store.close(); process.exitCode = 1;
  });
} catch {
  console.error('Startup failed. Check database credentials, network access and environment settings.');
  process.exitCode = 1;
}
