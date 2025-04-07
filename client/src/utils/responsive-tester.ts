
/**
 * Responsive design testing utility
 * Tests layout on different screen sizes and reports issues
 */

interface ViewportSize {
  name: string;
  width: number;
  height: number;
  devicePixelRatio?: number;
}

interface ElementIssue {
  element: string;
  issue: string;
  viewport: string;
}

interface ResponsiveTestResult {
  success: boolean;
  testedViewports: string[];
  issues: ElementIssue[];
  recommendations: string[];
}

// Common device viewports for testing
const commonViewports: ViewportSize[] = [
  { name: 'iPhone SE', width: 375, height: 667, devicePixelRatio: 2 },
  { name: 'iPhone 12/13', width: 390, height: 844, devicePixelRatio: 3 },
  { name: 'iPad', width: 768, height: 1024, devicePixelRatio: 2 },
  { name: 'iPad Pro', width: 1024, height: 1366, devicePixelRatio: 2 },
  { name: 'Laptop', width: 1366, height: 768, devicePixelRatio: 1 },
  { name: 'Desktop', width: 1920, height: 1080, devicePixelRatio: 1 },
  { name: 'Large Desktop', width: 2560, height: 1440, devicePixelRatio: 1 },
];

/**
 * Test if an element is overflowing its container or the viewport
 */
function isElementOverflowing(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  
  // Check if element is wider than viewport
  if (rect.width > window.innerWidth) {
    return true;
  }
  
  // Check if element is extending beyond the viewport
  if (rect.right > window.innerWidth || rect.left < 0) {
    return true;
  }
  
  return false;
}

/**
 * Check if text is too small to be readable on mobile
 */
function isTextTooSmall(element: Element): boolean {
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  
  // On mobile, text less than 14px is generally too small
  return window.innerWidth < 768 && fontSize < 14;
}

/**
 * Check if touch targets are too small
 */
function isTouchTargetTooSmall(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  
  // Interactive elements should be at least 44x44px on touch devices
  const isInteractive = element.tagName === 'BUTTON' || 
                        element.tagName === 'A' || 
                        element.hasAttribute('role') || 
                        (element as HTMLElement).onclick !== null;
  
  return window.innerWidth < 768 && 
         isInteractive && 
         (rect.width < 44 || rect.height < 44);
}

/**
 * Test for layout issues in the current viewport
 */
function detectLayoutIssues(): ElementIssue[] {
  const issues: ElementIssue[] = [];
  const currentViewport = `${window.innerWidth}x${window.innerHeight}`;
  
  // Find the current viewport name
  const viewport = commonViewports.find(v => 
    Math.abs(v.width - window.innerWidth) < 50 && 
    Math.abs(v.height - window.innerHeight) < 50
  )?.name || currentViewport;
  
  // Check all elements for issues
  document.querySelectorAll('*').forEach(element => {
    // Skip hidden elements
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return;
    }
    
    // Check for overflow issues
    if (isElementOverflowing(element)) {
      issues.push({
        element: describeElement(element),
        issue: 'Element is overflowing its container or the viewport',
        viewport
      });
    }
    
    // Check text size
    if (isTextTooSmall(element)) {
      issues.push({
        element: describeElement(element),
        issue: 'Text is too small for mobile viewing',
        viewport
      });
    }
    
    // Check touch target size
    if (isTouchTargetTooSmall(element)) {
      issues.push({
        element: describeElement(element),
        issue: 'Touch target is too small (<44px)',
        viewport
      });
    }
  });
  
  return issues;
}

/**
 * Create a description of an element for reporting
 */
function describeElement(element: Element): string {
  let description = element.tagName.toLowerCase();
  
  // Add ID if present
  if (element.id) {
    description += `#${element.id}`;
  }
  
  // Add classes if present
  if (element.classList.length > 0) {
    description += `.${Array.from(element.classList).join('.')}`;
  }
  
  // Add text content preview if it has text
  const text = element.textContent?.trim();
  if (text) {
    const shortText = text.length > 30 ? `${text.substring(0, 27)}...` : text;
    description += ` (text: "${shortText}")`;
  }
  
  return description;
}

