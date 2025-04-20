/**
 * AI Service API Routes
 * 
 * This module provides API endpoints for interacting with integrated AI services
 * using the adapter pattern and automatic fallback strategies.
 */

import express, { Request, Response } from 'express';
import { AIService } from '../ai/aiService';
import { initializeAdapters } from '../ai/initAdapters';
import { logger } from '../utils/logger';
import { performanceMiddleware } from '../middleware/performance';

// Create router
const router = express.Router();

// Apply performance middleware with AI-specific tracking
router.use(performanceMiddleware({
  detailed: process.env.NODE_ENV !== 'production',
  sampleRate: 1.0, // Track all AI requests
  pathExclusions: [], // Track all paths in this router
  trackAiCalls: true // Enable AI-specific metric tracking
}));

// Initialize AI service with configured adapters
const adapterRegistry = await initializeAdapters();
const aiService = new AIService(adapterRegistry);

/**
 * GET /api/ai/status
 * Get status of all AI adapters
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = aiService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error getting AI status', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

/**
 * POST /api/ai/generate-text
 * Generate text using AI services
 */
router.post('/generate-text', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await aiService.generateText(prompt, options);
    res.json(result);
  } catch (error) {
    logger.error('Error generating text', {
      error: error instanceof Error ? error.message : String(error),
      prompt: req.body.prompt?.substring(0, 100)
    });
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

/**
 * POST /api/ai/generate-json
 * Generate structured JSON data using AI services
 */
router.post('/generate-json', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await aiService.generateJson(prompt, options);
    res.json(result);
  } catch (error) {
    logger.error('Error generating JSON', {
      error: error instanceof Error ? error.message : String(error),
      prompt: req.body.prompt?.substring(0, 100)
    });
    res.status(500).json({ error: 'Failed to generate JSON' });
  }
});

/**
 * POST /api/ai/chat
 * Generate chat completions using AI services
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, options = {} } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }
    
    const result = await aiService.chatCompletion(messages, options);
    res.json(result);
  } catch (error) {
    logger.error('Error generating chat completion', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to generate chat completion' });
  }
});

/**
 * POST /api/ai/generate-image
 * Generate an image from text prompt using AI services
 */
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await aiService.generateImage(prompt, options);
    res.json(result);
  } catch (error) {
    logger.error('Error generating image', {
      error: error instanceof Error ? error.message : String(error),
      prompt: req.body.prompt?.substring(0, 100)
    });
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

/**
 * POST /api/ai/analyze-image
 * Analyze an image using AI services
 */
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl, base64Image, prompt, options = {} } = req.body;
    
    if (!imageUrl && !base64Image) {
      return res.status(400).json({ error: 'Either imageUrl or base64Image is required' });
    }
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await aiService.analyzeImage({
      imageUrl,
      base64Image,
      prompt,
      ...options
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error analyzing image', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

/**
 * POST /api/ai/embed
 * Generate embeddings for text using AI services
 */
router.post('/embed', async (req: Request, res: Response) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await aiService.generateEmbedding(text, options);
    res.json(result);
  } catch (error) {
    logger.error('Error generating embedding', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

export default router;