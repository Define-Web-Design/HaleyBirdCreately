import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;

// Sample data for code snippets
const SNIPPETS = [
  {
    id: 1,
    title: "React Button Component",
    description: "A reusable button component with TypeScript",
    code: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
    language: "typescript",
    tags: ["react", "typescript", "ui"],
    isPublic: true,
    viewCount: 42,
    shareId: "abc123",
    userId: 1,
    createdAt: "2023-04-01T12:00:00Z",
  },
  {
    id: 2,
    title: "PostgreSQL Query with Drizzle ORM",
    description: "Example of querying with Drizzle ORM",
    code: `import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../schema';

// Get user by email
async function getUserByEmail(email: string) {
  const result = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result[0] || null;
}`,
    language: "typescript",
    tags: ["database", "drizzle", "postgres"],
    isPublic: true,
    viewCount: 17,
    shareId: "def456",
    userId: 2,
    createdAt: "2023-04-05T14:30:00Z",
  },
  {
    id: 3,
    title: "API Route Handler",
    description: "Express route handler for creating snippets",
    code: `router.post('/snippets', async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate request body
    const validationResult = snippetSchema.safeParse({
      ...req.body,
      userId: req.user.id
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: validationResult.error.format()
      });
    }
    
    // Create the snippet
    const snippet = await storage.createSnippet(validationResult.data);
    
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});`,
    language: "javascript",
    tags: ["express", "api", "validation"],
    isPublic: true,
    viewCount: 23,
    shareId: "ghi789",
    userId: 1,
    createdAt: "2023-04-10T09:15:00Z",
  }
];

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url || '/', true);
  const pathname = parsedUrl.pathname || '/';

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    // Handle API health check
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }));
      return;
    }

    // Handle snippets API
    if (pathname === '/api/snippets') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(SNIPPETS));
      return;
    }

    // Handle single snippet API
    if (pathname.startsWith('/api/snippets/') && pathname.split('/').length === 4) {
      const snippetId = parseInt(pathname.split('/')[3], 10);
      const snippet = SNIPPETS.find(s => s.id === snippetId);
      
      if (snippet) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(snippet));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Snippet not found' }));
      }
      return;
    }

    // Handle public snippets API
    if (pathname === '/api/snippets/public/all') {
      const publicSnippets = SNIPPETS.filter(s => s.isPublic);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(publicSnippets));
      return;
    }

    // Default API response for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  // Static file handling
  let filePath = './public' + (pathname === '/' ? '/index.html' : pathname);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile('./public/index.html', (err, content) => {
          if (err) {
            // If even the index.html is not available, return a simple 404
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            // Serve index.html as fallback
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`API Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`API Snippets: http://0.0.0.0:${PORT}/api/snippets`);
});