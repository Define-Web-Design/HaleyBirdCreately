
/**
 * Utility for testing responsive design across different device sizes
 */

interface DeviceProfile {
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
}

interface TestResult {
  device: DeviceProfile;
  viewportFits: boolean;
  touchTargetsValid: boolean;
  fontSizeAppropriate: boolean;
  noHorizontalScrolling: boolean;
  issues: string[];
}

interface TestSummary {
  passedTests: number;
  failedTests: number;
  devicesTested: number;
  success: boolean;
  recommendations: string[];
}

// Define standard device profiles for testing
const DEVICE_PROFILES: DeviceProfile[] = [
  { name: 'iPhone SE', width: 375, height: 667, type: 'mobile' },
  { name: 'iPhone 12/13', width: 390, height: 844, type: 'mobile' },
  { name: 'iPhone 12/13 Pro Max', width: 428, height: 926, type: 'mobile' },
  { name: 'iPad', width: 768, height: 1024, type: 'tablet' },
  { name: 'iPad Pro', width: 1024, height: 1366, type: 'tablet' },
  { name: 'Small Desktop', width: 1280, height: 800, type: 'desktop' },
  { name: 'Large Desktop', width: 1920, height: 1080, type: 'desktop' }
];

/**
 * Test if the app is responsive across different device sizes
 */
export async function testAppResponsiveness(): Promise<{
  results: TestResult[];
  summary: TestSummary;
  success: boolean;
  recommendations: string[];
}> {
  const results: TestResult[] = [];
  const recommendations: string[] = [];
  let passedTests = 0;
  let failedTests = 0;
  
  // For each device profile, check if the app is responsive
  for (const device of DEVICE_PROFILES) {
    const issues: string[] = [];
    
    // Test viewport adjustments
    const viewportFits = await testViewportFit(device);
    if (!viewportFits) {
      issues.push(`Content doesn't fit properly in ${device.name} viewport`);
    }
    
    // Test touch target sizes for mobile and tablet
    const touchTargetsValid = device.type === 'desktop' ? true : await testTouchTargets(device);
    if (!touchTargetsValid && (device.type === 'mobile' || device.type === 'tablet')) {
      issues.push(`Some touch targets are too small for ${device.name}`);
    }
    
    // Test font sizes
    const fontSizeAppropriate = await testFontSizes(device);
    if (!fontSizeAppropriate) {
      issues.push(`Font sizes may not be readable on ${device.name}`);
    }
    
    // Test for horizontal scrolling (a common mobile issue)
    const noHorizontalScrolling = await testHorizontalScrolling(device);
    if (!noHorizontalScrolling) {
      issues.push(`Horizontal scrolling detected on ${device.name}`);
    }
    
    // Add the result
    const result: TestResult = {
      device,
      viewportFits,
      touchTargetsValid,
      fontSizeAppropriate,
      noHorizontalScrolling,
      issues
    };
    
    results.push(result);
    
    // Count passed/failed tests
    if (issues.length === 0) {
      passedTests++;
    } else {
      failedTests++;
      
      // Add device-specific recommendations
      if (!viewportFits) {
        recommendations.push(`Improve layout for ${device.name} (${device.width}x${device.height})`);
      }
      
      if (!touchTargetsValid && (device.type === 'mobile' || device.type === 'tablet')) {
        recommendations.push(`Increase touch target size for interactive elements on ${device.name}`);
      }
      
      if (!fontSizeAppropriate) {
        recommendations.push(`Adjust font sizes for better readability on ${device.name}`);
      }
      
      if (!noHorizontalScrolling) {
        recommendations.push(`Fix content width to prevent horizontal scrolling on ${device.name}`);
      }
    }
  }
  
  // Generate summary
  const summary: TestSummary = {
    passedTests,
    failedTests,
    devicesTested: DEVICE_PROFILES.length,
    success: failedTests === 0,
    recommendations
  };
  
  // Add general recommendations if there are issues
  if (failedTests > 0) {
    recommendations.push('Implement fluid layouts with proper breakpoints');
    recommendations.push('Use relative units (rem, em, %) instead of fixed pixels');
    recommendations.push('Test with actual devices or device emulators');
  }
  
  return {
    results,
    summary,
    success: failedTests === 0,
    recommendations
  };
}

/**
 * Test if content fits properly in the viewport
 */
