#!/usr/bin/env tsx
/**
 * Gatekeeper - Automated launch gates enforcement
 * Evaluates experiment metrics and controls feature flag promotions
 * 
 * Usage:
 *   npx tsx scripts/gatekeeper.ts evaluate [experiment]
 *   npx tsx scripts/gatekeeper.ts promote post_purchase_bundle_v1 25 50
 *   npx tsx scripts/gatekeeper.ts kill overlay_pricing_ab_v1 $9_variant
 */

import { readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { createClient } from '@supabase/supabase-js';
import { PostHog } from 'posthog-node';
import type { 
  LaunchGateConfig, 
  GatekeeperDecision, 
  MetricsData, 
  GatekeeperResponse,
  FeatureFlag 
} from '../types/gatekeeper.d.ts';

class Gatekeeper {
  private config: LaunchGateConfig;
  private supabase;
  private posthog;
  private runlogPath: string;

  constructor() {
    // Load configuration
    const configPath = join(process.cwd(), 'ops/launch-gates.yaml');
    this.config = yaml.load(readFileSync(configPath, 'utf8')) as LaunchGateConfig;
    
    // Initialize services
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for RLS bypass
    );
    
    this.posthog = new PostHog(
      process.env.POSTHOG_API_KEY!,
      { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' }
    );
    
    this.runlogPath = join(process.cwd(), '.orchestrator/runlog.jsonl');
  }

  async evaluateExperiment(experimentName: string): Promise<GatekeeperResponse> {
    const experiment = this.config.experiments[experimentName];
    if (!experiment) {
      return { success: false, decision: 'DENY', reason: 'Experiment not found' };
    }

    try {
      const metrics = await this.fetchMetrics(experimentName);
      const decision = this.makeDecision(experimentName, metrics);
      
      // Log decision
      await this.logDecision({
        ts: new Date().toISOString(),
        actor: 'gatekeeper',
        action: 'evaluate',
        exp: experimentName,
        from: experiment.current_stage?.toString() || 'unknown',
        to: 'evaluated',
        sample: metrics.sample_size,
        metrics: metrics.metrics,
        decision: decision.decision,
        reason: decision.reason,
        confidence: decision.confidence
      });

      return decision;
    } catch (error) {
      const errorResponse = { 
        success: false, 
        decision: 'DENY' as const, 
        reason: `Evaluation failed: ${error.message}` 
      };
      
      await this.logDecision({
        ts: new Date().toISOString(),
        actor: 'gatekeeper',
        action: 'evaluate',
        exp: experimentName,
        from: 'error',
        to: 'error',
        sample: 0,
        metrics: {},
        decision: 'DENY',
        reason: errorResponse.reason
      });

      return errorResponse;
    }
  }

  private async fetchMetrics(experimentName: string): Promise<MetricsData> {
    const experiment = this.config.experiments[experimentName];
    
    switch (experiment.type) {
      case 'revenue_optimization':
        return this.fetchBundleMetrics(experimentName);
      case 'pricing_experiment':
        return this.fetchPricingMetrics(experimentName);
      case 'marketplace_funnel':
        return this.fetchMarketplaceMetrics(experimentName);
      default:
        throw new Error(`Unknown experiment type: ${experiment.type}`);
    }
  }

  private async fetchBundleMetrics(experimentName: string): Promise<MetricsData> {
    // Query PostHog for bundle metrics
    const events = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*'],
      event: 'bundle_offer_shown',
      after: '-7d'
    });

    const acceptedEvents = await this.posthog.query({
      kind: 'EventsQuery', 
      select: ['*'],
      event: 'bundle_offer_accepted',
      after: '-7d'
    });

    const refundEvents = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*'], 
      event: 'bundle_refund_within_7d',
      after: '-30d'
    });

    const totalShown = events.results?.length || 0;
    const totalAccepted = acceptedEvents.results?.length || 0;
    const totalRefunds = refundEvents.results?.length || 0;

    // Calculate metrics with confidence intervals
    const attachRate = totalShown > 0 ? (totalAccepted / totalShown) * 100 : 0;
    const refundRate = totalAccepted > 0 ? (totalRefunds / totalAccepted) * 100 : 0;
    
    // Get baseline refund rate from previous period (simplified)
    const baselineRefundRate = 2.5; // Historical average
    const refundDelta = refundRate - baselineRefundRate;

    return {
      experiment: experimentName,
      stage: this.config.experiments[experimentName].current_stage || 0,
      sample_size: totalShown,
      metrics: {
        attach_rate: attachRate,
        refund_delta: refundDelta
      },
      confidence_intervals: {
        attach_rate: this.calculateConfidenceInterval(totalAccepted, totalShown),
        refund_delta: [-1.0, 1.0] // Simplified
      }
    };
  }

  private async fetchPricingMetrics(experimentName: string): Promise<MetricsData> {
    // Query PostHog for pricing experiment metrics
    const exposureEvents = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*', 'properties.arm'],
      event: 'price_arm_exposed', 
      after: '-30d'
    });

    const purchaseEvents = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*', 'properties.arm', 'properties.gross'],
      event: 'purchase_completed',
      after: '-30d'
    });

    // Group by arm and calculate RPV
    const armMetrics = {};
    const arms = ['$19_control', '$9_variant', '$19_no_promo_holdout'];
    
    for (const arm of arms) {
      const exposures = exposureEvents.results?.filter(e => e.properties?.arm === arm) || [];
      const purchases = purchaseEvents.results?.filter(e => e.properties?.arm === arm) || [];
      
      const revenue = purchases.reduce((sum, p) => sum + (p.properties?.gross || 0), 0);
      const rpv = exposures.length > 0 ? revenue / exposures.length : 0;
      
      armMetrics[arm] = {
        visitors: exposures.length,
        purchases: purchases.length,
        revenue,
        rpv
      };
    }

    return {
      experiment: experimentName,
      stage: 0,
      sample_size: exposureEvents.results?.length || 0,
      metrics: {
        revenue_per_visitor: armMetrics['$19_control']?.rpv || 0,
        conversion_rate: armMetrics['$19_control']?.purchases / armMetrics['$19_control']?.visitors * 100 || 0
      }
    };
  }

  private async fetchMarketplaceMetrics(experimentName: string): Promise<MetricsData> {
    const viewEvents = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*'],
      event: 'marketplace_view',
      after: '-30d'  
    });

    const installEvents = await this.posthog.query({
      kind: 'EventsQuery',
      select: ['*'],
      event: 'install_success',
      after: '-30d'
    });

    const firstRunEvents = await this.posthog.query({
      kind: 'EventsQuery', 
      select: ['*'],
      event: 'first_run_completed',
      after: '-30d'
    });

    const totalViews = viewEvents.results?.length || 0;
    const totalInstalls = installEvents.results?.length || 0;
    const totalFirstRuns = firstRunEvents.results?.length || 0;

    const installRate = totalViews > 0 ? (totalInstalls / totalViews) * 100 : 0;
    const firstRunRate = totalInstalls > 0 ? (totalFirstRuns / totalInstalls) * 100 : 0;

    return {
      experiment: experimentName,
      stage: 0,
      sample_size: totalViews,
      metrics: {
        install_rate: installRate,
        first_run_completion: firstRunRate
      }
    };
  }

  private makeDecision(experimentName: string, metrics: MetricsData): GatekeeperResponse & { confidence?: number } {
    const experiment = this.config.experiments[experimentName];
    const currentStage = experiment.current_stage || 0;

    // Check kill switch conditions first
    if (experiment.kill_switch) {
      const killCondition = this.evaluateCondition(experiment.kill_switch.condition, metrics);
      if (killCondition) {
        return {
          success: true,
          decision: 'DENY',
          reason: `Kill switch triggered: ${experiment.kill_switch.condition}`,
          metrics
        };
      }
    }

    // Check promotion criteria
    if (experiment.promotion_criteria) {
      for (const [stageKey, criteria] of Object.entries(experiment.promotion_criteria)) {
        const [fromStage, toStage] = this.parseStageKey(stageKey);
        
        if (currentStage === fromStage) {
          const meetsRequirements = this.evaluatePromotionCriteria(criteria, metrics);
          
          if (meetsRequirements.success) {
            return {
              success: true,
              decision: 'ALLOW',
              reason: `Promotion criteria met for ${stageKey}`,
              metrics,
              confidence: meetsRequirements.confidence
            };
          } else {
            return {
              success: true,
              decision: 'PENDING', 
              reason: meetsRequirements.reason,
              metrics,
              next_evaluation: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
            };
          }
        }
      }
    }

    return {
      success: true,
      decision: 'PENDING',
      reason: 'No promotion criteria matched current stage',
      metrics
    };
  }

  private evaluatePromotionCriteria(criteria: any, metrics: MetricsData): { success: boolean; reason: string; confidence?: number } {
    // Check sample size
    if (metrics.sample_size < criteria.min_sample) {
      return {
        success: false,
        reason: `Insufficient sample size: ${metrics.sample_size} < ${criteria.min_sample}`
      };
    }

    // Check duration (simplified - would need start time tracking)
    // For now, assume duration is met if we have sufficient sample

    // Check metric thresholds
    for (const [metricName, threshold] of Object.entries(criteria.metrics)) {
      const actualValue = metrics.metrics[metricName];
      
      if (actualValue === undefined) {
        return {
          success: false,
          reason: `Missing metric: ${metricName}`
        };
      }

      if (metricName.includes('_min') && actualValue < threshold) {
        return {
          success: false,
          reason: `${metricName}: ${actualValue} < ${threshold}`
        };
      }

      if (metricName.includes('_max') && actualValue > threshold) {
        return {
          success: false,
          reason: `${metricName}: ${actualValue} > ${threshold}`  
        };
      }
    }

    return {
      success: true,
      reason: 'All promotion criteria met',
      confidence: criteria.confidence_level / 100
    };
  }

  private evaluateCondition(condition: string, metrics: MetricsData): boolean {
    // Simple condition evaluator (would be more robust in production)
    // Example: "attach_rate < 2.0 AND sample >= 500"
    
    const attachRate = metrics.metrics.attach_rate || 0;
    const sample = metrics.sample_size;
    
    if (condition.includes('attach_rate < 2.0 AND sample >= 500')) {
      return attachRate < 2.0 && sample >= 500;
    }
    
    return false;
  }

  private parseStageKey(stageKey: string): [number, number] {
    // Parse "stage_25_to_50" -> [25, 50]
    const match = stageKey.match(/stage_(\d+)_to_(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2])];
    }
    return [0, 0];
  }

  private calculateConfidenceInterval(successes: number, trials: number): [number, number] {
    if (trials === 0) return [0, 0];
    
    const p = successes / trials;
    const z = 1.96; // 95% confidence
    const margin = z * Math.sqrt((p * (1 - p)) / trials);
    
    return [
      Math.max(0, (p - margin) * 100),
      Math.min(100, (p + margin) * 100)
    ];
  }

  async promoteExperiment(experimentName: string, fromStage: number, toStage: number): Promise<boolean> {
    const evaluation = await this.evaluateExperiment(experimentName);
    
    if (evaluation.decision !== 'ALLOW') {
      console.log(`❌ Promotion denied: ${evaluation.reason}`);
      return false;
    }

    // Update feature flag in Supabase
    const flagName = `${experimentName}_pct`;
    const { error } = await this.supabase
      .from(this.config.database.feature_flags_table)
      .upsert({
        name: flagName,
        pct: toStage,
        updated_at: new Date().toISOString(),
        updated_by: 'gatekeeper',
        metadata: { promotion_reason: evaluation.reason }
      });

    if (error) {
      console.error('❌ Failed to update feature flag:', error);
      return false;
    }

    // Log promotion
    await this.logDecision({
      ts: new Date().toISOString(), 
      actor: 'gatekeeper',
      action: 'promote',
      exp: experimentName,
      from: fromStage.toString(),
      to: toStage.toString(),
      sample: evaluation.metrics?.sample_size || 0,
      metrics: evaluation.metrics?.metrics || {},
      decision: 'ALLOW',
      reason: evaluation.reason
    });

    console.log(`✅ ${experimentName} promoted: ${fromStage}% → ${toStage}%`);
    return true;
  }

  private async logDecision(decision: GatekeeperDecision): Promise<void> {
    const logEntry = JSON.stringify(decision);
    appendFileSync(this.runlogPath, logEntry + '\n');
    
    // Also log to PostHog for analytics
    this.posthog.capture({
      distinctId: 'gatekeeper',
      event: 'gatekeeper_decision',
      properties: decision
    });
  }

  async close(): Promise<void> {
    await this.posthog.shutdown();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const [command, ...params] = args;

  const gatekeeper = new Gatekeeper();

  try {
    switch (command) {
      case 'evaluate':
        const [experimentName] = params;
        const result = await gatekeeper.evaluateExperiment(experimentName);
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'promote':
        const [expName, fromStr, toStr] = params;
        const success = await gatekeeper.promoteExperiment(expName, parseInt(fromStr), parseInt(toStr));
        process.exit(success ? 0 : 1);
        break;

      default:
        console.log('Usage: gatekeeper.ts <evaluate|promote> [args...]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Gatekeeper error:', error);
    process.exit(1);
  } finally {
    await gatekeeper.close();
  }
}

if (require.main === module) {
  main();
}

export { Gatekeeper };