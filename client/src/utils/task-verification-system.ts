
/**
 * Task verification system to ensure all tasks are completed correctly
 * before proceeding to checkpoints
 */

import { checkpointManager } from './checkpoint-manager';
import { WorkflowTask } from './workflow-validator';
import { runAccessibilityAudit } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';
import { securityMonitor } from '../../../server/services/securityMonitor';

/**
 * Defines a standard task verification workflow
 */
export async function setUpStandardVerificationWorkflow(
  taskDescriptions: string[],
  checkpointName: string
): Promise<void> {
  // Create task definitions with validation functions
  const taskDefinitions = taskDescriptions.map((description, index) => ({
    id: `task-${index + 1}`,
    description,
    validationFn: async () => {
      // Basic validation - this would be replaced with actual validation logic
      // specific to each task type
      return true;
    }
  }));
  
  // Set up the workflow with these tasks
  checkpointManager.setUpWorkflow(taskDefinitions, checkpointName);
}

/**
 * Verifies that all tasks have been completed and validates them
 */
export async function verifyAllTasksCompleted(): Promise<boolean> {
  // First check if all tasks are marked as completed
  if (!checkpointManager.areAllTasksMarkedCompleted()) {
    console.warn('Not all tasks have been marked as completed');
    return false;
  }
  
  // Then run the full validation
  const validationResult = await checkpointManager.validateWorkflow();
  return validationResult.canProceedToCheckpoint;
}

/**
 * Attempts to create a checkpoint if all validations pass
 */
export async function createCheckpointIfAllTasksVerified(): Promise<boolean> {
  return await checkpointManager.createCheckpoint();
}

/**
 * Sets up a comprehensive verification workflow with full validation
 */
export async function setUpComprehensiveVerificationWorkflow(
  taskDefinitions: any[],
  checkpointName: string
): Promise<void> {
  // Map the task definitions to include proper validation functions
  const workflowTasks: Omit<WorkflowTask, 'completed' | 'errorDetails'>[] = 
    taskDefinitions.map((task, index) => {
      // Base task definition
      const baseTask = {
        id: `task-${index + 1}`,
        description: task.description,
        validationFn: async () => true // Default validation
      };
      
      // Add specialized validation based on task type
      if (task.type === 'accessibility') {
        baseTask.validationFn = async () => {
          const result = await runAccessibilityAudit();
          return result.score >= 80; // 80% threshold
        };
      } else if (task.type === 'api') {
        baseTask.validationFn = async () => {
          const result = await validateApiEndpoints();
          return result.success;
        };
      } else if (task.type === 'security') {
        baseTask.validationFn = async () => {
          const result = await securityMonitor.validateAssetIntegrity();
          return result.valid;
        };
      } else if (task.type === 'function' && typeof task.validationFn === 'function') {
        baseTask.validationFn = task.validationFn;
      }
      
      return baseTask;
    });
  
  // Set up the workflow
  checkpointManager.setUpWorkflow(workflowTasks, checkpointName);
}

/**
 * Run a quick validation check to see if we can proceed
 */
export async function canProceedToCheckpoint(): Promise<boolean> {
  try {
    const validationResult = await checkpointManager.validateWorkflow(false);
    return validationResult.canProceedToCheckpoint;
  } catch (error) {
    console.error('Error checking if we can proceed to checkpoint:', error);
    return false;
  }
}
