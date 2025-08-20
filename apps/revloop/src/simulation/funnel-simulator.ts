/**
 * Funnel Simulation Engine for Testing Digital Andon
 * 
 * Generates realistic checkout funnel events for testing the monitoring system
 * Includes both normal and abnormal patterns to validate TPS Jidoka detection
 */

import { DropoffEvent, FunnelStage, AndonState } from '../types/andon.js';

export interface SimulationConfig {
  baselineDropoffRates: Record<string, number>; // Stage -> normal dropoff rate
  anomalyPatterns: AnomalyPattern[];
  durationMinutes: number;
  eventsPerMinute: number;
}

export interface AnomalyPattern {
  name: string;
  stage: string;
  startMinute: number;
  durationMinutes: number;
  severityMultiplier: number; // 1.0 = normal, 2.0 = double dropoffs, etc.
  description: string;
}

export class FunnelSimulator {
  private config: SimulationConfig;
  private startTime: Date;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.startTime = new Date();
  }

  /**
   * Generate simulation events for testing Digital Andon
   */
  async *generateEvents(): AsyncGenerator<DropoffEvent, void, unknown> {
    const totalEvents = this.config.durationMinutes * this.config.eventsPerMinute;
    
    for (let i = 0; i < totalEvents; i++) {
      const minuteOffset = Math.floor(i / this.config.eventsPerMinute);
      const eventTime = new Date(this.startTime.getTime() + (minuteOffset * 60 * 1000));
      
      // Determine which stage this event affects
      const stage = this.selectStageForEvent(minuteOffset);
      
      // Check if we should generate a dropoff (based on rates + anomalies)
      if (this.shouldGenerateDropoff(stage, minuteOffset)) {
        yield this.createDropoffEvent(stage, eventTime, minuteOffset);
      }
      
      // Small delay between events for realistic timing
      await this.sleep(100);
    }
  }

  /**
   * Select funnel stage for this event based on realistic traffic distribution
   */
  private selectStageForEvent(minuteOffset: number): string {
    const stages = Object.keys(this.config.baselineDropoffRates);
    const weights = [0.4, 0.25, 0.2, 0.1, 0.05]; // Landing page gets most traffic
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < stages.length; i++) {
      cumulative += weights[i] || 0.05;
      if (random <= cumulative) {
        return stages[i];
      }
    }
    
    return stages[0]; // Fallback
  }

  /**
   * Determine if we should generate a dropoff event
   * Considers baseline rates + any active anomaly patterns
   */
  private shouldGenerateDropoff(stage: string, minuteOffset: number): boolean {
    let dropoffRate = this.config.baselineDropoffRates[stage] || 0.1;
    
    // Apply anomaly multipliers if active
    const activeAnomalies = this.getActiveAnomalies(minuteOffset);
    for (const anomaly of activeAnomalies) {
      if (anomaly.stage === stage) {
        dropoffRate *= anomaly.severityMultiplier;
      }
    }
    
    return Math.random() < dropoffRate;
  }

  /**
   * Get anomaly patterns active at the given minute
   */
  private getActiveAnomalies(minuteOffset: number): AnomalyPattern[] {
    return this.config.anomalyPatterns.filter(anomaly => 
      minuteOffset >= anomaly.startMinute && 
      minuteOffset < (anomaly.startMinute + anomaly.durationMinutes)
    );
  }

  /**
   * Create a realistic dropoff event
   */
  private createDropoffEvent(stage: string, timestamp: Date, minuteOffset: number): DropoffEvent {
    const activeAnomalies = this.getActiveAnomalies(minuteOffset);
    const anomalyContext = activeAnomalies.length > 0 ? activeAnomalies[0] : null;
    
    return {
      id: `sim-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      fromStage: stage,
      toStage: 'exit',
      dropoffType: this.getDropoffType(stage, anomalyContext),
      timestamp,
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
      userId: Math.random() < 0.7 ? `user-${Math.random().toString(36).substr(2, 6)}` : undefined,
      metadata: {
        userAgent: this.getRandomUserAgent(),
        referrer: this.getRandomReferrer(),
        ...(anomalyContext && { simulationAnomaly: anomalyContext.name })
      }
    };
  }

  /**
   * Get appropriate dropoff type based on stage and anomaly
   */
  private getDropoffType(stage: string, anomaly: AnomalyPattern | null): string {
    if (anomaly) {
      // Anomaly-specific dropoff types
      switch (anomaly.name) {
        case 'payment-outage':
          return 'technical_error';
        case 'slow-loading':
          return 'timeout';
        case 'price-shock':
          return 'price_rejection';
        default:
          return 'abandoned';
      }
    }
    
    // Normal dropoff types by stage
    const stageDropoffTypes: Record<string, string[]> = {
      'landing': ['bounce', 'no_interest'],
      'product': ['price_rejection', 'feature_mismatch'],
      'cart': ['shipping_cost', 'abandoned'],
      'checkout': ['payment_declined', 'form_error'],
      'payment': ['technical_error', 'security_concern']
    };
    
    const types = stageDropoffTypes[stage] || ['abandoned'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Generate realistic user agents for simulation
   */
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Generate realistic referrers for simulation
   */
  private getRandomReferrer(): string {
    const referrers = [
      'https://google.com/search',
      'https://facebook.com',
      'https://twitter.com',
      'direct',
      'https://newsletter.company.com'
    ];
    return referrers[Math.floor(Math.random() * referrers.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Predefined simulation scenarios for testing
 */
export const SIMULATION_SCENARIOS = {
  /**
   * Normal operations - baseline performance
   */
  normal: {
    baselineDropoffRates: {
      'landing': 0.15,    // 15% bounce rate
      'product': 0.08,    // 8% abandon at product page
      'cart': 0.12,       // 12% abandon at cart
      'checkout': 0.06,   // 6% abandon at checkout
      'payment': 0.03     // 3% payment failures
    },
    anomalyPatterns: [],
    durationMinutes: 60,
    eventsPerMinute: 10
  } as SimulationConfig,

  /**
   * Payment outage scenario - critical Andon trigger
   */
  paymentOutage: {
    baselineDropoffRates: {
      'landing': 0.15,
      'product': 0.08,
      'cart': 0.12,
      'checkout': 0.06,
      'payment': 0.03
    },
    anomalyPatterns: [
      {
        name: 'payment-outage',
        stage: 'payment',
        startMinute: 20,
        durationMinutes: 15,
        severityMultiplier: 8.0, // 24% failure rate instead of 3%
        description: 'Payment processor outage causing high failure rate'
      }
    ],
    durationMinutes: 60,
    eventsPerMinute: 15
  } as SimulationConfig,

  /**
   * Performance degradation - gradual attention trigger
   */
  slowLoading: {
    baselineDropoffRates: {
      'landing': 0.15,
      'product': 0.08,
      'cart': 0.12,
      'checkout': 0.06,
      'payment': 0.03
    },
    anomalyPatterns: [
      {
        name: 'slow-loading',
        stage: 'product',
        startMinute: 10,
        durationMinutes: 30,
        severityMultiplier: 2.5, // 20% dropoff instead of 8%
        description: 'Slow page loading causing increased bounce rate'
      }
    ],
    durationMinutes: 60,
    eventsPerMinute: 12
  } as SimulationConfig,

  /**
   * Multi-stage degradation - complex scenario
   */
  multiStageIssues: {
    baselineDropoffRates: {
      'landing': 0.15,
      'product': 0.08,
      'cart': 0.12,
      'checkout': 0.06,
      'payment': 0.03
    },
    anomalyPatterns: [
      {
        name: 'price-shock',
        stage: 'cart',
        startMinute: 5,
        durationMinutes: 20,
        severityMultiplier: 2.0,
        description: 'Pricing display error causing cart abandonment'
      },
      {
        name: 'payment-slowdown',
        stage: 'payment',
        startMinute: 15,
        durationMinutes: 25,
        severityMultiplier: 3.0,
        description: 'Payment processing delays'
      }
    ],
    durationMinutes: 45,
    eventsPerMinute: 20
  } as SimulationConfig
};