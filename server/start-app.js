// Simple bootstrap file for starting the server in a Replit environment
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Starting Creately application...');

// Try to find a node executable
const nodePath = '/nix/store/sxw7i3pyw8v1ycw2sph0zq2byh1prrwm-nodejs-20.18.1/bin/node';

// Check if node exists
if (!fs.existsSync(nodePath)) {
  console.error(`ERROR: Node.js not found at ${nodePath}`);
  process.exit(1);
}

console.log(`Using Node.js from: ${nodePath}`);

// Start the server
const serverProcess = spawn(nodePath, ['index.js'], {
  cwd: rootDir,
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});