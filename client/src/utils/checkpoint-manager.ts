
/**
 * Checkpoint management system to ensure all tasks are complete before saving progress
 */

import { WorkflowTask, WorkflowValidationResult, executeAndValidateWorkflow, createWorkflow } from './workflow-validator';
import { toast } from '../components/ui/toast';

export interface CheckpointData {
  id: string;
  name: string;
  timestamp: string;
  tasksCompleted: string[];
  validationReport: string;
}

class CheckpointManager {
  private activeWorkflowTasks: WorkflowTask[] = [];
  private pendingCheckpoint: string | null = null;
  private checkpoints: CheckpointData[] = [];
  
  /**
   * Set up a new workflow of tasks that must be completed before creating a checkpoint
   */
  setUpWorkflow(
    taskDefinitions: Array<Omit<WorkflowTask, 'completed' | 'errorDetails'>>,
    pendingCheckpointName: string
  ): void {
    this.activeWorkflowTasks = createWorkflow(taskDefinitions);
    this.pendingCheckpoint = pendingCheckpointName;
    
    console.log(`New workflow set up with ${taskDefinitions.length} tasks`);
    console.log(`Pending checkpoint: ${pendingCheckpointName}`);
    
    // Notify user
    toast({
      title: 'New workflow initialized',
      description: `${taskDefinitions.length} tasks must be completed before creating the "${pendingCheckpointName}" checkpoint.`,
      duration: 3000
    });
  }
  
  /**
   * Mark a specific task as completed
   */
  markTaskCompleted(taskId: string): void {
    const task = this.activeWorkflowTasks.find(t => t.id === taskId);
    
    if (task) {
      task.completed = true;
      console.log(`Task "${taskId}" marked as completed`);
    } else {
      console.warn(`Task "${taskId}" not found in active workflow`);
    }
  }
  
  /**
   * Check if all tasks have been marked as completed
   */
  areAllTasksMarkedCompleted(): boolean {
    return this.activeWorkflowTasks.every(task => task.completed);
  }
  
  /**
   * Validate all tasks in the current workflow
   */
  async validateWorkflow(notifyUser: boolean = true): Promise<WorkflowValidationResult> {
    if (this.activeWorkflowTasks.length === 0) {
      throw new Error('No active workflow to validate');
    }
    
    const result = await executeAndValidateWorkflow(this.activeWorkflowTasks);
    
    if (notifyUser) {
      if (result.canProceedToCheckpoint) {
        toast({
          title: 'Validation successful',
          description: 'All tasks have been completed and validated successfully.',
          duration: 5000
        });
      } else {
        toast({
          title: 'Validation failed',
          description: 'Not all tasks have been completed or validated successfully.',
          variant: 'destructive',
          duration: 5000
        });
      }
    }
    
    return result;
  }
  
  /**
   * Create a checkpoint if all tasks have been validated
   */
  async createCheckpoint(): Promise<boolean> {
    if (!this.pendingCheckpoint) {
      console.error('No pending checkpoint name set');
      return false;
    }
    
    try {
      // Validate the workflow first
      const validationResult = await this.validateWorkflow(false);
      
      if (!validationResult.canProceedToCheckpoint) {
        toast({
          title: 'Cannot create checkpoint',
          description: 'Not all tasks are complete or validation failed. Please check the console for details.',
          variant: 'destructive',
          duration: 5000
        });
        
        console.error('Cannot create checkpoint:');
        console.error(validationResult.validationReport);
        return false;
      }
      
      // Create the checkpoint
      const checkpointId = `cp-${Date.now()}`;
      
      const checkpoint: CheckpointData = {
        id: checkpointId,
        name: this.pendingCheckpoint,
        timestamp: new Date().toISOString(),
        tasksCompleted: this.activeWorkflowTasks.map(t => t.id),
        validationReport: validationResult.validationReport
      };
      
      this.checkpoints.push(checkpoint);
      
      // Reset the current workflow
      this.activeWorkflowTasks = [];
      this.pendingCheckpoint = null;
      
      toast({
        title: 'Checkpoint created',
        description: `Checkpoint "${checkpoint.name}" created successfully.`,
        duration: 3000
      });
      
      console.log(`Checkpoint "${checkpoint.name}" created with ID: ${checkpointId}`);
      return true;
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      
      toast({
        title: 'Checkpoint creation failed',
        description: `Error: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
        duration: 5000
      });
      
      return false;
    }
  }
  
  /**
   * Get all created checkpoints
   */
  getCheckpoints(): CheckpointData[] {
    return [...this.checkpoints];
  }
  
  /**
   * Get a specific checkpoint by ID
   */
  getCheckpointById(id: string): CheckpointData | undefined {
    return this.checkpoints.find(cp => cp.id === id);
  }
  
  /**
   * Clear all active workflow tasks and pending checkpoint
   */
  clearActiveWorkflow(): void {
    this.activeWorkflowTasks = [];
    this.pendingCheckpoint = null;
    console.log('Active workflow cleared');
  }
}

// Create a singleton instance
export const checkpointManager = new CheckpointManager();

// Export for use in other parts of the application
export default checkpointManager;
