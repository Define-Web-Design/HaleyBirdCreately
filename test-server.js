import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, 'client')));

// Create a simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve the HTML file for the root route and all other client routes
app.get('*', (req, res) => {
  const htmlPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    // If client/index.html doesn't exist, use static_version.html
    const staticPath = path.join(__dirname, 'static_version.html');
    if (fs.existsSync(staticPath)) {
      res.sendFile(staticPath);
    } else {
      res.status(404).send('Not found');
    }
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});