
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
