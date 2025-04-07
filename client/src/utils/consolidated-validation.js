
/**
 * Consolidated Validation System
 * A unified approach to validation across the application
 */

const { validateApiEndpoints } = require('./api-validator.js');
const { runAccessibilityAudit, verifyPageLinks } = require('./navigation-tester.js');
const { testAppResponsiveness } = require('./responsive-tester.js');
const { securityMonitor } = require('../../server/services/securityMonitor.js');

// Cache validation results to avoid redundant operations
const validationCache = {
  lastValidation: null,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  results: null
};

/**
 * Run a comprehensive validation of the entire application
 * @param {Object} options - Configuration options
 * @param {boolean} options.useCache - Whether to use cached results if available
 * @param {boolean} options.skipSections - Sections to skip (for targeted validation)
 * @returns {Promise<Object>} Validation results
 */
async function runFullSystemValidation(options = {}) {
  const { useCache = false, skipSections = [] } = options;
  console.log('Starting full system validation...');
  
  // Check if we can use cached results
  if (useCache && 
      validationCache.lastValidation && 
      (Date.now() - validationCache.lastValidation) < validationCache.cacheTimeout) {
    console.log('Using cached validation results from', new Date(validationCache.lastValidation).toLocaleString());
    return validationCache.results;
  }
  
  const startTime = performance.now();
  
  const results = {
    timestamp: new Date().toISOString(),
    overallSuccess: false,
    sections: [],
    issues: [],
    performanceMetrics: {
      validationDuration: 0,
      sectionTimes: {}
    }
  };
  
  try {
    // 1. API Validation (unless skipped)
    if (!skipSections.includes('api')) {
      const apiStartTime = performance.now();
      const apiResults = await validateApiEndpoints();
      results.performanceMetrics.sectionTimes.api = performance.now() - apiStartTime;
      
      results.sections.push({
        name: 'API Endpoints',
        success: apiResults.success,
        details: apiResults.results
      });
      
      if (!apiResults.success) {
        results.issues.push('API validation failed');
      }
    }
    
    // 2. Accessibility Validation (unless skipped)
    if (!skipSections.includes('accessibility')) {
      const a11yStartTime = performance.now();
      const a11yResults = await runAccessibilityAudit();
      results.performanceMetrics.sectionTimes.accessibility = performance.now() - a11yStartTime;
      
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
    }
    
    // 3. Navigation Links (unless skipped)
    if (!skipSections.includes('navigation')) {
      const navStartTime = performance.now();
      const navResults = await verifyPageLinks();
      results.performanceMetrics.sectionTimes.navigation = performance.now() - navStartTime;
      
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
    }
    
    // 4. Mobile Responsiveness (unless skipped)
    if (!skipSections.includes('mobile')) {
      const mobileStartTime = performance.now();
      const mobileResults = await testAppResponsiveness();
      results.performanceMetrics.sectionTimes.mobile = performance.now() - mobileStartTime;
      
      results.sections.push({
        name: 'Mobile Responsiveness',
        success: mobileResults.success,
        details: mobileResults.summary
      });
      
      if (!mobileResults.success) {
        results.issues.push('Mobile responsiveness tests failed');
      }
    }
    
    // 5. Security Validation (unless skipped)
    if (!skipSections.includes('security')) {
      const securityStartTime = performance.now();
      const securityResults = await securityMonitor.validateAssetIntegrity();
      results.performanceMetrics.sectionTimes.security = performance.now() - securityStartTime;
      
      results.sections.push({
        name: 'Security',
        success: securityResults.valid,
        details: securityResults
      });
      
      if (!securityResults.valid) {
        results.issues.push('Security validation failed');
      }
    }
    
    // Calculate overall success - only consider sections that were actually run
    results.overallSuccess = results.sections.length > 0 && 
                            results.sections.every(section => section.success);
    
    // Calculate total execution time
    results.performanceMetrics.validationDuration = performance.now() - startTime;
    
    // Cache the results
    validationCache.lastValidation = Date.now();
    validationCache.results = results;
    
    return results;
  } catch (error) {
    console.error('Error during system validation:', error);
    results.overallSuccess = false;
    results.error = error.message;
    results.issues.push(`Validation error: ${error.message}`);
    results.performanceMetrics.validationDuration = performance.now() - startTime;
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
  
  if (report.performanceMetrics) {
    console.log(`\nValidation Duration: ${(report.performanceMetrics.validationDuration / 1000).toFixed(2)}s`);
    
    if (report.performanceMetrics.sectionTimes) {
      console.log('\nSection Performance:');
      for (const [section, time] of Object.entries(report.performanceMetrics.sectionTimes)) {
        console.log(`- ${section}: ${(time / 1000).toFixed(2)}s`);
      }
    }
  }
  
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
 * @param {string} taskDescription - Optional task description for targeted validation
 * @returns {Promise<boolean>} Success status
 */
async function runCompleteWorkflowValidation(taskDescription = null) {
  console.log('Starting comprehensive task verification workflow...');
  
  try {
    // If we have a specific task description, we can optimize by running only relevant validation sections
    const skipSections = [];
    if (taskDescription) {
      const description = taskDescription.toLowerCase();
      
      // Only run relevant validations based on the task description
      if (!description.includes('api') && !description.includes('endpoint')) {
        skipSections.push('api');
      }
      
      if (!description.includes('accessibility') && !description.includes('a11y')) {
        skipSections.push('accessibility');
      }
      
      if (!description.includes('link') && !description.includes('navigation')) {
        skipSections.push('navigation');
      }
      
      if (!description.includes('mobile') && !description.includes('responsive')) {
        skipSections.push('mobile');
      }
      
      if (!description.includes('security') && !description.includes('secure')) {
        skipSections.push('security');
      }
    }
    
    const validationResults = await runFullSystemValidation({ 
      skipSections: skipSections
    });
    displayFullValidationResults(validationResults);
    
    return validationResults.overallSuccess;
  } catch (error) {
    console.error('Error during workflow validation:', error);
    return false;
  }
}

/**
 * Reset the validation cache
 */
function clearValidationCache() {
  validationCache.lastValidation = null;
  validationCache.results = null;
  console.log('Validation cache cleared');
}

/**
 * Run a partial validation focusing only on specific sections
 * @param {Array<string>} sections - Sections to validate
 * @returns {Promise<Object>} Validation results
 */
async function runPartialValidation(sections = []) {
  const allSections = ['api', 'accessibility', 'navigation', 'mobile', 'security'];
  const skipSections = allSections.filter(section => !sections.includes(section));
  
  return await runFullSystemValidation({
    skipSections,
    useCache: false
  });
}

module.exports = {
  runFullSystemValidation,
  displayFullValidationResults,
  runCompleteWorkflowValidation,
  clearValidationCache,
  runPartialValidation
};
