/**
 * RevLoop API Server - Digital Andon REST Interface
 * 
 * Provides HTTP endpoints for:
 * - Real-time funnel monitoring dashboard
 * - Event ingestion from tracking systems
 * - Alert management and incident response
 * - Statistical metrics and reporting
 */

import express from 'express';
import { z } from 'zod';
import { AndonMonitor } from '../andon/monitor.js';
import { 
  FunnelStageSchema, 
  DropoffEventSchema, 
  MonitoringConfigSchema,
  AndonState 
} from '../types/andon.js';

const app = express();
app.use(express.json());

// Initialize Andon Monitor with default configuration
const defaultConfig = MonitoringConfigSchema.parse({
  enabled: true,
  stages: ['landing', 'pricing', 'checkout', 'payment', 'confirmation'],
  alertThresholds: {
    attention: 2.0,
    stop: 3.0
  },
  sampleConfig: {
    minSampleSize: 30,
    lookbackHours: 24
  }
});

const andonMonitor = new AndonMonitor(defaultConfig);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'revloop-andon',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// Readiness check endpoint  
app.get('/ready', (req, res) => {
  const overallStatus = andonMonitor.getOverallStatus();
  res.json({
    status: 'ready',
    andonStatus: overallStatus,
    alerts: andonMonitor.getActiveAlerts().length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Event Ingestion Endpoints
 */

// Ingest funnel stage event
app.post('/events/funnel', async (req, res) => {
  try {
    const event = FunnelStageSchema.parse({
      ...req.body,
      timestamp: new Date(req.body.timestamp || Date.now())
    });

    await andonMonitor.processEvent(event);

    res.status(201).json({
      success: true,
      eventId: `${event.sessionId}-${event.stage}`,
      timestamp: event.timestamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid funnel event',
      details: error instanceof z.ZodError ? error.errors : error
    });
  }
});

// Ingest dropoff event
app.post('/events/dropoff', async (req, res) => {
  try {
    const event = DropoffEventSchema.parse({
      ...req.body,
      timestamp: new Date(req.body.timestamp || Date.now())
    });

    await andonMonitor.processEvent(event);

    res.status(201).json({
      success: true,
      eventId: `${event.sessionId}-dropoff`,
      timestamp: event.timestamp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid dropoff event',
      details: error instanceof z.ZodError ? error.errors : error
    });
  }
});

/**
 * Dashboard API Endpoints
 */

// Get overall Andon dashboard status
app.get('/dashboard', (req, res) => {
  const alerts = andonMonitor.getActiveAlerts();
  const overallStatus = andonMonitor.getOverallStatus();

  // Group alerts by stage
  const stageAlerts = new Map<string, any>();
  alerts.forEach(alert => {
    stageAlerts.set(alert.stage, alert);
  });

  const stages = defaultConfig.stages.map(stage => {
    const alert = stageAlerts.get(stage);
    return {
      name: stage,
      status: alert?.state || AndonState.NORMAL,
      metrics: {
        // These would come from your analytics system
        conversions: 0,
        dropoffs: 0,
        conversionRate: 0,
        timeSpent: 0,
        value: 0
      },
      alerts: alert ? [alert] : []
    };
  });

  res.json({
    overallStatus,
    stages,
    summary: {
      totalSessions: 0, // Would integrate with analytics
      totalDropoffs: 0,
      overallConversionRate: 0,
      potentialRevenueLost: 0,
      lastUpdated: new Date()
    }
  });
});

// Get alerts for specific stage
app.get('/alerts/:stage', (req, res) => {
  const { stage } = req.params;
  const alert = andonMonitor.getAlertForStage(stage);
  
  if (!alert) {
    res.status(404).json({
      success: false,
      error: `No active alerts for stage: ${stage}`
    });
    return;
  }

  res.json(alert);
});

// Get all active alerts
app.get('/alerts', (req, res) => {
  const alerts = andonMonitor.getActiveAlerts();
  res.json({
    success: true,
    count: alerts.length,
    alerts
  });
});

/**
 * Incident Response Endpoints
 */

// Acknowledge alert (for incident management)
app.post('/alerts/:alertId/acknowledge', (req, res) => {
  const { alertId } = req.params;
  const { acknowledgedBy, notes } = req.body;

  // In production, this would update alert status in database
  res.json({
    success: true,
    alertId,
    acknowledgedBy,
    acknowledgedAt: new Date(),
    notes
  });
});

// Resolve alert (mark incident as resolved)  
app.post('/alerts/:alertId/resolve', (req, res) => {
  const { alertId } = req.params;
  const { resolvedBy, resolution, rootCause } = req.body;

  // In production, this would update alert status and trigger post-incident review
  res.json({
    success: true,
    alertId,
    resolvedBy,
    resolvedAt: new Date(),
    resolution,
    rootCause
  });
});

/**
 * Analytics & Reporting Endpoints
 */

// Get funnel conversion metrics
app.get('/metrics/funnel', (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Would integrate with analytics system to get real metrics
  res.json({
    success: true,
    metrics: {
      period: { startDate, endDate },
      stages: defaultConfig.stages.map(stage => ({
        stage,
        sessions: 1000,
        conversions: 800,
        dropoffs: 200,
        conversionRate: 0.8,
        averageTimeSpent: 45,
        potentialValue: 15000
      })),
      overall: {
        totalSessions: 1000,
        totalConversions: 400,
        overallConversionRate: 0.4,
        totalRevenue: 25000,
        potentialRevenueLost: 15000
      }
    }
  });
});

// Get statistical process control metrics
app.get('/metrics/spc/:stage', (req, res) => {
  const { stage } = req.params;
  
  // Would return actual SPC calculations from monitor
  res.json({
    success: true,
    stage,
    spc: {
      mean: 0.15,
      standardDeviation: 0.05,
      upperControlLimit: 0.30,
      lowerControlLimit: 0.00,
      upperWarningLimit: 0.25,
      lowerWarningLimit: 0.05,
      currentValue: 0.18,
      sigmaLevel: 0.6,
      capability: 'stable',
      lastUpdated: new Date()
    }
  });
});

// Configuration management
app.get('/config', (req, res) => {
  res.json({
    success: true,
    config: defaultConfig
  });
});

app.put('/config', (req, res) => {
  try {
    const newConfig = MonitoringConfigSchema.parse(req.body);
    // Would update monitor configuration in production
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: newConfig
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid configuration',
      details: error instanceof z.ZodError ? error.errors : error
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 3001;

export function startServer(): Promise<void> {
  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`🎯 RevLoop Andon API server running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`🚨 Alerts: http://localhost:${PORT}/alerts`);
      console.log(`❤️ Health: http://localhost:${PORT}/health`);
      resolve();
    });
  });
}

export { app, andonMonitor };