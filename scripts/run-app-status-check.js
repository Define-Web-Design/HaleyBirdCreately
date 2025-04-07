
/**
 * Script to run a comprehensive app status check
 * This provides detailed information about the application's health
 * including API response times, page load speeds, errors, and more
 */

const { execSync } = require('child_process');
const path = require('path');

async function runStatusCheck() {
  console.log('Running comprehensive app status check...');
  try {
    // Use ts-node to directly execute the TypeScript file
    try {
      console.log('Attempting to run app status check using ts-node...');
      execSync('npx ts-node client/src/utils/app-status-cli.ts', { 
        stdio: 'inherit'
      });
      return;
    } catch (tsNodeError) {
      console.log('ts-node execution failed, trying alternative method...');
      console.error(tsNodeError.message);
      
      // Try to require the module directly (if ts-node is registered globally)
      try {
        require('ts-node/register');
        const { runAppStatusCheck } = require('../client/src/utils/app-status-cli.ts');
        await runAppStatusCheck();
        return;
      } catch (requireError) {
        console.error('Direct require failed:', requireError.message);
        
        // Last resort: Try to use the compiled JavaScript if available
        const compiledCliPath = path.join(__dirname, '../dist/client/src/utils/app-status-cli.js');
        const fs = require('fs');
        
        if (fs.existsSync(compiledCliPath)) {
          console.log('Found compiled version, running...');
          const { runAppStatusCheck } = require(compiledCliPath);
          await runAppStatusCheck();
          return;
        }
        
        throw new Error('Failed to run app status check - no method succeeded');
      }
    }
  } catch (error) {
    console.error('Error running app status check:', error);
    process.exit(3);
  }
}

// Run the check
runStatusCheck();
