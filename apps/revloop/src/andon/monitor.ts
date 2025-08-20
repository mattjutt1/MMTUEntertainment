/**
 * Digital Andon Monitor - TPS Jidoka Implementation
 * 
 * Core monitoring engine implementing Toyota Production System principles:
 * - Immediate abnormality detection (statistical process control)
 * - Automatic stopping when critical thresholds exceeded  
 * - Root cause investigation workflows
 * - Continuous improvement feedback loops
 */

import {
  AndonState,
  AndonAlert,
  DropoffEvent,
  FunnelStage,
  MonitoringConfig,
  StatisticalMetrics,
  ProcessCapability,
  SPC_CONFIG
} from '../types/andon.js';

/**
 * Configurable SPC thresholds with Western Electric Rules support
 * Environment variables provide production-tunable parameters
 */
export const ATTENTION_Z = parseFloat(process.env.Z_ATTENTION ?? '2.0');
export const STOP_Z = parseFloat(process.env.Z_STOP ?? '3.0');
export const USE_WESTERN_ELECTRIC = process.env.WE_RULES === 'true' || process.env.WE_RULES === undefined;

/**
 * Western Electric Rules for enhanced SPC sensitivity
 * Optional rules that can trigger alerts before sigma thresholds
 */
interface WesternElectricState {
  recent2Sigma: number[];  // Track recent 2σ violations
  recent1Sigma: number[];  // Track recent 1σ violations
  trendPoints: number[];   // Track increasing/decreasing trends
}

export class AndonMonitor {
  private config: MonitoringConfig;
  private activeAlerts: Map<string, AndonAlert> = new Map();
  private historicalData: DropoffEvent[] = [];
  private baselineMetrics: Map<string, StatisticalMetrics> = new Map();
  private westernElectricState: Map<string, WesternElectricState> = new Map();

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  /**
   * Process incoming funnel event and check for abnormalities
   * Following TPS Jidoka principle: detect problems immediately
   */
  async processEvent(event: FunnelStage | DropoffEvent): Promise<void> {
    if (!this.config.enabled) return;

    // Store historical data for baseline calculations
    if ('dropoffType' in event) {
      this.historicalData.push(event);
      await this.evaluateStagePerformance(event.fromStage);
    }

    // Trim historical data to lookback window
    this.trimHistoricalData();
  }

  /**
   * Evaluate stage performance against statistical control limits
   * Implementation of Statistical Process Control (SPC) for quality management
   */
  private async evaluateStagePerformance(stage: string): Promise<void> {
    const recentDropoffs = this.getRecentDropoffs(stage);
    
    if (recentDropoffs.length < this.config.sampleConfig.minSampleSize) {
      // Insufficient data for statistical analysis
      return;
    }

    // Calculate current dropoff rate
    const totalEvents = this.getTotalEventsForStage(stage);
    const currentDropoffRate = recentDropoffs.length / totalEvents;

    // Get or calculate baseline metrics
    const baseline = await this.getBaselineMetrics(stage);
    
    if (!baseline) {
      // First time seeing this stage, establish baseline
      await this.establishBaseline(stage, currentDropoffRate);
      return;
    }

    // Calculate sigma level (how many standard deviations from mean)
    const sigmaLevel = Math.abs(currentDropoffRate - baseline.mean) / baseline.standardDeviation;

    // Determine Andon state based on sigma level (pass stage for Western Electric rules)
    const newState = this.determineAndonState(sigmaLevel, stage);
    const existingAlert = this.activeAlerts.get(stage);

    // Only create/update alert if state changed or escalated
    if (!existingAlert || existingAlert.state !== newState) {
      await this.handleStateChange(stage, newState, {
        currentRate: currentDropoffRate,
        baselineRate: baseline.mean,
        standardDeviation: baseline.standardDeviation,
        sigmaLevel,
        sampleSize: recentDropoffs.length
      });
    }
  }

  /**
   * Determine Andon state based on sigma level (TPS quality gates)
   * Uses configurable thresholds and optional Western Electric rules
   */
  private determineAndonState(sigmaLevel: number, stage?: string): AndonState {
    // Use configurable thresholds instead of config values
    if (sigmaLevel >= STOP_Z) {
      return AndonState.STOP;
    } else if (sigmaLevel >= ATTENTION_Z) {
      return AndonState.ATTENTION;
    }
    
    // Check Western Electric rules for early detection (if enabled and stage provided)
    if (USE_WESTERN_ELECTRIC && stage && this.checkWesternElectricRules(stage, sigmaLevel)) {
      return AndonState.ATTENTION;
    }
    
    return AndonState.NORMAL;
  }
  
