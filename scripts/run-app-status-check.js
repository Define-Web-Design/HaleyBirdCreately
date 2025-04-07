
/**
 * Script to run a comprehensive app status check
 * This provides detailed information about the application's health
 * including API response times, page load speeds, errors, and more
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runStatusCheck() {
  console.log('Running comprehensive app status check...');
  try {
    // Use ts-node to directly execute the TypeScript file
    try {
      console.log('Attempting to run app status check using ts-node...');
      execSync('npx ts-node client/src/utils/app-status-cli.ts', { 
        stdio: 'inherit'
      });
    } catch (tsNodeError) {
      // If ts-node execution fails with an exit code indicating app issues,
      // this is expected behavior - it's just reporting app problems
      if (tsNodeError.status === 1 || tsNodeError.status === 2) {
        console.log('App status check completed with warnings or errors');
        return;
      }
      
      console.log('ts-node execution failed with unexpected error, trying alternative method...');
      
      // Create a logs directory if it doesn't exist
      const logsDir = path.join(__dirname, '../logs/app-status');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Log the error
      const errorPath = path.join(logsDir, 'error.log');
      fs.appendFileSync(errorPath, `[${new Date().toISOString()}] Error running status check: ${tsNodeError.message}\n`);
      
      // Try running using node directly with ts-node/register
      try {
        execSync('node -r ts-node/register client/src/utils/app-status-cli.ts', {
          stdio: 'inherit'
        });
      } catch (nodeError) {
        // If this fails with status 1 or 2, it's just the app status report showing issues
        if (nodeError.status === 1 || nodeError.status === 2) {
          console.log('App status check completed with warnings or errors');
        } else {
          throw new Error(`Failed to run status check: ${nodeError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Error running app status check:', error);
    process.exit(3);
  }
}

// Run the status check when the script is executed directly
if (require.main === module) {
  runStatusCheck();
}

module.exports = { runStatusCheck };
