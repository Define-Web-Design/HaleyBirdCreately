
/**
 * Comprehensive validation script for all implemented changes
 * This script checks all aspects of the application to ensure everything is working correctly
 */

import { fullTestSuite, runAutomatedTests, generateTestReport } from './testing-plan';
import { verifyNavigationLinks, verifyToastBehavior, checkPageInteractiveElements, verifyPageLinks, runAccessibilityAudit } from './navigation-tester';
import { validateApiEndpoints, generateApiValidationReport } from './api-validator';

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
    
    // Additional validation: Check for dead links
    console.log('Step 5: Checking for dead links...');
    const linkResults = await verifyPageLinks();
    
    if (linkResults.potentialBrokenLinks.length > 0) {
      success = false;
      issues.push(`Found ${linkResults.potentialBrokenLinks.length} potentially broken links`);
    }
    
    // Additional validation: Accessibility audit
    console.log('Step 6: Running accessibility audit...');
    const a11yResults = await runAccessibilityAudit();
    
    if (a11yResults.score < 80) { // Set threshold at 80%
      success = false;
      issues.push(`Accessibility score is below threshold: ${a11yResults.score}%`);
      a11yResults.issues.forEach(issue => {
        issues.push(`A11y issue: ${issue}`);
      });
    }
    
    // Additional validation: API endpoints
    console.log('Step 7: Validating API endpoints...');
    const apiResults = await validateApiEndpoints();
    
    if (!apiResults.success) {
      success = false;
      const failedCount = apiResults.results.filter(r => !r.valid).length;
      issues.push(`${failedCount} API endpoints failed validation`);
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
    report += `- Accessibility compliant: ${toastResults.accessible ? 'Yes' : 'No'}\n`;
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
    
    // Add dead links report
    report += `\n## Link Validation\n`;
    report += `- Total links: ${linkResults.totalLinks}\n`;
    report += `- Potential broken links: ${linkResults.potentialBrokenLinks.length}\n`;
    
    if (linkResults.potentialBrokenLinks.length > 0) {
      report += `- Broken links found:\n`;
      linkResults.potentialBrokenLinks.slice(0, 10).forEach(link => {
        report += `  - ${link.text} (${link.href})\n`;
      });
      
      if (linkResults.potentialBrokenLinks.length > 10) {
        report += `  - ... and ${linkResults.potentialBrokenLinks.length - 10} more\n`;
      }
    }
    
    // Add accessibility report
    report += `\n## Accessibility Audit\n`;
    report += `- Score: ${a11yResults.score}%\n`;
    
    if (a11yResults.issues.length > 0) {
      report += `- Issues:\n`;
      a11yResults.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
    }
    
    report += `- Recommendations:\n`;
    a11yResults.recommendations.forEach(rec => {
      report += `  - ${rec}\n`;
    });
    
    // Add API validation report
    report += `\n## API Endpoint Validation\n`;
    report += `- Total endpoints: ${apiResults.results.length}\n`;
    report += `- Valid endpoints: ${apiResults.results.filter(r => r.valid).length}\n`;
    report += `- Invalid endpoints: ${apiResults.results.filter(r => !r.valid).length}\n\n`;
    
    if (apiResults.results.filter(r => !r.valid).length > 0) {
      report += `- Failed endpoints:\n`;
      apiResults.results.filter(r => !r.valid).forEach(endpoint => {
        report += `  - ${endpoint.method} ${endpoint.endpoint}: ${endpoint.error || 'Unknown error'}\n`;
      });
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
