/**
 * Web Crawler Routes
 * Provides API endpoints for web crawling and color extraction
 */

import { Router } from 'express';
import { extractColorsFromWebsite } from '../services/webCrawler';
import { WebCrawlingRequest } from '../../shared/types/webCrawler';

const router = Router();

/**
 * Extract colors from a website
 * POST /api/web-crawler/extract-colors
 */
router.post('/extract-colors', async (req, res) => {
  try {
    const { url, options = {} } = req.body as WebCrawlingRequest;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }
    
    console.log(`Processing web crawling request for URL: ${url}`);
    const result = await extractColorsFromWebsite(url);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in web crawler route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred during web crawling' 
    });
  }
});

/**
 * Health check route
 * GET /api/web-crawler/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'web-crawler',
    timestamp: new Date().toISOString()
  });
});

export default router;