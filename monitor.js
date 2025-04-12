
/**
 * Application Monitoring Script
 * 
 * This script checks if the server is running and restarts it if needed.
 * It also logs the status for later review.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

// Configuration
const PORT = process.env.PORT || 3000;
const CHECK_INTERVAL = 55 * 1000; // Check every 55 seconds
const LOG_FILE = 'logs/monitor.log';
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure log directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

// Initialize stats
let stats = {
  startTime: new Date(),
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0,
  restarts: 0,
  lastRestart: null
};

/**
 * Write a log message to the log file
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} ${level}: ${message}\n`;
  
  // Check if log file is too large, rotate if needed
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
      const backupFile = `${LOG_FILE}.${Date.now()}.backup`;
      fs.renameSync(LOG_FILE, backupFile);
      console.log(`Log file rotated to ${backupFile}`);
    }
    
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(`${level}: ${message}`);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

/**
 * Check if the server is responding
 */
async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      host: '0.0.0.0',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000 // 5 second timeout
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(true);
        } else {
          log(`Server responded with status code ${response.statusCode}`, 'WARN');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`Error connecting to server: ${error.message}`, 'ERROR');
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      log('Connection to server timed out', 'WARN');
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Restart the server
 */
async function restartServer() {
  return new Promise((resolve) => {
    log('Attempting to restart server...', 'WARN');
    
    // First try to kill any existing process
    exec('pkill -f "node dist/index.js" || true', (error) => {
      if (error) {
        log(`Error killing existing process: ${error.message}`, 'ERROR');
      }
      
      // Then start the server script
      const startCommand = 'PORT=3000 NODE_ENV=production node dist/index.js';
      exec(startCommand, (error, stdout, stderr) => {
        if (error) {
          log(`Failed to restart server: ${error.message}`, 'ERROR');
          if (stderr) log(`Stderr: ${stderr}`, 'ERROR');
          resolve(false);
        } else {
          log('Server restarted successfully', 'INFO');
          stats.restarts++;
          stats.lastRestart = new Date();
          resolve(true);
        }
      });
    });
  });
}

/**
 * Main monitoring function
 */
async function monitor() {
  try {
    stats.totalChecks++;
    
    log('Checking server status...');
    const isRunning = await checkServer();
    
    if (isRunning) {
      log('Server is running normally');
      stats.successfulChecks++;
    } else {
      log('Server is not responding', 'WARN');
      stats.failedChecks++;
      
      // Attempt to restart
      await restartServer();
    }
  } catch (error) {
    log(`Monitoring error: ${error.message}`, 'ERROR');
  }
  
  // Schedule next check
  setTimeout(monitor, CHECK_INTERVAL);
}

/**
 * Print monitoring stats
 */
function printStats() {
  const uptime = Math.floor((new Date() - stats.startTime) / 1000 / 60);
  
  log(`--- Monitoring Stats ---`);
  log(`Uptime: ${uptime} minutes`);
  log(`Total checks: ${stats.totalChecks}`);
  log(`Successful checks: ${stats.successfulChecks}`);
  log(`Failed checks: ${stats.failedChecks}`);
  log(`Restarts: ${stats.restarts}`);
  
  if (stats.lastRestart) {
    const lastRestartMinutes = Math.floor((new Date() - stats.lastRestart) / 1000 / 60);
    log(`Last restart: ${lastRestartMinutes} minutes ago`);
  } else {
    log(`Last restart: Never`);
  }
  
  log(`-------------------------`);
  
  // Schedule next stats printout
  setTimeout(printStats, 60 * 60 * 1000); // Every hour
}

// Start the monitoring system
log('Starting application monitoring system');
setTimeout(monitor, 5000); // Start first check after 5 seconds
setTimeout(printStats, 60 * 60 * 1000); // Print stats every hour

// Log startup
log(`Monitoring started at ${stats.startTime.toISOString()}`);
log(`Checking server at 0.0.0.0:${PORT} every ${CHECK_INTERVAL/1000} seconds`);
