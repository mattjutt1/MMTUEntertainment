#!/usr/bin/env node
// Flag Management CLI - Gatekeeper-Only Control
// Usage: node scripts/set_flag.ts <flag_name> <percentage> [--emergency]

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface GatekeeperDecision {
  ts: string
  actor: string
  action: string
  exp: string
  from: string
  to: string
  sample: number
  metrics: Record<string, any>
  decision: 'ALLOW' | 'BLOCK'
  reason: string
}

class FlagManager {
  private supabase: ReturnType<typeof createClient>
  private runlogPath = '.orchestrator/runlog.jsonl'

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role for RLS bypass

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
      process.exit(1)
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  async setFlag(flagName: string, percentage: number, emergency = false): Promise<boolean> {
    try {
      // Load launch gates to validate flag
      const gatesPath = path.join(process.cwd(), 'ops/launch-gates.yaml')
      if (!fs.existsSync(gatesPath)) {
        console.error('❌ launch-gates.yaml not found. Run from project root.')
        return false
      }

      // Validate percentage
      if (percentage < 0 || percentage > 100) {
        console.error('❌ Percentage must be between 0 and 100')
        return false
      }

      // Emergency override check
      if (emergency) {
        console.log('🚨 Emergency flag update - bypassing gatekeeper validation')
        return await this.updateFlag(flagName, percentage, 'emergency_override')
      }

      // Normal path: Require gatekeeper approval
      console.log('🔍 Checking gatekeeper approval for flag update...')
      
      // In production, this would call the gatekeeper API
      // For now, validate against launch gates structure
      const approvalResult = await this.requestGatekeeperApproval(flagName, percentage)
      
      if (!approvalResult.approved) {
        console.error(`❌ Gatekeeper blocked flag update: ${approvalResult.reason}`)
        return false
      }

      console.log(`✅ Gatekeeper approved: ${approvalResult.reason}`)
      return await this.updateFlag(flagName, percentage, 'gatekeeper_approved')

    } catch (error) {
      console.error('❌ Flag update failed:', error)
      return false
    }
  }

  private async requestGatekeeperApproval(flagName: string, percentage: number): Promise<{approved: boolean, reason: string}> {
    // Simulate gatekeeper decision logic
    // In production, this would call the actual gatekeeper service
    
    const validFlags = [
      'post_purchase_bundle_v1_pct',
      'overlay_pricing_ab_v1_enabled',
      'driftguard_marketplace_v1_enabled'
    ]

    if (!validFlags.includes(flagName)) {
      return {
        approved: false,
        reason: `Unknown flag '${flagName}'. Valid flags: ${validFlags.join(', ')}`
      }
    }

    // Validate percentage transitions (25 → 50 → 100)
    const currentFlag = await this.getCurrentFlag(flagName)
    const currentPct = currentFlag?.pct || 0

    const validTransitions = [
      [0, 25], [25, 50], [50, 100], // Forward progression
      [25, 0], [50, 25], [100, 50]  // Rollback allowed
    ]

    const isValidTransition = validTransitions.some(([from, to]) => 
      currentPct === from && percentage === to
    )

    if (!isValidTransition && currentPct !== percentage) {
      return {
        approved: false,
        reason: `Invalid transition from ${currentPct}% to ${percentage}%. Use gatekeeper for validation.`
      }
    }

    // Approve valid transitions
    return {
      approved: true,
      reason: `Valid transition: ${currentPct}% → ${percentage}%`
    }
  }

  private async getCurrentFlag(flagName: string) {
    const { data } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .single()
    
    return data
  }

  private async updateFlag(flagName: string, percentage: number, source: string): Promise<boolean> {
    const timestamp = new Date().toISOString()
    
    try {
      // Update or insert flag
      const { error } = await this.supabase
        .from('feature_flags')
        .upsert({
          name: flagName,
          pct: percentage,
          updated_at: timestamp,
          updated_by: `cli_${source}`,
          metadata: {
            source,
            cli_version: '1.0.0',
            host: process.env.HOSTNAME || 'unknown'
          }
        })

      if (error) {
        console.error('❌ Database update failed:', error.message)
        return false
      }

      // Log decision to runlog
      await this.logDecision({
        ts: timestamp,
        actor: 'cli',
        action: 'set_flag',
        exp: flagName,
        from: 'cli_request',
        to: `${percentage}pct`,
        sample: 0,
        metrics: { percentage, source },
        decision: 'ALLOW',
        reason: `Flag ${flagName} set to ${percentage}% via ${source}`
      })

      console.log(`🎯 Flag '${flagName}' updated to ${percentage}%`)
      console.log(`📡 Realtime clients will receive update automatically`)
      
      return true

    } catch (error) {
      console.error('❌ Update operation failed:', error)
      return false
    }
  }

  private async logDecision(decision: GatekeeperDecision) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.runlogPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Append to runlog
      fs.appendFileSync(this.runlogPath, JSON.stringify(decision) + '\n')
    } catch (error) {
      console.warn('⚠️ Failed to log decision:', error)
    }
  }

  async listFlags(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Failed to fetch flags:', error.message)
        return
      }

      if (!data || data.length === 0) {
        console.log('📭 No feature flags found')
        return
      }

      console.log('\n🎯 Current Feature Flags:')
      console.log('─'.repeat(60))
      
      data.forEach(flag => {
        const updatedAt = new Date(flag.updated_at).toLocaleString()
        console.log(`${flag.name}: ${flag.pct}%`)
        console.log(`  Updated: ${updatedAt} by ${flag.updated_by}`)
        if (flag.metadata?.source) {
          console.log(`  Source: ${flag.metadata.source}`)
        }
        console.log()
      })

    } catch (error) {
      console.error('❌ List operation failed:', error)
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const flagManager = new FlagManager()

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
🎯 Feature Flag Manager - Gatekeeper Controlled

Usage:
  node scripts/set_flag.ts <flag_name> <percentage> [--emergency]
  node scripts/set_flag.ts --list

Examples:
  node scripts/set_flag.ts post_purchase_bundle_v1_pct 25
  node scripts/set_flag.ts overlay_pricing_ab_v1_enabled 50 --emergency
  node scripts/set_flag.ts --list

Flags:
  --emergency    Bypass gatekeeper validation (use sparingly)
  --list         Show all current flags
  --help         Show this help

Valid flag names:
  - post_purchase_bundle_v1_pct
  - overlay_pricing_ab_v1_enabled  
  - driftguard_marketplace_v1_enabled

Valid percentages: 0, 25, 50, 100
`)
    process.exit(0)
  }

  if (args[0] === '--list') {
    await flagManager.listFlags()
    process.exit(0)
  }

  const [flagName, percentageStr, ...flags] = args
  const percentage = parseInt(percentageStr, 10)
  const emergency = flags.includes('--emergency')

  if (!flagName || isNaN(percentage)) {
    console.error('❌ Usage: node scripts/set_flag.ts <flag_name> <percentage>')
    process.exit(1)
  }

  const success = await flagManager.setFlag(flagName, percentage, emergency)
  process.exit(success ? 0 : 1)
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ CLI error:', error)
    process.exit(1)
  })
}

export { FlagManager }