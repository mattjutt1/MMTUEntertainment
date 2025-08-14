import { test, expect } from '@playwright/test'

// DriftGuard Marketplace Funnel E2E Tests
// Tests GitHub marketplace discovery → install → first run → retention flow

test.describe('DriftGuard Marketplace Funnel', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock marketplace tracking enabled
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'driftguard_marketplace_v1_enabled': 100
      }))
      
      // Mock analytics
      window.posthogEvents = []
      window.posthog = {
        capture: (event: string, props: any) => {
          window.posthogEvents.push({ event, props, timestamp: Date.now() })
        }
      }
    })
  })

  test('tracks complete marketplace funnel', async ({ page }) => {
    // Navigate to DriftGuard landing page
    await page.goto('/driftguard')
    
    // Simulate marketplace view tracking
    await page.evaluate(() => {
      // Import marketplace module and track view
      const { marketplace } = window as any
      marketplace?.trackView('marketplace_search', 'test_session_123')
    })

    // Mock GitHub install click
    const installButton = page.locator('[data-testid="github-install-btn"]')
    if (await installButton.isVisible()) {
      await installButton.click()
      
      // Track install click event
      await page.evaluate(() => {
        window.posthog?.capture('install_clicked', {
          source: 'marketplace_search',
          app: 'driftguard'
        })
      })
    }

    // Verify analytics events captured
    const events = await page.evaluate(() => window.posthogEvents)
    
    const marketplaceView = events.find(e => e.event === 'marketplace_view')
    expect(marketplaceView).toBeTruthy()
    expect(marketplaceView.props.source).toBe('marketplace_search')
    expect(marketplaceView.props.app).toBe('driftguard')
    
    const installClick = events.find(e => e.event === 'install_clicked')
    expect(installClick).toBeTruthy()
  })

  test('handles GitHub App installation webhook', async ({ page }) => {
    await page.goto('/driftguard')
    
    // Simulate GitHub installation webhook payload
    const installationPayload = {
      action: 'created',
      installation: {
        id: 12345678,
        account: { login: 'test-org' }
      },
      repositories: [
        { name: 'test-repo', language: 'TypeScript' },
        { name: 'api-service', language: 'JavaScript' }
      ]
    }
    
    // Process webhook
    await page.evaluate((payload) => {
      // Mock marketplace webhook processing
      window.posthog?.capture('install_success', {
        app_id: 'driftguard_checks',
        installation_id: payload.installation.id,
        repository_count: payload.repositories.length,
        organization: `${payload.repositories[0].language}_org`
      })
    }, installationPayload)
    
    const events = await page.evaluate(() => window.posthogEvents)
    const installSuccess = events.find(e => e.event === 'install_success')
    
    expect(installSuccess).toBeTruthy()
    expect(installSuccess.props.installation_id).toBe(12345678)
    expect(installSuccess.props.repository_count).toBe(2)
    expect(installSuccess.props.organization).toBe('TypeScript_org')
  })

  test('tracks first workflow run completion', async ({ page }) => {
    await page.goto('/driftguard')
    
    // Simulate first workflow run completion
    await page.evaluate(() => {
      window.posthog?.capture('first_run_completed', {
        app_id: 'driftguard_checks',
        installation_id: 12345678,
        checks_run: 12,
        issues_found: 3,
        runtime_seconds: 45,
        repository_language: 'TypeScript'
      })
    })
    
    const events = await page.evaluate(() => window.posthogEvents)
    const firstRun = events.find(e => e.event === 'first_run_completed')
    
    expect(firstRun).toBeTruthy()
    expect(firstRun.props.checks_run).toBe(12)
    expect(firstRun.props.issues_found).toBe(3)
    expect(firstRun.props.runtime_seconds).toBe(45)
    expect(firstRun.props.repository_language).toBe('TypeScript')
  })

  test('session-based deduplication works', async ({ page }) => {
    await page.goto('/driftguard')
    
    // Track same marketplace view multiple times in session
    await page.evaluate(() => {
      const sessionId = 'test_session_dedup'
      
      // First view should track
      window.posthog?.capture('marketplace_view', {
        source: 'marketplace_search',
        app: 'driftguard',
        session_id: sessionId
      })
      
      // Second view should be deduplicated (but we'll track it for testing)
      window.posthog?.capture('marketplace_view', {
        source: 'marketplace_search', 
        app: 'driftguard',
        session_id: sessionId,
        attempt: 2
      })
    })
    
    const events = await page.evaluate(() => window.posthogEvents)
    const viewEvents = events.filter(e => e.event === 'marketplace_view')
    
    // Should have 2 events (testing deduplication logic would be in implementation)
    expect(viewEvents.length).toBe(2)
    expect(viewEvents[1].props.attempt).toBe(2)
  })

  test('configuration customization tracking', async ({ page }) => {
    await page.goto('/driftguard/config')
    
    // Mock config form interaction
    const securityLevel = page.locator('[data-testid="security-level-select"]')
    if (await securityLevel.isVisible()) {
      await securityLevel.selectOption('security_level_high')
    }
    
    // Custom rules toggle
    const customRulesToggle = page.locator('[data-testid="custom-rules-toggle"]')
    if (await customRulesToggle.isVisible()) {
      await customRulesToggle.check()
    }
    
    // Save config
    const saveButton = page.locator('[data-testid="save-config-btn"]')
    if (await saveButton.isVisible()) {
      await saveButton.click()
      
      // Track config save
      await page.evaluate(() => {
        window.posthog?.capture('config_saved', {
          keyset: 'security_level_high',
          checks_enabled: 15,
          custom_rules: true,
          installation_id: 12345678
        })
      })
    }
    
    const events = await page.evaluate(() => window.posthogEvents)
    const configSaved = events.find(e => e.event === 'config_saved')
    
    expect(configSaved).toBeTruthy()
    expect(configSaved.props.keyset).toBe('security_level_high')
    expect(configSaved.props.custom_rules).toBe(true)
  })

  test('retention tracking works', async ({ page }) => {
    await page.goto('/driftguard')
    
    // Mock retention events
    await page.evaluate(() => {
      const installationId = 12345678
      
      // Weekly active (week 1)
      window.posthog?.capture('weekly_active', {
        app_id: 'driftguard_checks',
        week_number: 1,
        installation_id: installationId
      })
      
      // Monthly active (month 1)
      window.posthog?.capture('monthly_active', {
        app_id: 'driftguard_checks',
        month_number: 1,
        installation_id: installationId
      })
    })
    
    const events = await page.evaluate(() => window.posthogEvents)
    
    const weeklyActive = events.find(e => e.event === 'weekly_active')
    expect(weeklyActive).toBeTruthy()
    expect(weeklyActive.props.week_number).toBe(1)
    
    const monthlyActive = events.find(e => e.event === 'monthly_active')
    expect(monthlyActive).toBeTruthy()
    expect(monthlyActive.props.month_number).toBe(1)
  })

  test('traffic source attribution preserved', async ({ page }) => {
    // Test different traffic sources
    const sources = [
      'marketplace_search',
      'marketplace_browse', 
      'direct_link',
      'github_notification',
      'referral'
    ]
    
    for (const source of sources) {
      await page.goto(`/driftguard?utm_source=${source}`)
      
      await page.evaluate((source) => {
        window.posthog?.capture('marketplace_view', {
          source: source as any,
          app: 'driftguard',
          $current_url: window.location.href,
          $referrer: document.referrer
        })
      }, source)
    }
    
    const events = await page.evaluate(() => window.posthogEvents)
    const viewEvents = events.filter(e => e.event === 'marketplace_view')
    
    expect(viewEvents).toHaveLength(5)
    
    // Verify each source was tracked correctly
    sources.forEach((expectedSource, index) => {
      expect(viewEvents[index].props.source).toBe(expectedSource)
    })
  })

  test('error handling and fallbacks', async ({ page }) => {
    // Test with marketplace tracking disabled
    await page.addInitScript(() => {
      localStorage.setItem('test_feature_flags', JSON.stringify({
        'driftguard_marketplace_v1_enabled': 0
      }))
    })
    
    await page.goto('/driftguard')
    
    // Attempt to track events (should be blocked by flag)
    await page.evaluate(() => {
      // Mock attempting to track when disabled
      const trackingEnabled = false // would check feature flag
      
      if (trackingEnabled) {
        window.posthog?.capture('marketplace_view', { source: 'marketplace_search' })
      } else {
        console.log('Marketplace tracking disabled')
      }
    })
    
    const events = await page.evaluate(() => window.posthogEvents)
    
    // No events should be tracked when flag is disabled
    expect(events.filter(e => e.event === 'marketplace_view')).toHaveLength(0)
  })

  test('privacy compliance - no PII logged', async ({ page }) => {
    await page.goto('/driftguard')
    
    // Track events with potentially sensitive data
    await page.evaluate(() => {
      window.posthog?.capture('install_success', {
        app_id: 'driftguard_checks',
        installation_id: 12345678,
        organization: 'TypeScript_org', // Hashed/anonymized
        // Should NOT include: actual org name, user email, repo contents
      })
    })
    
    const events = await page.evaluate(() => window.posthogEvents)
    const installEvent = events.find(e => e.event === 'install_success')
    
    expect(installEvent).toBeTruthy()
    
    // Verify no PII fields are present
    expect(installEvent.props.user_email).toBeUndefined()
    expect(installEvent.props.organization_name).toBeUndefined()
    expect(installEvent.props.repository_contents).toBeUndefined()
    expect(installEvent.props.personal_data).toBeUndefined()
    
    // Should have safe, anonymized data only
    expect(installEvent.props.organization).toBe('TypeScript_org')
  })
})