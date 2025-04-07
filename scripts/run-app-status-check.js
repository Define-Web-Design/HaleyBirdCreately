// ES Module syntax for importing app-status.js
import { runAppStatusCheck } from './app-status.js';

// Run the app status check and display results
runAppStatusCheck()
  .then(report => {
    console.log('App Status Report generated successfully');
    console.log('----------------------------------------');
    console.log(`Overall Status: ${report.overview.status}`);
    console.log(`Status Message: ${report.overview.statusMessage}`);

    // Display service statuses
    console.log('\nService Statuses:');
    for (const [service, status] of Object.entries(report.services)) {
      console.log(`- ${service}: ${status.status}`);
      if (status.issues.length > 0) {
        console.log(`  Issues: ${status.issues.join(', ')}`);
      }
    }

    // Display recommendations
    if (report.recommendations.critical.length > 0) {
      console.log('\nCritical Recommendations:');
      report.recommendations.critical.forEach(rec => console.log(`- ${rec}`));
    }

    if (report.recommendations.improvements.length > 0) {
      console.log('\nImprovement Recommendations:');
      report.recommendations.improvements.forEach(rec => console.log(`- ${rec}`));
    }
  })
  .catch(error => {
    console.error('Error generating app status report:', error);
    process.exit(1);
  });