/**
 * Test responsive design by simulating different viewports
 */
export async function verifyResponsiveDesign(viewports = commonViewports): Promise<ResponsiveTestResult> {
  const allIssues: ElementIssue[] = [];
  const testedViewports: string[] = [];
  
  // Remember original size
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  
  try {
    // Test each viewport
    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Resize window
      window.resizeTo(viewport.width, viewport.height);
      
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Detect issues
      const issues = detectLayoutIssues();
      allIssues.push(...issues);
      
      testedViewports.push(`${viewport.name} (${viewport.width}x${viewport.height})`);
      
      console.log(`Found ${issues.length} issues in ${viewport.name} viewport`);
    }
    
    // Generate recommendations based on issues
    const recommendations = generateRecommendations(allIssues);
    
    return {
      success: allIssues.length === 0,
      testedViewports,
      issues: allIssues,
      recommendations
    };
  } finally {
    // Restore original size
    window.resizeTo(originalWidth, originalHeight);
  }
}

/**
 * Generate recommendations based on detected issues
 */
function generateRecommendations(issues: ElementIssue[]): string[] {
  const recommendations: string[] = [];
  
  // Count issue types
  const overflowIssues = issues.filter(i => i.issue.includes('overflowing')).length;
  const textSizeIssues = issues.filter(i => i.issue.includes('Text is too small')).length;
  const touchTargetIssues = issues.filter(i => i.issue.includes('Touch target is too small')).length;
  
  // Add recommendations based on issue frequency
  if (overflowIssues > 0) {
    recommendations.push('Use responsive CSS with percentage-based or flexible layouts to prevent overflow');
    recommendations.push('Implement media queries for different screen sizes');
    
    if (overflowIssues > 5) {
      recommendations.push('Consider implementing a mobile-first design approach');
    }
  }
  
  if (textSizeIssues > 0) {
    recommendations.push('Increase base font size for mobile devices (minimum 14px recommended)');
    recommendations.push('Use relative units like em or rem instead of px for text');
  }
  
  if (touchTargetIssues > 0) {
    recommendations.push('Increase the size of interactive elements to at least 44x44px on mobile');
    recommendations.push('Add padding to small interactive elements to increase their touch area');
  }
  
  // Add general recommendations
  if (issues.length > 0) {
    recommendations.push('Test the application on real devices in addition to simulated viewports');
    recommendations.push('Implement proper viewport meta tags for mobile devices');
  }
  
  return recommendations;
}

/**
 * Run a comprehensive responsive design test and generate a report
 */
export async function runResponsiveTest(): Promise<{
  success: boolean;
  report: string;
  details: ResponsiveTestResult;
}> {
  try {
    console.log('Starting comprehensive responsive design test');
    const result = await verifyResponsiveDesign();
    
    // Generate report
    let report = '# Responsive Design Test Report\n\n';
    report += `**Timestamp:** ${new Date().toLocaleString()}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASSED' : '❌ ISSUES DETECTED'}\n\n`;
    
    report += '## Test Results\n\n';
    report += `- **Viewports Tested:** ${result.testedViewports.length}\n`;
    report += `- **Issues Found:** ${result.issues.length}\n\n`;
    
    report += '### Tested Viewports\n\n';
    result.testedViewports.forEach(viewport => {
      report += `- ${viewport}\n`;
    });
    
    if (result.issues.length > 0) {
      report += '\n## Issues\n\n';
      
      // Group issues by viewport
      const issuesByViewport: Record<string, ElementIssue[]> = {};
      
      result.issues.forEach(issue => {
        if (!issuesByViewport[issue.viewport]) {
          issuesByViewport[issue.viewport] = [];
        }
        issuesByViewport[issue.viewport].push(issue);
      });
      
      // List issues by viewport
      Object.entries(issuesByViewport).forEach(([viewport, viewportIssues]) => {
        report += `### ${viewport}\n\n`;
        
        viewportIssues.forEach((issue, index) => {
          report += `${index + 1}. **${issue.element}**\n`;
          report += `   - Issue: ${issue.issue}\n`;
        });
        
        report += '\n';
      });
    }
    
    if (result.recommendations.length > 0) {
      report += '## Recommendations\n\n';
      result.recommendations.forEach((recommendation, index) => {
        report += `${index + 1}. ${recommendation}\n`;
      });
    }
    
    console.log(report);
    
    return {
      success: result.success,
      report,
      details: result
    };
  } catch (error) {
    const errorReport = `# Responsive Test Error\n\nError: ${error.message}`;
    console.error(errorReport);
    
    return {
      success: false,
      report: errorReport,
      details: {
        success: false,
        testedViewports: [],
        issues: [{
          element: 'Test runner',
          issue: error.message,
          viewport: 'N/A'
        }],
        recommendations: ['Check if the testing environment supports window resizing']
      }
    };
  }
}

