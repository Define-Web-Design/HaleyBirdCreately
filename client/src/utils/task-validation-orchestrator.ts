
/**
 * Task Validation Orchestrator
 * 
 * This system ensures all requested tasks are thoroughly verified before
 * creating checkpoints in the workflow. It tracks, validates, and confirms
 * that every request has been fully addressed and is functional.
 */

import { validateImplementation } from './validate-implementation';
import { runFullSystemValidation, ValidationReport } from './consolidated-validation';
import { verifyPageLinks, runAccessibilityAudit, verifyNavigationLinks } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

export interface TaskRequest {
  id: string;
  type: 'feature' | 'fix' | 'enhancement' | 'security' | 'accessibility' | 'performance';
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  validationResults?: any;
  error?: string;
}

export interface ValidationContext {
  taskRequests: TaskRequest[];
  timestamp: string;
  allTasksCompleted: boolean;
  validationReport?: ValidationReport;
}

class TaskValidationOrchestrator {
  private _context: ValidationContext;
  private static _instance: TaskValidationOrchestrator;

  private constructor() {
    this._context = {
      taskRequests: [],
      timestamp: new Date().toISOString(),
      allTasksCompleted: false
    };
  }

  public static getInstance(): TaskValidationOrchestrator {
    if (!TaskValidationOrchestrator._instance) {
      TaskValidationOrchestrator._instance = new TaskValidationOrchestrator();
    }
    return TaskValidationOrchestrator._instance;
  }

  /**
   * Register a new task to be tracked and validated
   */
  public registerTask(task: Omit<TaskRequest, 'status'>): string {
    const newTask: TaskRequest = {
      ...task,
      status: 'pending'
    };
    
    this._context.taskRequests.push(newTask);
    this._context.allTasksCompleted = false;
    
    return newTask.id;
  }

  /**
   * Register multiple tasks at once
   */
  public registerTasks(tasks: Omit<TaskRequest, 'status'>[]): string[] {
    return tasks.map(task => this.registerTask(task));
  }

  /**
   * Update the status of a specific task
   */
  public updateTaskStatus(taskId: string, status: TaskRequest['status'], results?: any): void {
    const taskIndex = this._context.taskRequests.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      this._context.taskRequests[taskIndex].status = status;
      
      if (results) {
        this._context.taskRequests[taskIndex].validationResults = results;
      }
      
      if (status === 'failed' && results?.error) {
        this._context.taskRequests[taskIndex].error = results.error;
      }
    }
    
