
/**
 * Task Verification Implementation
 * Core logic for verifying task completion and enforcing task requirements
 */

import { 
  runAccessibilityAudit, 
  verifyPageLinks, 
  testKeyboardNavigation 
} from './navigation-tester';
import { 
  validateApiEndpoints 
} from './api-validator';
import { 
  validateImplementation 
} from './validate-implementation';

/**
 * Task categories and their verification functions
 */
const VERIFICATION_FUNCTIONS = {
  accessibility: async () => {
    const results = await runAccessibilityAudit();
    return {
      success: results.score >= 80,
      details: `Accessibility score: ${results.score}%`,
      data: results
    };
  },
  api: async () => {
    const results = await validateApiEndpoints();
    return {
      success: results.success,
      details: results.success 
        ? `API validation: ${results.results.filter(r => r.valid).length}/${results.results.length} endpoints valid` 
        : `API validation failed: ${results.results.filter(r => !r.valid).length} endpoints failing`,
      data: results
    };
  },
  navigation: async () => {
    const results = await verifyPageLinks();
    return {
      success: results.potentialBrokenLinks.length === 0,
      details: results.potentialBrokenLinks.length === 0
        ? `Navigation validation: ${results.totalLinks} links verified`
        : `Navigation validation failed: ${results.potentialBrokenLinks.length} broken links`,
      data: results
    };
  },
  keyboard: async () => {
    const results = await testKeyboardNavigation();
    return {
      success: results.success,
      details: results.success
        ? `Keyboard navigation validated with ${results.focusableElements} focusable elements`
        : `Keyboard navigation issues: ${results.issues.join(', ')}`,
      data: results
    };
  },
  implementation: async () => {
    const results = await validateImplementation();
    return {
      success: results.success,
      details: results.success
        ? `Implementation validation passed: ${results.details?.checksCompleted || 0} checks completed`
        : `Implementation validation failed: ${results.details?.failedChecks || 0} checks failed`,
      data: results
    };
  }
};

/**
 * Task validation registry
 */
const taskRegistry = new Map<string, {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  createdAt: Date;
  updatedAt: Date;
  validationFn?: () => Promise<any>;
}>();

/**
 * Register a new task
 */
export function registerTask(id: string, name: string, category: string, validationFn?: () => Promise<any>): void {
  taskRegistry.set(id, {
    id,
    name,
    category,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    validationFn
  });
  
  console.log(`Task registered: ${name} (${id})`);
}

/**
 * Mark a task as completed
 */
export function completeTask(id: string, details?: string): boolean {
  const task = taskRegistry.get(id);
  if (!task) {
    console.warn(`Attempted to complete unknown task: ${id}`);
    return false;
  }
  
  taskRegistry.set(id, {
    ...task,
    status: 'completed',
    details,
    updatedAt: new Date()
  });
  
  console.log(`Task completed: ${task.name} (${id})`);
  return true;
}

/**
 * Mark a task as failed
 */
export function failTask(id: string, details?: string): boolean {
  const task = taskRegistry.get(id);
  if (!task) {
    console.warn(`Attempted to fail unknown task: ${id}`);
    return false;
  }
  
  taskRegistry.set(id, {
    ...task,
    status: 'failed',
    details,
    updatedAt: new Date()
  });
  
  console.error(`Task failed: ${task.name} (${id}): ${details || 'No details provided'}`);
  return true;
}

/**
 * Get status of all tasks
 */
export function getTasksStatus(): {
  allTasksComplete: boolean;
  totalTasks: number;
  completedTasks: any[];
  pendingTasks: any[];
  failedTasks: any[];
} {
  const allTasks = Array.from(taskRegistry.values());
  
  const completedTasks = allTasks.filter(task => task.status === 'completed');
  const pendingTasks = allTasks.filter(task => task.status === 'pending');
  const failedTasks = allTasks.filter(task => task.status === 'failed');
  
  const allCompleted = pendingTasks.length === 0 && failedTasks.length === 0;
  
  return {
    allTasksComplete: allCompleted,
    totalTasks: allTasks.length,
    completedTasks,
    pendingTasks,
    failedTasks
  };
}

