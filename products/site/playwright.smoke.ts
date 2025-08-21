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
  
  // Fast webServer for smoke tests - quick build + serve
  webServer: {
    // Quick build + serve for smoke tests  
    command: `node build.js && npx serve dist -p 4173`,
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000, // Allow time for build but faster than full
    cwd: '.'
  },
  
  // Filter via --grep in CI for @smoke tests only
  testMatch: base.testMatch,
};

export default config;