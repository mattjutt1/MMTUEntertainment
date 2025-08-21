/**
 * RevLoop Service - Digital Andon Entry Point
 * 
 * Main service entry for Revenue Loop MVP with Digital Andon monitoring
 * Implements TPS Jidoka principles for checkout funnel abnormality detection
 */

import { startServer } from './api/server.js';
import { startMetricsServer } from './metrics/registry.js';

async function main() {
  console.log('🚀 Starting RevLoop Digital Andon service...');
  
  try {
    await startServer();
    console.log('✅ RevLoop service started successfully');
    
    // Start optional metrics server if METRICS_PORT is specified
    const metricsPort = process.env.METRICS_PORT;
    if (metricsPort) {
      const port = parseInt(metricsPort, 10);
      if (isNaN(port) || port <= 0 || port > 65535) {
        console.warn(`⚠️ Invalid METRICS_PORT: ${metricsPort} - metrics disabled`);
      } else {
        startMetricsServer(port);
      }
    }
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🔄 Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGINT', () => {
      console.log('🔄 Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start RevLoop service:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Unhandled error in main:', error);
  process.exit(1);
});