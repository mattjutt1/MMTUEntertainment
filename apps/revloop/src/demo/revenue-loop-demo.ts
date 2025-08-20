#!/usr/bin/env node
/**
 * Revenue Loop MVP Demo
 * 
 * Demonstrates both Digital Andon and Double-Entry posting rules
 * Shows TPS Jidoka principles in action with real-time monitoring
 */

import { AndonMonitor } from '../andon/monitor.js';
import { FunnelSimulator, SIMULATION_SCENARIOS } from '../simulation/funnel-simulator.js';
import { validateRevenueTransaction, AccountType } from '../../../packages/ledger-core/src/index.js';
import { AndonState, MonitoringConfig } from '../types/andon.js';

/**
 * Demo configuration for Andon monitoring
 */
const DEMO_CONFIG: MonitoringConfig = {
  enabled: true,
  alertThresholds: {
    attention: 2.0, // 2-sigma for attention
    stop: 3.0       // 3-sigma for critical stop
  },
  sampleConfig: {
    minSampleSize: 10,
    lookbackHours: 1,
    updateIntervalMs: 5000
  }
};

/**
 * Main demo orchestrator
 */
class RevenueLoopDemo {
  private andonMonitor: AndonMonitor;
  private simulator: FunnelSimulator;
  private isRunning = false;

  constructor() {
    this.andonMonitor = new AndonMonitor(DEMO_CONFIG);
    this.simulator = new FunnelSimulator(SIMULATION_SCENARIOS.paymentOutage);
  }

  /**
   * Run the complete Revenue Loop MVP demonstration
   */
  async runDemo(): Promise<void> {
    console.log('🚀 Revenue Loop MVP Demo Starting...\n');
    
    this.isRunning = true;
    
    // Start monitoring dashboard in background
    this.startMonitoringDashboard();
    
    // Demonstrate Double-Entry validation first
    await this.demonstrateDoubleEntryValidation();
    
    console.log('\n📊 Starting Digital Andon simulation...');
    console.log('Scenario: Payment processor outage (critical anomaly at minute 20)\n');
    
    // Run Digital Andon simulation
    await this.runAndonSimulation();
    
    this.isRunning = false;
    console.log('\n✅ Demo completed successfully!');
  }

