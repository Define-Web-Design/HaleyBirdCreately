/**
 * keep-app-running.js
 * 
 * This script is used to keep the application running in a Replit environment.
 * It monitors the server process and restarts it if it crashes or stops unexpectedly.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const MAX_RESTARTS = 10; // Maximum number of restart attempts in a given time window
const RESTART_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
const RESTART_DELAY = 5000; // 5 seconds between restart attempts
const LOG_FILE = path.join(process.cwd(), 'logs', 'restart.log');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// State tracking
let restartAttempts = 0;
let restartWindowStart = Date.now();
let serverProcess = null;

/**
 * Log messages to console and file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

/**
 * Check if we should attempt a restart based on recent restart history
 */
function shouldAttemptRestart() {
  const now = Date.now();
  const elapsedTime = now - restartWindowStart;
  
  // Reset counter if window has elapsed
  if (elapsedTime > RESTART_WINDOW) {
    restartAttempts = 0;
    restartWindowStart = now;
    log('Restart window elapsed, resetting counter');
    return true;
  }
  
  // Check if we're under the maximum restart attempts
  if (restartAttempts < MAX_RESTARTS) {
    return true;
  }
  
  log(`Maximum restart attempts (${MAX_RESTARTS}) reached within window. Waiting for window to reset.`);
  return false;
}

/**
 * Start the server process
 */
function startServer() {
  log('Starting server process...');
  
  // Use the npm run dev command to start the server
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process exit
  serverProcess.on('exit', (code, signal) => {
    if (code === 0) {
      log('Server process exited cleanly with code 0');
      process.exit(0);
    } else {
      log(`Server process crashed with code ${code}, signal: ${signal}`);
      handleServerCrash();
    }
  });
  
  // Handle process errors
  serverProcess.on('error', (err) => {
    log(`Server process error: ${err.message}`);
    handleServerCrash();
  });
  
  log('Server process started');
}

/**
 * Handle server crash by attempting restart if possible
 */
function handleServerCrash() {
  restartAttempts++;
  
  if (shouldAttemptRestart()) {
    log(`Attempting restart in ${RESTART_DELAY/1000} seconds (attempt ${restartAttempts} of ${MAX_RESTARTS})`);
    
    setTimeout(() => {
      startServer();
    }, RESTART_DELAY);
  } else {
    log('Not attempting restart due to too many recent failures');
    process.exit(1);
  }
}

// Register process signal handlers
process.on('SIGINT', () => {
  log('Received SIGINT signal, shutting down...');
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal, shutting down...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Uncaught exception handler to prevent crashes
process.on('uncaughtException', (err) => {
  log(`Uncaught exception in monitor process: ${err.message}`);
  log(err.stack);
});

// Start the server initially
log('Application monitor started');
startServer();