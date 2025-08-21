import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load fixtures based on TEST_LIVE environment variable
const isLiveMode = process.env.TEST_LIVE === '1';
const fixturesPath = isLiveMode 
  ? path.join(__dirname, 'fixtures', 'links-live.json')
  : path.join(__dirname, '..', 'config', 'links.json');

const testConfig = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

test.describe('Revenue Path E2E Tests @smoke @landing', () => {
  
  test('Home page loads with offers visible @smoke @landing', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads successfully
    await expect(page).toHaveTitle(/MMTU Entertainment/);
    
    // Verify main value proposition
    await expect(page.locator('h1')).toContainText('Revenue-First Development Solutions');
    
    // Verify both offer CTAs are present and visible
    const auditCTA = page.locator('a[href="/offer/audit"]').first();
    const kitCTA = page.locator('a[href="/offer/kit"]').first();
    
    await expect(auditCTA).toBeVisible();
    await expect(auditCTA).toContainText('Security Audit');
    
    await expect(kitCTA).toBeVisible();
    await expect(kitCTA).toContainText('Gatekeeper Kit');
    
    // Verify CTAs are clickable
    await expect(auditCTA).toBeEnabled();
    await expect(kitCTA).toBeEnabled();
  });

  test.fixme('Security Audit offer page has working purchase flow', async ({ page }) => {
    // TODO: Update test to use correct offer URL (/offer/297) instead of /offer/audit
    // GitHub Issue: https://github.com/mmtu/site/issues/revenue-path-urls
    await page.goto('/offer/audit');
    
    // Check page loads and has correct content
    await expect(page).toHaveTitle(/Security Audit.*\$999/);
    await expect(page.locator('h1')).toContainText('Rapid Gatekeeper & Security Audit');
    await expect(page.locator('.price')).toContainText('$999');
    
    // Verify purchase CTA is present
    const purchaseCTA = page.locator('button[data-stripe-link]');
    await expect(purchaseCTA).toBeVisible();
    await expect(purchaseCTA).toContainText('Get Security Audit - $999');
    
    // Verify CTA has Stripe link (mode-dependent)
    const stripeLink = await purchaseCTA.getAttribute('data-stripe-link');
    expect(stripeLink).toBeTruthy();
    
    if (isLiveMode) {
      expect(stripeLink).toBe(testConfig.stripe.audit);
      expect(stripeLink).toContain('stripe.com');
    } else {
      expect(stripeLink).toBe('TODO'); // Placeholder mode
    }
    
    // Verify scheduling CTA is present
    const scheduleCTA = page.locator('a[data-calendly-link]');
    await expect(scheduleCTA).toBeVisible();
    await expect(scheduleCTA).toContainText('Schedule Kickoff Call');
    
    // Verify key value props are listed
    await expect(page.locator('text=72-hour delivery guarantee')).toBeVisible();
    await expect(page.locator('text=Comprehensive security assessment')).toBeVisible();
    await expect(page.locator('text=One follow-up consultation call')).toBeVisible();
  });

  test.fixme('Gatekeeper Kit offer page has working purchase flow', async ({ page }) => {
    // TODO: Update test to use correct offer URL (/offer/97) instead of /offer/kit  
    // GitHub Issue: https://github.com/mmtu/site/issues/revenue-path-urls
    await page.goto('/offer/kit');
    
    // Check page loads and has correct content
    await expect(page).toHaveTitle(/Gatekeeper Kit.*\$49/);
    await expect(page.locator('h1')).toContainText('Gatekeeper Kit Early Access');
    await expect(page.locator('.price')).toContainText('$49');
    
    // Verify purchase CTA is present
    const purchaseCTA = page.locator('button[data-stripe-link]');
    await expect(purchaseCTA).toBeVisible();
    await expect(purchaseCTA).toContainText('Get Early Access - $49');
    
    // Verify CTA has Stripe link (mode-dependent)
    const stripeLink = await purchaseCTA.getAttribute('data-stripe-link');
    expect(stripeLink).toBeTruthy();
    
    if (isLiveMode) {
      expect(stripeLink).toBe(testConfig.stripe.kit);
      expect(stripeLink).toContain('stripe.com');
    } else {
      expect(stripeLink).toBe('TODO'); // Placeholder mode
    }
    
    // Verify key benefits are listed
    await expect(page.locator('text=Instant download after purchase')).toBeVisible();
    await expect(page.locator('text=Proven Templates')).toBeVisible();
    await expect(page.locator('text=Free Updates')).toBeVisible();
  });

  test('Contact page has working email links @smoke @contact', async ({ page }) => {
    await page.goto('/contact');
    
    // Check page loads
    await expect(page).toHaveTitle(/Contact/);
    await expect(page.locator('h1')).toContainText('Contact Us');
    
    // Verify email links are present and functional
    const supportEmail = page.locator('a[href="mailto:support@mmtuentertainment.com"]');
    const privacyEmail = page.locator('a[href="mailto:privacy@mmtuentertainment.com"]');
    
    await expect(supportEmail).toBeVisible();
    await expect(privacyEmail).toBeVisible();
    
    // Verify disclaimer about Gmail replies is present
    await expect(page.locator('text=mmtuentertainment@gmail.com').first()).toBeVisible();
    
    // Verify offer cards are present on contact page
    await expect(page.locator('text=Security Audit - $999')).toBeVisible();
    await expect(page.locator('text=Gatekeeper Kit - $49')).toBeVisible();
  });

  test('Navigation works across all pages', async ({ page }) => {
    // Start from home
    await page.goto('/');
    
    // Navigate to Security Audit
    await page.click('a[href="/offer/audit"]');
    await expect(page.url()).toContain('/offer/audit');
    
    // Navigate to Gatekeeper Kit
    await page.click('a[href="/offer/kit"]');
    await expect(page.url()).toContain('/offer/kit');
    
    // Navigate to Contact
    await page.click('a[href="/contact"]');
    await expect(page.url()).toContain('/contact');
    
    // Navigate back to home
    await page.click('a[href="/"]');
    await expect(page.url()).not.toContain('/contact');
  });

  test('Legal pages are accessible', async ({ page }) => {
    // Test Terms page
    await page.goto('/terms');
    await expect(page).toHaveTitle(/Terms of Service/);
    await expect(page.locator('h1')).toContainText('Terms of Service');
    await expect(page.locator('text=Security Audit ($999)')).toBeVisible();
    
    // Test Privacy page
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy Policy/);
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    await expect(page.locator('text=Information We Collect')).toBeVisible();
    
    // Verify privacy email link works
    const privacyEmail = page.locator('a[href="mailto:privacy@mmtuentertainment.com"]');
    await expect(privacyEmail).toBeVisible();
  });

  test('Site is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile navigation
    await expect(page.locator('.nav-container')).toBeVisible();
    
    // Verify CTAs are still accessible on mobile
    const auditCTA = page.locator('a[href="/offer/audit"]').first();
    const kitCTA = page.locator('a[href="/offer/kit"]').first();
    
    await expect(auditCTA).toBeVisible();
    await expect(kitCTA).toBeVisible();
    
    // Test offer page on mobile
    await page.goto('/offer/audit');
    const purchaseCTA = page.locator('button[data-stripe-link]');
    await expect(purchaseCTA).toBeVisible();
  });

  test('SEO and accessibility basics', async ({ page }) => {
    await page.goto('/');
    
    // Check meta tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /revenue-generating development/);
    
    // Check OpenGraph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /MMTU Entertainment/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    
    // Check accessibility labels
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
    
    // Check CTA accessibility
    const auditCTA = page.locator('a[aria-label*="Get security audit"]');
    const kitCTA = page.locator('a[aria-label*="Get gatekeeper kit"]');
    
    await expect(auditCTA).toBeVisible();
    await expect(kitCTA).toBeVisible();
  });

});