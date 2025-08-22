// Simple test for analytics events
const { analytics } = require('./src/index.ts')

console.log('Testing analytics events...')

// Test bundle events
analytics.bundleOfferShown({
  order_id: 'test_order_123',
  primary_sku: 'security-audit-report',
  segment: 'security',
  price: 199.00,
  timer_seconds: 900,
  variant_id: 'bundle_v1_security'
})

analytics.bundleOfferAccepted({
  order_id: 'test_order_123', 
  addl_revenue: 199.00,
  bundle_sku: '5-report-security-bundle'
})

// Test pricing A/B events (one-shot)
analytics.priceArmExposed({
  arm: '$9_variant',
  user_hash: 'sha256_user_hash_123',
  experiment_id: 'overlay_pricing_ab_v1'
})

analytics.priceArmExposed({
  arm: '$9_variant',
  user_hash: 'sha256_user_hash_123', 
  experiment_id: 'overlay_pricing_ab_v1'
})  // Should be deduplicated

analytics.purchaseCompleted({
  arm: '$9_variant',
  gross_amount: 9.00,
  discount_amount: 0.00,
  net_amount: 9.00,
  currency: 'USD',
  order_id: 'test_order_456'
})

// Test marketplace events
analytics.marketplaceView({
  source: 'marketplace_search',
  app_id: 'driftguard_checks'
})

analytics.installSuccess({
  app_id: 'driftguard_checks',
  installation_id: 12345678,
  repository_count: 3,
  organization_type: 'javascript_org'
})

analytics.firstRunCompleted({
  app_id: 'driftguard_checks',
  installation_id: 12345678,
  checks_run: 12,
  issues_found: 3, 
  runtime_seconds: 45,
  repository_language: 'TypeScript'
})

console.log('✅ Analytics test complete - check console for event logs')
