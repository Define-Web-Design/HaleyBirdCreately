
/**
 * Task Verification CLI
 * Command-line utility to verify all tasks are completed before checkpoint creation
 */

import { WorkflowValidator } from './workflow-validator';
import { CheckpointManager } from './checkpoint-manager';
import { runFullSystemValidation } from './consolidated-validation';
import { validateImplementation } from './validate-implementation';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'verify';

async function main() {
  try {
    switch (command) {
      case 'verify':
        await verifyTasks();
        break;
      case 'checkpoint':
        const name = args[1] || `Checkpoint-${new Date().toISOString().split('T')[0]}`;
        const description = args[2] || 'Automated checkpoint after task verification';
        await createCheckpoint(name, description);
        break;
      case 'report':
        await generateReport();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function verifyTasks() {
  console.log('Verifying all tasks...');
  
  // Create workflow validator with default tasks
  const validator = new WorkflowValidator();
  const defaultTasks = WorkflowValidator.createDefaultWorkflowTasks();
  validator.addTasks(defaultTasks);
  
  // Run validation
  const result = await validator.verifyAllTasksCompleted();
  
  console.log('='.repeat(80));
  console.log(`TASK VERIFICATION: ${result.allTasksCompleted ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));
  
  console.log(`Tasks completed: ${result.completedTasks.length}/${defaultTasks.length}`);
  
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
  
  // Run system validation as well
  console.log('\nRunning system validation...');
  const systemValidation = await runFullSystemValidation();
  
  console.log(`System validation: ${systemValidation.overallSuccess ? 'PASSED' : 'FAILED'}`);
  
  if (!systemValidation.overallSuccess) {
    console.log('\nSystem Validation Issues:');
    for (const section of systemValidation.sections) {
      if (!section.success) {
        console.log(`- ${section.name}: FAILED`);
      }
    }
    
    if (systemValidation.recommendations.length > 0) {
      console.log('\nRecommendations:');
      systemValidation.recommendations.forEach(rec => {
        console.log(`- ${rec}`);
      });
    }
  }
  
  // Check if it's safe to create a checkpoint
  const checkpointStatus = await validator.canCreateCheckpoint();
  
  console.log('\nCheckpoint Status:');
  console.log(`- Safe to create checkpoint: ${checkpointStatus.safe ? 'YES' : 'NO'}`);
  
  if (!checkpointStatus.safe && checkpointStatus.reason) {
    console.log(`- Reason: ${checkpointStatus.reason}`);
  }
  
  process.exit(result.allTasksCompleted && systemValidation.overallSuccess ? 0 : 1);
}

async function createCheckpoint(name: string, description: string) {
  console.log(`Attempting to create checkpoint: ${name}`);
  
  const checkpointManager = new CheckpointManager();
  
  // Try to create the checkpoint
  const result = await checkpointManager.tryCreateCheckpoint(name, description);
  
  if (result.success) {
    console.log(`✅ Checkpoint "${name}" created successfully!`);
    
    // Save checkpoint to file
    const checkpointDir = path.join(process.cwd(), 'checkpoints');
    if (!fs.existsSync(checkpointDir)) {
      fs.mkdirSync(checkpointDir);
    }
    
    const checkpointFile = path.join(checkpointDir, `${result.checkpoint?.id}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(result.checkpoint, null, 2));
    
    console.log(`Checkpoint saved to: ${checkpointFile}`);
  } else {
    console.error(`❌ Failed to create checkpoint: ${result.message}`);
    process.exit(1);
  }
}

async function generateReport() {
  console.log('Generating verification report...');
  
  const validator = new WorkflowValidator();
  validator.addTasks(WorkflowValidator.createDefaultWorkflowTasks());
  
  const report = await validator.generateVerificationReport();
  
  // Save report to file
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  const reportFile = path.join(reportDir, `verification-report-${Date.now()}.md`);
  fs.writeFileSync(reportFile, report);
  
  console.log(`Report saved to: ${reportFile}`);
  console.log('\nReport Summary:');
  
  // Print summary section of the report
  const summaryMatch = report.match(/## Task Status Summary\n\n([^#]*)/);
  if (summaryMatch && summaryMatch[1]) {
    console.log(summaryMatch[1]);
  } else {
    console.log('Summary not available');
  }
}

function showHelp() {
  console.log(`
Task Verification CLI
=====================

Commands:
  verify                Verify all tasks are completed
  checkpoint [name] [description]
                        Create a checkpoint (only if all tasks are verified)
  report                Generate a verification report
  help                  Show this help message

Examples:
  node task-verification-cli.js verify
  node task-verification-cli.js checkpoint "Feature XYZ Complete" "Implemented all requirements for XYZ"
  node task-verification-cli.js report
  `);
}

// Run the CLI
main();
/**
 * Task Verification CLI
 * 
 * A command-line interface for running task verification checks
 * and reporting on their status. This tool allows quick validation
 * of all tasks across Replit assistants.
 */

import { TaskRequest, taskOrchestrator } from './task-validation-orchestrator';
import { runFullSystemValidation, displayFullValidationResults } from './consolidated-validation';
import { securityMonitor } from '../../server/services/securityMonitor';

// Define standard verification tasks that should be checked for all assistants
const standardTasks: Omit<TaskRequest, 'status'>[] = [
  {
    id: 'implementation-validation',
    type: 'feature',
    description: 'Verify all implemented features work correctly'
  },
  {
    id: 'accessibility-standards',
    type: 'accessibility',
    description: 'Ensure accessibility compliance across all components'
  },
  {
    id: 'api-endpoints',
    type: 'feature',
    description: 'Validate all API endpoints and integrations'
  },
  {
    id: 'security-measures',
    type: 'security',
    description: 'Verify security protocols and data protection measures'
  },
  {
    id: 'responsive-design',
    type: 'enhancement',
    description: 'Ensure responsive design across all device sizes'
  },
  {
    id: 'navigation-verification',
    type: 'fix',
    description: 'Verify all navigation links and user flows'
  }
];

/**
 * Run verification for all tasks and display results
 */
export async function verify(): Promise<boolean> {
  console.log('='.repeat(80));
  console.log('TASK VERIFICATION CLI');
  console.log('Identifying and validating all outstanding tasks for Replit assistants');
  console.log('='.repeat(80));
  
  try {
    // Register all standard tasks
    taskOrchestrator.registerTasks(standardTasks);
    
    // Run full system validation
    console.log('\nRunning full system validation...');
    const validationReport = await runFullSystemValidation();
    displayFullValidationResults(validationReport);
    
    // Run batch verification for all tasks
    console.log('\nVerifying all registered tasks simultaneously...');
    const batchResult = await taskOrchestrator.batchVerifyAllTasks(standardTasks);
    
    console.log('\n=== TASK VERIFICATION SUMMARY ===');
    console.log(`Total tasks: ${batchResult.completedTasks + batchResult.failedTasks}`);
    console.log(`Tasks verified: ${batchResult.completedTasks}`);
    console.log(`Tasks failed: ${batchResult.failedTasks}`);
    console.log(`Overall status: ${batchResult.success ? 'PASSED ✅' : 'INCOMPLETE ❌'}`);
    
    if (batchResult.failedTasks > 0) {
      console.log('\n=== OUTSTANDING TASKS ===');
      // List all uncompleted tasks
      if (batchResult.report?.sections) {
        Object.entries(batchResult.report.sections)
          .filter(([_, section]) => !section.success)
          .forEach(([id, section]) => {
            console.log(`- ${section.name}: Failed validation`);
            if (section.details && section.details.issues) {
              section.details.issues.slice(0, 3).forEach(issue => {
                console.log(`  * ${issue}`);
              });
              if (section.details.issues.length > 3) {
                console.log(`  * ... and ${section.details.issues.length - 3} more issues`);
              }
            }
          });
      }
    }
    
    // Check if we can create a checkpoint
    if (batchResult.canCreateCheckpoint) {
      console.log('\n=== CHECKPOINT STATUS ===');
      const checkpoint = taskOrchestrator.createCheckpoint();
      console.log(checkpoint.message);
    } else {
      console.log('\n=== CHECKPOINT STATUS ===');
      console.log('Cannot create checkpoint - validation incomplete');
      console.log('Please address the outstanding tasks listed above');
    }
    
    return batchResult.success;
  } catch (error) {
    console.error('Error during task verification:', error);
    return false;
  }
}

/**
 * Check security aspects of the application
 */
async function verifySecurityAspects(): Promise<void> {
  console.log('\nVerifying security aspects...');
  try {
    const securityResults = await securityMonitor.validateAssetIntegrity();
    console.log('Security validation:', securityResults.valid ? 'PASSED ✅' : 'FAILED ❌');
    
    if (!securityResults.valid && securityResults.issues.length > 0) {
      console.log('Security issues found:');
      securityResults.issues.forEach(issue => console.log(`- ${issue}`));
    }
  } catch (error) {
    console.error('Security validation error:', error);
  }
}

// Allow direct execution from command line
if (require.main === module) {
  verify().then(success => {
    process.exit(success ? 0 : 1);
  });
}
