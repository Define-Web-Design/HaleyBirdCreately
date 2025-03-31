
/**
 * Command-line script to run the task verification system
 */

import { ensureAllTasksComplete } from './task-verification';

async function main() {
  try {
    console.log('Starting comprehensive task verification before checkpoint...');
    
    const success = await ensureAllTasksComplete();
    
    if (success) {
      console.log('✅ Verification PASSED. Safe to create checkpoint.');
      process.exit(0);
    } else {
      console.error('❌ Verification FAILED. NOT safe to create checkpoint.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running verification:', error);
    process.exit(1);
  }
}

// Run the script
main();
