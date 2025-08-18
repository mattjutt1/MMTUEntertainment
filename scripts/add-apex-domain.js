const { chromium } = require('playwright');

async function addApexDomain() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Cloudflare dashboard
    await page.goto('https://dash.cloudflare.com');
    
    // Wait for login or existing session
    console.log('Please log in to Cloudflare dashboard if needed...');
    await page.waitForURL('**/dash.cloudflare.com/**', { timeout: 60000 });
    
    // Navigate to Pages project
    await page.click('[data-testid="product-pages"]');
    await page.waitForLoadState('networkidle');
    
    // Find and click on mmtu-marketing project
    await page.click('text=mmtu-marketing');
    await page.waitForLoadState('networkidle');
    
    // Go to Custom domains tab
    await page.click('text=Custom domains');
    await page.waitForLoadState('networkidle');
    
    // Add custom domain
    await page.click('button:has-text("Add custom domain")');
    await page.fill('[placeholder*="example.com"]', 'mmtuentertainment.com');
    
    // Click Add domain
    await page.click('button:has-text("Add domain")');
    
    console.log('✅ Apex domain mmtuentertainment.com added successfully!');
    
    // Wait for domain verification
    await page.waitForTimeout(5000);
    
    // Screenshot for verification
    await page.screenshot({ path: '/tmp/apex-domain-added.png', fullPage: true });
    console.log('Screenshot saved to /tmp/apex-domain-added.png');
    
  } catch (error) {
    console.error('❌ Error adding apex domain:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

addApexDomain();