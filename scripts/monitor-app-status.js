
const { generateAppStatusReport, displayAppStatusReport } = require('../client/src/utils/app-status-monitor');
const fs = require('fs');
const path = require('path');

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
  setInterval(runAndSaveStatusCheck, intervalMinutes * 60 * 1000);
  
  async function runAndSaveStatusCheck() {
    try {
      console.log('Running scheduled app status check...');
      const report = await generateAppStatusReport();
      
      // Display report in console
      displayAppStatusReport(report);
      
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
    } catch (error) {
      console.error('Error in scheduled status check:', error);
    }
  }
}

// If run directly, start monitoring with default 60 minute interval
if (require.main === module) {
  const interval = process.argv[2] ? parseInt(process.argv[2]) : 60;
  monitorAppStatus(interval);
}

module.exports = { monitorAppStatus };
