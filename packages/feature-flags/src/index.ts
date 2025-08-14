/**
 * Feature Flags Client - Supabase Integration
 * Deterministic bucketing with realtime updates
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import * as crypto from 'crypto'

interface FeatureFlag {
  name: string
  pct: number
  updated_at: string
  created_at: string
  updated_by: string
  description?: string
  experiment_config?: any
}

interface FlagClientConfig {
  supabaseUrl: string
  supabaseKey: string
  cacheTtl?: number // Cache TTL in milliseconds
}

export class FeatureFlagsClient {
  private supabase: SupabaseClient
  private cache = new Map<string, { flag: FeatureFlag; expires: number }>()
  private realtimeChannel?: RealtimeChannel
  private cacheTtl: number

  constructor(config: FlagClientConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    this.cacheTtl = config.cacheTtl || 60000 // 60 second default TTL
  }

  /**
   * Initialize realtime subscription for flag updates
   */
  async initializeRealtime(): Promise<void> {
    this.realtimeChannel = this.supabase
      .channel('feature-flags-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        (payload) => {
          console.log('Flag update received:', payload)
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const flag = payload.new as FeatureFlag
            // Update cache immediately
            this.cache.set(flag.name, {
              flag,
              expires: Date.now() + this.cacheTtl
            })
          } else if (payload.eventType === 'DELETE') {
            const flag = payload.old as FeatureFlag
            this.cache.delete(flag.name)
          }
        }
      )
      .subscribe()
  }

  /**
   * Get flag from cache or Supabase
   */
  private async getFlag(flagName: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cached = this.cache.get(flagName)
    if (cached && cached.expires > Date.now()) {
      return cached.flag
    }

    // Fetch from Supabase
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .single()

    if (error || !data) {
      console.error('Flag fetch error:', error)
      return null
    }

    // Update cache
    this.cache.set(flagName, {
      flag: data as FeatureFlag,
      expires: Date.now() + this.cacheTtl
    })

    return data as FeatureFlag
  }

  /**
   * Deterministic hash function for consistent bucketing
   */
  private hash(input: string): number {
    const hash = crypto.createHash('md5').update(input).digest('hex')
    // Convert first 8 hex chars to integer and mod 100
    return parseInt(hash.slice(0, 8), 16) % 100
  }

  /**
   * Check if user is in flag percentage (deterministic bucketing)
   */
  async isEnabled(flagName: string, userId: string): Promise<boolean> {
    const flag = await this.getFlag(flagName)
    if (!flag) {
      return false // Fail closed
    }

    if (flag.pct === 0) {
      return false
    }

    if (flag.pct === 100) {
      return true
    }

    // Deterministic bucketing: hash(userId + flagName) % 100
    const bucket = this.hash(`${userId}_${flagName}`)
    return bucket < flag.pct
  }

  /**
   * Get flag percentage (for admin/debugging)
   */
  async getFlagPercentage(flagName: string): Promise<number | null> {
    const flag = await this.getFlag(flagName)
    return flag ? flag.pct : null
  }

  /**
   * Get all flags (admin only)
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .order('name')

    if (error) {
      console.error('Get all flags error:', error)
      return []
    }

    return data as FeatureFlag[]
  }

  /**
   * Update flag percentage (service role only - enforced by RLS)
   */
  async updateFlag(flagName: string, pct: number, updatedBy = 'admin'): Promise<boolean> {
    if (pct < 0 || pct > 100) {
      throw new Error('Flag percentage must be between 0 and 100')
    }

    const { error } = await this.supabase
      .from('feature_flags')
      .update({
        pct,
        updated_by: updatedBy
      })
      .eq('name', flagName)

    if (error) {
      console.error('Update flag error:', error)
      return false
    }

    // Clear cache to force refresh
    this.cache.delete(flagName)
    return true
  }

  /**
   * Experiment-specific helper methods
   */

  // Bundle upsell experiment
  async isBundleUpsellEnabled(orderId: string): Promise<boolean> {
    return this.isEnabled('post_purchase_bundle_v1_pct', orderId)
  }

  // Pricing A/B experiment
  async getPricingArm(userId: string): Promise<'$19_control' | '$9_variant' | '$19_no_promo_holdout' | null> {
    const enabled = await this.isEnabled('overlay_pricing_ab_v1_enabled', userId)
    if (!enabled) {
      return null
    }

    // Deterministic arm assignment: 45/45/10 split
    const bucket = this.hash(`${userId}_pricing_arm`)
    
    if (bucket < 45) {
      return '$19_control'
    } else if (bucket < 90) {
      return '$9_variant'
    } else {
      return '$19_no_promo_holdout'
    }
  }

  // DriftGuard marketplace tracking
  async isMarketplaceTrackingEnabled(): Promise<boolean> {
    // Use system ID since marketplace tracking is global
    return this.isEnabled('driftguard_marketplace_v1_enabled', 'system')
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel)
    }
    this.cache.clear()
  }
}

// Environment-based client factory
export function createFlagsClient(): FeatureFlagsClient {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return new FeatureFlagsClient({
    supabaseUrl,
    supabaseKey,
    cacheTtl: 60000 // 60 second cache
  })
}

// Global client instance
export const featureFlags = createFlagsClient()

// Initialize realtime if in browser/server environment
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
  featureFlags.initializeRealtime().catch(console.error)
}
