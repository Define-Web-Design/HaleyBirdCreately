
/**
 * Command-line utility to generate and display app status
 * This provides a comprehensive overview of app performance, health, and user experience
 */

// Using dynamic import for TypeScript compatibility in Node environment
async function runAppStatusCheck() {
  console.log('Starting comprehensive app status check...');
  
  try {
    console.log('Gathering metrics and running tests...');
    
    // Dynamically import the module
    const { generateAppStatusReport, displayAppStatusReport, createStatusSummary } = 
      await import('./app-status-monitor.js');
    
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

// Allow for direct execution
if (typeof require !== 'undefined' && require.main === module) {
  runAppStatusCheck();
}

export { runAppStatusCheck };
