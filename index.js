// Simple Express server for testing connection using ES modules

import express from 'express';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Creately API!',
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    database: process.env.DATABASE_URL ? 'Available (PostgreSQL)' : 'Not configured',
    apiKeys: {
      openai: process.env.OPENAI_API_KEY ? 'Available' : 'Missing',
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});