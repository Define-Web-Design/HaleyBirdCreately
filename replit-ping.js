/**
 * Replit Simple Keep-Alive Script (CommonJS Version)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFile = path.join(logsDir, 'keep-alive.log');

// Simple logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Console output
  console.log(message);
  
  // Append to log file
  fs.appendFileSync(logFile, logMessage);
}

// Statistics
const stats = {
  startTime: Date.now(),
  pingCount: 0,
  successCount: 0,
  failCount: 0
};

// Get Replit app URL
function getAppUrl() {
  // Try to build it from environment variables
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  
  // Fall back to localhost on the most common port
  return 'http://localhost:3000';
}

// Ping function
function pingApp() {
  const appUrl = getAppUrl();
  const httpModule = appUrl.startsWith('https') ? https : http;
  
  stats.pingCount++;
  log(`Ping #${stats.pingCount}: ${appUrl}`);
  
  // Make GET request
  const req = httpModule.get(appUrl, (res) => {
    // Consume the data
    res.on('data', () => {});
    
    if (res.statusCode >= 200 && res.statusCode < 500) {
      stats.successCount++;
      log(`Ping successful (status: ${res.statusCode})`);
    } else {
      stats.failCount++;
      log(`Ping returned non-success status: ${res.statusCode}`);
    }
  });
  
  req.on('error', (err) => {
    stats.failCount++;
    log(`Ping failed: ${err.message}`);
  });
  
  // Set timeout
  req.setTimeout(10000, () => {
    req.destroy();
    stats.failCount++;
    log('Ping timed out after 10 seconds');
  });
  
  // Schedule next ping (4 minutes)
  setTimeout(pingApp, 4 * 60 * 1000);
}

// Simple dashboard server
function startDashboard() {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      // Calculate uptime
      const uptime = Date.now() - stats.startTime;
      const hours = Math.floor(uptime / (1000 * 60 * 60));
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Creately Keep-Alive</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
            h1 { color: #F2994A; }
            .card { background: #f8f8f8; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
            .stat { display: flex; justify-content: space-between; padding: 0.5rem 0; }
          </style>
        </head>
        <body>
          <h1>Creately Keep-Alive</h1>
          <div class="card">
            <div class="stat"><span>Status:</span><span>Active</span></div>
            <div class="stat"><span>Uptime:</span><span>${hours}h ${minutes}m</span></div>
            <div class="stat"><span>Total pings:</span><span>${stats.pingCount}</span></div>
            <div class="stat"><span>Successful:</span><span>${stats.successCount}</span></div>
            <div class="stat"><span>Failed:</span><span>${stats.failCount}</span></div>
            <div class="stat"><span>App URL:</span><span>${getAppUrl()}</span></div>
          </div>
          <button onclick="location.reload()">Refresh</button>
        </body>
        </html>
      `);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  
  // Try ports starting from 3333
  let port = 3333;
  
  function tryListen(p) {
    server.once('error', err => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${p} is busy, trying ${p + 1}`);
        tryListen(p + 1);
      }
    });
    
    server.listen(p, '0.0.0.0', () => {
      log(`Keep-alive dashboard running on http://localhost:${p}/`);
    });
  }
  
  tryListen(port);
}

// Main function
function main() {
  log('===== Creately Keep-Alive Starting =====');
  
  // Start dashboard
  startDashboard();
  
  // Start pinging after 5 seconds
  setTimeout(pingApp, 5000);
  
  // Handle termination
  process.on('SIGINT', () => {
    log('Keep-alive system shutting down');
    process.exit(0);
  });
}

// Start everything
main();