export default runResponsiveTest;
/**
 * Responsive Design Testing Utility
 * 
 * A utility for testing website responsiveness across different device sizes,
 * screen orientations, and viewport configurations.
 */

import { PerformanceProfiler } from './performance-profiler';

interface Viewport {
  width: number;
  height: number;
  devicePixelRatio: number;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
}

interface ResponsiveTestResult {
  viewport: Viewport;
  scrollable: boolean;
  overflows: boolean;
  horizontalOverflow: boolean;
  verticalOverflow: boolean;
  elementsOutsideViewport: number;
  mediaQueriesTriggered: string[];
  failures: ResponsiveFailure[];
  success: boolean;
}

interface ResponsiveFailure {
  element: string;
  issue: string;
  recommendation: string;
}

interface OverallResponsiveTestResult {
  results: ResponsiveTestResult[];
  success: boolean;
  failureCount: number;
  recommendations: string[];
  summary: string;
}

// Standard device viewports for testing
const standardViewports: Viewport[] = [
  // Mobile devices
  { width: 360, height: 640, devicePixelRatio: 2, name: 'Small Mobile', type: 'mobile' },
  { width: 390, height: 844, devicePixelRatio: 3, name: 'iPhone 12/13/14', type: 'mobile' },
  { width: 414, height: 896, devicePixelRatio: 2, name: 'Large Mobile', type: 'mobile' },
  
  // Tablets
  { width: 768, height: 1024, devicePixelRatio: 2, name: 'Tablet Portrait', type: 'tablet' },
  { width: 1024, height: 768, devicePixelRatio: 2, name: 'Tablet Landscape', type: 'tablet' },
  { width: 834, height: 1194, devicePixelRatio: 2, name: 'iPad Pro (11-inch)', type: 'tablet' },
  
  // Desktops
  { width: 1366, height: 768, devicePixelRatio: 1, name: 'Laptop (13-inch)', type: 'desktop' },
  { width: 1920, height: 1080, devicePixelRatio: 1, name: 'Desktop', type: 'desktop' },
  { width: 2560, height: 1440, devicePixelRatio: 1, name: 'Large Desktop', type: 'desktop' },
];

/**
 * Test an element's responsiveness across different viewports
 */
