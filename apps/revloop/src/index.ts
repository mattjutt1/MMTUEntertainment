/**
 * RevLoop Service - Digital Andon Entry Point
 * 
 * Main service entry for Revenue Loop MVP with Digital Andon monitoring
 * Implements TPS Jidoka principles for checkout funnel abnormality detection
 */

import { startServer } from './api/server.js';

async function main() {
  console.log('🚀 Starting RevLoop Digital Andon service...');
  
  try {
    await startServer();
    console.log('✅ RevLoop service started successfully');
    
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