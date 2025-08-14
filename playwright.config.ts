import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for MMTU Entertainment E2E tests
 * Tests bundle upsell, pricing experiments, feature flags
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['github'] // GitHub Actions annotations
  ],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Test-specific settings
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
    navigationTimeout: 15000
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Mock feature flags in browser
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing for responsive bundle upsell
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Global setup for test environment
  globalSetup: './tests/global-setup.ts',
  
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev --filter=stream-overlay-studio',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },

  // Test patterns
  testMatch: [
    '**/bundle-upsell.spec.ts',
    '**/pricing-experiment.spec.ts', 
    '**/feature-flags.spec.ts'
  ],

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Output settings
  outputDir: 'test-results/',
  
  // Environment-specific overrides
  ...(process.env.FLAG_SCENARIO && {
    grep: new RegExp(process.env.FLAG_SCENARIO.replace('-', '\\s'))
  })
})