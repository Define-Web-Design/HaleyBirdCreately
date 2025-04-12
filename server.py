import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs
import mimetypes

# Get port from environment or default to 3000
# Use port 3000 for production deployment compatibility
PORT = int(os.environ.get('PORT', 3000))

# Sample data for code snippets
SNIPPETS = [
    {
        "id": 1,
        "title": "React Button Component",
        "description": "A reusable button component with TypeScript",
        "code": """import React from 'react';

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
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};""",
        "language": "typescript",
        "tags": ["react", "typescript", "ui"],
        "isPublic": True,
        "viewCount": 42,
        "shareId": "abc123",
        "userId": 1,
        "createdAt": "2023-04-01T12:00:00Z",
    },
    {
        "id": 2,
        "title": "PostgreSQL Query with Drizzle ORM",
        "description": "Example of querying with Drizzle ORM",
        "code": """import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../schema';

// Get user by email
async function getUserByEmail(email: string) {
  const result = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result[0] || null;
}""",
        "language": "typescript",
        "tags": ["database", "drizzle", "postgres"],
        "isPublic": True,
        "viewCount": 17,
        "shareId": "def456",
        "userId": 2,
        "createdAt": "2023-04-05T14:30:00Z",
    },
    {
        "id": 3,
        "title": "API Route Handler",
        "description": "Express route handler for creating snippets",
        "code": """router.post('/snippets', async (req, res) => {
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
});""",
        "language": "javascript",
        "tags": ["express", "api", "validation"],
        "isPublic": True,
        "viewCount": 23,
        "shareId": "ghi789",
        "userId": 1,
        "createdAt": "2023-04-10T09:15:00Z",
    }
]

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.directory = os.path.join(os.getcwd(), "public")
        super().__init__(*args, directory=self.directory, **kwargs)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def respond_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # API endpoints
        if path.startswith('/api/'):
            if path == '/api/health':
                self.respond_json(200, {
                    'status': 'ok',
                    'message': 'Server is running',
                    'timestamp': '2023-04-12T10:30:00Z',
                    'version': '1.0.0'
                })
                return
            
            elif path == '/api/snippets':
                # Return all public snippets
                self.respond_json(200, SNIPPETS)
                return
            
            elif path.startswith('/api/snippets/') and len(path.split('/')) == 4:
                snippet_id = int(path.split('/')[-1])
                # Find snippet by ID
                snippet = next((s for s in SNIPPETS if s['id'] == snippet_id), None)
                if snippet:
                    self.respond_json(200, snippet)
                else:
                    self.respond_json(404, {'error': 'Snippet not found'})
                return
            
            elif path == '/api/snippets/public/all':
                # Return all public snippets
                public_snippets = [s for s in SNIPPETS if s['isPublic']]
                self.respond_json(200, public_snippets)
                return
            
            # Default API response for unknown endpoints
            self.respond_json(404, {'error': 'API endpoint not found'})
            return
        
        # For non-API requests, serve static files from public directory
        try:
            super().do_GET()
        except Exception as e:
            print(f"Error serving file: {e}")
            self.send_error(404, "File not found")

def run_server():
    handler = RequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}/")
        httpd.serve_forever()

if __name__ == "__main__":
    # Initialize mime types
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')
    run_server()