/**
 * Verify a specific task
 */
export async function verifyTask(id: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const task = taskRegistry.get(id);
  if (!task) {
    return {
      success: false,
      message: `Task ${id} not found`
    };
  }
  
  try {
    console.log(`Verifying task: ${task.name} (${id})`);
    
    // If task has a custom validation function, use it
    if (task.validationFn) {
      const result = await task.validationFn();
      
      if (result && result.success) {
        completeTask(id, result.details);
        return {
          success: true,
          message: `Task verified successfully: ${result.details || 'No details'}`,
          details: result
        };
      } else {
        failTask(id, result?.details || 'Validation failed');
        return {
          success: false,
          message: `Task verification failed: ${result?.details || 'No details'}`,
          details: result
        };
      }
    }
    
    // If task is in a known category, use category validation
    if (task.category in VERIFICATION_FUNCTIONS) {
      const verificationFn = VERIFICATION_FUNCTIONS[task.category as keyof typeof VERIFICATION_FUNCTIONS];
      const result = await verificationFn();
      
      if (result.success) {
        completeTask(id, result.details);
        return {
          success: true,
          message: `Task verified successfully: ${result.details}`,
          details: result.data
        };
      } else {
        failTask(id, result.details);
        return {
          success: false,
          message: `Task verification failed: ${result.details}`,
          details: result.data
        };
      }
    }
    
    // If no validation available, check if it's already marked as completed
    const isCompleted = task.status === 'completed';
    
    return {
      success: isCompleted,
      message: isCompleted ? 'Task is marked as completed (no validation performed)' : 'Task is not marked as completed'
    };
  } catch (error) {
    console.error(`Error verifying task ${id}:`, error);
    
    failTask(id, error instanceof Error ? error.message : 'Unknown error');
    
    return {
      success: false,
      message: `Error verifying task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Verify all registered tasks
 */
export async function verifyAllTasks(): Promise<boolean> {
  console.log('Verifying all tasks...');
  
  let allSuccessful = true;
  
  for (const task of taskRegistry.values()) {
    if (task.status === 'completed') {
      console.log(`Skipping already completed task: ${task.name} (${task.id})`);
      continue;
    }
    
    const result = await verifyTask(task.id);
    
    if (!result.success) {
      allSuccessful = false;
    }
  }
  
  const status = getTasksStatus();
  
  console.log('Verification complete');
  console.log(`Total: ${status.totalTasks}, Completed: ${status.completedTasks.length}, Failed: ${status.failedTasks.length}, Pending: ${status.pendingTasks.length}`);
  
  return allSuccessful;
}

/**
 * Check if checkpoint can be created
 */
export function canCreateCheckpoint(): boolean {
  const status = getTasksStatus();
  return status.allTasksComplete;
}

/**
 * Register default tasks
 */
export function registerDefaultTasks(): void {
  // Clear existing tasks
  taskRegistry.clear();
  
  // Register accessibility tasks
  registerTask('accessibility-audit', 'Accessibility Audit', 'accessibility');
  registerTask('keyboard-navigation', 'Keyboard Navigation', 'keyboard');
  
  // Register API tasks
  registerTask('api-endpoints', 'API Endpoints Validation', 'api');
  
  // Register navigation tasks
  registerTask('page-links', 'Page Links Validation', 'navigation');
  
  // Register implementation tasks
  registerTask('implementation-validation', 'Implementation Validation', 'implementation');
}

/**
 * Reset all tasks
 */
export function resetTasks(): void {
  taskRegistry.clear();
  console.log('All tasks have been reset');
}

/**
 * Create a unique task ID
 */
export function createTaskId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Export default singleton
export const TaskVerificationImplementation = {
  registerTask,
  completeTask,
  failTask,
  getTasksStatus,
  verifyTask,
  verifyAllTasks,
  canCreateCheckpoint,
  registerDefaultTasks,
  resetTasks,
  createTaskId
};

export default TaskVerificationImplementation;
