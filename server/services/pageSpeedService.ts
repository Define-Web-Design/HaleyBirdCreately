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
        throw new Error(`PageSpeed API error: ${response.statusText}`);
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
}

export default new PageSpeedService();