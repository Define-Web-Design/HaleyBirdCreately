import https from 'https';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs', 'pagespeed');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Validate that the PageSpeed Insights API key is available and valid
 */
export function validateApiKey() {
  const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY;
  
  if (!apiKey) {
    logger.warn('PageSpeed Insights API key is missing. Please set the PAGESPEED_INSIGHTS_API_KEY environment variable.');
    return { valid: false, message: 'API key not found in environment variables' };
  }
  
  if (apiKey.length < 10) {
    logger.warn('PageSpeed Insights API key appears to be invalid (too short).');
    return { valid: false, message: 'API key is invalid (too short)' };
  }
  
  return { valid: true };
}

/**
 * Run PageSpeed Insights analysis
 */
export async function runPageSpeedAnalysis(url: string, device: 'mobile' | 'desktop' = 'mobile') {
  return new Promise((resolve, reject) => {
    // Get API key from environment with validation
    const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY;
    const keyValidation = validateApiKey();
    
    if (!keyValidation.valid) {
      reject(new Error(`API key not valid. ${keyValidation.message}`));
      return;
    }

    logger.info(`Running PageSpeed analysis for ${url} on ${device}`);
    
    // Build API request URL
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${device}&key=${apiKey}`;
    
    // Add timeout to prevent hanging requests
    const req = https.get(apiUrl, { timeout: 30000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          try {
            const error = JSON.parse(data);
            const errorMessage = error.error?.message || `HTTP Error: ${res.statusCode}`;
            logger.error(`PageSpeed API error: ${errorMessage}`);
            reject(new Error(`API Error: ${errorMessage}`));
          } catch (e) {
            logger.error(`PageSpeed API HTTP error: ${res.statusCode}`);
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
          return;
        }
        
        try {
          const results = JSON.parse(data);
          logger.info(`PageSpeed analysis completed successfully for ${url}`);
          resolve(results);
        } catch (e) {
          const errorMsg = `Failed to parse API response: ${e instanceof Error ? e.message : String(e)}`;
          logger.error(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    });
    
    req.on('error', (e) => {
      const errorMsg = `Request failed: ${e.message}`;
      logger.error(errorMsg);
      reject(new Error(errorMsg));
    });
    
    req.on('timeout', () => {
      logger.error(`PageSpeed API request timed out for ${url}`);
      req.destroy();
      reject(new Error('Request timed out after 30 seconds'));
    });
  });
}

interface AuditItem {
  score?: number;
  title: string;
  description: string;
  displayValue?: string;
  numericValue?: number;
  details?: {
    type: string;
    [key: string]: any;
  };
}

interface LighthouseResult {
  categories: {
    [key: string]: {
      title: string;
      score: number;
    }
  };
  audits: {
    [key: string]: AuditItem;
  };
}

interface PageSpeedResult {
  lighthouseResult: LighthouseResult;
}

/**
 * Save the analysis results to a file
 */
export function saveResults(results: PageSpeedResult, url: string, device: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  try {
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
    summary += `- Largest Contentful Paint: ${lcp.displayValue || 'N/A'}\n`;
    
    // CLS - Cumulative Layout Shift
    const cls = audits['cumulative-layout-shift'];
    summary += `- Cumulative Layout Shift: ${cls.displayValue || 'N/A'}\n`;
    
    // FID/TBT - First Input Delay / Total Blocking Time
    const tbt = audits['total-blocking-time'];
    summary += `- Total Blocking Time: ${tbt.displayValue || 'N/A'}\n`;
    
    // Add top opportunities
    summary += `\n## Top Opportunities for Improvement\n\n`;
    
    const opportunities = Object.values(audits)
      .filter((audit: AuditItem) => 
        audit.details && 
        audit.details.type === 'opportunity' && 
        audit.numericValue !== undefined
      )
      .sort((a: AuditItem, b: AuditItem) => 
        (b.numericValue || 0) - (a.numericValue || 0)
      )
      .slice(0, 10);
    
    if (opportunities.length === 0) {
      summary += `- No specific opportunities identified.\n`;
    } else {
      opportunities.forEach((opportunity: AuditItem, index: number) => {
        summary += `${index + 1}. ${opportunity.title}\n`;
        summary += `   Potential saving: ${opportunity.displayValue || 'N/A'}\n`;
      });
    }
    
    // Add diagnostics
    summary += `\n## Diagnostics\n\n`;
    
    const diagnostics = Object.values(audits)
      .filter((audit: AuditItem) => 
        audit.details && 
        audit.details.type === 'diagnostic' && 
        !audit.score
      )
      .slice(0, 10);
    
    if (diagnostics.length === 0) {
      summary += `- No specific diagnostics to report.\n`;
    } else {
      diagnostics.forEach((diagnostic: AuditItem, index: number) => {
        summary += `${index + 1}. ${diagnostic.title}\n`;
        if (diagnostic.displayValue) {
          summary += `   ${diagnostic.displayValue}\n`;
        }
      });
    }
    
    // Add passed audits (strengths)
    summary += `\n## Strengths (Passed Audits)\n\n`;
    
    const strengths = Object.values(audits)
      .filter((audit: AuditItem) => audit.score === 1)
      .slice(0, 10);
    
    if (strengths.length === 0) {
      summary += `- No specific strengths to report.\n`;
    } else {
      strengths.forEach((strength: AuditItem, index: number) => {
        summary += `${index + 1}. ${strength.title}\n`;
      });
    }
    
    // Save the summary
    const summaryFilename = `pagespeed-summary-${device}-${hostname}-${timestamp}.txt`;
    const summaryPath = path.join(LOGS_DIR, summaryFilename);
    fs.writeFileSync(summaryPath, summary);
    
    return { jsonPath, summaryPath, jsonFilename, summaryFilename };
  } catch (error) {
    console.error('Error saving results:', error);
    return null;
  }
}

/**
 * Format analysis results for API response
 */
export function formatAnalysisForResponse(results: PageSpeedResult) {
  const { lighthouseResult } = results;
  const { categories, audits } = lighthouseResult;
  
  // Format scores
  const scores: Record<string, number> = {};
  for (const [category, data] of Object.entries(categories)) {
    scores[category] = data.score;
  }
  
  // Format core vitals
  const coreVitals: Record<string, { value: string, description: string }> = {
    'Largest Contentful Paint (LCP)': {
      value: audits['largest-contentful-paint'].displayValue || 'N/A',
      description: audits['largest-contentful-paint'].description
    },
    'Cumulative Layout Shift (CLS)': {
      value: audits['cumulative-layout-shift'].displayValue || 'N/A',
      description: audits['cumulative-layout-shift'].description
    },
    'Total Blocking Time (TBT)': {
      value: audits['total-blocking-time'].displayValue || 'N/A',
      description: audits['total-blocking-time'].description
    }
  };
  
  // Format opportunities
  const opportunities = Object.values(audits)
    .filter((audit: AuditItem) => 
      audit.details && 
      audit.details.type === 'opportunity' && 
      audit.numericValue !== undefined
    )
    .sort((a: AuditItem, b: AuditItem) => 
      (b.numericValue || 0) - (a.numericValue || 0)
    )
    .slice(0, 5)
    .map((opportunity: AuditItem) => ({
      title: opportunity.title,
      description: opportunity.description,
      impact: opportunity.numericValue,
      displayValue: opportunity.displayValue || 'N/A'
    }));
  
  return {
    scores,
    coreVitals,
    opportunities,
    timestamp: new Date().toISOString()
  };
}