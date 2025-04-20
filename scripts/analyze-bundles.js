
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
/**
 * Bundle Analysis Tool
 * 
 * This script analyzes client-side bundle sizes, component loading times,
 * and identifies optimization opportunities for lazy loading.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants for threshold values
const CHUNK_SIZE_WARNING_THRESHOLD = 500 * 1024; // 500KB
const LOAD_TIME_WARNING_THRESHOLD = 300; // 300ms

/**
 * Run bundle analysis
 */
async function analyzeBundles() {
  console.log('🔍 Starting bundle analysis...');
  
  try {
    // Ensure we're in production build mode for accurate analysis
    console.log('📦 Building application in production mode...');
    execSync('NODE_ENV=production npm run build', { stdio: 'inherit' });
    
    // Paths to built assets
    const distDir = path.resolve(process.cwd(), 'dist');
    const clientDistDir = path.resolve(distDir, 'client');
    
    // Check if build directories exist
    if (!fs.existsSync(clientDistDir)) {
      console.error('❌ Build directory not found at:', clientDistDir);
      return {
        status: 'error',
        message: 'Build directory not found'
      };
    }
    
    // Read asset-manifest.json or stats.json if they exist
    let manifest = {};
    const manifestPath = path.resolve(clientDistDir, 'asset-manifest.json');
    const statsPath = path.resolve(clientDistDir, 'stats.json');
    
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      console.log('📋 Found asset manifest');
    } else if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      console.log('📋 Found stats file');
      manifest = stats;
    } else {
      console.log('⚠️ No manifest file found, analyzing directory structure');
    }
    
    // Analyze JS files in client dist directory
    const jsFiles = findFilesRecursively(clientDistDir, '.js');
    console.log(`🔎 Found ${jsFiles.length} JavaScript files`);
    
    // Process file information
    const fileAnalysis = jsFiles.map(filePath => {
      const stats = fs.statSync(filePath);
      const relPath = path.relative(distDir, filePath);
      const fileName = path.basename(filePath);
      const isChunk = fileName.includes('chunk');
      const isLazy = isChunk && (fileName.includes('lazy') || fileName.includes('async'));
      
      return {
        path: relPath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        isChunk,
        isLazy,
        isOverSizeThreshold: stats.size > CHUNK_SIZE_WARNING_THRESHOLD
      };
    });
    
    // Sort by size (largest first)
    fileAnalysis.sort((a, b) => b.size - a.size);
    
    // Generate optimization recommendations
    const recommendations = generateOptimizationRecommendations(fileAnalysis);
    
    // Analyze potential lazy-loaded components
    const componentFiles = findFilesRecursively(
      path.resolve(process.cwd(), 'client/src/components'), 
      '.tsx'
    );
    
    const lazyLoadCandidates = analyzeComponentsForLazyLoading(componentFiles);
    
    // Create final report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: fileAnalysis.length,
        totalSize: fileAnalysis.reduce((acc, file) => acc + file.size, 0),
        totalSizeFormatted: formatBytes(fileAnalysis.reduce((acc, file) => acc + file.size, 0)),
        largeChunks: fileAnalysis.filter(f => f.isOverSizeThreshold).length
      },
      largestFiles: fileAnalysis.slice(0, 10),
      recommendations,
      lazyLoadCandidates: lazyLoadCandidates.slice(0, 15) // Top 15 candidates
    };
    
    // Save report to file
    const reportDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.resolve(reportDir, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`   Total size: ${report.summary.totalSizeFormatted}`);
    console.log(`   Total files: ${report.summary.totalFiles}`);
    console.log(`   Large chunks: ${report.summary.largeChunks}`);
    console.log(`   Report saved to: ${reportPath}`);
    
    return report;
  } catch (error) {
    console.error('❌ Error during bundle analysis:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Find files recursively in a directory
 */
function findFilesRecursively(dir, extension) {
  let results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFilesRecursively(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }
  
  return results;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate optimization recommendations based on file analysis
 */
function generateOptimizationRecommendations(fileAnalysis) {
  const recommendations = [];
  
  // Check for large non-lazy chunks
  const largeNonLazyChunks = fileAnalysis.filter(
    file => file.isChunk && !file.isLazy && file.isOverSizeThreshold
  );
  
  if (largeNonLazyChunks.length > 0) {
    recommendations.push({
      type: 'chunk_size',
      severity: 'high',
      title: 'Large non-lazy chunks detected',
      description: `Found ${largeNonLazyChunks.length} large chunks that aren't lazy-loaded`,
      items: largeNonLazyChunks.map(chunk => ({
        path: chunk.path,
        size: chunk.sizeFormatted
      })),
      recommendation: 'Consider splitting these chunks or implementing lazy loading'
    });
  }
  
  // Check main bundle size
  const mainBundle = fileAnalysis.find(file => 
    !file.isChunk && file.path.includes('main') && file.path.includes('client')
  );
  
  if (mainBundle && mainBundle.size > CHUNK_SIZE_WARNING_THRESHOLD * 1.5) {
    recommendations.push({
      type: 'main_bundle',
      severity: 'high',
      title: 'Main bundle is too large',
      description: `Main bundle size is ${mainBundle.sizeFormatted}`,
      items: [{ path: mainBundle.path, size: mainBundle.sizeFormatted }],
      recommendation: 'Move non-critical components to lazy-loaded chunks'
    });
  }
  
  // Check number of chunks
  if (fileAnalysis.filter(file => file.isChunk).length > 30) {
    recommendations.push({
      type: 'chunk_count',
      severity: 'medium',
      title: 'Too many chunks',
      description: 'High number of chunks may cause HTTP request overhead',
      recommendation: 'Consider consolidating related features into fewer, more logical chunks'
    });
  }
  
  // Check overall size
  const totalSize = fileAnalysis.reduce((acc, file) => acc + file.size, 0);
  if (totalSize > 3 * 1024 * 1024) { // 3MB
    recommendations.push({
      type: 'total_size',
      severity: 'medium',
      title: 'Total bundle size is large',
      description: `Total size of all JavaScript files is ${formatBytes(totalSize)}`,
      recommendation: 'Audit dependencies and implement code splitting'
    });
  }
  
  return recommendations;
}

/**
 * Analyze components for lazy loading candidates
 */
function analyzeComponentsForLazyLoading(componentFiles) {
  const candidates = [];
  
  for (const filePath of componentFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Extract component name from file
      const componentName = fileName.replace(/\.[jt]sx?$/, '');
      
      // Check if component is already lazy loaded
      const isAlreadyLazy = content.includes('React.lazy') || content.includes('lazy(');
      
      // Check import statements for heavy dependencies
      const importStatements = content.match(/import .* from ['"](.*)['"]/g) || [];
      const dependencyCount = importStatements.length;
      
      // Check for specific indicators that suggest this component is a good lazy-loading candidate
      const isDashboardComponent = /dashboard|analytics|chart|graph|table/i.test(fileName);
      const isModalOrDialog = /modal|dialog|drawer|panel/i.test(fileName);
      const isFormComponent = /form|input|validation/i.test(fileName);
      const hasConditionalRendering = content.includes('? <') || content.includes('hidden={');
      
      // Score the component as a lazy loading candidate (higher = better candidate)
      let score = 0;
      
      // Already lazy components get a negative score (lower priority)
      if (isAlreadyLazy) score -= 10;
      
      // Component types that are good candidates
      if (isDashboardComponent) score += 5;
      if (isModalOrDialog) score += 8;
      if (isFormComponent) score += 3;
      
      // Rendering patterns that suggest good candidates
      if (hasConditionalRendering) score += 4;
      
      // Size and complexity indicators
      score += Math.min(10, Math.floor(content.length / 1000)); // 1 point per 1KB up to 10 points
      score += Math.min(5, dependencyCount / 2); // 0.5 points per dependency up to 5 points
      
      // Add to candidates list if it has a positive score
      if (score > 0) {
        candidates.push({
          componentName,
          filePath: relativePath,
          score,
          isAlreadyLazy,
          size: content.length,
          sizeFormatted: formatBytes(content.length),
          lazyLoadReason: [
            isDashboardComponent ? 'Dashboard component' : null,
            isModalOrDialog ? 'Modal/dialog component' : null,
            isFormComponent ? 'Form component' : null,
            hasConditionalRendering ? 'Has conditional rendering' : null,
            content.length > 5000 ? 'Large file size' : null,
            dependencyCount > 5 ? 'Many dependencies' : null
          ].filter(Boolean)
        });
      }
    } catch (error) {
      console.warn(`⚠️ Error analyzing component ${filePath}:`, error.message);
    }
  }
  
  // Sort by score (highest first)
  return candidates.sort((a, b) => b.score - a.score);
}

// Run directly or export for use in other modules
if (require.main === module) {
  analyzeBundles()
    .then(() => {
      console.log('\n✅ Bundle analysis complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error running bundle analysis:', error);
      process.exit(1);
    });
} else {
  module.exports = {
    analyzeBundles
  };
}
