import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { 
  users, type User, type InsertUser,
  content, type Content, type InsertContent,
  moodBoards, type MoodBoard, type InsertMoodBoard,
  analyticsData, type AnalyticsData, type InsertAnalyticsData,
  
  // Creative Symbiosis Framework types
  userEngagement, type UserEngagement, type InsertUserEngagement,
  evolutionPoints, type EvolutionPoints, type InsertEvolutionPoints,
  userCapabilities, type UserCapabilities, type InsertUserCapabilities,
  creativeHistory, type CreativeHistory, type InsertCreativeHistory,
  
  // Color Palette types
  colorPalettes, type ColorPalette, type InsertColorPalette
} from '@shared/schema';
import { IStorage } from './storage';

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      updatedAt: new Date(),
    }).returning();
    
    return result[0];
  }
  
  // Content methods
  async getContentByUserId(userId: number): Promise<Content[]> {
    return await db.select()
      .from(content)
      .where(and(
        eq(content.userId, userId),
        eq(content.status, 'Draft')
      ))
      .orderBy(content.createdAt);
  }
  
  async getArchivedContentByUserId(userId: number): Promise<Content[]> {
    return await db.select()
      .from(content)
      .where(and(
        eq(content.userId, userId),
        eq(content.status, 'Posted')
      ))
      .orderBy(content.createdAt);
  }
  
  async getContentById(id: number): Promise<Content | undefined> {
    const result = await db.select().from(content).where(eq(content.id, id));
    return result[0];
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const result = await db.insert(content).values({
      ...insertContent,
      engagement: 0,
      aiSentiment: 0,
      aiPrediction: 0,
      postedAt: null,
    }).returning();
    
    return result[0];
  }
  
  // Mood board methods
  async getMoodBoardsByUserId(userId: number): Promise<MoodBoard[]> {
    return await db.select()
      .from(moodBoards)
      .where(eq(moodBoards.userId, userId))
      .orderBy(moodBoards.createdAt);
  }
  
  async createMoodBoard(insertMoodBoard: InsertMoodBoard): Promise<MoodBoard> {
    const result = await db.insert(moodBoards).values(insertMoodBoard).returning();
    return result[0];
  }
  
  // Analytics methods
  async getAnalyticsByUserId(userId: number, period: string): Promise<AnalyticsData | undefined> {
    const result = await db
      .select()
      .from(analyticsData)
      .where(and(
        eq(analyticsData.userId, userId),
        eq(analyticsData.period, period)
      ));
    
    return result[0];
  }
  
  async createAnalyticsData(insertData: InsertAnalyticsData): Promise<AnalyticsData> {
    const result = await db.insert(analyticsData).values(insertData).returning();
    return result[0];
  }

  // User Engagement methods
  async getUserEngagementByUserId(userId: number): Promise<UserEngagement[]> {
    return await db.select()
      .from(userEngagement)
      .where(eq(userEngagement.userId, userId))
      .orderBy(userEngagement.createdAt);
  }

  async trackUserEngagement(engagement: InsertUserEngagement): Promise<UserEngagement> {
    const result = await db.insert(userEngagement).values(engagement).returning();
    return result[0];
  }

  // Evolution Points methods
  async getEvolutionPointsByUserId(userId: number): Promise<EvolutionPoints | undefined> {
    const result = await db.select()
      .from(evolutionPoints)
      .where(eq(evolutionPoints.userId, userId));
    return result[0];
  }

  async createEvolutionPoints(points: InsertEvolutionPoints): Promise<EvolutionPoints> {
    const result = await db.insert(evolutionPoints).values({
      ...points,
      lastPointsUpdate: new Date(),
      lastEnergyRefresh: new Date()
    }).returning();
    return result[0];
  }

  async updateEvolutionPoints(userId: number, pointsToAdd: number): Promise<EvolutionPoints> {
    // Get current points
    const userPoints = await this.getEvolutionPointsByUserId(userId);
    
    if (!userPoints) {
      return this.createEvolutionPoints({
        userId,
        totalPoints: pointsToAdd,
        currentTier: "starter",
        nextMilestone: 100,
        creativeEnergyPoints: 100
      });
    }
    
    // Calculate new total points
    const totalPoints = (userPoints.totalPoints || 0) + pointsToAdd;
    
    // Determine tier based on total points
    let currentTier = userPoints.currentTier || "starter";
    let nextMilestone = userPoints.nextMilestone || 100;
    
    if (totalPoints >= 1000) {
      currentTier = "expert";
      nextMilestone = 1500;
    } else if (totalPoints >= 500) {
      currentTier = "advanced";
      nextMilestone = 1000;
    } else if (totalPoints >= 250) {
      currentTier = "established";
      nextMilestone = 500;
    } else if (totalPoints >= 100) {
      currentTier = "growing";
      nextMilestone = 250;
    }
    
    // Update the record
    const result = await db.update(evolutionPoints)
      .set({
        totalPoints,
        currentTier,
        nextMilestone,
        lastPointsUpdate: new Date()
      })
      .where(eq(evolutionPoints.userId, userId))
      .returning();
    
    return result[0];
  }

  async refreshCreativeEnergyPoints(userId: number): Promise<EvolutionPoints> {
    const userPoints = await this.getEvolutionPointsByUserId(userId);
    
    if (!userPoints) {
      return this.createEvolutionPoints({
        userId,
        totalPoints: 0,
        currentTier: "starter",
        nextMilestone: 100,
        creativeEnergyPoints: 100 // Start with full energy
      });
    }
    
    // Calculate how many points to regenerate based on time elapsed
    const now = new Date();
    const lastUpdate = userPoints.lastPointsUpdate || new Date();
    const hoursElapsed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
    
    // Regenerate at a rate of 5 points per hour, up to a maximum based on tier
    const pointsToRegenerate = Math.min(hoursElapsed * 5, 100);
    
    // Max energy depends on tier
    let maxEnergy = 100;
    switch (userPoints.currentTier) {
      case "expert":
        maxEnergy = 200;
        break;
      case "advanced":
        maxEnergy = 150;
        break;
      case "established":
        maxEnergy = 125;
        break;
      case "growing":
        maxEnergy = 110;
        break;
    }
    
    // Update energy points
    const currentEnergy = userPoints.creativeEnergyPoints || 0;
    const newEnergyPoints = Math.min(currentEnergy + pointsToRegenerate, maxEnergy);
    
    // Update the record
    const result = await db.update(evolutionPoints)
      .set({
        creativeEnergyPoints: newEnergyPoints,
        lastPointsUpdate: now
      })
      .where(eq(evolutionPoints.userId, userId))
      .returning();
    
    return result[0];
  }

  // User Capabilities methods
  async getUserCapabilitiesByUserId(userId: number): Promise<UserCapabilities[]> {
    return await db.select()
      .from(userCapabilities)
      .where(eq(userCapabilities.userId, userId));
  }
  
  async unlockUserCapability(capability: InsertUserCapabilities): Promise<UserCapabilities> {
    const result = await db.insert(userCapabilities).values({
      ...capability,
      isUnlocked: true,
      unlockedAt: new Date(),
      expiresAt: null,
      level: capability.level || 1
    }).returning();
    
    return result[0];
  }
  
  async upgradeCapabilityLevel(userId: number, capabilityName: string): Promise<UserCapabilities> {
    // Find the capability
    const [capability] = await db.select()
      .from(userCapabilities)
      .where(and(
        eq(userCapabilities.userId, userId),
        eq(userCapabilities.capabilityName, capabilityName)
      ));
    
    if (!capability) {
      throw new Error(`Capability ${capabilityName} not found for user ${userId}`);
    }
    
    // Upgrade the level
    const result = await db.update(userCapabilities)
      .set({
        level: (capability.level || 1) + 1
      })
      .where(eq(userCapabilities.id, capability.id))
      .returning();
    
    return result[0];
  }

  // Creative History methods
  async getCreativeHistoryByUserIdAndPeriod(userId: number, period: string): Promise<CreativeHistory | undefined> {
    const result = await db.select()
      .from(creativeHistory)
      .where(and(
        eq(creativeHistory.userId, userId),
        eq(creativeHistory.period, period)
      ));
    
    return result[0];
  }
  
  async createCreativeHistory(history: InsertCreativeHistory): Promise<CreativeHistory> {
    const result = await db.insert(creativeHistory).values({
      ...history,
      date: new Date()
    }).returning();
    
    return result[0];
  }
  
  async updateCreativeHistory(userId: number, period: string, updates: Partial<InsertCreativeHistory>): Promise<CreativeHistory> {
    // Find the history record
    const history = await this.getCreativeHistoryByUserIdAndPeriod(userId, period);
    
    if (!history) {
      // If not found, create a new one with the updates
      return this.createCreativeHistory({
        userId,
        period,
        ...updates
      });
    }
    
    // Update the existing record
    const result = await db.update(creativeHistory)
      .set(updates)
      .where(and(
        eq(creativeHistory.userId, userId),
        eq(creativeHistory.period, period)
      ))
      .returning();
    
    return result[0];
  }
  
  // Color Palette methods
  async getColorPalettesByUserId(userId: number): Promise<ColorPalette[]> {
    return await db.select()
      .from(colorPalettes)
      .where(eq(colorPalettes.userId, userId))
      .orderBy(colorPalettes.createdAt);
  }
  
  async getColorPaletteById(id: number): Promise<ColorPalette | undefined> {
    const result = await db.select()
      .from(colorPalettes)
      .where(eq(colorPalettes.id, id));
    return result[0];
  }
  
  async createColorPalette(palette: InsertColorPalette): Promise<ColorPalette> {
    const result = await db.insert(colorPalettes).values({
      ...palette,
      updatedAt: new Date(),
      usageCount: 0
    }).returning();
    
    return result[0];
  }
  
  async updateColorPalette(id: number, updates: Partial<InsertColorPalette>): Promise<ColorPalette> {
    // Get current palette
    const palette = await this.getColorPaletteById(id);
    
    if (!palette) {
      throw new Error(`Color palette with id ${id} not found`);
    }
    
    // Update the record
    const result = await db.update(colorPalettes)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(colorPalettes.id, id))
      .returning();
    
    return result[0];
  }
  
  async incrementColorPaletteUsage(id: number): Promise<ColorPalette> {
    // Get current palette
    const palette = await this.getColorPaletteById(id);
    
    if (!palette) {
      throw new Error(`Color palette with id ${id} not found`);
    }
    
    // Update the usage count
    const result = await db.update(colorPalettes)
      .set({
        usageCount: (palette.usageCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(colorPalettes.id, id))
      .returning();
    
    return result[0];
  }
  
  async getColorPalettesByMood(mood: string): Promise<ColorPalette[]> {
    return await db.select()
      .from(colorPalettes)
      .where(eq(colorPalettes.mood, mood))
      .orderBy(colorPalettes.createdAt);
  }
}