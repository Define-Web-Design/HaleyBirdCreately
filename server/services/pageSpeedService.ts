
import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';
import { log } from '../utils/logger';

interface PageSpeedResult {
  score: number;
  loadingSpeed: number;
  recommendations: string[];
  timestamp: string;
}

class PageSpeedService {
  private apiKey: string;
  private logDir: string;

  constructor() {
    this.apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY || '';
    this.logDir = path.join(process.cwd(), 'logs', 'pagespeed');
    
    // Ensure log directory exists
    this.ensureLogDir();
  }

  private async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      log.error(new Error('Failed to create PageSpeed logs directory'), { error });
    }
  }

  async analyzeUrl(url: string, isMobile: boolean = false): Promise<PageSpeedResult> {
    log.info(`Running PageSpeed analysis for ${url} (mobile: ${isMobile})`);
    
    try {
      if (!this.apiKey) {
        log.warn('PageSpeed API key not set');
        throw new Error('PageSpeed API key not configured');
      }

      const strategy = isMobile ? 'mobile' : 'desktop';
      const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${this.apiKey}`;
      
      const response = await this.makeApiRequest(apiUrl);
      
      // Parse the response
      const result = this.parsePageSpeedResponse(response, isMobile);
      
      // Log the result
      await this.logResult(url, result, isMobile);
      
      return result;
    } catch (error) {
      log.error(new Error('PageSpeed analysis failed'), { url, error });
      throw error;
    }
  }

  private makeApiRequest(apiUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(new Error(`Failed to parse PageSpeed API response: ${error}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`PageSpeed API request failed: ${error.message}`));
      });
    });
  }

  private parsePageSpeedResponse(response: any, isMobile: boolean): PageSpeedResult {
    try {
      // Extract the performance score
      const lighthouseResult = response.lighthouseResult;
      const categories = lighthouseResult.categories;
      const performanceScore = Math.round(categories.performance.score * 100);
      
      // Extract loading speed (FCP)
      const audits = lighthouseResult.audits;
      const fcpMetric = audits['first-contentful-paint'];
      const loadingSpeed = fcpMetric ? parseFloat(fcpMetric.displayValue.split(' ')[0]) : 0;
      
      // Extract recommendations
      const opportunities = Object.values(audits)
        .filter((audit: any) => audit.details && audit.details.type === 'opportunity')
        .map((audit: any) => audit.title);
      
      return {
        score: performanceScore,
        loadingSpeed,
        recommendations: opportunities,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      log.error(new Error('Failed to parse PageSpeed response'), { error });
      return {
        score: 0,
        loadingSpeed: 0,
        recommendations: ['Failed to parse PageSpeed results'],
        timestamp: new Date().toISOString()
      };
    }
  }

  private async logResult(url: string, result: PageSpeedResult, isMobile: boolean) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${timestamp}_${isMobile ? 'mobile' : 'desktop'}_${Buffer.from(url).toString('base64').slice(0, 10)}.json`;
      
      await fs.writeFile(
        path.join(this.logDir, fileName),
        JSON.stringify({ url, ...result }, null, 2)
      );
    } catch (error) {
      log.error(new Error('Failed to log PageSpeed result'), { error });
    }
  }
}

export const pageSpeedService = new PageSpeedService();
