
import { Request, Response } from 'express';
import { storage } from '../storage';
import { getActiveIntegrations } from '../services/platforms';

// Get user's active platform integrations
export async function getUserIntegrations(req: Request, res: Response) {
  try {
    const userId = req.session?.userId || 1; // Mock user ID for demo

    const integrations = await getActiveIntegrations(userId);
    
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform integrations' 
    });
  }
}

// Connect a new platform
export async function connectPlatform(req: Request, res: Response) {
  try {
    const userId = req.session?.userId || 1; // Mock user ID for demo
    const { platform, accessToken, refreshToken, meta } = req.body;
    
    if (!platform || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Platform and access token are required'
      });
    }
    
    // Create the new integration
    const integration = await storage.createPlatformIntegration({
      userId,
      platform,
      accessToken,
      refreshToken,
      meta: meta || {},
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      integration
    });
  } catch (error) {
    console.error('Error connecting platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect platform' 
    });
  }
}

// Disconnect a platform
export async function disconnectPlatform(req: Request, res: Response) {
  try {
    const userId = req.session?.userId || 1; // Mock user ID for demo
    const integrationId = parseInt(req.params.id);
    
    if (isNaN(integrationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid integration ID'
      });
    }
    
    // Verify the integration belongs to the user
    const integration = await storage.getPlatformIntegrationById(integrationId);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }
    
    if (integration.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to disconnect this integration'
      });
    }
    
    // Deactivate the integration
    await storage.deactivatePlatformIntegration(integrationId);
    
    res.json({
      success: true,
      message: 'Platform disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect platform' 
    });
  }
}
