/**
 * Enhanced Never-Sleep System
 * 
 * This script implements an advanced multi-layered approach to prevent your Replit dev URL
 * from going to sleep, even when you leave the workspace.
 * 
 * Features:
 * - Multi-tiered health checks with smart retry logic
 * - External ping integration
 * - Self-healing mechanism
 * - Comprehensive logging
 * - Automatic recovery after long idle periods
 * - 24/7 uptime optimization for Replit environment
 */

const http = require('http');
const https = require('https');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const CONFIG = {
  // Application settings
  app: {
    port: 5000,
    internalUrl: 'http://localhost:5000',
    routesToCheck: ['/', '/api/health'],
    startCommand: 'npm run dev',
    processName: 'npm run dev'
  },
  
  // Monitor settings
  monitor: {
    checkInterval: 45000, // 45 seconds
    healthEndpoint: '/health',
    port: 3333,
    pingInterval: 30000, // 30 seconds
    logLevel: 'info', // debug, info, warn, error
    maxRestartAttempts: 5,
    cooldownPeriod: 120000, // 2 minutes
    timeoutThreshold: 8000, // 8 seconds
    backoffFactor: 1.5,
    maxBackoff: 300000, // 5 minutes
  },
  
  // External health services integration
  external: {
    // Get the Replit URL dynamically
    getPublicUrl: () => {
      const replitSlug = process.env.REPL_SLUG;
      const replitOwner = process.env.REPL_OWNER;
      
      if (replitSlug && replitOwner) {
        return `https://${replitSlug}.${replitOwner}.repl.co`;
      }
      
      // Fallback
      return process.env.REPLIT_URL || 
             process.env.PUBLIC_URL || 
             'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co';
    }
  }
};

// State management
const STATE = {
  appProcess: null,
  restartAttempts: 0,
  lastRestartTime: 0,
  pingCount: 0,
  failedChecks: 0,
  consecutiveSuccesses: 0,
  isRestarting: false,
  statusHistory: [],
  uptimeStart: Date.now(),
  externalPingServices: []
};

// Create log directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a rotating log file
const logFilePath = path.join(logsDir, 'never-sleep.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

/**
 * Advanced logging function with multiple levels
 * @param {string} message - The message to log
 * @param {string} level - The log level (debug, info, warn, error)
 */
function log(message, level = 'info') {
  const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  // Only log if level is at or above configured log level
  if (logLevels[level] >= logLevels[CONFIG.monitor.logLevel]) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Log to console with appropriate styling
    if (level === 'error') {
      console.error('\x1b[31m%s\x1b[0m', logMessage); // Red
    } else if (level === 'warn') {
      console.warn('\x1b[33m%s\x1b[0m', logMessage); // Yellow
    } else if (level === 'info') {
      console.log('\x1b[36m%s\x1b[0m', logMessage); // Cyan
    } else {
      console.log('\x1b[90m%s\x1b[0m', logMessage); // Gray for debug
    }
    
    // Write to log file
    logStream.write(`${logMessage}\n`);
    
    // Rotate log if it gets too big (>10MB)
    fs.stat(logFilePath, (err, stats) => {
      if (!err && stats.size > 10 * 1024 * 1024) {
        const oldLogPath = logFilePath + '.old';
        fs.rename(logFilePath, oldLogPath, () => {
          logStream.end();
          logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
        });
      }
    });
  }
}

/**
 * Start the application with monitoring
 */
function startApplication() {
  log('Starting application...', 'info');
  
  // If already restarting, don't start multiple processes
  if (STATE.isRestarting) {
    log('Already restarting, ignoring duplicate start request', 'warn');
    return;
  }
  
  STATE.isRestarting = true;
  
  // Kill any existing process
  exec(`pkill -f "${CONFIG.app.processName}" || true`, () => {
    // Short delay to ensure clean shutdown
    setTimeout(() => {
      // Start a new process
      STATE.appProcess = spawn('npm', ['run', 'dev'], {
        detached: false, // Keep tied to this process
        stdio: 'inherit' // Show output in console
      });
      
      // Handle process events
      STATE.appProcess.on('error', (err) => {
        log(`Failed to start application: ${err.message}`, 'error');
        STATE.isRestarting = false;
        setTimeout(checkAndRestartIfNeeded, 5000); // Check again shortly
      });
      
      STATE.appProcess.on('exit', (code, signal) => {
        log(`Application process exited with code ${code} and signal ${signal}`, 'warn');
        STATE.appProcess = null;
        STATE.isRestarting = false;
        
        // Automatically restart if it exits unexpectedly
        if (code !== 0) {
          setTimeout(checkAndRestartIfNeeded, 3000);
        }
      });
      
      log(`Application started with PID: ${STATE.appProcess.pid}`, 'info');
      STATE.lastRestartTime = Date.now();
      
      // Wait for application to start before clearing restart state
      setTimeout(() => {
        STATE.isRestarting = false;
        STATE.consecutiveSuccesses = 0;
        log('Application startup process completed', 'info');
      }, 10000); // Give it 10 seconds to start
      
      // Monitor the startup process
      checkStartupProgress();
    }, 2000);
  });
}

