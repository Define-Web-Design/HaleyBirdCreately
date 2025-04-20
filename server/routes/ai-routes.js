/**
 * AI Service API Routes
 * 
 * This file defines the Express routes for the unified AI service,
 * providing endpoints for text generation, JSON generation, image generation,
 * and service management.
 */

const express = require('express');
const {
  aiHandlers,
  validateAIRequest,
  checkAIAvailability,
  trackAIPerformance,
  aiRequestTimeout,
  handleAIErrors
} = require('../middleware/aiMiddleware');

const router = express.Router();

// Apply shared middleware to all AI routes
router.use(trackAIPerformance());
router.use(aiRequestTimeout(60000)); // 60-second timeout for AI requests

// Status endpoint - Public
router.get('/status', aiHandlers.getStatus);

// Text generation endpoint
router.post(
  '/generate/text',
  validateAIRequest({
    required: ['prompt'],
    maxLength: { prompt: 16000 }
  }),
  checkAIAvailability,
  aiHandlers.generateText
);

// JSON generation endpoint
router.post(
  '/generate/json',
  validateAIRequest({
    required: ['prompt'],
    maxLength: { prompt: 16000 }
  }),
  checkAIAvailability,
  aiHandlers.generateJson
);

// Image generation endpoint
router.post(
  '/generate/image',
  validateAIRequest({
    required: ['prompt'],
    maxLength: { prompt: 1000 }
  }),
  checkAIAvailability,
  aiHandlers.generateImage
);

// Admin endpoints - These should be protected in a real application
router.get('/metrics', aiHandlers.getMetrics);
router.post('/cache/clear', aiHandlers.clearCache);
router.post('/metrics/reset', aiHandlers.resetMetrics);

// Apply error handler
router.use(handleAIErrors);

module.exports = router;