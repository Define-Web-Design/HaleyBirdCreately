
#!/usr/bin/env node

import { runAppStatusCheck } from './app-status.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default monitoring interval in minutes
const DEFAULT_INTERVAL = 15;

// Get monitoring interval from command line args or use default
const intervalMinutes = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_INTERVAL;

if (isNaN(intervalMinutes) || intervalMinutes < 1) {
  console.error('Error: Interval must be a positive number (in minutes)');
  process.exit(1);
}

// Configure logging
const LOG_DIR = path.join(__dirname, '../logs/app-status');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log file for this monitoring session
const LOG_FILE = path.join(LOG_DIR, `monitor-${new Date().toISOString().replace(/:/g, '-')}.log`);

/**
 * Log message to console and log file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

/**
 * Run a single monitoring cycle
 */
async function runMonitoringCycle() {
  try {
    log('🔄 Running app status check...');
    const statusReport = await runAppStatusCheck({ silent: true });
    
    log(`📊 Health Score: ${statusReport.healthScore}/100 (${statusReport.status.toUpperCase()})`);
    
    // Log any recommendations
    if (statusReport.recommendations && statusReport.recommendations.length > 0) {
      log('🔧 Recommendations:');
      statusReport.recommendations.forEach((rec, i) => {
        log(`   ${i + 1}. ${rec}`);
      });
    }
    
    // Alert on critical issues
    if (statusReport.status === 'critical') {
      log('⚠️ CRITICAL ALERT: Application is in a critical state!');
      // In a real system, you might send an email, SMS, or other alert here
    }
    
    return statusReport;
  } catch (error) {
    log(`❌ Error during monitoring cycle: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

/**
 * Start the monitoring process
 */
function startMonitoring() {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  log(`🚀 Starting app status monitoring (interval: ${intervalMinutes} minutes)`);
  log(`📝 Logging to: ${LOG_FILE}`);
  
  // Run immediate check
  runMonitoringCycle().then(() => {
    // Set up periodic monitoring
    const monitoringInterval = setInterval(async () => {
      await runMonitoringCycle();
    }, intervalMs);
    
    // Handle process termination
    process.on('SIGINT', () => {
      clearInterval(monitoringInterval);
      log('👋 Monitoring stopped by user');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      clearInterval(monitoringInterval);
      log('👋 Monitoring terminated');
      process.exit(0);
    });
  });
}

// Start monitoring
startMonitoring();
