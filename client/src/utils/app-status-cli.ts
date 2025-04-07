
/**
 * Command-line utility to generate and display app status
 * This provides a comprehensive overview of app performance, health, and user experience
 */

import { generateAppStatusReport, displayAppStatusReport, createStatusSummary } from './app-status-monitor';

/**
 * Run a comprehensive status check and display the results
 */
export async function runAppStatusCheck() {
  console.log('Starting comprehensive app status check...');
  
  try {
    console.log('Gathering metrics and running tests...');
    const report = await generateAppStatusReport();
    
    // Display the full report
    displayAppStatusReport(report);
    
    // Show summary for quick reference
    console.log('\nSUMMARY:');
    console.log(createStatusSummary(report));
    
    // Exit with appropriate code based on app status
    if (report.overview.status === 'offline') {
      console.log('\n❌ CRITICAL ISSUES DETECTED - Application is offline or severely degraded');
      process.exit(2); // Critical issues
    } else if (report.overview.status === 'degraded') {
      console.log('\n⚠️ WARNINGS DETECTED - Application is running but experiencing issues');
      process.exit(1); // Warning
    } else {
      console.log('\n✅ ALL SYSTEMS OPERATIONAL - Application is running normally');
      process.exit(0); // All good
    }
  } catch (error) {
    console.error('Failed to generate app status report:', error);
    process.exit(3); // Error in the monitoring system itself
  }
}

// Allow for direct execution or import
if (typeof require !== 'undefined' && require.main === module) {
  runAppStatusCheck();
}
