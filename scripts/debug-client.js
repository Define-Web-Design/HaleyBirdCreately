
/**
 * Client Debugging Utility
 * 
 * This script injects debugging code into the client build
 * to help identify frontend issues.
 */

const fs = require('fs');
const path = require('path');

// Path to the main client index file
const indexPath = path.join(__dirname, '../client/src/index.tsx');
const debugIndexPath = path.join(__dirname, '../client/src/index.debug.tsx');

console.log('Setting up client debugging...');

// Check if the file exists
if (!fs.existsSync(indexPath)) {
  console.error(`Error: ${indexPath} not found`);
  process.exit(1);
}

// Read the original file
const content = fs.readFileSync(indexPath, 'utf8');

// Create debug version with extra logging
const debugContent = `// Debug version - automatically generated
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Setup global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error caught:', { message, source, lineno, colno, error });
  
  // Log to server if in production
  if (process.env.NODE_ENV === 'production') {
    try {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: message,
          source,
          lineno,
          colno,
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(e => console.error('Failed to report error:', e));
    } catch (e) {
      console.error('Failed to send error to server:', e);
    }
  }
  
  return false; // Let the default handler run
};

// Setup promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

// Enable React strict mode for additional checks
const StrictApp = () => (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add performance monitoring
const reportWebVitals = ({ name, delta, id, entries }) => {
  console.log('Web Vitals:', { name, delta, id });
  
  // Send to server
  try {
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value: delta, id })
    }).catch(e => console.error('Failed to report web vital:', e));
  } catch (e) {
    console.error('Failed to send web vital to server:', e);
  }
};

// Debug component rendering
class DebugObserver extends React.Component {
  componentDidMount() {
    console.log('App mounted');
  }
  
  componentDidUpdate() {
    console.log('App updated');
  }
  
  render() {
    return this.props.children;
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <DebugObserver>
    <StrictApp />
  </DebugObserver>
);

// Import web-vitals
import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);
});

console.log('Debug mode enabled - React v' + React.version);
`;

// Write the debug version
fs.writeFileSync(debugIndexPath, debugContent);

console.log(`Debug client version created at ${debugIndexPath}`);
console.log('To use the debug version:');
console.log('1. Rename index.tsx to index.original.tsx');
console.log('2. Rename index.debug.tsx to index.tsx');
console.log('3. Restart your development server');
console.log('4. Check the console for detailed logging');
/**
 * Client Debug Utility
 * 
 * This script provides component-level performance debugging and analysis
 * for React components.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Define paths to scan for components
const COMPONENT_PATHS = [
  path.resolve(__dirname, '../client/src/components')
];

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  renderTime: 16, // milliseconds (target 60fps)
  loadTime: 300,  // milliseconds
  bundleSize: 50  // KB
};

// Component tracking data
const componentStats = new Map();

/**
 * Scan codebase for React components
 */
