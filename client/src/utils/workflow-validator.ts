
/**
 * Comprehensive workflow validation system
 * Ensures all requested tasks are completed before allowing checkpoints
 */

import { validateImplementation } from './validate-implementation';
import { runFullSystemValidation } from './consolidated-validation';
import { verifyPageLinks, runAccessibilityAudit, testKeyboardNavigation } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

export interface WorkflowTask {
  id: string;
  description: string;
  category: 'navigation' | 'content' | 'design' | 'backend' | 'accessibility' | 'security' | 'testing' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  validationFunction?: () => Promise<boolean>;
  dependencies?: string[]; // IDs of tasks that must be completed before this one
  errorDetails?: string;
  startTime?: number;
  endTime?: number;
}

export interface WorkflowSession {
  id: string;
  name: string;
  createdAt: number;
  tasks: WorkflowTask[];
  checkpoint?: {
    id: string;
    createdAt: number;
    status: 'pending' | 'created' | 'failed';
    message?: string;
  };
  status: 'in-progress' | 'completed' | 'failed';
}

// Current active workflow session
let activeWorkflowSession: WorkflowSession | null = null;

/**
 * Initialize a new workflow session
 */
export function initializeWorkflowSession(name: string): WorkflowSession {
  const session: WorkflowSession = {
    id: `workflow-${Date.now()}`,
    name,
    createdAt: Date.now(),
    tasks: [],
    status: 'in-progress'
  };
  
  activeWorkflowSession = session;
  console.log(`Initialized workflow session: ${name}`);
  return session;
}

/**
 * Add a task to the current workflow session
 */
export function addWorkflowTask(task: Omit<WorkflowTask, 'id' | 'status' | 'startTime'>): string {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newTask: WorkflowTask = {
    ...task,
    id: taskId,
    status: 'pending',
    startTime: Date.now()
  };
  
  activeWorkflowSession.tasks.push(newTask);
  console.log(`Added task: ${task.description}`);
  return taskId;
}

/**
 * Start a task by ID
 */
export function startWorkflowTask(taskId: string): void {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  const task = activeWorkflowSession.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  
  // Check if dependencies are completed
  if (task.dependencies && task.dependencies.length > 0) {
    const pendingDependencies = task.dependencies.filter(depId => {
      const depTask = activeWorkflowSession?.tasks.find(t => t.id === depId);
      return !depTask || depTask.status !== 'completed';
    });
    
    if (pendingDependencies.length > 0) {
      console.warn(`Cannot start task ${taskId}. Dependencies not completed: ${pendingDependencies.join(', ')}`);
      return;
    }
  }
  
  task.status = 'in-progress';
  task.startTime = Date.now();
  console.log(`Started task: ${task.description}`);
}

/**
 * Complete a task by ID
 */
export async function completeWorkflowTask(taskId: string, validateTask = true): Promise<boolean> {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  const task = activeWorkflowSession.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  
  // If the task has a validation function and validation is enabled, run it
  if (validateTask && task.validationFunction) {
    try {
      const validationResult = await task.validationFunction();
      
      if (!validationResult) {
        task.status = 'failed';
        task.errorDetails = 'Task validation failed';
        console.error(`Task validation failed: ${task.description}`);
        return false;
      }
    } catch (error) {
      task.status = 'failed';
      task.errorDetails = `Validation error: ${error.message || error}`;
      console.error(`Task validation error: ${task.description}`, error);
      return false;
    }
  }
  
  task.status = 'completed';
  task.endTime = Date.now();
  console.log(`Completed task: ${task.description}`);
  return true;
}

/**
 * Checks if all tasks in the workflow are completed
 */
export function areAllTasksCompleted(): boolean {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  const pendingTasks = activeWorkflowSession.tasks.filter(
    task => task.status !== 'completed'
  );
  
  return pendingTasks.length === 0;
}

/**
 * Validate that a workflow can be checkpointed
 * Ensures all tasks are completed and passes final validation
 */
export async function validateWorkflowForCheckpoint(): Promise<{
  canCheckpoint: boolean;
  pendingTasks: WorkflowTask[];
  validationReport?: any;
}> {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  // Check for any tasks that are not completed
  const pendingTasks = activeWorkflowSession.tasks.filter(
    task => task.status !== 'completed'
  );
  
  if (pendingTasks.length > 0) {
    console.warn('Cannot create checkpoint: Some tasks are still pending.');
    return {
      canCheckpoint: false,
      pendingTasks
    };
  }
  
  // Run a comprehensive validation as a final check
  try {
    console.log('Running comprehensive validation before checkpoint...');
    
    // Use existing validation utilities
    const validationReport = await runFullSystemValidation();
    
    // If validation failed, return false
    if (!validationReport.overallSuccess) {
      console.error('Comprehensive validation failed. Cannot create checkpoint.');
      return {
        canCheckpoint: false,
        pendingTasks: [],
        validationReport
      };
    }
    
    console.log('Comprehensive validation passed. Workflow can be checkpointed.');
    return {
      canCheckpoint: true,
      pendingTasks: [],
      validationReport
    };
  } catch (error) {
    console.error('Error during validation:', error);
    return {
      canCheckpoint: false,
      pendingTasks: [],
      validationReport: {
        error: error.message || 'Unknown error during validation'
      }
    };
  }
}

