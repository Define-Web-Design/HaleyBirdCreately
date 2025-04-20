/**
 * AI Service API Routes
 * 
 * This module defines Express routes for AI service operations,
 * providing REST endpoints for text generation, chat, image generation, etc.
 */

import express, { Request, Response } from 'express';
import { AIService } from '../ai/aiService';
import { logger } from '../utils/logger';
import { performanceMiddleware } from '../middleware/performance';
import { initializeAdapters } from '../ai/initAdapters';

// Create router
const router = express.Router();

// Add performance monitoring middleware
router.use(performanceMiddleware({ trackAiCalls: true }));

// Initialize AI adapters
let adaptersInitialized = false;
async function ensureAdaptersInitialized() {
  if (!adaptersInitialized) {
    adaptersInitialized = await initializeAdapters();
    if (!adaptersInitialized) {
      logger.warn('Failed to initialize AI adapters');
    }
  }
  return adaptersInitialized;
}

/**
 * GET /api/ai/status
 * Get status of all AI providers
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    await ensureAdaptersInitialized();
    const status = AIService.getProviderStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error getting AI provider status', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to get AI provider status',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/ai/metrics
 * Get performance metrics for all AI providers
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    await ensureAdaptersInitialized();
    const metrics = AIService.getProviderMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting AI provider metrics', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to get AI provider metrics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/reset-metrics
 * Reset performance metrics for all AI providers
 */
router.post('/reset-metrics', async (req: Request, res: Response) => {
  try {
    await ensureAdaptersInitialized();
    AIService.resetAllMetrics();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error resetting AI provider metrics', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to reset AI provider metrics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/generate-text
 * Generate text with the best available AI provider
 */
router.post('/generate-text', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const text = await AIService.generateText(prompt, options);
    
    res.json({ text });
  } catch (error) {
    logger.error('Error generating text', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to generate text',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/generate-json
 * Generate JSON data with the best available AI provider
 */
router.post('/generate-json', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const data = await AIService.generateJson(prompt, options);
    
    res.json({ data });
  } catch (error) {
    logger.error('Error generating JSON', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to generate JSON',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/chat
 * Get chat completion with the best available AI provider
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, options = {} } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const response = await AIService.chatCompletion(messages, options);
    
    res.json({ response });
  } catch (error) {
    logger.error('Error getting chat completion', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to get chat completion',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/generate-image
 * Generate image with the best available AI provider
 */
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const imageData = await AIService.generateImage({
      prompt,
      ...options
    });
    
    res.json({ imageData });
  } catch (error) {
    logger.error('Error generating image', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/analyze-image
 * Analyze image with the best available AI provider
 */
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { base64Image, prompt, options = {} } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const analysis = await AIService.analyzeImage(base64Image, prompt, options);
    
    res.json({ analysis });
  } catch (error) {
    logger.error('Error analyzing image', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai/embeddings
 * Get embeddings for text with the best available AI provider
 */
router.post('/embeddings', async (req: Request, res: Response) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    await ensureAdaptersInitialized();
    
    const embeddings = await AIService.getEmbeddings(text, options);
    
    res.json({ embeddings });
  } catch (error) {
    logger.error('Error getting embeddings', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      error: 'Failed to get embeddings',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;