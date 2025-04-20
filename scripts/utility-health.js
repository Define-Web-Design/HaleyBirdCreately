
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
/**
 * Utility Functions Health Analyzer
 * 
 * This script analyzes utility functions for maintainability, flexibility,
 * and future-proofing, providing recommendations for improvement.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { utilityRegistry } = require('../shared/utils/utilityRegistry');

// Constants
const UTILITY_DIRS = [
  './shared/utils',
  './server/utils',
  './client/src/utils',
  './client/src/lib'
];

// Code complexity thresholds
const COMPLEXITY_THRESHOLDS = {
  FUNCTION_LINES: 50,   // Max recommended lines per function
  CYCLOMATIC: 10,       // Max recommended cyclomatic complexity
  PARAMS: 4,            // Max recommended parameters
  DEPTH: 3              // Max recommended nesting depth
};

/**
 * Run utility functions health analysis
 */
async function analyzeUtilityHealth() {
  console.log('🔍 Analyzing utility functions health...');
  
  try {
    // Get data from utility registry if available
    let registryReport = {};
    let isDependencyGraphAvailable = false;
    
    try {
      registryReport = utilityRegistry.generateHealthReport();
      isDependencyGraphAvailable = true;
      console.log('📊 Retrieved utility registry health data');
    } catch (error) {
      console.warn('⚠️ Utility registry not available, using static analysis only:', error.message);
      registryReport = { warnings: { unusedUtilities: [], deprecatedInUse: [], circularDependencies: [] } };
    }
    
    // Find utility files across codebase
    const utilityFiles = findUtilityFiles();
    console.log(`🔎 Found ${utilityFiles.length} utility files to analyze`);
    
    // Analyze each utility file
    const fileAnalysis = analyzeUtilityFiles(utilityFiles);
    
    // Analyze for redundancy
    const redundancyAnalysis = analyzeForRedundancy(utilityFiles);
    
    // Generate recommendations
    const recommendations = generateRecommendations(
      fileAnalysis, 
      redundancyAnalysis,
      registryReport
    );
    
    // Create optimization plan
    const optimizationPlan = createOptimizationPlan(
      fileAnalysis, 
      redundancyAnalysis,
      registryReport,
      isDependencyGraphAvailable
    );
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: utilityFiles.length,
        totalFunctions: fileAnalysis.reduce((sum, file) => sum + file.functions.length, 0),
        highComplexityFunctions: fileAnalysis.reduce(
          (sum, file) => sum + file.functions.filter(f => f.isComplex).length, 
          0
        ),
        potentialRedundancies: redundancyAnalysis.similarities.length,
        deprecatedInUse: registryReport.warnings.deprecatedInUse.length,
        circularDependencies: registryReport.warnings.circularDependencies.length
      },
      recommendations,
      optimizationPlan,
      fileDetails: fileAnalysis.map(file => ({
        path: file.path,
        functionCount: file.functions.length,
        complexFunctions: file.functions.filter(f => f.isComplex).map(f => f.name),
        maintainabilityScore: file.maintainabilityScore
      }))
    };
    
    // Save report to file
    const reportDir = path.resolve(__dirname, '../logs');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.resolve(reportDir, 'utility-health.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n📊 Utility Health Analysis Summary:');
    console.log(`   Total utility files: ${report.summary.totalFiles}`);
    console.log(`   Total utility functions: ${report.summary.totalFunctions}`);
    console.log(`   High complexity functions: ${report.summary.highComplexityFunctions}`);
    console.log(`   Potential redundancies: ${report.summary.potentialRedundancies}`);
    console.log(`   Deprecated utilities in use: ${report.summary.deprecatedInUse}`);
    console.log(`   Circular dependencies: ${report.summary.circularDependencies}`);
    console.log(`   Report saved to: ${reportPath}`);
    
    // Display top recommendations
    console.log('\n📋 Top Recommendations:');
    recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.title}`);
      console.log(`   - ${rec.description}`);
    });
    
    return report;
  } catch (error) {
    console.error('❌ Error analyzing utility health:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Find utility files across the codebase
 */
function findUtilityFiles() {
  const utilityFiles = [];
  
  for (const dir of UTILITY_DIRS) {
    if (!fs.existsSync(dir)) {
      continue;
    }
    
    try {
      const findCommand = `find "${dir}" -type f -name "*.ts" -o -name "*.js" | grep -v ".test." | grep -v ".spec."`;
      const files = execSync(findCommand, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);
      
      utilityFiles.push(...files);
    } catch (error) {
      console.warn(`⚠️ Error finding files in ${dir}:`, error.message);
    }
  }
  
  return utilityFiles;
}

/**
 * Analyze utility files for complexity and maintainability
 */
function analyzeUtilityFiles(files) {
  const analysis = [];
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const functions = extractFunctions(content, filePath);
      
      // Calculate maintainability score (0-100, higher is better)
      const maintainabilityScore = calculateMaintainabilityScore(content, functions);
      
      analysis.push({
        path: filePath,
        functions,
        maintainabilityScore
      });
    } catch (error) {
      console.warn(`⚠️ Error analyzing file ${filePath}:`, error.message);
    }
  }
  
  return analysis;
}

/**
 * Extract functions from file content
 */
function extractFunctions(content, filePath) {
  const functions = [];
  
  // Match function declarations
  const functionRegexes = [
    // Named function declarations
    /function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*{/g,
    // Arrow functions with explicit name (const/let/var)
    /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*{/g,
    // Class methods
    /(?:async\s+)?([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*{/g,
    // Export function
    /export\s+function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*{/g
  ];
  
  for (const regex of functionRegexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const name = match[1];
      const params = match[2].split(',').filter(Boolean);
      
      // Skip constructor and common lifecycle methods
      if (name === 'constructor' || 
          name === 'componentDidMount' || 
          name === 'componentWillUnmount' ||
          name === 'render' ||
          name.startsWith('_')) {
        continue;
      }
      
      // Extract function body to calculate complexity
      const startIndex = match.index + match[0].length;
      const body = extractBalancedSubstring(content.slice(startIndex), '{', '}');
      
      // Calculate complexity metrics
      const lines = body.split('\n').length;
      const cyclomatic = calculateCyclomaticComplexity(body);
      const paramCount = params.length;
      const nestingDepth = calculateNestingDepth(body);
      
      // Determine if function is complex based on thresholds
      const isComplex = 
        lines > COMPLEXITY_THRESHOLDS.FUNCTION_LINES ||
        cyclomatic > COMPLEXITY_THRESHOLDS.CYCLOMATIC ||
        paramCount > COMPLEXITY_THRESHOLDS.PARAMS ||
        nestingDepth > COMPLEXITY_THRESHOLDS.DEPTH;
      
      functions.push({
        name,
        paramCount,
        lines,
        cyclomatic,
        nestingDepth,
        isComplex
      });
    }
  }
  
  return functions;
}

/**
 * Extract balanced substring with matching open/close characters
 */
function extractBalancedSubstring(str, openChar, closeChar) {
  let balance = 1;
  let index = 0;
  
  while (balance > 0 && index < str.length) {
    index++;
    if (str[index] === openChar) {
      balance++;
    } else if (str[index] === closeChar) {
      balance--;
    }
  }
  
  return str.slice(0, index);
}

/**
 * Calculate cyclomatic complexity of function body
 */
function calculateCyclomaticComplexity(body) {
  // Base complexity is 1
  let complexity = 1;
  
  // Add 1 for each decision point
  const decisionRegexes = [
    /if\s*\(/g,
    /else\s+if/g,
    /}\s*else\s*{/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /do\s*{/g,
    /switch\s*\(/g,
    /case\s+/g,
    /default\s*:/g,
    /catch\s*\(/g,
    /\&\&/g,
    /\|\|/g,
    /\?/g
  ];
  
  for (const regex of decisionRegexes) {
    const matches = body.match(regex) || [];
    complexity += matches.length;
  }
  
  return complexity;
}

/**
 * Calculate maximum nesting depth of function body
 */
function calculateNestingDepth(body) {
  const lines = body.split('\n');
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const line of lines) {
    // Increase depth for each opening brace not preceded by a closing brace on same line
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    currentDepth += openBraces - closeBraces;
    maxDepth = Math.max(maxDepth, currentDepth);
  }
  
  return maxDepth;
}

/**
 * Calculate maintainability score (0-100)
 */
function calculateMaintainabilityScore(content, functions) {
  // Base score
  let score = 100;
  
  // Deduct for file length (more than 500 lines starts deducting)
  const lines = content.split('\n').length;
  if (lines > 500) {
    score -= Math.min(20, (lines - 500) / 50);
  }
  
  // Deduct for complex functions
  const complexFunctions = functions.filter(f => f.isComplex).length;
  if (complexFunctions > 0) {
    score -= Math.min(30, complexFunctions * 5);
  }
  
  // Deduct for long lines
  const longLines = content.split('\n').filter(line => line.length > 100).length;
  if (longLines > 0) {
    score -= Math.min(10, longLines);
  }
  
  // Deduct for lack of comments
  const commentLines = (content.match(/\/\/|\/\*|\*\//g) || []).length;
  const commentRatio = commentLines / lines;
  if (commentRatio < 0.1) {
    score -= 10;
  }
  
  // Deduct for many imports
  const imports = (content.match(/import .* from/g) || []).length;
  if (imports > 15) {
    score -= Math.min(10, (imports - 15) / 2);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyze for potential redundancy and duplication
 */
function analyzeForRedundancy(files) {
  const similarities = [];
  const functionSignatures = new Map();
  
  // Extract function signatures and look for similar patterns
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract function signatures
      const functionMatches = content.match(/function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g) || [];
      
      for (const signature of functionMatches) {
        // Extract function name
        const nameMatch = signature.match(/function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)/);
        const name = nameMatch ? (nameMatch[1] || nameMatch[2]) : 'unknown';
        
        // Skip if already processed
        if (functionSignatures.has(name)) {
          const existingPath = functionSignatures.get(name);
          
          // Only consider as similarity if in different file
          if (existingPath !== filePath) {
            similarities.push({
              name,
              locations: [existingPath, filePath]
            });
          }
        } else {
          functionSignatures.set(name, filePath);
        }
      }
      
      // Look for semantic similarities in utility functions
      const semanticPatterns = [
        { pattern: /format.*date|date.*format|parse.*date|date.*parse/i, category: 'date formatting' },
        { pattern: /valid.*email|email.*valid/i, category: 'email validation' },
        { pattern: /valid.*url|url.*valid/i, category: 'URL validation' },
        { pattern: /format.*number|number.*format|parse.*number|number.*parse/i, category: 'number formatting' },
        { pattern: /sanitize.*html|html.*sanitize/i, category: 'HTML sanitization' },
        { pattern: /deep.*clone|clone.*deep/i, category: 'deep cloning' },
        { pattern: /merge.*object|object.*merge/i, category: 'object merging' },
        { pattern: /encode.*uri|uri.*encode/i, category: 'URI encoding' },
        { pattern: /sort.*array|array.*sort/i, category: 'array sorting' },
        { pattern: /debounce|throttle/i, category: 'execution control' }
      ];
      
      for (const { pattern, category } of semanticPatterns) {
        const matches = content.match(pattern);
        
        if (matches) {
          // Check if we've seen this category before
          const existingSimilarity = similarities.find(s => 
            s.category === category && 
            !s.locations.includes(filePath)
          );
          
          if (existingSimilarity) {
            existingSimilarity.locations.push(filePath);
          } else {
            similarities.push({
              category,
              locations: [filePath]
            });
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error analyzing redundancy in ${filePath}:`, error.message);
    }
  }
  
  // Filter out similarities with only one location
  const validSimilarities = similarities.filter(s => s.locations.length > 1);
  
  return {
    similarities: validSimilarities
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(fileAnalysis, redundancyAnalysis, registryReport) {
  const recommendations = [];
  
  // Recommend refactoring complex functions
  const complexFiles = fileAnalysis
    .filter(file => file.functions.some(f => f.isComplex))
    .sort((a, b) => 
      b.functions.filter(f => f.isComplex).length - 
      a.functions.filter(f => f.isComplex).length
    );
  
  if (complexFiles.length > 0) {
    recommendations.push({
      title: 'Refactor complex utility functions',
      type: 'complexity',
      priority: 'high',
      description: `${complexFiles.length} files contain complex functions that exceed recommended thresholds`,
      details: complexFiles.slice(0, 5).map(file => ({
        file: file.path,
        complexFunctions: file.functions.filter(f => f.isComplex).map(f => f.name)
      }))
    });
  }
  
  // Recommend consolidating redundant functionality
  const redundantCategories = redundancyAnalysis.similarities
    .filter(s => s.category)
    .sort((a, b) => b.locations.length - a.locations.length);
  
  if (redundantCategories.length > 0) {
    recommendations.push({
      title: 'Consolidate redundant utility functions',
      type: 'redundancy',
      priority: 'high',
      description: `Found ${redundantCategories.length} categories of potentially redundant functionality`,
      details: redundantCategories.slice(0, 5).map(similarity => ({
        category: similarity.category,
        locations: similarity.locations
      }))
    });
  }
  
  // Recommend fixing circular dependencies
  if (registryReport.warnings.circularDependencies.length > 0) {
    recommendations.push({
      title: 'Fix circular dependencies between utilities',
      type: 'architecture',
      priority: 'high',
      description: `Found ${registryReport.warnings.circularDependencies.length} circular dependencies between utility functions`,
      details: registryReport.warnings.circularDependencies.slice(0, 5)
    });
  }
  
  // Recommend cleanup of unused utilities
  if (registryReport.warnings.unusedUtilities.length > 0) {
    recommendations.push({
      title: 'Clean up unused utility functions',
      type: 'cleanup',
      priority: 'medium',
      description: `Found ${registryReport.warnings.unusedUtilities.length} utilities that aren't being used`,
      details: registryReport.warnings.unusedUtilities.slice(0, 10)
    });
  }
  
  // Recommend updating deprecated utilities
  if (registryReport.warnings.deprecatedInUse.length > 0) {
    recommendations.push({
      title: 'Update deprecated utility functions',
      type: 'modernization',
      priority: 'medium',
      description: `Found ${registryReport.warnings.deprecatedInUse.length} deprecated utilities still in use`,
      details: registryReport.warnings.deprecatedInUse.slice(0, 10)
    });
  }
  
  // Recommend implementing decorator pattern for cross-cutting concerns
  const hasDecorators = fileAnalysis.some(file => 
    fs.readFileSync(file.path, 'utf8').includes('@')
  );
  
  if (!hasDecorators && fileAnalysis.length > 10) {
    recommendations.push({
      title: 'Implement decorator pattern for cross-cutting concerns',
      type: 'architecture',
      priority: 'medium',
      description: 'Using decorators can help separate core logic from cross-cutting concerns like validation, logging, and caching',
      details: {
        suggestion: 'Create utility decorators for common patterns like caching, validation, and error handling'
      }
    });
  }
  
  // Recommend organizing utilities by domain
  const allUtilityPaths = fileAnalysis.map(f => f.path);
  const hasDomainOrganization = allUtilityPaths.some(path => 
    path.includes('/auth/') || 
    path.includes('/user/') || 
    path.includes('/payment/')
  );
  
  if (!hasDomainOrganization && fileAnalysis.length > 15) {
    recommendations.push({
      title: 'Organize utilities by domain rather than technical function',
      type: 'architecture',
      priority: 'medium',
      description: 'Domain-oriented organization can improve maintainability as the system grows',
      details: {
        suggestion: 'Group utilities by business domain (e.g., auth, user, payment) rather than technical function'
      }
    });
  }
  
  // Recommend implementing a utility registry if not present
  const hasRegistry = registryReport.warnings !== undefined;
  
  if (!hasRegistry) {
    recommendations.push({
      title: 'Implement a utility registry for better discovery and management',
      type: 'architecture',
      priority: 'high',
      description: 'A utility registry can help track usage, dependencies, and provide runtime discovery',
      details: {
        suggestion: 'Create a utility registry system that tracks metadata like usage, deprecation status, and dependencies'
      }
    });
  }
  
  // Recommend introducing versioning for critical utilities
  const hasVersionedUtilities = fileAnalysis.some(file => 
    fs.readFileSync(file.path, 'utf8').includes('version:')
  );
  
  if (!hasVersionedUtilities && fileAnalysis.length > 5) {
    recommendations.push({
      title: 'Introduce versioning for critical utility functions',
      type: 'future-proofing',
      priority: 'medium',
      description: 'Versioning utilities enables smooth transitions when breaking changes are needed',
      details: {
        suggestion: 'Add version metadata to important utilities and implement version compatibility checks'
      }
    });
  }
  
  return recommendations;
}

/**
 * Create optimization plan for long-term maintainability
 */
function createOptimizationPlan(fileAnalysis, redundancyAnalysis, registryReport, hasDependencyGraph) {
  // Define optimization steps
  return {
    immediate: [
      {
        title: 'Fix circular dependencies',
        description: 'Resolve circular dependencies between utility functions',
        effort: 'medium',
        impact: 'high',
        applicable: registryReport.warnings.circularDependencies.length > 0
      },
      {
        title: 'Remove unused utilities',
        description: 'Clean up utilities that are not being used to reduce maintenance burden',
        effort: 'low',
        impact: 'medium',
        applicable: registryReport.warnings.unusedUtilities.length > 0
      },
      {
        title: 'Refactor most complex utilities',
        description: 'Break down complex utility functions into smaller, more manageable pieces',
        effort: 'high',
        impact: 'high',
        applicable: fileAnalysis.some(file => file.functions.some(f => f.isComplex))
      }
    ],
    shortTerm: [
      {
        title: 'Consolidate redundant utilities',
        description: 'Create unified implementations for similar functionality',
        effort: 'medium',
        impact: 'medium',
        applicable: redundancyAnalysis.similarities.length > 0
      },
      {
        title: 'Implement utility registry',
        description: 'Set up a utility registry for better discovery and management',
        effort: 'medium',
        impact: 'high',
        applicable: !hasDependencyGraph
      },
      {
        title: 'Add comprehensive documentation',
        description: 'Ensure all utilities have proper documentation and examples',
        effort: 'medium',
        impact: 'high',
        applicable: true
      }
    ],
    longTerm: [
      {
        title: 'Migrate to domain-oriented organization',
        description: 'Reorganize utilities based on business domains',
        effort: 'high',
        impact: 'medium',
        applicable: fileAnalysis.length > 15
      },
      {
        title: 'Implement versioning system',
        description: 'Add versioning to critical utilities to allow safe evolution',
        effort: 'high',
        impact: 'high',
        applicable: true
      },
      {
        title: 'Create utility composition system',
        description: 'Develop a system for composing utilities through a functional pipeline',
        effort: 'high',
        impact: 'medium',
        applicable: fileAnalysis.length > 10
      },
      {
        title: 'Build utility discovery mechanism',
        description: 'Create a searchable catalog of available utilities with examples',
        effort: 'medium',
        impact: 'medium',
        applicable: fileAnalysis.length > 15
      }
    ]
  };
}

// Run directly or export for use in other modules
if (require.main === module) {
  analyzeUtilityHealth()
    .then(() => {
      console.log('\n✅ Utility health analysis complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error running utility health analysis:', error);
      process.exit(1);
    });
} else {
  module.exports = {
    analyzeUtilityHealth
  };
}