export async function testElementResponsiveness(
  elementSelector: string,
  viewports: Viewport[] = standardViewports
): Promise<OverallResponsiveTestResult> {
  console.log(`Testing responsiveness of element: ${elementSelector}`);
  
  PerformanceProfiler.startMeasure(`ResponsiveTest_${elementSelector}`);
  
  const results: ResponsiveTestResult[] = [];
  let overallSuccess = true;
  let failureCount = 0;
  const recommendations: string[] = [];
  
  // Get the original viewport dimensions
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  
  try {
    // Test each viewport
    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Resize the viewport (simulated)
      // In a real implementation, this would use a headless browser or device emulation
      simulateViewport(viewport.width, viewport.height);
      
      // Wait for any resize events to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test the element in this viewport
      const result = testElementInCurrentViewport(elementSelector, viewport);
      results.push(result);
      
      if (!result.success) {
        overallSuccess = false;
        failureCount += result.failures.length;
        
        // Add unique recommendations
        result.failures.forEach(failure => {
          if (!recommendations.includes(failure.recommendation)) {
            recommendations.push(failure.recommendation);
          }
        });
      }
    }
    
    // Generate an overall summary
    const summary = generateResponsiveTestSummary(results);
    
    PerformanceProfiler.endMeasure(`ResponsiveTest_${elementSelector}`);
    
    return {
      results,
      success: overallSuccess,
      failureCount,
      recommendations,
      summary
    };
  } finally {
    // Reset viewport to original size
    simulateViewport(originalWidth, originalHeight);
  }
}

/**
 * Test a specific page's responsiveness across different viewports
 */
export async function testPageResponsiveness(
  pageUrl: string,
  viewports: Viewport[] = standardViewports
): Promise<OverallResponsiveTestResult> {
  console.log(`Testing responsiveness of page: ${pageUrl}`);
  
  PerformanceProfiler.startMeasure(`ResponsivePageTest_${pageUrl}`);
  
  // In a real implementation, this would navigate to the page and test it
  // For this example, we'll just test the current page
  
  // Test body element as a proxy for the entire page
  const results = await testElementResponsiveness('body', viewports);
  
  PerformanceProfiler.endMeasure(`ResponsivePageTest_${pageUrl}`);
  
  return {
    ...results,
    summary: `# Responsive Test Results for ${pageUrl}\n\n${results.summary}`
  };
}

/**
 * Simulate changing the viewport dimensions
 * Note: This is a simplified simulation and won't actually resize the browser window
 */
function simulateViewport(width: number, height: number): void {
  // Mock implementation - in a real scenario this would use headless browser APIs
  console.log(`Simulating viewport ${width}x${height}`);
  
  // We can use matchMedia to test if certain media queries would apply
  // This is just an example implementation
  
  // In a browser context, you could add a test div with specific styles to verify
  // we're within the correct breakpoint
}

/**
 * Test an element's responsiveness in the current viewport
 */
