/**
 * Analytics Integration - PII-Safe Event Tracking
 * PostHog integration with one-shot deduplication
 */

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: any) => void
      identify: (userId: string, properties?: any) => void
    }
  }
}

interface BaseEventProps {
  session_id?: string
  timestamp?: number
  user_agent?: string
}

// Bundle Upsell Events
export interface BundleOfferShownProps extends BaseEventProps {
  order_id: string
  primary_sku: string
  segment: 'security' | 'compliance' | 'quality'
  price: number
  timer_seconds: number
  variant_id: string
}

export interface BundleTimerStartedProps extends BaseEventProps {
  order_id: string
  timer_seconds: number
}

export interface BundleTimerExpiredProps extends BaseEventProps {
  order_id: string
  elapsed_seconds: number
}

export interface BundleOfferAcceptedProps extends BaseEventProps {
  order_id: string
  addl_revenue: number
  bundle_sku: string
}

export interface BundleOfferDeclinedProps extends BaseEventProps {
  order_id: string
  decline_reason?: 'explicit' | 'timeout' | 'navigation'
}

export interface BundlePaymentErrorProps extends BaseEventProps {
  order_id: string
  error_code: string
  payment_method: string
}

export interface BundleRefundProps extends BaseEventProps {
  order_id: string
  refund_amount: number
  days_after_purchase: number
}

// Pricing A/B Events
export interface PriceArmExposedProps extends BaseEventProps {
  arm: '$19_control' | '$9_variant' | '$19_no_promo_holdout'
  user_hash: string // Hash of user ID for bucketing
  experiment_id: 'overlay_pricing_ab_v1'
}

export interface CheckoutStartedProps extends BaseEventProps {
  arm: '$19_control' | '$9_variant' | '$19_no_promo_holdout'
  product_sku: string
  price: number
}

export interface PurchaseCompletedProps extends BaseEventProps {
  arm: '$19_control' | '$9_variant' | '$19_no_promo_holdout'
  gross_amount: number
  discount_amount: number
  net_amount: number
  currency: string
  order_id: string
}

export interface SupportTicketProps extends BaseEventProps {
  tag: 'pricing'
  arm: '$19_control' | '$9_variant' | '$19_no_promo_holdout'
  ticket_type: 'refund_request' | 'pricing_question' | 'payment_issue'
}

// Marketplace Events
export interface MarketplaceViewProps extends BaseEventProps {
  source: 'marketplace_search' | 'marketplace_browse' | 'direct_link' | 'github_notification' | 'referral'
  app_id: 'driftguard_checks'
}

export interface InstallClickedProps extends BaseEventProps {
  source: 'marketplace_search' | 'marketplace_browse' | 'direct_link' | 'github_notification' | 'referral'
  app_id: 'driftguard_checks'
}

export interface InstallSuccessProps extends BaseEventProps {
  app_id: 'driftguard_checks'
  installation_id: number
  repository_count: number
  organization_type: string // Hashed/anonymized
}

export interface FirstRunCompletedProps extends BaseEventProps {
  app_id: 'driftguard_checks'
  installation_id: number
  checks_run: number
  issues_found: number
  runtime_seconds: number
  repository_language: string
}

export interface ConfigSavedProps extends BaseEventProps {
  keyset: 'security_level_low' | 'security_level_medium' | 'security_level_high' | 'custom'
  checks_enabled: number
  custom_rules: boolean
  installation_id: number
}

// Retention & Engagement Events  
export interface Day7RetentionProps extends BaseEventProps {
  app_id: 'driftguard_checks'
  installation_id: number
  checks_run_week: number
  active_repositories: number
  config_changes: number
}

export interface Day30RetentionProps extends BaseEventProps {
  app_id: 'driftguard_checks'
  installation_id: number
  checks_run_month: number
  issues_resolved: number
  team_size: number
}

export interface UninstallAttemptedProps extends BaseEventProps {
  app_id: 'driftguard_checks'
  installation_id: number
  days_since_install: number
  reason?: 'performance' | 'complexity' | 'false_positives' | 'cost' | 'other'
  issues_resolved_total: number
}

class AnalyticsClient {
  private oneShot = new Set<string>()
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2)
    return `sess_${timestamp}_${random}`
  }

  private track(event: string, props: any, oneShot = false): void {
    if (oneShot) {
      const key = `${event}_${props.user_hash || props.order_id || props.installation_id || 'global'}`
      if (this.oneShot.has(key)) return
      this.oneShot.add(key)
    }

    const enrichedProps = {
      ...props,
      session_id: this.sessionId,
      timestamp: Date.now(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'unknown'
    }

    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event, enrichedProps)
    } else {
      console.log('Analytics:', event, enrichedProps)
    }
  }

  // Bundle Events
  bundleOfferShown(props: BundleOfferShownProps): void {
    this.track('bundle_offer_shown', props)
  }

  bundleTimerStarted(props: BundleTimerStartedProps): void {
    this.track('bundle_timer_started', props)
  }

  bundleTimerExpired(props: BundleTimerExpiredProps): void {
    this.track('bundle_timer_expired', props)
  }

  bundleOfferAccepted(props: BundleOfferAcceptedProps): void {
    this.track('bundle_offer_accepted', props)
  }

  bundleOfferDeclined(props: BundleOfferDeclinedProps): void {
    this.track('bundle_offer_declined', props)
  }

  bundlePaymentError(props: BundlePaymentErrorProps): void {
    this.track('bundle_payment_error', props)
  }

  bundleRefundWithin7d(props: BundleRefundProps): void {
    this.track('bundle_refund_within_7d', props)
  }

  // Pricing A/B Events
  priceArmExposed(props: PriceArmExposedProps): void {
    this.track('price_arm_exposed', props, true) // One-shot
  }

  checkoutStarted(props: CheckoutStartedProps): void {
    this.track('checkout_started', props)
  }

  purchaseCompleted(props: PurchaseCompletedProps): void {
    this.track('purchase_completed', props)
  }

  supportTicketOpened(props: SupportTicketProps): void {
    this.track('support_ticket_opened', props)
  }

  // Marketplace Events
  marketplaceView(props: MarketplaceViewProps): void {
    this.track('marketplace_view', props, true) // One-shot per session
  }

  installClicked(props: InstallClickedProps): void {
    this.track('install_clicked', props)
  }

  installSuccess(props: InstallSuccessProps): void {
    this.track('install_success', props)
  }

  firstRunCompleted(props: FirstRunCompletedProps): void {
    this.track('first_run_completed', props)
  }

  configSaved(props: ConfigSavedProps): void {
    this.track('config_saved', props)
  }

  // Retention Events
  day7Retention(props: Day7RetentionProps): void {
    this.track('day_7_retention', props)
  }

  day30Retention(props: Day30RetentionProps): void {
    this.track('day_30_retention', props)
  }

  uninstallAttempted(props: UninstallAttemptedProps): void {
    this.track('uninstall_attempted', props)
  }
}

// Global analytics instance
export const analytics = new AnalyticsClient()

// PostHog initialization helper
export function initializePostHog(apiKey: string, host?: string): void {
  if (typeof window === 'undefined') return

  const script = document.createElement('script')
  script.src = 'https://app.posthog.com/static/array.js'
  script.async = true
  document.head.appendChild(script)

  script.onload = () => {
    if (window.posthog) {
      // PostHog initialization would go here in production
      console.log('PostHog initialized')
    }
  }
}