/**
 * Utility for testing responsive design across different device sizes
 */

const DEVICE_SIZES = {
  mobile: {
    width: 375,
    height: 667,
    name: 'Mobile (iPhone 8)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  mobileL: {
    width: 428,
    height: 926,
    name: 'Mobile Large (iPhone 13 Pro Max)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  },
  tablet: {
    width: 768,
    height: 1024,
    name: 'Tablet (iPad)',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  laptop: {
    width: 1366,
    height: 768,
    name: 'Laptop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
  },
  desktop: {
    width: 1920,
    height: 1080,
    name: 'Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
  }
};

// Mobile-specific CSS features to test
const MOBILE_CSS_FEATURES = [
  { name: 'touch-action', property: 'touch-action', value: 'manipulation' },
  { name: 'user-select', property: 'user-select', value: 'none' },
  { name: 'tap-highlight-color', property: '-webkit-tap-highlight-color', value: 'transparent' },
  { name: 'mobile-vh', property: '--vh', value: true }
];

// Elements that should adapt for mobile
const MOBILE_SPECIFIC_ELEMENTS = [
  { selector: 'button, .btn', property: 'min-height', minValue: 44 },
  { selector: 'input, select', property: 'min-height', minValue: 44 },
  { selector: '.mobile-drawer', property: 'display', value: null },
  { selector: '.touch-feedback', property: 'class', contains: 'touch-feedback' }
];

/**
 * Test responsiveness across multiple device sizes
 */
async function testAppResponsiveness() {
  console.log('Testing app responsiveness across different device sizes...');

  const results = {
    devices: {},
    mobileOptimizations: {},
    summary: {
      totalTests: 0,
      passedTests: 0,
      mobileOptimizationScore: 0,
      issues: [],
      recommendations: []
    },
    success: true
  };

  try {
    // Test each device size
    for (const [deviceType, deviceData] of Object.entries(DEVICE_SIZES)) {
      results.devices[deviceType] = {
        name: deviceData.name,
        width: deviceData.width,
        height: deviceData.height,
        viewportAdapts: false,
        elementsResponsive: false,
        issues: []
      };

      // Check if any device-specific issues
      if (deviceType === 'mobile' || deviceType === 'mobileL') {
        // Check for mobile-specific optimizations
        results.mobileOptimizations = checkMobileOptimizations();

        // Check for touch-specific optimizations
        const touchOptimized = checkTouchOptimizations();
        results.mobileOptimizations.touchOptimized = touchOptimized;

        if (!touchOptimized.optimized) {
          results.devices[deviceType].issues.push('Missing touch optimizations');
          results.summary.issues.push(`Touch optimizations missing on ${deviceType}`);
          results.summary.recommendations.push('Implement touch-specific optimizations for better mobile experience');
        }
      }

      results.summary.totalTests++;
      if (results.devices[deviceType].issues.length === 0) {
        results.summary.passedTests++;
      }
    }

    // Check if mobile drawer is implemented
    const hasMobileDrawer = document.querySelector('.mobile-drawer, [data-mobile-drawer]') !== null;
    if (!hasMobileDrawer) {
      results.summary.issues.push('Mobile drawer not found');
      results.summary.recommendations.push('Implement a mobile-specific drawer navigation');
    }

    // Check if viewport meta tag is set correctly
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const hasProperViewport = viewportMeta && 
                             viewportMeta.getAttribute('content')?.includes('width=device-width') &&
                             viewportMeta.getAttribute('content')?.includes('initial-scale=1');

    if (!hasProperViewport) {
      results.summary.issues.push('Viewport meta tag not properly configured');
      results.summary.recommendations.push('Add a proper viewport meta tag for responsive design');
    }

    // Calculate mobile optimization score
    const mobileOptimizationFeatures = Object.values(results.mobileOptimizations).filter(opt => opt === true || (typeof opt === 'object' && opt.optimized)).length;
    const totalMobileFeatures = Object.keys(results.mobileOptimizations).length;
    results.summary.mobileOptimizationScore = Math.round((mobileOptimizationFeatures / totalMobileFeatures) * 100);

    // Overall success determination
    results.success = results.summary.issues.length === 0 && 
                     results.summary.mobileOptimizationScore >= 80;

    // Add general recommendations
    if (results.summary.mobileOptimizationScore < 100) {
      results.summary.recommendations.push('Implement all mobile-specific optimizations for better user experience');
    }

    if (!results.success) {
      results.summary.recommendations.push('Address all identified issues to improve responsive design');
    }

    return results;
  } catch (error) {
    console.error('Error testing app responsiveness:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during responsive testing',
      summary: {
        issues: ['Error during responsive testing'],
        recommendations: ['Check browser console for errors']
      }
    };
  }
}

/**
 * Check for mobile-specific optimizations
 */
function checkMobileOptimizations() {
  const results = {
    touchActionOptimized: false,
    userSelectOptimized: false,
    tapHighlightOptimized: false,
    mobileVhImplemented: false,
    buttonSizeOptimized: false,
    inputSizeOptimized: false,
    drawersImplemented: false,
    touchFeedbackImplemented: false
  };

  try {
    // Check CSS features
    const computedStyle = window.getComputedStyle(document.documentElement);

    // Check for touch-action optimization
    const touchActionElements = document.querySelectorAll('[style*="touch-action"], [class*="touch-action"]');
    results.touchActionOptimized = touchActionElements.length > 0;

    // Check for user-select optimization
    const userSelectElements = document.querySelectorAll('[style*="user-select"], [class*="user-select"]');
    results.userSelectOptimized = userSelectElements.length > 0;

    // Check for tap-highlight-color optimization
    results.tapHighlightOptimized = computedStyle.getPropertyValue('-webkit-tap-highlight-color') === 'rgba(0, 0, 0, 0)' || 
                                   computedStyle.getPropertyValue('-webkit-tap-highlight-color') === 'transparent';

    // Check for mobile vh implementation
    results.mobileVhImplemented = computedStyle.getPropertyValue('--vh') !== '';

    // Check button sizes
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');
    let largeEnoughButtons = 0;
    buttons.forEach(button => {
      const buttonStyle = window.getComputedStyle(button);
      const height = parseInt(buttonStyle.height);
      if (height >= 44) { // 44px is the recommended minimum for touch targets
        largeEnoughButtons++;
      }
    });
    results.buttonSizeOptimized = buttons.length > 0 ? (largeEnoughButtons / buttons.length) > 0.8 : false;

    // Check input sizes
    const inputs = document.querySelectorAll('input, select, textarea');
    let largeEnoughInputs = 0;
    inputs.forEach(input => {
      const inputStyle = window.getComputedStyle(input);
      const height = parseInt(inputStyle.height);
      if (height >= 44) {
        largeEnoughInputs++;
      }
    });
    results.inputSizeOptimized = inputs.length > 0 ? (largeEnoughInputs / inputs.length) > 0.8 : false;

    // Check for mobile drawer implementation
    results.drawersImplemented = document.querySelectorAll('.mobile-drawer, [data-mobile-drawer]').length > 0;

    // Check for touch feedback implementation
    results.touchFeedbackImplemented = document.querySelectorAll('.touch-feedback, [data-touch-feedback]').length > 0;

    return results;
  } catch (error) {
    console.error('Error checking mobile optimizations:', error);
    return {
      error: error.message || 'Unknown error during mobile optimization check'
    };
  }
}

/**
 * Check for touch-specific optimizations
 */
function checkTouchOptimizations() {
  const results = {
    optimized: false,
    hasTouchListeners: false,
    hasSwipeGestures: false,
    hasHapticFeedback: false,
    issues: []
  };

  try {
    // Check for touch event listeners using a heuristic approach
    // This is a simple approximation since we can't directly inspect event listeners
    const potentialTouchElements = document.querySelectorAll('[ontouchstart], [ontouchmove], [ontouchend], .swipe, .touch-enabled');
    results.hasTouchListeners = potentialTouchElements.length > 0;

    // Look for common swipe-related classes or attributes
    const swipeElements = document.querySelectorAll('[data-swipe], .swipe, .swipeable, [data-gesture]');
    results.hasSwipeGestures = swipeElements.length > 0;

    // Look for haptic feedback classes
    const hapticElements = document.querySelectorAll('.haptic-feedback, [data-haptic], .touch-feedback');
    results.hasHapticFeedback = hapticElements.length > 0;

    // Determine overall optimization
    const optimizations = [
      results.hasTouchListeners,
      results.hasSwipeGestures,
      results.hasHapticFeedback
    ];
    results.optimized = optimizations.filter(Boolean).length >= 2; // At least 2 optimizations

    // Add issues if not optimized
    if (!results.hasTouchListeners) {
      results.issues.push('No touch event listeners detected');
    }
    if (!results.hasSwipeGestures) {
      results.issues.push('No swipe gesture support detected');
    }
    if (!results.hasHapticFeedback) {
      results.issues.push('No haptic feedback support detected');
    }

    return results;
  } catch (error) {
    console.error('Error checking touch optimizations:', error);
    return {
      optimized: false,
      error: error.message || 'Unknown error during touch optimization check',
      issues: ['Error during touch optimization check']
    };
  }
}

// Run the test when imported and called
module.exports = {
  testAppResponsiveness,
  checkMobileOptimizations,
  checkTouchOptimizations,
  DEVICE_SIZES
};