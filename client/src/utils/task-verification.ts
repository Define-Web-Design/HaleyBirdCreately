
/**
 * Task verification utility to ensure all requested tasks are complete
 * before allowing checkpoint creation
 */

import { ValidationReport } from './consolidated-validation';

export interface TaskCompletionStatus {
  allTasksComplete: boolean;
  incompleteTasks: string[];
  message: string;
}

/**
 * Verifies that all requested tasks have been completed based on validation results
 */
export function verifyAllTasksComplete(validationReport: ValidationReport): TaskCompletionStatus {
  // Extract any incomplete tasks from validation report
  const incompleteTasks: string[] = [];
  
  // Check each section for failures
  validationReport.sections.forEach(section => {
    if (!section.success) {
      incompleteTasks.push(section.name);
    }
  });
  
  const allTasksComplete = incompleteTasks.length === 0;
  
  let message = '';
  if (allTasksComplete) {
    message = 'All requested tasks have been successfully completed and verified.';
  } else {
    message = `The following tasks are incomplete or need attention: ${incompleteTasks.join(', ')}`;
  }
  
  return {
    allTasksComplete,
    incompleteTasks,
    message
  };
}

/**
 * Creates a comprehensive checkpoint verification that ensures all systems are functioning
 * before allowing checkpoint creation
 */
export async function verifyBeforeCheckpoint(): Promise<boolean> {
  try {
    // Import dynamically to avoid circular dependencies
    const { runFullSystemValidation } = await import('./consolidated-validation');
    
    console.log('Performing pre-checkpoint verification...');
    const validationReport = await runFullSystemValidation();
    
    const taskStatus = verifyAllTasksComplete(validationReport);
    
    if (taskStatus.allTasksComplete) {
      console.log('✅ PRE-CHECKPOINT VERIFICATION SUCCESSFUL');
      console.log('All tasks are complete and verified. Safe to create checkpoint.');
      return true;
    } else {
      console.log('❌ PRE-CHECKPOINT VERIFICATION FAILED');
      console.log(taskStatus.message);
      console.log('Please fix the issues before creating a checkpoint.');
      return false;
    }
  } catch (error) {
    console.error('Error during pre-checkpoint verification:', error);
    console.log('❌ PRE-CHECKPOINT VERIFICATION FAILED');
    console.log('An error occurred during verification. Please fix before creating checkpoint.');
    return false;
  }
}

/**
 * Enforces checkpoint creation only when all tasks are verified complete
 */
export function enforceCompleteVerification(shouldProceed: boolean): void {
  if (!shouldProceed) {
    console.error('CHECKPOINT CREATION PREVENTED');
    console.error('Not all tasks have been verified as complete.');
    // In a real implementation, this would throw an error or block checkpoint creation
    throw new Error('Checkpoint creation blocked: Incomplete task verification');
  }
}
