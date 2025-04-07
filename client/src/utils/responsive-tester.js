
/**
 * Responsive Design Testing Utility
 * Tests the application across various viewport sizes to ensure mobile compatibility
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Define viewport sizes to test
const viewportSizes = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 12/13 Pro Max', width: 428, height: 926 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Small laptop', width: 1280, height: 800 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

// Pages to test
const pagesToTest = [
  '/',
  '/dashboard',
  '/mood-capsules',
  '/color-palettes',
  '/settings',
];

/**
 * Test responsive design across different device sizes
 */
async function testAppResponsiveness() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('Starting responsive design testing...');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: '',
    deviceResults: []
  };
  
  try {
    for (const viewport of viewportSizes) {
      console.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const deviceResult = {
        device: viewport.name,
        size: `${viewport.width}x${viewport.height}`,
        pageResults: []
      };
      
      for (const pageUrl of pagesToTest) {
        const page = await browser.newPage();
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
        });
        
        const fullUrl = `http://localhost:5000${pageUrl}`;
        console.log(`  - Testing page: ${pageUrl}`);
        
        try {
          // Navigate to the page
          const response = await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 10000 });
          
          // Check if page loaded successfully
          const pageSuccess = response && response.ok();
          
          // Take a screenshot for visual reference
          const screenshotDir = path.join(__dirname, '../../logs/responsive-tests');
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }
          
          const screenshotPath = path.join(
            screenshotDir, 
            `${viewport.name.replace(/\s+/g, '-').toLowerCase()}-${pageUrl.replace(/\//g, '-') || 'home'}.png`
          );
          
          await page.screenshot({ path: screenshotPath });
          
          // Check for horizontal overflow
          const hasHorizontalOverflow = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });
          
          // Check for tap target size (minimum 44x44px for mobile)
          const smallTapTargets = await page.evaluate(() => {
            const interactiveElements = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="checkbox"], input[type="radio"]'));
            
            return interactiveElements.filter(el => {
              const rect = el.getBoundingClientRect();
              return (rect.width < 44 || rect.height < 44);
            }).length;
          });
          
          // Check if text is readable without zooming (font size >= 16px for mobile)
          const hasSmallText = await page.evaluate(() => {
            if (window.innerWidth >= 768) return false; // Only check on mobile viewports
            
            const textElements = Array.from(document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li, td, button, a'));
            
            return textElements.some(el => {
              const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
              return fontSize < 16;
            });
          });
          
          // Check for input field font size (should be at least 16px to prevent zoom on iOS)
          const hasSmallInputText = await page.evaluate(() => {
            if (window.innerWidth >= 768) return false; // Only check on mobile viewports
            
            const inputElements = Array.from(document.querySelectorAll('input, textarea, select'));
            
            return inputElements.some(el => {
              const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
              return fontSize < 16;
            });
          });
          
          deviceResult.pageResults.push({
            url: pageUrl,
            loaded: pageSuccess,
            hasHorizontalOverflow,
            smallTapTargets,
            hasSmallText,
            hasSmallInputText,
            screenshotPath
          });
        } catch (err) {
          console.error(`    Error testing ${pageUrl} on ${viewport.name}:`, err.message);
          deviceResult.pageResults.push({
            url: pageUrl,
            loaded: false,
            error: err.message
          });
        } finally {
          await page.close();
        }
      }
      
      results.deviceResults.push(deviceResult);
    }
    
    // Generate overall summary
    const totalTests = viewportSizes.length * pagesToTest.length;
    const successfulTests = results.deviceResults.reduce((acc, device) => {
      return acc + device.pageResults.filter(page => 
        page.loaded && 
        !page.hasHorizontalOverflow && 
        page.smallTapTargets < 3 &&
        !page.hasSmallText &&
        !page.hasSmallInputText
      ).length;
    }, 0);
    
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    results.summary = `Responsive testing complete. Success rate: ${successRate}% (${successfulTests}/${totalTests} tests passed)`;
    console.log(results.summary);
    
    const commonIssues = [];
    
    const horizontalOverflowCount = results.deviceResults.reduce((acc, device) => {
      return acc + device.pageResults.filter(page => page.hasHorizontalOverflow).length;
    }, 0);
    
    if (horizontalOverflowCount > 0) {
      commonIssues.push(`Horizontal overflow detected on ${horizontalOverflowCount} page tests`);
    }
    
    const smallTapTargetsCount = results.deviceResults.reduce((acc, device) => {
      return acc + device.pageResults.filter(page => page.smallTapTargets > 0).length;
    }, 0);
    
    if (smallTapTargetsCount > 0) {
      commonIssues.push(`Small tap targets (< 44px) found on ${smallTapTargetsCount} page tests`);
    }
    
    const smallTextCount = results.deviceResults.reduce((acc, device) => {
      return acc + device.pageResults.filter(page => page.hasSmallText).length;
    }, 0);
    
    if (smallTextCount > 0) {
      commonIssues.push(`Text below 16px found on ${smallTextCount} mobile page tests`);
    }
    
    const smallInputTextCount = results.deviceResults.reduce((acc, device) => {
      return acc + device.pageResults.filter(page => page.hasSmallInputText).length;
    }, 0);
    
    if (smallInputTextCount > 0) {
      commonIssues.push(`Input fields with font size below 16px found on ${smallInputTextCount} mobile page tests`);
    }
    
    results.commonIssues = commonIssues;
    
    // Write results to a report file
    const reportDir = path.join(__dirname, '../../logs/responsive-tests');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportDir, `responsive-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`),
      JSON.stringify(results, null, 2)
    );
    
    return results;
  } catch (error) {
    console.error('Error during responsive testing:', error);
    return {
      timestamp: new Date().toISOString(),
      summary: `Responsive testing failed: ${error.message}`,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  testAppResponsiveness
};
