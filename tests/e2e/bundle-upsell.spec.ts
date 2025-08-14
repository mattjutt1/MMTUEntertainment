import { test, expect } from '@playwright/test'

// Bundle Upsell E2E Tests - Post-Purchase Flow
// Tests the complete funnel: checkout success → bundle offer → completion

test.describe('Bundle Upsell Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock PostHog to capture analytics events
    await page.addInitScript(() => {
      window.posthogEvents = []
      window.posthog = {
        capture: (event: string, props: any) => {
          window.posthogEvents.push({ event, props, timestamp: Date.now() })
        },
        identify: () => {},
        reset: () => {}
      }
    })
  })

  test('shows bundle upsell when flag enabled at 100%', async ({ page }) => {
    // Override feature flag to 100% for testing
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    // Navigate to checkout success page with order ID
    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Verify bundle upsell card is visible
    const bundleCard = page.locator('[data-testid="bundle-upsell-card"]')
    await expect(bundleCard).toBeVisible()
    
    // Check analytics event fired
    const events = await page.evaluate(() => window.posthogEvents)
    const bundleOfferShown = events.find(e => e.event === 'bundle_offer_shown')
    expect(bundleOfferShown).toBeTruthy()
    expect(bundleOfferShown.props.order_id).toBe(orderId)

    // Verify bundle content
    await expect(page.locator('text=5 Reports Bundle')).toBeVisible()
    await expect(page.locator('text=$199')).toBeVisible()
    await expect(page.locator('text=Save $46')).toBeVisible()
  })

  test('hides bundle upsell when flag disabled at 0%', async ({ page }) => {
    // Override feature flag to 0% for testing
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 0
      }))
    })

    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Verify bundle upsell card is NOT visible
    const bundleCard = page.locator('[data-testid="bundle-upsell-card"]')
    await expect(bundleCard).not.toBeVisible()
    
    // Check no analytics event fired
    const events = await page.evaluate(() => window.posthogEvents)
    const bundleOfferShown = events.find(e => e.event === 'bundle_offer_shown')
    expect(bundleOfferShown).toBeFalsy()
  })

  test('completes bundle purchase flow', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Click bundle upgrade button
    const upgradeButton = page.locator('[data-testid="bundle-upgrade-btn"]')
    await expect(upgradeButton).toBeVisible()
    await upgradeButton.click()

    // Check analytics: bundle_offer_accepted
    const events = await page.evaluate(() => window.posthogEvents)
    const bundleAccepted = events.find(e => e.event === 'bundle_offer_accepted')
    expect(bundleAccepted).toBeTruthy()
    expect(bundleAccepted.props.order_id).toBe(orderId)
    expect(bundleAccepted.props.bundle_price).toBe(199)

    // Should redirect to Stripe checkout or show payment form
    await expect(page).toHaveURL(/stripe\.com|\/checkout/)
  })

  test('tracks bundle offer dismissal', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Click dismiss/close button
    const dismissButton = page.locator('[data-testid="bundle-dismiss-btn"]')
    await dismissButton.click()

    // Check analytics: bundle_offer_dismissed
    const events = await page.evaluate(() => window.posthogEvents)
    const bundleDismissed = events.find(e => e.event === 'bundle_offer_dismissed')
    expect(bundleDismissed).toBeTruthy()
    expect(bundleDismissed.props.order_id).toBe(orderId)

    // Bundle card should be hidden
    const bundleCard = page.locator('[data-testid="bundle-upsell-card"]')
    await expect(bundleCard).not.toBeVisible()
  })

  test('persistent flag assignment across page reloads', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    const orderId = `test_order_${Date.now()}`
    
    // Visit page multiple times with same order ID
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)
    await expect(page.locator('[data-testid="bundle-upsell-card"]')).toBeVisible()
    
    await page.reload()
    await expect(page.locator('[data-testid="bundle-upsell-card"]')).toBeVisible()
    
    // Navigate away and back
    await page.goto('/')
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)
    await expect(page.locator('[data-testid="bundle-upsell-card"]')).toBeVisible()
  })

  test('timer countdown functionality', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Check timer is present and counting down
    const timerElement = page.locator('[data-testid="bundle-timer"]')
    await expect(timerElement).toBeVisible()
    
    const initialTime = await timerElement.textContent()
    expect(initialTime).toMatch(/\d{2}:\d{2}/) // MM:SS format
    
    // Wait 2 seconds and verify countdown
    await page.waitForTimeout(2000)
    const laterTime = await timerElement.textContent()
    expect(laterTime).not.toBe(initialTime) // Timer should have changed
  })

  test('bundle metrics calculation', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    const orderId = `test_order_${Date.now()}`
    await page.goto(`/overlay-studio/success?order_id=${orderId}`)

    // Verify pricing display
    await expect(page.locator('text=$199')).toBeVisible()
    await expect(page.locator('text=Save $46')).toBeVisible() // 5 × $49 - $199 = $46
    
    // Click bundle to accept
    await page.locator('[data-testid="bundle-upgrade-btn"]').click()
    
    const events = await page.evaluate(() => window.posthogEvents)
    const acceptEvent = events.find(e => e.event === 'bundle_offer_accepted')
    
    expect(acceptEvent.props.bundle_price).toBe(199)
    expect(acceptEvent.props.regular_price).toBe(245) // 5 × $49
    expect(acceptEvent.props.savings).toBe(46)
    expect(acceptEvent.props.attach_rate).toBe(1) // 100% since user accepted
  })
})

