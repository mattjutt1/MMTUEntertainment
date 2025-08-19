import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 4173);
const HOST = '127.0.0.1';
const BASE = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: 'e2e',                    // relative to products/site/
  fullyParallel: false,              // keep CI simple & consistent
  reporter: [['github'], ['line']],

  use: {
    baseURL: BASE,                   // enables page.goto('/') 
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],

  // Build + serve the marketing site just for the tests
  webServer: {
    command: `node build.js && npx http-server dist -p ${PORT} -a ${HOST} --ext html --silent -c-1`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});