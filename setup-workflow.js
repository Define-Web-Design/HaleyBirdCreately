/**
 * Setup Workflow Script for Creately
 * 
 * This script configures the Replit workflow for the application.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Log a message with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print a header
 */
function printHeader(title) {
  const line = '='.repeat(title.length + 4);
  console.log('\n' + line);
  console.log(`= ${colors.bright}${title}${colors.reset} =`);
  console.log(line + '\n');
}

/**
 * Create a Replit workflow configuration
 */
function createWorkflowConfig() {
  printHeader('Setting up Replit workflow');
  
  // Define workflows configuration
  const config = {
    workflows: [
      {
        name: 'Start Server',
        run: './start-server.sh',
        persistent: true,
      }
    ]
  };
  
  try {
    // Create a local configuration file instead
    const configPath = 'replit-config.json';
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    log('✅ Workflow configuration created successfully at ' + configPath, 'green');
    log('✅ Workflow "Start Server" is now available', 'green');
    log('');
    log('To start the server, press the "Run" button or run:', 'cyan');
    log('  ./start-server.sh', 'yellow');
    log('');
    
    return true;
  } catch (error) {
    log('❌ Error creating workflow configuration: ' + error.message, 'red');
    return false;
  }
}

// Main function
function main() {
  createWorkflowConfig();
}

// Run the script
main();