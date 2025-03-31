
/**
 * Comprehensive validation system that brings together all validation utilities
 * to provide a single, complete test of the entire system
 */

import { validateImplementation, displayValidationResults } from './validate-implementation';
import { verifyPageLinks, runAccessibilityAudit, verifyNavigationLinks, testKeyboardNavigation, checkPageInteractiveElements } from './navigation-tester';
import { validateApiEndpoints, generateApiValidationReport } from './api-validator';

export interface ValidationReport {
  timestamp: string;
  overallSuccess: boolean;
  sections: {
    name: string;
    success: boolean;
    details: any;
  }[];
  summary: string;
  recommendations: string[];
}

/**
 * Runs all validation checks in the system and returns a consolidated report
 */
export async function runFullSystemValidation(): Promise<ValidationReport> {
  console.log('Starting full system validation...');
  console.log('='.repeat(80));
  
  const timestamp = new Date().toISOString();
  const sections: ValidationReport['sections'] = [];
  const recommendations: string[] = [];
  let overallSuccess = true;
  
  try {
    // 1. Implementation validation (most comprehensive)
    console.log('Running implementation validation...');
    const implementationResults = await validateImplementation();
    sections.push({
      name: 'Implementation Validation',
      success: implementationResults.success,
      details: implementationResults.report
    });
    
    if (!implementationResults.success) {
      overallSuccess = false;
    }
    
    // 2. Page links validation
    console.log('Verifying page links...');
    const linkResults = await verifyPageLinks();
    sections.push({
      name: 'Link Validation',
      success: linkResults.potentialBrokenLinks.length === 0,
      details: {
        totalLinks: linkResults.totalLinks,
        brokenLinks: linkResults.potentialBrokenLinks
      }
    });
    
    if (linkResults.potentialBrokenLinks.length > 0) {
      overallSuccess = false;
      recommendations.push(...linkResults.recommendations);
    }
    
    // 3. Accessibility audit
    console.log('Running accessibility audit...');
    const a11yResults = await runAccessibilityAudit();
    const a11ySuccess = a11yResults.score >= 80; // 80% threshold
    
    sections.push({
      name: 'Accessibility Audit',
      success: a11ySuccess,
      details: {
        score: a11yResults.score,
        issues: a11yResults.issues
      }
    });
    
    if (!a11ySuccess) {
      overallSuccess = false;
      recommendations.push(...a11yResults.recommendations);
    }
    
    // 4. Navigation validation
    console.log('Verifying navigation functionality...');
    const navResults = await verifyNavigationLinks();
    sections.push({
      name: 'Navigation Validation',
      success: navResults.success,
      details: {
        errors: navResults.errors
      }
    });
    
    if (!navResults.success) {
      overallSuccess = false;
    }
    
    // 5. Keyboard navigation
    console.log('Testing keyboard navigation...');
    const keyboardResults = await testKeyboardNavigation();
    sections.push({
      name: 'Keyboard Navigation',
      success: keyboardResults.success,
      details: {
        focusableElements: keyboardResults.focusableElements,
        tabbableElements: keyboardResults.tabbableElements,
        issues: keyboardResults.issues
      }
    });
    
    if (!keyboardResults.success) {
      overallSuccess = false;
      recommendations.push(...keyboardResults.recommendations);
    }
    
    // 6. API validation
    console.log('Validating API endpoints...');
    const apiResults = await validateApiEndpoints();
    const validEndpoints = apiResults.results.filter(r => r.valid).length;
    const totalEndpoints = apiResults.results.length;
    
    sections.push({
      name: 'API Endpoint Validation',
      success: apiResults.success,
      details: {
        validEndpoints,
        totalEndpoints,
        failedEndpoints: apiResults.results.filter(r => !r.valid)
      }
    });
    
    if (!apiResults.success) {
      overallSuccess = false;
      const apiRecommendations = apiResults.results
        .filter(r => !r.valid)
        .map(endpoint => `Fix API endpoint: ${endpoint.method} ${endpoint.endpoint}`);
      recommendations.push(...apiRecommendations);
    }
    
    // 7. Check each important page
    console.log('Checking interactive elements on key pages...');
    const pagesToCheck = [
      '/',
      '/mood-capsules',
      '/color-palettes',
      '/content-library',
      '/platform-integrations',
      '/creative-symbiosis'
    ];
    
    const pageResults: {
      page: string;
      success: boolean;
      elementsCount: number;
      issues?: string[];
    }[] = [];
    
    for (const page of pagesToCheck) {
      try {
        const result = await checkPageInteractiveElements(page);
        pageResults.push({
          page,
          success: result.success,
          elementsCount: result.elementsCount
        });
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        pageResults.push({
          page,
          success: false,
          elementsCount: 0,
          issues: [`Error checking page: ${error.message}`]
        });
        overallSuccess = false;
      }
    }
    
    sections.push({
      name: 'Page Validation',
      success: pageResults.every(p => p.success),
      details: {
        pages: pageResults
      }
    });
    
    // Generate overall summary
    let summary = `System Validation completed at ${new Date().toLocaleString()}\n`;
    summary += `Overall Status: ${overallSuccess ? 'PASSED ✓' : 'FAILED ✗'}\n`;
    summary += `${sections.filter(s => s.success).length} of ${sections.length} validation checks passed.\n`;
    
    if (!overallSuccess) {
      summary += '\nFailed validations:\n';
      sections.filter(s => !s.success).forEach(section => {
        summary += `- ${section.name}\n`;
      });
    }
    
    console.log('='.repeat(80));
    console.log(summary);
    
    if (recommendations.length > 0) {
      console.log('\nRecommendations:');
      recommendations.forEach(rec => {
        console.log(`- ${rec}`);
      });
    }
    
    return {
      timestamp,
      overallSuccess,
      sections,
      summary,
      recommendations
    };
    
  } catch (error) {
    console.error('Error during validation:', error);
    return {
      timestamp,
      overallSuccess: false,
      sections: [
        {
          name: 'Validation System',
          success: false,
          details: {
            error: error.message || 'Unknown error occurred during validation'
          }
        }
      ],
      summary: `Validation failed with error: ${error.message || error}`,
      recommendations: ['Check the validation system for errors']
    };
  }
}

