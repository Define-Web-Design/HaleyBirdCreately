/**
 * PageSpeed Insights Integration Script
 * 
 * This script helps analyze the application's performance using Google PageSpeed Insights
 * and provides recommendations for optimization.
 * 
 * Usage: 
 * 1. Run with URL: node pagespeed-insights.js https://your-app-url.com
 * 2. Optionally specify device: node pagespeed-insights.js https://your-app-url.com mobile
 * 
 * Requirements:
 * - Node.js
 * - node-fetch (npm install node-fetch)
 * - An internet connection to access PageSpeed Insights API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const API_KEY = process.env.PAGESPEED_INSIGHTS_API_KEY;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '..', 'logs', 'pagespeed');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`${colors.red}Error: URL is required${colors.reset}`);
    console.log(`Usage: node pagespeed-insights.js <URL> [device]`);
    process.exit(1);
  }
  
  const url = args[0];
  const device = args[1] || 'mobile';
  
  if (!['mobile', 'desktop'].includes(device.toLowerCase())) {
    console.warn(`${colors.yellow}Warning: Invalid device type "${device}". Using "mobile" instead.${colors.reset}`);
    return { url, device: 'mobile' };
  }
  
  return { url, device: device.toLowerCase() };
}

/**
 * Run PageSpeed Insights analysis
 */
async function runPageSpeedInsights(url, strategy = 'mobile') {
  try {
    if (!API_KEY) {
      console.error('Error: PAGESPEED_INSIGHTS_API_KEY is not set in environment variables');
      process.exit(1);
    }

    console.log(`Running PageSpeed Insights for ${url} (${strategy})...`);

    const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${API_KEY}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract core metrics
    const lcp = data.lighthouseResult?.audits['largest-contentful-paint']?.displayValue || 'N/A';
    const cls = data.lighthouseResult?.audits['cumulative-layout-shift']?.displayValue || 'N/A';
    const tbt = data.lighthouseResult?.audits['total-blocking-time']?.displayValue || 'N/A';
    const fcp = data.lighthouseResult?.audits['first-contentful-paint']?.displayValue || 'N/A';
    const performance = Math.round(data.lighthouseResult?.categories?.performance?.score * 100) || 'N/A';

    console.log('\n===== Core Web Vitals Results =====');
    console.log(`Performance Score: ${performance}%`);
    console.log(`Largest Contentful Paint (LCP): ${lcp}`);
    console.log(`Cumulative Layout Shift (CLS): ${cls}`);
    console.log(`Total Blocking Time (TBT): ${tbt}`);
    console.log(`First Contentful Paint (FCP): ${fcp}`);


    // Save full results to log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `pagespeed-${strategy}-${timestamp}.json`;
    const filePath = path.join(LOGS_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nFull results saved to: ${filePath}`);

    // Check for performance opportunities
    const opportunities = data.lighthouseResult?.audits['performance-budget']?.details?.items || 
                         data.lighthouseResult?.audits['network-requests']?.details?.items || [];

    if (opportunities.length > 0) {
      console.log('\n===== Optimization Opportunities =====');
      opportunities.slice(0, 5).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.url || opp.name}: ${opp.totalBytes ? formatBytes(opp.totalBytes) : ''}`);
      });
    }

    return data;
  } catch (error) {
    console.error('Error running PageSpeed Insights:', error.message);
    return null;
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


/**
 * Main function to run the script
 */
async function main() {
  try {
    const { url, device } = parseArgs();
    
    console.log(`${colors.blue}Analyzing ${colors.yellow}${url}${colors.blue} for ${colors.yellow}${device}${colors.blue} devices...${colors.reset}`);
    console.log(`${colors.cyan}This may take a minute or two. Please wait...${colors.reset}`);
    
    const results = await runPageSpeedInsights(url, device);
    
    // Display results (simplified from original for brevity and clarity)
    if (results) {
        console.log(`\n${colors.bold}${colors.blue}=== PageSpeed Insights Results ===${colors.reset}\n`);
        console.log(`Performance Score: ${Math.round(results.lighthouseResult.categories.performance.score * 100)}%`);
    }

  } catch (error) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();