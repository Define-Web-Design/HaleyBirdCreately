/**
 * Simple workflow creator for Replit code snippet server
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(colors.cyan);
console.log('   ______                __       __          ');
console.log('  / ____/_______  ____ _/ /____  / /_  __     ');
console.log(' / /   / ___/ _ \\/ __ `/ __/ _ \\/ / / / /  ');
console.log('/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      ');
console.log('\\____/_/   \\___/\\__,_/\\__/\\___/_/\\__, /  ');
console.log('                                 /____/        ');
console.log('                                              ');
console.log('  Code Snippet Workflow Setup                 ');
console.log(colors.reset);

// Ensure public directory exists
try {
  await fs.promises.access('./public').catch(async () => {
    console.log(`${colors.green}Creating public directory${colors.reset}`);
    await fs.promises.mkdir('./public', { recursive: true });
  });
} catch (error) {
  console.error(`${colors.red}Error creating public directory: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Make run-server.sh executable
try {
  console.log(`${colors.yellow}Making run-server.sh executable${colors.reset}`);
  execSync('chmod +x run-server.sh');
} catch (error) {
  console.error(`${colors.red}Error making run-server.sh executable: ${error.message}${colors.reset}`);
}

// Test run the server
console.log(`${colors.green}Setup completed successfully${colors.reset}`);
console.log(`${colors.cyan}Run the server with: ./run-server.sh${colors.reset}`);
console.log(`${colors.cyan}Access the web interface at: http://localhost:8080/${colors.reset}`);