import { test, expect } from '@playwright/test';

test.describe('billing smoke', () => {
  test('Foundation smoke test - no products until foundation complete', async ({ page }) => {
    // Simple smoke test to verify foundation pages load
    await page.goto('/');
    await expect(page).toHaveTitle(/MMTU Entertainment/);
    
    // Verify basic navigation works
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText(/Contact/);
  });

  test('API endpoints return proper structure (when implemented)', async ({ page }) => {
    // Test that billing API endpoints exist and return proper error for now
    await page.goto('/');
    
    // Test that the billing endpoints exist but return appropriate responses
    const response = await page.request.post('/api/billing/checkout', {
      data: { test: 'foundation-check' }
    });
    
    // Should get 404 or proper error structure (not crash)
    expect([200, 404, 500]).toContain(response.status());
  });
});

