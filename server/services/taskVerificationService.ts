
import { ServiceRegistry } from './registry';
import * as logger from '../utils/logger';

/**
 * Centralized service for task verification 
 * Integrates the various verification tools into a unified API
 */
export class TaskVerificationService {
  private registry: ServiceRegistry;
  private tasks: Map<string, TaskStatus> = new Map();
  
  constructor() {
    this.registry = ServiceRegistry.getInstance();
  }
  
  /**
   * Register a new task for verification
   */
  public registerTask(taskId: string, name: string, category: string): void {
    this.tasks.set(taskId, {
      id: taskId,
      name,
      category,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    logger.info(`Task registered: ${name} (${taskId})`);
  }
  
  /**
   * Mark a task as completed
   */
  public completeTask(taskId: string, details?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`Attempted to complete unknown task: ${taskId}`);
      return false;
    }
    
    this.tasks.set(taskId, {
      ...task,
      status: 'completed',
      details,
      updatedAt: new Date()
    });
    
    logger.info(`Task completed: ${task.name} (${taskId})`);
    return true;
  }
  
  /**
   * Mark a task as failed
   */
  public failTask(taskId: string, details?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`Attempted to fail unknown task: ${taskId}`);
      return false;
    }
    
    this.tasks.set(taskId, {
      ...task,
      status: 'failed',
      details,
      updatedAt: new Date()
    });
    
    logger.error(`Task failed: ${task.name} (${taskId}): ${details || 'No details provided'}`);
    return true;
  }
  
  /**
   * Verify a specific task
   */
  public async verifyTask(taskId: string): Promise<VerificationResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return {
        success: false,
        message: `Task ${taskId} not found`
      };
    }
    
    // Add custom verification logic based on task category
    try {
      logger.info(`Verifying task: ${task.name} (${taskId})`);
      
      // For now, just check if it's marked as completed
      const isCompleted = task.status === 'completed';
      
      return {
        success: isCompleted,
        message: isCompleted ? 'Task verified successfully' : 'Task not completed',
        taskId,
        taskName: task.name
      };
    } catch (error) {
      logger.error(`Error verifying task ${taskId}:`, error);
      return {
        success: false,
        message: `Error verifying task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        taskId,
        taskName: task.name
      };
    }
  }
  
  /**
   * Get status of all tasks
   */
  public getTasksStatus(): TaskVerificationStatus {
    const allTasks = Array.from(this.tasks.values());
    
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const pendingTasks = allTasks.filter(task => task.status === 'pending');
    const failedTasks = allTasks.filter(task => task.status === 'failed');
    
    const allCompleted = pendingTasks.length === 0 && failedTasks.length === 0;
    
    return {
      allTasksComplete: allCompleted,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.map(task => ({
        id: task.id,
        name: task.name,
        category: task.category
      })),
      pendingTasks: pendingTasks.map(task => ({
        id: task.id,
        name: task.name,
        category: task.category
      })),
      failedTasks: failedTasks.map(task => ({
        id: task.id,
        name: task.name,
        category: task.category,
        details: task.details
      }))
    };
  }
  
  /**
   * Check if a checkpoint can be created
   */
  public canCreateCheckpoint(): boolean {
    const status = this.getTasksStatus();
    return status.allTasksComplete;
  }
  
  /**
   * Create a new checkpoint if all tasks are verified
   */
  public async createCheckpoint(name: string, description?: string): Promise<CheckpointResult> {
    if (!this.canCreateCheckpoint()) {
      return {
        success: false,
        message: 'Cannot create checkpoint: Not all tasks are complete'
      };
    }
    
    // Create checkpoint logic here
    const checkpoint = {
      id: `checkpoint-${Date.now()}`,
      name,
      description: description || `Checkpoint created at ${new Date().toISOString()}`,
      createdAt: new Date(),
      tasks: Array.from(this.tasks.values())
    };
    
    logger.info(`Checkpoint created: ${name} (${checkpoint.id})`);
    
    return {
      success: true,
      message: 'Checkpoint created successfully',
      checkpoint
    };
  }
  
  /**
   * Reset all tasks
   */
  public resetTasks(): void {
    this.tasks.clear();
    logger.info('All tasks have been reset');
  }
}

// Types
export interface TaskStatus {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  taskId?: string;
  taskName?: string;
  details?: any;
}

export interface TaskVerificationStatus {
  allTasksComplete: boolean;
  totalTasks: number;
  completedTasks: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  pendingTasks: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  failedTasks: Array<{
    id: string;
    name: string;
    category: string;
    details?: string;
  }>;
}

export interface CheckpointResult {
  success: boolean;
  message: string;
  checkpoint?: any;
}

// Register the service
const taskVerificationService = new TaskVerificationService();
ServiceRegistry.getInstance().registerService('taskVerification', taskVerificationService);

export default taskVerificationService;
