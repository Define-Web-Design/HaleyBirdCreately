
/**
 * Comprehensive validation system that consolidates all validation utilities
 * and ensures every task request is thoroughly verified before proceeding
 */

import { validateImplementation, displayValidationResults } from './validate-implementation';
import { runFullSystemValidation, displayFullValidationResults, ValidationReport } from './consolidated-validation';
import { verifyPageLinks, runAccessibilityAudit, verifyNavigationLinks, testKeyboardNavigation } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

interface ComprehensiveValidationResult {
  timestamp: string;
  allTasksSuccessful: boolean;
  validationReports: {
    [key: string]: any;
  };
  issues: string[];
  summary: string;
}

/**
 * Runs a complete validation of all requested tasks
 * Ensures that all tasks are thoroughly verified before proceeding
 */
export async function runComprehensiveValidation(
  tasks: string[] = ['all']
): Promise<ComprehensiveValidationResult> {
  console.log('='.repeat(80));
  console.log('STARTING COMPREHENSIVE VALIDATION OF ALL REQUESTED TASKS');
  console.log('='.repeat(80));
  
  const timestamp = new Date().toISOString();
  const validationReports: {[key: string]: any} = {};
  const issues: string[] = [];
  let allTasksSuccessful = true;
  
  try {
    // Determine which validations to run
    const runAll = tasks.includes('all');
    const runImplementation = runAll || tasks.includes('implementation');
    const runSystem = runAll || tasks.includes('system');
    const runLinks = runAll || tasks.includes('links');
    const runA11y = runAll || tasks.includes('accessibility');
    const runNav = runAll || tasks.includes('navigation');
    const runKeyboard = runAll || tasks.includes('keyboard');
    const runApi = runAll || tasks.includes('api');
    
    // Run selected validations in parallel for efficiency
    const validationPromises: Promise<any>[] = [];
    
    if (runImplementation) {
      console.log('Running implementation validation...');
      validationPromises.push(
        validateImplementation().then(result => {
          validationReports['implementation'] = result;
          if (!result.success) {
            allTasksSuccessful = false;
            issues.push('Implementation validation failed');
          }
          return result;
        })
      );
    }
    
    if (runSystem) {
      console.log('Running full system validation...');
      validationPromises.push(
        runFullSystemValidation().then(result => {
          validationReports['system'] = result;
          if (!result.overallSuccess) {
            allTasksSuccessful = false;
            issues.push('System validation failed');
          }
          return result;
        })
      );
    }
    
    if (runLinks) {
      console.log('Verifying page links...');
      validationPromises.push(
        verifyPageLinks().then(result => {
          validationReports['links'] = result;
          if (result.potentialBrokenLinks.length > 0) {
            allTasksSuccessful = false;
            issues.push(`Found ${result.potentialBrokenLinks.length} potentially broken links`);
          }
          return result;
        })
      );
    }
    
    if (runA11y) {
      console.log('Running accessibility audit...');
      validationPromises.push(
        runAccessibilityAudit().then(result => {
          validationReports['accessibility'] = result;
          if (result.score < 80) { // 80% threshold
            allTasksSuccessful = false;
            issues.push(`Accessibility score is below threshold: ${result.score}%`);
          }
          return result;
        })
      );
    }
    
    if (runNav) {
      console.log('Verifying navigation links...');
      validationPromises.push(
        verifyNavigationLinks().then(result => {
          validationReports['navigation'] = result;
          if (!result.success) {
            allTasksSuccessful = false;
            issues.push('Navigation validation failed');
          }
          return result;
        })
      );
    }
    
    if (runKeyboard) {
      console.log('Testing keyboard navigation...');
      validationPromises.push(
        testKeyboardNavigation().then(result => {
          validationReports['keyboard'] = result;
          if (!result.success) {
            allTasksSuccessful = false;
            issues.push('Keyboard navigation validation failed');
          }
          return result;
        })
      );
    }
    
    if (runApi) {
      console.log('Validating API endpoints...');
      validationPromises.push(
        validateApiEndpoints().then(result => {
          validationReports['api'] = result;
          if (!result.success) {
            allTasksSuccessful = false;
            const failedCount = result.results.filter(r => !r.valid).length;
            issues.push(`${failedCount} API endpoints failed validation`);
          }
          return result;
        })
      );
    }
    
    // Wait for all validations to complete
    await Promise.all(validationPromises);
    
    // Generate summary
    let summary = `Comprehensive Validation completed at ${new Date().toLocaleString()}\n`;
    summary += `Overall Status: ${allTasksSuccessful ? 'ALL TASKS SUCCESSFUL ✓' : 'TASKS FAILED ✗'}\n`;
    
    if (issues.length > 0) {
      summary += '\nIssues found:\n';
      issues.forEach((issue, index) => {
        summary += `${index + 1}. ${issue}\n`;
      });
    } else {
      summary += '\nAll requested tasks were successfully validated. ✓\n';
    }
    
    console.log('='.repeat(80));
    console.log(summary);
    console.log('='.repeat(80));
    
    return {
      timestamp,
      allTasksSuccessful,
      validationReports,
      issues,
      summary
    };
  } catch (error) {
    console.error('Error during comprehensive validation:', error);
    return {
      timestamp,
      allTasksSuccessful: false,
      validationReports,
      issues: [`Error during validation: ${error.message || 'Unknown error'}`],
      summary: `Validation failed with error: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Display detailed validation results in the console
 */
export function displayComprehensiveValidation(result: ComprehensiveValidationResult): void {
  console.log('='.repeat(80));
  console.log(`COMPREHENSIVE VALIDATION RESULTS - ${result.allTasksSuccessful ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));
  console.log(result.summary);
  
  // Display detailed reports for each validation type
  Object.entries(result.validationReports).forEach(([type, report]) => {
    console.log('-'.repeat(40));
    console.log(`${type.toUpperCase()} VALIDATION:`);
    
    if (type === 'implementation' && report) {
      displayValidationResults(report);
    } else if (type === 'system' && report) {
      displayFullValidationResults(report);
    } else {
      console.log(JSON.stringify(report, null, 2));
    }
  });
  
  console.log('='.repeat(80));
  if (!result.allTasksSuccessful) {
    console.error('VALIDATION FAILED: Some tasks could not be verified successfully.');
    console.error('Please resolve all issues before proceeding to save or create a checkpoint.');
  } else {
    console.log('VALIDATION PASSED: All tasks were verified successfully.');
    console.log('You may proceed to save or create a checkpoint.');
  }
  console.log('='.repeat(80));
}

/**
 * Confirm that all requested tasks have been completed successfully
 * before proceeding to create a checkpoint
 */
export function confirmAllTasksCompleted(result: ComprehensiveValidationResult): boolean {
  if (!result.allTasksSuccessful) {
    console.error('CHECKPOINT PREVENTED: Not all tasks have been successfully validated.');
    console.error('Please resolve the following issues before creating a checkpoint:');
    result.issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue}`);
    });
    return false;
  }
  
  console.log('ALL TASKS VALIDATED SUCCESSFULLY: Safe to create checkpoint.');
  return true;
}

/**
 * Run the comprehensive validation and provide a clear indication of whether
 * it's safe to proceed with creating a checkpoint
 */
export async function verifyBeforeCheckpoint(tasks: string[] = ['all']): Promise<boolean> {
  console.log('Verifying all requested tasks before proceeding to checkpoint...');
  
  const result = await runComprehensiveValidation(tasks);
  displayComprehensiveValidation(result);
  
  return confirmAllTasksCompleted(result);
}

// Example usage:
// verifyBeforeCheckpoint(['navigation', 'accessibility', 'api']).then(canProceed => {
//   if (canProceed) {
//     console.log('Creating checkpoint...');
//     // Code to create checkpoint
//   } else {
//     console.log('Checkpoint creation aborted due to validation failures.');
//   }
// });
