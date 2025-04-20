
/**
 * Client-Side Debugging Tool
 * 
 * This script provides enhanced debugging capabilities for client-side applications,
 * including component rendering performance analysis, lazy loading diagnostics,
 * and front-end optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration constants
const MIN_RENDER_TIME_MS = 16; // ~60fps threshold
const COMPONENT_DIRS = [
  './client/src/components',
  './client/src/pages'
];

// Generate performance debugging JavaScript to inject
const PERFORMANCE_DEBUG_SCRIPT = `
// Component Performance Monitoring
if (!window.__PERFORMANCE_MONITOR) {
  console.log('[Performance Monitor] Initializing component performance tracking');
  
  window.__PERFORMANCE_MONITOR = {
    renders: {},
    slowComponents: {},
    lazyLoadTiming: {},
    resourceTiming: {}
  };
  
  // Override React's development mode measurement functions
  if (typeof React !== 'undefined' && typeof React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED !== 'undefined') {
    const ReactDOM = window.ReactDOM || {};
    const OriginalFunctions = {
      render: ReactDOM.render,
      hydrate: ReactDOM.hydrate
    };
    
    // Monkey patch React's render methods to measure performance
    if (ReactDOM.render) {
      ReactDOM.render = function() {
        console.log('[Performance Monitor] Measuring initial render');
        const start = performance.now();
        const result = OriginalFunctions.render.apply(this, arguments);
        const duration = performance.now() - start;
        console.log('[Performance Monitor] Initial render took ' + duration.toFixed(2) + 'ms');
        return result;
      };
    }
    
    // Track component render times using the profiler if available
    if (typeof React.Profiler !== 'undefined') {
      window.__ORIGINAL_CREATEELEMENT = React.createElement;
      
      React.createElement = function(type, props, ...children) {
        if (typeof type === 'function' && type.name) {
          const wrappedProps = { ...props };
          
          // Only instrument component functions, not DOM elements
          return React.createElement(
            React.Profiler,
            {
              id: type.name,
              onRender: (id, phase, actualDuration) => {
                if (!window.__PERFORMANCE_MONITOR.renders[id]) {
                  window.__PERFORMANCE_MONITOR.renders[id] = [];
                }
                
                window.__PERFORMANCE_MONITOR.renders[id].push({
                  duration: actualDuration,
                  timestamp: Date.now()
                });
                
                // Track slow components
                if (actualDuration > ${MIN_RENDER_TIME_MS}) {
                  if (!window.__PERFORMANCE_MONITOR.slowComponents[id]) {
                    window.__PERFORMANCE_MONITOR.slowComponents[id] = {
                      count: 0,
                      totalDuration: 0,
                      maxDuration: 0
                    };
                  }
                  
                  window.__PERFORMANCE_MONITOR.slowComponents[id].count++;
                  window.__PERFORMANCE_MONITOR.slowComponents[id].totalDuration += actualDuration;
                  
                  if (actualDuration > window.__PERFORMANCE_MONITOR.slowComponents[id].maxDuration) {
                    window.__PERFORMANCE_MONITOR.slowComponents[id].maxDuration = actualDuration;
                  }
                  
                  console.warn(
                    \`[Performance Monitor] Slow render detected: \${id} took \${actualDuration.toFixed(2)}ms\`
                  );
                }
              }
            },
            React.__ORIGINAL_CREATEELEMENT(type, wrappedProps, ...children)
          );
        }
        
        return window.__ORIGINAL_CREATEELEMENT.apply(null, [type, props, ...children]);
      };
    }
  
    // Monitor lazy loading performance
    const originalLazy = React.lazy;
    if (originalLazy) {
      React.lazy = function(loader) {
        const componentPromise = loader();
        const componentName = loader.name || 'UnnamedLazyComponent';
        
        const wrappedPromise = componentPromise.then(result => {
          const startTime = window.__PERFORMANCE_MONITOR.lazyLoadTiming[componentName]?.startTime || 0;
          if (startTime) {
            const loadTime = performance.now() - startTime;
            
            window.__PERFORMANCE_MONITOR.lazyLoadTiming[componentName] = {
              ...window.__PERFORMANCE_MONITOR.lazyLoadTiming[componentName],
              endTime: performance.now(),
              loadTime,
              loaded: true
            };
            
            console.log(
              \`[Performance Monitor] Lazy component loaded: \${componentName} in \${loadTime.toFixed(2)}ms\`
            );
          }
          
          return result;
        });
        
        window.__PERFORMANCE_MONITOR.lazyLoadTiming[componentName] = {
          startTime: performance.now(),
          loaded: false
        };
        
        return originalLazy(() => wrappedPromise);
      };
    }
  }
  
  // Resource timing measurement
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function(...args) {
      const url = args[0]?.url || args[0];
      const startTime = performance.now();
      
      return originalFetch.apply(this, args)
        .then(response => {
          const duration = performance.now() - startTime;
          
          if (!window.__PERFORMANCE_MONITOR.resourceTiming[url]) {
            window.__PERFORMANCE_MONITOR.resourceTiming[url] = [];
          }
          
          window.__PERFORMANCE_MONITOR.resourceTiming[url].push({
            duration,
            timestamp: Date.now(),
            status: response.status
          });
          
          if (duration > 500) {
            console.warn(\`[Performance Monitor] Slow fetch: \${url} took \${duration.toFixed(2)}ms\`);
          }
          
          return response;
        })
        .catch(error => {
          const duration = performance.now() - startTime;
          
          if (!window.__PERFORMANCE_MONITOR.resourceTiming[url]) {
            window.__PERFORMANCE_MONITOR.resourceTiming[url] = [];
          }
          
          window.__PERFORMANCE_MONITOR.resourceTiming[url].push({
            duration,
            timestamp: Date.now(),
            error: error.message
          });
          
          throw error;
        });
    };
  }
  
  // Image loading performance
  const imageLoadTimes = {};
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        imageLoadTimes[src] = performance.now();
        
        img.addEventListener('load', () => {
          const startTime = imageLoadTimes[src];
          if (startTime) {
            const loadTime = performance.now() - startTime;
            
            if (!window.__PERFORMANCE_MONITOR.resourceTiming[src]) {
              window.__PERFORMANCE_MONITOR.resourceTiming[src] = [];
            }
            
            window.__PERFORMANCE_MONITOR.resourceTiming[src].push({
              duration: loadTime,
              timestamp: Date.now(),
              type: 'img'
            });
            
            if (loadTime > 1000) {
              console.warn(\`[Performance Monitor] Slow image load: \${src} took \${loadTime.toFixed(2)}ms\`);
            }
          }
        });
      }
    });
  });
  
  // Add performance report command to console
  window.getPerformanceReport = function() {
    console.log('=== Performance Report ===');
    
    // Slow components report
    const slowComponentsArray = Object.entries(window.__PERFORMANCE_MONITOR.slowComponents)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgDuration: data.totalDuration / data.count,
        maxDuration: data.maxDuration
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);
    
    console.log('Top 10 Slowest Components:');
    console.table(slowComponentsArray.slice(0, 10));
    
    // Lazy loaded components report
    const lazyComponentsArray = Object.entries(window.__PERFORMANCE_MONITOR.lazyLoadTiming)
      .map(([name, data]) => ({
        name,
        loadTime: data.loadTime || 'Not loaded yet',
        loaded: data.loaded ? 'Yes' : 'No'
      }))
      .sort((a, b) => {
        const aTime = typeof a.loadTime === 'number' ? a.loadTime : Infinity;
        const bTime = typeof b.loadTime === 'number' ? b.loadTime : Infinity;
        return bTime - aTime;
      });
    
    console.log('Lazy Loaded Components:');
    console.table(lazyComponentsArray);
    
    // Slow resource requests
    const slowResourcesArray = Object.entries(window.__PERFORMANCE_MONITOR.resourceTiming)
      .flatMap(([url, timings]) => 
        timings.map(timing => ({
          url: url.length > 50 ? url.substring(0, 47) + '...' : url,
          duration: timing.duration,
          status: timing.status || 'N/A',
          type: timing.type || 'fetch'
        }))
      )
      .filter(resource => resource.duration > 300)
      .sort((a, b) => b.duration - a.duration);
    
    console.log('Slow Resource Requests (>300ms):');
    console.table(slowResourcesArray.slice(0, 15));
    
    // Calculate total render time across components
    const totalRenderTime = Object.values(window.__PERFORMANCE_MONITOR.slowComponents)
      .reduce((sum, component) => sum + component.totalDuration, 0);
    
    console.log(\`Total slow render time: \${totalRenderTime.toFixed(2)}ms\`);
    
    // Return the full data for potential export
    return {
      slowComponents: slowComponentsArray,
      lazyComponents: lazyComponentsArray,
      slowResources: slowResourcesArray,
      totalRenderTime
    };
  };
  
  console.log('[Performance Monitor] Performance monitoring enabled. Use window.getPerformanceReport() to see results');
}
`;

/**
 * Generate instrumentation script to inject into HTML files
 */
