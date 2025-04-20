
/**
 * Component Bundle Size Analyzer
 * 
 * This utility analyzes bundle sizes and module dependencies to help
 * optimize component loading strategies.
 */

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Configuration
const OUTPUT_DIR = path.resolve(__dirname, '../logs/bundle-analysis');
const BUNDLE_SIZE_THRESHOLD = 50 * 1024; // 50KB
const ALLOWED_EXTERNAL_DEPS = [
  'react', 'react-dom', 'react-router-dom', 'tailwindcss'
];

/**
 * Run bundle analysis
 */
async function analyzeBundles() {
  console.log('Starting bundle analysis...');
  
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  try {
    // Extract component imports
    const componentDependencies = extractComponentDependencies();
    
    // Generate dependency graph
    const dependencyGraph = buildDependencyGraph(componentDependencies);
    
    // Identify potential code splitting points
    const splittingPoints = identifyCodeSplittingPoints(dependencyGraph);
    
    // Generate recommendations
    const recommendations = generateRecommendations(dependencyGraph, splittingPoints);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      componentCount: Object.keys(dependencyGraph).length,
      splittingPointsCount: splittingPoints.length,
      dependencyGraph,
      splittingPoints,
      recommendations
    };
    
    // Save report
    const reportPath = path.join(OUTPUT_DIR, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Bundle analysis complete. Report saved to ${reportPath}`);
    return report;
  } catch (error) {
    console.error('Error analyzing bundles:', error);
    throw error;
  }
}

/**
 * Extract component dependencies by analyzing imports
 */
function extractComponentDependencies() {
  const componentDir = path.resolve(__dirname, '../client/src/components');
  const components = {};
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (
        entry.isFile() && 
        (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))
      ) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const componentName = entry.name.replace(/\.(tsx|jsx)$/, '');
          const imports = extractImports(content);
          
          components[componentName] = {
            path: fullPath,
            imports: imports
          };
        } catch (error) {
          console.warn(`Error reading file ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory(componentDir);
  return components;
}

/**
 * Extract imports from component file
 */
function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+([A-Za-z0-9_]+)|([A-Za-z0-9_]+))\s+from\s+['"]([@A-Za-z0-9_\-/.]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1] ? match[1].split(',').map(s => s.trim()) : [];
    const namespaceImport = match[2] || null;
    const defaultImport = match[3] || null;
    const source = match[4];
    
    imports.push({
      source,
      namedImports,
      namespaceImport,
      defaultImport
    });
  }
  
  return imports;
}

/**
 * Build component dependency graph
 */
function buildDependencyGraph(componentDependencies) {
  const graph = {};
  
  for (const [componentName, data] of Object.entries(componentDependencies)) {
    graph[componentName] = {
      path: data.path,
      dependencies: [],
      externalDependencies: []
    };
    
    for (const importData of data.imports) {
      const source = importData.source;
      
      // Check if import is for another component
      const isLocalComponent = !source.startsWith('@') && 
                               !source.startsWith('./') && 
                               !source.startsWith('../') &&
                               !source.includes('/');
      
      if (isLocalComponent && componentDependencies[source]) {
        graph[componentName].dependencies.push(source);
      } else {
        graph[componentName].externalDependencies.push(source);
      }
    }
  }
  
  return graph;
}

/**
 * Identify potential code splitting points
 */
function identifyCodeSplittingPoints(dependencyGraph) {
  const splittingPoints = [];
  
  for (const [componentName, data] of Object.entries(dependencyGraph)) {
    // Check if component has many dependencies
    if (data.dependencies.length > 3) {
      splittingPoints.push({
        component: componentName,
        reason: 'Many dependencies',
        dependencies: data.dependencies
      });
    }
    
    // Check if component has many external dependencies
    const nonStandardExternalDeps = data.externalDependencies.filter(
      dep => !ALLOWED_EXTERNAL_DEPS.some(allowed => dep.includes(allowed))
    );
    
    if (nonStandardExternalDeps.length > 2) {
      splittingPoints.push({
        component: componentName,
        reason: 'Many external dependencies',
        externalDependencies: nonStandardExternalDeps
      });
    }
    
    // Check file size if possible
    try {
      const stats = fs.statSync(data.path);
      if (stats.size > BUNDLE_SIZE_THRESHOLD) {
        splittingPoints.push({
          component: componentName,
          reason: 'Large file size',
          size: stats.size
        });
      }
    } catch (error) {
      // Skip file stat errors
    }
  }
  
  return splittingPoints;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(dependencyGraph, splittingPoints) {
  const recommendations = [];
  
  // Process splitting points
  for (const point of splittingPoints) {
    const componentName = point.component;
    
    switch (point.reason) {
      case 'Many dependencies':
        recommendations.push({
          component: componentName,
          action: 'Split into smaller components',
          details: `Component has ${point.dependencies.length} dependencies: ${point.dependencies.join(', ')}`
        });
        break;
        
      case 'Many external dependencies':
        recommendations.push({
          component: componentName,
          action: 'Lazy load with React.lazy',
          details: `Component has ${point.externalDependencies.length} non-standard external dependencies`
        });
        break;
        
      case 'Large file size':
        recommendations.push({
          component: componentName,
          action: 'Lazy load and consider splitting',
          details: `Component is large (${Math.round(point.size / 1024)}KB)`
        });
        break;
    }
  }
  
  // Find commonly used components that should be pre-loaded
  const dependencyCounts = {};
  for (const data of Object.values(dependencyGraph)) {
    for (const dep of data.dependencies) {
      dependencyCounts[dep] = (dependencyCounts[dep] || 0) + 1;
    }
  }
  
  for (const [component, count] of Object.entries(dependencyCounts)) {
    if (count > 3) {
      recommendations.push({
        component,
        action: 'Preload in main bundle',
        details: `Component is used by ${count} other components`
      });
    }
  }
  
  return recommendations;
}

// Run if called directly
if (require.main === module) {
  analyzeBundles().catch(err => {
    console.error('Analysis failed:', err);
    process.exit(1);
  });
}

module.exports = { analyzeBundles };
