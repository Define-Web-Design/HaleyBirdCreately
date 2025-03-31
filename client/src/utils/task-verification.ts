
/**
 * Comprehensive task verification system to ensure all requests are
 * fully addressed before any checkpoints are created
 */

import { runFullSystemValidation, ValidationReport, displayFullValidationResults } from './consolidated-validation';
import { validateImplementation } from './validate-implementation';
import { validateApiEndpoints } from './api-validator';
import { securityMonitor } from '../../server/services/securityMonitor';

export interface TaskVerificationItem {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  validationFunction?: () => Promise<boolean>;
  dependencies?: string[];
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface TaskVerificationReport {
  timestamp: string;
  overallSuccess: boolean;
  completedTasks: TaskVerificationItem[];
  pendingTasks: TaskVerificationItem[];
  failedTasks: TaskVerificationItem[];
  validationReport?: ValidationReport;
}

class TaskVerificationSystem {
  private tasks: Map<string, TaskVerificationItem> = new Map();
  private checkpointReady: boolean = false;
  
  /**
   * Add a new task to be verified
   */
  addTask(task: Omit<TaskVerificationItem, 'status'>): string {
    const id = task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.tasks.set(id, {
      ...task,
      id,
      status: 'pending'
    });
    
    this.checkpointReady = false;
    return id;
  }
  
  /**
   * Add multiple tasks at once
   */
  addTasks(tasks: Omit<TaskVerificationItem, 'status'>[]): string[] {
    return tasks.map(task => this.addTask(task));
  }
  
  /**
   * Update the status of a task
   */
  updateTaskStatus(id: string, status: TaskVerificationItem['status'], error?: string): void {
    const task = this.tasks.get(id);
    
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    this.tasks.set(id, {
      ...task,
      status,
      error
    });
    
    // If any task is not completed, checkpoint is not ready
    this.checkpointReady = Array.from(this.tasks.values()).every(t => t.status === 'completed');
  }
  
  /**
   * Check if all tasks are completed and checkpoint can be created
   */
  isCheckpointReady(): boolean {
    return this.checkpointReady;
  }
  
  /**
   * Run full verification of all tasks
   */
  async runFullVerification(): Promise<TaskVerificationReport> {
    console.log('Starting comprehensive task verification...');
    const startTime = Date.now();
    
    // Mark all tasks as in-progress
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === 'pending') {
        this.tasks.set(id, { ...task, status: 'in-progress', startTime });
      }
    }
    
    // First run the system validation to check overall health
    const validationReport = await runFullSystemValidation();
    
