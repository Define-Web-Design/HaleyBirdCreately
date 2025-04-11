/**
 * Simple and Reliable CommonJS Keep-Alive Script for Replit
 * 
 * This script is designed to be highly compatible with Replit's environment
 * using CommonJS modules for maximum reliability. It pings your application
 * at regular intervals to prevent it from going to sleep.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  APP_PORT: 3001, // Vite's default port is 3001 in Replit
  CHECK_INTERVAL: 55 * 1000, // 55 seconds
  DASHBOARD_PORT: 3334, // Use a different port to avoid conflicts
  LOG_FILE: path.join(process.cwd(), 'logs', 'never-sleep.log'),
  LOG_LEVEL: 'info' // debug, info, warn, error
};

// Ensure logs directory exists
const logsDir = path.dirname(CONFIG.LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Runtime variables
const startTime = Date.now();
let pingCount = 0;
let successCount = 0;
let failCount = 0;
let lastPingSuccess = false;
let lastPingTime = null;

/**
 * Log a message to console and file
 * @param {string} message - The message to log
 * @param {string} level - Log level (debug, info, warn, error)
 */
function log(message, level = 'info') {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  if (levels[level] < levels[CONFIG.LOG_LEVEL]) return;
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
}

/**
 * Ping the application to keep it alive
 */
function pingApplication() {
  pingCount++;
  lastPingTime = Date.now();
  
  const options = {
    hostname: 'localhost',
    port: CONFIG.APP_PORT,
    path: '/',
    method: 'GET',
    timeout: 10000 // 10 second timeout
  };
  
  log(`Pinging application (${pingCount})...`, 'debug');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      successCount++;
      lastPingSuccess = true;
      log(`Ping successful: ${res.statusCode}`, 'debug');
    });
  });
  
  req.on('error', (error) => {
    failCount++;
    lastPingSuccess = false;
    log(`Ping failed: ${error.message}`, 'warn');
  });
  
  req.on('timeout', () => {
    req.destroy();
    failCount++;
    lastPingSuccess = false;
    log('Ping timed out', 'warn');
  });
  
  req.end();
}

/**
 * Generate a simple status page
 * @returns {string} HTML for status page
 */
function generateStatusPage() {
  const uptime = formatUptime(Date.now() - startTime);
  const successRate = pingCount > 0 ? ((successCount / pingCount) * 100).toFixed(2) : 'N/A';
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Replit Keep-Alive Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #2563eb;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
      }
      .card {
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .stat {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #e5e7eb;
        padding: 8px 0;
      }
      .stat:last-child {
        border-bottom: none;
      }
      .success { color: #16a34a; }
      .warning { color: #ca8a04; }
      .error { color: #dc2626; }
      .refresh-btn {
        background-color: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .refresh-btn:hover {
        background-color: #1d4ed8;
      }
      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
      .status-online {
        background-color: #16a34a;
      }
      .status-offline {
        background-color: #dc2626;
      }
    </style>
  </head>
  <body>
    <h1>Replit Keep-Alive Dashboard</h1>
    
    <div class="card">
      <h2>System Status</h2>
      <div class="stat">
        <span>Keep-Alive Status:</span>
        <span>
          <span class="status-indicator status-online"></span>
          <strong class="success">Running</strong>
        </span>
      </div>
      <div class="stat">
        <span>Application Status:</span>
        <span>
          <span class="status-indicator ${lastPingSuccess ? 'status-online' : 'status-offline'}"></span>
          <strong class="${lastPingSuccess ? 'success' : 'error'}">${lastPingSuccess ? 'Online' : 'Offline'}</strong>
        </span>
      </div>
      <div class="stat">
        <span>Uptime:</span>
        <strong>${uptime}</strong>
      </div>
      <div class="stat">
        <span>Started At:</span>
        <span>${new Date(startTime).toLocaleString()}</span>
      </div>
    </div>
    
    <div class="card">
      <h2>Ping Statistics</h2>
      <div class="stat">
        <span>Total Pings:</span>
        <strong>${pingCount}</strong>
      </div>
      <div class="stat">
        <span>Successful:</span>
        <strong class="success">${successCount}</strong>
      </div>
      <div class="stat">
        <span>Failed:</span>
        <strong class="${failCount > 0 ? 'error' : ''}">${failCount}</strong>
      </div>
      <div class="stat">
        <span>Success Rate:</span>
        <strong>${successRate}%</strong>
      </div>
      <div class="stat">
        <span>Last Ping:</span>
        <span>${lastPingTime ? new Date(lastPingTime).toLocaleString() : 'N/A'}</span>
      </div>
      <div class="stat">
        <span>Last Ping Status:</span>
        <strong class="${lastPingSuccess ? 'success' : 'error'}">${lastPingSuccess ? 'Success' : 'Failed'}</strong>
      </div>
    </div>
    
    <button class="refresh-btn" onclick="location.reload()">Refresh Dashboard</button>
    
    <script>
      // Auto refresh the page every 60 seconds
      setTimeout(() => {
        location.reload();
      }, 60000);
    </script>
  </body>
  </html>
  `;
}

/**
 * Format uptime in a human-readable format
 * @param {number} ms - Uptime in milliseconds
 * @returns {string} Formatted uptime
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Start the dashboard server
 */
function startDashboard() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateStatusPage());
  });
  
  server.listen(CONFIG.DASHBOARD_PORT, () => {
    log(`Dashboard available at: http://localhost:${CONFIG.DASHBOARD_PORT}/`, 'info');
  });
  
  server.on('error', (err) => {
    log(`Dashboard server error: ${err.message}`, 'error');
  });
}

// Initialize the keep-alive system
function initialize() {
  log('=== Replit Keep-Alive System Starting ===', 'info');
  log(`Application port: ${CONFIG.APP_PORT}`, 'info');
  log(`Check interval: ${CONFIG.CHECK_INTERVAL}ms`, 'info');
  
  // Start dashboard
  startDashboard();
  
  // Initial ping
  pingApplication();
  
  // Schedule regular pings
  setInterval(pingApplication, CONFIG.CHECK_INTERVAL);
  
  // Register process termination handlers
  process.on('SIGINT', () => {
    log('Received SIGINT. Keep-alive system shutting down.', 'info');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM. Keep-alive system shutting down.', 'info');
    process.exit(0);
  });
}

// Start the keep-alive system
initialize();