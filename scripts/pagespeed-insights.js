// PageSpeed Insights API integration script
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.PAGESPEED_INSIGHTS_API_KEY;
const DEFAULT_URL = 'https://replitapp.example.com'; // Replace with your actual deployed URL
const LOG_DIR = path.join(__dirname, '..', 'logs', 'pagespeed');

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create logs directory:', error);
  process.exit(1);
}

/**
 * Run PageSpeed Insights for URL
 * @param {string} url - The URL to analyze
 * @param {boolean} isMobile - Whether to use mobile or desktop strategy
 * @returns {Promise<Object>} - PageSpeed result
 */
async function runPageSpeedInsights(url = DEFAULT_URL, isMobile = false) {
  if (!API_KEY) {
    console.error('Error: PAGESPEED_INSIGHTS_API_KEY environment variable is not set');
    process.exit(1);
  }

  const strategy = isMobile ? 'mobile' : 'desktop';
  const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${API_KEY}`;

  console.log(`Running PageSpeed Insights for ${url} (${strategy} strategy)...`);

  return new Promise((resolve, reject) => {
    https.get(apiUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse PageSpeed API response: ${error}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`PageSpeed API request failed: ${error.message}`));
    });
  });
}

/**
 * Parse and display PageSpeed results
 * @param {Object} result - PageSpeed API result
 * @param {boolean} isMobile - Whether this is for mobile
 */
function displayPageSpeedResults(result, isMobile) {
  if (!result.lighthouseResult) {
    console.error('Error: Invalid PageSpeed result format');
    console.error(result);
    return;
  }

  const { categories, audits } = result.lighthouseResult;

  // Extract overall performance score
  const performanceScore = Math.round(categories.performance.score * 100);

  console.log('\n=== PERFORMANCE SUMMARY ===');
  console.log(`Strategy: ${isMobile ? 'Mobile' : 'Desktop'}`);
  console.log(`Performance Score: ${performanceScore}/100`);

  // Extract Core Web Vitals metrics
  const lcpAudit = audits['largest-contentful-paint'];
  const fidAudit = audits['max-potential-fid'] || audits['total-blocking-time'];
  const clsAudit = audits['cumulative-layout-shift'];

  console.log('\n=== CORE WEB VITALS ===');
  console.log(`Largest Contentful Paint (LCP): ${lcpAudit.displayValue}`);
  console.log(`  Score: ${Math.round(lcpAudit.score * 100)}/100`);

  if (fidAudit) {
    console.log(`First Input Delay (FID) proxy: ${fidAudit.displayValue}`);
    console.log(`  Score: ${Math.round(fidAudit.score * 100)}/100`);
  }

  console.log(`Cumulative Layout Shift (CLS): ${clsAudit.displayValue}`);
  console.log(`  Score: ${Math.round(clsAudit.score * 100)}/100`);

  // Extract top opportunities for improvement
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity')
    .sort((a, b) => b.score - a.score);

  if (opportunities.length > 0) {
    console.log('\n=== TOP IMPROVEMENT OPPORTUNITIES ===');
    opportunities.slice(0, 5).forEach((opportunity, index) => {
      console.log(`${index + 1}. ${opportunity.title}`);
      console.log(`   ${opportunity.description}`);
    });
  }

  // Log full result to file
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const fileName = `${timestamp}_${isMobile ? 'mobile' : 'desktop'}_report.json`;
  const filePath = path.join(LOG_DIR, fileName);

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  console.log(`\nFull report saved to: ${filePath}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Get URL from command line arguments or use default
    const url = process.argv[2] || DEFAULT_URL;

    // Run for both mobile and desktop
    const mobileResult = await runPageSpeedInsights(url, true);
    displayPageSpeedResults(mobileResult, true);

    const desktopResult = await runPageSpeedInsights(url, false);
    displayPageSpeedResults(desktopResult, false);

    console.log('\nPageSpeed analysis complete!');
  } catch (error) {
    console.error('Error running PageSpeed analysis:', error);
    process.exit(1);
  }
}

// Run the script
main();