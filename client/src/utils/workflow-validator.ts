
/**
 * Comprehensive workflow validation system
 * Ensures all tasks in a workflow are completed and verified before checkpointing
 */

import { runFullSystemValidation, ValidationReport } from './consolidated-validation';
import { validateImplementation } from './validate-implementation';
import { verifyPageLinks, runAccessibilityAudit, testKeyboardNavigation } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

export interface WorkflowTask {
  id: string;
  name: string;
  category: 'UI' | 'Navigation' | 'Accessibility' | 'API' | 'Security' | 'Content' | 'Performance' | 'Other';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  dependencies?: string[];
  validationFunction?: () => Promise<boolean>;
  details?: any;
}

export interface WorkflowVerificationResult {
  allTasksCompleted: boolean;
  pendingTasks: WorkflowTask[];
  completedTasks: WorkflowTask[];
  failedTasks: WorkflowTask[];
  validationReport?: ValidationReport;
  timestamp: string;
}

/**
 * Track and verify the status of all workflow tasks
 */
export class WorkflowValidator {
  private tasks: Map<string, WorkflowTask> = new Map();
  private lastVerificationResult: WorkflowVerificationResult | null = null;

  /**
   * Add a new task to the workflow
   */
  addTask(task: WorkflowTask): void {
    this.tasks.set(task.id, task);
  }

  /**
   * Add multiple tasks to the workflow
   */
  addTasks(tasks: WorkflowTask[]): void {
    tasks.forEach(task => this.addTask(task));
  }

