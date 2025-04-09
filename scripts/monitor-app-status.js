// App Status Monitor
// Runs periodic checks and logs results

import { runAppStatusCheck } from './app-status.js';
import fs from 'fs';
import path from 'path';

const DEFAULT_INTERVAL_MINUTES = 10;
const LOG_DIR = path.join(process.cwd(), 'logs', 'app-status');

async function monitorAppStatus(intervalMinutes = DEFAULT_INTERVAL_MINUTES) {
  // Create log directory if it doesn't exist
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  console.log(`🔄 Starting app status monitoring (interval: ${intervalMinutes} minutes)`);

  // Initial check
  await runAndLogCheck();

  // Schedule periodic checks
  setInterval(runAndLogCheck, intervalMinutes * 60 * 1000);
}

async function runAndLogCheck() {
  try {
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace(/:/g, '-').split('.')[0];
    const logFile = path.join(LOG_DIR, `status-${formattedDate}.json`);

    console.log(`\n📊 Running app status check at ${timestamp.toLocaleString()}`);

    // Run the status check
    const results = await runAppStatusCheck({ 
      outputFormat: 'summary', 
      logToConsole: true 
    });

    // Log results to file
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
    console.log(`✅ Status check complete. Results saved to ${logFile}`);

    // Also append to summary log
    appendToSummaryLog(results);

    return results;
  } catch (error) {
    console.error('❌ Error during app status check:', error);

    // Log the error
    const errorLog = path.join(LOG_DIR, 'errors.log');
    fs.appendFileSync(
      errorLog,
      `[${new Date().toISOString()}] Error during status check: ${error.message}\n${error.stack}\n\n`
    );
  }
}

function appendToSummaryLog(results) {
  const summaryLog = path.join(LOG_DIR, 'status-summary.log');
  const summaryLine = `[${results.timestamp}] Status: ${results.status.toUpperCase()} | ` +
    `Healthy: ${results.summary.healthy} | ` +
    `Warnings: ${results.summary.warnings} | ` +
    `Critical: ${results.summary.critical}\n`;

  fs.appendFileSync(summaryLog, summaryLine);
}

// Get interval from command line arguments, default to 10 minutes
const intervalArg = process.argv[2];
const interval = intervalArg ? parseInt(intervalArg, 10) : DEFAULT_INTERVAL_MINUTES;

// Start monitoring
monitorAppStatus(interval);