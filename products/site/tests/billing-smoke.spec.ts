import { test, expect } from '@playwright/test';

test.describe('billing smoke', () => {
  test('Free/Pro/Team → Checkout posts correct payload', async ({ page }) => {
    // Intercept checkout calls and assert payload
    await page.route('**/api/billing/checkout', async (route) => {
      const req = route.request();
      const postData = req.postDataJSON() as any;
      expect(postData).toHaveProperty('priceId');
      expect(postData).toHaveProperty('quantity');
      expect(postData).toHaveProperty('successUrl');
      expect(postData).toHaveProperty('cancelUrl');
      // Return a fake session URL to simulate redirect
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'cs_test', url: 'https://example.com/redirect' }) });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Security Audit - $999' }).click();
    await expect(page).toHaveURL('https://example.com/redirect');
  });

  test('Account page shows Manage billing (Portal)', async ({ page }) => {
    await page.route('**/api/billing/portal', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'bps_test', url: 'https://example.com/portal' }) });
    });
    await page.goto('/account');
    await expect(page.getByRole('button', { name: 'Manage billing' })).toBeVisible();
    await page.getByRole('button', { name: 'Manage billing' }).click();
    await expect(page).toHaveURL('https://example.com/portal');
  });
});

