/**
 * replit-keep-alive.js
 * 
 * This script sends periodic pings to the Replit environment to prevent 
 * the application from going to sleep due to inactivity.
 * 
 * It creates an HTTP server that responds to health check requests,
 * and also sends a ping to itself every few minutes to keep the app active.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.KEEP_ALIVE_PORT || 3333;
const PING_INTERVAL = 5 * 60 * 1000; // Ping every 5 minutes
const LOG_FILE = path.join(process.cwd(), 'logs', 'keep-alive.log');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

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

// Create an HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/ping') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    
    log(`Received health check request from ${req.headers['user-agent'] || 'unknown agent'}`);
  } else {
    // Not found for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`Keep-alive server listening on port ${PORT}`);
});

// Self-ping function to keep the application alive
function pingServer() {
  log('Sending self-ping to keep application alive...');
  
  const req = http.request({
    hostname: 'localhost',
    port: PORT,
    path: '/ping',
    method: 'GET'
  }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        log('Self-ping successful');
      } else {
        log(`Self-ping failed with status code ${res.statusCode}`);
      }
    });
  });
  
  req.on('error', (error) => {
    log(`Self-ping error: ${error.message}`);
  });
  
  req.end();
}

// Set up interval for self-pinging
const pingInterval = setInterval(pingServer, PING_INTERVAL);
log(`Set up self-ping at ${PING_INTERVAL / 1000 / 60} minute intervals`);

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT signal, shutting down...');
  clearInterval(pingInterval);
  server.close(() => {
    log('Keep-alive server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal, shutting down...');
  clearInterval(pingInterval);
  server.close(() => {
    log('Keep-alive server closed');
    process.exit(0);
  });
});

// Initial ping to start the cycle
setTimeout(pingServer, 5000);

// Log startup
log('Keep-alive service started successfully');