function scanForComponents() {
  const components = [];
  
  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        entry.isFile() && 
        (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))
      ) {
        // Skip test files and type definitions
        if (entry.name.includes('.test.') || entry.name.includes('.spec.') || entry.name.includes('.d.ts')) {
          continue;
        }
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const componentName = extractComponentName(content, entry.name);
          
          if (componentName) {
            components.push({
              name: componentName,
              path: fullPath,
              relativePath: path.relative(process.cwd(), fullPath)
            });
          }
        } catch (error) {
          console.warn(`Error reading file ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  // Scan all component directories
  for (const componentPath of COMPONENT_PATHS) {
    scanDir(componentPath);
  }
  
  return components;
}

/**
 * Extract component name from file content
 */
function extractComponentName(content, fileName) {
  // Try to extract component name from various patterns
  
  // Pattern: export default function ComponentName() 
  const functionMatch = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
  if (functionMatch) return functionMatch[1];
  
  // Pattern: const ComponentName = () => 
  const constMatch = content.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>/);
  if (constMatch) return constMatch[1];
  
  // Pattern: class ComponentName extends React.Component
  const classMatch = content.match(/class\s+([A-Za-z0-9_]+)\s+extends\s+React\.Component/);
  if (classMatch) return classMatch[1];
  
  // Fallback: use file name without extension
  return path.basename(fileName, path.extname(fileName));
}

/**
 * Analyze component code for potential issues
 */
function analyzeComponentCode(componentInfo) {
  const content = fs.readFileSync(componentInfo.path, 'utf8');
  const issues = [];
  
  // Check for potentially inefficient patterns
  if (content.includes('useState(') && !content.includes('useCallback(') && 
      content.includes('=>') && content.includes('set')) {
    issues.push('Missing useCallback for handler with state updates');
  }
  
  if (content.includes('useEffect(') && !content.match(/useEffect\([^,]+,\s*\[[^\]]*\]\)/)) {
    issues.push('useEffect without dependency array');
  }
  
  if ((content.match(/new /g) || []).length > 3) {
    issues.push('Multiple object instantiations in render');
  }
  
  if (content.includes('map(') && !content.includes('key=')) {
    issues.push('Array mapping without key prop');
  }
  
  return issues;
}

/**
 * Check if a component is lazy loaded
 */
function isLazyLoaded(componentInfo) {
  // Look for imports of this component in client code
  const clientSrcPath = path.resolve(__dirname, '../client/src');
  const componentName = componentInfo.name;
  let isLazy = false;
  
  function scanForLazyImport(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanForLazyImport(path.join(dirPath, entry.name));
      } else if (entry.isFile() && 
                (entry.name.endsWith('.tsx') || 
                 entry.name.endsWith('.jsx') ||
                 entry.name.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(path.join(dirPath, entry.name), 'utf8');
          
          // Look for React.lazy or lazy imports
          if (content.includes(`lazy(`) && content.includes(componentName)) {
            isLazy = true;
            return;
          }
        } catch (error) {
          // Skip file read errors
        }
      }
    }
  }
  
  scanForLazyImport(clientSrcPath);
  return isLazy;
}

/**
 * Generate optimization suggestions for a component
 */
function generateOptimizationSuggestions(componentInfo, issues) {
  const suggestions = [];
  
  // Check if component is lazy loaded
  const isLazy = isLazyLoaded(componentInfo);
  if (!isLazy && path.basename(path.dirname(componentInfo.path)) !== 'common') {
    suggestions.push('Consider lazy loading this component');
  }
  
  // Add suggestions based on detected issues
  for (const issue of issues) {
    switch (issue) {
      case 'Missing useCallback for handler with state updates':
        suggestions.push('Use useCallback for event handlers that update state');
        break;
      case 'useEffect without dependency array':
        suggestions.push('Add dependency array to useEffect to prevent unnecessary rerenders');
        break;
      case 'Multiple object instantiations in render':
        suggestions.push('Move object instantiations outside the component or memoize them');
        break;
      case 'Array mapping without key prop':
        suggestions.push('Add unique key prop to items in mapped arrays');
        break;
    }
  }
  
  // Check file size and suggest code splitting
  try {
    const stats = fs.statSync(componentInfo.path);
    const sizeKB = stats.size / 1024;
    
    if (sizeKB > PERFORMANCE_THRESHOLDS.bundleSize) {
      suggestions.push(`Large component (${sizeKB.toFixed(1)}KB). Consider splitting functionality`);
    }
  } catch (error) {
    // Skip file stat errors
  }
  
  return suggestions;
}

/**
 * Run the component debugger
 */
function debugClient() {
  console.log('Starting client component debugger...');
  
  // Scan for components
  const components = scanForComponents();
  console.log(`Found ${components.length} components`);
  
  // Analyze each component
  const results = [];
  
  for (const component of components) {
    try {
      const issues = analyzeComponentCode(component);
      const suggestions = generateOptimizationSuggestions(component, issues);
      const renderPerfData = componentStats.get(component.name);
      
      results.push({
        name: component.name,
        path: component.relativePath,
        issues: issues.length > 0 ? issues : null,
        suggestions: suggestions.length > 0 ? suggestions : null,
        isLazy: isLazyLoaded(component),
        performanceData: renderPerfData || null
      });
    } catch (error) {
      console.error(`Error analyzing component ${component.name}:`, error);
    }
  }
  
  // Sort results by name
  results.sort((a, b) => a.name.localeCompare(b.name));
  
  // Output results
  console.log('\nComponent Analysis Results:');
  console.log('==========================\n');
  
  for (const result of results) {
    console.log(`Component: ${result.name}`);
    console.log(`Path: ${result.path}`);
    console.log(`Lazy Loaded: ${result.isLazy ? 'Yes' : 'No'}`);
    
    if (result.issues) {
      console.log('Issues:');
      for (const issue of result.issues) {
        console.log(`  - ${issue}`);
      }
    }
    
    if (result.suggestions) {
      console.log('Optimization Suggestions:');
      for (const suggestion of result.suggestions) {
        console.log(`  - ${suggestion}`);
      }
    }
    
    if (result.performanceData) {
      console.log('Performance:');
      console.log(`  Avg Render Time: ${result.performanceData.avgRenderTime.toFixed(2)}ms`);
      console.log(`  Max Render Time: ${result.performanceData.maxRenderTime.toFixed(2)}ms`);
      console.log(`  Render Count: ${result.performanceData.renderCount}`);
    }
    
    console.log('');
  }
  
  console.log('Summary:');
  console.log(`Total components: ${results.length}`);
  console.log(`Components with issues: ${results.filter(r => r.issues).length}`);
  console.log(`Lazy loaded components: ${results.filter(r => r.isLazy).length}`);
  
  return {
    timestamp: new Date().toISOString(),
    componentCount: results.length,
    componentsWithIssues: results.filter(r => r.issues).length,
    lazyLoadedComponents: results.filter(r => r.isLazy).length,
    results
  };
}

// Run the debugger if called directly
if (require.main === module) {
  const results = debugClient();
  
  // Save results to file
  const outputPath = path.resolve(__dirname, '../logs/component-analysis.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`Results saved to ${outputPath}`);
}

module.exports = { debugClient };
