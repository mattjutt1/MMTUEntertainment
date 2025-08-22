#!/usr/bin/env node
/**
 * Feature Flag Admin CLI - Gatekeeper Enforced
 * Usage: pnpm flags set post_purchase_bundle_v1 50
 */

import { FeatureFlagsClient } from '../packages/feature-flags/src/index'
import { Gatekeeper } from './gatekeeper'

interface FlagCommand {
  action: 'set' | 'get' | 'list'
  flagName?: string
  percentage?: number
}

class FlagCLI {
  private flagsClient: FeatureFlagsClient
  private gatekeeper: Gatekeeper

  constructor() {
    // Use service role for admin operations
    this.flagsClient = new FeatureFlagsClient({
      supabaseUrl: process.env.SUPABASE_URL || 'https://demo.supabase.co',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key',
      cacheTtl: 5000 // Short cache for admin operations
    })
    this.gatekeeper = new Gatekeeper()
  }

  private parseArgs(): FlagCommand {
    const args = process.argv.slice(2)
    
    if (args[0] === 'set' && args[1] && args[2]) {
      return {
        action: 'set',
        flagName: args[1],
        percentage: parseInt(args[2])
      }
    } else if (args[0] === 'get' && args[1]) {
      return {
        action: 'get',
        flagName: args[1]
      }
    } else if (args[0] === 'list') {
      return {
        action: 'list'
      }
    } else {
      throw new Error('Usage: pnpm flags <set|get|list> [flagName] [percentage]')
    }
  }

  async run(): Promise<void> {
    try {
      const cmd = this.parseArgs()

      switch (cmd.action) {
        case 'set':
          await this.setFlag(cmd.flagName!, cmd.percentage!)
          break
        case 'get':
          await this.getFlag(cmd.flagName!)
          break
        case 'list':
          await this.listFlags()
          break
      }
    } catch (error) {
      console.error('CLI Error:', (error as Error).message)
      process.exit(1)
    }
  }

  private async setFlag(flagName: string, percentage: number): Promise<void> {
    console.log(`🚦 Setting ${flagName} to ${percentage}%`)

    // Validate percentage
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100')
    }

    // Get current percentage for gatekeeper evaluation
    const currentPct = await this.flagsClient.getFlagPercentage(flagName)
    if (currentPct === null) {
      throw new Error(`Flag ${flagName} not found`)
    }

    // If increasing percentage, check gatekeeper approval
    if (percentage > currentPct) {
      console.log('📊 Checking gatekeeper approval for flag increase...')
      
      const experimentName = this.mapFlagToExperiment(flagName)
      if (experimentName) {
        const gatekeeperResult = await this.gatekeeper.evaluateExperiment(
          experimentName, 
          currentPct, 
          percentage
        )

        if (gatekeeperResult.decision === 'DENY') {
          console.error(`❌ DENIED: ${gatekeeperResult.reason}`)
          console.error('Cannot increase flag percentage without gatekeeper approval')
          process.exit(1)
        }

        console.log(`✅ APPROVED: ${gatekeeperResult.reason}`)
      }
    }

    // Update flag
    const success = await this.flagsClient.updateFlag(flagName, percentage, 'cli_admin')
    
    if (success) {
      console.log(`✅ Successfully set ${flagName} to ${percentage}%`)
      
      // Verify update
      const newPct = await this.flagsClient.getFlagPercentage(flagName)
      console.log(`🔍 Verified: ${flagName} = ${newPct}%`)
    } else {
      console.error(`❌ Failed to update ${flagName}`)
      process.exit(1)
    }
  }

  private async getFlag(flagName: string): Promise<void> {
    const pct = await this.flagsClient.getFlagPercentage(flagName)
    
    if (pct === null) {
      console.error(`❌ Flag ${flagName} not found`)
      process.exit(1)
    }

    console.log(`📊 ${flagName}: ${pct}%`)
  }

  private async listFlags(): Promise<void> {
    console.log('🏳️  Feature Flags:')
    
    const flags = await this.flagsClient.getAllFlags()
    
    if (flags.length === 0) {
      console.log('No flags found')
      return
    }

    flags.forEach(flag => {
      const status = flag.pct === 0 ? '❌ OFF' : flag.pct === 100 ? '✅ ON' : `🟡 ${flag.pct}%`
      console.log(`  ${flag.name}: ${status}`)
      if (flag.description) {
        console.log(`    ${flag.description}`)
      }
      if (flag.experiment_config) {
        console.log(`    Config: ${JSON.stringify(flag.experiment_config)}`)
      }
      console.log()
    })
  }

  private mapFlagToExperiment(flagName: string): string | null {
    const mapping: Record<string, string> = {
      'post_purchase_bundle_v1_pct': 'post_purchase_bundle_v1',
      'overlay_pricing_ab_v1_enabled': 'overlay_pricing_ab_v1',
      'driftguard_marketplace_v1_enabled': 'driftguard_marketplace_v1'
    }
    
    return mapping[flagName] || null
  }
}

// CLI execution
if (require.main === module) {
  const cli = new FlagCLI()
  cli.run().catch(error => {
    console.error('Fatal error:', (error as Error).message)
    process.exit(1)
  })
}

export { FlagCLI }
