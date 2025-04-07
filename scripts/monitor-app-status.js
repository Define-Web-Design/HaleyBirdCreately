
/**
 * Script for periodic monitoring of app status
 * This automatically runs status checks at specified intervals
 * and saves reports for historical analysis
 */

const fs = require('fs');
const path = require('path');

// Note: We need to require the ESM module using dynamic import when running directly
async function loadMonitor() {
  try {
    // Try to import the compiled JS version first
    return await import('../client/src/utils/app-status-monitor.js');
  } catch (error) {
    console.error('Error loading app-status-monitor.js:', error.message);
    
    // Fallback to .ts version with ts-node if available
    try {
      // This requires ts-node to be installed
      require('ts-node/register');
      return require('../client/src/utils/app-status-monitor.ts');
    } catch (innerError) {
      console.error('Could not load app-status-monitor module:', innerError.message);
      throw new Error('Unable to load status monitor module');
    }
  }
}

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
  
  // Load the monitor module
  const monitor = await loadMonitor();
  
  // Run initial check
  await runAndSaveStatusCheck(monitor);
  
  // Set up interval for periodic checks
  setInterval(() => runAndSaveStatusCheck(monitor), intervalMinutes * 60 * 1000);
  
  async function runAndSaveStatusCheck(monitor) {
    try {
      console.log('Running scheduled app status check...');
      const report = await monitor.generateAppStatusReport();
      
      // Display report in console
      monitor.displayAppStatusReport(report);
      
      // Save report to logs directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(logsDir, `status-report-${timestamp}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      console.log(`Status report saved to ${filePath}`);
      
      // If there are critical issues, write to a separate alerts file
      if (report.overview.status !== 'online' || report.performance.errors.critical.count > 0) {
        const alertsPath = path.join(logsDir, 'alerts.log');
        const alertEntry = `[${new Date().toISOString()}] Status: ${report.overview.status} - ${report.overview.statusMessage}\n`;
        fs.appendFileSync(alertsPath, alertEntry);
        
        console.log('⚠️ Alert logged due to issues detected');
      }
      
      // Create a summary file that is always overwritten with latest status
      const summaryPath = path.join(logsDir, 'current-status.json');
      const summary = {
        timestamp: report.timestamp,
        status: report.overview.status,
        statusMessage: report.overview.statusMessage,
        criticalIssues: report.recommendations.critical.length,
        improvements: report.recommendations.improvements.length
      };
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    } catch (error) {
      console.error('Error in scheduled status check:', error);
      
      // Log the error to the alerts file
      const alertsPath = path.join(logsDir, 'alerts.log');
      const alertEntry = `[${new Date().toISOString()}] MONITOR ERROR: ${error.message}\n`;
      fs.appendFileSync(alertsPath, alertEntry);
    }
  }
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