/**
 * Display the results of the validation in the console
 */
export function displayFullValidationResults(report: ValidationReport): void {
  console.log('='.repeat(80));
  console.log(`FULL SYSTEM VALIDATION: ${report.overallSuccess ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));
  console.log(report.summary);
  
  report.sections.forEach(section => {
    console.log('-'.repeat(40));
    console.log(`${section.name}: ${section.success ? 'PASSED ✓' : 'FAILED ✗'}`);
    
    if (!section.success) {
      console.log('\nDetails:');
      console.log(JSON.stringify(section.details, null, 2));
    }
  });
  
  if (report.recommendations.length > 0) {
    console.log('\nRecommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('='.repeat(80));
}

/**
 * Save validation results to a file for future reference
 * @param report The validation report to save
 * @param filePath Optional file path to save to
 */
export async function saveValidationReport(report: ValidationReport, filePath?: string): Promise<void> {
  const defaultPath = `validation-report-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const path = filePath || defaultPath;
  
  try {
    // In a browser environment, trigger download
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`Validation report saved to ${path}`);
  } catch (error) {
    console.error('Error saving validation report:', error);
  }
}

// Import the task validation orchestrator
import { taskOrchestrator, TaskRequest } from './task-validation-orchestrator';
import { runValidationFromInstruction, runValidationWorkflow } from './validation-runner';

// Function to run the complete workflow validation
export async function runCompleteWorkflowValidation(instruction?: string): Promise<boolean> {
  console.log('Starting complete workflow validation...');
  console.log('='.repeat(80));
  
  try {
    if (instruction) {
      return runValidationFromInstruction(instruction, { 
        displayResults: true, 
        throwOnFailure: false 
      });
    } else {
      // Run a full system validation
      const report = await runFullSystemValidation();
      displayFullValidationResults(report);
      return report.overallSuccess;
    }
  } catch (error) {
    console.error('Error during workflow validation:', error);
    return false;
  }
}

// Command-line execution
// To run the full validation with workflow:
// runCompleteWorkflowValidation("Fix navigation links and improve accessibility").then(success => {
//   console.log(success ? 'Workflow completed successfully!' : 'Workflow validation failed');
//   process.exit(success ? 0 : 1);
// });
