const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Start tracing before navigation
  await context.tracing.start({ screenshots: true, snapshots: true });
  
  const page = await context.newPage();
  await page.goto('https://google.com');
  await page.fill('[name="q"]', 'playwright testing');
  await page.press('[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');
  
  // Stop tracing and save to file
  await context.tracing.stop({ path: 'trace.zip' });
  
  await browser.close();
  console.log('Trace saved to trace.zip');
})();