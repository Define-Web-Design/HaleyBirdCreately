
/**
 * Executable utility that verifies all tasks are complete
 * before allowing checkpoint creation
 */

import { runFullSystemValidation, displayFullValidationResults } from './consolidated-validation';
import { verifyAllTasksComplete, enforceCompleteVerification } from './task-verification';

async function main() {
  try {
    console.log('='.repeat(80));
    console.log('COMPREHENSIVE TASK VERIFICATION');
    console.log('Ensuring all tasks are complete before checkpoint creation');
    console.log('='.repeat(80));
    
    // Run full system validation
    const validationReport = await runFullSystemValidation();
    
    // Display detailed results
    displayFullValidationResults(validationReport);
    
    // Verify task completion status
    const taskStatus = verifyAllTasksComplete(validationReport);
    
    console.log('\n\nCHECKPOINT READINESS:');
    console.log('-'.repeat(40));
    console.log(`Status: ${taskStatus.allTasksComplete ? 'READY ✓' : 'NOT READY ✗'}`);
    console.log(`Message: ${taskStatus.message}`);
    
    if (taskStatus.incompleteTasks.length > 0) {
      console.log('\nIncomplete tasks:');
      taskStatus.incompleteTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task}`);
      });
    }
    
    // Exit with appropriate status code
    process.exit(taskStatus.allTasksComplete ? 0 : 1);
  } catch (error) {
    console.error('Error during task verification:', error);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  main();
}

// Export for programmatic use
export { main as verifyAllTasks };