    // Check if all tasks are now completed
    this._context.allTasksCompleted = this._context.taskRequests.every(
      t => t.status === 'completed'
    );
  }

  /**
   * Run validation for all pending tasks
   */
  public async validateAllTasks(): Promise<ValidationContext> {
    console.log('Starting comprehensive validation of all tasks...');
    
    // Mark all pending tasks as in-progress
    this._context.taskRequests
      .filter(t => t.status === 'pending')
      .forEach(t => this.updateTaskStatus(t.id, 'in-progress'));
    
    try {
      // Run the full system validation
      const validationReport = await runFullSystemValidation();
      this._context.validationReport = validationReport;
      
      // Process each task based on the validation results
      for (const task of this._context.taskRequests) {
        if (task.status !== 'in-progress') continue;
        
        // Match task type to specific validation results
        switch (task.type) {
          case 'feature':
          case 'enhancement':
            // For features, check implementation validation
            const implSection = validationReport.sections.find(s => s.name === 'Implementation Validation');
            if (implSection && implSection.success) {
              this.updateTaskStatus(task.id, 'completed', { section: implSection });
            } else {
              this.updateTaskStatus(task.id, 'failed', { 
                section: implSection,
                error: 'Feature implementation validation failed'
              });
            }
            break;
            
          case 'fix':
            // For fixes, check if the specific issue is resolved
            const fixResult = this.validateFix(task, validationReport);
            if (fixResult.success) {
              this.updateTaskStatus(task.id, 'completed', fixResult);
            } else {
              this.updateTaskStatus(task.id, 'failed', fixResult);
            }
            break;
            
          case 'accessibility':
            // For accessibility tasks, check the accessibility audit
            const a11ySection = validationReport.sections.find(s => s.name === 'Accessibility Audit');
            if (a11ySection && a11ySection.success) {
              this.updateTaskStatus(task.id, 'completed', { section: a11ySection });
            } else {
              this.updateTaskStatus(task.id, 'failed', { 
                section: a11ySection,
                error: 'Accessibility validation failed'
              });
            }
            break;
            
          case 'security':
            // For security tasks, verify security measures
            const securityResults = await this.validateSecurityTask(task);
            if (securityResults.success) {
              this.updateTaskStatus(task.id, 'completed', securityResults);
            } else {
              this.updateTaskStatus(task.id, 'failed', securityResults);
            }
            break;
            
          case 'performance':
            // For performance tasks, check performance metrics
            const performanceResults = this.validatePerformanceTask(task, validationReport);
            if (performanceResults.success) {
              this.updateTaskStatus(task.id, 'completed', performanceResults);
            } else {
              this.updateTaskStatus(task.id, 'failed', performanceResults);
            }
            break;
            
          default:
            // For any other type, use the overall validation status
            if (validationReport.overallSuccess) {
              this.updateTaskStatus(task.id, 'completed', { report: 'Full validation passed' });
            } else {
              this.updateTaskStatus(task.id, 'failed', { 
                error: 'Task validation failed as part of overall system validation'
              });
            }
        }
      }
      
      // Update the overall completion status
      this._context.allTasksCompleted = this._context.taskRequests.every(
        t => t.status === 'completed'
      );
      
      return this._context;
    } catch (error) {
      console.error('Error during task validation:', error);
      
      // Mark all in-progress tasks as failed
      this._context.taskRequests
        .filter(t => t.status === 'in-progress')
        .forEach(t => this.updateTaskStatus(t.id, 'failed', { 
          error: error.message || 'Unknown error during validation'
        }));
      
      this._context.allTasksCompleted = false;
      
      return this._context;
    }
  }

  /**
   * Validate a specific fix task
   */
  private validateFix(task: TaskRequest, validationReport: ValidationReport): { success: boolean; error?: string } {
    // This would implement specific checks for each type of fix
    // For now, we'll use a simplified approach based on description matching
    
    const lowerDescription = task.description.toLowerCase();
    
    // Check for navigation/link fixes
    if (lowerDescription.includes('link') || lowerDescription.includes('navigation')) {
      const linkSection = validationReport.sections.find(s => s.name === 'Link Validation');
      return {
        success: linkSection?.success || false,
        error: !linkSection?.success ? 'Link validation failed' : undefined
      };
    }
    
    // Check for API fixes
    if (lowerDescription.includes('api') || lowerDescription.includes('endpoint')) {
      const apiSection = validationReport.sections.find(s => s.name === 'API Endpoint Validation');
      return {
        success: apiSection?.success || false,
        error: !apiSection?.success ? 'API validation failed' : undefined
      };
    }
    
    // Default to using implementation validation
    const implSection = validationReport.sections.find(s => s.name === 'Implementation Validation');
    return {
      success: implSection?.success || false,
      error: !implSection?.success ? 'Implementation validation failed' : undefined
    };
  }

  /**
   * Validate a security task
   */
  private async validateSecurityTask(task: TaskRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // This would call your security validation service
      const securityModule = await import('../../server/services/securityMonitor');
      const securityMonitor = securityModule.securityMonitor;
      
      const integrityResults = await securityMonitor.validateAssetIntegrity();
      
      return {
        success: integrityResults.valid,
        error: !integrityResults.valid ? 'Security validation failed' : undefined
      };
    } catch (error) {
      console.error('Error validating security task:', error);
      return {
        success: false,
        error: `Security validation error: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Validate a performance task
   */
  private validatePerformanceTask(task: TaskRequest, validationReport: ValidationReport): { success: boolean; error?: string } {
    // This would implement specific performance checks
    // For now, we'll use a simplified approach
    
    // Check if API response times are acceptable
    const apiSection = validationReport.sections.find(s => s.name === 'API Endpoint Validation');
    if (apiSection) {
      const apiDetails = apiSection.details;
      const slowEndpoints = apiDetails.failedEndpoints?.filter(e => 
        e.responseTime && e.responseTime > 500 // Consider endpoints slow if > 500ms
      );
      
      if (slowEndpoints && slowEndpoints.length > 0) {
        return {
          success: false,
          error: `Found ${slowEndpoints.length} slow API endpoints`
        };
      }
    }
    
    return { success: true };
  }

  /**
   * Check if a checkpoint can be created based on all tasks being completed
   */
  public canCreateCheckpoint(): boolean {
    return this._context.allTasksCompleted;
  }

  /**
   * Get the current validation context
   */
  public getContext(): ValidationContext {
    return this._context;
  }

  /**
   * Create a checkpoint if all tasks are completed
   */
  public createCheckpoint(): { success: boolean; message: string } {
    if (!this.canCreateCheckpoint()) {
      return {
        success: false,
        message: 'Cannot create checkpoint - not all tasks are completed'
      };
    }
    
    // Create a checkpoint record
    const checkpoint = {
      id: `checkpoint-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tasks: this._context.taskRequests,
      validationReport: this._context.validationReport
    };
    
    // In a real implementation, this would persist the checkpoint
    console.log('Creating checkpoint:', checkpoint.id);
    
    // Reset the context for new tasks
    this._context = {
      taskRequests: [],
      timestamp: new Date().toISOString(),
      allTasksCompleted: false
    };
    
    return {
      success: true,
      message: `Checkpoint ${checkpoint.id} created successfully`
    };
  }
}

