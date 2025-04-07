#!/usr/bin/env node

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

const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// Default configuration
const config = {
  apiKey: process.env.PAGESPEED_API_KEY || '', // Optional API key
  outputDir: path.join(process.cwd(), 'logs', 'pagespeed'),
  timeStamp: new Date().toISOString().replace(/:/g, '-').slice(0, 19),
};

// Ensure logs directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`${colors.bright}${colors.yellow}Usage:${colors.reset} node pagespeed-insights.js URL [device]`);
    console.log(`${colors.dim}Example: node pagespeed-insights.js https://example.com mobile${colors.reset}`);
    process.exit(1);
  }
  
  return {
    url: args[0],
    device: args[1] || 'mobile' // Default to mobile
  };
}

/**
 * Run PageSpeed Insights analysis
 */
async function runPageSpeedAnalysis(url, device = 'mobile') {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.bright}${colors.blue}Analyzing ${url} for ${device}...${colors.reset}\n`);
    
    // Construct API URL
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${device}${config.apiKey ? `&key=${config.apiKey}` : ''}`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`API Error: ${result.error.message}`));
            return;
          }
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
  });
}

/**
 * Format and display the analysis results
 */
function displayResults(results) {
  // Extract lighthouse results
  const lighthouse = results.lighthouseResult;
  const categories = lighthouse.categories;
  const audits = lighthouse.audits;
  
  // Display overall scores
  console.log(`${colors.bright}${colors.magenta}=== Performance Overview ====${colors.reset}\n`);
  
  Object.keys(categories).forEach(key => {
    const category = categories[key];
    const score = Math.round(category.score * 100);
    let color = colors.red;
    
    if (score >= 90) color = colors.green;
    else if (score >= 50) color = colors.yellow;
    
    console.log(`${category.title}: ${color}${score}${colors.reset} / 100`);
  });
  
  // Display Core Web Vitals
  console.log(`\n${colors.bright}${colors.cyan}=== Core Web Vitals ====${colors.reset}\n`);
  
  const coreVitals = [
    { id: 'first-contentful-paint', name: 'First Contentful Paint (FCP)' },
    { id: 'largest-contentful-paint', name: 'Largest Contentful Paint (LCP)' },
    { id: 'cumulative-layout-shift', name: 'Cumulative Layout Shift (CLS)' },
    { id: 'total-blocking-time', name: 'Total Blocking Time (TBT)' },
    { id: 'speed-index', name: 'Speed Index' },
    { id: 'interactive', name: 'Time to Interactive' }
  ];
  
  coreVitals.forEach(vital => {
    const audit = audits[vital.id];
    if (audit) {
      const score = Math.round(audit.score * 100) || 0;
      let color = colors.red;
      
      if (score >= 90) color = colors.green;
      else if (score >= 50) color = colors.yellow;
      
      console.log(`${vital.name}: ${color}${audit.displayValue || 'N/A'}${colors.reset} (Score: ${color}${score}${colors.reset})`);
    }
  });
  
  // Display top optimization opportunities
  console.log(`\n${colors.bright}${colors.yellow}=== Top Opportunities ====${colors.reset}\n`);
  
  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 1)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5);
  
  if (opportunities.length === 0) {
    console.log(`${colors.green}No significant opportunities found!${colors.reset}`);
  } else {
    opportunities.forEach((opportunity, index) => {
      const score = Math.round((opportunity.score || 0) * 100);
      let color = colors.red;
      
      if (score >= 90) color = colors.green;
      else if (score >= 50) color = colors.yellow;
      
      console.log(`${index + 1}. ${colors.bright}${opportunity.title}${colors.reset} (Score: ${color}${score}${colors.reset})`);
      console.log(`   ${colors.dim}${opportunity.description}${colors.reset}`);
      
      if (opportunity.displayValue) {
        console.log(`   Potential savings: ${colors.cyan}${opportunity.displayValue}${colors.reset}`);
      }
      console.log('');
    });
  }
  
  // Display diagnostics
  console.log(`\n${colors.bright}${colors.blue}=== Diagnostics ====${colors.reset}\n`);
  
  const diagnostics = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'diagnostic' && audit.score !== null && audit.score < 1)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5);
  
  if (diagnostics.length === 0) {
    console.log(`${colors.green}No significant diagnostic issues found!${colors.reset}`);
  } else {
    diagnostics.forEach((diagnostic, index) => {
      const score = Math.round((diagnostic.score || 0) * 100);
      let color = colors.red;
      
      if (score >= 90) color = colors.green;
      else if (score >= 50) color = colors.yellow;
      
      console.log(`${index + 1}. ${colors.bright}${diagnostic.title}${colors.reset} (Score: ${color}${score}${colors.reset})`);
      console.log(`   ${colors.dim}${diagnostic.description}${colors.reset}\n`);
    });
  }
}

/**
 * Save the analysis results to a file
 */
function saveResults(results, url, device) {
  const filename = `pagespeed-${device}-${config.timeStamp}.json`;
  const filePath = path.join(config.outputDir, filename);
  
  // Create a summary file for quick reference
  const summaryFilename = `pagespeed-summary-${device}-${config.timeStamp}.txt`;
  const summaryFilePath = path.join(config.outputDir, summaryFilename);
  
  try {
    // Save full JSON results
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    
    // Save readable summary
    const lighthouse = results.lighthouseResult;
    const categories = lighthouse.categories;
    
    let summary = `PageSpeed Insights Analysis Summary\n`;
    summary += `====================================\n\n`;
    summary += `URL: ${url}\n`;
    summary += `Device: ${device}\n`;
    summary += `Date: ${new Date().toISOString()}\n\n`;
    summary += `Overall Scores:\n`;
    
    Object.keys(categories).forEach(key => {
      const category = categories[key];
      const score = Math.round(category.score * 100);
      summary += `${category.title}: ${score} / 100\n`;
    });
    
    fs.writeFileSync(summaryFilePath, summary);
    
    console.log(`\n${colors.bright}${colors.green}Results saved:${colors.reset}`);
    console.log(`- Full details: ${colors.cyan}${filePath}${colors.reset}`);
    console.log(`- Summary: ${colors.cyan}${summaryFilePath}${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Failed to save results: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    const { url, device } = parseArgs();
    const results = await runPageSpeedAnalysis(url, device);
    displayResults(results);
    saveResults(results, url, device);
    
    console.log(`\n${colors.bright}${colors.green}Analysis completed successfully!${colors.reset}`);
    console.log(`${colors.dim}Run this script periodically to track performance improvements.${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.bright}${colors.bgRed}Error:${colors.reset} ${colors.red}${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the script
main();