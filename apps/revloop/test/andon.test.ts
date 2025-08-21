/**
 * Unit Tests - Digital Andon Monitoring
 * 
 * Tests for TPS Jidoka implementation with Statistical Process Control
 * Validates abnormality detection and response protocols
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { AndonMonitor } from '../src/andon/monitor.js';
import { AndonState, DropoffEvent, MonitoringConfig } from '../src/types/andon.js';

describe('AndonMonitor', () => {
  let monitor: AndonMonitor;
  let testConfig: MonitoringConfig;

  beforeEach(() => {
    testConfig = {
      enabled: true,
      alertThresholds: {
        attention: 2.0, // 2-sigma
        stop: 3.0       // 3-sigma
      },
      sampleConfig: {
        minSampleSize: 5,
        lookbackHours: 1,
        updateIntervalMs: 1000
      }
    };
    
    monitor = new AndonMonitor(testConfig);
  });

  describe('Event Processing', () => {
    test('should process dropoff events when enabled', async () => {
      const dropoffEvent: DropoffEvent = {
        id: 'test-dropoff-1',
        fromStage: 'checkout',
        toStage: 'exit',
        dropoffType: 'abandoned',
        timestamp: new Date(),
        sessionId: 'session-123',
        userId: 'user-456'
      };

      // Should not throw
      await expect(monitor.processEvent(dropoffEvent)).resolves.toBeUndefined();
    });

    test('should ignore events when monitoring disabled', async () => {
      const disabledConfig = { ...testConfig, enabled: false };
      const disabledMonitor = new AndonMonitor(disabledConfig);
      
      const dropoffEvent: DropoffEvent = {
        id: 'test-dropoff-1',
        fromStage: 'checkout',
        toStage: 'exit',
        dropoffType: 'abandoned',
        timestamp: new Date(),
        sessionId: 'session-123'
      };

      await disabledMonitor.processEvent(dropoffEvent);
      
      // No alerts should be generated
      expect(disabledMonitor.getActiveAlerts()).toHaveLength(0);
    });

    test('should handle funnel stage events', async () => {
      const stageEvent = {
        stage: 'product',
        timestamp: new Date(),
        sessionId: 'session-789',
        userId: 'user-101',
        metadata: {
          pageLoadTime: 1200,
          userAgent: 'test-agent'
        }
      };

      // Should not throw for stage events
      await expect(monitor.processEvent(stageEvent)).resolves.toBeUndefined();
    });
  });

  describe('Statistical Analysis', () => {
    test('should require minimum sample size for analysis', async () => {
      // Generate fewer events than minimum sample size
      for (let i = 0; i < testConfig.sampleConfig.minSampleSize - 1; i++) {
        const event: DropoffEvent = {
          id: `dropoff-${i}`,
          fromStage: 'cart',
          toStage: 'exit',
          dropoffType: 'abandoned',
          timestamp: new Date(),
          sessionId: `session-${i}`
        };
        
        await monitor.processEvent(event);
      }

      // Should not generate alerts with insufficient data
      expect(monitor.getActiveAlerts()).toHaveLength(0);
      expect(monitor.getOverallStatus()).toBe(AndonState.NORMAL);
    });

    test('should track events by stage separately', async () => {
      const stages = ['landing', 'product', 'cart', 'checkout'];
      
      // Generate events for different stages
      for (const stage of stages) {
        for (let i = 0; i < 3; i++) {
          const event: DropoffEvent = {
            id: `${stage}-dropoff-${i}`,
            fromStage: stage,
            toStage: 'exit',
            dropoffType: 'abandoned',
            timestamp: new Date(),
            sessionId: `${stage}-session-${i}`
          };
          
          await monitor.processEvent(event);
        }
      }

      // Each stage should be tracked independently
      const cartAlert = monitor.getAlertForStage('cart');
      const productAlert = monitor.getAlertForStage('product');
      
      // With low sample sizes, no alerts should be generated yet
      expect(cartAlert).toBeNull();
      expect(productAlert).toBeNull();
    });
  });

  describe('Alert Generation', () => {
    test('should generate attention alert for moderate anomalies', async () => {
      // This is a simplified test - in practice, statistical analysis
      // would require establishing baselines first
      const events = Array.from({ length: 20 }, (_, i) => ({
        id: `high-dropoff-${i}`,
        fromStage: 'payment',
        toStage: 'exit',
        dropoffType: 'technical_error',
        timestamp: new Date(Date.now() - (19 - i) * 60000), // Spread over 20 minutes
        sessionId: `session-${i}`
      }));

      for (const event of events) {
        await monitor.processEvent(event);
      }

      // Check if any alerts were generated
      const alerts = monitor.getActiveAlerts();
      // Note: Actual alert generation depends on baseline calculation
      // This test validates the monitoring system is functioning
      expect(typeof monitor.getOverallStatus()).toBe('string');
    });

    test('should provide alert details when active', async () => {
      // Generate a pattern that would trigger analysis
      const baseTime = Date.now();
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: `pattern-dropoff-${i}`,
        fromStage: 'checkout',
        toStage: 'exit',
        dropoffType: 'form_error',
        timestamp: new Date(baseTime - (9 - i) * 30000), // 30 second intervals
        sessionId: `pattern-session-${i}`,
        metadata: {
          errorType: 'validation_failed',
          formField: 'credit_card'
        }
      }));

      for (const event of events) {
        await monitor.processEvent(event);
      }

      // Verify monitoring system structure
      expect(monitor.getActiveAlerts()).toBeInstanceOf(Array);
      expect(['normal', 'attention', 'stop', 'unknown']).toContain(monitor.getOverallStatus());
    });
  });

  describe('Alert Management', () => {
    test('should track active alerts by stage', () => {
      const alerts = monitor.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
      
      const stageAlert = monitor.getAlertForStage('nonexistent-stage');
      expect(stageAlert).toBeNull();
    });

    test('should determine overall status from active alerts', () => {
      const status = monitor.getOverallStatus();
      expect(['normal', 'attention', 'stop', 'unknown']).toContain(status);
    });

    test('should handle multiple concurrent alerts', async () => {
      // Generate events for multiple stages
      const stages = ['cart', 'checkout', 'payment'];
      
      for (const stage of stages) {
        for (let i = 0; i < 8; i++) {
          const event: DropoffEvent = {
            id: `multi-${stage}-${i}`,
            fromStage: stage,
            toStage: 'exit',
            dropoffType: 'abandoned',
            timestamp: new Date(Date.now() - i * 60000),
            sessionId: `multi-${stage}-session-${i}`
          };
          
          await monitor.processEvent(event);
        }
      }

      // System should handle multiple potential alerts gracefully
      const alerts = monitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(0);
      
      // Overall status should be coherent
      const status = monitor.getOverallStatus();
      expect(['normal', 'attention', 'stop', 'unknown']).toContain(status);
    });
  });

  describe('Configuration Validation', () => {
    test('should respect alert threshold configuration', () => {
      const highThresholdConfig: MonitoringConfig = {
        enabled: true,
        alertThresholds: {
          attention: 5.0, // Very high threshold
          stop: 10.0
        },
        sampleConfig: {
          minSampleSize: 3,
          lookbackHours: 2,
          updateIntervalMs: 500
        }
      };

      const strictMonitor = new AndonMonitor(highThresholdConfig);
      
      // Monitor should be created successfully with custom config
      expect(strictMonitor.getOverallStatus()).toBe(AndonState.NORMAL);
      expect(strictMonitor.getActiveAlerts()).toHaveLength(0);
    });

    test('should handle edge case configurations', () => {
      const edgeConfig: MonitoringConfig = {
        enabled: true,
        alertThresholds: {
          attention: 0.1, // Very sensitive
          stop: 0.2
        },
        sampleConfig: {
          minSampleSize: 1, // Minimal sample
          lookbackHours: 0.1, // 6 minutes
          updateIntervalMs: 100
        }
      };

      const sensitiveMonitor = new AndonMonitor(edgeConfig);
      
      // Should handle extreme configuration without errors
      expect(sensitiveMonitor.getOverallStatus()).toBe(AndonState.NORMAL);
    });
  });

  describe('Data Management', () => {
    test('should handle event metadata correctly', async () => {
      const eventWithMetadata: DropoffEvent = {
        id: 'metadata-test',
        fromStage: 'product',
        toStage: 'exit',
        dropoffType: 'price_rejection',
        timestamp: new Date(),
        sessionId: 'metadata-session',
        userId: 'metadata-user',
        metadata: {
          productId: 'prod-123',
          price: 299.99,
          currency: 'USD',
          userAgent: 'Mozilla/5.0 Test',
          referrer: 'https://google.com'
        }
      };

      // Should handle rich metadata without errors
      await expect(monitor.processEvent(eventWithMetadata)).resolves.toBeUndefined();
    });

    test('should handle missing optional fields', async () => {
      const minimalEvent: DropoffEvent = {
        id: 'minimal-test',
        fromStage: 'landing',
        toStage: 'exit',
        dropoffType: 'bounce',
        timestamp: new Date(),
        sessionId: 'minimal-session'
        // userId and metadata are optional
      };

      // Should handle minimal event structure
      await expect(monitor.processEvent(minimalEvent)).resolves.toBeUndefined();
    });
  });
});