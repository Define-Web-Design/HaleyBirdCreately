/**
 * Simple workflow creator for Replit code snippet server
 */

const fs = require('fs');
const path = require('path');

// The workflow configuration
const workflowConfig = {
  workflow: "Snippet Server",
  category: "Web application",
  command: "bash snippet-server-workflow.sh",
  singleton: true,
  description: "Runs the Creately Code Snippet server on port 8080",
  restart_at: "never"
};

// Convert config to JSON
const workflowJson = JSON.stringify(workflowConfig, null, 2);

// Write to .replit.nix or create a new file
try {
  const configPath = './.replit';
  const configData = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
  
  // Check if workflow section already exists
  if (configData.includes('[workflow')) {
    console.log('Workflow already exists in .replit. Please update it manually.');
  } else {
    // Add workflow configuration
    const newWorkflowSection = `[workflow]
name = "${workflowConfig.workflow}"
category = "${workflowConfig.category}"
command = "${workflowConfig.command}"
singleton = ${workflowConfig.singleton}
description = "${workflowConfig.description}"
restart_at = "${workflowConfig.restart_at}"`;

    // Append workflow config to .replit
    fs.writeFileSync('.replit.workflow', newWorkflowSection);
    console.log('Workflow configuration created: .replit.workflow');
    console.log('You can use the contents of this file to manually update your .replit file.');
  }
} catch (error) {
  console.error('Error creating workflow:', error.message);
}

console.log('\nTo run the server manually, use:');
console.log('./snippet-server-workflow.sh');