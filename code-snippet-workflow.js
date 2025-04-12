/**
 * Code Snippet Server Workflow Setup
 */

import * as fs from 'fs';
import { spawn } from 'child_process';

// Create the workflow configuration
try {
  console.log("Setting up Code Snippet Server workflow...");
  
  // Start the server
  console.log("Starting the code snippet server...");
  const server = spawn('./node_bin/node', ['server.js'], {
    stdio: 'inherit',
    detached: true,
    env: { ...process.env, PORT: '3000' }
  });
  
  // Log success
  console.log("✅ Code snippet server started successfully!");
  console.log("✅ API available at: http://localhost:3000/api");
  console.log("✅ Web interface available at: http://localhost:3000/");
  
  // Keep the script running to keep the server alive
  console.log("Keeping the workflow running (press Ctrl+C to stop)...");
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down the server...');
    if (!server.killed) {
      server.kill();
    }
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down the server...');
    if (!server.killed) {
      server.kill();
    }
    process.exit(0);
  });
  
} catch (error) {
  console.error('Error setting up workflow:', error);
  process.exit(1);
}