// Feature Flags Package - Supabase Integration with Realtime
// Gatekeeper-controlled remote flags with client-side bucketing

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export interface FeatureFlag {
  name: string
  pct: number
  updated_at: string
  updated_by: string
  metadata?: Record<string, any>
}

export interface FlagConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  enableRealtime?: boolean
  fallbackFlags?: Record<string, number>
}

export class FeatureFlagClient {
  private supabase: SupabaseClient
  private flags: Map<string, FeatureFlag> = new Map()
  private realtimeChannel?: RealtimeChannel
  private enableRealtime: boolean
  private fallbackFlags: Record<string, number>

  constructor(config: FlagConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    this.enableRealtime = config.enableRealtime ?? true
    this.fallbackFlags = config.fallbackFlags ?? {}
    
    this.initialize()
  }

  private async initialize() {
    try {
      await this.loadFlags()
      
      if (this.enableRealtime) {
        this.setupRealtime()
      }
    } catch (error) {
      console.warn('Feature flags initialization failed, using fallbacks:', error)
      this.loadFallbacks()
    }
  }

  private async loadFlags() {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
    
    if (error) {
      throw new Error(`Failed to load flags: ${error.message}`)
    }

    if (data) {
      data.forEach(flag => {
        this.flags.set(flag.name, flag)
      })
    }

    console.log(`📡 Loaded ${this.flags.size} feature flags`)
  }

  private loadFallbacks() {
    Object.entries(this.fallbackFlags).forEach(([name, pct]) => {
      this.flags.set(name, {
        name,
        pct,
        updated_at: new Date().toISOString(),
        updated_by: 'fallback'
      })
    })
  }

  private setupRealtime() {
    this.realtimeChannel = this.supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        (payload) => {
          console.log('🔄 Feature flag update:', payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const flag = payload.new as FeatureFlag
            this.flags.set(flag.name, flag)
          } else if (payload.eventType === 'DELETE') {
            const flag = payload.old as FeatureFlag
            this.flags.delete(flag.name)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Feature flags realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Feature flags realtime error, flags may be stale')
        }
      })
  }

  /**
   * Check if user is in feature flag percentage
   * Uses deterministic bucketing based on user/session identifier
   */
  isEnabled(flagName: string, userId: string): boolean {
    const flag = this.flags.get(flagName)
    if (!flag) {
      console.warn(`⚠️ Feature flag '${flagName}' not found`)
      return false
    }

    // Deterministic bucketing: hash(userId + flagName) % 100 < pct
    const bucket = this.hash(userId + flagName) % 100
    const isEnabled = bucket < flag.pct

    console.log(`🎯 ${flagName}: ${isEnabled ? 'enabled' : 'disabled'} (bucket: ${bucket}, threshold: ${flag.pct})`)
    
    return isEnabled
  }

  /**
   * Get flag percentage for display/debugging
   */
  getFlagPercentage(flagName: string): number {
    const flag = this.flags.get(flagName)
    return flag?.pct ?? 0
  }

  /**
   * Get all flags (for debugging)
   */
  getAllFlags(): Record<string, FeatureFlag> {
    const result: Record<string, FeatureFlag> = {}
    this.flags.forEach((flag, name) => {
      result[name] = flag
    })
    return result
  }

  /**
   * Bundle upsell specific method
   * Uses order_id for consistent bucketing across page reloads
   */
  shouldShowBundleUpsell(orderId: string): boolean {
    return this.isEnabled('post_purchase_bundle_v1_pct', orderId)
  }

  /**
   * Pricing experiment - always enabled but tracked separately
   */
  isPricingExperimentEnabled(): boolean {
    return this.isEnabled('overlay_pricing_ab_v1_enabled', 'pricing_experiment')
  }

  /**
   * DriftGuard marketplace tracking
   */
  isMarketplaceTrackingEnabled(): boolean {
    return this.isEnabled('driftguard_marketplace_v1_enabled', 'marketplace_tracking')
  }

  /**
   * Simple hash function for bucketing (djb2)
   */
  private hash(str: string): number {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i)
    }
    return Math.abs(hash)
  }

  /**
   * Cleanup realtime connection
   */
  dispose() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel)
    }
  }
}

// Global client instance factory
let globalClient: FeatureFlagClient | null = null

export function createFeatureFlagClient(config: FlagConfig): FeatureFlagClient {
  if (!globalClient) {
    globalClient = new FeatureFlagClient(config)
  }
  return globalClient
}

export function getFeatureFlagClient(): FeatureFlagClient {
  if (!globalClient) {
    throw new Error('Feature flag client not initialized. Call createFeatureFlagClient first.')
  }
  return globalClient
}

// React hook for feature flags
export function useFeatureFlag(flagName: string, userId: string): boolean {
  // This would integrate with React state management in a real implementation
  // For now, return direct client call
  try {
    const client = getFeatureFlagClient()
    return client.isEnabled(flagName, userId)
  } catch {
    return false
  }
}

// Convenience functions
export const featureFlags = {
  shouldShowBundleUpsell: (orderId: string) => {
    try {
      return getFeatureFlagClient().shouldShowBundleUpsell(orderId)
    } catch {
      return false // Safe fallback
    }
  },
  
  isPricingExperimentEnabled: () => {
    try {
      return getFeatureFlagClient().isPricingExperimentEnabled()
    } catch {
      return true // Pricing experiment should default to enabled
    }
  },
  
  isMarketplaceTrackingEnabled: () => {
    try {
      return getFeatureFlagClient().isMarketplaceTrackingEnabled()
    } catch {
      return false // Safe fallback for marketplace tracking
    }
  }
}