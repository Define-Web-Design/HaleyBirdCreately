#!/usr/bin/env node

/**
 * Task Verification CLI Script
 * Runs comprehensive validation of all tasks and reports status
 */

const { verifyAllTasks } = require('../client/src/utils/verify-all-tasks');
const { validateBeforeCheckpoint } = require('../client/src/utils/validation-coordinator');
const { taskOrchestrator } = require('../client/src/utils/task-validation-orchestrator');
const { runFullSystemValidation, displayFullValidationResults } = require('../client/src/utils/consolidated-validation');
const { securityMonitor } = require('../server/services/securityMonitor');

// Define standard verification tasks for all assistants
const standardTasks = [
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

// Run all validations
async function verifyAllTasks() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE TASK VERIFICATION');
  console.log('Identifying and validating all outstanding tasks for Replit assistants');
  console.log('='.repeat(80));

  try {
    // Register all standard tasks
    taskOrchestrator.registerTasks(standardTasks);

    // Run full system validation
    console.log('\nRunning full system validation...');
    const validationReport = await runFullSystemValidation();
    displayFullValidationResults(validationReport);

    // Verify security aspects
    console.log('\nVerifying security aspects...');
    const securityResults = await securityMonitor.validateAssetIntegrity();
    console.log('Security validation:', securityResults.valid ? 'PASSED ✅' : 'FAILED ❌');

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
      // Show details for failed tasks
      for (const taskId in batchResult.report?.sections || {}) {
        const section = batchResult.report.sections[taskId];
        if (!section.success) {
          console.log(`- ${section.name}: Failed validation`);
          if (section.details && section.details.issues) {
            section.details.issues.slice(0, 3).forEach(issue => {
              console.log(`  * ${issue}`);
            });
          }
        }
      }
    }

    return batchResult.success;
  } catch (error) {
    console.error('Error during task verification:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('='.repeat(80));
    console.log('TASK VERIFICATION SYSTEM');
    console.log('='.repeat(80));
    console.log('Running comprehensive task verification...\n');

    // Run the full verification
    const verificationResult = await verifyAllTasks();

    console.log('\n='.repeat(80));
    console.log('VERIFICATION RESULTS:');
    console.log('-'.repeat(80));

    if (verificationResult) {
      console.log('✅ All tasks verified successfully!');

      // Check if we can create a checkpoint
      const canCreateCheckpoint = await validateBeforeCheckpoint('CLI Verification');

      if (canCreateCheckpoint) {
        console.log('\n✅ Ready to create checkpoint');
        console.log('Run the following command to create a checkpoint:');
        console.log('node -e "require(\'./client/src/utils/checkpoint-manager\').createCheckpoint(\'Checkpoint Name\', \'Description\')"');
      } else {
        console.log('\n⚠️ Cannot create checkpoint - validation issues detected');
      }
    } else {
      console.log('❌ Verification failed - some tasks did not pass validation');
      console.log('Review logs above for details on which tasks failed');
    }

    console.log('='.repeat(80));

    // Exit with appropriate code
    process.exit(verificationResult ? 0 : 1);
  } catch (error) {
    console.error('Error running verification:', error);
    process.exit(1);
  }
}

// Run script
main();