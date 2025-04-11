/**
 * Advanced Application Monitoring System
 * 
 * This script provides enterprise-grade monitoring and automatic recovery
 * for applications running in Replit environments
 */

const http = require('http');
const https = require('https');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Configuration
const CONFIG = {
  APPLICATION: {
    PORT: 5000,
    NAME: 'Creately',
    CHECK_INTERVAL_MS: 20000,  // Check every 20 seconds
    HEALTH_TIMEOUT_MS: 5000,   // Health check timeout
    RESTART_COOLDOWN_MS: 30000 // Minimum time between restarts
  },
  MONITOR: {
    PORT: 3999,
    LOG_FILE: path.join(process.cwd(), 'logs', 'app-monitor.log'),
    ERROR_LOG_FILE: path.join(process.cwd(), 'logs', 'app-monitor-errors.log'),
    MAX_LOG_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  },
  RECOVERY: {
    MAX_CONSECUTIVE_FAILURES: 5,
    RECOVERY_STRATEGY: 'progressive', // simple, aggressive, progressive
    NOTIFICATIONS_ENABLED: true
  }
};

// State tracking
const STATE = {
  isApplicationRunning: false,
  applicationProcess: null,
  lastRestartTime: 0,
  consecutiveFailures: 0,
  totalRestarts: 0,
  lastHealthyTime: 0,
  monitorStartTime: Date.now()
};

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(CONFIG.MONITOR.LOG_FILE))) {
  fs.mkdirSync(path.dirname(CONFIG.MONITOR.LOG_FILE), { recursive: true });
}

// Setup logging
let logStream = fs.createWriteStream(CONFIG.MONITOR.LOG_FILE, { flags: 'a' });
let errorLogStream = fs.createWriteStream(CONFIG.MONITOR.ERROR_LOG_FILE, { flags: 'a' });

// Utility functions
const execPromise = promisify(exec);

/**
 * Enhanced logging with timestamps and log rotation
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  // Log to console
  if (level === 'ERROR') {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
  
  // Log to file
  const stream = level === 'ERROR' ? errorLogStream : logStream;
  stream.write(formattedMessage + '\n');
  
  // Handle log rotation
  try {
    const stats = fs.statSync(level === 'ERROR' ? CONFIG.MONITOR.ERROR_LOG_FILE : CONFIG.MONITOR.LOG_FILE);
    if (stats.size > CONFIG.MONITOR.MAX_LOG_SIZE_BYTES) {
      rotateLogFile(level === 'ERROR' ? CONFIG.MONITOR.ERROR_LOG_FILE : CONFIG.MONITOR.LOG_FILE);
    }
  } catch (err) {
    console.error(`Failed to check log file size: ${err.message}`);
  }
}

/**
 * Rotate log files when they get too large
 */
function rotateLogFile(logFile) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const rotatedLogFile = logFile + '.' + timestamp;
  
  try {
    // Close the current write stream
    const stream = logFile === CONFIG.MONITOR.ERROR_LOG_FILE ? errorLogStream : logStream;
    stream.end();
    
    // Rename the current log file
    fs.renameSync(logFile, rotatedLogFile);
    
    // Create a new write stream
    if (logFile === CONFIG.MONITOR.ERROR_LOG_FILE) {
      errorLogStream = fs.createWriteStream(logFile, { flags: 'a' });
    } else {
      logStream = fs.createWriteStream(logFile, { flags: 'a' });
    }
    
    log(`Log file rotated to ${rotatedLogFile}`, 'INFO');
  } catch (err) {
    console.error(`Failed to rotate log file: ${err.message}`);
  }
}

/**
 * Check if a process is running by its PID
 */
async function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if any npm run dev process is running
 */
async function findRunningAppProcess() {
  try {
    const { stdout } = await execPromise('ps aux | grep "npm run dev" | grep -v grep');
    const lines = stdout.trim().split('\n');
    if (lines.length > 0 && lines[0]) {
      const parts = lines[0].trim().split(/\s+/);
      if (parts.length > 1) {
        return parseInt(parts[1], 10); // PID is usually the second field
      }
    }
    return null;
  } catch (error) {
    return null; // No process found
  }
}

/**
 * Check application health by making an HTTP request
 */