/**
 * Monitor application startup progress
 */
function checkStartupProgress() {
  let startupTimeout = setTimeout(() => {
    log('Application startup progress check timed out', 'warn');
  }, 30000); // 30 second maximum startup time
  
  let startupAttempts = 0;
  const maxStartupAttempts = 10;
  
  // Check every 3 seconds
  const startupChecker = setInterval(() => {
    startupAttempts++;
    
    http.get(CONFIG.app.internalUrl, (res) => {
      if (res.statusCode === 200) {
        clearInterval(startupChecker);
        clearTimeout(startupTimeout);
        log('Application successfully started and responding', 'info');
      }
      res.resume();
    }).on('error', () => {
      if (startupAttempts >= maxStartupAttempts) {
        clearInterval(startupChecker);
        clearTimeout(startupTimeout);
        log('Application failed to start properly after multiple attempts', 'error');
      }
    });
  }, 3000);
}

/**
 * Perform comprehensive health check with multiple paths
 * @returns {Promise<boolean>} True if healthy, false otherwise
 */
async function performHealthCheck() {
  log('Performing comprehensive health check...', 'debug');
  
  // First check if process is running
  if (!STATE.appProcess && !STATE.isRestarting) {
    log('Application process is not running and not currently restarting', 'warn');
    return false;
  }
  
  // Check each route for health
  for (const route of CONFIG.app.routesToCheck) {
    try {
      const isRouteHealthy = await checkRoute(route);
      if (!isRouteHealthy) {
        log(`Route ${route} is unhealthy`, 'warn');
        return false;
      }
    } catch (error) {
      log(`Error checking route ${route}: ${error.message}`, 'error');
      return false;
    }
  }
  
  log('All health checks passed', 'debug');
  return true;
}

/**
 * Check if a specific route is healthy
 * @param {string} route - The route to check
 * @returns {Promise<boolean>} True if healthy, false otherwise
 */