  /**
   * Western Electric Rules implementation for enhanced SPC sensitivity
   * Rule 2: 2 out of 3 consecutive points beyond 2σ from centerline
   */
  private checkWesternElectricRules(stage: string, currentSigma: number): boolean {
    if (!this.westernElectricState.has(stage)) {
      this.westernElectricState.set(stage, {
        recent2Sigma: [],
        recent1Sigma: [],
        trendPoints: []
      });
    }
    
    const state = this.westernElectricState.get(stage)!;
    
    // Track 2σ violations for Rule 2
    if (currentSigma >= 2.0) {
      state.recent2Sigma.push(currentSigma);
    } else {
      state.recent2Sigma.push(0); // Non-violation
    }
    
    // Keep only last 3 points
    if (state.recent2Sigma.length > 3) {
      state.recent2Sigma.shift();
    }
    
    // Rule 2: 2 out of 3 consecutive points beyond 2σ
    if (state.recent2Sigma.length === 3) {
      const violationCount = state.recent2Sigma.filter(sigma => sigma >= 2.0).length;
      if (violationCount >= 2) {
        console.log(`Western Electric Rule 2 triggered for ${stage}: 2 of 3 points beyond 2σ`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Handle Andon state changes following TPS escalation protocols
   */
  private async handleStateChange(
    stage: string,
    newState: AndonState,
    metrics: any
  ): Promise<void> {
    const alertId = `${stage}-${Date.now()}`;
    
    const alert: AndonAlert = {
      id: alertId,
      state: newState,
      stage,
      message: this.generateAlertMessage(stage, newState, metrics),
      timestamp: new Date(),
      metrics,
      actions: []
    };

    this.activeAlerts.set(stage, alert);

    // Execute TPS response protocol based on state
    switch (newState) {
      case AndonState.STOP:
        await this.executeStopActions(alert);
        break;
      case AndonState.ATTENTION:
        await this.executeAttentionActions(alert);
        break;
      case AndonState.NORMAL:
        await this.executeNormalActions(alert);
        break;
    }

    // Emit alert for external systems (dashboard, notifications, etc.)
    await this.emitAlert(alert);
  }

  /**
   * STOP protocol: Immediate intervention required (TPS Jidoka)
   */
  private async executeStopActions(alert: AndonAlert): Promise<void> {
    const actions = [
      {
        type: 'notify' as const,
        target: 'on-call-engineer',
        timestamp: new Date(),
        status: 'pending' as const
      },
      {
        type: 'escalate' as const,
        target: 'revenue-team',
        timestamp: new Date(),
        status: 'pending' as const
      },
      {
        type: 'investigate' as const,
        target: 'data-team',
        timestamp: new Date(),
        status: 'pending' as const
      }
    ];

    alert.actions = actions;

    // Optional: Stop traffic to problematic stage if configured
    if (this.shouldStopTraffic(alert)) {
      actions.push({
        type: 'stop_traffic',
        target: alert.stage,
        timestamp: new Date(),
        status: 'pending'
      });
    }
  }

  /**
   * ATTENTION protocol: Enhanced monitoring and investigation
   */
  private async executeAttentionActions(alert: AndonAlert): Promise<void> {
    alert.actions = [
      {
        type: 'notify',
        target: 'growth-team',
        timestamp: new Date(),
        status: 'pending'
      },
      {
        type: 'investigate',
        target: 'analytics-team',
        timestamp: new Date(),
        status: 'pending'
      }
    ];
  }

  /**
   * NORMAL protocol: Return to standard monitoring
   */
  private async executeNormalActions(alert: AndonAlert): Promise<void> {
    // Clear any previous alerts for this stage
    if (this.activeAlerts.has(alert.stage)) {
      const previousAlert = this.activeAlerts.get(alert.stage);
      if (previousAlert && previousAlert.state !== AndonState.NORMAL) {
        alert.actions = [{
          type: 'notify',
          target: 'growth-team',
          timestamp: new Date(),
          status: 'pending'
        }];
      }
    }
  }

  /**
   * Get recent dropoff events for a stage within lookback window
   */
  private getRecentDropoffs(stage: string): DropoffEvent[] {
    const lookbackMs = this.config.sampleConfig.lookbackHours * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - lookbackMs);
    
    return this.historicalData.filter(event => 
      event.fromStage === stage && event.timestamp >= cutoff
    );
  }

  /**
   * Get total events (conversions + dropoffs) for accurate rate calculation
   */
  private getTotalEventsForStage(stage: string): number {
    // This would integrate with your analytics/tracking system
    // For MVP, we'll estimate based on dropoffs with assumed conversion rate
    const dropoffs = this.getRecentDropoffs(stage).length;
    const estimatedConversions = dropoffs * 0.8; // Assume 80% conversion baseline
    return dropoffs + estimatedConversions;
  }

  /**
   * Calculate baseline statistical metrics for a stage
   */
  private async calculateBaselineMetrics(stage: string): Promise<StatisticalMetrics | null> {
    const dropoffs = this.getRecentDropoffs(stage);
    
    if (dropoffs.length < this.config.sampleConfig.minSampleSize) {
      return null;
    }

    // Group by time periods (hourly) to get rate samples
    const hourlyRates = this.calculateHourlyDropoffRates(stage, dropoffs);
    
    if (hourlyRates.length < 5) {
      return null; // Need at least 5 hourly samples
    }

    const mean = hourlyRates.reduce((sum, rate) => sum + rate, 0) / hourlyRates.length;
    const variance = hourlyRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / hourlyRates.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean,
      standardDeviation,
      upperControlLimit: mean + (3 * standardDeviation),
      lowerControlLimit: Math.max(0, mean - (3 * standardDeviation)),
      upperWarningLimit: mean + (2 * standardDeviation),
      lowerWarningLimit: Math.max(0, mean - (2 * standardDeviation)),
      sampleSize: hourlyRates.length,
      lastCalculated: new Date()
    };
  }

  /**
   * Calculate hourly dropoff rates for statistical analysis
   */
  private calculateHourlyDropoffRates(stage: string, dropoffs: DropoffEvent[]): number[] {
    const hourlyBuckets = new Map<string, { dropoffs: number; total: number }>();
    
    dropoffs.forEach(dropoff => {
      const hour = new Date(dropoff.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      const bucket = hourlyBuckets.get(hour) || { dropoffs: 0, total: 0 };
      bucket.dropoffs += 1;
      bucket.total = this.getHourlyTotalForPeriod(stage, hour);
      hourlyBuckets.set(hour, bucket);
    });

    return Array.from(hourlyBuckets.values())
      .map(bucket => bucket.total > 0 ? bucket.dropoffs / bucket.total : 0);
  }

  /**
   * Helper methods and utilities
   */
  private generateAlertMessage(stage: string, state: AndonState, metrics: any): string {
    const sigmaText = metrics.sigmaLevel.toFixed(1);
    const rateText = (metrics.currentRate * 100).toFixed(1);
    const baselineText = (metrics.baselineRate * 100).toFixed(1);

    switch (state) {
      case AndonState.STOP:
        return `🚨 CRITICAL: ${stage} dropoff rate ${rateText}% (${sigmaText}σ above baseline ${baselineText}%)`;
      case AndonState.ATTENTION:
        return `⚠️ ATTENTION: ${stage} dropoff rate ${rateText}% (${sigmaText}σ above baseline ${baselineText}%)`;
      case AndonState.NORMAL:
        return `✅ NORMAL: ${stage} dropoff rate ${rateText}% (baseline ${baselineText}%)`;
      default:
        return `❓ UNKNOWN: ${stage} insufficient data for analysis`;
    }
  }

  // Placeholder methods that would integrate with external systems
  private async getBaselineMetrics(stage: string): Promise<StatisticalMetrics | null> {
    return this.baselineMetrics.get(stage) || await this.calculateBaselineMetrics(stage);
  }

  private async establishBaseline(stage: string, rate: number): Promise<void> {
    // Store initial baseline - would persist to database in production
    console.log(`Establishing baseline for ${stage}: ${rate}`);
  }

  private shouldStopTraffic(alert: AndonAlert): boolean {
    // Configuration-driven decision on whether to stop traffic
    return alert.metrics.sigmaLevel > 4.0; // Only stop on extreme outliers
  }

  private async emitAlert(alert: AndonAlert): Promise<void> {
    // Emit to external systems - dashboard, Slack, email, etc.
    console.log('Andon Alert:', JSON.stringify(alert, null, 2));
  }

  private trimHistoricalData(): void {
    const cutoff = new Date(Date.now() - (this.config.sampleConfig.lookbackHours * 60 * 60 * 1000));
    this.historicalData = this.historicalData.filter(event => event.timestamp >= cutoff);
  }

  private getHourlyTotalForPeriod(stage: string, hour: string): number {
    // Would integrate with analytics system to get total events for the hour
    // For MVP, return estimated total
    return 100; // Placeholder
  }

  // Public interface methods
  public getActiveAlerts(): AndonAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  public getAlertForStage(stage: string): AndonAlert | null {
    return this.activeAlerts.get(stage) || null;
  }

  public getOverallStatus(): AndonState {
    const alerts = this.getActiveAlerts();
    if (alerts.some(alert => alert.state === AndonState.STOP)) {
      return AndonState.STOP;
    } else if (alerts.some(alert => alert.state === AndonState.ATTENTION)) {
      return AndonState.ATTENTION;
    } else {
      return AndonState.NORMAL;
    }
  }
}