  /**
   * Demonstrate Double-Entry posting rule validation
   */
  private async demonstrateDoubleEntryValidation(): Promise<void> {
    console.log('💰 Double-Entry Posting Rule Validation Demo\n');
    
    // Example 1: Valid payment transaction
    console.log('📝 Testing valid payment transaction...');
    const validPayment = [
      {
        accountCode: '1100', // Cash
        accountType: AccountType.ASSET,
        amount: 149.99,
        description: 'Customer payment - Order #12345',
        currency: 'USD'
      },
      {
        accountCode: '4000', // Revenue
        accountType: AccountType.REVENUE,
        amount: 149.99,
        description: 'Product sale revenue - Order #12345',
        currency: 'USD'
      }
    ];
    
    const validResult = await validateRevenueTransaction(validPayment);
    console.log(`   Result: ${validResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    if (validResult.errors.length > 0) {
      console.log(`   Errors: ${validResult.errors.join(', ')}`);
    }
    console.log(`   Debits: $${validResult.metadata.totalDebits.toFixed(2)}`);
    console.log(`   Credits: $${validResult.metadata.totalCredits.toFixed(2)}`);
    
    // Example 2: Invalid transaction (unbalanced)
    console.log('\n📝 Testing invalid unbalanced transaction...');
    const invalidPayment = [
      {
        accountCode: '1100', // Cash
        accountType: AccountType.ASSET,
        amount: 100.00,
        description: 'Partial payment received',
        currency: 'USD'
      },
      {
        accountCode: '4000', // Revenue
        accountType: AccountType.REVENUE,
        amount: 150.00, // Doesn't balance!
        description: 'Product sale revenue',
        currency: 'USD'
      }
    ];
    
    const invalidResult = await validateRevenueTransaction(invalidPayment);
    console.log(`   Result: ${invalidResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    if (invalidResult.errors.length > 0) {
      console.log(`   Errors: ${invalidResult.errors.join(', ')}`);
    }
    
    // Example 3: Revenue recognition with deferred revenue
    console.log('\n📝 Testing deferred revenue transaction...');
    const deferredRevenue = [
      {
        accountCode: '1100', // Cash
        accountType: AccountType.ASSET,
        amount: 299.99,
        description: 'Annual subscription payment',
        currency: 'USD'
      },
      {
        accountCode: '2400', // Deferred Revenue (Liability)
        accountType: AccountType.LIABILITY,
        amount: 299.99,
        description: 'Deferred revenue - 12 month subscription',
        currency: 'USD'
      }
    ];
    
    const deferredResult = await validateRevenueTransaction(deferredRevenue);
    console.log(`   Result: ${deferredResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`   Business Rule: Payment creates fulfillment obligation`);
  }

  /**
   * Run Digital Andon simulation with real-time monitoring
   */
  private async runAndonSimulation(): Promise<void> {
    let eventCount = 0;
    
    for await (const dropoffEvent of this.simulator.generateEvents()) {
      eventCount++;
      
      // Process event through Andon monitor
      await this.andonMonitor.processEvent(dropoffEvent);
      
      // Check for alerts every few events
      if (eventCount % 5 === 0) {
        await this.checkAndDisplayAlerts();
      }
      
      // Simulate real-time delay
      await this.sleep(200);
    }
    
    // Final alert check
    await this.checkAndDisplayAlerts();
  }

  /**
   * Check for new alerts and display status
   */
  private async checkAndDisplayAlerts(): Promise<void> {
    const alerts = this.andonMonitor.getActiveAlerts();
    const overallStatus = this.andonMonitor.getOverallStatus();
    
    if (alerts.length > 0) {
      console.log(`\n🚨 Andon Status: ${this.getStatusEmoji(overallStatus)} ${overallStatus.toUpperCase()}`);
      
      for (const alert of alerts) {
        console.log(`   Stage: ${alert.stage}`);
        console.log(`   Message: ${alert.message}`);
        console.log(`   Actions: ${alert.actions.length} response actions triggered`);
        
        if (alert.state === AndonState.STOP) {
          console.log('   🛑 CRITICAL: Immediate intervention required');
          await this.handleCriticalAlert(alert);
        }
      }
    }
  }

  /**
   * Handle critical alerts with TPS Jidoka response
   */
  private async handleCriticalAlert(alert: any): Promise<void> {
    console.log('\n🔧 TPS Jidoka Response Protocol Activated:');
    console.log('   1. Stop the line - Prevent further revenue loss');
    console.log('   2. Alert on-call engineer - Immediate notification sent');
    console.log('   3. Escalate to revenue team - Revenue impact assessment');
    console.log('   4. Trigger root cause analysis - Data team investigation');
    
    // Simulate Double-Entry posting for revenue impact tracking
    const revenueImpactEntry = [
      {
        accountCode: '6200', // Lost Revenue Expense
        accountType: AccountType.EXPENSE,
        amount: 1250.00, // Estimated lost revenue
        description: `Revenue loss due to ${alert.stage} critical anomaly`,
        currency: 'USD',
        metadata: {
          alertId: alert.id,
          stage: alert.stage,
          impactType: 'dropoff_anomaly'
        }
      },
      {
        accountCode: '1300', // Accounts Receivable (reduction)
        accountType: AccountType.ASSET,
        amount: -1250.00, // Negative to reduce expected receivables
        description: 'Lost potential revenue from funnel anomaly',
        currency: 'USD'
      }
    ];
    
    const impactValidation = await validateRevenueTransaction(revenueImpactEntry);
    if (impactValidation.isValid) {
      console.log('   💰 Revenue impact posted to ledger: $1,250.00 estimated loss');
    }
  }

  /**
   * Background monitoring dashboard
   */
  private startMonitoringDashboard(): void {
    const updateInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(updateInterval);
        return;
      }
      
      // Update dashboard display (simplified for demo)
      process.stdout.write(`\r📊 Monitoring active... Overall status: ${this.getStatusEmoji(this.andonMonitor.getOverallStatus())}`);
    }, 2000);
  }

  /**
   * Get emoji for Andon status
   */
  private getStatusEmoji(status: AndonState): string {
    switch (status) {
      case AndonState.NORMAL: return '🟢';
      case AndonState.ATTENTION: return '🟡';
      case AndonState.STOP: return '🔴';
      default: return '⚪';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run the demo if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new RevenueLoopDemo();
  
  console.log('🎯 Revenue Loop MVP - Digital Andon + Double-Entry Integration');
  console.log('============================================================\n');
  
  demo.runDemo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export { RevenueLoopDemo };