
import { generateAppStatusReport, displayAppStatusReport } from './app-status-monitor';

/**
 * Command-line utility to generate and display app status
 */
async function runAppStatusCheck() {
  console.log('Starting comprehensive app status check...');
  
  try {
    console.log('Gathering metrics and running tests...');
    const report = await generateAppStatusReport();
    displayAppStatusReport(report);
    
    // Exit with appropriate code based on app status
    if (report.overview.status === 'offline') {
      process.exit(2); // Critical issues
    } else if (report.overview.status === 'degraded') {
      process.exit(1); // Warning
    } else {
      process.exit(0); // All good
    }
  } catch (error) {
    console.error('Failed to generate app status report:', error);
    process.exit(3); // Error in the monitoring system itself
  }
}

// Run the status check if this file is executed directly
if (require.main === module) {
  runAppStatusCheck();
}

export { runAppStatusCheck };
