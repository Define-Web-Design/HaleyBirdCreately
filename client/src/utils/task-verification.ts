
/**
 * Task Verification System
 * Ensures all requested tasks are completed and validated before allowing checkpoints
 */

import { validateImplementation } from './validate-implementation';
import { validateApiEndpoints } from './api-validator';
import { runAccessibilityAudit, verifyPageLinks, testKeyboardNavigation } from './navigation-tester';

export interface TaskVerificationResult {
  completed: boolean;
  taskResults: {
    taskId: string;
    name: string;
    status: 'completed' | 'failed' | 'pending';
    details: string;
    timestamp: string;
  }[];
  summary: string;
  blockers: string[];
}

// Task verification registry to track all tasks
let pendingTasks: Map<string, {
  name: string;
  status: 'pending' | 'completed' | 'failed';
  details: string;
  timestamp: string;
}> = new Map();

/**
 * Register a new task to be verified
 */
export function registerTask(taskId: string, taskName: string): void {
  pendingTasks.set(taskId, {
    name: taskName,
    status: 'pending',
    details: 'Task registered for verification',
    timestamp: new Date().toISOString()
  });
  
  console.log(`Task registered: ${taskName} (${taskId})`);
}

/**
 * Mark a task as completed
 */
export function completeTask(taskId: string, details: string = 'Task completed successfully'): void {
  const task = pendingTasks.get(taskId);
  if (!task) {
    console.warn(`Attempted to complete unknown task: ${taskId}`);
    return;
  }
  
  pendingTasks.set(taskId, {
    ...task,
    status: 'completed',
    details,
    timestamp: new Date().toISOString()
  });
  
  console.log(`Task completed: ${task.name} (${taskId})`);
}

/**
 * Mark a task as failed
 */
export function failTask(taskId: string, details: string = 'Task failed'): void {
  const task = pendingTasks.get(taskId);
  if (!task) {
    console.warn(`Attempted to fail unknown task: ${taskId}`);
    return;
  }
  
  pendingTasks.set(taskId, {
    ...task,
    status: 'failed',
    details,
    timestamp: new Date().toISOString()
  });
  
  console.error(`Task failed: ${task.name} (${taskId}): ${details}`);
}

/**
 * Get the current verification status
 */
export function getVerificationStatus(): TaskVerificationResult {
  const taskResults = Array.from(pendingTasks.entries()).map(([taskId, task]) => ({
    taskId,
    name: task.name,
    status: task.status,
    details: task.details,
    timestamp: task.timestamp
  }));
  
  const allCompleted = taskResults.every(task => task.status === 'completed');
  const blockers = taskResults
    .filter(task => task.status !== 'completed')
    .map(task => `${task.name}: ${task.details}`);
  
  const completedCount = taskResults.filter(task => task.status === 'completed').length;
  const failedCount = taskResults.filter(task => task.status === 'failed').length;
  const pendingCount = taskResults.filter(task => task.status === 'pending').length;
  
  const summary = `Verification status: ${completedCount} completed, ${failedCount} failed, ${pendingCount} pending`;
  
  return {
    completed: allCompleted,
    taskResults,
    summary,
    blockers
  };
}

/**
 * Reset all task verifications
 */
export function resetVerification(): void {
  pendingTasks = new Map();
  console.log('Task verification system reset');
}

/**
 * Run comprehensive verification on all pending tasks
 */
export async function verifyAllTasks(): Promise<TaskVerificationResult> {
  console.log('Starting comprehensive task verification...');
  
  // First run individual verification methods for each task
  const taskIds = Array.from(pendingTasks.keys());
  
  for (const taskId of taskIds) {
    const task = pendingTasks.get(taskId);
    if (!task || task.status !== 'pending') continue;
    
    try {
      // Run specific verification based on task type
      if (taskId.startsWith('accessibility')) {
        const a11yResults = await runAccessibilityAudit();
        if (a11yResults.score >= 80) {
          completeTask(taskId, `Accessibility score: ${a11yResults.score}%`);
        } else {
          failTask(taskId, `Accessibility score below threshold: ${a11yResults.score}%`);
        }
      } else if (taskId.startsWith('api')) {
        const apiResults = await validateApiEndpoints();
        if (apiResults.success) {
          completeTask(taskId, `API validation: ${apiResults.results.length} endpoints verified`);
        } else {
          failTask(taskId, `API validation failed: ${apiResults.results.filter(r => !r.valid).length} endpoints failing`);
        }
      } else if (taskId.startsWith('navigation')) {
        const navResults = await verifyPageLinks();
        if (navResults.potentialBrokenLinks.length === 0) {
          completeTask(taskId, `Navigation validation: ${navResults.totalLinks} links verified`);
        } else {
          failTask(taskId, `Navigation validation failed: ${navResults.potentialBrokenLinks.length} broken links`);
        }
      } else if (taskId.startsWith('keyboard')) {
        const keyboardResults = await testKeyboardNavigation();
        if (keyboardResults.success) {
          completeTask(taskId, `Keyboard navigation validated with ${keyboardResults.focusableElements} focusable elements`);
        } else {
          failTask(taskId, `Keyboard navigation issues: ${keyboardResults.issues.join(', ')}`);
        }
      }
      // Add other specific verifications here
    } catch (error) {
      failTask(taskId, `Verification error: ${error.message || 'Unknown error'}`);
    }
  }
  
  // Finally run the comprehensive implementation validation
  try {
    const implementationResults = await validateImplementation();
    
    // If implementation validation fails, fail any remaining pending tasks
    if (!implementationResults.success) {
      for (const taskId of taskIds) {
        const task = pendingTasks.get(taskId);
        if (task && task.status === 'pending') {
          failTask(taskId, 'Failed due to overall implementation validation failure');
        }
      }
    }
  } catch (error) {
    console.error('Error in implementation validation:', error);
    // Mark all remaining pending tasks as failed
    for (const taskId of taskIds) {
      const task = pendingTasks.get(taskId);
      if (task && task.status === 'pending') {
        failTask(taskId, `Validation error: ${error.message || 'Unknown error'}`);
      }
    }
  }
  
  return getVerificationStatus();
}

/**
 * Create a unique task ID
 */
export function createTaskId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if a checkpoint can be created
 * @returns true if all tasks are completed and checkpoint can be created
 */
export function canCreateCheckpoint(): boolean {
  const status = getVerificationStatus();
  return status.completed;
}

/**
 * Verify that a specific set of tasks are completed
 * @param taskIds Array of task IDs to verify
 * @returns result indicating if all specified tasks are completed
 */
export function verifySpecificTasks(taskIds: string[]): {
  allCompleted: boolean;
  completedTasks: string[];
  pendingTasks: string[];
  failedTasks: string[];
} {
  const completed: string[] = [];
  const pending: string[] = [];
  const failed: string[] = [];
  
  for (const taskId of taskIds) {
    const task = pendingTasks.get(taskId);
    if (!task) {
      pending.push(taskId);
    } else if (task.status === 'completed') {
      completed.push(taskId);
    } else if (task.status === 'failed') {
      failed.push(taskId);
    } else {
      pending.push(taskId);
    }
  }
  
  return {
    allCompleted: pending.length === 0 && failed.length === 0,
    completedTasks: completed,
    pendingTasks: pending,
    failedTasks: failed
  };
}

// Export a singleton to ensure consistent state
export const TaskVerification = {
  registerTask,
  completeTask,
  failTask,
  getVerificationStatus,
  resetVerification,
  verifyAllTasks,
  createTaskId,
  canCreateCheckpoint,
  verifySpecificTasks
};

export default TaskVerification;
