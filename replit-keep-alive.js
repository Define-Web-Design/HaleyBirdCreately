/**
 * Replit-Specific Keep-Alive System
 * 
 * This script is designed specifically for the Replit environment to prevent
 * your application from going to sleep due to inactivity.
 * 
 * Features:
 * - Simple HTTP ping mechanism
 * - Low resource usage
 * - Compatible with Replit's runtime constraints
 * - Automatic port detection
 */

// Core dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  pingInterval: 4 * 60 * 1000, // Ping every 4 minutes
  dashboardPort: process.env.DASHBOARD_PORT || 3333,
  logFile: path.join(__dirname, 'logs', 'keep-alive.log'),
  replitAppUrl: process.env.REPL_SLUG 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
    : null
};

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(CONFIG.logFile))) {
  fs.mkdirSync(path.dirname(CONFIG.logFile), { recursive: true });
}

// Initialize log file
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // Console output
  console.log(logMessage.trim());
  
  // Append to log file
  fs.appendFileSync(CONFIG.logFile, logMessage);
};

// Status tracking
const status = {
  startTime: Date.now(),
  lastPingTime: null,
  lastSuccessfulPing: null,
  pingCount: 0,
  failedPings: 0,
  consecutiveFailures: 0
};

// Generate a simple dashboard
const createDashboard = () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      const uptime = Date.now() - status.startTime;
      const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
      const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Creately Keep-Alive Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
            h1 { color: #F2994A; }
            .card { background: #f8f8f8; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .stat { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
            .success { color: green; }
            .warning { color: orange; }
            .error { color: red; }
            .refresh { margin-top: 1rem; }
          </style>
        </head>
        <body>
          <h1>Creately Keep-Alive Dashboard</h1>
          <div class="card">
            <h2>Status</h2>
            <div class="stat">
              <span>Status:</span>
              <span class="success">Running</span>
            </div>
            <div class="stat">
              <span>Uptime:</span>
              <span>${uptimeHours}h ${uptimeMinutes}m</span>
            </div>
            <div class="stat">
              <span>Started:</span>
              <span>${new Date(status.startTime).toLocaleString()}</span>
            </div>
          </div>
          <div class="card">
            <h2>Ping Statistics</h2>
            <div class="stat">
              <span>Total pings:</span>
              <span>${status.pingCount}</span>
            </div>
            <div class="stat">
              <span>Failed pings:</span>
              <span class="${status.failedPings > 0 ? 'warning' : 'success'}">${status.failedPings}</span>
            </div>
            <div class="stat">
              <span>Last ping:</span>
              <span>${status.lastPingTime ? new Date(status.lastPingTime).toLocaleString() : 'Never'}</span>
            </div>
            <div class="stat">
              <span>Last successful ping:</span>
              <span>${status.lastSuccessfulPing ? new Date(status.lastSuccessfulPing).toLocaleString() : 'Never'}</span>
            </div>
          </div>
          <div class="card">
            <h2>Configuration</h2>
            <div class="stat">
              <span>Ping interval:</span>
              <span>${CONFIG.pingInterval / 1000} seconds</span>
            </div>
            <div class="stat">
              <span>App URL:</span>
              <span>${CONFIG.replitAppUrl || 'Automatically detected'}</span>
            </div>
          </div>
          <button class="refresh" onclick="location.reload()">Refresh</button>
        </body>
        </html>
      `);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  // Try to start server on configured port, fall back to alternative if in use
  let currentPort = CONFIG.dashboardPort;
  
  const startServerOnPort = (port) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} in use, trying ${port + 1} instead`, 'WARN');
        startServerOnPort(port + 1);
      }
    });
    
    server.listen(port, '0.0.0.0', () => {
      log(`Dashboard available at: http://localhost:${port}/`, 'INFO');
      CONFIG.dashboardPort = port;
    });
  };
  
  startServerOnPort(currentPort);
  
  return server;
};

// Get Replit app URL if available
const detectAppUrl = () => {
  // If we already have a URL, use it
  if (CONFIG.replitAppUrl) return CONFIG.replitAppUrl;
  
  // Otherwise try to build it from environment variables
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    log(`App URL detected as: ${url}`);
    return url;
  }
  
  // Fall back to localhost on a common port
  return 'http://localhost:3000';
};

// Ping function to keep the app alive
const pingApp = () => {
  const appUrl = detectAppUrl();
  const httpModule = appUrl.startsWith('https') ? https : http;
  
  status.lastPingTime = Date.now();
  status.pingCount++;
  
  // Make a simple GET request to the app
  log(`Pinging application at ${appUrl}`);
  
  httpModule.get(appUrl, (res) => {
    // Read the data so the socket can close
    res.on('data', () => {});
    
    if (res.statusCode >= 200 && res.statusCode < 500) {
      log(`Ping successful (status: ${res.statusCode})`);
      status.lastSuccessfulPing = Date.now();
      status.consecutiveFailures = 0;
    } else {
      log(`Ping returned non-success status code: ${res.statusCode}`, 'WARN');
      status.failedPings++;
      status.consecutiveFailures++;
    }
  }).on('error', (err) => {
    log(`Ping failed: ${err.message}`, 'ERROR');
    status.failedPings++;
    status.consecutiveFailures++;
  });
  
  // Schedule next ping
  setTimeout(pingApp, CONFIG.pingInterval);
};

// Main function
const main = () => {
  // Print startup message
  log('===================================');
  log('Creately Keep-Alive System Starting');
  log('===================================');
  
  // Start dashboard server
  createDashboard();
  
  // Start pinging after a short delay
  setTimeout(() => {
    pingApp();
  }, 5000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down keep-alive system', 'INFO');
    process.exit(0);
  });
};

// Start the keep-alive system
main();