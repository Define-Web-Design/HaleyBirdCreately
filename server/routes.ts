import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import storage from "./storage";

// Helper function to get active integrations
async function getActiveIntegrations(userId: number) {
  // In a real implementation, this would fetch from the database
  return [
    {
      id: 1,
      platform: 'instagram',
      isActive: true,
      connectedAt: new Date().toISOString()
    },
    {
      id: 2,
      platform: 'twitter',
      isActive: true,
      connectedAt: new Date().toISOString()
    }
  ];
}
import { 
  analyzeContent, 
  generateCaption, 
  createMoodBoard, 
  generateContentIdeas, 
  suggestPostingTimes
} from "./ai/content";
import { generateMoodPalette, generateAIPalette, MoodTone } from "./services/paletteGenerator";
import { pageSpeedService } from "./services/pageSpeedService";
import { 
  apiLimiter, 
  addOwnershipHeaders, 
  validateAccess,
  monitorSecurity
} from "./middleware/security";
import { securityMonitor } from "./services/securityMonitor";
import { authenticate } from "./middleware/auth";
import authRoutes from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global security middleware
  app.use(addOwnershipHeaders);
  app.use(monitorSecurity);

  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Register auth routes - these need to be registered before authentication middleware
  app.use("/api/auth", authRoutes);

  // Create a list of public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh-token',
    '/api/public',
    '/api/public/legal/terms',
    '/api/public/legal/privacy',
    '/api/public/legal/accept',
    '/api/public/theme'
  ];

  // Add authentication middleware (except for public routes)
  app.use((req, res, next) => {
    // Skip authentication for public routes
    if (publicRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }
    // Apply authentication for all other routes
    authenticate()(req, res, next);
  });

  // Platform integration routes
  app.get('/api/user/integrations', async (req, res) => {
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
  });

  app.post('/api/user/integrations', async (req, res) => {
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
  });

  app.delete('/api/user/integrations/:id', async (req, res) => {
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
  });

  // Legal routes - these must be accessible without authentication
  app.get("/api/public/legal/terms", (req: Request, res: Response) => {
    res.json({
      title: "Terms of Service",
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      requiresAcceptance: true
    });
  });

  app.get("/api/public/legal/privacy", (req: Request, res: Response) => {
    res.json({
      title: "Privacy Notice & Intellectual Property Protection",
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      requiresAcceptance: true
    });
  });

  // Record terms acceptance
  app.post("/api/public/legal/accept", async (req: Request, res: Response) => {
    const { documentType, version, userId } = req.body;

    if (!documentType || !version) {
      return res.status(400).json({ message: "Document type and version are required" });
    }

    try {
      await storage.recordLegalAcceptance({
        userId: userId || 0,
        documentType,
        version,
        acceptedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "unknown"
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Register theme routes before applying access validation
  // Theme configuration - publicly accessible
  app.post('/api/theme', async (req, res) => {
    try {
      const { primary, appearance, variant, radius } = req.body;

      if (!primary) {
        return res.status(400).json({ 
          message: "Primary color is required" 
        });
      }

      console.log('Theme update received:', { primary, appearance, variant, radius });

      // In a real implementation, this would update theme.json
      // For now, we'll just return success
      res.json({ 
        success: true,
        theme: {
          primary,
          appearance: appearance || 'light',
          variant: variant || 'vibrant',
          radius: radius || 0.5
        }
      });
    } catch (error: any) {
      console.error('Error in theme API:', error);
      res.status(500).json({ 
        message: error.message 
      });
    }
  });

  // Theme route to get the current theme - publicly accessible
  app.get('/api/public/theme', (req, res) => {
    // Improved default theme configuration that matches our UI design
    const defaultTheme = {
      primary: '#F2994A', // Matches our app's gradient starting color
      appearance: 'system', // Use system preference by default
      variant: 'vibrant', // Use vibrant variant for more appealing UI
      radius: 0.5 // Moderate border radius
    };

    console.log('Serving default theme:', defaultTheme);
    res.json(defaultTheme);
  });

  // Allow OPTIONS requests for CORS preflight
  app.options('/api/theme', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
  });

  // Allow OPTIONS requests for public theme endpoint
  app.options('/api/public/theme', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(204);
  });

  // PageSpeed Insights API route
  app.post('/api/pagespeed/analyze', async (req, res) => {
    try {
      const { url, device = 'mobile' } = req.body;

      if (!url) {
        return res.status(400).json({ 
          success: false, 
          message: 'URL is required for PageSpeed analysis' 
        });
      }

      if (!['mobile', 'desktop'].includes(device)) {
        return res.status(400).json({
          success: false,
          message: 'Device must be either "mobile" or "desktop"'
        });
      }

      // Validate API key availability
      if (!process.env.PAGESPEED_INSIGHTS_API_KEY) {
        console.error('PageSpeed API key not configured');
        return res.status(500).json({
          success: false,
          message: 'API Error: PageSpeed Insights API key not configured'
        });
      }

      console.log(`Running PageSpeed analysis for ${url} on ${device}`);

      // Run the analysis
      const isMobile = device === 'mobile';
      const results = await pageSpeedService.analyzeUrl(url, isMobile);

      // Format the results for API response
      const formattedResults = {
        score: results.score,
        loadingSpeed: results.loadingSpeed,
        recommendations: results.recommendations,
        timestamp: results.timestamp
      };

      res.json({
        success: true,
        results: formattedResults
      });
    } catch (error: any) {
      console.error(`PageSpeed analysis error: ${error.message}`);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to run PageSpeed analysis'
      });
    }
  });

  // Apply access validation to all other API routes
  app.use("/api", validateAccess);
  // API routes prefix
  const apiPrefix = "/api";

  //NEW ROUTE ADDED HERE
  app.get('/api/pagespeed', async (req, res) => {
    try {
      const url = req.query.url as string;
      const isMobile = req.query.mobile === 'true';

      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const result = await pageSpeedService.analyzeUrl(url, isMobile);
      res.json(result);
    } catch (error) {
      console.error('PageSpeed API error:', error);
      res.status(500).json({ error: 'Failed to run PageSpeed analysis' });
    }
  });

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

  // Task Verification Routes

  // Get all tasks
  app.get(`${apiPrefix}/task-verification/tasks`, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || 1; // Mock user ID for demo
      const tasks = await storage.getTaskVerificationTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching task verification tasks:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch task verification tasks' 
      });
    }
  });

  // Verify a specific task
  app.post(`${apiPrefix}/task-verification/verify/:taskId`, async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const userId = req.session?.userId || 1; // Mock user ID for demo

      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
      }

      // Update task status to verified
      const task = await storage.verifyTask(taskId, userId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or already verified'
        });
      }

      // Add evolution points for verifying the task
      const pointsAwarded = task.points || 10;
      await storage.addEvolutionPoints(userId, pointsAwarded);

      // Track this activity in user engagement
      await storage.trackUserEngagement({
        userId,
        engagementType: 'task_verified',
        engagementDetails: JSON.stringify({
          taskId,
          points: pointsAwarded,
          timestamp: new Date().toISOString()
        })
      });

      res.json({
        success: true,
        task,
        pointsAwarded
      });
    } catch (error) {
      console.error('Error verifying task:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify task' 
      });
    }
  });

  // Create a new task
  app.post(`${apiPrefix}/task-verification/tasks`, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId || 1; // Mock user ID for demo
      const taskData = req.body;

      // Validate required fields
      if (!taskData.title || !taskData.category) {
        return res.status(400).json({
          success: false,
          message: 'Task title and category are required'
        });
      }

      // Create the task
      const task = await storage.createTask({
        userId,
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status || 'pending',
        category: taskData.category,
        subcategory: taskData.subcategory || null,
        priority: taskData.priority || 'medium',
        points: taskData.points || 10,
        completedAt: null,
        progressPercentage: taskData.progressPercentage || 0
      });

      res.json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create task' 
      });
    }
  });

  // Update task status
  app.patch(`${apiPrefix}/task-verification/status/:taskId`, async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      const userId = req.session?.userId || 1; // Mock user ID for demo

      if (!taskId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Task ID and status are required'
        });
      }

      // Update the task status
      const task = await storage.updateTaskStatus(taskId, userId, status);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update task status' 
      });
    }
  });

  // Update task progress
  app.patch(`${apiPrefix}/task-verification/progress/:taskId`, async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { progressPercentage } = req.body;
      const userId = req.session?.userId || 1; // Mock user ID for demo

      if (!taskId || progressPercentage === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Task ID and progress percentage are required'
        });
      }

      // Update the task progress
      const task = await storage.updateTaskProgress(taskId, userId, progressPercentage);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // If task is automatically marked as completed, award points
      let pointsAwarded = 0;
      if (task.status === 'completed' && progressPercentage === 100) {
        pointsAwarded = task.points || 0;
        if (pointsAwarded > 0) {
          await storage.addEvolutionPoints(userId, pointsAwarded);

          // Track this activity in user engagement
          await storage.trackUserEngagement({
            userId,
            engagementType: 'task_completed',
            engagementDetails: JSON.stringify({
              taskId,
              points: pointsAwarded,
              timestamp: new Date().toISOString()
            })
          });
        }
      }

      res.json({
        success: true,
        task,
        pointsAwarded
      });
    } catch (error) {
      console.error('Error updating task progress:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update task progress' 
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

  // Add evolution points for completing creative activities
  app.post(`${apiPrefix}/evolution-points/earn`, async (req: Request, res: Response) => {
    try {
      const { pointsToAdd, activityType } = req.body;
      const userId = 1; // Mock user ID

      if (!pointsToAdd || !activityType) {
        return res.status(400).json({ 
          message: "Points to add and activity type are required" 
        });
      }

      // Validate points amount (prevent abuse)
      const validPoints = Math.min(Math.abs(parseInt(pointsToAdd)), 50);

      // Update evolution points
      const updatedPoints = await storage.addEvolutionPoints(userId, validPoints);

      // Track this activity in user engagement
      await storage.trackUserEngagement({
        userId,
        engagementType: 'points_earned',
        engagementDetails: JSON.stringify({
          points: validPoints,
          activityType,
          timestamp: new Date().toISOString()
        })
      });

      res.json({
        success: true,
        points: updatedPoints,
        pointsAdded: validPoints,
        activityType
      });
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
  app.put(`${apiPrefix}/creative-history/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ message: "History ID is required" });
      }

      const history = await storage.updateCreativeHistory(parseInt(id), updates);

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

  // Generate a mood-based color palette using AI
  app.post(`${apiPrefix}/color-palettes/generate`, async (req: Request, res: Response) => {
    try {
      const { mood, description, colorCount } = req.body;

      if (!mood) {
        return res.status(400).json({ 
          success: false, 
          message: "Mood is required" 
        });
      }

      console.log("Generating palette with mood:", mood, "description:", description || "N/A");

      let generatedPalette;

      // Optimize response time by using cached or predefined palettes when possible
      // Safely check if mood is in MoodTone enum
      const isValidMoodTone = Object.values(MoodTone).includes(mood.toUpperCase() as MoodTone);

      if (isValidMoodTone && !description) {
        // For standard moods without description, use predefined palettes
        try {
          generatedPalette = await generateMoodPalette(mood.toUpperCase() as MoodTone);
          console.log("Using predefined palette for mood:", mood);
        } catch (moodError) {
          console.error("Error with predefined mood palette:", moodError);
          // Fallback to AI generation if predefined palette fails
          generatedPalette = await generateAIPalette(mood);
          console.log("Fallback to AI generation after predefined palette error");
        }
      } else {
        // For custom descriptions or non-standard moods, use AI generation
        generatedPalette = await generateAIPalette(description || mood);
        console.log("Using AI generation for palette");
      }

      // Ensure the palette has the correct format
      if (!generatedPalette || !generatedPalette.colors || !Array.isArray(generatedPalette.colors) || generatedPalette.colors.length === 0) {
        throw new Error("Generated palette has invalid format");
      }

      res.json({
        success: true,
        palette: generatedPalette
      });
    } catch (error: any) {
      console.error('Error generating palette:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to generate color palette'
      });
    }
  });

  // Mood Capsules Routes

  // Get mood capsules for current user
  app.get(`${apiPrefix}/mood-capsules`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID

      const capsules = await storage.getMoodCapsulesByUserId(userId);

      res.json(capsules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific mood capsule by ID
  app.get(`${apiPrefix}/mood-capsules/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Capsule ID is required" });
      }

      const capsule = await storage.getMoodCapsuleById(parseInt(id));

      if (!capsule) {
        return res.status(404).json({ message: "Mood capsule not found" });
      }

      res.json(capsule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new mood capsule
  app.post(`${apiPrefix}/mood-capsules`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID
      const { name, description, emotionalTone, contentIds, tags } = req.body;

      if (!name || !emotionalTone || !contentIds) {
        return res.status(400).json({ message: "Name, emotional tone, and content IDs are required" });
      }

      // Create the mood capsule
      const capsule = await storage.createMoodCapsule({
        userId,
        name,
        description,
        emotionalTone,
        contentIds
      });

      res.status(201).json(capsule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update a mood capsule
  app.put(`${apiPrefix}/mood-capsules/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ message: "Capsule ID is required" });
      }

      const capsule = await storage.updateMoodCapsule(parseInt(id), updates);

      res.json(capsule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a mood capsule
  app.delete(`${apiPrefix}/mood-capsules/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Capsule ID is required" });
      }

      const success = await storage.deleteMoodCapsule(parseInt(id));

      if (!success) {
        return res.status(404).json({ message: "Mood capsule not found or could not be deleted" });
      }

      res.json({ success: true, message: "Mood capsule deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Archive a mood capsule
  app.post(`${apiPrefix}/mood-capsules/:id/archive`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Capsule ID is required" });
      }

      const capsule = await storage.archiveMoodCapsule(parseInt(id));

      res.json(capsule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Content Sentiment Routes

  // Get content sentiment by content ID
  app.get(`${apiPrefix}/content-sentiment/:contentId`, async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;

      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }

      const sentiment = await storage.getContentSentimentById(parseInt(contentId));

      if (!sentiment) {
        return res.status(404).json({ message: "Content sentiment not found" });
      }

      res.json(sentiment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all content sentiments for a user
  app.get(`${apiPrefix}/content-sentiment`, async (req: Request, res: Response) => {
    try {
      const userId = 1; // Mock user ID

      const sentiments = await storage.getContentSentimentsByUserId(userId);

      res.json(sentiments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analyze content sentiment for multiple content items
  app.post(`${apiPrefix}/content-sentiment/analyze`, async (req: Request, res: Response) => {
    try {
      const { contentIds } = req.body;

      if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
        return res.status(400).json({ message: "Valid contentIds array is required" });
      }

      // Call AI service to analyze content sentiment
      const sentiments = await storage.analyzeContentSentiment(contentIds);

      res.json({
        success: true,
        sentiments
      });
    } catch (error: any) {
      console.error('Error analyzing sentiment:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to analyze content sentiment'
      });
    }
  });

  // Generate caption for mood capsule
  app.post(`${apiPrefix}/mood-capsules/generate-caption`, async (req: Request, res: Response) => {
    try {
      const { contentIds, emotionalTone, captionTone } = req.body;

      if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0 || !emotionalTone) {
        return res.status(400).json({ 
          success: false, 
          message: "Valid contentIds array and emotionalTone are required" 
        });
      }

      // Generate caption using AI
      const caption = await storage.generateCaptionForMoodCapsule(
        contentIds,
        emotionalTone,
        captionTone || 'natural'
      );

      res.json({
        success: true,
        caption
      });
    } catch (error: any) {
      console.error('Error generating caption:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to generate caption'
      });
    }
  });

  // Global error handler middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler caught:', err);

    // Check for specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Auto-create mood capsules from content
  app.post(`${apiPrefix}/mood-capsules/auto-create`, async (req: Request, res: Response) => {
    try {
      const { contentIds, userId = 1, minGroupSize = 2, captionTone = 'balanced' } = req.body;

      if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Valid contentIds array is required" 
        });
      }

      // To track progress for large content sets
      const totalItems = contentIds.length;
      let processedItems = 0;

      // Step 1: Analyze the content sentiment with more depth
      console.log(`Analyzing sentiment for ${totalItems} content items...`);
      const sentiments = await storage.analyzeContentSentiment(contentIds);
      processedItems = sentiments.length;
      console.log(`Sentiment analysis complete: ${processedItems}/${totalItems} items processed`);

      // Step 2: Group content by dominant emotion with enhanced logic
      const emotionGroups: Record<string, number[]> = {};
      const emotionIntensities: Record<string, number> = {};

      // First pass: Collect emotions and their average intensities
      sentiments.forEach(sentiment => {
        if (sentiment.dominantEmotion) {
          if (!emotionGroups[sentiment.dominantEmotion]) {
            emotionGroups[sentiment.dominantEmotion] = [];
            emotionIntensities[sentiment.dominantEmotion] = 0;
          }
          emotionGroups[sentiment.dominantEmotion].push(sentiment.contentId);
          emotionIntensities[sentiment.dominantEmotion] += sentiment.emotionIntensity || 0;
        }
      });

      // Calculate average intensity for each emotion group
      Object.keys(emotionIntensities).forEach(emotion => {
        if (emotionGroups[emotion].length > 0) {
          emotionIntensities[emotion] = emotionIntensities[emotion] / emotionGroups[emotion].length;
        }
      });

      // Filter small groups and merge them into most compatible larger groups
      const primaryEmotions = Object.keys(emotionGroups)
        .filter(emotion => emotionGroups[emotion].length >= minGroupSize)
        .sort((a, b) => emotionGroups[b].length - emotionGroups[a].length);

      const smallGroups = Object.keys(emotionGroups)
        .filter(emotion => emotionGroups[emotion].length < minGroupSize);

      // If we have small groups, try to reassign them
      smallGroups.forEach(smallEmotion => {
        if (primaryEmotions.length === 0) {
          // If no primary emotions, keep as is if it has at least one item
          if (emotionGroups[smallEmotion].length > 0) {
            primaryEmotions.push(smallEmotion);
          }
          return;
        }

        // Reassign to closest primary emotion
        const contentIdsToReassign = emotionGroups[smallEmotion];
        let targetEmotion = primaryEmotions[0]; // Default to largest group

        // For advanced implementations: use emotional similarity to find best match
        // For now, we'll just add to the largest group

        // Add to target emotion group
        emotionGroups[targetEmotion] = [...emotionGroups[targetEmotion], ...contentIdsToReassign];

        // Remove small group
        delete emotionGroups[smallEmotion];
      });

      // Step 3: Create improved mood capsules for each emotion group
      const createdCapsules = [];
      console.log(`Creating mood capsules for ${Object.keys(emotionGroups).length} emotion groups...`);

      for (const [emotion, ids] of Object.entries(emotionGroups)) {
        if (ids.length > 0) {
          try {
            // Generate a descriptive name based on emotion and size
            const emotionName = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            const sizeSuffix = ids.length > 5 ? "Collection" : "Moments";
            const capsuleName = `${emotionName} ${sizeSuffix}`;

            // Generate a caption with the preferred tone
            console.log(`Generating caption for "${capsuleName}" with ${ids.length} items...`);
            const caption = await storage.generateCaptionForMoodCapsule(ids, emotion, captionTone);

            // Create thumbnail URL from first content if available
            let thumbnailUrl = "";
            if (ids.length > 0) {
              const firstContent = await storage.getContentById(ids[0]);
              if (firstContent && firstContent.imageUrl) {
                thumbnailUrl = firstContent.imageUrl;
              }
            }

            // Create the mood capsule with enhanced metadata
            const capsule = await storage.createMoodCapsule({
              userId,
              name: capsuleName,
              description: caption,
              emotionalTone: emotion,
              contentIds: ids,
              thumbnailUrl,
              captionTone
            });

            createdCapsules.push(capsule);
            console.log(`Created mood capsule: "${capsuleName}" with ${ids.length} items`);
          } catch (groupError) {
            console.error(`Error creating capsule for ${emotion} group:`, groupError);
            // Continue with other groups even if one fails
          }
        }
      }

      // Step 4: Return detailed response with analytics
      const analytics = {
        totalContentItems: totalItems,
        processedItems,
        groupsCreated: createdCapsules.length,
        emotionDistribution: Object.fromEntries(
          Object.entries(emotionGroups).map(([emotion, ids]) => 
            [emotion, { count: ids.length, intensity: emotionIntensities[emotion] || 0 }]
          )
        )
      };

      res.status(201).json({
        success: true,
        capsules: createdCapsules,
        emotionGroups: Object.keys(emotionGroups),
        analytics
      });
    } catch (error: any) {
      console.error('Error auto-creating mood capsules:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to auto-create mood capsules',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Security and Legal Routes
  app.get('/api/security/verify-asset', async (req, res) => {
    const { assetId } = req.query;

    if (!assetId || typeof assetId !== 'string') {
      return res.status(400).json({
        valid: false,
        message: 'Invalid asset ID provided'
      });
    }

    try {
      const asset = await storage.getAssetOwnership(assetId);

      if (!asset) {
        return res.status(404).json({
          valid: false,
          message: 'Asset not found or not registered in the ownership database'
        });
      }

      return res.json({
        valid: asset.verificationStatus,
        assetDetails: {
          assetId: asset.assetId,
          assetType: asset.assetType,
          ownerInfo: asset.ownerInfo,
          verificationStatus: asset.verificationStatus,
          lastVerifiedAt: asset.lastVerifiedAt
        },
        message: asset.verificationStatus 
          ? 'Asset verification successful. This is an authentic asset with verified ownership.' 
          : 'Asset verification failed. This asset may have been tampered with or modified.'
      });
    } catch (error) {
      console.error('Asset verification error:', error);
      return res.status(500).json({
        valid: false,
        message: 'An error occurred during verification'
      });
    }
  });

  app.post('/api/legal/accept', async (req, res) => {
    const { terms, privacy } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      // Record terms acceptance if included
      if (terms) {
        await storage.insertLegalAcceptance({
          userId,
          documentType: 'terms',
          version: '1.0', // Should be pulled from config or DB in real app
          acceptedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }

      // Record privacy acceptance if included
      if (privacy) {
        await storage.insertLegalAcceptance({
          userId,
          documentType: 'privacy',
          version: '1.0', // Should be pulled from config or DB in real app
          acceptedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error recording legal acceptance:', error);
      return res.status(500).json({ message: 'Failed to record acceptance' });
    }
  });

  app.get('/api/legal/status', async (req, res) => {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      // Check terms acceptance
      const termsAcceptance = await storage.getLegalAcceptanceByUser(userId, 'terms');

      // Check privacy acceptance
      const privacyAcceptance = await storage.getLegalAcceptanceByUser(userId, 'privacy');

      return res.json({
        termsAccepted: !!termsAcceptance,
        termsVersion: termsAcceptance?.version || null,
        privacyAccepted: !!privacyAcceptance,
        privacyVersion: privacyAcceptance?.version || null
      });
    } catch (error) {
      console.error('Error checking legal acceptance status:', error);
      return res.status(500).json({ message: 'Failed to retrieve legal status' });
    }
  });

  // Security alerts endpoint for administrators
  app.get('/api/security/alerts', async (req, res) => {
    // In a real app, this would check admin permissions
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      // Get the user to check if admin
      const user = await storage.getUserById(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access to security alerts' });
      }

      const alerts = await storage.getSecurityAlerts(50);
      return res.json({ alerts });
    } catch (error) {
      console.error('Error retrieving security alerts:', error);
      return res.status(500).json({ message: 'Failed to retrieve security alerts' });
    }
  });

  // AI Enhancement routes
  app.post('/api/ai/enhance/caption', async (req, res) => {
    const { contentId, style, length } = req.body;

    if (!contentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content ID is required' 
      });
    }

    try {
      // Validate the request for security and ownership
      const validation = await securityMonitor.validateAIEnhancedContent(contentId, 'caption');

      if (!validation.valid && validation.issues.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Cannot enhance this content due to security/ownership restrictions',
          issues: validation.issues,
          recommendations: validation.recommendations
        });
      }

      // Get the content
      const content = await storage.getContentById(contentId);

      if (!content) {
        return res.status(404).json({ 
          success: false, 
          message: 'Content not found' 
        });
      }

      // Generate caption using AI
      const caption = await generateCaption(content, style || 'balanced', length || 'medium');

      // Add watermarking and ownership information
      const response = {
        success: true,
        caption,
        tags: ['tag1', 'tag2', 'tag3'], // Example tags
        recommendations: validation.recommendations,
        ownershipInfo: {
          ownerId: content.userId,
          timestamp: new Date().toISOString(),
          notice: "© 2023 All Rights Reserved. This content is proprietary."
        }
      };

      res.json(response);
    } catch (error) {
      console.error('AI enhancement error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate AI enhancement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post('/api/ai/enhance/mood-board', async (req, res) => {
    const { contentId, theme, colorCount = 5 } = req.body;

    if (!contentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content ID is required' 
      });
    }

    try {
      // Validate the request for security and ownership
      const validation = await securityMonitor.validateAIEnhancedContent(contentId, 'mood-board');

      if (!validation.valid && validation.issues.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Cannot enhance this content due to security/ownership restrictions',
          issues: validation.issues,
          recommendations: validation.recommendations
        });
      }

      // Get the content
      const content = await storage.getContentById(contentId);

      if (!content) {
        return res.status(404).json({ 
          success: false, 
          message: 'Content not found' 
        });
      }

      // Generate mood palette
      const palette = await generateMoodPalette(content.tags?.join(' ') || theme || 'neutral', colorCount);

      // Create a mood board - in a real implementation, this would use AI to select images
      const moodBoard = {
        theme: theme || content.tags?.[0] || 'creative',
        colors: palette,
        imageUrls: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
          "https://images.unsplash.com/photo-1496902526517-c0f2cb8fdb6a?w=800",
          "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800"
        ],
        keywords: content.tags || [theme || 'creative', 'design', 'inspiration']
      };

      // Add watermarking and ownership information
      const response = {
        success: true,
        moodBoard,
        recommendations: validation.recommendations,
        ownershipInfo: {
          ownerId: content.userId,
          timestamp: new Date().toISOString(),
          notice: "© 2023 All Rights Reserved. This content is proprietary."
        }
      };

      res.json(response);
    } catch (error) {
      console.error('AI mood board generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate mood board',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post('/api/ai/enhance/cross-platform', async (req, res) => {
    const { contentId, platforms } = req.body;

    if (!contentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content ID is required' 
      });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one platform must be specified' 
      });
    }

    try {
      // Check if user has accepted legal terms
      const userId = 1; // In a real app, get from authenticated session
      const legalStatus = await storage.getLegalAcceptanceByUser(userId, 'terms');

      if (!legalStatus) {
        return res.status(403).json({
          success: false,
          message: 'You must accept the terms of service before using AI enhancement tools',
          requiresLegalAcceptance: true
        });
      }

      // Validate the request for security and ownership
      const validation = await securityMonitor.validateAIEnhancedContent(contentId, 'cross-platform');

      if (!validation.valid && validation.issues.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Cannot enhance this content due to security/ownership restrictions',
          issues: validation.issues,
          recommendations: validation.recommendations
        });
      }

      // Get the content
      const content = await storage.getContentById(contentId);

      if (!content) {
        return res.status(404).json({ 
          success: false, 
          message: 'Content not found' 
        });
      }

      // Record this usage for security monitoring
      await securityMonitor.logSecurityActivity({
        activityType: 'ai-enhancement-usage',
        contentId,
        enhancementType: 'cross-platform',
        userId,
        platforms,
        timestamp: new Date().toISOString()
      });

      // Generate platform-specific versions
      const platformVersions = {};

      for (const platform of platforms) {
        // In a real implementation, this would use AI to tailor content
        platformVersions[platform] = {
          caption: `${platform} optimized: ${content.description || 'Check out our latest update!'}`,
          hashtags: content.tags?.map(tag => `#${tag}`) || ['#creative', '#content'],
          recommendedImageSize: getPlatformImageSize(platform),
          characterLimit: getPlatformCharLimit(platform),
          bestTimeToPost: getPlatformBestTime(platform),
          // Add ownership watermarking
          watermark: {
            visible: platform !== 'twitter', // Some platforms may have limitations
            text: `© ${new Date().getFullYear()} All Rights Reserved`,
            position: 'bottom-right'
          }
        };
      }

      // Generate a unique asset ID for verification
      const assetId = `ai-${Date.now()}-${contentId}`;

      // Register this asset in ownership database for future verification
      await storage.registerAssetOwnership({
        assetId,
        assetType: 'ai-enhanced-content',
        contentId,
        userId,
        createdAt: new Date(),
        verificationToken: `verify-${Math.random().toString(36).substring(2, 15)}`,
        verificationStatus: true
      });

      // Add comprehensive watermarking and ownership information
      const response = {
        success: true,
        platformVersions,
        recommendations: validation.recommendations,
        ownershipInfo: {
          assetId,
          ownerId: content.userId,
          timestamp: new Date().toISOString(),
          verificationUrl: `/api/security/verify-asset?assetId=${assetId}`,
          notice: `© ${new Date().getFullYear()} All Rights Reserved. This content is proprietary and protected by intellectual property law.`,
          termsOfUse: "Unauthorized reproduction, distribution, or modification is prohibited."
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Cross-platform adaptation error:', error);

      // Log the error for security monitoring
      await securityMonitor.logSecurityActivity({
        activityType: 'ai-enhancement-error',
        errorType: error.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });

      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate cross-platform adaptations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // New routes for security and ownership verification

  // Verify content ownership
  app.get('/api/security/verify-content-ownership', async (req, res) => {
    const { contentId, verificationToken } = req.query;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content ID is required'
      });
    }

    try {
      // In a real implementation, this would check the ownership database
      const isVerified = true;
      const ownerInfo = {
        userId: 1,
        ownershipTimestamp: new Date().toISOString(),
        verificationLevel: 'certified'
      };

      return res.json({
        success: true,
        verified: isVerified,
        ownerInfo,
        verificationTimestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Ownership verification error:', error);

      return res.status(500).json({
        success: false,
        message: 'Error verifying content ownership'
      });
    }
  });

  // Report unauthorized usage
  app.post('/api/security/report-unauthorized-usage', async (req, res) => {
    const { contentId, reportType, reportDetails, reporterContact } = req.body;

    if (!contentId || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'Content ID and report type are required'
      });}

    try {
      // Log the security incident
      await securityMonitor.logSecurityActivity({
        activityType: 'unauthorized-usage-report',
        contentId,
        reportType,
        reportDetails,
        reporterContact,
        timestamp: new Date().toISOString()
      });

      // Trigger high-priority security alert
      await securityMonitor.triggerSecurityAlert({
        alertType: 'ownership-violation',
        severity: 'high',
        contentId,
        details: reportDetails
      });

      return res.json({
        success: true,
        reportId: `report-${Date.now()}`,
        message: 'Your report has been submitted and will be investigated',
        nextSteps: 'Our team will review this report and may contact you for additional information.'
      });
    } catch (error) {
      console.error('Error reporting unauthorized usage:', error);

      return res.status(500).json({
        success: false,
        message: 'Error submitting report'
      });
    }
  });

  // Helper functions for platform-specific details
  function getPlatformImageSize(platform: string): string {
    const sizes = {
      instagram: '1080x1080 (square), 1080x1350 (portrait)',
      twitter: '1200x675 (landscape)',
      facebook: '1200x630 (landscape)',
      linkedin: '1200x627 (landscape)',
      tiktok: '1080x1920 (portrait)',
      pinterest: '1000x1500 (portrait)'
    };
    return sizes[platform.toLowerCase()] || '1200x630 (standard)';
  }

  function getPlatformCharLimit(platform: string): number {
    const limits = {
      instagram: 2200,
      twitter: 280,facebook: 63206,
      linkedin: 3000,
      tiktok: 2200,
      pinterest: 500
    };
    return limits[platform.toLowerCase()] || 2000;
  }

  function getPlatformBestTime(platform: string): string {
    const times = {
      instagram: 'Wednesday at 11 AM and Friday at 10–11 AM',
      twitter: 'Monday, Tuesday, Wednesday at 9 AM',
      facebook: 'Tuesday, Wednesday, Friday from 9 AM to 1 PM',
      linkedin: 'Tuesday, Wednesday, Thursday at 9 AM',
      tiktok: 'Tuesday at 9 AM, Thursday at 7 PM, Friday at 5 AM',
      pinterest: 'Friday and Saturday at 8 PM to 11 PM'
    };
    return times[platform.toLowerCase()] || 'Weekdays at 9 AM to 12 PM';
  }

  // Example API routes
  app.get('/api/hello', (req, res) => {
    res.json({ 
      message: 'Hello from server!',
      ownershipNotice: "© 2023 All Rights Reserved. This content is proprietary."
    });
  });

  // Theme routes moved above the authentication middleware

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}