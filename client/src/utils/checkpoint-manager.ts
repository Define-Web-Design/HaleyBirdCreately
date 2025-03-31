
/**
 * Checkpoint Manager
 * 
 * Ensures all tasks are thoroughly verified and completed before allowing
 * checkpoints to be created. Integrates with the validation coordinator.
 */

import { validateBeforeCheckpoint, generateValidationReport } from './validation-coordinator';

interface CheckpointInfo {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  validationReport: string;
  files: string[];
  user: string;
}

// Store checkpoints
const checkpoints: CheckpointInfo[] = [];

/**
 * Attempt to create a checkpoint, but only if all validations pass
 */
export async function createCheckpoint(name: string, description: string, files: string[]): Promise<{
  success: boolean;
  message: string;
  checkpointId?: string;
}> {
  console.log(`Attempting to create checkpoint: ${name}`);
  
  // Run thorough validation
  const validationPassed = await validateBeforeCheckpoint(description);
  
  if (!validationPassed) {
    console.error('Cannot create checkpoint: Validation failed');
    return {
      success: false,
      message: 'Checkpoint creation blocked: One or more validations failed. Please fix all issues before creating a checkpoint.'
    };
  }
  
  // Validation passed, create the checkpoint
  const checkpointId = `cp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const checkpoint: CheckpointInfo = {
    id: checkpointId,
    name,
    description,
    timestamp: new Date(),
    validationReport: generateValidationReport(`session-${Date.now()}`),
    files,
    user: 'current-user' // In a real app, this would be the actual user
  };
  
  checkpoints.push(checkpoint);
  
  console.log(`Checkpoint created: ${name} (${checkpointId})`);
  
  return {
    success: true,
    message: `Checkpoint "${name}" created successfully after passing all validations.`,
    checkpointId
  };
}

/**
 * Get a list of all checkpoints
 */
export function getCheckpoints(): CheckpointInfo[] {
  return [...checkpoints];
}

/**
 * Get a specific checkpoint by ID
 */
export function getCheckpoint(id: string): CheckpointInfo | undefined {
  return checkpoints.find(cp => cp.id === id);
}

/**
 * Delete a checkpoint
 */
export function deleteCheckpoint(id: string): boolean {
  const initialLength = checkpoints.length;
  const index = checkpoints.findIndex(cp => cp.id === id);
  
  if (index >= 0) {
    checkpoints.splice(index, 1);
    return true;
  }
  
  return false;
}

/**
 * Verify all tasks are completed before attempting to create a checkpoint
 */
export async function verifyWorkflowCompletion(
  taskIds: string[], 
  description: string
): Promise<{
  completed: boolean;
  message: string;
  pendingTasks: string[];
}> {
  // In a real implementation, this would check task statuses from a task tracking system
  // For this example, we'll just use the validation system as a proxy
  
  const validationPassed = await validateBeforeCheckpoint(description);
  
  if (!validationPassed) {
    return {
      completed: false,
      message: 'Workflow is not fully completed. Some tasks still need attention.',
      pendingTasks: ['Validation failed - see validation report for details']
    };
  }
  
  return {
    completed: true,
    message: 'All workflow tasks completed successfully and verified.',
    pendingTasks: []
  };
}
