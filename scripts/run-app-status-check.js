
// App Status Check Runner
// This script runs the comprehensive app status check

import { runAppStatusCheck } from './app-status.js';

console.log('Starting comprehensive app status check...');

try {
  const results = await runAppStatusCheck();
  console.log('App Status Check Completed');
  console.log('-------------------------');
  console.log('Summary:');
  console.log(`- Overall Status: ${results.status}`);
  console.log(`- Checked Services: ${results.checkedServices}`);
  console.log(`- Services Online: ${results.onlineServices}`);
  console.log(`- Services Offline: ${results.offlineServices}`);
  
  if (results.issues.length > 0) {
    console.log('\nIssues Detected:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.service}: ${issue.message}`);
    });
  }
  
  process.exit(results.status === 'healthy' ? 0 : 1);
} catch (error) {
  console.error('Error running app status check:', error);
  process.exit(1);
}
