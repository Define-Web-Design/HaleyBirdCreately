import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  analyzeContent, 
  generateCaption, 
  createMoodBoard, 
  generateContentIdeas, 
  suggestPostingTimes 
} from "./ai/content";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";
  
  // User routes
  app.get(`${apiPrefix}/user`, async (req: Request, res: Response) => {
    try {
      // This would check session authentication in a real app
      const userId = 1; // Mock user ID
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Content routes
  app.get(`${apiPrefix}/content`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const content = await storage.getContentByUserId(userId);
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get(`${apiPrefix}/content/archived`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const archivedContent = await storage.getArchivedContentByUserId(userId);
      res.json(archivedContent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post(`${apiPrefix}/content/analyze`, async (req: Request, res: Response) => {
    try {
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }
      
      const content = await storage.getContentById(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const analysis = await analyzeContent(content);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post(`${apiPrefix}/content/caption`, async (req: Request, res: Response) => {
    try {
      const { contentId, tone, length } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }
      
      const content = await storage.getContentById(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const caption = await generateCaption(content, tone, length);
      res.json({ caption });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Analytics routes
  app.get(`${apiPrefix}/analytics`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const period = req.query.period || "30days";
      
      const analytics = await storage.getAnalyticsByUserId(userId, period as string);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Mood board routes
  app.get(`${apiPrefix}/mood-boards`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const moodBoards = await storage.getMoodBoardsByUserId(userId);
      res.json(moodBoards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post(`${apiPrefix}/mood-boards`, async (req: Request, res: Response) => {
    try {
      const { title, description, theme, keywords } = req.body;
      const userId = 1; // Mock user ID
      
      if (!title || !theme) {
        return res.status(400).json({ message: "Title and theme are required" });
      }
      
      const moodBoard = await createMoodBoard(userId, title, description, theme, keywords);
      const savedMoodBoard = await storage.createMoodBoard(moodBoard);
      
      res.status(201).json(savedMoodBoard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Apple Photos Integration
  app.post(`${apiPrefix}/photos/import`, async (req: Request, res: Response) => {
    try {
      const { photoIds } = req.body;
      
      if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Valid photoIds array is required" 
        });
      }
      
      const userId = 1; // Mock user ID
      
      // In a real implementation, this would handle Apple Photos API integration
      // For now, we'll return mock data for demonstration
      const importedPhotos = photoIds.map((id, index) => ({
        id,
        url: index % 2 === 0 
          ? 'https://images.unsplash.com/photo-1682687218147-9806132dc697'
          : 'https://images.unsplash.com/photo-1682687982501-1e58ab814714',
        metadata: {
          createdAt: new Date().toISOString(),
          format: 'jpeg'
        }
      }));
      
      res.json({ 
        success: true, 
        photos: importedPhotos 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  });

  // Content idea generation
  app.post(`${apiPrefix}/content/ideas`, async (req: Request, res: Response) => {
    try {
      const { theme, platform = "social media", count = 5 } = req.body;
      
      if (!theme) {
        return res.status(400).json({ 
          success: false, 
          message: "Theme is required" 
        });
      }
      
      const ideas = await generateContentIdeas(theme, platform, count);
      
      res.json({ 
        success: true, 
        ideas 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  // Posting time suggestions
  app.post(`${apiPrefix}/content/posting-times`, async (req: Request, res: Response) => {
    try {
      const { platform, engagementData = [] } = req.body;
      
      if (!platform) {
        return res.status(400).json({ 
          success: false, 
          message: "Platform is required" 
        });
      }
      
      const times = await suggestPostingTimes(platform, engagementData);
      
      res.json({ 
        success: true, 
        times 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  // Creative Symbiosis Framework Routes
  
  // Get user's evolution points
  app.get(`${apiPrefix}/evolution-points`, async (req: Request, res: Response) => {
    try {
      // This would check session authentication in a real app
      const userId = 1; // Mock user ID
      
      // Refresh the creative energy points first (simulate time passing)
      const points = await storage.refreshCreativeEnergyPoints(userId);
      
      if (!points) {
        return res.status(404).json({ message: "Evolution points not found" });
      }
      
      res.json(points);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Track user engagement
  app.post(`${apiPrefix}/user-engagement`, async (req: Request, res: Response) => {
    try {
      const { engagementType, engagementDetails } = req.body;
      const userId = 1; // Mock user ID
      
      if (!engagementType) {
        return res.status(400).json({ message: "Engagement type is required" });
      }
      
      const engagement = await storage.trackUserEngagement({
        userId,
        engagementType,
        engagementDetails: engagementDetails || {},
        points: 5 // Default points for engagement
      });
      
      res.json(engagement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user capabilities
  app.get(`${apiPrefix}/user-capabilities`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      
      const capabilities = await storage.getUserCapabilitiesByUserId(userId);
      
      res.json(capabilities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Unlock a new capability
  app.post(`${apiPrefix}/user-capabilities`, async (req: Request, res: Response) => {
    try {
      const { capabilityName } = req.body;
      const userId = 1; // Mock user ID
      
      if (!capabilityName) {
        return res.status(400).json({ message: "Capability name is required" });
      }
      
      const capability = await storage.unlockUserCapability({
        userId,
        capabilityName,
        isUnlocked: true,
        level: 1
      });
      
      res.json(capability);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Upgrade a capability level
  app.put(`${apiPrefix}/user-capabilities/:capabilityName`, async (req: Request, res: Response) => {
    try {
      const { capabilityName } = req.params;
      const userId = 1; // Mock user ID
      
      const updatedCapability = await storage.upgradeCapabilityLevel(userId, capabilityName);
      
      res.json(updatedCapability);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get creative history
  app.get(`${apiPrefix}/creative-history/:period`, async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const userId = 1; // Mock user ID
      
      if (!period) {
        return res.status(400).json({ message: "Period is required" });
      }
      
      const history = await storage.getCreativeHistoryByUserIdAndPeriod(userId, period);
      
      if (!history) {
        return res.status(404).json({ message: "Creative history not found" });
      }
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update creative history
  app.put(`${apiPrefix}/creative-history/:period`, async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const updates = req.body;
      const userId = 1; // Mock user ID
      
      if (!period) {
        return res.status(400).json({ message: "Period is required" });
      }
      
      const history = await storage.updateCreativeHistory(userId, period, updates);
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Color Palette routes
  
  // Get all color palettes for a user
  app.get(`${apiPrefix}/color-palettes`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      
      const palettes = await storage.getColorPalettesByUserId(userId);
      
      res.json(palettes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific color palette by ID
  app.get(`${apiPrefix}/color-palettes/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Palette ID is required" });
      }
      
      const palette = await storage.getColorPaletteById(parseInt(id));
      
      if (!palette) {
        return res.status(404).json({ message: "Color palette not found" });
      }
      
      res.json(palette);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new color palette
  app.post(`${apiPrefix}/color-palettes`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const { name, mood, colors, tags, isFavorite } = req.body;
      
      if (!name || !mood || !colors) {
        return res.status(400).json({ message: "Name, mood, and colors are required" });
      }
      
      const palette = await storage.createColorPalette({
        userId,
        name,
        mood,
        colors,
        tags,
        isFavorite
      });
      
      res.status(201).json(palette);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update a color palette
  app.put(`${apiPrefix}/color-palettes/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Palette ID is required" });
      }
      
      const palette = await storage.updateColorPalette(parseInt(id), updates);
      
      res.json(palette);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Increment usage count for a color palette
  app.post(`${apiPrefix}/color-palettes/:id/increment-usage`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Palette ID is required" });
      }
      
      const palette = await storage.incrementColorPaletteUsage(parseInt(id));
      
      res.json(palette);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get color palettes by mood
  app.get(`${apiPrefix}/color-palettes/by-mood/:mood`, async (req: Request, res: Response) => {
    try {
      const { mood } = req.params;
      
      if (!mood) {
        return res.status(400).json({ message: "Mood is required" });
      }
      
      const palettes = await storage.getColorPalettesByMood(mood);
      
      res.json(palettes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
