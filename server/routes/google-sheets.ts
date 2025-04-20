
import express from 'express';
import { google } from 'googleapis';
import { auth } from '../middleware/auth';
import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const sheets = google.sheets('v4');

// Get OAuth2 client from your auth middleware or setup directly here
const getAuthClient = async (req: express.Request) => {
  // This is a simplified example. In production, you'd use proper token management
  // and handle token refresh, etc.
  const oAuth2Client = new google.auth.OAuth2();
  
  // Using the access token from the user's session
  if (req.session?.accessToken) {
    oAuth2Client.setCredentials({ access_token: req.session.accessToken });
  } else {
    throw new Error('No access token found');
  }
  
  return oAuth2Client;
};

// Get spreadsheet data
router.get('/:spreadsheetId/values/:range', auth, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;
    const authClient = await getAuthClient(req);
    
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range,
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
  }
});

// Update spreadsheet data
router.put('/:spreadsheetId/values/:range', auth, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;
    const { values } = req.body;
    const authClient = await getAuthClient(req);
    
    const response = await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating spreadsheet data:', error);
    res.status(500).json({ error: 'Failed to update spreadsheet data' });
  }
});

// Append to spreadsheet
router.post('/:spreadsheetId/values/:range/append', auth, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;
    const { values } = req.body;
    const authClient = await getAuthClient(req);
    
    const response = await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error appending to spreadsheet:', error);
    res.status(500).json({ error: 'Failed to append to spreadsheet' });
  }
});

export default router;