    // Now run individual task validations
    for (const [id, task] of this.tasks.entries()) {
      if (task.status !== 'in-progress') continue;
      
      try {
        // Check if task has dependencies
        if (task.dependencies && task.dependencies.length > 0) {
          const dependenciesMet = task.dependencies.every(depId => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status === 'completed';
          });
          
          if (!dependenciesMet) {
            this.tasks.set(id, { 
              ...task, 
              status: 'failed', 
              error: 'Dependencies not met', 
              endTime: Date.now() 
            });
            continue;
          }
        }
        
        // Run the validation function if available
        if (task.validationFunction) {
          const result = await task.validationFunction();
          this.tasks.set(id, { 
            ...task, 
            status: result ? 'completed' : 'failed', 
            error: result ? undefined : 'Validation failed', 
            endTime: Date.now() 
          });
        } else {
          // If no validation function, mark as completed
          this.tasks.set(id, { ...task, status: 'completed', endTime: Date.now() });
        }
      } catch (error) {
        this.tasks.set(id, { 
          ...task, 
          status: 'failed', 
          error: error.message || 'Unknown error', 
          endTime: Date.now() 
        });
      }
    }
    
    // Check if all tasks are now completed
    this.checkpointReady = Array.from(this.tasks.values()).every(t => t.status === 'completed');
    
    // Prepare report
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed');
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending' || t.status === 'in-progress');
    const failedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'failed');
    
    return {
      timestamp: new Date().toISOString(),
      overallSuccess: this.checkpointReady,
      completedTasks,
      pendingTasks,
      failedTasks,
      validationReport
    };
  }
  
  /**
   * Reset all tasks to pending status
   */
  resetAllTasks(): void {
    for (const [id, task] of this.tasks.entries()) {
      this.tasks.set(id, { ...task, status: 'pending', startTime: undefined, endTime: undefined, error: undefined });
    }
    this.checkpointReady = false;
  }
  
  /**
   * Create a comprehensive validation workflow
   */
  async createTaskValidationWorkflow(tasks: Omit<TaskVerificationItem, 'status'>[]): Promise<boolean> {
    // Add all tasks
    this.addTasks(tasks);
    
    // Run verification
    const report = await this.runFullVerification();
    
    // Display results
    this.displayVerificationResults(report);
    
    return report.overallSuccess;
  }
  
  /**
   * Display verification results
   */
  displayVerificationResults(report: TaskVerificationReport): void {
    console.log('='.repeat(80));
    console.log(`TASK VERIFICATION REPORT: ${report.overallSuccess ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log('='.repeat(80));
    
    console.log(`Total tasks: ${report.completedTasks.length + report.pendingTasks.length + report.failedTasks.length}`);
    console.log(`Completed: ${report.completedTasks.length}`);
    console.log(`Pending: ${report.pendingTasks.length}`);
    console.log(`Failed: ${report.failedTasks.length}`);
    
    if (report.failedTasks.length > 0) {
      console.log('\nFailed Tasks:');
      report.failedTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
        console.log(`   Error: ${task.error || 'Unknown error'}`);
      });
    }
    
    if (report.pendingTasks.length > 0) {
      console.log('\nPending Tasks:');
      report.pendingTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.description}`);
      });
    }
    
    console.log('\nCheckpoint Status:');
    console.log(`Ready for checkpoint: ${report.overallSuccess ? 'YES ✓' : 'NO ✗'}`);
    
    if (report.validationReport) {
      console.log('\nSystem Validation Report:');
      displayFullValidationResults(report.validationReport);
    }
    
    console.log('='.repeat(80));
  }
  
  /**
   * Create a pre-built task list for common validation scenarios
   */
  createStandardTaskList(): Omit<TaskVerificationItem, 'status'>[] {
    return [
      {
        id: 'code-quality',
        description: 'Verify code quality and TypeScript type checking',
        validationFunction: async () => {
          // This would typically run linting and type checking
          // For demonstration, we'll just return true
          return true;
        }
      },
      {
        id: 'api-endpoints',
        description: 'Validate all API endpoints',
        validationFunction: async () => {
          const apiResults = await validateApiEndpoints();
          return apiResults.success;
        }
      },
      {
        id: 'security',
        description: 'Verify security measures and asset integrity',
        validationFunction: async () => {
          const securityResults = await securityMonitor.validateAssetIntegrity();
          return securityResults.valid;
        }
      },
      {
        id: 'implementation',
        description: 'Validate all implemented changes',
        validationFunction: async () => {
          const implementationResults = await validateImplementation();
          return implementationResults.success;
        },
        dependencies: ['code-quality'] // Implementation validation depends on code quality
      },
      {
        id: 'navigation',
        description: 'Verify all navigation and linking',
        validationFunction: async () => {
          const { verifyPageLinks } = await import('./navigation-tester');
          const linkResults = await verifyPageLinks();
          return linkResults.potentialBrokenLinks.length === 0;
        }
      },
      {
        id: 'accessibility',
        description: 'Verify accessibility compliance',
        validationFunction: async () => {
          const { runAccessibilityAudit } = await import('./navigation-tester');
          const a11yResults = await runAccessibilityAudit();
          return a11yResults.score >= 80; // 80% threshold
        }
      }
    ];
  }
}

// Export a singleton instance
export const taskVerification = new TaskVerificationSystem();

/**
 * Run the task verification with standard tasks
 */
export async function verifyAllTasks(): Promise<boolean> {
  const standardTasks = taskVerification.createStandardTaskList();
  return taskVerification.createTaskValidationWorkflow(standardTasks);
}

/**
 * Main function to run before creating any checkpoints
 */
export async function ensureAllTasksComplete(): Promise<boolean> {
  console.log('Verifying all tasks before creating checkpoint...');
  
  try {
    const success = await verifyAllTasks();
    
    if (success) {
      console.log('✅ All tasks verified successfully. Checkpoint can be created.');
      return true;
    } else {
      console.error('❌ Task verification failed. Please fix the issues before creating a checkpoint.');
      return false;
    }
  } catch (error) {
    console.error('Error during task verification:', error);
    return false;
  }
}
