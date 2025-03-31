
#!/usr/bin/env node

/**
 * Task Verification Command Line Utility
 * 
 * This script runs comprehensive verification of all tasks 
 * and only creates a checkpoint if everything passes.
 * 
 * Usage:
 *   node scripts/verify-tasks.js "Fix navigation links and improve accessibility"
 */

const { verifyTasksSimultaneously } = require('../client/src/utils/validation-runner');

// Get the instruction from command line arguments
const instruction = process.argv.slice(2).join(' ');

if (!instruction) {
  console.error('Error: No task instruction provided');
  console.log('Usage: node scripts/verify-tasks.js "Your task instruction here"');
  process.exit(1);
}

console.log(`Running comprehensive verification for: "${instruction}"`);

// Run the verification
verifyTasksSimultaneously(instruction, {
  displayResults: true,
  createCheckpoint: true
}).then(success => {
  if (success) {
    console.log('SUCCESS: All tasks verified successfully and checkpoint created!');
    process.exit(0);
  } else {
    console.error('FAILURE: Not all tasks could be verified successfully. No checkpoint created.');
    console.log('Please address the issues reported above before creating a checkpoint.');
    process.exit(1);
  }
}).catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
