import fetch from 'node-fetch';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

dotenv.config();

// The API key should be stored in .env
const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY || '';

interface PageSpeedOptions {
  url?: string;
  strategy?: 'mobile' | 'desktop';
  category?: string[];
  locale?: string;
}

interface ApiKeyValidationResult {
  valid: boolean;
  message?: string;
}

interface ResultFileInfo {
  jsonFilename: string;
  summaryFilename: string;
}

class PageSpeedService {
  private logDir: string;

  constructor() {
    // Create logs directory for PageSpeed results if it doesn't exist
    this.logDir = path.join(process.cwd(), 'logs', 'pagespeed');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  async analyzeUrl(options: PageSpeedOptions = {}): Promise<any> {
    try {
      const { 
        url = process.env.APP_URL || 'https://creatively.repl.co',
        strategy = 'mobile',
        category = ['performance', 'accessibility', 'best-practices', 'seo'],
        locale = 'en'
      } = options;

      // Validate API key is available
      if (!apiKey) {
        logger.error('PageSpeed API key is missing');
        throw new Error('PageSpeed API key is missing');
      }

      // Build the API URL
      const apiUrl = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed');

      // Add parameters
      apiUrl.searchParams.append('url', url);
      apiUrl.searchParams.append('strategy', strategy);
      category.forEach(cat => apiUrl.searchParams.append('category', cat));
      apiUrl.searchParams.append('locale', locale);
      apiUrl.searchParams.append('key', apiKey);

      logger.info(`Running PageSpeed analysis for ${url} (${strategy})`);

      // Make the API request
      const response = await fetch(apiUrl.toString());

      if (!response.ok) {
        const error = await response.text();
        logger.error(`PageSpeed API error: ${error}`);
        throw new Error(`API Error: ${error}`);
      }

      const data = await response.json();

      // Log the results
      this.logResults(data, strategy);

      return data;
    } catch (error) {
      logger.error('PageSpeed analysis failed:', error);
      throw error;
    }
  }

  private logResults(data: any, strategy: string): void {
    try {
      // Create a timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `pagespeed-${strategy}-${timestamp}.json`;
      const filePath = path.join(this.logDir, filename);

      // Write the results to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      logger.info(`PageSpeed results saved to ${filePath}`);
    } catch (error) {
      logger.error('Failed to log PageSpeed results:', error);
    }
  }

  /**
   * Run PageSpeed analysis for a URL on a specific device
   */
  async runPageSpeedAnalysis(url: string, device: 'mobile' | 'desktop' = 'mobile'): Promise<any> {
    console.log(`Running PageSpeed analysis for ${url} on ${device}`);
    return this.analyzeUrl({
      url,
      strategy: device
    });
  }

  /**
   * Save PageSpeed results to files
   */
  saveResults(results: any, url: string, device: string): ResultFileInfo | null {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const domain = new URL(url).hostname;
      const jsonFilename = `pagespeed-${domain}-${device}-${timestamp}.json`;
      const summaryFilename = `pagespeed-${domain}-${device}-${timestamp}-summary.json`;
      
      const jsonPath = path.join(this.logDir, jsonFilename);
      const summaryPath = path.join(this.logDir, summaryFilename);
      
      // Save full results
      fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
      
      // Create and save summary
      const summary = this.createSummary(results);
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      return { jsonFilename, summaryFilename };
    } catch (error) {
      logger.error('Failed to save PageSpeed results:', error);
      return null;
    }
  }

  /**
   * Create a summary of the PageSpeed results
   */
  private createSummary(results: any): any {
    try {
      // Extract the most important metrics
      const { lighthouseResult } = results;
      
      if (!lighthouseResult) {
        return { error: 'No lighthouse results found' };
      }
      
      const { categories, audits } = lighthouseResult;
      
      return {
        scores: {
          performance: categories.performance?.score || 0,
          accessibility: categories.accessibility?.score || 0,
          bestPractices: categories['best-practices']?.score || 0,
          seo: categories.seo?.score || 0,
          pwa: categories.pwa?.score || 0
        },
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint']?.displayValue,
          largestContentfulPaint: audits['largest-contentful-paint']?.displayValue,
          totalBlockingTime: audits['total-blocking-time']?.displayValue,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue,
          speedIndex: audits['speed-index']?.displayValue,
          interactive: audits['interactive']?.displayValue
        }
      };
    } catch (error) {
      logger.error('Failed to create PageSpeed summary:', error);
      return { error: 'Failed to create summary' };
    }
  }

  /**
   * Format the PageSpeed results for API response
   */
  formatAnalysisForResponse(results: any): any {
    try {
      const { lighthouseResult } = results;
      
      if (!lighthouseResult) {
        return { error: 'No lighthouse results found' };
      }
      
      const { categories, audits, configSettings } = lighthouseResult;
      
      // Format the response
      return {
        url: results.loadingExperience?.id || '',
        fetchTime: results.analysisUTCTimestamp || new Date().toISOString(),
        device: configSettings?.emulatedFormFactor || 'unknown',
        scores: {
          performance: Math.round((categories.performance?.score || 0) * 100),
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100)
        },
        metrics: {
          firstContentfulPaint: {
            value: audits['first-contentful-paint']?.numericValue,
            displayValue: audits['first-contentful-paint']?.displayValue
          },
          largestContentfulPaint: {
            value: audits['largest-contentful-paint']?.numericValue,
            displayValue: audits['largest-contentful-paint']?.displayValue
          },
          totalBlockingTime: {
            value: audits['total-blocking-time']?.numericValue,
            displayValue: audits['total-blocking-time']?.displayValue
          },
          cumulativeLayoutShift: {
            value: audits['cumulative-layout-shift']?.numericValue,
            displayValue: audits['cumulative-layout-shift']?.displayValue
          },
          speedIndex: {
            value: audits['speed-index']?.numericValue,
            displayValue: audits['speed-index']?.displayValue
          },
          interactive: {
            value: audits['interactive']?.numericValue,
            displayValue: audits['interactive']?.displayValue
          }
        }
      };
    } catch (error) {
      logger.error('Failed to format PageSpeed results:', error);
      return { error: 'Failed to format results' };
    }
  }

  /**
   * Validate if the API key is valid
   */
  async validateApiKey(): Promise<ApiKeyValidationResult> {
    if (!apiKey || apiKey.trim() === '') {
      return { 
        valid: false, 
        message: 'API key is missing. Please provide a valid API key in the .env file.' 
      };
    }

    try {
      // Test the API with a simple request to google.com
      const testUrl = 'https://www.google.com';
      const apiUrl = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed');
      
      apiUrl.searchParams.append('url', testUrl);
      apiUrl.searchParams.append('strategy', 'mobile');
      apiUrl.searchParams.append('category', 'performance');
      apiUrl.searchParams.append('key', apiKey);
      
      logger.info('Validating PageSpeed API key');
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`PageSpeed API key validation failed: ${errorText}`);
        return { 
          valid: false, 
          message: errorText 
        };
      }
      
      return { valid: true };
    } catch (error: any) {
      logger.error('PageSpeed API key validation error:', error);
      return { 
        valid: false, 
        message: error.message || 'Unknown error validating API key' 
      };
    }
  }
}

const pageSpeedService = new PageSpeedService();

export default pageSpeedService;