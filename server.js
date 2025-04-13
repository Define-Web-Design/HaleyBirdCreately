/**
 * Main Server Entry Point for Creately Code Snippet Sharing
 * 
 * This is a simplified server implementation that handles:
 * - Static file serving
 * - API endpoints for code snippets
 * - In-memory database storage (fallback for when PostgreSQL is unavailable)
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import * as db from './server/db-simple.js';

// Get current directory (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the app
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
(async () => {
  try {
    await db.initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();

// API Routes

// Get all public snippets
app.get('/api/snippets', async (req, res) => {
  try {
    const snippets = await db.getPublicCodeSnippets();
    res.json({ snippets });
  } catch (error) {
    console.error('Error getting snippets:', error);
    res.status(500).json({ error: 'Failed to get snippets' });
  }
});

// Get a specific snippet by shareId
app.get('/api/snippets/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const snippet = await db.getCodeSnippetByShareId(shareId);
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    res.json({ snippet });
  } catch (error) {
    console.error('Error getting snippet:', error);
    res.status(500).json({ error: 'Failed to get snippet' });
  }
});

// Create a new snippet
app.post('/api/snippets', async (req, res) => {
  try {
    const { title, language, code, description, author, isPublic } = req.body;
    
    // Validate required fields
    if (!title || !language || !code) {
      return res.status(400).json({ error: 'Title, language, and code are required' });
    }
    
    const snippet = await db.createCodeSnippet({
      title,
      language,
      code,
      description: description || '',
      author: author || 'Anonymous',
      isPublic: isPublic !== false
    });
    
    res.status(201).json({ snippet });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

// Serve index.html for view/:shareId routes (for direct snippet viewing)
app.get('/view/:shareId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view', 'index.html'));
});

// Default route - serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
┌───────────────────────────────────────────────────┐
│                                                   │
│   Creately Code Snippet Server                    │
│                                                   │
│   Server running at http://0.0.0.0:${PORT}/          │
│                                                   │
└───────────────────────────────────────────────────┘`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});