// Simple HTTP server for Creately code snippet sharing
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables from .env file
dotenv.config();

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Helper function to send JSON response
const sendJSON = (res, data, statusCode = 200) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
};

// Import database module
import db from './server/db-simple.js';

// In-memory fallback code snippet store
// (only used if database connection fails)
const fallbackSnippets = [
  {
    id: 1,
    title: 'Hello World in JavaScript',
    description: 'A simple Hello World example in JavaScript',
    code: 'console.log("Hello World!");',
    language: 'javascript',
    tags: ['hello-world', 'javascript', 'beginner'],
    isPublic: true,
    viewCount: 42,
    shareId: '550e8400-e29b-41d4-a716-446655440000',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize database (async)
let dbInitialized = false;
let useFallback = false;

(async () => {
  try {
    // Test database connection
    const connected = await db.testConnection();
    
    if (connected) {
      // Initialize database tables
      dbInitialized = await db.initDatabase();
      
      // Add a sample snippet if database is empty
      const snippets = await db.getCodeSnippets();
      if (snippets.length === 0) {
        console.log('No snippets found in database, adding a sample snippet...');
        await db.addSampleSnippet();
      }
    } else {
      useFallback = true;
      console.warn('⚠️ Database connection failed. Using in-memory fallback snippets.');
    }
  } catch (error) {
    useFallback = true;
    console.error('❌ Database initialization error:', error);
    console.warn('⚠️ Using in-memory fallback snippets due to database error.');
  }
})();

// Handle API routes
const handleAPI = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`${req.method} ${path}`);
  
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    sendJSON(res, {}, 204);
    return;
  }

  // Health check endpoint
  if (path === '/api/health') {
    sendJSON(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      databaseStatus: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
    return;
  }
  
  // API endpoints
  if (path === '/api/snippets' && req.method === 'GET') {
    try {
      if (useFallback) {
        sendJSON(res, fallbackSnippets);
      } else {
        const snippets = await db.getCodeSnippets();
        sendJSON(res, snippets);
      }
    } catch (error) {
      console.error('Error getting snippets:', error);
      sendJSON(res, { error: 'Failed to fetch snippets' }, 500);
    }
    return;
  }
  
  if (path.startsWith('/api/snippets/') && req.method === 'GET') {
    try {
      // Check if it's a UUID (shareId) or numeric ID
      const pathParts = path.split('/');
      
      if (pathParts[3] === 'share' && pathParts[4]) {
        // Handle share ID lookup
        const shareId = pathParts[4];
        
        let snippet;
        if (useFallback) {
          snippet = fallbackSnippets.find(s => s.shareId === shareId);
        } else {
          snippet = await db.getCodeSnippetByShareId(shareId);
        }
        
        if (snippet) {
          // Increment view count
          if (!useFallback) {
            await db.incrementCodeSnippetViewCount(snippet.id);
          }
          sendJSON(res, snippet);
        } else {
          sendJSON(res, { error: 'Snippet not found' }, 404);
        }
      } else {
        // Handle numeric ID lookup
        const id = parseInt(pathParts[3]);
        
        let snippet;
        if (useFallback) {
          snippet = fallbackSnippets.find(s => s.id === id);
        } else {
          snippet = await db.getCodeSnippetById(id);
        }
        
        if (snippet) {
          // Increment view count
          if (!useFallback) {
            await db.incrementCodeSnippetViewCount(snippet.id);
          }
          sendJSON(res, snippet);
        } else {
          sendJSON(res, { error: 'Snippet not found' }, 404);
        }
      }
    } catch (error) {
      console.error('Error getting snippet:', error);
      sendJSON(res, { error: 'Failed to fetch snippet' }, 500);
    }
    return;
  }
  
  if (path === '/api/snippets/public/all' && req.method === 'GET') {
    try {
      if (useFallback) {
        const publicSnippets = fallbackSnippets.filter(s => s.isPublic);
        sendJSON(res, publicSnippets);
      } else {
        const publicSnippets = await db.getPublicCodeSnippets();
        sendJSON(res, publicSnippets);
      }
    } catch (error) {
      console.error('Error getting public snippets:', error);
      sendJSON(res, { error: 'Failed to fetch public snippets' }, 500);
    }
    return;
  }
  
  // Create a new snippet (POST)
  if (path === '/api/snippets' && req.method === 'POST') {
    try {
      // Read request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          // Parse JSON body
          const snippetData = JSON.parse(body);
          
          // Basic validation
          if (!snippetData.title || !snippetData.code || !snippetData.language) {
            sendJSON(res, { 
              error: 'Invalid snippet data', 
              message: 'Title, code, and language are required fields' 
            }, 400);
            return;
          }
          
          // Set user ID to 1 for now (anonymous user if not provided)
          if (!snippetData.userId) {
            snippetData.userId = 1;
          }
          
          // Create snippet
          if (useFallback) {
            // Generate a new ID and share ID for in-memory store
            const newId = fallbackSnippets.length > 0 
              ? Math.max(...fallbackSnippets.map(s => s.id)) + 1 
              : 1;
            
            const newSnippet = {
              id: newId,
              title: snippetData.title,
              description: snippetData.description || '',
              code: snippetData.code,
              language: snippetData.language,
              tags: snippetData.tags || [],
              isPublic: snippetData.isPublic || false,
              viewCount: 0,
              shareId: crypto.randomUUID(),
              userId: snippetData.userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            fallbackSnippets.push(newSnippet);
            sendJSON(res, newSnippet, 201);
          } else {
            const newSnippet = await db.createCodeSnippet(snippetData);
            sendJSON(res, newSnippet, 201);
          }
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
          sendJSON(res, { error: 'Invalid JSON in request body' }, 400);
        }
      });
    } catch (error) {
      console.error('Error creating snippet:', error);
      sendJSON(res, { error: 'Failed to create snippet' }, 500);
    }
    return;
  }
  
  // API info
  if (path === '/api' || path === '/api/') {
    sendJSON(res, {
      status: 'ok',
      message: 'Creately Code Snippet API',
      version: '1.0.0',
      endpoints: [
        '/api/health',
        '/api/snippets',
        '/api/snippets/:id',
        '/api/snippets/public/all'
      ]
    });
    return;
  }
  
  // Home page (for testing)
  if (path === '/' || path === '') {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Creately Code Snippet Sharing</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
            .snippet { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .tag { background: #eee; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
          </style>
        </head>
        <body>
          <h1>Creately Code Snippet Sharing</h1>
          <p>Welcome to the Creately Code Snippet Sharing service. This is a simple server for sharing code snippets.</p>
          
          <h2>API Endpoints</h2>
          <pre>/api/snippets - Get all snippets
/api/snippets/:id - Get a specific snippet
/api/snippets/public/all - Get all public snippets</pre>

          <h2>Sample Snippets</h2>
          <div id="snippets"></div>
          
          <script>
            // Fetch snippets from the API
            fetch('/api/snippets/public/all')
              .then(response => response.json())
              .then(data => {
                const snippetsContainer = document.getElementById('snippets');
                data.forEach(snippet => {
                  snippetsContainer.innerHTML += \`
                    <div class="snippet">
                      <div class="header">
                        <h3>\${snippet.title}</h3>
                        <div>\${snippet.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}</div>
                      </div>
                      <p>\${snippet.description || ''}</p>
                      <pre><code>\${snippet.code}</code></pre>
                      <div>Language: \${snippet.language} | Views: \${snippet.viewCount}</div>
                    </div>
                  \`;
                });
              })
              .catch(error => {
                console.error('Error fetching snippets:', error);
                document.getElementById('snippets').innerHTML = '<p>Error loading snippets</p>';
              });
          </script>
        </body>
      </html>
    `);
    return;
  }
  
  // Not found
  sendJSON(res, {
    error: 'Not found',
    message: `Route ${path} not found`
  }, 404);
};

// Create server
const server = http.createServer(async (req, res) => {
  // All requests go through the API handler
  try {
    await handleAPI(req, res);
  } catch (error) {
    console.error('Unhandled server error:', error);
    // Send a generic error response if not already sent
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
});