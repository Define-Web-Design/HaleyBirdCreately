
/**
 * Script for periodic monitoring of app status
 * This automatically runs status checks at specified intervals
 * and saves reports for historical analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run periodic monitoring of app status and save reports
 */
async function monitorAppStatus(intervalMinutes = 60) {
  console.log(`Setting up app status monitoring every ${intervalMinutes} minutes`);

  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, '../logs/app-status');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Run initial check
  await runAndSaveStatusCheck();

  // Set up interval for periodic checks
  setInterval(() => runAndSaveStatusCheck(), intervalMinutes * 60 * 1000);

  async function runAndSaveStatusCheck() {
    try {
      console.log('Running scheduled app status check...');

      // Run the status check using the CLI
      // We'll use ts-node to execute the TypeScript directly
      let statusOutput = '';
      try {
        statusOutput = execSync('npx ts-node client/src/utils/app-status-cli.ts', { 
          encoding: 'utf8' 
        });
      } catch (execError) {
        // Even if there are issues with the app, we want to capture the report
        console.warn('App status check completed with warnings or errors');
        statusOutput = execError.stdout || '';
      }

      // Save the output to a log file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilePath = path.join(logsDir, `status-report-${timestamp}.log`);
      fs.writeFileSync(reportFilePath, statusOutput);

      // Parse the output to determine the status
      let status = 'unknown';
      if (statusOutput.includes('ALL SYSTEMS OPERATIONAL')) {
        status = 'online';
      } else if (statusOutput.includes('WARNINGS DETECTED')) {
        status = 'degraded';
      } else if (statusOutput.includes('CRITICAL ISSUES DETECTED')) {
        status = 'offline';
      }

      // Generate a report summary for the logs
      const summaryPath = path.join(logsDir, 'current-status.json');
      const summary = {
        timestamp: new Date().toISOString(),
        status,
        statusMessage: extractStatusMessage(statusOutput),
        lastCheck: new Date().toISOString(),
        reportFile: reportFilePath
      };

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log(`Status check complete, summary saved to ${summaryPath}`);
    } catch (error) {
      console.error('Error in scheduled status check:', error);

      // Log the error to the alerts file
      const alertsPath = path.join(logsDir, 'alerts.log');
      const alertEntry = `[${new Date().toISOString()}] MONITOR ERROR: ${error.message}\n`;
      fs.appendFileSync(alertsPath, alertEntry);
    }
  }
}

/**
 * Extract status message from the status output
 */
function extractStatusMessage(output) {
  // Try to find the status message line
  const messageMatch = output.match(/Message: (.+)/);
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].trim();
  }
  
  // Fallback status messages based on overall status
  if (output.includes('ALL SYSTEMS OPERATIONAL')) {
    return 'All systems operational';
  } else if (output.includes('WARNINGS DETECTED')) {
    return 'Application is running but experiencing issues';
  } else if (output.includes('CRITICAL ISSUES DETECTED')) {
    return 'Application is offline or severely degraded';
  }
  
  return 'Status check completed';
}

// If run directly, start monitoring with default or provided interval
if (require.main === module) {
  const interval = process.argv[2] ? parseInt(process.argv[2]) : 60;
  monitorAppStatus(interval).catch(error => {
    console.error('Failed to start monitoring:', error);
    process.exit(1);
  });
}

module.exports = { monitorAppStatus };