function generateInstrumentationScript() {
  return `
<script>
${PERFORMANCE_DEBUG_SCRIPT}
</script>
  `.trim();
}

/**
 * Find React components that might benefit from optimization
 */
function findOptimizationCandidates() {
  const candidates = [];
  
  // Find all React component files
  for (const componentDir of COMPONENT_DIRS) {
    if (!fs.existsSync(componentDir)) {
      continue;
    }
    
    const findComponentsCommand = `find "${componentDir}" -type f -name "*.tsx" -o -name "*.jsx"`;
    const componentFiles = execSync(findComponentsCommand, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    // Analyze each component file
    for (const filePath of componentFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const componentName = path.basename(filePath).replace(/\.[jt]sx$/, '');
        
        // Look for optimization opportunities
        const hasUseEffect = content.includes('useEffect(');
        const hasUseState = content.includes('useState(');
        const hasComplexJSX = (content.match(/<[A-Z][^>]*>/g) || []).length > 10;
        const hasNestedLoops = content.includes('.map(') && 
          (content.includes('.filter(') || content.includes('.forEach(') || 
           content.includes('.map(') && content.lastIndexOf('.map(') !== content.indexOf('.map('));
        const hasManyProps = (content.match(/props\./g) || []).length > 10;
        const hasInlineStyles = content.includes('style={');
        const hasInlineEventHandlers = content.includes('onClick={') || content.includes('onChange={');
        
        // Check for React.memo usage
        const usesMemo = content.includes('React.memo') || content.includes('memo(');
        
        // Check for useMemo/useCallback usage
        const hasUseMemo = content.includes('useMemo(');
        const hasUseCallback = content.includes('useCallback(');
        
        // Scoring system for optimization candidates
        let score = 0;
        const optimizationReasons = [];
        
        if (hasComplexJSX) {
          score += 3;
          optimizationReasons.push('Complex JSX structure');
        }
        
        if (hasNestedLoops) {
          score += 5;
          optimizationReasons.push('Nested array operations');
        }
        
        if (hasManyProps) {
          score += 2;
          optimizationReasons.push('Many prop accesses');
        }
        
        if (hasUseEffect && hasUseState) {
          score += 2;
          optimizationReasons.push('Stateful with side effects');
        }
        
        if (hasInlineStyles) {
          score += 1;
          optimizationReasons.push('Inline styles');
        }
        
        if (hasInlineEventHandlers && !hasUseCallback) {
          score += 2;
          optimizationReasons.push('Non-memoized event handlers');
        }
        
        // Reduce score if already optimized
        if (usesMemo) {
          score -= 3;
        }
        
        if (hasUseMemo && hasUseCallback) {
          score -= 2;
        }
        
        // Only include high-scoring candidates
        if (score >= 3) {
          candidates.push({
            componentName,
            filePath,
            score,
            optimizationReasons,
            isAlreadyMemoized: usesMemo,
            usesPerformanceHooks: hasUseMemo || hasUseCallback
          });
        }
      } catch (error) {
        console.error(`Error analyzing component ${filePath}:`, error);
      }
    }
  }
  
  // Sort by score (highest first)
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Inject performance monitoring into HTML files
 */
function injectPerformanceMonitoring() {
  const htmlFiles = [
    './client/index.html',
    './public/index.html',
    './dist/client/index.html'
  ].filter(fs.existsSync);
  
  if (htmlFiles.length === 0) {
    console.warn('⚠️ No HTML files found for instrumentation');
    return [];
  }
  
  const injectedFiles = [];
  const instrumentationScript = generateInstrumentationScript();
  
  for (const htmlFile of htmlFiles) {
    try {
      // Create backup
      const backupFile = `${htmlFile}.bak`;
      fs.copyFileSync(htmlFile, backupFile);
      
      // Read file
      let content = fs.readFileSync(htmlFile, 'utf8');
      
      // Check if already instrumented
      if (content.includes('[Performance Monitor]')) {
        console.log(`📝 File already instrumented: ${htmlFile}`);
        continue;
      }
      
      // Inject before closing head tag
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${instrumentationScript}\n</head>`);
      } else {
        // Inject before closing body if no head
        content = content.replace('</body>', `${instrumentationScript}\n</body>`);
      }
      
      // Write updated content
      fs.writeFileSync(htmlFile, content, 'utf8');
      
      console.log(`📝 Instrumented file: ${htmlFile}`);
      injectedFiles.push(htmlFile);
    } catch (error) {
      console.error(`Error instrumenting ${htmlFile}:`, error);
    }
  }
  
  return injectedFiles;
}

/**
 * Run client debugging setup
 */
function setupClientDebugging() {
  console.log('🔍 Setting up client-side performance debugging...');
  
  try {
    // Find components to optimize
    console.log('🔎 Analyzing components for optimization opportunities...');
    const optimizationCandidates = findOptimizationCandidates();
    
    // Inject performance monitoring
    console.log('📊 Injecting performance monitoring...');
    const injectedFiles = injectPerformanceMonitoring();
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      optimizationCandidates: optimizationCandidates.slice(0, 15), // Top 15 candidates
      instrumentedFiles: injectedFiles,
      instructions: [
        'Load the application in your browser',
        'Use it normally to gather performance data',
        'Open browser console and run window.getPerformanceReport() to see results',
        'Examine "Top 10 Slowest Components" to identify optimization targets'
      ]
    };
    
    // Save report
    const reportDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.resolve(reportDir, 'client-optimization.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display results
    console.log('\n📊 Client Debugging Setup Complete');
    console.log('\nOptimization Candidates:');
    
    optimizationCandidates.slice(0, 5).forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.componentName} (Score: ${candidate.score})`);
      console.log(`   - Reasons: ${candidate.optimizationReasons.join(', ')}`);
      console.log(`   - Path: ${candidate.filePath}`);
    });
    
    if (injectedFiles.length > 0) {
      console.log('\nPerformance monitoring injected into:');
      injectedFiles.forEach(file => console.log(`- ${file}`));
      
      console.log('\n📝 Instructions:');
      console.log('1. Load the application in your browser');
      console.log('2. Use it normally to gather performance data');
      console.log('3. Open browser console and run window.getPerformanceReport() to see results');
    } else {
      console.log('\n⚠️ No files were instrumented for performance monitoring');
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    return report;
  } catch (error) {
    console.error('❌ Error setting up client debugging:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

// Run directly or export for use in other modules
if (require.main === module) {
  setupClientDebugging()
    .then(() => {
      console.log('\n✅ Client debugging setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error running client debugging setup:', error);
      process.exit(1);
    });
} else {
  module.exports = {
    setupClientDebugging,
    findOptimizationCandidates,
    injectPerformanceMonitoring
  };
}
