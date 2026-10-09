import { defineConfig, devices } from '@playwright/test';
const useMongo = process.env.E2E_MONGO === '1';
const mongoTestDatabase = process.env.MONGODB_E2E_DB_NAME || 'randevu_e2e_test';
if (useMongo && (!mongoTestDatabase.endsWith('_test') || mongoTestDatabase === process.env.MONGODB_DB_NAME)) throw new Error('Use a separate E2E database ending in _test');
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'node server/index.js',
    env: { PORT: '3100', HOST: '127.0.0.1', DATABASE_DRIVER: useMongo ? 'mongodb' : 'sqlite', MONGODB_DB_NAME: mongoTestDatabase, DATABASE_PATH: './data/e2e.sqlite', REQUESTS_PER_MINUTE: '1000' },
    url: 'http://127.0.0.1:3100/api/health',
    reuseExistingServer: false,
  },
});
