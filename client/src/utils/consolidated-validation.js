
/**
 * Consolidated Validation System
 * A unified approach to validation across the application
 */

const { validateApiEndpoints } = require('./api-validator.js');
const { runAccessibilityAudit, verifyPageLinks } = require('./navigation-tester.js');
const { testAppResponsiveness } = require('./responsive-tester.js');
const { securityMonitor } = require('../../server/services/securityMonitor.js');

/**
 * Run a comprehensive validation of the entire application
 */
async function runFullSystemValidation(options = {}) {
  console.log('Starting full system validation...');
  
  const results = {
    timestamp: new Date().toISOString(),
    overallSuccess: false,
    sections: [],
    issues: []
  };
  
  try {
    // 1. API Validation
    const apiResults = await validateApiEndpoints();
    results.sections.push({
      name: 'API Endpoints',
      success: apiResults.success,
      details: apiResults.results
    });
    
    if (!apiResults.success) {
      results.issues.push('API validation failed');
    }
    
    // 2. Accessibility Validation
    const a11yResults = await runAccessibilityAudit();
    const a11ySuccess = a11yResults.score >= 80;
    results.sections.push({
      name: 'Accessibility',
      success: a11ySuccess,
      details: {
        score: a11yResults.score,
        issues: a11yResults.issues || []
      }
    });
    
    if (!a11ySuccess) {
      results.issues.push(`Accessibility score (${a11yResults.score}) below minimum threshold of 80`);
    }
    
    // 3. Navigation Links
    const navResults = await verifyPageLinks();
    const navSuccess = navResults.potentialBrokenLinks.length === 0;
    results.sections.push({
      name: 'Navigation Links',
      success: navSuccess,
      details: {
        totalLinks: navResults.totalLinks,
        brokenLinks: navResults.potentialBrokenLinks
      }
    });
    
    if (!navSuccess) {
      results.issues.push(`${navResults.potentialBrokenLinks.length} broken navigation links detected`);
    }
    
    // 4. Mobile Responsiveness
    const mobileResults = await testAppResponsiveness();
    results.sections.push({
      name: 'Mobile Responsiveness',
      success: mobileResults.success,
      details: mobileResults.summary
    });
    
    if (!mobileResults.success) {
      results.issues.push('Mobile responsiveness tests failed');
    }
    
    // 5. Security Validation
    const securityResults = await securityMonitor.validateAssetIntegrity();
    results.sections.push({
      name: 'Security',
      success: securityResults.valid,
      details: securityResults
    });
    
    if (!securityResults.valid) {
      results.issues.push('Security validation failed');
    }
    
    // Calculate overall success
    results.overallSuccess = results.sections.every(section => section.success);
    
    return results;
  } catch (error) {
    console.error('Error during system validation:', error);
    results.overallSuccess = false;
    results.error = error.message;
    results.issues.push(`Validation error: ${error.message}`);
    return results;
  }
}

/**
 * Display the validation results in a readable format
 */
function displayFullValidationResults(report) {
  console.log('\n======== VALIDATION REPORT ========');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Overall Status: ${report.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\nSection Results:');
  report.sections.forEach(section => {
    console.log(`- ${section.name}: ${section.success ? '✅ PASSED' : '❌ FAILED'}`);
  });
  
  if (report.issues.length > 0) {
    console.log('\nIssues:');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log('\nRecommendations:');
  if (report.overallSuccess) {
    console.log('- All systems validated successfully');
    console.log('- Safe to create checkpoint or deploy');
  } else {
    console.log('- Address the issues listed above before proceeding');
    
    if (report.sections.find(s => s.name === 'API Endpoints' && !s.success)) {
      console.log('- Fix API endpoint issues to restore full functionality');
    }
    
    if (report.sections.find(s => s.name === 'Accessibility' && !s.success)) {
      console.log('- Improve accessibility to ensure compliance with standards');
    }
    
    if (report.sections.find(s => s.name === 'Navigation Links' && !s.success)) {
      console.log('- Fix broken navigation links to improve user experience');
    }
    
    if (report.sections.find(s => s.name === 'Mobile Responsiveness' && !s.success)) {
      console.log('- Address mobile responsiveness issues for better cross-device support');
    }
    
    if (report.sections.find(s => s.name === 'Security' && !s.success)) {
      console.log('- Resolve security issues to protect user data');
    }
  }
  
  console.log('=================================\n');
}

/**
 * Run a comprehensive task verification workflow
 */
async function runCompleteWorkflowValidation(taskDescription = null) {
  console.log('Starting comprehensive task verification workflow...');
  
  try {
    const validationResults = await runFullSystemValidation();
    displayFullValidationResults(validationResults);
    
    return validationResults.overallSuccess;
  } catch (error) {
    console.error('Error during workflow validation:', error);
    return false;
  }
}

module.exports = {
  runFullSystemValidation,
  displayFullValidationResults,
  runCompleteWorkflowValidation
};
