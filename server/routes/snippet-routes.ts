import express from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import storage from '../storage';
import { insertCodeSnippetSchema } from '../../shared/schema';

// Router instance
const router = express.Router();

// Middleware to verify owner
const verifyOwnership = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const snippet = await storage.getCodeSnippetById(parseInt(id));
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    if (snippet.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    
    // Attach snippet to request object for use in route handler
    req.snippet = snippet;
    next();
  } catch (error) {
    console.error('Error verifying ownership:', error);
    res.status(500).json({ error: 'An error occurred while verifying ownership' });
  }
};

// Create a new code snippet
router.post('/', async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate request body
    const validationResult = insertCodeSnippetSchema.safeParse({
      ...req.body,
      userId: req.user.id
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: validationResult.error.format()
      });
    }
    
    // Create the code snippet
    const snippet = await storage.createCodeSnippet(validationResult.data);
    
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Error creating code snippet:', error);
    res.status(500).json({ error: 'An error occurred while creating the code snippet' });
  }
});

// Get code snippet by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const snippet = await storage.getCodeSnippetById(parseInt(id));
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Check if snippet is private and user is authorized to view it
    if (!snippet.isPublic && (!req.user || (req.user.id !== snippet.userId && req.user.role !== 'admin'))) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    
    // Increment view count
    await storage.incrementCodeSnippetViewCount(snippet.id);
    
    res.json(snippet);
  } catch (error) {
    console.error('Error getting code snippet:', error);
    res.status(500).json({ error: 'An error occurred while fetching the code snippet' });
  }
});

// Get code snippet by share ID
router.get('/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const snippet = await storage.getCodeSnippetByShareId(shareId);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }
    
    // Shared snippets are accessible to anyone
    // Increment view count
    await storage.incrementCodeSnippetViewCount(snippet.id);
    
    res.json(snippet);
  } catch (error) {
    console.error('Error getting shared code snippet:', error);
    res.status(500).json({ error: 'An error occurred while fetching the shared code snippet' });
  }
});

// Get all code snippets for current user
router.get('/user/me', async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const snippets = await storage.getCodeSnippetsByUserId(req.user.id);
    res.json(snippets);
  } catch (error) {
    console.error('Error getting user code snippets:', error);
    res.status(500).json({ error: 'An error occurred while fetching your code snippets' });
  }
});

// Get all public code snippets
router.get('/public/all', async (req, res) => {
  try {
    const snippets = await storage.getPublicCodeSnippets();
    res.json(snippets);
  } catch (error) {
    console.error('Error getting public code snippets:', error);
    res.status(500).json({ error: 'An error occurred while fetching public code snippets' });
  }
});

// Update a code snippet
router.put('/:id', verifyOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const updateSchema = insertCodeSnippetSchema.partial().omit({ userId: true, shareId: true });
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: validationResult.error.format()
      });
    }
    
    // Update the code snippet
    const updatedSnippet = await storage.updateCodeSnippet(
      parseInt(id),
      validationResult.data
    );
    
    // Verify the snippet was updated
    if (!updatedSnippet) {
      // Double-check if it exists
      const existingSnippet = await storage.getCodeSnippetById(parseInt(id));
      if (!existingSnippet) {
        return res.status(404).json({ error: 'Code snippet not found' });
      }
      return res.status(500).json({ error: 'Failed to update code snippet' });
    }
    
    res.json(updatedSnippet);
  } catch (error) {
    console.error('Error updating code snippet:', error);
    res.status(500).json({ error: 'An error occurred while updating the code snippet' });
  }
});

// Delete a code snippet
router.delete('/:id', verifyOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership is already checked by middleware
    
    // Delete the code snippet
    const success = await storage.deleteCodeSnippet(parseInt(id));
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete code snippet' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting code snippet:', error);
    res.status(500).json({ error: 'An error occurred while deleting the code snippet' });
  }
});

export default router;