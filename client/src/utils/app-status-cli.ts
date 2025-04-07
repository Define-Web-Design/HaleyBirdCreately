
/**
 * Command-line utility to generate and display app status
 * This provides a comprehensive overview of app performance, health, and user experience
 */

// Import directly for better compatibility in Node environment
import { generateAppStatusReport, displayAppStatusReport, createStatusSummary } from './app-status-monitor';

/**
 * Run the app status check and display results
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
      if (typeof process !== 'undefined') {
        process.exit(2); // Critical issues
      }
    } else if (report.overview.status === 'degraded') {
      console.log('\n⚠️ WARNINGS DETECTED - Application is running but experiencing issues');
      if (typeof process !== 'undefined') {
        process.exit(1); // Warning
      }
    } else {
      console.log('\n✅ ALL SYSTEMS OPERATIONAL - Application is running normally');
      if (typeof process !== 'undefined') {
        process.exit(0); // All good
      }
    }
  } catch (error) {
    console.error('Failed to generate app status report:', error);
    if (typeof process !== 'undefined') {
      process.exit(3); // Error in the monitoring system itself
    }
  }
}

// Allow for direct execution
if (typeof require !== 'undefined' && require.main === module) {
  runAppStatusCheck();
}
