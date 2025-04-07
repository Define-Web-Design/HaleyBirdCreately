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
 * - An internet connection to access PageSpeed Insights API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
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
async function runPageSpeedAnalysis(url, device = 'mobile') {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(new Error('PageSpeed Insights API key is missing. Please set the PAGESPEED_INSIGHTS_API_KEY environment variable.'));
      return;
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${device}&key=${API_KEY}`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          try {
            const error = JSON.parse(data);
            reject(new Error(`API Error: ${error.error.message}`));
          } catch (e) {
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
          return;
        }
        
        try {
          const results = JSON.parse(data);
          resolve(results);
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });
  });
}

/**
 * Format a score (0-1) into a human-readable format with color
 */
function formatScore(score) {
  if (score >= 0.9) {
    return `${colors.green}${Math.round(score * 100)}${colors.reset}`; // Good
  } else if (score >= 0.5) {
    return `${colors.yellow}${Math.round(score * 100)}${colors.reset}`; // Needs Improvement
  } else {
    return `${colors.red}${Math.round(score * 100)}${colors.reset}`; // Poor
  }
}

/**
 * Format and display the analysis results
 */
function displayResults(results) {
  const { lighthouseResult } = results;
  const { categories, audits } = lighthouseResult;
  
  // Display overall scores
  console.log(`\n${colors.bold}${colors.blue}=== PageSpeed Insights Results ===${colors.reset}\n`);
  
  console.log(`${colors.bold}Overall Scores (out of 100):${colors.reset}`);
  for (const [category, data] of Object.entries(categories)) {
    console.log(`- ${data.title}: ${formatScore(data.score)}`);
  }
  
  // Display Core Web Vitals
  console.log(`\n${colors.bold}Core Web Vitals:${colors.reset}`);
  
  // LCP - Largest Contentful Paint
  const lcp = audits['largest-contentful-paint'];
  console.log(`- Largest Contentful Paint: ${lcp.displayValue}`);
  console.log(`  ${lcp.description}`);
  
  // CLS - Cumulative Layout Shift
  const cls = audits['cumulative-layout-shift'];
  console.log(`- Cumulative Layout Shift: ${cls.displayValue}`);
  console.log(`  ${cls.description}`);
  
  // FID/TBT - First Input Delay / Total Blocking Time
  const tbt = audits['total-blocking-time'];
  console.log(`- Total Blocking Time: ${tbt.displayValue}`);
  console.log(`  ${tbt.description}`);
  
  // Display top opportunities for improvement
  console.log(`\n${colors.bold}Top Opportunities for Improvement:${colors.reset}`);
  
  // Filter opportunities that have "numericValue" and sort by highest impact
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.numericValue)
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, 5);
  
  if (opportunities.length === 0) {
    console.log('- No specific opportunities identified.');
  } else {
    opportunities.forEach((opportunity, index) => {
      console.log(`${index + 1}. ${opportunity.title}`);
      console.log(`   Potential saving: ${opportunity.displayValue}`);
    });
  }
  
  // Display diagnostics
  console.log(`\n${colors.bold}Diagnostics:${colors.reset}`);
  
  const diagnostics = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'diagnostic' && !audit.score)
    .slice(0, 5);
  
  if (diagnostics.length === 0) {
    console.log('- No specific diagnostics to report.');
  } else {
    diagnostics.forEach((diagnostic, index) => {
      console.log(`${index + 1}. ${diagnostic.title}`);
      if (diagnostic.displayValue) {
        console.log(`   ${diagnostic.displayValue}`);
      }
    });
  }
  
  // Display passed audits (strengths)
  console.log(`\n${colors.bold}Strengths (Passed Audits):${colors.reset}`);
  
  const strengths = Object.values(audits)
    .filter(audit => audit.score === 1)
    .slice(0, 5);
  
  if (strengths.length === 0) {
    console.log('- No specific strengths to report.');
  } else {
    strengths.forEach((strength, index) => {
      console.log(`${index + 1}. ${strength.title}`);
    });
  }
  
  console.log(`\n${colors.blue}Complete results saved to logs/pagespeed directory${colors.reset}`);
}

/**
 * Save the analysis results to a file
 */
function saveResults(results, url, device) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const hostname = new URL(url).hostname;
  
  // Save the full JSON result
  const jsonFilename = `pagespeed-${device}-${hostname}-${timestamp}.json`;
  const jsonPath = path.join(LOGS_DIR, jsonFilename);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  // Create a more readable summary
  const { lighthouseResult } = results;
  const { categories, audits } = lighthouseResult;
  
  let summary = `# PageSpeed Insights Analysis\n\n`;
  summary += `URL: ${url}\n`;
  summary += `Device: ${device}\n`;
  summary += `Date: ${new Date().toLocaleString()}\n\n`;
  
  // Add overall scores
  summary += `## Overall Scores\n\n`;
  for (const [category, data] of Object.entries(categories)) {
    summary += `- ${data.title}: ${Math.round(data.score * 100)}/100\n`;
  }
  
  // Add Core Web Vitals
  summary += `\n## Core Web Vitals\n\n`;
  
  // LCP - Largest Contentful Paint
  const lcp = audits['largest-contentful-paint'];
  summary += `- Largest Contentful Paint: ${lcp.displayValue}\n`;
  
  // CLS - Cumulative Layout Shift
  const cls = audits['cumulative-layout-shift'];
  summary += `- Cumulative Layout Shift: ${cls.displayValue}\n`;
  
  // FID/TBT - First Input Delay / Total Blocking Time
  const tbt = audits['total-blocking-time'];
  summary += `- Total Blocking Time: ${tbt.displayValue}\n`;
  
  // Add top opportunities
  summary += `\n## Top Opportunities for Improvement\n\n`;
  
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.numericValue)
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, 10);
  
  if (opportunities.length === 0) {
    summary += `- No specific opportunities identified.\n`;
  } else {
    opportunities.forEach((opportunity, index) => {
      summary += `${index + 1}. ${opportunity.title}\n`;
      summary += `   Potential saving: ${opportunity.displayValue}\n`;
    });
  }
  
  // Add diagnostics
  summary += `\n## Diagnostics\n\n`;
  
  const diagnostics = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'diagnostic' && !audit.score)
    .slice(0, 10);
  
  if (diagnostics.length === 0) {
    summary += `- No specific diagnostics to report.\n`;
  } else {
    diagnostics.forEach((diagnostic, index) => {
      summary += `${index + 1}. ${diagnostic.title}\n`;
      if (diagnostic.displayValue) {
        summary += `   ${diagnostic.displayValue}\n`;
      }
    });
  }
  
  // Add passed audits (strengths)
  summary += `\n## Strengths (Passed Audits)\n\n`;
  
  const strengths = Object.values(audits)
    .filter(audit => audit.score === 1)
    .slice(0, 10);
  
  if (strengths.length === 0) {
    summary += `- No specific strengths to report.\n`;
  } else {
    strengths.forEach((strength, index) => {
      summary += `${index + 1}. ${strength.title}\n`;
    });
  }
  
  // Save the summary
  const summaryFilename = `pagespeed-summary-${device}-${hostname}-${timestamp}.txt`;
  const summaryPath = path.join(LOGS_DIR, summaryFilename);
  fs.writeFileSync(summaryPath, summary);
  
  return { jsonPath, summaryPath };
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    const { url, device } = parseArgs();
    
    console.log(`${colors.blue}Analyzing ${colors.yellow}${url}${colors.blue} for ${colors.yellow}${device}${colors.blue} devices...${colors.reset}`);
    console.log(`${colors.cyan}This may take a minute or two. Please wait...${colors.reset}`);
    
    const results = await runPageSpeedAnalysis(url, device);
    
    // Display results in the console
    displayResults(results);
    
    // Save results to file
    const { jsonPath, summaryPath } = saveResults(results, url, device);
    
    console.log(`\n${colors.green}Analysis complete!${colors.reset}`);
    console.log(`Full results saved to: ${jsonPath}`);
    console.log(`Summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} ${error.message}`);
    
    if (error.message.includes('API key')) {
      console.log(`\n${colors.yellow}To fix this issue:${colors.reset}`);
      console.log(`1. Make sure you have set the PAGESPEED_INSIGHTS_API_KEY in your .env file`);
      console.log(`2. Get an API key from Google Cloud Console if you don't have one: https://developers.google.com/speed/docs/insights/v5/get-started`);
    }
    
    process.exit(1);
  }
}

// Run the script
main();