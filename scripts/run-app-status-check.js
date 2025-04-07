/**
 * App Status Check Runner
 * 
 * Command-line utility to run application status checks
 * and generate detailed reports.
 */

const { runAppStatusCheck } = require('./app-status');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting comprehensive app status check...');

  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '..', 'logs', 'app-status');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Run the status check
    const result = await runAppStatusCheck();

    if (!result.success) {
      console.error('App status check failed:', result.error);
      process.exit(1);
    }

    // Print summary to console (this is already handled in runAppStatusCheck)

    // Return success
    console.log('\nStatus check complete. See logs directory for detailed reports:');
    console.log(`${logsDir}/status-*.json - Detailed JSON data`);
    console.log(`${logsDir}/summary-*.txt - Human-readable summaries`);

    // Exit with appropriate code
    const hasIssues = result.summary.includes('CRITICAL ISSUES') || 
                     result.status.application.serverRunning === false;

    process.exit(hasIssues ? 1 : 0);
  } catch (error) {
    console.error('Error running app status check:', error);
    process.exit(1);
  }
}

// Run if this script is called directly
if (require.main === module) {
  main();
}

module.exports = { runStatusCheck: main };