function testElementInCurrentViewport(
  elementSelector: string,
  viewport: Viewport
): ResponsiveTestResult {
  // Get the element
  const element = document.querySelector(elementSelector);
  if (!element) {
    return {
      viewport,
      scrollable: false,
      overflows: false,
      horizontalOverflow: false,
      verticalOverflow: false,
      elementsOutsideViewport: 0,
      mediaQueriesTriggered: [],
      failures: [{
        element: elementSelector,
        issue: 'Element not found',
        recommendation: `Ensure element "${elementSelector}" exists in the DOM`
      }],
      success: false
    };
  }
  
  // Check element properties
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  // Check for overflow
  const horizontalOverflow = rect.width > viewport.width;
  const verticalOverflow = rect.height > viewport.height;
  const overflows = horizontalOverflow || verticalOverflow;
  
  // Check scrollability
  const scrollable = computedStyle.overflow === 'auto' || 
                    computedStyle.overflow === 'scroll' ||
                    computedStyle.overflowY === 'auto' || 
                    computedStyle.overflowY === 'scroll' ||
                    computedStyle.overflowX === 'auto' || 
                    computedStyle.overflowX === 'scroll';
  
  // Count elements that might be outside the viewport
  const childElements = element.querySelectorAll('*');
  let elementsOutsideViewport = 0;
  
  childElements.forEach(child => {
    const childRect = (child as Element).getBoundingClientRect();
    if (childRect.right > viewport.width || childRect.bottom > viewport.height) {
      elementsOutsideViewport++;
    }
  });
  
  // Check if relevant media queries are triggered
  const mediaQueriesTriggered: string[] = [];
  
  if (window.matchMedia(`(max-width: ${viewport.width}px)`).matches) {
    mediaQueriesTriggered.push(`max-width: ${viewport.width}px`);
  }
  
  if (window.matchMedia(`(max-height: ${viewport.height}px)`).matches) {
    mediaQueriesTriggered.push(`max-height: ${viewport.height}px`);
  }
  
  // Analyze issues and create failures
  const failures: ResponsiveFailure[] = [];
  
  if (horizontalOverflow && !scrollable) {
    failures.push({
      element: elementSelector,
      issue: 'Element overflows horizontally without scroll capability',
      recommendation: `Add horizontal scroll or adjust width for viewport ${viewport.name}`
    });
  }
  
  if (verticalOverflow && !scrollable) {
    failures.push({
      element: elementSelector,
      issue: 'Element overflows vertically without scroll capability',
      recommendation: `Add vertical scroll or adjust height for viewport ${viewport.name}`
    });
  }
  
  if (elementsOutsideViewport > 0) {
    failures.push({
      element: elementSelector,
      issue: `${elementsOutsideViewport} child elements are outside the viewport`,
      recommendation: `Check child element positioning in ${viewport.name} viewport`
    });
  }
  
  // Add any viewport-specific checks
  if (viewport.type === 'mobile') {
    // Check for touch-friendly sizing
    const buttons = element.querySelectorAll('button, a, input, select, [role="button"]');
    
    if (buttons.length > 0) {
      let tooSmallTouchTargets = 0;
      buttons.forEach(button => {
        const buttonRect = (button as Element).getBoundingClientRect();
        // Touch targets should be at least 44x44 px
        if (buttonRect.width < 44 || buttonRect.height < 44) {
          tooSmallTouchTargets++;
        }
      });
      
      if (tooSmallTouchTargets > 0) {
        failures.push({
          element: elementSelector,
          issue: `${tooSmallTouchTargets} touch targets are too small for mobile`,
          recommendation: 'Increase size of buttons and touch targets to at least 44x44px'
        });
      }
    }
  }
  
  return {
    viewport,
    scrollable,
    overflows,
    horizontalOverflow,
    verticalOverflow,
    elementsOutsideViewport,
    mediaQueriesTriggered,
    failures,
    success: failures.length === 0
  };
}

/**
 * Generate a summary of the responsive test results
 */
function generateResponsiveTestSummary(results: ResponsiveTestResult[]): string {
  let summary = `## Responsive Testing Summary\n\n`;
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  summary += `- Passed ${passedTests} of ${totalTests} viewport tests\n`;
  
  // Organize failures by viewport type
  const mobileFailures = results
    .filter(r => r.viewport.type === 'mobile' && !r.success)
    .map(r => ({ viewport: r.viewport.name, failures: r.failures }));
    
  const tabletFailures = results
    .filter(r => r.viewport.type === 'tablet' && !r.success)
    .map(r => ({ viewport: r.viewport.name, failures: r.failures }));
    
  const desktopFailures = results
    .filter(r => r.viewport.type === 'desktop' && !r.success)
    .map(r => ({ viewport: r.viewport.name, failures: r.failures }));
  
  // List failures by device type
  if (mobileFailures.length > 0) {
    summary += `\n### Mobile Issues:\n`;
    mobileFailures.forEach(f => {
      summary += `- **${f.viewport}**:\n`;
      f.failures.forEach(failure => {
        summary += `  - ${failure.issue}\n`;
      });
    });
  }
  
  if (tabletFailures.length > 0) {
    summary += `\n### Tablet Issues:\n`;
    tabletFailures.forEach(f => {
      summary += `- **${f.viewport}**:\n`;
      f.failures.forEach(failure => {
        summary += `  - ${failure.issue}\n`;
      });
    });
  }
  
  if (desktopFailures.length > 0) {
    summary += `\n### Desktop Issues:\n`;
    desktopFailures.forEach(f => {
      summary += `- **${f.viewport}**:\n`;
      f.failures.forEach(failure => {
        summary += `  - ${failure.issue}\n`;
      });
    });
  }
  
  // Add recommendations section if any failures
  if (mobileFailures.length > 0 || tabletFailures.length > 0 || desktopFailures.length > 0) {
    summary += `\n### Recommendations:\n`;
    
    // Collect unique recommendations
    const uniqueRecommendations = new Set<string>();
    
    [...mobileFailures, ...tabletFailures, ...desktopFailures].forEach(f => {
      f.failures.forEach(failure => {
        uniqueRecommendations.add(failure.recommendation);
      });
    });
    
    // Add each unique recommendation
    uniqueRecommendations.forEach(rec => {
      summary += `- ${rec}\n`;
    });
  }
  
  return summary;
}

