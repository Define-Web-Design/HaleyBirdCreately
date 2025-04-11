const http = require('http');
const { exec } = require('child_process');

// Configuration
const APP_URL = 'http://localhost:5000'; // The URL of your application
const CHECK_INTERVAL = 60000; // Check every 60 seconds
const RESTART_COMMAND = 'npm run dev'; // Command to restart your app

console.log('Starting application keep-alive monitor...');
console.log(`Will check ${APP_URL} every ${CHECK_INTERVAL/1000} seconds`);

// Function to check if the application is running
function checkApplicationStatus() {
  console.log(`[${new Date().toISOString()}] Checking application status...`);
  
  const req = http.get(APP_URL, (res) => {
    if (res.statusCode === 200) {
      console.log(`[${new Date().toISOString()}] Application is running (status code: ${res.statusCode})`);
    } else {
      console.log(`[${new Date().toISOString()}] Application returned non-200 status code: ${res.statusCode}`);
      restartApplication();
    }
    
    // Consume response data to free up memory
    res.resume();
  });
  
  req.on('error', (e) => {
    console.log(`[${new Date().toISOString()}] Application check failed: ${e.message}`);
    restartApplication();
  });
  
  // Set a timeout for the request
  req.setTimeout(5000, () => {
    req.abort();
    console.log(`[${new Date().toISOString()}] Application check timed out`);
    restartApplication();
  });
}

// Function to restart the application
function restartApplication() {
  console.log(`[${new Date().toISOString()}] Attempting to restart the application...`);
  
  // First, check if we should restart or if it's already restarting
  exec('ps aux | grep "npm run dev" | grep -v grep', (error, stdout, stderr) => {
    if (error && error.code === 1) {
      // Process not found, we can start it
      exec(RESTART_COMMAND, (error, stdout, stderr) => {
        if (error) {
          console.error(`[${new Date().toISOString()}] Failed to restart application: ${error.message}`);
          return;
        }
        
        console.log(`[${new Date().toISOString()}] Application restart initiated`);
        console.log(`[${new Date().toISOString()}] ${stdout}`);
        
        if (stderr) {
          console.error(`[${new Date().toISOString()}] Stderr: ${stderr}`);
        }
      });
    } else {
      console.log(`[${new Date().toISOString()}] Application process already exists, no need to restart`);
    }
  });
}

// Initial check
checkApplicationStatus();

// Set up interval for regular checks
setInterval(checkApplicationStatus, CHECK_INTERVAL);

// Also set up a simple HTTP server to keep this script running
const keepAliveServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Keep-alive server is running');
});

keepAliveServer.listen(3999, () => {
  console.log('Keep-alive server is running on port 3999');
});