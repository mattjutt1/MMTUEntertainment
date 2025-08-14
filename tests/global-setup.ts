import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for E2E tests
 * Handles authentication, feature flag setup, and test data preparation
 */
async function globalSetup(config: FullConfig) {
  console.log('🎭 Setting up E2E test environment...')
  
  // Create authenticated user session
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to app and simulate authentication
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000')
    
    // Mock authentication state
    await page.evaluate(() => {
      localStorage.setItem('user_id', 'test_user_12345')
      localStorage.setItem('auth_token', 'test_jwt_token_authenticated')
      localStorage.setItem('user_tier', 'pro')
      localStorage.setItem('user_email', 'test@mmtuentertainment.com')
      
      // Set up PostHog mock
      window.posthogEvents = []
      window.posthog = {
        capture: (event: string, props: any) => {
          window.posthogEvents.push({ 
            event, 
            props: { ...props, timestamp: Date.now() } 
          })
        },
        identify: (userId: string, props: any) => {
          window.posthogEvents.push({ 
            event: '$identify', 
            props: { distinct_id: userId, ...props } 
          })
        },
        reset: () => {
          window.posthogEvents = []
        }
      }
    })

    // Save authenticated session 
    await context.storageState({ 
      path: 'tests/auth/user-session.json' 
    })
    
    console.log('✅ Authentication session created')

    // Test feature flag client initialization
    const flagsLoaded = await page.evaluate(() => {
      try {
        // Mock successful feature flag loading
        const mockFlags = {
          'post_purchase_bundle_v1_pct': parseInt(process.env.BUNDLE_FLAG_PCT || '100'),
          'overlay_pricing_ab_v1_enabled': parseInt(process.env.PRICING_FLAG_PCT || '100'),
          'driftguard_marketplace_v1_enabled': parseInt(process.env.MARKETPLACE_FLAG_PCT || '0')
        }
        
        localStorage.setItem('test_feature_flags', JSON.stringify(mockFlags))
        return true
      } catch (error) {
        console.error('Feature flag setup failed:', error)
        return false
      }
    })

    if (!flagsLoaded) {
      throw new Error('Feature flag initialization failed')
    }

    console.log('✅ Feature flags configured for testing')

    // Verify test endpoints are accessible
    const healthCheck = await page.request.get('/health')
    if (!healthCheck.ok()) {
      throw new Error(`Health check failed: ${healthCheck.status()}`)
    }

    console.log('✅ Application health check passed')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('🚀 E2E environment ready')
}

export default globalSetup