/**
 * Creately Code Snippet Server Starter
 * 
 * This script launches the code snippet server as a workflow.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Print a banner
 */
function printBanner() {
  console.log('\n');
  console.log(`${colors.cyan}${colors.bright}===========================================`);
  console.log(`   CREATELY CODE SNIPPET SERVER`);
  console.log(`============================================${colors.reset}`);
  console.log('\n');
}

/**
 * Log a message with timestamp and color
 */
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

/**
 * Main function
 */
async function main() {
  printBanner();
  
  log('Starting the code snippet server...', 'green');
  
  // Check if node_bin/node exists
  if (!fs.existsSync('./node_bin/node')) {
    log('Error: node_bin/node not found. Cannot start the server.', 'red');
    process.exit(1);
  }
  
  // Run the server
  const serverProcess = spawn('./node_bin/node', ['server.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3000'
    }
  });
  
  serverProcess.on('error', (err) => {
    log(`Failed to start server: ${err.message}`, 'red');
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`, 'yellow');
    }
  });
  
  process.on('SIGINT', () => {
    log('Received SIGINT. Shutting down the server...', 'yellow');
    serverProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM. Shutting down the server...', 'yellow');
    serverProcess.kill();
    process.exit(0);
  });
  
  log('Server started successfully! Use Ctrl+C to stop.', 'green');
  log(`API available at: http://localhost:8080/api`, 'cyan');
  log(`Web interface available at: http://localhost:8080/`, 'cyan');
}

// Run the script
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});