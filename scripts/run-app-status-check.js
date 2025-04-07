#!/usr/bin/env node

import { runAppStatusCheck } from './app-status.js';

// Run the app status check with default options
runAppStatusCheck()
  .then(statusReport => {
    // Status report is already logged in the function
    if (statusReport.status === 'error') {
      process.exit(1);
    } else if (statusReport.status === 'healthy'){
        process.exit(0);
    } else {
        process.exit(1); // Handle other non-healthy statuses
    }
  })
  .catch(error => {
    console.error('Error running app status check:', error);
    process.exit(1);
  });