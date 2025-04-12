import express from 'express';
import crypto from 'crypto';
import storage from '../storage';
import { ProgrammingLanguage } from '../../shared/schema';

const router = express.Router();

/**
 * Authentication middleware
 */
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get the auth service from registry
    const authService = req.app.get('authService');
    if (!authService) {
      return res.status(500).json({ error: 'Auth service not available' });
    }
    
    // Verify the token
    const decoded = authService.verifyToken(token);
    
    // Add the user ID to the request
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

/**
 * Optional authentication middleware - allows public access with auth if available
 */
const optionalAuthenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get the auth service from registry
    const authService = req.app.get('authService');
    if (!authService) {
      return next(); // Continue without authentication
    }
    
    // Verify the token
    const decoded = authService.verifyToken(token);
    
    // Add the user ID to the request
    req.userId = decoded.id;
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

/**
 * Create a new code snippet
 * POST /api/snippets
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, code, language, tags, isPublic = true } = req.body;
    
    if (!title || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields: title, code, and language are required' });
    }
    
    // Validate language
    if (!Object.values(ProgrammingLanguage).includes(language as ProgrammingLanguage)) {
      return res.status(400).json({ 
        error: 'Invalid language', 
        validLanguages: Object.values(ProgrammingLanguage) 
      });
    }
    
    // Create the snippet
    const snippet = await storage.createCodeSnippet({
      userId: req.userId,
      title,
      description,
      code,
      language: language as ProgrammingLanguage,
      tags: tags || [],
      isPublic: !!isPublic
    });
    
    res.status(201).json({ snippet });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to create code snippet' });
  }
});

/**
 * Get a code snippet by ID
 * GET /api/snippets/:id
 */
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the snippet
    const snippet = await storage.getCodeSnippetById(id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Check if snippet is public or belongs to the authenticated user
    if (!snippet.isPublic && (!req.userId || snippet.userId !== req.userId)) {
      return res.status(403).json({ error: 'Access denied - This snippet is private' });
    }
    
    // Increment view count if the viewer is not the owner
    if (req.userId !== snippet.userId) {
      await storage.incrementCodeSnippetViewCount(id);
    }
    
    res.json({ snippet });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Failed to retrieve code snippet' });
  }
});

/**
 * Get a code snippet by share ID
 * GET /api/snippets/share/:shareId
 */
router.get('/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    
    // Get the snippet
    const snippet = await storage.getCodeSnippetByShareId(shareId);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Check if snippet is public
    if (!snippet.isPublic) {
      return res.status(403).json({ error: 'Access denied - This snippet is private' });
    }
    
    // Increment view count
    await storage.incrementCodeSnippetViewCount(snippet.id);
    
    res.json({ snippet });
  } catch (error) {
    console.error('Get snippet by share ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve code snippet' });
  }
});

/**
 * Get all code snippets for the authenticated user
 * GET /api/snippets
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get the snippets
    const snippets = await storage.getCodeSnippetsByUserId(req.userId);
    
    res.json({ snippets });
  } catch (error) {
    console.error('Get user snippets error:', error);
    res.status(500).json({ error: 'Failed to retrieve code snippets' });
  }
});

/**
 * Get all public code snippets
 * GET /api/snippets/public
 */
router.get('/public/all', async (req, res) => {
  try {
    // Get the snippets
    const snippets = await storage.getPublicCodeSnippets();
    
    res.json({ snippets });
  } catch (error) {
    console.error('Get public snippets error:', error);
    res.status(500).json({ error: 'Failed to retrieve public code snippets' });
  }
});

/**
 * Update a code snippet
 * PATCH /api/snippets/:id
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, code, language, tags, isPublic } = req.body;
    
    // Get the snippet
    const snippet = await storage.getCodeSnippetById(id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Check if the user owns the snippet
    if (snippet.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied - You do not own this snippet' });
    }
    
    // Validate language if provided
    if (language && !Object.values(ProgrammingLanguage).includes(language as ProgrammingLanguage)) {
      return res.status(400).json({ 
        error: 'Invalid language', 
        validLanguages: Object.values(ProgrammingLanguage) 
      });
    }
    
    // Update the snippet
    const updatedData: any = {};
    
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (code !== undefined) updatedData.code = code;
    if (language !== undefined) updatedData.language = language;
    if (tags !== undefined) updatedData.tags = tags;
    if (isPublic !== undefined) updatedData.isPublic = isPublic;
    
    const success = await storage.updateCodeSnippet(id, updatedData);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update code snippet' });
    }
    
    // Get the updated snippet
    const updatedSnippet = await storage.getCodeSnippetById(id);
    
    res.json({ snippet: updatedSnippet });
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Failed to update code snippet' });
  }
});

/**
 * Delete a code snippet
 * DELETE /api/snippets/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the snippet
    const snippet = await storage.getCodeSnippetById(id);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Check if the user owns the snippet
    if (snippet.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied - You do not own this snippet' });
    }
    
    // Delete the snippet
    const success = await storage.deleteCodeSnippet(id);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete code snippet' });
    }
    
    res.json({ success: true, message: 'Code snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete code snippet' });
  }
});

export default router;