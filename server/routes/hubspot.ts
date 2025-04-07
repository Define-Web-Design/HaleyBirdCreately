
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * Handle HubSpot webhook events
 * 
 * Set up a webhook in your HubSpot account to send events to this endpoint
 * Path: /api/hubspot/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Log the received event for debugging
    console.log('Received HubSpot webhook event:', JSON.stringify(event, null, 2));
    
    // Process different event types
    switch (event.subscriptionType) {
      case 'contact.propertyChange':
        // Handle contact property changes
        console.log(`Contact ${event.objectId} property ${event.propertyName} changed to ${event.propertyValue}`);
        break;
        
      case 'contact.creation':
        // Handle new contact creation
        console.log(`New contact created with ID ${event.objectId}`);
        break;
        
      case 'deal.propertyChange':
        // Handle deal property changes
        console.log(`Deal ${event.objectId} property ${event.propertyName} changed to ${event.propertyValue}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.subscriptionType}`);
    }
    
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing HubSpot webhook:', error);
    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
});

/**
 * Get basic HubSpot connection status
 */
router.get('/status', (_req: Request, res: Response) => {
  // Check if HubSpot API key is configured
  const apiKeyConfigured = !!process.env.HUBSPOT_API_KEY;
  
  res.status(200).json({
    status: apiKeyConfigured ? 'configured' : 'not_configured',
    message: apiKeyConfigured 
      ? 'HubSpot integration is properly configured' 
      : 'HubSpot API key is not configured'
  });
});

export default router;
