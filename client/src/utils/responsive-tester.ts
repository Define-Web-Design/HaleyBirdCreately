
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
