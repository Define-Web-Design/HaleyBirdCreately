
/**
 * Checkpoint Manager
 * Ensures all tasks are completed and verified before creating checkpoints
 */

import { WorkflowValidator, WorkflowTask } from './workflow-validator';

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tasks: WorkflowTask[];
  verificationReport: string;
}

export class CheckpointManager {
  private checkpoints: Checkpoint[] = [];
  private workflowValidator: WorkflowValidator;
  
  constructor() {
    this.workflowValidator = new WorkflowValidator();
    // Initialize with default tasks
    this.workflowValidator.addTasks(WorkflowValidator.createDefaultWorkflowTasks());
  }
  
  /**
   * Add custom tasks to the workflow validator
   */
  addCustomTasks(tasks: WorkflowTask[]): void {
    this.workflowValidator.addTasks(tasks);
  }
  
  /**
   * Try to create a checkpoint - will only succeed if all tasks are verified
   */
  async tryCreateCheckpoint(name: string, description: string): Promise<{
    success: boolean;
    message: string;
    checkpoint?: Checkpoint;
  }> {
    const checkpointStatus = await this.workflowValidator.canCreateCheckpoint();
    
    if (!checkpointStatus.safe) {
      return {
        success: false,
        message: checkpointStatus.reason || 'Cannot create checkpoint - workflow verification failed'
      };
    }
    
    const verificationReport = await this.workflowValidator.generateVerificationReport();
    
    const checkpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      tasks: Array.from(checkpointStatus.verificationResult.completedTasks),
      verificationReport
    };
    
    this.checkpoints.push(checkpoint);
    
    return {
      success: true,
      message: `Checkpoint "${name}" created successfully`,
      checkpoint
    };
  }
  
  /**
   * Get all checkpoints
   */
  getCheckpoints(): Checkpoint[] {
    return [...this.checkpoints];
  }
  
  /**
   * Get a specific checkpoint by ID
   */
  getCheckpoint(id: string): Checkpoint | undefined {
    return this.checkpoints.find(cp => cp.id === id);
  }
  
  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'failed', details?: any): void {
    this.workflowValidator.updateTaskStatus(taskId, status, details);
  }
  
  /**
   * Check if all requested tasks are completed
   */
  async verifyTasksCompleted(taskIds: string[]): Promise<boolean> {
    return this.workflowValidator.verifyTasksCompleted(taskIds);
  }
  
  /**
   * Generate a verification report
   */
  async generateVerificationReport(): Promise<string> {
    return this.workflowValidator.generateVerificationReport();
  }
}

// Create a singleton instance for global use
export const checkpointManager = new CheckpointManager();

// Example usage:
// 
// // Update task status as they are completed
// checkpointManager.updateTaskStatus('nav-links', 'completed');
// checkpointManager.updateTaskStatus('a11y', 'completed');
// 
// // Try to create a checkpoint when ready
// const result = await checkpointManager.tryCreateCheckpoint(
//   'Initial Implementation',
//   'First version of the feature with basic functionality'
// );
// 
// if (result.success) {
//   console.log('Checkpoint created:', result.checkpoint);
// } else {
//   console.error('Failed to create checkpoint:', result.message);
// }
