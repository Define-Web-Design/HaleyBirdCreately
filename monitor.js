
/**
 * Simple server monitoring script
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHECK_INTERVAL = 60000; // Check every minute
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
function checkServerHealth() {
  logMessage('Checking server health...');
  
  http.get(TARGET_URL, (res) => {
    if (res.statusCode === 200) {
      logMessage('Server is healthy', 'SUCCESS');
    } else {
      logMessage(`Server returned status code: ${res.statusCode}`, 'WARNING');
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
    });
  }).on('error', (err) => {
    logMessage(`Health check failed: ${err.message}`, 'ERROR');
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
