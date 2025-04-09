
// App Status Check Runner

import { runAppStatusCheck } from './app-status.js';

async function main() {
  try {
    // Get options from command line arguments if provided
    const options = {
      logToConsole: true,
      checkEndpoints: true,
      checkPerformance: true,
      checkSecurity: true,
      outputFormat: process.argv.includes('--summary') ? 'summary' : 'detailed'
    };
    
    console.log('🚀 Starting app status check...');
    const results = await runAppStatusCheck(options);
    
    // Exit with proper code based on status
    if (results.status === 'critical') {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error running app status check:', error);
    process.exit(1);
  }
}

main();