// Pricing Experiment E2E Tests  
test.describe('Pricing Experiment Arms', () => {

  test('$19 control arm displays correctly', async ({ page }) => {
    // Mock pricing assignment to control
    await page.addInitScript(() => {
      sessionStorage.setItem('overlay_pro_pricing_variant', JSON.stringify({
        variant: 'pro_19_control',
        pricing: {
          price: 1900,
          display_price: '$19',
          cta_text: 'Upgrade to Pro — $19/mo',
          cta_subtext: 'OWN3D Pro: $19.99 • StreamSpell: $27 • Us: $19'
        }
      }))
    })

    await page.goto('/overlay-studio')
    
    // Verify pricing display
    await expect(page.locator('text=$19')).toBeVisible()
    await expect(page.locator('text=Upgrade to Pro — $19/mo')).toBeVisible()
    await expect(page.locator('text=OWN3D Pro: $19.99 • StreamSpell: $27 • Us: $19')).toBeVisible()

    // Check analytics event
    const events = await page.evaluate(() => window.posthogEvents)
    const priceExposed = events.find(e => e.event === 'price_arm_exposed')
    expect(priceExposed.props.arm).toBe('$19_control')
  })

  test('$9 variant arm displays correctly', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('overlay_pro_pricing_variant', JSON.stringify({
        variant: 'pro_9_variant', 
        pricing: {
          price: 900,
          display_price: '$9',
          cta_text: 'Upgrade to Pro — $9/mo',
          cta_subtext: 'Limited time pricing • OWN3D Pro: $19.99 • Us: $9'
        }
      }))
    })

    await page.goto('/overlay-studio')
    
    await expect(page.locator('text=$9')).toBeVisible()
    await expect(page.locator('text=Limited time pricing')).toBeVisible()
    
    const events = await page.evaluate(() => window.posthogEvents)
    const priceExposed = events.find(e => e.event === 'price_arm_exposed')
    expect(priceExposed.props.arm).toBe('$9_variant')
  })

  test('checkout flow tracks conversion by arm', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('overlay_pro_pricing_variant', JSON.stringify({
        variant: 'pro_9_variant',
        pricing: { price: 900, display_price: '$9' }
      }))
    })

    await page.goto('/overlay-studio')
    
    // Click upgrade button
    const upgradeBtn = page.locator('[data-testid="upgrade-pro-btn"]')
    await upgradeBtn.click()

    // Should track checkout_started
    const events = await page.evaluate(() => window.posthogEvents) 
    const checkoutStarted = events.find(e => e.event === 'checkout_started')
    expect(checkoutStarted.props.arm).toBe('$9_variant')
    expect(checkoutStarted.props.price).toBe(9)
  })
})

// Integration Tests with Auth
test.describe('Authenticated User Flows', () => {
  test.use({ 
    storageState: 'tests/auth/user-session.json' // Pre-authenticated state
  })

  test('bundle upsell for authenticated premium user', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'post_purchase_bundle_v1_pct': 100
      }))
    })

    // Premium user checkout success
    await page.goto('/overlay-studio/success?order_id=auth_test_order&plan=pro')
    
    // Should still show bundle despite being pro user
    await expect(page.locator('[data-testid="bundle-upsell-card"]')).toBeVisible()
    await expect(page.locator('text=Complete your toolkit')).toBeVisible()
  })

  test('pricing experiment respects user tier', async ({ page }) => {
    await page.goto('/overlay-studio/pricing')
    
    // Authenticated users should see consistent pricing
    const userTier = await page.evaluate(() => {
      return localStorage.getItem('user_tier') || 'free'
    })
    
    if (userTier === 'pro') {
      await expect(page.locator('text=You\'re already Pro!')).toBeVisible()
    } else {
      // Should show pricing experiment
      await expect(page.locator('[data-testid="upgrade-pro-btn"]')).toBeVisible()
    }
  })
})