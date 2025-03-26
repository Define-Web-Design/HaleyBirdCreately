import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeContent, generateCaption, createMoodBoard } from "./ai/content";

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

  const httpServer = createServer(app);

  return httpServer;
}
