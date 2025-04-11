// Simple script to start the application
const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Set up environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3000';

// Use in-memory DB if no database URL is provided
if (!process.env.DATABASE_URL) {
  log('No DATABASE_URL found, using in-memory storage');
  process.env.USE_IN_MEMORY_DB = 'true';
} else {
  log('Database URL found in environment');
}

log('Starting application...');

// Determine server file to use
let serverFile = '';
if (existsSync(path.join(__dirname, 'server', 'index.ts'))) {
  serverFile = path.join(__dirname, 'server', 'index.ts');
  log(`Found server file: ${serverFile}`);
} else if (existsSync(path.join(__dirname, 'server', 'index.js'))) {
  serverFile = path.join(__dirname, 'server', 'index.js');
  log(`Found server file: ${serverFile}`);
} else {
  serverFile = path.join(__dirname, 'server', 'simple-server.ts');
  log(`Using fallback server: ${serverFile}`);
}

try {
  // Try to start the server
  log('Attempting to start server...');
  
  let command = '';
  let args = [];
  
  if (serverFile.endsWith('.ts')) {
    command = 'npx';
    args = ['ts-node', '--esm', serverFile];
  } else {
    command = 'node';
    args = [serverFile];
  }
  
  const server = spawn(command, args, {
    stdio: 'inherit',
    env: process.env
  });
  
  server.on('error', (err) => {
    log(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      log(`Received ${signal}, shutting down gracefully`);
      server.kill(signal);
      process.exit(0);
    });
  });
  
} catch (error) {
  log(`Error starting server: ${error.message}`);
  process.exit(1);
}