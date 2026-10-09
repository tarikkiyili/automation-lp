import { spawnSync } from 'node:child_process';
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI required');
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', 'tests/e2e/form.spec.js', 'tests/e2e/preferences.spec.js'], {
  stdio: 'inherit', env: { ...process.env, E2E_MONGO: '1' },
});
process.exitCode = result.status ?? 1;
