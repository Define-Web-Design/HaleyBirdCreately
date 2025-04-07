
#!/usr/bin/env node

/**
 * Task Verification CLI Script
 * Runs comprehensive validation of all tasks and reports status
 */

const { verifyAllTasks } = require('../client/src/utils/verify-all-tasks');
const { validateBeforeCheckpoint } = require('../client/src/utils/validation-coordinator');

async function main() {
  try {
    console.log('='.repeat(80));
    console.log('TASK VERIFICATION SYSTEM');
    console.log('='.repeat(80));
    console.log('Running comprehensive task verification...\n');

    // Run the full verification
    const verificationResult = await verifyAllTasks();
    
    console.log('\n='.repeat(80));
    console.log('VERIFICATION RESULTS:');
    console.log('-'.repeat(80));
    
    if (verificationResult) {
      console.log('✅ All tasks verified successfully!');
      
      // Check if we can create a checkpoint
      const canCreateCheckpoint = await validateBeforeCheckpoint('CLI Verification');
      
      if (canCreateCheckpoint) {
        console.log('\n✅ Ready to create checkpoint');
        console.log('Run the following command to create a checkpoint:');
        console.log('node -e "require(\'./client/src/utils/checkpoint-manager\').createCheckpoint(\'Checkpoint Name\', \'Description\')"');
      } else {
        console.log('\n⚠️ Cannot create checkpoint - validation issues detected');
      }
    } else {
      console.log('❌ Verification failed - some tasks did not pass validation');
      console.log('Review logs above for details on which tasks failed');
    }
    
    console.log('='.repeat(80));
    
    // Exit with appropriate code
    process.exit(verificationResult ? 0 : 1);
  } catch (error) {
    console.error('Error running verification:', error);
    process.exit(1);
  }
}

// Run script
main();
