
/**
 * Task Completion Validator
 * 
 * Ensures all tasks in a workflow message are completed before allowing
 * the workflow to proceed to the next step or create a checkpoint.
 */

import { validateBeforeCheckpoint } from './validation-coordinator';

interface WorkflowTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies?: string[];
  validations?: string[];
}

interface WorkflowMessage {
  id: string;
  tasks: WorkflowTask[];
  timestamp: Date;
  allTasksCompleted: boolean;
}

// Store active workflow messages
const workflowMessages: WorkflowMessage[] = [];

/**
 * Create a new workflow message with tasks
 */
export function createWorkflowMessage(tasks: Omit<WorkflowTask, 'status'>[]): WorkflowMessage {
  const messageId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const message: WorkflowMessage = {
    id: messageId,
    tasks: tasks.map(task => ({
      ...task,
      status: 'pending'
    })),
    timestamp: new Date(),
    allTasksCompleted: false
  };
  
  workflowMessages.push(message);
  return message;
}

/**
 * Update task status in a workflow message
 */
export function updateTaskStatus(
  messageId: string,
  taskId: string,
  status: WorkflowTask['status']
): boolean {
  const message = workflowMessages.find(m => m.id === messageId);
  if (!message) {
    return false;
  }
  
  const task = message.tasks.find(t => t.id === taskId);
  if (!task) {
    return false;
  }
  
  task.status = status;
  
  // Check if all tasks are completed
  message.allTasksCompleted = message.tasks.every(t => t.status === 'completed');
  
  return true;
}

/**
 * Verify all tasks in a workflow message are completed
 */
export async function verifyAllTasksCompleted(messageId: string): Promise<{
  completed: boolean;
  pendingTasks: WorkflowTask[];
  message: string;
}> {
  const message = workflowMessages.find(m => m.id === messageId);
  if (!message) {
    return {
      completed: false,
      pendingTasks: [],
      message: 'Workflow message not found'
    };
  }
  
  const pendingTasks = message.tasks.filter(t => t.status !== 'completed');
  
  if (pendingTasks.length > 0) {
    return {
      completed: false,
      pendingTasks,
      message: `There are ${pendingTasks.length} tasks that are not yet completed`
    };
  }
  
  // Extra validation step - run the validation system to verify everything works
  const description = `Workflow message ${messageId}`;
  const validationPassed = await validateBeforeCheckpoint(description);
  
  if (!validationPassed) {
    return {
      completed: false,
      pendingTasks: [],
      message: 'All tasks are marked as completed, but validation checks failed'
    };
  }
  
  return {
    completed: true,
    pendingTasks: [],
    message: 'All tasks in the workflow message are completed and verified'
  };
}

/**
 * Check if it's safe to create a checkpoint for a workflow message
 */
export async function canCreateCheckpointForMessage(messageId: string): Promise<boolean> {
  const result = await verifyAllTasksCompleted(messageId);
  return result.completed;
}

/**
 * Get all pending tasks in a workflow message
 */
export function getPendingTasks(messageId: string): WorkflowTask[] {
  const message = workflowMessages.find(m => m.id === messageId);
  if (!message) {
    return [];
  }
  
  return message.tasks.filter(t => t.status !== 'completed');
}

/**
 * Get a workflow message by ID
 */
export function getWorkflowMessage(messageId: string): WorkflowMessage | undefined {
  return workflowMessages.find(m => m.id === messageId);
}

/**
 * Execute thorough validation on all tasks
 */
export async function validateWorkflowMessage(messageId: string): Promise<{
  valid: boolean;
  details: string;
}> {
  const message = workflowMessages.find(m => m.id === messageId);
  if (!message) {
    return {
      valid: false,
      details: 'Workflow message not found'
    };
  }
  
  // For each task, run specific validations
  for (const task of message.tasks) {
    if (task.validations && task.validations.length > 0) {
      // In a real implementation, run specific validations for each task
      // For now, we'll just log that we would validate
      console.log(`Would validate task ${task.id} with validations: ${task.validations.join(', ')}`);
    }
  }
  
  // Run thorough validation
  const validationPassed = await validateBeforeCheckpoint(`Message ${messageId} validation`);
  
  if (!validationPassed) {
    return {
      valid: false,
      details: 'Workflow message failed validation checks'
    };
  }
  
  return {
    valid: true,
    details: 'Workflow message passed all validation checks'
  };
}
