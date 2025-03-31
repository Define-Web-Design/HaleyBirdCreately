
/**
 * Checkpoint management system
 * Ensures all tasks are completed before creating checkpoints
 */

import { validateWorkflowForCheckpoint, createWorkflowCheckpoint, getWorkflowSummary } from './workflow-validator';

export interface CheckpointRequest {
  name: string;
  description?: string;
  requiredTasks: string[];
  validationRequired: boolean;
}

/**
 * Create a checkpoint after verifying all tasks are complete
 */
export async function requestCheckpoint(checkpointRequest: CheckpointRequest): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  console.log(`Checkpoint requested: ${checkpointRequest.name}`);
  
  try {
    // Get current workflow status
    const workflowSummary = getWorkflowSummary();
    
    if (!workflowSummary.session) {
      return {
        success: false,
        message: 'No active workflow session. Cannot create checkpoint.'
      };
    }
    
    // Check if all required tasks are completed
    const pendingRequiredTasks = checkpointRequest.requiredTasks.filter(taskDescription => {
      const task = workflowSummary.session?.tasks.find(t => t.description === taskDescription);
      return !task || task.status !== 'completed';
    });
    
    if (pendingRequiredTasks.length > 0) {
      return {
        success: false,
        message: `Cannot create checkpoint: Required tasks are not completed.`,
        details: {
          pendingTasks: pendingRequiredTasks
        }
      };
    }
    
    // If validation is required, run the comprehensive validation
    if (checkpointRequest.validationRequired) {
      const validationResult = await validateWorkflowForCheckpoint();
      
      if (!validationResult.canCheckpoint) {
        return {
          success: false,
          message: 'Cannot create checkpoint: Validation failed.',
          details: validationResult
        };
      }
    }
    
    // Create the checkpoint
    const checkpointCreated = await createWorkflowCheckpoint(
      checkpointRequest.description || `Checkpoint "${checkpointRequest.name}" created successfully.`
    );
    
    if (!checkpointCreated) {
      return {
        success: false,
        message: 'Failed to create checkpoint.'
      };
    }
    
    return {
      success: true,
      message: `Checkpoint "${checkpointRequest.name}" created successfully.`
    };
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    return {
      success: false,
      message: `Error creating checkpoint: ${error.message || error}`
    };
  }
}

/**
 * Verify that all specified tasks are completed
 */
export function verifyTasksCompleted(taskDescriptions: string[]): {
  allCompleted: boolean;
  completedTasks: string[];
  pendingTasks: string[];
} {
  const workflowSummary = getWorkflowSummary();
  
  if (!workflowSummary.session) {
    return {
      allCompleted: false,
      completedTasks: [],
      pendingTasks: taskDescriptions
    };
  }
  
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];
  
  taskDescriptions.forEach(taskDescription => {
    const task = workflowSummary.session?.tasks.find(t => t.description === taskDescription);
    
    if (task && task.status === 'completed') {
      completedTasks.push(taskDescription);
    } else {
      pendingTasks.push(taskDescription);
    }
  });
  
  return {
    allCompleted: pendingTasks.length === 0,
    completedTasks,
    pendingTasks
  };
}

/**
 * Check if all current workflow tasks are completed
 */
export async function ensureAllTasksComplete(): Promise<{
  allComplete: boolean;
  pendingTasks: string[];
  validationPassed: boolean;
}> {
  const workflowSummary = getWorkflowSummary();
  
  if (!workflowSummary.session) {
    return {
      allComplete: false,
      pendingTasks: [],
      validationPassed: false
    };
  }
  
  const pendingTasks = workflowSummary.pendingTasks.map(task => task.description);
  
  if (pendingTasks.length > 0) {
    return {
      allComplete: false,
      pendingTasks,
      validationPassed: false
    };
  }
  
  // Run validation
  const validationResult = await validateWorkflowForCheckpoint();
  
  return {
    allComplete: true,
    pendingTasks: [],
    validationPassed: validationResult.canCheckpoint
  };
}

/**
 * Create a user-requested checkpoint that verifies all tasks
 * Essential for ensuring nothing is missed before saving progress
 */
export async function createVerifiedCheckpoint(message: string): Promise<{
  success: boolean;
  message: string;
  validationDetails?: any;
}> {
  console.log('Creating verified checkpoint...');
  console.log('Message:', message);
  
  // First check if all tasks are completed
  const tasksStatus = await ensureAllTasksComplete();
  
  if (!tasksStatus.allComplete) {
    console.error('Cannot create checkpoint: Not all tasks are completed.');
    console.error('Pending tasks:', tasksStatus.pendingTasks);
    
    return {
      success: false,
      message: 'Cannot create checkpoint: Not all tasks are completed.',
      validationDetails: {
        pendingTasks: tasksStatus.pendingTasks
      }
    };
  }
  
  // If tasks are complete but validation failed
  if (!tasksStatus.validationPassed) {
    console.error('Cannot create checkpoint: Validation failed.');
    
    return {
      success: false,
      message: 'Cannot create checkpoint: Validation failed. All tasks are complete but system validation detected issues.'
    };
  }
  
  // Create the checkpoint
  try {
    const checkpointCreated = await createWorkflowCheckpoint(message);
    
    if (!checkpointCreated) {
      return {
        success: false,
        message: 'Failed to create checkpoint after validation.'
      };
    }
    
    console.log('Verified checkpoint created successfully.');
    return {
      success: true,
      message: 'Verified checkpoint created successfully. All tasks completed and validated.'
    };
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    return {
      success: false,
      message: `Error creating checkpoint: ${error.message || error}`
    };
  }
}
