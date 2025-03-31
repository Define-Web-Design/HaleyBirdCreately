
/**
 * Command-line utility to run the consolidated validation
 */

import { runFullSystemValidation, displayFullValidationResults, saveValidationReport } from './consolidated-validation';

async function main() {
  console.log('Starting full system validation...');
  
  try {
    const report = await runFullSystemValidation();
    displayFullValidationResults(report);
    
    // Save the report to a file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await saveValidationReport(report, `validation-report-${timestamp}.json`);
    
    // Exit with appropriate code
    process.exit(report.overallSuccess ? 0 : 1);
  } catch (error) {
    console.error('Validation failed with error:', error);
    process.exit(1);
  }
}

// Run the validation
main();
/**
 * Validation Runner
 * 
 * This utility executes the validation workflow to ensure all tasks are 
 * verified simultaneously before proceeding with checkpoints.
 */

import { taskOrchestrator, TaskRequest } from './task-validation-orchestrator';
import { runFullSystemValidation, displayFullValidationResults } from './consolidated-validation';

interface ValidationRunOptions {
  displayResults: boolean;
  captureOutput: boolean;
  throwOnFailure: boolean;
}

const defaultOptions: ValidationRunOptions = {
  displayResults: true,
  captureOutput: false,
  throwOnFailure: true
};

/**
 * Parse task requests from a natural language instruction
 */
export function parseTaskRequests(instruction: string): Omit<TaskRequest, 'status'>[] {
  const tasks: Omit<TaskRequest, 'status'>[] = [];
  let id = 1;
  
  // Look for potential tasks in the instruction using common patterns
  const lines = instruction.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    
    // Check for numbered or bulleted list items
    const listItemMatch = line.match(/^(\d+\.|[\-•*])(.+)$/);
    if (listItemMatch) {
      const taskText = listItemMatch[2].trim();
      addTaskFromText(taskText);
      return;
    }
    
    // Check for sentences that sound like instructions
    if (line.length > 10 && 
        (line.includes('implement') || 
         line.includes('fix') || 
         line.includes('update') || 
         line.includes('add') || 
         line.includes('create') || 
         line.includes('verify') || 
         line.includes('ensure'))) {
      addTaskFromText(line);
      return;
    }
  });
  
  // Helper function to add a task based on text
  function addTaskFromText(text: string) {
    const taskId = `task-${id++}`;
    let taskType: TaskRequest['type'] = 'feature';
    
    if (text.toLowerCase().includes('fix') || text.toLowerCase().includes('bug') || text.toLowerCase().includes('issue')) {
      taskType = 'fix';
    } else if (text.toLowerCase().includes('access') || text.toLowerCase().includes('a11y')) {
      taskType = 'accessibility';
    } else if (text.toLowerCase().includes('secur') || text.toLowerCase().includes('privacy')) {
      taskType = 'security';
    } else if (text.toLowerCase().includes('performance') || text.toLowerCase().includes('speed')) {
      taskType = 'performance';
    } else if (text.toLowerCase().includes('enhance') || text.toLowerCase().includes('improve')) {
      taskType = 'enhancement';
    }
    
    tasks.push({
      id: taskId,
      type: taskType,
      description: text
    });
  }
  
  return tasks;
}


/**
 * Verify all tasks simultaneously and only create checkpoint if all pass
 * Use this when all tasks in a message must be verified together
 */
export async function verifyTasksSimultaneously(
  instruction: string,
  options: {
    displayResults?: boolean;
    createCheckpoint?: boolean;
  } = {}
): Promise<boolean> {
  console.log('Starting simultaneous verification of all tasks...');
  console.log('=' .repeat(80));
  
  try {
    // Parse tasks from the instruction
    const parsedTasks = parseTaskRequests(instruction);
    
    if (parsedTasks.length === 0) {
      console.log('No specific tasks identified in the instruction. Running full system validation.');
      
      // If no specific tasks identified, run a general system validation
      const validationReport = await runFullSystemValidation();
      
      if (options.displayResults) {
        displayFullValidationResults(validationReport);
      }
      
      if (options.createCheckpoint && validationReport.overallSuccess) {
        const checkpointResult = taskOrchestrator.createCheckpoint();
        console.log(checkpointResult.message);
      }
      
      return validationReport.overallSuccess;
    }
    
    // Run batch verification
    const result = await taskOrchestrator.batchVerifyAllTasks(parsedTasks);
    
    // Display results if requested
    if (options.displayResults && result.report) {
      displayFullValidationResults(result.report);
    }
    
    console.log(`Verification summary: ${result.completedTasks} of ${result.completedTasks + result.failedTasks} tasks completed successfully`);
    
    // Create checkpoint if requested and all tasks passed
    if (options.createCheckpoint && result.canCreateCheckpoint) {
      const checkpointResult = taskOrchestrator.createCheckpoint();
      console.log(`Checkpoint status: ${checkpointResult.message}`);
    }
    
    return result.success;
  } catch (error) {
    console.error('Error during task verification:', error);
    return false;
  }
}

/**
 * Run the validation workflow for a set of tasks
 */
export async function runValidationWorkflow(
  tasks: Omit<TaskRequest, 'status'>[],
  options: Partial<ValidationRunOptions> = {}
): Promise<boolean> {
  const mergedOptions = { ...defaultOptions, ...options };
  console.log(`Running validation workflow for ${tasks.length} tasks...`);
  
  // Register all tasks with the orchestrator
  const taskIds = taskOrchestrator.registerTasks(tasks);
  console.log('Registered tasks:', taskIds);
  
  try {
    // Run validation for all tasks
    const validationContext = await taskOrchestrator.validateAllTasks();
    
    // If specified, display the results
    if (mergedOptions.displayResults && validationContext.validationReport) {
      displayFullValidationResults(validationContext.validationReport);
    }
    
    // Check if all tasks were successfully completed
    const allTasksSuccessful = validationContext.taskRequests.every(
      task => task.status === 'completed'
    );
    
    if (!allTasksSuccessful) {
      console.error('Some tasks failed validation:');
      validationContext.taskRequests
        .filter(task => task.status === 'failed')
        .forEach(task => {
          console.error(`- Task ${task.id} (${task.type}): ${task.description}`);
          console.error(`  Error: ${task.error || 'Unknown error'}`);
        });
      
      if (mergedOptions.throwOnFailure) {
        throw new Error('Task validation workflow failed');
      }
    }
    
    // Try to create a checkpoint if all tasks succeeded
    if (allTasksSuccessful) {
      const checkpointResult = taskOrchestrator.createCheckpoint();
      console.log(checkpointResult.message);
    }
    
    return allTasksSuccessful;
  } catch (error) {
    console.error('Error in validation workflow:', error);
    
    if (mergedOptions.throwOnFailure) {
      throw error;
    }
    
    return false;
  }
}

/**
 * Run validation workflow from a natural language instruction
 */
export async function runValidationFromInstruction(
  instruction: string,
  options: Partial<ValidationRunOptions> = {}
): Promise<boolean> {
  const parsedTasks = parseTaskRequests(instruction);
  
  if (parsedTasks.length === 0) {
    console.log('No specific tasks identified in the instruction. Running full system validation.');
    
    // If no specific tasks identified, run a general system validation
    try {
      const validationReport = await runFullSystemValidation();
      
      if (options.displayResults) {
        displayFullValidationResults(validationReport);
      }
      
      return validationReport.overallSuccess;
    } catch (error) {
      console.error('Error running system validation:', error);
      
      if (options.throwOnFailure) {
        throw error;
      }
      
      return false;
    }
  }
  
  return runValidationWorkflow(parsedTasks, options);
}
