// Simple HTTP server for Creately code snippet sharing
import http from 'http';
const PORT = process.env.PORT || 3000;

// Create server
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Creately code snippet server is running',
    endpoints: [
      '/api/snippets',
      '/api/snippets/:id',
      '/api/snippets/public/all'
    ]
  }));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});