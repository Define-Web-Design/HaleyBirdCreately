
/**
 * Script to run a comprehensive app status check
 * This provides detailed information about the application's health
 * including API response times, page load speeds, errors, and more
 */

const { generateAppStatusReport, displayAppStatusReport } = require('../client/src/utils/app-status-monitor.js');

async function runStatusCheck() {
  console.log('Running comprehensive app status check...');
  try {
    const report = await generateAppStatusReport();
    displayAppStatusReport(report);
    
    // Exit with appropriate code based on status
    if (report.overview.status === 'offline') {
      process.exit(2); // Critical issues
    } else if (report.overview.status === 'degraded') {
      process.exit(1); // Warnings
    } else {
      process.exit(0); // All good
    }
  } catch (error) {
    console.error('Error running app status check:', error);
    process.exit(3);
  }
}

// Run the check
runStatusCheck();
