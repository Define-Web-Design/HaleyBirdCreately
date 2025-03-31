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
 * Parse task requests from free-form text instructions
 */
function parseTaskRequests(instruction: string): Omit<TaskRequest, 'status'>[] {
  const tasks: Omit<TaskRequest, 'status'>[] = [];

  // Common task identifiers in natural language
  const taskPatterns = [
    /(?:fix|resolve|repair|correct)\s+([^,.;]+)/gi,
    /(?:add|create|implement|develop)\s+([^,.;]+)/gi,
    /(?:update|modify|change|enhance|improve)\s+([^,.;]+)/gi,
    /(?:validate|verify|check|ensure|confirm)\s+([^,.;]+)/gi,
    /(?:test|review|examine)\s+([^,.;]+)/gi,
    /(?:integrate|connect|link)\s+([^,.;]+)/gi
  ];

  // Try to match task patterns in the instruction
  for (const pattern of taskPatterns) {
    const matches = [...instruction.matchAll(pattern)];

    for (const match of matches) {
      if (match[1] && match[1].length > 3) {
        // Determine task type based on the verb used
        let type: TaskRequest['type'] = 'enhancement';
        const verb = match[0].split(/\s+/)[0].toLowerCase();

        if (/fix|resolve|repair|correct/.test(verb)) {
          type = 'fix';
        } else if (/add|create|implement|develop/.test(verb)) {
          type = 'feature';
        } else if (/validate|verify|check|ensure|confirm|test/.test(verb)) {
          if (/accessibility|a11y/.test(match[1])) {
            type = 'accessibility';
          } else if (/security|authorization|authentication/.test(match[1])) {
            type = 'security';
          } else {
            type = 'enhancement';
          }
        } else if (/performance|speed|optimize/.test(match[1])) {
          type = 'performance';
        }

        tasks.push({
          id: `task-${Date.now()}-${tasks.length}`,
          type,
          description: match[1].trim()
        });
      }
    }
  }

  // If no specific tasks found but instruction is substantial, create a general task
  if (tasks.length === 0 && instruction.length > 20) {
    const generalTaskDesc = instruction.length > 100 
      ? instruction.substring(0, 100) + '...' 
      : instruction;

    tasks.push({
      id: `task-${Date.now()}-general`,
      type: 'enhancement',
      description: `General task: ${generalTaskDesc}`
    });
  }

  return tasks;
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