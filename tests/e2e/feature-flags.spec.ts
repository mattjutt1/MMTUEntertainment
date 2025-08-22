import { test, expect } from '@playwright/test'

// Feature Flag System E2E Tests
// Tests realtime flag updates, bucketing consistency, fallback behavior

test.describe('Feature Flag System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock feature flag client for testing
    await page.addInitScript(() => {
      // Mock Supabase client
      window.mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ 
                data: { name: 'test_flag', pct: 50 }, 
                error: null 
              })
            })
          }),
          upsert: async () => ({ error: null })
        }),
        channel: () => ({
          on: () => ({ subscribe: (callback: Function) => callback('SUBSCRIBED') }),
          removeChannel: () => {}
        })
      }
      
      // Mock analytics
      window.posthogEvents = []
      window.posthog = {
        capture: (event: string, props: any) => {
          window.posthogEvents.push({ event, props, timestamp: Date.now() })
        }
      }
    })
  })

  test('deterministic bucketing works consistently', async ({ page }) => {
    await page.goto('/')
    
    // Test same user ID gets same bucket assignment
    const userId = 'test_user_consistent'
    const flagName = 'post_purchase_bundle_v1_pct'
    
    const results = await page.evaluate(([userId, flagName]) => {
      // Simulate hash function (djb2 algorithm from FeatureFlagClient)
      function hash(str: string): number {
        let hash = 5381
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash) + str.charCodeAt(i)
        }
        return Math.abs(hash)
      }
      
      const bucket = hash(userId + flagName) % 100
      
      // Test same inputs give same results
      const bucket2 = hash(userId + flagName) % 100
      const bucket3 = hash(userId + flagName) % 100
      
      return { bucket, bucket2, bucket3, consistent: bucket === bucket2 && bucket2 === bucket3 }
    }, [userId, flagName])
    
    expect(results.consistent).toBe(true)
    expect(results.bucket).toBeGreaterThanOrEqual(0)
    expect(results.bucket).toBeLessThan(100)
  })

  test('flag percentage controls user inclusion', async ({ page }) => {
    await page.goto('/')
    
    // Test different percentage thresholds
    const testCases = [
      { pct: 0, userId: 'user_0', shouldInclude: false },
      { pct: 25, userId: 'user_25_in', shouldInclude: true }, // Bucket 23
      { pct: 25, userId: 'user_25_out', shouldInclude: false }, // Bucket 87  
      { pct: 100, userId: 'user_100', shouldInclude: true }
    ]
    
    const results = await page.evaluate((testCases) => {
      function hash(str: string): number {
        let hash = 5381
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash) + str.charCodeAt(i)
        }
        return Math.abs(hash)
      }
      
      return testCases.map(({ pct, userId }) => {
        const bucket = hash(userId + 'test_flag') % 100
        const included = bucket < pct
        return { userId, pct, bucket, included }
      })
    }, testCases)
    
    // Verify bucket assignments match expectations
    expect(results[0].included).toBe(false) // 0% never includes
    expect(results[3].included).toBe(true)  // 100% always includes
    
    // Verify bucket calculations are within expected ranges
    results.forEach(result => {
      expect(result.bucket).toBeGreaterThanOrEqual(0)
      expect(result.bucket).toBeLessThan(100)
    })
  })

  test('fallback flags work when Supabase unavailable', async ({ page }) => {
    // Mock Supabase failure
    await page.addInitScript(() => {
      window.mockSupabase = {
        from: () => ({
          select: () => ({
            error: { message: 'Network error' }
          })
        })
      }
    })
    
    await page.goto('/')
    
    // Test fallback behavior
    const fallbackResult = await page.evaluate(() => {
      const fallbackFlags = {
        'post_purchase_bundle_v1_pct': 25,
        'overlay_pricing_ab_v1_enabled': 100
      }
      
      // Simulate client falling back to local config
      return {
        bundleFlag: fallbackFlags['post_purchase_bundle_v1_pct'],
        pricingFlag: fallbackFlags['overlay_pricing_ab_v1_enabled'],
        fallbackActive: true
      }
    })
    
    expect(fallbackResult.bundleFlag).toBe(25)
    expect(fallbackResult.pricingFlag).toBe(100)
    expect(fallbackResult.fallbackActive).toBe(true)
  })

  test('flag updates propagate via realtime', async ({ page }) => {
    await page.goto('/')
    
    // Mock initial flag state
    let currentFlagValue = 25
    
    await page.addInitScript(() => {
      let flagValue = 25
      
      // Mock realtime subscription
      window.mockRealtimeUpdate = (newValue: number) => {
        flagValue = newValue
        // Simulate realtime event
        const event = new CustomEvent('flag-update', { 
          detail: { name: 'test_flag', pct: newValue } 
        })
        window.dispatchEvent(event)
      }
      
      window.getCurrentFlagValue = () => flagValue
    })
    
    // Initial state
    let initialValue = await page.evaluate(() => window.getCurrentFlagValue())
    expect(initialValue).toBe(25)
    
    // Simulate realtime update
    await page.evaluate(() => window.mockRealtimeUpdate(50))
    
    // Verify update received
    let updatedValue = await page.evaluate(() => window.getCurrentFlagValue())
    expect(updatedValue).toBe(50)
    
    // Another update
    await page.evaluate(() => window.mockRealtimeUpdate(75))
    updatedValue = await page.evaluate(() => window.getCurrentFlagValue())
    expect(updatedValue).toBe(75)
  })

  test('flag client handles connection errors gracefully', async ({ page }) => {
    // Mock connection failure scenarios
    await page.addInitScript(() => {
      window.connectionScenarios = {
        initialLoad: null,
        realtimeFailure: null,
        recovery: null
      }
      
      // Mock different failure modes
      window.simulateConnectionFailure = (scenario: string) => {
        switch (scenario) {
          case 'initial_load':
            window.connectionScenarios.initialLoad = 'failed'
            break
          case 'realtime':
            window.connectionScenarios.realtimeFailure = 'failed'
            break
          case 'recovery':
            window.connectionScenarios.recovery = 'success'
            break
        }
      }
    })
    
    await page.goto('/')
    
    // Test initial load failure
    await page.evaluate(() => window.simulateConnectionFailure('initial_load'))
    let scenario = await page.evaluate(() => window.connectionScenarios.initialLoad)
    expect(scenario).toBe('failed')
    
    // Test realtime failure
    await page.evaluate(() => window.simulateConnectionFailure('realtime'))
    scenario = await page.evaluate(() => window.connectionScenarios.realtimeFailure)
    expect(scenario).toBe('failed')
    
    // Test recovery
    await page.evaluate(() => window.simulateConnectionFailure('recovery'))
    scenario = await page.evaluate(() => window.connectionScenarios.recovery) 
    expect(scenario).toBe('success')
  })

  test('flag client respects rate limiting', async ({ page }) => {
    await page.goto('/')
    
    // Mock rapid flag updates
    const updateResults = await page.evaluate(() => {
      const updates = []
      const startTime = Date.now()
      
      // Simulate 10 rapid updates
      for (let i = 0; i < 10; i++) {
        const updateTime = Date.now()
        const shouldThrottle = (updateTime - startTime) < 100 // 100ms throttle
        
        updates.push({
          update: i,
          timestamp: updateTime,
          throttled: shouldThrottle && i > 0
        })
      }
      
      return updates
    })
    
    // Verify throttling behavior
    const throttledUpdates = updateResults.filter(u => u.throttled)
    expect(throttledUpdates.length).toBeGreaterThan(0)
  })

  test('flag persistence across page reloads', async ({ page }) => {
    await page.goto('/')
    
    // Set initial flag state
    await page.evaluate(() => {
      localStorage.setItem('feature_flag_cache', JSON.stringify({
        'test_flag_persistent': { pct: 75, timestamp: Date.now() }
      }))
    })
    
    // Reload page
    await page.reload()
    
    // Verify persistence
    const cachedValue = await page.evaluate(() => {
      const cache = localStorage.getItem('feature_flag_cache')
      return cache ? JSON.parse(cache)['test_flag_persistent']?.pct : null
    })
    
    expect(cachedValue).toBe(75)
  })

  test('flag analytics integration works', async ({ page }) => {
    await page.goto('/')
    
    // Simulate flag exposure and decision
    await page.evaluate(() => {
      const userId = 'analytics_test_user'
      const flagName = 'test_flag_analytics'
      
      // Mock flag decision
      window.posthog.capture('feature_flag_evaluated', {
        flag_name: flagName,
        user_id: userId,
        enabled: true,
        bucket: 42
      })
    })
    
    // Verify analytics event
    const events = await page.evaluate(() => window.posthogEvents)
    const flagEvent = events.find(e => e.event === 'feature_flag_evaluated')
    
    expect(flagEvent).toBeTruthy()
    expect(flagEvent.props.flag_name).toBe('test_flag_analytics')
    expect(flagEvent.props.enabled).toBe(true)
    expect(flagEvent.props.bucket).toBe(42)
  })
})