/**
 * Create a checkpoint for the workflow session
 */
export async function createWorkflowCheckpoint(message?: string): Promise<boolean> {
  if (!activeWorkflowSession) {
    throw new Error('No active workflow session. Call initializeWorkflowSession first.');
  }
  
  // Validate that all tasks are completed
  const { canCheckpoint, pendingTasks, validationReport } = await validateWorkflowForCheckpoint();
  
  if (!canCheckpoint) {
    console.error('Cannot create checkpoint: Validation failed.');
    
    if (pendingTasks.length > 0) {
      console.error('Pending tasks:');
      pendingTasks.forEach(task => {
        console.error(`- ${task.description} (${task.status})`);
      });
    }
    
    activeWorkflowSession.checkpoint = {
      id: `checkpoint-${Date.now()}`,
      createdAt: Date.now(),
      status: 'failed',
      message: 'Validation failed'
    };
    
    return false;
  }
  
  // Create the checkpoint
  activeWorkflowSession.checkpoint = {
    id: `checkpoint-${Date.now()}`,
    createdAt: Date.now(),
    status: 'created',
    message: message || 'Workflow completed successfully'
  };
  
  activeWorkflowSession.status = 'completed';
  
  console.log('Checkpoint created successfully.');
  console.log(activeWorkflowSession.checkpoint.message);
  
  return true;
}

/**
 * Get a summary of the current workflow session
 */
export function getWorkflowSummary(): {
  session: WorkflowSession | null;
  completedTasks: number;
  totalTasks: number;
  pendingTasks: WorkflowTask[];
  duration: number;
} {
  if (!activeWorkflowSession) {
    return {
      session: null,
      completedTasks: 0,
      totalTasks: 0,
      pendingTasks: [],
      duration: 0
    };
  }
  
  const completedTasks = activeWorkflowSession.tasks.filter(
    task => task.status === 'completed'
  ).length;
  
  const pendingTasks = activeWorkflowSession.tasks.filter(
    task => task.status !== 'completed'
  );
  
  const duration = Date.now() - activeWorkflowSession.createdAt;
  
  return {
    session: activeWorkflowSession,
    completedTasks,
    totalTasks: activeWorkflowSession.tasks.length,
    pendingTasks,
    duration
  };
}

/**
 * Generate predefined validation functions for common task types
 */
export const validationFunctions = {
  // Navigation validation
  validateNavigation: () => async (): Promise<boolean> => {
    const results = await verifyPageLinks();
    return results.potentialBrokenLinks.length === 0;
  },
  
  // Accessibility validation
  validateAccessibility: () => async (): Promise<boolean> => {
    const results = await runAccessibilityAudit();
    return results.score >= 80; // 80% threshold
  },
  
  // Keyboard navigation validation
  validateKeyboardNavigation: () => async (): Promise<boolean> => {
    const results = await testKeyboardNavigation();
    return results.success;
  },
  
  // API validation
  validateApi: () => async (): Promise<boolean> => {
    const results = await validateApiEndpoints();
    return results.success;
  },
  
  // Comprehensive validation
  validateAll: () => async (): Promise<boolean> => {
    const results = await validateImplementation();
    return results.success;
  }
};

/**
 * Create a workflow with common validation tasks
 */
export function createStandardWorkflow(name: string): WorkflowSession {
  const session = initializeWorkflowSession(name);
  
  // Add standard validation tasks
  addWorkflowTask({
    description: 'Validate page navigation',
    category: 'navigation',
    validationFunction: validationFunctions.validateNavigation()
  });
  
  addWorkflowTask({
    description: 'Validate accessibility',
    category: 'accessibility',
    validationFunction: validationFunctions.validateAccessibility()
  });
  
  addWorkflowTask({
    description: 'Validate keyboard navigation',
    category: 'accessibility',
    validationFunction: validationFunctions.validateKeyboardNavigation()
  });
  
  addWorkflowTask({
    description: 'Validate API endpoints',
    category: 'backend',
    validationFunction: validationFunctions.validateApi()
  });
  
  return session;
}

// Example usage:
// const workflow = createStandardWorkflow('Feature Implementation');
// 
// // Add custom tasks
// const customTaskId = addWorkflowTask({
//   description: 'Implement new feature',
//   category: 'other'
// });
// 
// // Later, when the task is completed
// await completeWorkflowTask(customTaskId);
// 
// // When all tasks are done, validate and create checkpoint
// if (areAllTasksCompleted()) {
//   const validationResult = await validateWorkflowForCheckpoint();
//   if (validationResult.canCheckpoint) {
//     await createWorkflowCheckpoint('Feature implemented successfully');
//   }
// }
