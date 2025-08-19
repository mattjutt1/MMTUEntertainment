import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  // Match only the site tests regardless of where they live
  testMatch: ['products/site/**/*.spec.ts'],

  timeout: 30_000,
  fullyParallel: false,
  reporter: [['github'], ['line']],

  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    // IMPORTANT: run from products/site so relative paths (./config/links.json) resolve
    command: `bash -lc 'cd products/site && node build.js --port ${PORT}'`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 60_000
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
});
