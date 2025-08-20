import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { registry, recordAndon, andonAttentionTotal, andonStopTotal, startMetricsServer } from './registry.js';

describe('Metrics Registry', () => {
  beforeEach(() => {
    // Reset metrics before each test
    registry.resetMetrics();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.METRICS_PORT;
  });

  describe('Counter Registration', () => {
    test('should register attention counter with correct name and labels', () => {
      const metric = registry.getSingleMetric('revloop_andon_attention_total');
      expect(metric).toBeDefined();
      expect(metric?.name).toBe('revloop_andon_attention_total');
      expect(metric?.help).toBe('Count of Andon ATTENTION events');
    });

    test('should register stop counter with correct name and labels', () => {
      const metric = registry.getSingleMetric('revloop_andon_stop_total');
      expect(metric).toBeDefined();
      expect(metric?.name).toBe('revloop_andon_stop_total');
      expect(metric?.help).toBe('Count of Andon STOP events');
    });
  });

  describe('recordAndon Function', () => {
    test('should increment attention counter with sigma rule', () => {
      recordAndon('attention', 'sigma');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_attention_total\{rule="sigma"\} 1/);
    });

    test('should increment attention counter with weco rule', () => {
      recordAndon('attention', 'weco');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_attention_total\{rule="weco"\} 1/);
    });

    test('should increment stop counter with sigma rule', () => {
      recordAndon('stop', 'sigma');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_stop_total\{rule="sigma"\} 1/);
    });

    test('should increment stop counter with weco rule', () => {
      recordAndon('stop', 'weco');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_stop_total\{rule="weco"\} 1/);
    });

    test('should handle multiple increments correctly', () => {
      recordAndon('attention', 'sigma');
      recordAndon('attention', 'sigma');
      recordAndon('stop', 'weco');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_attention_total\{rule="sigma"\} 2/);
      expect(metrics).toMatch(/revloop_andon_stop_total\{rule="weco"\} 1/);
    });

    test('should maintain separate counters for different rule types', () => {
      recordAndon('attention', 'sigma');
      recordAndon('attention', 'weco');
      
      const metrics = registry.metrics();
      expect(metrics).toMatch(/revloop_andon_attention_total\{rule="sigma"\} 1/);
      expect(metrics).toMatch(/revloop_andon_attention_total\{rule="weco"\} 1/);
    });
  });

  describe('Bounded Labels', () => {
    test('should only accept valid rule values', () => {
      // These should work without throwing
      expect(() => recordAndon('attention', 'sigma')).not.toThrow();
      expect(() => recordAndon('stop', 'weco')).not.toThrow();
      
      // TypeScript should prevent invalid rule values at compile time
      // This tests runtime behavior for bounded labels
      const metrics = registry.metrics();
      expect(metrics).toMatch(/rule="(sigma|weco)"/);
    });

    test('should prevent cardinality explosion', () => {
      // Record multiple events with only valid label combinations
      const validRules = ['sigma', 'weco'] as const;
      const validEvents = ['attention', 'stop'] as const;
      
      for (const rule of validRules) {
        for (const event of validEvents) {
          recordAndon(event, rule);
        }
      }
      
      const metrics = registry.metrics();
      
      // Should only have 4 label combinations total (2 events × 2 rules)
      const attentionMatches = metrics.match(/revloop_andon_attention_total\{rule=/g);
      const stopMatches = metrics.match(/revloop_andon_stop_total\{rule=/g);
      
      expect(attentionMatches).toHaveLength(2); // sigma, weco
      expect(stopMatches).toHaveLength(2); // sigma, weco
    });
  });

  describe('Prometheus Format Compliance', () => {
    test('should export metrics in Prometheus text format', async () => {
      recordAndon('attention', 'sigma');
      recordAndon('stop', 'weco');
      
      const metrics = await registry.metrics();
      
      // Check Prometheus format compliance
      expect(metrics).toMatch(/# HELP revloop_andon_attention_total Count of Andon ATTENTION events/);
      expect(metrics).toMatch(/# TYPE revloop_andon_attention_total counter/);
      expect(metrics).toMatch(/# HELP revloop_andon_stop_total Count of Andon STOP events/);
      expect(metrics).toMatch(/# TYPE revloop_andon_stop_total counter/);
      
      // Check metric naming follows conventions (*_total suffix for counters)
      expect(metrics).toMatch(/revloop_andon_attention_total/);
      expect(metrics).toMatch(/revloop_andon_stop_total/);
    });

    test('should include default metrics from prom-client', async () => {
      const metrics = await registry.metrics();
      
      // Should include some default Node.js metrics
      expect(metrics).toMatch(/process_cpu_user_seconds_total/);
      expect(metrics).toMatch(/nodejs_version_info/);
    });
  });

  describe('startMetricsServer', () => {
    test('should start HTTP server on specified port', (done) => {
      const port = 9464;
      const server = startMetricsServer(port);
      
      expect(server).toBeDefined();
      
      // Clean up
      server.close(() => {
        done();
      });
    });

    test('should serve metrics on /metrics endpoint', (done) => {
      const port = 9465; // Different port to avoid conflicts
      const server = startMetricsServer(port);
      
      // Make a request to the metrics endpoint
      import('http').then(http => {
        const req = http.request({
          hostname: 'localhost',
          port: port,
          path: '/metrics',
          method: 'GET'
        }, (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toMatch(/text\/plain/);
          
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            expect(data).toMatch(/revloop_andon_/);
            server.close(() => done());
          });
        });
        
        req.on('error', (err) => {
          server.close(() => done(err));
        });
        
        req.end();
      });
    });

    test('should return 404 for non-metrics paths', (done) => {
      const port = 9466;
      const server = startMetricsServer(port);
      
      import('http').then(http => {
        const req = http.request({
          hostname: 'localhost',
          port: port,
          path: '/invalid',
          method: 'GET'
        }, (res) => {
          expect(res.statusCode).toBe(404);
          server.close(() => done());
        });
        
        req.on('error', (err) => {
          server.close(() => done(err));
        });
        
        req.end();
      });
    });
  });
});