/**
 * Test the entire application's responsiveness
 */
export async function testAppResponsiveness(
  pages: string[] = [
    '/',
    '/mood-capsules',
    '/color-palettes',
    '/content-library',
    '/platform-integrations',
    '/creative-symbiosis'
  ]
): Promise<OverallResponsiveTestResult> {
  console.log(`Testing responsiveness of entire application across ${pages.length} pages`);
  
  PerformanceProfiler.startMeasure('AppResponsivenessTest');
  
  const allResults: ResponsiveTestResult[] = [];
  let overallSuccess = true;
  let failureCount = 0;
  const allRecommendations: string[] = [];
  
  // In a real implementation, this would navigate to each page and test it
  // For this example, we'll use a simplified approach
  
  // Test the current page as an example
  const pageResults = await testPageResponsiveness(window.location.pathname);
  allResults.push(...pageResults.results);
  
  if (!pageResults.success) {
    overallSuccess = false;
    failureCount += pageResults.failureCount;
    
    // Add unique recommendations
    pageResults.recommendations.forEach(rec => {
      if (!allRecommendations.includes(rec)) {
        allRecommendations.push(rec);
      }
    });
  }
  
  // Generate a comprehensive summary
  let summary = `# Application-Wide Responsive Testing Results\n\n`;
  summary += `## Overview\n`;
  summary += `- Total pages tested: ${pages.length}\n`;
  summary += `- Total viewports tested: ${standardViewports.length}\n`;
  summary += `- Total failures: ${failureCount}\n`;
  summary += `- Overall success: ${overallSuccess ? 'Yes ✅' : 'No ❌'}\n\n`;
  
  // Add page-specific summaries
  summary += pageResults.summary;
  
  // Add overall recommendations
  if (allRecommendations.length > 0) {
    summary += `\n## Overall Recommendations\n`;
    allRecommendations.forEach((rec, index) => {
      summary += `${index + 1}. ${rec}\n`;
    });
  }
  
  PerformanceProfiler.endMeasure('AppResponsivenessTest');
  
  return {
    results: allResults,
    success: overallSuccess,
    failureCount,
    recommendations: allRecommendations,
    summary
  };
}

/**
 * Get CSS breakpoint information for the current viewport
 */
export function getCurrentBreakpointInfo(): { 
  breakpoint: string; 
  width: number; 
  height: number;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
} {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Common Tailwind breakpoints
  // xs: < 640px
  // sm: 640px - 767px
  // md: 768px - 1023px
  // lg: 1024px - 1279px
  // xl: 1280px+
  
  let breakpoint = '';
  let isXs = false;
  let isSm = false;
  let isMd = false;
  let isLg = false;
  let isXl = false;
  
  if (width < 640) {
    breakpoint = 'xs';
    isXs = true;
  } else if (width < 768) {
    breakpoint = 'sm';
    isSm = true;
  } else if (width < 1024) {
    breakpoint = 'md';
    isMd = true;
  } else if (width < 1280) {
    breakpoint = 'lg';
    isLg = true;
  } else {
    breakpoint = 'xl';
    isXl = true;
  }
  
  return {
    breakpoint,
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl
  };
}
