#!/usr/bin/env node
/**
 * Gatekeeper - Launch Gates Enforcement System
 * Evaluates experiment metrics and controls promotion decisions
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

interface RunlogEntry {
  ts: string
  actor: 'gatekeeper' | 'ci' | 'dev'
  action: 'promote' | 'hold' | 'kill' | 'bypass_request'
  exp: string
  from: number
  to: number
  sample: {
    eligible: number
    visitors: number
    purchases: number
  }
  metrics: {
    attach: number
    rpv_delta: number
    refund_delta_pp: number
  }
  decision: 'ALLOW' | 'DENY'
  reason: string
}

interface GatekeeperConfig {
  experiments: Record<string, any>
  global: {
    default_decision: 'ALLOW' | 'DENY'
    runlog_path: string
  }
}

interface GatekeeperResponse {
  decision: 'ALLOW' | 'DENY'
  reason: string
  metrics?: any
}

class Gatekeeper {
  private config: GatekeeperConfig
  private runlogPath: string

  constructor() {
    const configPath = path.join(process.cwd(), 'ops', 'launch-gates.yaml')
    this.config = yaml.load(fs.readFileSync(configPath, 'utf8')) as GatekeeperConfig
    this.runlogPath = path.join(process.cwd(), this.config.global.runlog_path)
    
    // Ensure runlog directory exists
    const runlogDir = path.dirname(this.runlogPath)
    if (!fs.existsSync(runlogDir)) {
      fs.mkdirSync(runlogDir, { recursive: true })
    }
  }

  /**
   * Evaluate experiment promotion request
   */
  async evaluateExperiment(experimentName: string, fromPct: number, toPct: number): Promise<GatekeeperResponse> {
    const experiment = this.config.experiments[experimentName]
    if (!experiment) {
      return {
        decision: 'DENY',
        reason: `Experiment ${experimentName} not found in configuration`
      }
    }

    try {
      // Fetch metrics from analytics
      const metrics = await this.fetchMetrics(experimentName)
      
      // Make promotion decision
      const decision = this.makeDecision(experimentName, fromPct, toPct, metrics)
      
      // Log decision to runlog
      await this.logDecision({
        ts: new Date().toISOString(),
        actor: 'gatekeeper',
        action: 'promote',
        exp: experimentName,
        from: fromPct,
        to: toPct,
        sample: {
          eligible: metrics.eligible || 0,
          visitors: metrics.visitors || 0,
          purchases: metrics.purchases || 0
        },
        metrics: {
          attach: metrics.attach_rate || 0,
          rpv_delta: metrics.rpv_delta || 0,
          refund_delta_pp: metrics.refund_delta_pp || 0
        },
        decision: decision.decision,
        reason: decision.reason
      })

      return decision
    } catch (error) {
      const fallbackDecision: GatekeeperResponse = {
        decision: this.config.global.default_decision,
        reason: `Analytics degraded/missing: ${(error as Error).message}`
      }

      await this.logDecision({
        ts: new Date().toISOString(),
        actor: 'gatekeeper',
        action: 'promote',
        exp: experimentName,
        from: fromPct,
        to: toPct,
        sample: { eligible: 0, visitors: 0, purchases: 0 },
        metrics: { attach: 0, rpv_delta: 0, refund_delta_pp: 0 },
        decision: fallbackDecision.decision,
        reason: fallbackDecision.reason
      })

      return fallbackDecision
    }
  }

  /**
   * Fetch metrics from analytics (PostHog + Supabase)
   */
  private async fetchMetrics(experimentName: string): Promise<any> {
    // Mock implementation - in production, integrate with PostHog API
    // and Supabase for real metrics
    
    // Simulate analytics fetch
    if (Math.random() < 0.1) {
      throw new Error('Analytics API timeout')
    }

    // Mock metrics based on experiment
    switch (experimentName) {
      case 'post_purchase_bundle_v1':
        return {
          eligible: 150,
          attach_rate: 2.8,
          refund_delta_pp: 0.3,
          time_running_hours: 24
        }
      
      case 'overlay_pricing_ab_v1':
        return {
          visitors: 2500,
          purchases: 125,
          rpv_delta: -0.15, // $9 performs 15% worse
          arms: {
            '$19_control': { visitors: 1125, purchases: 56, rpv: 19.00 },
            '$9_variant': { visitors: 1125, purchases: 47, rpv: 9.00 },
            '$19_no_promo_holdout': { visitors: 250, purchases: 22, rpv: 19.00 }
          }
        }
      
      case 'driftguard_marketplace_v1':
        return {
          views: 1000,
          installs: 85, // 8.5% install rate
          first_runs: 45, // 52.9% first-run rate
          d7_retention: 23 // 51.1% D7 retention
        }
      
      default:
        return { eligible: 0 }
    }
  }

  /**
   * Make promotion decision based on criteria
   */
  private makeDecision(experimentName: string, fromPct: number, toPct: number, metrics: any): GatekeeperResponse {
    const experiment = this.config.experiments[experimentName]
    
    // Bundle experiment logic
    if (experimentName === 'post_purchase_bundle_v1') {
      if (fromPct === 25 && toPct === 50) {
        const criteria = experiment.promotion_criteria.stage_25_to_50
        
        if (metrics.eligible < criteria.min_sample) {
          return { decision: 'DENY', reason: `Sample too small: ${metrics.eligible} < ${criteria.min_sample}` }
        }
        
        if (metrics.attach_rate < criteria.metrics.attach_rate_min) {
          return { decision: 'DENY', reason: `Attach rate too low: ${metrics.attach_rate}% < ${criteria.metrics.attach_rate_min}%` }
        }
        
        if (metrics.refund_delta_pp > criteria.metrics.refund_delta_max) {
          return { decision: 'DENY', reason: `Refund delta too high: ${metrics.refund_delta_pp}pp > ${criteria.metrics.refund_delta_max}pp` }
        }
        
        return { decision: 'ALLOW', reason: 'All criteria met for 25→50% promotion' }
      }
    }
    
    // Pricing experiment logic
    if (experimentName === 'overlay_pricing_ab_v1') {
      if (metrics.rpv_delta < -0.15) { // Worse than -15%
        return { decision: 'DENY', reason: `$9 variant RPV too low: ${(metrics.rpv_delta * 100).toFixed(1)}% vs $19 control` }
      }
    }
    
    // Marketplace logic
    if (experimentName === 'driftguard_marketplace_v1') {
      const installRate = (metrics.installs / metrics.views) * 100
      const firstRunRate = (metrics.first_runs / metrics.installs) * 100
      
      if (installRate < experiment.promotion_criteria.install_rate_min) {
        return { decision: 'DENY', reason: `Install rate too low: ${installRate.toFixed(1)}% < ${experiment.promotion_criteria.install_rate_min}%` }
      }
      
      if (firstRunRate < experiment.promotion_criteria.first_run_completion_min) {
        return { decision: 'DENY', reason: `First-run completion too low: ${firstRunRate.toFixed(1)}% < ${experiment.promotion_criteria.first_run_completion_min}%` }
      }
      
      return { decision: 'ALLOW', reason: 'Marketplace funnel metrics meet promotion criteria' }
    }

    return { decision: 'DENY', reason: 'No matching promotion criteria found' }
  }

  /**
   * Log decision to runlog.jsonl
   */
  private async logDecision(entry: RunlogEntry): Promise<void> {
    const logLine = JSON.stringify(entry) + '\n'
    fs.appendFileSync(this.runlogPath, logLine, 'utf8')
  }

  /**
   * CLI interface
   */
  async runCLI(): Promise<void> {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')
    const expIndex = args.indexOf('--exp')
    const toIndex = args.indexOf('--to')
    
    if (expIndex === -1 || toIndex === -1) {
      console.error('Usage: gatekeeper --exp <experiment> --to <percentage> [--dry-run]')
      process.exit(1)
    }
    
    const experimentName = args[expIndex + 1]
    const toPct = parseInt(args[toIndex + 1])
    const fromPct = 25 // Default assumption
    
    console.log(`Evaluating: ${experimentName} ${fromPct}→${toPct}${dryRun ? ' (dry-run)' : ''}`)
    
    const result = await this.evaluateExperiment(experimentName, fromPct, toPct)
    
    console.log(`Decision: ${result.decision}`)
    console.log(`Reason: ${result.reason}`)
    
    if (result.decision === 'DENY') {
      process.exit(1)
    }
  }
}

// CLI execution
if (require.main === module) {
  const gatekeeper = new Gatekeeper()
  gatekeeper.runCLI().catch(error => {
    console.error('Gatekeeper error:', (error as Error).message)
    process.exit(1)
  })
}

export { Gatekeeper }