async function checkApplicationHealth() {
  return new Promise((resolve) => {
    log(`Checking application health on port ${CONFIG.APPLICATION.PORT}...`);
    
    const req = http.request({
      hostname: 'localhost',
      port: CONFIG.APPLICATION.PORT,
      path: '/',
      method: 'GET',
      timeout: CONFIG.APPLICATION.HEALTH_TIMEOUT_MS
    }, (res) => {
      log(`Application responded with status code: ${res.statusCode}`);
      
      // Any response is good for now, even if it's not 200
      // We're just checking if the server is running
      if (res.statusCode) {
        STATE.lastHealthyTime = Date.now();
        STATE.consecutiveFailures = 0;
        resolve(true);
      } else {
        STATE.consecutiveFailures++;
        resolve(false);
      }
      
      // Consume response data to free up memory
      res.resume();
    });
    
    req.on('error', (error) => {
      log(`Health check failed: ${error.message}`, 'ERROR');
      STATE.consecutiveFailures++;
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('Health check timed out', 'WARNING');
      req.destroy();
      STATE.consecutiveFailures++;
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Kill all potentially conflicting processes
 */
async function killConflictingProcesses() {
  try {
    log('Killing any conflicting processes...');
    await execPromise('pkill -f "npm run dev" || true');
    await execPromise('pkill -f "node server/index.js" || true');
    await execPromise('pkill -f "tsx server/index.ts" || true');
    log('Conflicting processes killed successfully');
    return true;
  } catch (error) {
    log(`Failed to kill conflicting processes: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Start the application process
 */
async function startApplication() {
  log('Starting application...');
  
  // First, kill any existing processes
  await killConflictingProcesses();
  
  // Start the application with npm run dev
  try {
    STATE.applicationProcess = spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: 'inherit'
    });
    
    STATE.applicationProcess.on('error', (error) => {
      log(`Failed to start application: ${error.message}`, 'ERROR');
      STATE.isApplicationRunning = false;
    });
    
    STATE.applicationProcess.on('exit', (code, signal) => {
      log(`Application process exited with code ${code} and signal ${signal}`, 'WARNING');
      STATE.isApplicationRunning = false;
      STATE.applicationProcess = null;
    });
    
    log(`Application started with PID: ${STATE.applicationProcess.pid}`);
    STATE.isApplicationRunning = true;
    STATE.lastRestartTime = Date.now();
    STATE.totalRestarts++;
    
    // Give the application some time to start up
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 5000);
    });
  } catch (error) {
    log(`Failed to start application: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Determine if application needs to be restarted
 */
async function assessApplicationStatus() {
  log('Assessing application status...');
  
  // First, check if our tracked process is running
  if (STATE.applicationProcess && STATE.applicationProcess.pid) {
    const processRunning = await isProcessRunning(STATE.applicationProcess.pid);
    if (!processRunning) {
      log('Tracked application process is no longer running', 'WARNING');
      STATE.isApplicationRunning = false;
      STATE.applicationProcess = null;
    }
  }
  
  // If we don't have a tracked process, check if any relevant process is running
  if (!STATE.applicationProcess) {
    const runningPid = await findRunningAppProcess();
    if (runningPid) {
      log(`Found running application process with PID: ${runningPid}`);
      STATE.isApplicationRunning = true;
      // We don't set STATE.applicationProcess here because we didn't spawn it
    } else {
      log('No application process found running', 'WARNING');
      STATE.isApplicationRunning = false;
    }
  }
  
  // Check application health
  const isHealthy = await checkApplicationHealth();
  
  // Determine if restart is needed
  const needsRestart = !isHealthy || !STATE.isApplicationRunning;
  const canRestartNow = (Date.now() - STATE.lastRestartTime) > CONFIG.APPLICATION.RESTART_COOLDOWN_MS;
  
  if (needsRestart && canRestartNow) {
    log(`Application needs restart. Healthy: ${isHealthy}, Running: ${STATE.isApplicationRunning}`);
    return true;
  } else if (needsRestart) {
    log(`Application needs restart but cooldown period active. Will retry in ${
      ((STATE.lastRestartTime + CONFIG.APPLICATION.RESTART_COOLDOWN_MS) - Date.now()) / 1000
    } seconds.`);
    return false;
  }
  
  log('Application is running properly');
  return false;
}

/**
 * Main monitoring loop
 */
async function monitorApplication() {
  try {
    const needsRestart = await assessApplicationStatus();
    
    if (needsRestart) {
      if (STATE.consecutiveFailures >= CONFIG.RECOVERY.MAX_CONSECUTIVE_FAILURES) {
        log(`Too many consecutive failures (${STATE.consecutiveFailures}). Performing aggressive recovery.`, 'WARNING');
        await performAggressiveRecovery();
      } else {
        await startApplication();
      }
    }
  } catch (error) {
    log(`Error in monitoring loop: ${error.message}`, 'ERROR');
  }
  
  // Schedule next check
  setTimeout(monitorApplication, CONFIG.APPLICATION.CHECK_INTERVAL_MS);
}

/**
 * More aggressive recovery for persistent failures
 */
async function performAggressiveRecovery() {
  log('Performing aggressive recovery...', 'WARNING');
  
  // Kill everything that might be interfering
  await killConflictingProcesses();
  
  // Clear any port that might be in use
  try {
    await execPromise(`fuser -k ${CONFIG.APPLICATION.PORT}/tcp || true`);
    log(`Cleared port ${CONFIG.APPLICATION.PORT}`);
  } catch (error) {
    log(`Failed to clear port: ${error.message}`, 'ERROR');
  }
  
  // Wait a bit longer before restarting
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Start the application again
  await startApplication();
  
  log('Aggressive recovery completed');
}

/**
 * Create an HTTP server for monitoring status and manual controls
 */
function createMonitorServer() {
  const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Handle different routes
    if (req.url === '/status') {
      // Return monitor status
      const status = {
        applicationRunning: STATE.isApplicationRunning,
        lastHealthyTime: new Date(STATE.lastHealthyTime).toISOString(),
        consecutiveFailures: STATE.consecutiveFailures,
        totalRestarts: STATE.totalRestarts,
        monitorUptime: Math.floor((Date.now() - STATE.monitorStartTime) / 1000),
        lastRestartTime: new Date(STATE.lastRestartTime).toISOString()
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status, null, 2));
    } else if (req.url === '/restart' && req.method === 'POST') {
      // Manual restart endpoint
      log('Manual restart requested');
      
      // Schedule a restart
      Promise.resolve()
        .then(() => killConflictingProcesses())
        .then(() => startApplication())
        .then(() => log('Manual restart completed'))
        .catch(error => log(`Manual restart failed: ${error.message}`, 'ERROR'));
      
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Restart initiated' }));
    } else if (req.url === '/logs' && req.method === 'GET') {
      // Return recent logs
      try {
        const logs = fs.readFileSync(CONFIG.MONITOR.LOG_FILE, 'utf8')
          .split('\n')
          .filter(Boolean)
          .slice(-100) // Last 100 lines
          .join('\n');
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(logs);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Failed to read logs: ${error.message}`);
      }
    } else {
      // Default monitor homepage
      const html = generateStatusPage();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    }
  });
  
  server.listen(CONFIG.MONITOR.PORT, () => {
    log(`Monitor server running on port ${CONFIG.MONITOR.PORT}`);
    log(`Visit http://localhost:${CONFIG.MONITOR.PORT} for status and controls`);
  });
}

/**
 * Generate an HTML status page
 */
function generateStatusPage() {
  const uptime = Math.floor((Date.now() - STATE.monitorStartTime) / 1000);
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.APPLICATION.NAME} Monitor</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #F2994A;
      border-bottom: 2px solid #F2994A;
      padding-bottom: 10px;
    }
    .status-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .status-healthy {
      background-color: #4CAF50;
    }
    .status-warning {
      background-color: #FF9800;
    }
    .status-error {
      background-color: #F44336;
    }
    .status-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      padding: 10px 0;
    }
    .status-label {
      font-weight: bold;
    }
    .action-button {
      background-color: #F2994A;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .action-button:hover {
      background-color: #e67e22;
    }
    .action-button:active {
      background-color: #d35400;
    }
    pre {
      background-color: #f1f1f1;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      font-size: 13px;
      max-height: 300px;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .tab.active {
      border: 1px solid #ddd;
      border-bottom: 1px solid white;
      border-radius: 4px 4px 0 0;
      margin-bottom: -1px;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .refresh-status {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>${CONFIG.APPLICATION.NAME} - Application Monitor</h1>
  
  <div class="tabs">
    <div class="tab active" data-tab="status">Status</div>
    <div class="tab" data-tab="logs">Logs</div>
    <div class="tab" data-tab="actions">Actions</div>
  </div>
  
  <div class="tab-content active" id="status-tab">
    <div class="status-card">
      <div class="status-row">
        <span class="status-label">Application Status:</span>
        <span>
          <span class="status-indicator ${STATE.isApplicationRunning ? 'status-healthy' : 'status-error'}"></span>
          ${STATE.isApplicationRunning ? 'Running' : 'Not Running'}
        </span>
      </div>
      <div class="status-row">
        <span class="status-label">Monitor Uptime:</span>
        <span>${uptimeStr}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Last Healthy Check:</span>
        <span>${new Date(STATE.lastHealthyTime).toLocaleString()}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Consecutive Failures:</span>
        <span>${STATE.consecutiveFailures}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Total Restarts:</span>
        <span>${STATE.totalRestarts}</span>
      </div>
      <div class="status-row">
        <span class="status-label">Last Restart:</span>
        <span>${new Date(STATE.lastRestartTime).toLocaleString()}</span>
      </div>
    </div>
    <p class="refresh-status">Auto-refreshing every 10 seconds. Last updated: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="tab-content" id="logs-tab">
    <h2>Recent Logs</h2>
    <pre id="logs-content">Loading logs...</pre>
    <button class="action-button" id="refresh-logs">Refresh Logs</button>
  </div>
  
  <div class="tab-content" id="actions-tab">
    <h2>Actions</h2>
    <p>Manually control the application:</p>
    <button class="action-button" id="restart-app">Restart Application</button>
    <div id="action-status" style="margin-top: 15px;"></div>
  </div>
  
  <script>
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
        
        if (tab.dataset.tab === 'logs') {
          fetchLogs();
        }
      });
    });
    
    // Auto-refresh status
    setInterval(() => {
      fetch('/status')
        .then(response => response.json())
        .then(data => {
          const indicator = document.querySelector('.status-indicator');
          if (data.applicationRunning) {
            indicator.className = 'status-indicator status-healthy';
            indicator.nextSibling.textContent = 'Running';
          } else {
            indicator.className = 'status-indicator status-error';
            indicator.nextSibling.textContent = 'Not Running';
          }
          
          document.querySelector('.refresh-status').textContent = 
            'Auto-refreshing every 10 seconds. Last updated: ' + new Date().toLocaleString();
            
          // Update all other status values
          const rows = document.querySelectorAll('.status-row');
          rows[2].querySelector('span:last-child').textContent = 
            new Date(data.lastHealthyTime).toLocaleString();
          rows[3].querySelector('span:last-child').textContent = 
            data.consecutiveFailures;
          rows[4].querySelector('span:last-child').textContent = 
            data.totalRestarts;
          rows[5].querySelector('span:last-child').textContent = 
            new Date(data.lastRestartTime).toLocaleString();
        })
        .catch(error => console.error('Error fetching status:', error));
    }, 10000);
    
    // Fetch logs
    function fetchLogs() {
      fetch('/logs')
        .then(response => response.text())
        .then(logs => {
          document.getElementById('logs-content').textContent = logs;
        })
        .catch(error => {
          document.getElementById('logs-content').textContent = 'Error fetching logs: ' + error.message;
        });
    }
    
    // Restart application
    document.getElementById('restart-app').addEventListener('click', () => {
      const actionStatus = document.getElementById('action-status');
      actionStatus.textContent = 'Restarting application...';
      
      fetch('/restart', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          actionStatus.textContent = data.message + ' - ' + new Date().toLocaleString();
        })
        .catch(error => {
          actionStatus.textContent = 'Error: ' + error.message;
        });
    });
    
    // Refresh logs button
    document.getElementById('refresh-logs').addEventListener('click', fetchLogs);
  </script>
</body>
</html>
`;
}

// Main function
async function main() {
  log(`Starting ${CONFIG.APPLICATION.NAME} Monitor...`);
  
  // Set up cleanup handlers
  process.on('SIGINT', async () => {
    log('Monitor shutting down...', 'WARNING');
    if (STATE.applicationProcess) {
      log('Cleaning up application process', 'WARNING');
      process.kill(STATE.applicationProcess.pid);
    }
    process.exit(0);
  });
  
  // Create the monitor server
  createMonitorServer();
  
  // Initial application check & start
  const runningPid = await findRunningAppProcess();
  if (runningPid) {
    log(`Found existing application running with PID: ${runningPid}`);
    STATE.isApplicationRunning = true;
    
    // Check if it's healthy
    const isHealthy = await checkApplicationHealth();
    if (!isHealthy) {
      log('Existing application is not healthy, restarting...', 'WARNING');
      await startApplication();
    }
  } else {
    log('No application running, starting it...');
    await startApplication();
  }
  
  // Start the monitoring loop
  monitorApplication();
}

// Start the monitor
main().catch(error => {
  log(`Failed to start monitor: ${error.message}`, 'ERROR');
  process.exit(1);
});