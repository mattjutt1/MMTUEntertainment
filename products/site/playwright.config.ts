import { defineConfig, devices } from '@playwright/test';

// Mixed-change verification: 2025-08-22T05:51:00Z
// PR B: Site-only verification: 2025-08-22T07:36:00Z
const PORT = Number(process.env.PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  // Match only the site tests regardless of where they live
  testMatch: ['products/site/**/*.spec.ts'],

  timeout: 30_000,
  fullyParallel: false,
  reporter: [
    ['line'],
    ['junit', { outputFile: 'products/site/test-results/junit.xml' }],
    ['html', { outputFolder: 'products/site/playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    // IMPORTANT: Build site and serve static files using industry standard `serve` package
    command: `node build.js && npx serve dist -p ${PORT}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // Increased timeout for build + server startup
    cwd: '.'
  },

  projects: [
    { 
      name: 'chromium', 
      use: { ...devices['Desktop Chrome'] },
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
    },
    { 
      name: 'firefox',  
      use: { ...devices['Desktop Firefox'] },
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
    },
    { 
      name: 'webkit',   
      use: { ...devices['Desktop Safari'] },
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
    },
    { 
      name: 'Mobile Chrome', 
      use: { ...devices['Pixel 7'] },
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
    },
    { 
      name: 'Mobile Safari', 
      use: { ...devices['iPhone 14'] },
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
    },
  ],
});
