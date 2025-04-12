
/**
 * Simple server monitoring script
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECK_INTERVAL = 15000; // Check every 15 seconds
const PORT = process.env.PORT || 3001;
const TARGET_URL = `http://0.0.0.0:${process.env.PORT || 3000}/api/health`;

// Make the monitoring directory
const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function logMessage(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(path.join(LOGS_DIR, 'monitor.log'), logMessage);
}

// Create a very simple status server
const server = http.createServer((req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Monitor is running' }));
    return;
  }
  
  res.writeHead(200);
  res.end('Monitor is running. Check /status for API endpoint.');
});

server.listen(PORT, () => {
  logMessage(`Monitor server running on port ${PORT}`);
});

// Check the main server health periodically
let consecutiveFailures = 0;
const MAX_FAILURES = 3;
const SERVER_START_COMMAND = './start.sh';

function attemptServerRestart() {
  logMessage('Attempting to restart the main server...', 'WARNING');
  const { exec } = require('child_process');
  
  exec(SERVER_START_COMMAND, (error, stdout, stderr) => {
    if (error) {
      logMessage(`Failed to restart server: ${error.message}`, 'ERROR');
      return;
    }
    
    logMessage('Server restart initiated', 'INFO');
    logMessage(`Output: ${stdout}`, 'DEBUG');
    
    // Reset the counter after restart attempt
    consecutiveFailures = 0;
  });
}

function checkServerHealth() {
  logMessage('Checking server health...');
  
  http.get(TARGET_URL, (res) => {
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
        const parsedData = JSON.parse(data);
        logMessage(`Health check response: ${JSON.stringify(parsedData)}`);
      } catch (e) {
        logMessage(`Failed to parse response: ${data}`, 'ERROR');
      }
      
      // Check if we need to restart the server
      if (consecutiveFailures >= MAX_FAILURES) {
        logMessage(`${consecutiveFailures} consecutive failures detected. Threshold reached.`, 'WARNING');
        attemptServerRestart();
      }
    });
  }).on('error', (err) => {
    logMessage(`Health check failed: ${err.message}`, 'ERROR');
    consecutiveFailures++;
    
    // Check if we need to restart the server
    if (consecutiveFailures >= MAX_FAILURES) {
      logMessage(`${consecutiveFailures} consecutive failures detected. Threshold reached.`, 'WARNING');
      attemptServerRestart();
    }
  });
}

// Start monitoring
setInterval(checkServerHealth, CHECK_INTERVAL);
checkServerHealth(); // Run first check immediately

process.on('SIGINT', () => {
  logMessage('Monitor shutting down...');
  server.close(() => {
    logMessage('Monitor server closed');
    process.exit(0);
  });
});

logMessage('Monitor started');
