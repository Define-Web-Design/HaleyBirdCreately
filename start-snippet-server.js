/**
 * Start the Code Snippet Server
 * 
 * This script is designed to be used as a Replit workflow entry point.
 * It launches the code snippet server in a way that works reliably in the Replit environment.
 */

import { execSync, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Print a nice banner
console.log(`${colors.cyan}
   ______                __       __          
  / ____/_______  ____ _/ /____  / /_  __     
 / /   / ___/ _ \\/ __ \`/ __/ _ \\/ / / / /  
/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      
\\____/_/   \\___/\\__,_/\\__/\\___/_/\\__, /  
                                 /____/        
                                              
  Code Snippet Server - Workflow Runner         
${colors.reset}`);

// Set up environment
console.log(`${colors.yellow}Setting up environment...${colors.reset}`);
try {
  // Create necessary directories
  execSync('mkdir -p public logs');
  console.log(`${colors.green}Created necessary directories${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating directories: ${error.message}${colors.reset}`);
}

// Set port
const PORT = process.env.PORT || 8080;
process.env.PORT = PORT.toString();

// Launch the server
console.log(`${colors.green}Starting Code Snippet Server on port ${PORT}...${colors.reset}`);

try {
  // Try to use the server.js file first
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: PORT.toString()
    }
  });

  server.on('error', (error) => {
    console.error(`${colors.red}Error starting server: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Attempting to start fallback server...${colors.reset}`);
    
    // If the main server fails, try the simple server
    const fallbackServer = spawn('node', ['simple-server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: PORT.toString()
      }
    });
    
    fallbackServer.on('error', (fallbackError) => {
      console.error(`${colors.red}Error starting fallback server: ${fallbackError.message}${colors.reset}`);
      process.exit(1);
    });
  });
} catch (error) {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
}