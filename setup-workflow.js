// This script helps configure the workflow for the application
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('Setting up Creately application workflow...');

// Create a start script that combines the frontend and backend
const startScript = `#!/bin/bash
echo "Starting Creately application..."
npm run dev
`;

// Write the start script to a file
fs.writeFileSync('start-app.sh', startScript, { mode: 0o755 });
console.log('Created start-app.sh script');

// Create a setup for Node.js environment
exec('node -v', (error, stdout, stderr) => {
  if (error) {
    console.error('Node.js is not installed properly:', error);
    return;
  }
  
  console.log(`Node.js version: ${stdout.trim()}`);
  
  // Set up package.json scripts if needed
  try {
    const packageJson = require('./package.json');
    
    // Ensure we have the right scripts
    let modified = false;
    
    if (!packageJson.scripts.dev) {
      packageJson.scripts.dev = "node server.js";
      modified = true;
    }
    
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = "node server.js";
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json scripts');
    }
    
    console.log('Environment setup complete!');
    console.log('To start the application, run: bash start-app.sh');
    
  } catch (err) {
    console.error('Error updating package.json:', err);
  }
});