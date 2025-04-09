import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Create a simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Static server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve the static version HTML file for all routes
app.get('*', (req, res) => {
  const staticPath = path.join(__dirname, 'static_version.html');
  res.sendFile(staticPath);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running at http://localhost:${PORT}`);
});