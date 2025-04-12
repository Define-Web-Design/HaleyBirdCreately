
/**
 * Simple server monitoring script
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CHECK_INTERVAL = 60000; // Check every minute
const PORT = process.env.MONITOR_PORT || 3001;
const TARGET_URL = `http://0.0.0.0:${process.env.PORT || 3000}/api/health`;
const MAX_FAILURES = 3;
const LOG_FILE = path.join(__dirname, 'logs', 'monitor.log');
const SERVER_START_COMMAND = './run-app.sh';

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}

// Track failures
let consecutiveFailures = 0;

// Log message to console and file
function logMessage(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logEntry);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logEntry + '\n');
}

// Check server health
function checkServerHealth() {
  logMessage('Checking server health...');
  
  // Create a timeout for the request
  const timeout = setTimeout(() => {
    logMessage('Health check timeout - server not responding', 'ERROR');
    consecutiveFailures++;
    
    if (consecutiveFailures >= MAX_FAILURES) {
      logMessage(`${consecutiveFailures} consecutive failures detected. Threshold reached.`, 'WARNING');
      attemptServerRestart();
    }
  }, 5000); // 5 second timeout
  
  try {
    const req = http.get(TARGET_URL, (res) => {
      clearTimeout(timeout);
      
      if (res.statusCode === 200) {
        logMessage('Server is healthy', 'SUCCESS');
        consecutiveFailures = 0; // Reset counter on success
      } else {
        logMessage(`Server returned status code: ${res.statusCode}`, 'WARNING');
        consecutiveFailures++;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data) {
            const parsedData = JSON.parse(data);
            logMessage(`Health check response: ${JSON.stringify(parsedData)}`);
          }
        } catch (e) {
          logMessage(`Failed to parse response: ${data}`, 'ERROR');
        }
        
        // Check if we need to restart the server
        if (consecutiveFailures >= MAX_FAILURES) {
          logMessage(`${consecutiveFailures} consecutive failures detected. Threshold reached.`, 'WARNING');
          attemptServerRestart();
        }
      });
    });
    
    req.on('error', (err) => {
      clearTimeout(timeout);
      logMessage(`Health check failed: ${err.message}`, 'ERROR');
      consecutiveFailures++;
      
      // Check if we need to restart the server
      if (consecutiveFailures >= MAX_FAILURES) {
        logMessage(`${consecutiveFailures} consecutive failures detected. Threshold reached.`, 'WARNING');
        attemptServerRestart();
      }
    });
    
    // Set request timeout
    req.setTimeout(4000, () => {
      req.abort();
      logMessage('Request timed out', 'ERROR');
    });
    
  } catch (error) {
    clearTimeout(timeout);
    logMessage(`Error performing health check: ${error.message}`, 'ERROR');
    consecutiveFailures++;
  }
}

// Attempt to restart the server
function attemptServerRestart() {
  logMessage('Attempting to restart the main server...', 'WARNING');
  
  // Make sure the script is executable
  try {
    fs.chmodSync(SERVER_START_COMMAND, 0o755);
  } catch (err) {
    logMessage(`Failed to set execute permissions: ${err.message}`, 'ERROR');
  }
  
  // Check if the restart script exists
  if (!fs.existsSync(SERVER_START_COMMAND)) {
    logMessage(`Restart script not found: ${SERVER_START_COMMAND}`, 'ERROR');
    return;
  }
  
  logMessage(`Executing restart command: ${SERVER_START_COMMAND}`, 'INFO');
  
  // Use spawn instead of exec to get real-time output
  const child = exec(SERVER_START_COMMAND, {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    timeout: 60000 // 60 second timeout
  }, (error, stdout, stderr) => {
    if (error) {
      logMessage(`Failed to restart server: ${error.message}`, 'ERROR');
      return;
    }
    
    logMessage('Server restart completed', 'SUCCESS');
    
    // Reset the counter after restart attempt
    consecutiveFailures = 0;
  });
  
  child.stdout?.on('data', (data) => {
    logMessage(`Restart output: ${data.toString().trim()}`, 'INFO');
  });
  
  child.stderr?.on('data', (data) => {
    logMessage(`Restart error: ${data.toString().trim()}`, 'ERROR');
  });
}

// Start HTTP server for monitoring
const server = http.createServer((req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'running', 
      uptime: process.uptime(),
      lastCheck: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  logMessage(`Monitor server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  logMessage('Monitor shutting down...', 'INFO');
  server.close();
  process.exit(0);
});

// Start monitoring
logMessage('Monitor started');
setInterval(checkServerHealth, CHECK_INTERVAL);
checkServerHealth(); // Run first check immediately
