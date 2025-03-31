
/**
 * Comprehensive workflow validator to ensure all tasks are completed simultaneously
 * before creating checkpoints or saving progress
 */

import { validateImplementation } from './validate-implementation';
import { runFullSystemValidation } from './consolidated-validation';
import { securityMonitor } from '../../../server/services/securityMonitor';

export interface WorkflowTask {
  id: string;
  description: string;
  completed: boolean;
  validationFn: () => Promise<boolean>;
  errorDetails?: string;
}

export interface WorkflowValidationResult {
  allTasksCompleted: boolean;
  validationPassed: boolean;
  tasksStatus: {
    [taskId: string]: {
      completed: boolean;
      validated: boolean;
      errorDetails?: string;
    }
  };
  timestamp: string;
  canProceedToCheckpoint: boolean;
  validationReport: string;
}

/**
 * Creates a new workflow with specified tasks
 */
export function createWorkflow(tasks: Omit<WorkflowTask, 'completed' | 'errorDetails'>[]): WorkflowTask[] {
  return tasks.map(task => ({
    ...task,
    completed: false,
    errorDetails: undefined
  }));
}

/**
 * Execute and validate all tasks in a workflow simultaneously
 */
export async function executeAndValidateWorkflow(
  tasks: WorkflowTask[],
  additionalValidation: boolean = true
): Promise<WorkflowValidationResult> {
  console.log('Starting comprehensive workflow validation...');
  console.log('='.repeat(80));
  console.log(`Validating ${tasks.length} tasks simultaneously`);
  
  // Execute all task validations in parallel
  const taskResults = await Promise.allSettled(
    tasks.map(async (task) => {
      try {
        console.log(`Validating task: ${task.description}`);
        const isValid = await task.validationFn();
        return {
          taskId: task.id,
          completed: true,
          validated: isValid,
          errorDetails: isValid ? undefined : `Validation failed for: ${task.description}`
        };
      } catch (error) {
        console.error(`Error validating task ${task.id}:`, error);
        return {
          taskId: task.id,
          completed: false,
          validated: false,
          errorDetails: `Error: ${error.message || 'Unknown error'}`
        };
      }
    })
  );
  
  // Process results
  const tasksStatus = {};
  let allTasksCompleted = true;
  let validationPassed = true;
  
  taskResults.forEach((result, index) => {
    const task = tasks[index];
    
    if (result.status === 'fulfilled') {
      tasksStatus[task.id] = result.value;
      
      if (!result.value.completed || !result.value.validated) {
        validationPassed = false;
      }
    } else {
      tasksStatus[task.id] = {
        completed: false,
        validated: false,
        errorDetails: `Promise rejection: ${result.reason}`
      };
      allTasksCompleted = false;
      validationPassed = false;
    }
  });
  
  // Run additional system-wide validation if needed
  let systemValidationResult = { success: true, report: 'System validation skipped' };
  let securityValidationResult = { valid: true, issues: [] };
  
  if (additionalValidation) {
    console.log('Running system-wide implementation validation...');
    try {
      systemValidationResult = await validateImplementation();
      
      if (!systemValidationResult.success) {
        validationPassed = false;
      }
    } catch (error) {
      console.error('Error during system validation:', error);
      systemValidationResult = {
        success: false,
        report: `System validation error: ${error.message}`
      };
      validationPassed = false;
    }
    
    console.log('Running security validation...');
    try {
      securityValidationResult = await securityMonitor.validateAssetIntegrity();
      
      if (!securityValidationResult.valid) {
        validationPassed = false;
      }
    } catch (error) {
      console.error('Error during security validation:', error);
      securityValidationResult = {
        valid: false,
        issues: [`Security validation error: ${error.message}`]
      };
      validationPassed = false;
    }
  }
  
  // Determine if we can proceed to checkpoint
  const canProceedToCheckpoint = allTasksCompleted && validationPassed;
  
  // Generate a comprehensive validation report
  let validationReport = `# Workflow Validation Report\n\n`;
  validationReport += `## Generated: ${new Date().toLocaleString()}\n\n`;
  validationReport += `## Overall Status: ${canProceedToCheckpoint ? 'PASSED ✓' : 'FAILED ✗'}\n\n`;
  
  validationReport += `### Task Status:\n\n`;
  Object.entries(tasksStatus).forEach(([taskId, status]) => {
    const taskInfo = tasks.find(t => t.id === taskId);
    validationReport += `- ${taskId}: ${status.completed && status.validated ? '✓' : '✗'} ${taskInfo?.description}\n`;
    
    if (status.errorDetails) {
      validationReport += `  - Error: ${status.errorDetails}\n`;
    }
  });
  
  validationReport += `\n### System Validation:\n`;
  validationReport += `- Status: ${systemValidationResult.success ? 'Passed' : 'Failed'}\n`;
  
  validationReport += `\n### Security Validation:\n`;
  validationReport += `- Status: ${securityValidationResult.valid ? 'Passed' : 'Failed'}\n`;
  
  if (securityValidationResult.issues.length > 0) {
    validationReport += `- Issues:\n`;
    securityValidationResult.issues.forEach(issue => {
      validationReport += `  - ${issue}\n`;
    });
  }
  
  validationReport += `\n## Can Proceed To Checkpoint: ${canProceedToCheckpoint ? 'YES' : 'NO'}\n`;
  
  if (!canProceedToCheckpoint) {
    validationReport += `\n## Required Actions Before Checkpoint:\n`;
    
    if (!allTasksCompleted) {
      validationReport += `- Complete all tasks\n`;
    }
    
    if (!validationPassed) {
      validationReport += `- Fix validation errors\n`;
    }
  }
  
  console.log('='.repeat(80));
  console.log(`Workflow validation ${canProceedToCheckpoint ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));
  
  return {
    allTasksCompleted,
    validationPassed,
    tasksStatus,
    timestamp: new Date().toISOString(),
    canProceedToCheckpoint,
    validationReport
  };
}

/**
 * Create a checkpoint only if all validations pass
 */
export async function createCheckpointIfValid(
  workflowResult: WorkflowValidationResult,
  checkpointName: string
): Promise<boolean> {
  if (!workflowResult.canProceedToCheckpoint) {
    console.error('Cannot create checkpoint because validation failed:');
    console.error(workflowResult.validationReport);
    return false;
  }
  
  try {
    console.log(`Creating checkpoint: ${checkpointName}`);
    // In a real implementation, this would call the appropriate checkpoint creation API
    // For this example, we'll just log it
    console.log(`Checkpoint "${checkpointName}" created successfully at ${new Date().toISOString()}`);
    
    // Save validation report for audit trail
    console.log('Saving validation report...');
    // This would store the report in a database or file
    
    return true;
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    return false;
  }
}

/**
 * Run a predefined workflow for task verification
 */
export async function runTaskVerificationWorkflow(
  tasks: Omit<WorkflowTask, 'completed' | 'errorDetails'>[],
  checkpointName: string
): Promise<boolean> {
  const workflow = createWorkflow(tasks);
  const result = await executeAndValidateWorkflow(workflow, true);
  
  console.log(result.validationReport);
  
  if (result.canProceedToCheckpoint) {
    return await createCheckpointIfValid(result, checkpointName);
  } else {
    console.warn('Cannot proceed to checkpoint until all tasks are verified successfully');
    return false;
  }
}
