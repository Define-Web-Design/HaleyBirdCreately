
/**
 * Comprehensive validation script for all implemented changes
 * This script checks all aspects of the application to ensure everything is working correctly
 */

import { fullTestSuite, runAutomatedTests, generateTestReport } from './testing-plan';
import { verifyNavigationLinks, verifyToastBehavior, checkPageInteractiveElements } from './navigation-tester';

// Main validation function
export async function validateImplementation(): Promise<{
  success: boolean;
  report: string;
}> {
  console.log('Starting comprehensive validation of all implemented changes...');
  
  const issues: string[] = [];
  let success = true;
  
  try {
    // Step 1: Run automated tests
    console.log('Step 1: Running automated tests...');
    const testResults = await runAutomatedTests();
    
    if (testResults.failed.length > 0) {
      success = false;
      issues.push(`${testResults.failed.length} automated tests failed`);
    }
    
    // Step 2: Verify navigation links
    console.log('Step 2: Verifying navigation links...');
    const navResults = await verifyNavigationLinks();
    
    if (!navResults.success) {
      success = false;
      issues.push(`Navigation links validation failed: ${navResults.errors.map(e => e.path).join(', ')}`);
    }
    
    // Step 3: Check toast behavior
    console.log('Step 3: Checking toast notifications...');
    const toastResults = await verifyToastBehavior();
    
    if (!toastResults.automatic && !toastResults.closable) {
      success = false;
      issues.push('Toast notifications have usability issues');
    }
    
    // Step 4: Check important pages
    console.log('Step 4: Checking page interactive elements...');
    const pagesToCheck = [
      '/',
      '/mood-capsules',
      '/color-palettes',
      '/content-library'
    ];
    
    for (const page of pagesToCheck) {
      const pageResults = await checkPageInteractiveElements(page);
      
      if (!pageResults.success) {
        success = false;
        issues.push(`Page ${page} has interactive element issues`);
      }
    }
    
    // Generate comprehensive report
    let report = `# Implementation Validation Report\n\n`;
    report += `## Overall Status: ${success ? 'SUCCESS ✓' : 'FAILED ✗'}\n\n`;
    
    if (issues.length > 0) {
      report += `## Issues Found\n`;
      issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }
    
    // Add test results to report
    report += generateTestReport(testResults);
    
    // Add navigation validation details
    report += `\n## Navigation Validation\n`;
    report += `- Status: ${navResults.success ? 'Passed' : 'Failed'}\n`;
    if (navResults.errors.length > 0) {
      report += `- Issues:\n`;
      navResults.errors.forEach(error => {
        report += `  - ${error.path}: ${error.error}\n`;
      });
    }
    
    // Add toast behavior details
    report += `\n## Toast Notification Validation\n`;
    report += `- Automatic dismissal: ${toastResults.automatic ? 'Yes' : 'No'}\n`;
    report += `- Manual close button: ${toastResults.closable ? 'Yes' : 'No'}\n`;
    report += `- Recommendations:\n`;
    toastResults.recommendations.forEach(rec => {
      report += `  - ${rec}\n`;
    });
    
    // Add page validation details
    report += `\n## Page Validations\n`;
    for (const page of pagesToCheck) {
      const pageResults = await checkPageInteractiveElements(page);
      report += `### ${page}\n`;
      report += `- Status: ${pageResults.success ? 'Passed' : 'Failed'}\n`;
      report += `- Interactive elements: ${pageResults.elementsCount}\n`;
      
      if (pageResults.interactiveElements.length > 0) {
        report += `- Elements found:\n`;
        pageResults.interactiveElements.slice(0, 5).forEach(element => {
          report += `  - ${element}\n`;
        });
        
        if (pageResults.interactiveElements.length > 5) {
          report += `  - ... and ${pageResults.interactiveElements.length - 5} more\n`;
        }
      }
    }
    
    return {
      success,
      report
    };
  } catch (error) {
    console.error('Error during validation:', error);
    return {
      success: false,
      report: `Validation failed with error: ${error.message || error}`
    };
  }
}

// Function to display validation results
export function displayValidationResults(results: {
  success: boolean;
  report: string;
}): void {
  console.log('='.repeat(80));
  console.log(`VALIDATION ${results.success ? 'SUCCEEDED' : 'FAILED'}`);
  console.log('='.repeat(80));
  console.log(results.report);
  console.log('='.repeat(80));
  
  if (!results.success) {
    console.error('Validation failed! Please address the issues listed above.');
  } else {
    console.log('All implementation changes have been validated successfully!');
  }
}

// To run the validation, use:
// validateImplementation().then(displayValidationResults);
