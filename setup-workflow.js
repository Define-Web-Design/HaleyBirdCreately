/**
 * Setup Workflow Script for Creately
 * 
 * This script configures the Replit workflow for the application.
 */

import { execSync } from 'child_process';
import fs from 'fs';

const replitConfigPath = '.replit';

// Workflow configuration
const workflowConfig = `
run = "bash start-server.sh"
entrypoint = "simple-server.js"

[languages]
nodejs = "nodejs-20"

[nix]
channel = "stable-23_11"

[hosting]
route = "/"
directory = "public"

[deployment]
run = ["sh", "-c", "bash start-server.sh"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80
`;

try {
  // Write configuration to .replit file
  fs.writeFileSync(replitConfigPath, workflowConfig);
  console.log('✅ Workflow configuration created successfully.');

  // Make start script executable
  execSync('chmod +x start-server.sh');
  console.log('✅ Made start script executable.');

  console.log('🚀 Setup complete! You can now run the workflow.');
} catch (error) {
  console.error('❌ Error setting up workflow:', error.message);
  process.exit(1);
}