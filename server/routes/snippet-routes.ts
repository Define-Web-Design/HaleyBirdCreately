import express from 'express';
import storage from '../storage';

const router = express.Router();

// Get all code snippets
router.get('/', async (req, res) => {
  try {
    const snippets = await storage.snippets.getAll();
    res.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Get a single snippet by ID
router.get('/:id', async (req, res) => {
  try {
    const snippet = await storage.snippets.getById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    console.error(`Error fetching snippet ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

// Create a new snippet
router.post('/', async (req, res) => {
  try {
    const newSnippet = await storage.snippets.create(req.body);
    res.status(201).json(newSnippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

// Update a snippet
router.patch('/:id', async (req, res) => {
  try {
    const updatedSnippet = await storage.snippets.update(req.params.id, req.body);
    if (!updatedSnippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(updatedSnippet);
  } catch (error) {
    console.error(`Error updating snippet ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});

// Delete a snippet
router.delete('/:id', async (req, res) => {
  try {
    const success = await storage.snippets.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting snippet ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

export default router;