/**
 * Creately Workflow Setup Utility
 * 
 * This script helps users set up the Replit workflow configuration.
 * It provides instructions for manually configuring workflows in Replit.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Log a formatted message to the console
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Display a header in the console
 */
function printHeader(title) {
  const line = '='.repeat(title.length + 8);
  console.log('');
  log(line, 'blue');
  log(`    ${title}    `, 'blue');
  log(line, 'blue');
  console.log('');
}

/**
 * Check if a file exists
 */
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Display instructions for setting up the workflow
 */
function displayWorkflowInstructions() {
  printHeader('Creately Workflow Setup Guide');
  
  log('This utility will help you set up a Replit workflow for the Creately application.', 'cyan');
  log('Since we cannot directly modify the .replit file via scripts, here are the steps', 'cyan');
  log('to manually configure your workflow:', 'cyan');
  
  console.log('');
  log('1. In the Replit interface, click on the "Tools" button in the left sidebar.', 'yellow');
  log('2. Select "Workflows" from the menu.', 'yellow');
  log('3. Click the "Add Workflow" button.', 'yellow');
  log('4. Configure a new workflow with the following settings:', 'yellow');
  log('   - Name: "Start Creately"', 'yellow');
  log('   - Command: "./run-creately.sh"', 'yellow');
  log('5. Click "Save" to create the workflow.', 'yellow');
  log('6. You can now start the application by clicking the "Run" button for this workflow.', 'yellow');
  
  console.log('');
  log('Alternative Method:', 'magenta');
  log('If you prefer to modify your .replit file directly, you can use the configuration', 'magenta');
  log('template we\'ve provided in "replit-config-template.json".', 'magenta');
  
  console.log('');
  log('Checking for required files...', 'green');
  
  // Check for essential files
  const requiredFiles = [
    { path: './run-creately.sh', name: 'Main runner script' },
    { path: './start-app.sh', name: 'Enhanced startup script' },
    { path: './start.sh', name: 'Core startup script' },
    { path: './start-app.js', name: 'JavaScript starter' },
    { path: './replit-config-template.json', name: 'Replit config template' }
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const exists = checkFileExists(file.path);
    if (exists) {
      log(`✅ ${file.name} (${file.path}): Found`, 'green');
    } else {
      log(`❌ ${file.name} (${file.path}): Missing`, 'red');
      allFilesExist = false;
    }
  });
  
  console.log('');
  if (allFilesExist) {
    log('All required files are present!', 'green');
    log('You can now proceed with setting up the workflow.', 'green');
  } else {
    log('Some required files are missing. Please ensure all files are present.', 'red');
    log('Run "npm run setup" to reinstall missing components.', 'red');
  }
  
  // Check file permissions
  console.log('');
  log('Ensuring script files are executable...', 'cyan');
  
  const scriptFiles = ['./run-creately.sh', './start-app.sh', './start.sh'];
  
  scriptFiles.forEach(scriptPath => {
    if (checkFileExists(scriptPath)) {
      try {
        // Make script executable
        fs.chmodSync(scriptPath, '755');
        log(`✅ Made ${scriptPath} executable`, 'green');
      } catch (error) {
        log(`❌ Could not make ${scriptPath} executable: ${error.message}`, 'red');
      }
    }
  });
  
  console.log('');
  log('Setup complete! You can now manually configure your workflow.', 'green');
  log('To start the application directly, run: ./run-creately.sh', 'green');
  
  // Offer to show .replit template
  console.log('');
  rl.question('Would you like to see the recommended .replit configuration? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        const templateContent = fs.readFileSync('./replit-config-template.json', 'utf8');
        console.log('');
        log('Here is the recommended .replit configuration:', 'cyan');
        console.log('');
        console.log(templateContent);
      } catch (error) {
        log(`Error reading template file: ${error.message}`, 'red');
      }
    }
    
    rl.close();
  });
}

// Start the setup process
displayWorkflowInstructions();