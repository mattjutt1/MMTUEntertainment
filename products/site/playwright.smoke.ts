import base from './playwright.config';
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  ...base,
  // PR smoke must be tiny + deterministic
  retries: 0,
  timeout: 15_000, // Reduced from 30s to 15s
  expect: { timeout: 3_000 },
  reporter: [['github'], ['line']],
  
  // Force Chromium-only; disable heavy artifacts
  projects: [
    {
      name: 'chromium',
      use: { 
        ...base.use, 
        browserName: 'chromium', 
        video: 'off', 
        screenshot: 'off', 
        trace: 'off' 
      },
    },
  ],
  
  // Use much faster webServer for smoke tests - no build required
  webServer: {
    // Skip build for speed - assume site is already built or use simple health check
    command: `echo "Smoke test mode - assuming site is available" && exit 0`,
    url: base.webServer?.url || 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 5_000, // Much faster startup
    cwd: '.'
  },
  
  // Filter via --grep in CI for @smoke tests only
  testMatch: base.testMatch,
};

export default config;