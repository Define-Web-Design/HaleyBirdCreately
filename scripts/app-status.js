
/**
 * App Status Management
 * A unified approach to monitoring and reporting application status
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs/app-status');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Run a comprehensive app status check
 */
async function runAppStatusCheck() {
  console.log('Starting application status check...');
  
  // Run the app status CLI tool
  const statusProcess = spawn('node', [
    '-e',
    "require('./client/src/utils/app-status-cli.ts').runAppStatusCheck()"
  ]);
  
  let output = '';
  
  statusProcess.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    process.stdout.write(chunk);
  });
  
  statusProcess.stderr.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    process.stderr.write(chunk);
  });
  
  return new Promise((resolve, reject) => {
    statusProcess.on('close', (code) => {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(logsDir, `status-check-${timestamp}.log`);
      
      fs.writeFileSync(logFile, output);
      console.log(`Status check log saved to ${logFile}`);
      
      if (code === 0) {
        resolve({ success: true, logFile });
      } else {
        resolve({ success: false, logFile, exitCode: code });
      }
    });
    
    statusProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Monitor app status at regular intervals
 */
async function monitorAppStatus(intervalMinutes = 60) {
  console.log(`Starting app status monitoring (interval: ${intervalMinutes} minutes)...`);
  
  // Run initial check
  await runAppStatusCheck();
  
  // Schedule regular checks
  const intervalMs = intervalMinutes * 60 * 1000;
  
  setInterval(async () => {
    console.log(`\nRunning scheduled app status check (${new Date().toISOString()})...`);
    await runAppStatusCheck();
  }, intervalMs);
}

/**
 * Handle command line arguments
 */
function handleCommand() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      runAppStatusCheck().catch(err => {
        console.error('Error running app status check:', err);
        process.exit(1);
      });
      break;
      
    case 'monitor':
      const interval = parseInt(args[1], 10) || 60;
      monitorAppStatus(interval).catch(err => {
        console.error('Error starting app status monitor:', err);
        process.exit(1);
      });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  check               - Run a one-time status check');
      console.log('  monitor [interval]  - Start monitoring (interval in minutes, default: 60)');
      process.exit(0);
  }
}

// If script is run directly, handle command line
if (require.main === module) {
  handleCommand();
}

module.exports = {
  runAppStatusCheck,
  monitorAppStatus
};