  /**
   * Update the status of a task
   */
  updateTaskStatus(taskId: string, status: 'pending' | 'in-progress' | 'completed' | 'failed', details?: any): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      if (details) {
        task.details = details;
      }
    }
  }

  /**
   * Get all tasks with a specific status
   */
  getTasksByStatus(status: 'pending' | 'in-progress' | 'completed' | 'failed'): WorkflowTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  /**
   * Validate that all dependencies for a task are completed
   */
  private areDependenciesMet(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  /**
   * Verify all tasks in the workflow are completed
   */
  async verifyAllTasksCompleted(): Promise<WorkflowVerificationResult> {
    const pendingTasks = this.getTasksByStatus('pending');
    const inProgressTasks = this.getTasksByStatus('in-progress');
    const completedTasks = this.getTasksByStatus('completed');
    const failedTasks = this.getTasksByStatus('failed');

    const allTasksCompleted = pendingTasks.length === 0 && inProgressTasks.length === 0 && failedTasks.length === 0;

    // Run validation functions for completed tasks to double-check
    for (const task of completedTasks) {
      if (task.validationFunction) {
        try {
          const isValid = await task.validationFunction();
          if (!isValid) {
            this.updateTaskStatus(task.id, 'failed', { reason: 'Validation function failed' });
            failedTasks.push(task);
            completedTasks.splice(completedTasks.indexOf(task), 1);
          }
        } catch (error) {
          this.updateTaskStatus(task.id, 'failed', { reason: 'Validation function threw error', error: error.message });
          failedTasks.push(task);
          completedTasks.splice(completedTasks.indexOf(task), 1);
        }
      }
    }

    // Additionally run a full system validation
    let validationReport: ValidationReport | undefined;
    try {
      validationReport = await runFullSystemValidation();
      
      // If system validation fails, mark workflow as failed
      if (!validationReport.overallSuccess) {
        for (const section of validationReport.sections) {
          if (!section.success) {
            // Find tasks related to this section and mark as failed
            const relatedTasks = Array.from(this.tasks.values()).filter(
              task => task.category.toLowerCase() === section.name.toLowerCase()
            );
            
            for (const task of relatedTasks) {
              this.updateTaskStatus(task.id, 'failed', { 
                reason: 'System validation failed for this category',
                details: section.details 
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error running system validation:', error);
    }

    // Update the verification result
    const result: WorkflowVerificationResult = {
      allTasksCompleted: allTasksCompleted && (validationReport?.overallSuccess || false),
      pendingTasks,
      completedTasks,
      failedTasks,
      validationReport,
      timestamp: new Date().toISOString()
    };

    this.lastVerificationResult = result;
    return result;
  }

  /**
   * Verify that a specific set of tasks are all completed
   */
  async verifyTasksCompleted(taskIds: string[]): Promise<boolean> {
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (!task || task.status !== 'completed') {
        return false;
      }

      // Verify the task with its validation function if provided
      if (task.validationFunction) {
        try {
          const isValid = await task.validationFunction();
          if (!isValid) {
            this.updateTaskStatus(taskId, 'failed', { reason: 'Validation function failed' });
            return false;
          }
        } catch (error) {
          this.updateTaskStatus(taskId, 'failed', { reason: 'Validation function threw error', error: error.message });
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Create a verification report for all tasks
   */
  async generateVerificationReport(): Promise<string> {
    const result = await this.verifyAllTasksCompleted();
    
    let report = `# Workflow Verification Report\n\n`;
    report += `## Overall Status: ${result.allTasksCompleted ? 'COMPLETED ✓' : 'INCOMPLETE ✗'}\n\n`;
    report += `Timestamp: ${result.timestamp}\n\n`;
    
    // Summary of task status
    report += `## Task Status Summary\n\n`;
    report += `- Total Tasks: ${this.tasks.size}\n`;
    report += `- Completed: ${result.completedTasks.length}\n`;
    report += `- Pending: ${result.pendingTasks.length}\n`;
    report += `- In Progress: ${this.getTasksByStatus('in-progress').length}\n`;
    report += `- Failed: ${result.failedTasks.length}\n\n`;
    
    // List failed tasks
    if (result.failedTasks.length > 0) {
      report += `## Failed Tasks\n\n`;
      result.failedTasks.forEach(task => {
        report += `### ${task.name} (${task.id})\n`;
        report += `- Category: ${task.category}\n`;
        if (task.details) {
          report += `- Failure Reason: ${task.details.reason || 'Unknown'}\n`;
          if (task.details.error) {
            report += `- Error: ${task.details.error}\n`;
          }
        }
        report += `\n`;
      });
    }
    
    // List pending tasks
    if (result.pendingTasks.length > 0) {
      report += `## Pending Tasks\n\n`;
      result.pendingTasks.forEach(task => {
        report += `- ${task.name} (${task.id}): ${task.category}\n`;
      });
      report += `\n`;
    }
    
    // Include system validation results
    if (result.validationReport) {
      report += `## System Validation\n\n`;
      report += `- Overall Success: ${result.validationReport.overallSuccess ? 'Yes' : 'No'}\n\n`;
      
      report += `### Validation Sections\n\n`;
      result.validationReport.sections.forEach(section => {
        report += `- ${section.name}: ${section.success ? 'PASSED' : 'FAILED'}\n`;
      });
      
      if (result.validationReport.recommendations.length > 0) {
        report += `\n### Recommendations\n\n`;
        result.validationReport.recommendations.forEach(rec => {
          report += `- ${rec}\n`;
        });
      }
    }
    
    return report;
  }

  /**
   * Determine if it's safe to create a checkpoint
   */
  async canCreateCheckpoint(): Promise<{
    safe: boolean;
    reason?: string;
    verificationResult: WorkflowVerificationResult;
  }> {
    const result = await this.verifyAllTasksCompleted();
    
    if (!result.allTasksCompleted) {
      return {
        safe: false,
        reason: `Workflow is incomplete. ${result.pendingTasks.length} pending tasks, ${result.failedTasks.length} failed tasks.`,
        verificationResult: result
      };
    }
    
    // Additional checks for system validation
    if (result.validationReport && !result.validationReport.overallSuccess) {
      return {
        safe: false,
        reason: 'System validation failed. See validation report for details.',
        verificationResult: result
      };
    }
    
    return {
      safe: true,
      verificationResult: result
    };
  }

  /**
   * Create default task validation functions
   */
  static createDefaultValidationFunction(category: string): () => Promise<boolean> {
    switch (category.toLowerCase()) {
      case 'navigation':
        return async () => {
          const navResult = await verifyPageLinks();
          return navResult.potentialBrokenLinks.length === 0;
        };
      
      case 'accessibility':
        return async () => {
          const a11yResult = await runAccessibilityAudit();
          return a11yResult.score >= 80; // 80% threshold
        };
        
      case 'api':
        return async () => {
          const apiResult = await validateApiEndpoints();
          return apiResult.success;
        };
        
      case 'ui':
        return async () => {
          const keyboardResult = await testKeyboardNavigation();
          return keyboardResult.success;
        };
        
      default:
        // Default validation just returns true
        return async () => true;
    }
  }

  /**
   * Create predefined workflow tasks based on common requirements
   */
  static createDefaultWorkflowTasks(): WorkflowTask[] {
    return [
      {
        id: 'nav-links',
        name: 'Navigation Links',
        category: 'Navigation',
        status: 'pending',
        validationFunction: WorkflowValidator.createDefaultValidationFunction('navigation')
      },
      {
        id: 'a11y',
        name: 'Accessibility Compliance',
        category: 'Accessibility',
        status: 'pending',
        validationFunction: WorkflowValidator.createDefaultValidationFunction('accessibility')
      },
      {
        id: 'api-endpoints',
        name: 'API Endpoints',
        category: 'API',
        status: 'pending',
        validationFunction: WorkflowValidator.createDefaultValidationFunction('api')
      },
      {
        id: 'keyboard-nav',
        name: 'Keyboard Navigation',
        category: 'UI',
        status: 'pending',
        validationFunction: WorkflowValidator.createDefaultValidationFunction('ui')
      },
      {
        id: 'content-integrity',
        name: 'Content Integrity',
        category: 'Content',
        status: 'pending'
      },
      {
        id: 'error-handling',
        name: 'Error Handling',
        category: 'UI',
        status: 'pending'
      },
      {
        id: 'security',
        name: 'Security Measures',
        category: 'Security',
        status: 'pending'
      }
    ];
  }
}

/**
 * Run the workflow validation and display the results
 */
export async function runWorkflowValidation(workflowTasks: WorkflowTask[]): Promise<boolean> {
  const validator = new WorkflowValidator();
  validator.addTasks(workflowTasks);
  
  // Simulate some tasks being completed
  const result = await validator.verifyAllTasksCompleted();
  
  console.log('='.repeat(80));
  console.log(`WORKFLOW VALIDATION: ${result.allTasksCompleted ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));
  
  console.log(`Completed Tasks: ${result.completedTasks.length}/${validator.getTasksByStatus('completed').length + 
    validator.getTasksByStatus('pending').length + 
    validator.getTasksByStatus('in-progress').length + 
    validator.getTasksByStatus('failed').length}`);
  
  if (result.pendingTasks.length > 0) {
    console.log('\nPending Tasks:');
    result.pendingTasks.forEach(task => {
      console.log(`- ${task.name} (${task.category})`);
    });
  }
  
  if (result.failedTasks.length > 0) {
    console.log('\nFailed Tasks:');
    result.failedTasks.forEach(task => {
      console.log(`- ${task.name} (${task.category}): ${task.details?.reason || 'Unknown error'}`);
    });
  }
  
  const checkpointStatus = await validator.canCreateCheckpoint();
  console.log('\nCheckpoint Status:');
  console.log(`- Safe to create checkpoint: ${checkpointStatus.safe ? 'YES' : 'NO'}`);
  if (!checkpointStatus.safe && checkpointStatus.reason) {
    console.log(`- Reason: ${checkpointStatus.reason}`);
  }
  
  return result.allTasksCompleted;
}

// Usage example:
// const defaultTasks = WorkflowValidator.createDefaultWorkflowTasks();
// runWorkflowValidation(defaultTasks);
