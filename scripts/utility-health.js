
/**
 * Utility Function Health Monitor
 * 
 * This script checks the health of registered utility functions and
 * provides recommendations for optimization.
 */

const fs = require('fs');
const path = require('path');
const { utilityRegistry } = require('../shared/utils/utilityRegistry');

/**
 * Monitor utility function health
 */
function monitorUtilityHealth() {
  console.log('Starting utility function health check...');
  
  // Generate health report
  const report = utilityRegistry.generateHealthReport();
  
  // Analyze report and generate recommendations
  const recommendations = generateRecommendations(report);
  
  // Format results
  const results = {
    timestamp: new Date().toISOString(),
    report,
    recommendations,
    summary: {
      totalUtilities: report.totalUtilities,
      warningCount: Object.values(report.warnings)
        .reduce((sum, arr) => sum + arr.length, 0),
      recommendationCount: recommendations.length
    }
  };
  
  // Output results
  console.log('\nUtility Function Health Report:');
  console.log('================================\n');
  
  console.log(`Total utilities: ${results.summary.totalUtilities}`);
  console.log(`Warnings: ${results.summary.warningCount}`);
  console.log(`Recommendations: ${results.summary.recommendationCount}`);
  
  if (report.warnings.unusedUtilities.length > 0) {
    console.log('\nUnused utilities:');
    report.warnings.unusedUtilities.forEach(util => {
      console.log(`  - ${util}`);
    });
  }
  
  if (report.warnings.deprecatedInUse.length > 0) {
    console.log('\nDeprecated utilities still in use:');
    report.warnings.deprecatedInUse.forEach(util => {
      console.log(`  - ${util}`);
    });
  }
  
  if (report.warnings.circularDependencies.length > 0) {
    console.log('\nCircular dependencies:');
    report.warnings.circularDependencies.forEach(cycle => {
      console.log(`  - ${cycle.join(' → ')} → ${cycle[0]}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\nRecommendations:');
    recommendations.forEach(rec => {
      console.log(`  - [${rec.priority}] ${rec.message}`);
      if (rec.details) {
        console.log(`    ${rec.details}`);
      }
    });
  }
  
  // Save results to file
  const outputPath = path.resolve(__dirname, '../logs/utility-health.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\nResults saved to ${outputPath}`);
  return results;
}

/**
 * Generate recommendations based on health report
 */
function generateRecommendations(report) {
  const recommendations = [];
  
  // Recommendations for unused utilities
  if (report.warnings.unusedUtilities.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'unused',
      message: `Remove ${report.warnings.unusedUtilities.length} unused utilities to reduce bundle size`,
      details: `Removing unused code can improve performance and maintainability.`
    });
  }
  
  // Recommendations for deprecated utilities
  if (report.warnings.deprecatedInUse.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'deprecated',
      message: `Update ${report.warnings.deprecatedInUse.length} deprecated utilities to their recommended replacements`,
      details: `Using deprecated utilities may lead to future compatibility issues.`
    });
  }
  
  // Recommendations for circular dependencies
  if (report.warnings.circularDependencies.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'circular',
      message: `Resolve ${report.warnings.circularDependencies.length} circular dependencies`,
      details: `Circular dependencies can cause hard-to-debug issues and make code harder to test.`
    });
  }
  
  // Category imbalance recommendation
  const categoryCounts = report.categoryCounts;
  const largestCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0];
    
  if (largestCategory[1] > report.totalUtilities * 0.5) {
    recommendations.push({
      priority: 'LOW',
      type: 'organization',
      message: `Consider splitting the '${largestCategory[0]}' category into more specific subcategories`,
      details: `Large categories (${largestCategory[1]} utilities) make code harder to navigate and maintain.`
    });
  }
  
  // Platform-specific recommendations
  const platformCounts = report.platformCounts;
  if (platformCounts.shared < platformCounts.client + platformCounts.server) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'organization',
      message: 'Look for opportunities to make more utilities shareable across platforms',
      details: `Only ${platformCounts.shared} of ${report.totalUtilities} utilities are shared between client and server.`
    });
  }
  
  // Most used utilities recommendation
  if (report.mostUsed.length > 0 && report.mostUsed[0].usageCount > 20) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'performance',
      message: `Optimize frequently used utility '${report.mostUsed[0].utility}' (${report.mostUsed[0].usageCount} uses)`,
      details: 'Heavily used utilities should be optimized for performance.'
    });
  }
  
  return recommendations;
}

// Run if called directly
if (require.main === module) {
  monitorUtilityHealth();
}

module.exports = { monitorUtilityHealth };