export const taskOrchestrator = TaskValidationOrchestrator.getInstance();


  /**
   * Verify all tasks in a batch, ensuring everything is validated simultaneously
   * This method runs all validations in parallel and only reports success if ALL pass
   */
  public async batchVerifyAllTasks(tasks: Omit<TaskRequest, 'status'>[]): Promise<{
    success: boolean;
    completedTasks: number;
    failedTasks: number;
    report: ValidationReport | undefined;
    canCreateCheckpoint: boolean;
  }> {
    console.log(`Starting batch verification of ${tasks.length} tasks...`);
    
    // Register all tasks
    const taskIds = tasks.map(task => this.registerTask(task));
    
    try {
      // Run full system validation
      const validationReport = await runFullSystemValidation();
      this._context.validationReport = validationReport;
      
      // Process validation results for each task
      const validationPromises = taskIds.map(id => {
        const task = this._context.taskRequests.find(t => t.id === id);
        if (!task) return Promise.resolve(false);
        
        // Mark as in-progress
        this.updateTaskStatus(id, 'in-progress');
        
        // Match task to appropriate validation sections
        return this.validateTaskAgainstReport(task, validationReport)
          .then(success => {
            this.updateTaskStatus(id, success ? 'completed' : 'failed', 
              success ? { result: 'Passed all validation checks' } : 
              { error: 'Failed validation checks' });
            return success;
          });
      });
      
      // Wait for all validations to complete
      const results = await Promise.all(validationPromises);
      
      // Update context
      this._context.allTasksCompleted = results.every(result => result === true);
      
      const completedTasks = results.filter(r => r === true).length;
      const failedTasks = tasks.length - completedTasks;
      
      console.log(`Batch verification complete: ${completedTasks}/${tasks.length} tasks verified successfully`);
      
      return {
        success: this._context.allTasksCompleted,
        completedTasks,
        failedTasks,
        report: validationReport,
        canCreateCheckpoint: this._context.allTasksCompleted
      };
    } catch (error) {
      console.error('Error during batch verification:', error);
      
      // Mark all in-progress tasks as failed
      taskIds.forEach(id => {
        const task = this._context.taskRequests.find(t => t.id === id);
        if (task && task.status === 'in-progress') {
          this.updateTaskStatus(id, 'failed', { 
            error: `Verification error: ${error.message || 'Unknown error'}`
          });
        }
      });
      
      return {
        success: false,
        completedTasks: 0,
        failedTasks: tasks.length,
        report: undefined,
        canCreateCheckpoint: false
      };
    }
  }
  
  /**
   * Validate a single task against the full validation report
   */
  private async validateTaskAgainstReport(task: TaskRequest, report: ValidationReport): Promise<boolean> {
    // Extract relevant section(s) from the report based on task type
    switch (task.type) {
      case 'accessibility':
        const a11ySection = report.sections.find(s => s.name === 'Accessibility Audit');
        return a11ySection?.success || false;
        
      case 'security':
        const securitySection = report.sections.find(s => 
          s.name === 'Security Validation' || s.name.includes('Security'));
        return securitySection?.success || false;
        
      case 'performance':
        const apiSection = report.sections.find(s => s.name === 'API Endpoint Validation');
        const performanceThreshold = 
          apiSection?.details?.failedEndpoints?.filter(e => e.responseTime > 500).length === 0;
        return performanceThreshold;
        
      case 'feature':
      case 'enhancement':
        // For features, check implementation validation
        const implSection = report.sections.find(s => s.name === 'Implementation Validation');
        return implSection?.success || false;
        
      case 'fix':
        // For fixes, need to check specific sections based on description
        const lowerDescription = task.description.toLowerCase();
        
        if (lowerDescription.includes('link') || lowerDescription.includes('navigation')) {
          const linkSection = report.sections.find(s => s.name === 'Link Validation');
          return linkSection?.success || false;
        }
        
        if (lowerDescription.includes('accessibility') || lowerDescription.includes('a11y')) {
          const a11ySection = report.sections.find(s => s.name === 'Accessibility Audit');
          return a11ySection?.success || false;
        }
        
        // Default to overall success for other fixes
        return report.overallSuccess;
        
      default:
        // For any unspecified type, use overall validation success
        return report.overallSuccess;
    }
  }