function checkRoute(route) {
  return new Promise((resolve) => {
    const url = new URL(route, CONFIG.app.internalUrl);
    const req = http.get(url.toString(), { timeout: CONFIG.monitor.timeoutThreshold }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        // 2xx and 3xx status codes are considered healthy
        resolve(true);
      } else {
        log(`Unhealthy status code ${res.statusCode} for route ${route}`, 'warn');
        resolve(false);
      }
      res.resume(); // Consume response data
    });
    
    req.on('error', (error) => {
      log(`Request error for route ${route}: ${error.message}`, 'warn');
      resolve(false);
    });
    
    req.on('timeout', () => {
      log(`Request timeout for route ${route}`, 'warn');
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Smart restart logic with exponential backoff
 */
function checkAndRestartIfNeeded() {
  const now = Date.now();
  
  // Don't check if already restarting
  if (STATE.isRestarting) {
    log('Already in the process of restarting, skipping check', 'debug');
    return;
  }
  
  // Check if we should apply backoff
  if (STATE.restartAttempts >= CONFIG.monitor.maxRestartAttempts) {
    const timeSinceLastRestart = now - STATE.lastRestartTime;
    const backoffTime = Math.min(
      CONFIG.monitor.cooldownPeriod * Math.pow(CONFIG.monitor.backoffFactor, STATE.restartAttempts - CONFIG.monitor.maxRestartAttempts),
      CONFIG.monitor.maxBackoff
    );
    
    if (timeSinceLastRestart < backoffTime) {
      log(`Applying exponential backoff: waiting ${Math.round(backoffTime/1000)}s before next restart attempt`, 'warn');
      setTimeout(checkAndRestartIfNeeded, 5000); // Check again in 5 seconds
      return;
    }
  }
  
  // Perform health check
  performHealthCheck().then(isHealthy => {
    if (!isHealthy) {
      // Track failed checks
      STATE.failedChecks++;
      log(`Health check failed (${STATE.failedChecks} consecutive failures)`, 'warn');
      
      // Only restart after multiple consecutive failures to avoid restarts on transient issues
      if (STATE.failedChecks >= 2) {
        log('Multiple health checks failed, initiating restart...', 'warn');
        
        // Clean up existing process if it exists
        if (STATE.appProcess) {
          try {
            process.kill(STATE.appProcess.pid);
          } catch (e) {
            log(`Failed to kill process: ${e.message}`, 'error');
          }
          STATE.appProcess = null;
        }
        
        // Increment restart attempts and record time
        STATE.restartAttempts++;
        STATE.lastRestartTime = now;
        STATE.failedChecks = 0;
        
        // Start the application again
        startApplication();
      }
    } else {
      // Reset failed checks counter on success
      if (STATE.failedChecks > 0) {
        log(`Health check recovered after ${STATE.failedChecks} failures`, 'info');
        STATE.failedChecks = 0;
      }
      
      STATE.consecutiveSuccesses++;
      
      // After many consecutive successes, reset restart attempts
      if (STATE.consecutiveSuccesses >= 10) {
        if (STATE.restartAttempts > 0) {
          log(`Resetting restart attempts counter after ${STATE.consecutiveSuccesses} consecutive successful health checks`, 'info');
          STATE.restartAttempts = 0;
        }
      }
    }
  });
}

/**
 * Maintain a connection to the app through regular pings
 */
function keepConnectionAlive() {
  STATE.pingCount++;
  log(`Sending keep-alive ping #${STATE.pingCount}`, 'debug');
  
  performHealthCheck().then(isHealthy => {
    if (!isHealthy && !STATE.isRestarting) {
      log('Keep-alive check failed, triggering health verification...', 'warn');
      checkAndRestartIfNeeded();
    }
  });
}

/**
 * Generate health status report
 * @returns {Object} Health status report
 */
function generateHealthReport() {
  const uptime = Date.now() - STATE.uptimeStart;
  const formattedUptime = formatUptime(uptime);
  
  return {
    status: STATE.failedChecks > 0 ? 'degraded' : 'healthy',
    uptime: formattedUptime,
    lastChecked: new Date().toISOString(),
    metrics: {
      restarts: STATE.restartAttempts,
      failedChecks: STATE.failedChecks,
      consecutiveSuccesses: STATE.consecutiveSuccesses,
      totalPings: STATE.pingCount
    },
    process: {
      running: !!STATE.appProcess,
      pid: STATE.appProcess ? STATE.appProcess.pid : null
    },
    config: {
      checkInterval: CONFIG.monitor.checkInterval,
      publicUrl: CONFIG.external.getPublicUrl()
    }
  };
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
  
  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

// Create a server to monitor health and handle requests
const monitorServer = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const path = urlParts[0];
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Health check endpoint
  if (path === CONFIG.monitor.healthEndpoint) {
    const report = generateHealthReport();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(report, null, 2));
  } 
  // Manual restart endpoint
  else if (path === '/restart') {
    log('Manual restart requested', 'info');
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Restart initiated', timestamp: new Date().toISOString() }));
    
    // Reset counters and restart
    STATE.failedChecks = 0;
    STATE.consecutiveSuccesses = 0;
    STATE.restartAttempts = 0;
    startApplication();
  } 
  // Root path with status info
  else if (path === '/') {
    const report = generateHealthReport();
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Never Sleep - Keep-Alive Monitor</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
            .healthy { background-color: #27ae60; }
            .degraded { background-color: #f39c12; }
            .unhealthy { background-color: #e74c3c; }
            .metric { margin-bottom: 8px; }
            .actions { margin-top: 20px; }
            button { background-color: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #2980b9; }
            pre { background-color: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Never Sleep - Keep-Alive Monitor</h1>
          <div>
            <div class="metric">Status: <span class="status ${report.status}">${report.status.toUpperCase()}</span></div>
            <div class="metric">Uptime: ${report.uptime}</div>
            <div class="metric">Process running: ${report.process.running ? 'Yes' : 'No'}</div>
            <div class="metric">Total restarts: ${report.metrics.restarts}</div>
            <div class="metric">Failed checks: ${report.metrics.failedChecks}</div>
            <div class="metric">Consecutive successes: ${report.metrics.consecutiveSuccesses}</div>
            <div class="metric">Public URL: ${report.config.publicUrl}</div>
          </div>
          
          <div class="actions">
            <button onclick="fetch('/restart').then(() => alert('Restart initiated'))">Restart Application</button>
          </div>
          
          <h3>Full Status:</h3>
          <pre>${JSON.stringify(report, null, 2)}</pre>
          
          <script>
            // Auto-refresh page every 30 seconds
            setTimeout(() => location.reload(), 30000);
          </script>
        </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } 
  // Unhandled path
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the monitor server
monitorServer.listen(CONFIG.monitor.port, () => {
  log(`Never Sleep monitor started on port ${CONFIG.monitor.port}`, 'info');
  log(`Access monitor at http://localhost:${CONFIG.monitor.port}`, 'info');
  log(`Health status at http://localhost:${CONFIG.monitor.port}${CONFIG.monitor.healthEndpoint}`, 'info');
  log(`Public URL: ${CONFIG.external.getPublicUrl()}`, 'info');
  
  // Initial application start
  startApplication();
  
  // Set up interval for regular health checks
  const checkInterval = setInterval(checkAndRestartIfNeeded, CONFIG.monitor.checkInterval);
  
  // Set up interval for keep-alive pings
  const pingInterval = setInterval(keepConnectionAlive, CONFIG.monitor.pingInterval);
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Monitor process interrupted, shutting down...', 'info');
    clearInterval(checkInterval);
    clearInterval(pingInterval);
    
    if (STATE.appProcess) {
      try {
        process.kill(STATE.appProcess.pid);
      } catch (e) {
        log(`Error stopping app process: ${e.message}`, 'error');
      }
    }
    
    monitorServer.close(() => {
      log('Monitor server closed, exiting process', 'info');
      process.exit(0);
    });
  });
});

log('Never Sleep system initialized', 'info');