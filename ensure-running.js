/**
 * This script ensures the application stays running consistently
 * It will monitor the application and restart it if it crashes
 */

const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const APP_PORT = 5000;
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_COOL_DOWN = 60000; // 1 minute

// State
let restartAttempts = 0;
let lastRestartTime = 0;
let appProcess = null;

// Create a log file
const logStream = fs.createWriteStream(path.join(__dirname, 'app-monitor.log'), { flags: 'a' });

// Helper to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

// Start the application
function startApplication() {
  log('Starting application...');
  
  // Kill any existing npm run dev processes
  exec('pkill -f "npm run dev" || true', () => {
    // Start a new process
    appProcess = spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: 'inherit'
    });
    
    appProcess.on('error', (err) => {
      log(`Failed to start application: ${err.message}`);
    });
    
    appProcess.on('exit', (code, signal) => {
      log(`Application process exited with code ${code} and signal ${signal}`);
      appProcess = null;
      checkAndRestartIfNeeded();
    });
    
    log(`Application started with PID: ${appProcess.pid}`);
  });
}

// Check if the application is running
function checkApplicationStatus() {
  log('Checking application status...');
  
  if (!appProcess) {
    log('Application process is not running');
    return false;
  }
  
  // Check if the process is responding
  const req = http.get(`http://localhost:${APP_PORT}`, (res) => {
    if (res.statusCode === 200) {
      log(`Application is running (status code: ${res.statusCode})`);
      restartAttempts = 0; // Reset restart attempts on success
    } else {
      log(`Application returned non-200 status code: ${res.statusCode}`);
      return false;
    }
    
    // Consume response data to free up memory
    res.resume();
    return true;
  });
  
  req.on('error', (e) => {
    log(`Application check failed: ${e.message}`);
    return false;
  });
  
  // Set a timeout for the request
  req.setTimeout(5000, () => {
    req.abort();
    log('Application check timed out');
    return false;
  });
  
  return true;
}

// Check and restart the application if needed
function checkAndRestartIfNeeded() {
  const now = Date.now();
  
  // If we've restarted too many times recently, wait
  if (restartAttempts >= MAX_RESTART_ATTEMPTS && (now - lastRestartTime) < RESTART_COOL_DOWN) {
    log(`Too many restart attempts (${restartAttempts}). Cooling down before next attempt.`);
    setTimeout(checkAndRestartIfNeeded, RESTART_COOL_DOWN);
    return;
  }
  
  // Check if the application is running, restart if not
  if (!checkApplicationStatus()) {
    log('Application is not responding or not running, attempting to restart...');
    
    if (appProcess) {
      // Try to kill the existing process
      try {
        process.kill(appProcess.pid);
      } catch (e) {
        log(`Failed to kill process: ${e.message}`);
      }
      appProcess = null;
    }
    
    // Increment restart attempts
    restartAttempts++;
    lastRestartTime = now;
    
    // Start the application again
    startApplication();
  }
}

// Initial startup
startApplication();

// Set up interval for regular checks
setInterval(checkAndRestartIfNeeded, CHECK_INTERVAL);

// Create a small HTTP server to handle manual restart requests
const server = http.createServer((req, res) => {
  if (req.url === '/restart') {
    log('Manual restart requested');
    checkAndRestartIfNeeded();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Application restart initiated');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Application monitor is running');
  }
});

server.listen(3999, () => {
  log('Application monitor server running on port 3999');
  log('Visit /restart to manually restart the application');
});

// Handle process termination
process.on('SIGINT', () => {
  log('Monitor process interrupted, shutting down...');
  if (appProcess) {
    process.kill(appProcess.pid);
  }
  process.exit(0);
});

log('Application monitor started successfully');