async function testViewportFit(device: DeviceProfile): Promise<boolean> {
  try {
    // In a real implementation, this would resize a headless browser and check for layout issues
    // For now, we'll use a simplified check based on device type
    
    // Check if there's a meta viewport tag
    const hasViewportMeta = document.querySelector('meta[name="viewport"]') !== null;
    if (!hasViewportMeta) {
      return false;
    }
    
    // Check for overflowing elements
    const bodyWidth = document.body.offsetWidth;
    const windowWidth = window.innerWidth;
    
    // If body width exceeds window width by more than 5px, there may be horizontal overflow
    const hasHorizontalOverflow = bodyWidth > windowWidth + 5;
    
    // For small mobile devices, check for tiny text that might be hard to read
    if (device.type === 'mobile' && device.width < 400) {
      const smallTexts = document.querySelectorAll('p, span, a, button, input, select, textarea');
      for (const element of Array.from(smallTexts)) {
        const fontSize = window.getComputedStyle(element).fontSize;
        if (parseFloat(fontSize) < 14) {
          return false;
        }
      }
    }
    
    return !hasHorizontalOverflow;
  } catch (error) {
    console.error('Error testing viewport fit:', error);
    return false;
  }
}

/**
 * Test if touch targets are large enough for mobile devices
 */
async function testTouchTargets(device: DeviceProfile): Promise<boolean> {
  try {
    // In a real implementation, this would check actual element sizes
    // Minimum recommended touch target size is 44x44px
    
    // Find all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    
    let allTargetsValid = true;
    
    for (const element of Array.from(interactiveElements)) {
      const rect = element.getBoundingClientRect();
      
      // Check if the element is visible
      if (rect.width === 0 || rect.height === 0) {
        continue;
      }
      
      // For mobile devices, touch targets should be at least 44x44px
      if (device.type === 'mobile' && (rect.width < 44 || rect.height < 44)) {
        allTargetsValid = false;
        break;
      }
      
      // For tablets, we can be slightly more forgiving
      if (device.type === 'tablet' && (rect.width < 40 || rect.height < 40)) {
        allTargetsValid = false;
        break;
      }
    }
    
    return allTargetsValid;
  } catch (error) {
    console.error('Error testing touch targets:', error);
    return false;
  }
}

/**
 * Test if font sizes are appropriate for the device
 */
async function testFontSizes(device: DeviceProfile): Promise<boolean> {
  try {
    // Check all text elements for appropriate font sizes
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, button, input, label, textarea');
    
    let allFontSizesValid = true;
    
    for (const element of Array.from(textElements)) {
      const fontSize = window.getComputedStyle(element).fontSize;
      const fontSizePx = parseFloat(fontSize);
      
      // Skip elements with 0 font size (might be hidden)
      if (fontSizePx === 0) {
        continue;
      }
      
      // Minimum font sizes per device type
      const minFontSize = {
        mobile: 12, // 12px minimum for mobile
        tablet: 13, // 13px minimum for tablet
        desktop: 14  // 14px minimum for desktop
      };
      
      if (fontSizePx < minFontSize[device.type]) {
        allFontSizesValid = false;
        break;
      }
    }
    
    return allFontSizesValid;
  } catch (error) {
    console.error('Error testing font sizes:', error);
    return false;
  }
}

/**
 * Test if there is horizontal scrolling on the page
 */
async function testHorizontalScrolling(device: DeviceProfile): Promise<boolean> {
  try {
    // Check if document width exceeds viewport width
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = window.innerWidth;
    
    // If document width is more than viewport width + small threshold (5px for potential rounding issues),
    // then horizontal scrolling exists
    return documentWidth <= viewportWidth + 5;
  } catch (error) {
    console.error('Error testing horizontal scrolling:', error);
    return false;
  }
}

/**
 * Test specific areas of the app for mobile-specific issues
 */
export async function testMobileSpecificFeatures(): Promise<{
  touchFeedbackWorking: boolean;
  swipeGesturesWorking: boolean;
  adaptiveLayoutCorrect: boolean;
  issues: string[];
}> {
  try {
    const issues: string[] = [];
    
    // Check if touch feedback is implemented
    const touchFeedbackWorking = document.querySelector('.touch-feedback') !== null;
    if (!touchFeedbackWorking) {
      issues.push('Touch feedback animations are not implemented');
    }
    
    // Check if swipe gestures are implemented
    const swipeGesturesWorking = document.querySelector('[data-swipe-handler]') !== null;
    if (!swipeGesturesWorking) {
      issues.push('Swipe gesture handlers are not detected');
    }
    
    // Check for adaptive layouts
    const adaptiveLayoutCorrect = document.querySelectorAll('.md\\:hidden, .lg\\:flex, .sm\\:grid').length > 0;
    if (!adaptiveLayoutCorrect) {
      issues.push('Few or no responsive layout classes detected');
    }
    
    return {
      touchFeedbackWorking,
      swipeGesturesWorking,
      adaptiveLayoutCorrect,
      issues
    };
  } catch (error) {
    console.error('Error testing mobile-specific features:', error);
    return {
      touchFeedbackWorking: false,
      swipeGesturesWorking: false,
      adaptiveLayoutCorrect: false,
      issues: ['Error during testing: ' + (error as Error).message]
    };
  }
}

// Export functions for use in testing
export default {
  testAppResponsiveness,
  testMobileSpecificFeatures
};
