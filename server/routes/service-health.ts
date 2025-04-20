
import express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { ServiceRegistry } from '../services/serviceRegistry';
import { storage } from '../storage';

dotenv.config();

const router = express.Router();

/**
 * Get health status of all integrated services
 * @route GET /api/service-health
 * @access Public
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const serviceRegistry = ServiceRegistry.getInstance(storage);
    const servicesStatus = serviceRegistry.getAllServicesStatus();
    
    // Check AI services
    const openaiAvailable = !!process.env.OPENAI_API_KEY;
    const mistralAvailable = !!process.env.MISTRAL_API_KEY;
    
    // Check third-party integrations
    const slackAvailable = !!process.env.SLACK_BOT_TOKEN;
    const hubspotAvailable = !!process.env.HUBSPOT_API_KEY;
    const googleOAuthAvailable = !!process.env.GOOGLE_OAUTH_SECRETS;
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      services: {
        core: servicesStatus,
        ai: {
          openai: {
            status: openaiAvailable ? 'available' : 'unavailable',
            message: openaiAvailable ? undefined : 'API key not configured'
          },
          mistral: {
            status: mistralAvailable ? 'available' : 'unavailable',
            message: mistralAvailable ? undefined : 'API key not configured'
          }
        },
        integrations: {
          slack: {
            status: slackAvailable ? 'available' : 'unavailable',
            message: slackAvailable ? undefined : 'Bot token not configured'
          },
          hubspot: {
            status: hubspotAvailable ? 'available' : 'unavailable',
            message: hubspotAvailable ? undefined : 'API key not configured'
          },
          google: {
            status: googleOAuthAvailable ? 'available' : 'unavailable',
            message: googleOAuthAvailable ? undefined : 'OAuth credentials not configured'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error checking service health:', error);
    res.status(500).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
