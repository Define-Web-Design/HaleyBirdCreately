
import express from 'express';
import { google } from 'googleapis';
import { auth } from '../middleware/auth';

const router = express.Router();

// Middleware to create Google Docs client
const createDocsClient = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.googleAccessToken) {
    return res.status(401).json({ error: 'Google authentication required' });
  }
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: req.user.googleAccessToken });
  req.docsClient = google.docs({ version: 'v1', auth });
  next();
};

// Get a specific document
router.get('/documents/:documentId', auth, createDocsClient, async (req: any, res: any) => {
  try {
    const response = await req.docsClient.documents.get({
      documentId: req.params.documentId
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new document
router.post('/documents', auth, createDocsClient, async (req: any, res: any) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const response = await req.docsClient.documents.create({
      requestBody: { title }
    });
    res.status(201).json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update document content
router.post('/documents/:documentId/content', auth, createDocsClient, async (req: any, res: any) => {
  try {
    const { documentId } = req.params;
    const { requests } = req.body;
    
    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Valid requests array is required' });
    }
    
    const response = await req.docsClient.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
