// App Status Monitor
// This script continuously monitors the app status at specified intervals

import { monitorAppStatus } from './app-status.js';

// Get interval from command line argument, default to 60 minutes
const args = process.argv.slice(2);
const intervalMinutes = args.length > 0 ? parseInt(args[0], 10) : 60;

if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
  console.error('Error: Interval must be a positive number in minutes');
  process.exit(1);
}

console.log(`Starting app status monitoring with ${intervalMinutes} minute intervals`);
monitorAppStatus(intervalMinutes).catch(error => {
  console.error('Error in app status monitoring:', error);
  process.exit(1);
});


/**
 * Extract status message from the status output
 */
function extractStatusMessage(output) {
  // Try to find the status message line
  const messageMatch = output.match(/Message: (.+)/);
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].trim();
  }

  // Fallback status messages based on overall status
  if (output.includes('ALL SYSTEMS OPERATIONAL')) {
    return 'All systems operational';
  } else if (output.includes('WARNINGS DETECTED')) {
    return 'Application is running but experiencing issues';
  } else if (output.includes('CRITICAL ISSUES DETECTED')) {
    return 'Application is offline or severely degraded';
  }

  return 'Status check completed';
}

//This is required for the original CommonJS export to work correctly.
module.exports = { monitorAppStatus, extractStatusMessage };