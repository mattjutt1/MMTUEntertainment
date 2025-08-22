export interface FeatureFlag {
    name: string;
    pct: number;
    updated_at: string;
    updated_by: string;
    metadata?: Record<string, any>;
}
export interface FlagConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    enableRealtime?: boolean;
    fallbackFlags?: Record<string, number>;
}
export declare class FeatureFlagClient {
    private supabase;
    private flags;
    private realtimeChannel?;
    private enableRealtime;
    private fallbackFlags;
    constructor(config: FlagConfig);
    private initialize;
    private loadFlags;
    private loadFallbacks;
    private setupRealtime;
    /**
     * Check if user is in feature flag percentage
     * Uses deterministic bucketing based on user/session identifier
     */
    isEnabled(flagName: string, userId: string): boolean;
    /**
     * Get flag percentage for display/debugging
     */
    getFlagPercentage(flagName: string): number;
    /**
     * Get all flags (for debugging)
     */
    getAllFlags(): Record<string, FeatureFlag>;
    /**
     * Bundle upsell specific method
     * Uses order_id for consistent bucketing across page reloads
     */
    shouldShowBundleUpsell(orderId: string): boolean;
    /**
     * Pricing experiment - always enabled but tracked separately
     */
    isPricingExperimentEnabled(): boolean;
    /**
     * DriftGuard marketplace tracking
     */
    isMarketplaceTrackingEnabled(): boolean;
    /**
     * Simple hash function for bucketing (djb2)
     */
    private hash;
    /**
     * Cleanup realtime connection
     */
    dispose(): void;
}
export declare function createFeatureFlagClient(config: FlagConfig): FeatureFlagClient;
export declare function getFeatureFlagClient(): FeatureFlagClient;
export declare function useFeatureFlag(flagName: string, userId: string): boolean;
export declare const featureFlags: {
    shouldShowBundleUpsell: (orderId: string) => boolean;
    isPricingExperimentEnabled: () => boolean;
    isMarketplaceTrackingEnabled: () => boolean;
};
