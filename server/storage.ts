import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from './db';
import {
  users, User, InsertUser,
  content, Content, InsertContent,
  moodBoards, MoodBoard, InsertMoodBoard,
  analyticsData, AnalyticsData, InsertAnalyticsData,
  platformIntegrations, PlatformIntegration, InsertPlatformIntegration,
  userEngagement, UserEngagement, InsertUserEngagement,
  evolutionPoints, EvolutionPoints, InsertEvolutionPoints,
  userCapabilities, UserCapabilities, InsertUserCapabilities,
  creativeHistory, CreativeHistory, InsertCreativeHistory,
  colorPalettes, ColorPalette, InsertColorPalette,
  moodCapsules, MoodCapsule, InsertMoodCapsule,
  contentSentiment, ContentSentiment, InsertContentSentiment,
  legalAcceptance, LegalAcceptance, InsertLegalAcceptance,
  securityAlerts, SecurityAlert, InsertSecurityAlert,
  accessAttempts, AccessAttempt, InsertAccessAttempt,
  assetOwnership, AssetOwnership, InsertAssetOwnership,
  taskVerification, TaskVerification, InsertTaskVerification
} from '../shared/schema';

class Storage {
  // User functions
  async createUser(userData: InsertUser): Promise<User> {
    const createdUsers = await db.insert(users).values(userData).returning();
    return createdUsers[0];
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const updatedUsers = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUsers[0];
  }

  // Content functions
  async createContent(contentData: InsertContent): Promise<Content> {
    const createdContent = await db.insert(content).values(contentData).returning();
    return createdContent[0];
  }

  async getContentById(id: number): Promise<Content | null> {
    const result = await db.select().from(content).where(eq(content.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getContentByUserId(userId: number): Promise<Content[]> {
    return await db.select().from(content).where(eq(content.userId, userId));
  }

  async updateContent(id: number, contentData: Partial<Content>): Promise<Content> {
    const updatedContent = await db
      .update(content)
      .set(contentData)
      .where(eq(content.id, id))
      .returning();
    return updatedContent[0];
  }

  // MoodBoard functions
  async createMoodBoard(moodBoardData: InsertMoodBoard): Promise<MoodBoard> {
    const createdMoodBoards = await db.insert(moodBoards).values(moodBoardData).returning();
    return createdMoodBoards[0];
  }

  async getMoodBoardById(id: number): Promise<MoodBoard | null> {
    const result = await db.select().from(moodBoards).where(eq(moodBoards.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getMoodBoardsByUserId(userId: number): Promise<MoodBoard[]> {
    return await db.select().from(moodBoards).where(eq(moodBoards.userId, userId));
  }

  async updateMoodBoard(id: number, moodBoardData: Partial<MoodBoard>): Promise<MoodBoard> {
    const updatedMoodBoards = await db
      .update(moodBoards)
      .set(moodBoardData)
      .where(eq(moodBoards.id, id))
      .returning();
    return updatedMoodBoards[0];
  }

  // AnalyticsData functions
  async createAnalyticsData(analyticsData: InsertAnalyticsData): Promise<AnalyticsData> {
    const createdAnalyticsData = await db
      .insert(analyticsData)
      .values(analyticsData)
      .returning();
    return createdAnalyticsData[0];
  }

  async getAnalyticsDataByUserId(userId: number): Promise<AnalyticsData[]> {
    return await db
      .select()
      .from(analyticsData)
      .where(eq(analyticsData.userId, userId))
      .orderBy(desc(analyticsData.date));
  }

  // MoodCapsule functions
  async createMoodCapsule(capsuleData: InsertMoodCapsule): Promise<MoodCapsule> {
    const createdCapsules = await db.insert(moodCapsules).values(capsuleData).returning();
    return createdCapsules[0];
  }

  async getMoodCapsuleById(id: number): Promise<MoodCapsule | null> {
    const result = await db.select().from(moodCapsules).where(eq(moodCapsules.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getMoodCapsulesByUserId(userId: number): Promise<MoodCapsule[]> {
    return await db
      .select()
      .from(moodCapsules)
      .where(eq(moodCapsules.userId, userId))
      .orderBy(desc(moodCapsules.createdAt));
  }

  async updateMoodCapsule(id: number, capsuleData: Partial<MoodCapsule>): Promise<MoodCapsule> {
    const updatedCapsules = await db
      .update(moodCapsules)
      .set({ ...capsuleData, updatedAt: new Date() })
      .where(eq(moodCapsules.id, id))
      .returning();
    return updatedCapsules[0];
  }
  
  // Delete a mood capsule
  async deleteMoodCapsule(id: number): Promise<boolean> {
    try {
      await db
        .delete(moodCapsules)
        .where(eq(moodCapsules.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting mood capsule:', error);
      return false;
    }
  }

  // Archive a mood capsule
  async archiveMoodCapsule(id: number): Promise<MoodCapsule> {
    const updatedCapsule = await db
      .update(moodCapsules)
      .set({
        isArchived: true,
        updatedAt: new Date()
      })
      .where(eq(moodCapsules.id, id))
      .returning();
    return updatedCapsule[0];
  }

  // Security and Legal functions
  async insertLegalAcceptance(data: InsertLegalAcceptance): Promise<LegalAcceptance> {
    const result = await db.insert(legalAcceptance).values(data).returning();
    return result[0];
  }

  async getLegalAcceptanceByUser(userId: number, documentType: string): Promise<LegalAcceptance | null> {
    const result = await db
      .select()
      .from(legalAcceptance)
      .where(
        and(
          eq(legalAcceptance.userId, userId),
          eq(legalAcceptance.documentType, documentType)
        )
      )
      .orderBy(desc(legalAcceptance.acceptedAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async insertSecurityAlert(data: InsertSecurityAlert): Promise<SecurityAlert> {
    const result = await db.insert(securityAlerts).values(data).returning();
    return result[0];
  }

  async getSecurityAlerts(limit: number = 50): Promise<SecurityAlert[]> {
    return await db
      .select()
      .from(securityAlerts)
      .orderBy(desc(securityAlerts.timestamp))
      .limit(limit);
  }

  async resolveSecurityAlert(id: number, notes: string): Promise<SecurityAlert> {
    const result = await db
      .update(securityAlerts)
      .set({ resolved: true, resolutionNotes: notes })
      .where(eq(securityAlerts.id, id))
      .returning();

    return result[0];
  }

  async trackAccessAttempt(data: InsertAccessAttempt): Promise<AccessAttempt> {
    const result = await db.insert(accessAttempts).values(data).returning();
    return result[0];
  }

  async getRecentAccessAttempts(ipAddress: string, minutes: number = 5): Promise<AccessAttempt[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    return await db
      .select()
      .from(accessAttempts)
      .where(
        and(
          eq(accessAttempts.ipAddress, ipAddress),
          gte(accessAttempts.timestamp, cutoffTime)
        )
      )
      .orderBy(desc(accessAttempts.timestamp));
  }

  async insertAssetOwnership(data: InsertAssetOwnership): Promise<AssetOwnership> {
    const result = await db.insert(assetOwnership).values(data).returning();
    return result[0];
  }

  async getAssetOwnership(assetId: string): Promise<AssetOwnership | null> {
    const result = await db
      .select()
      .from(assetOwnership)
      .where(eq(assetOwnership.assetId, assetId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async getAllAssetOwnerships(): Promise<AssetOwnership[]> {
    return await db.select().from(assetOwnership);
  }

  async updateAssetVerificationStatus(id: number, status: boolean): Promise<AssetOwnership> {
    const result = await db
      .update(assetOwnership)
      .set({ 
        verificationStatus: status,
        lastVerifiedAt: new Date()
      })
      .where(eq(assetOwnership.id, id))
      .returning();

    return result[0];
  }

  // Platform Integration methods
  async createPlatformIntegration(data: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const createdIntegration = await db.insert(platformIntegrations).values(data).returning();
    return createdIntegration[0];
  }

  async getPlatformIntegrationById(id: number): Promise<PlatformIntegration | null> {
    const result = await db.select().from(platformIntegrations).where(eq(platformIntegrations.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getPlatformIntegrationsByUserId(userId: number): Promise<PlatformIntegration[]> {
    return await db.select().from(platformIntegrations).where(eq(platformIntegrations.userId, userId));
  }

  async deactivatePlatformIntegration(id: number): Promise<boolean> {
    const updatedRows = await db.update(platformIntegrations).set({isActive: false}).where(eq(platformIntegrations.id, id));
    return updatedRows.rowsAffected > 0;
  }

  // ColorPalette functions
  async createColorPalette(paletteData: InsertColorPalette): Promise<ColorPalette> {
    const createdPalettes = await db.insert(colorPalettes).values(paletteData).returning();
    return createdPalettes[0];
  }

  async getColorPaletteById(id: number): Promise<ColorPalette | null> {
    const result = await db.select().from(colorPalettes).where(eq(colorPalettes.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getColorPalettesByUserId(userId: number): Promise<ColorPalette[]> {
    return await db
      .select()
      .from(colorPalettes)
      .where(eq(colorPalettes.userId, userId))
      .orderBy(desc(colorPalettes.createdAt));
  }

  async getColorPalettesByMood(mood: string): Promise<ColorPalette[]> {
    return await db
      .select()
      .from(colorPalettes)
      .where(eq(colorPalettes.mood, mood))
      .orderBy(desc(colorPalettes.createdAt));
  }

  async updateColorPalette(id: number, paletteData: Partial<ColorPalette>): Promise<ColorPalette> {
    const updatedPalettes = await db
      .update(colorPalettes)
      .set({ ...paletteData, updatedAt: new Date() })
      .where(eq(colorPalettes.id, id))
      .returning();
    return updatedPalettes[0];
  }

  async toggleFavoritePalette(id: number): Promise<ColorPalette> {
    // First get current state
    const palette = await this.getColorPaletteById(id);
    if (!palette) throw new Error("Palette not found");
    
    // Toggle favorite state
    const updatedPalettes = await db
      .update(colorPalettes)
      .set({ 
        isFavorite: !palette.isFavorite,
        updatedAt: new Date()
      })
      .where(eq(colorPalettes.id, id))
      .returning();
    return updatedPalettes[0];
  }

  async incrementPaletteUsage(id: number): Promise<ColorPalette> {
    const palette = await this.getColorPaletteById(id);
    if (!palette) throw new Error("Palette not found");
    
    // Safely handle null usageCount
    const currentUsageCount = palette.usageCount || 0;
    
    const updatedPalettes = await db
      .update(colorPalettes)
      .set({ 
        usageCount: currentUsageCount + 1,
        updatedAt: new Date()
      })
      .where(eq(colorPalettes.id, id))
      .returning();
    return updatedPalettes[0];
  }
  
  // Alias method to match route name
  async incrementColorPaletteUsage(id: number): Promise<ColorPalette> {
    return this.incrementPaletteUsage(id);
  }

  // ContentSentiment functions
  async createContentSentiment(sentimentData: InsertContentSentiment): Promise<ContentSentiment> {
    const createdSentiments = await db.insert(contentSentiment).values(sentimentData).returning();
    return createdSentiments[0];
  }

  async getContentSentimentById(id: number): Promise<ContentSentiment | null> {
    const result = await db.select().from(contentSentiment).where(eq(contentSentiment.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getContentSentimentByContentId(contentId: number): Promise<ContentSentiment | null> {
    const result = await db.select().from(contentSentiment).where(eq(contentSentiment.contentId, contentId)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async getContentSentimentsByUserId(userId: number): Promise<ContentSentiment[]> {
    return await db
      .select()
      .from(contentSentiment)
      .where(eq(contentSentiment.userId, userId))
      .orderBy(desc(contentSentiment.analyzedAt));
  }

  async updateContentSentiment(id: number, sentimentData: Partial<ContentSentiment>): Promise<ContentSentiment> {
    const updatedSentiments = await db
      .update(contentSentiment)
      .set({ 
        ...sentimentData, 
        analyzedAt: new Date() 
      })
      .where(eq(contentSentiment.id, id))
      .returning();
    return updatedSentiments[0];
  }
  
  // Analyze content sentiment using AI
  async analyzeContentSentiment(userId: number, contentId: number): Promise<ContentSentiment> {
    try {
      // First, get the content
      const contentItem = await this.getContentById(contentId);
      if (!contentItem) {
        throw new Error("Content not found");
      }
      
      // Check if sentiment already exists
      const existingSentiment = await this.getContentSentimentByContentId(contentId);
      if (existingSentiment) {
        return existingSentiment;
      }
      
      // Simple mock sentiment analysis for now
      // In a real app, this would use the OpenAI API to analyze content
      const mockSentiments = ["happy", "excited", "calm", "thoughtful", "passionate", "nostalgic"];
      const randomSentiment = mockSentiments[Math.floor(Math.random() * mockSentiments.length)];
      const sentimentScore = Math.random() * 10; // 0-10 score
      
      // Create sentiment record
      const newSentiment = await this.createContentSentiment({
        userId,
        contentId,
        dominantEmotion: randomSentiment,
        sentimentScore,
        keywords: JSON.stringify(["creative", "colorful", "expressive"]),
        emotionalTags: JSON.stringify([randomSentiment, "creative"]),
        analysisDetails: JSON.stringify({
          sentiment: randomSentiment,
          score: sentimentScore,
          confidence: 0.85
        })
      });
      
      return newSentiment;
    } catch (error) {
      console.error("Error analyzing content sentiment:", error);
      throw error;
    }
  }
  
  // Generate captions for mood capsules
  async generateCaptionForMoodCapsule(moodCapsuleId: number, emotionalTone: string, captionTone: string): Promise<string> {
    try {
      // Get the mood capsule
      const capsule = await this.getMoodCapsuleById(moodCapsuleId);
      if (!capsule) {
        throw new Error("Mood capsule not found");
      }
      
      // Get content IDs from the capsule
      const contentIds = capsule.contentIds as number[];
      if (!contentIds || contentIds.length === 0) {
        throw new Error("No content found in the mood capsule");
      }
      
      // Simple mock caption generation for now
      // In a real app, this would use the OpenAI API to generate captions
      const toneAdjectives = {
        "professional": ["refined", "authoritative", "established"],
        "casual": ["relaxed", "approachable", "friendly"],
        "witty": ["clever", "playful", "engaging"],
        "inspirational": ["uplifting", "motivational", "encouraging"]
      };
      
      const emotionAdjectives = {
        "happy": ["joyful", "delighted", "cheerful"],
        "calm": ["peaceful", "tranquil", "serene"],
        "nostalgic": ["reminiscent", "wistful", "retrospective"],
        "energetic": ["vibrant", "dynamic", "lively"]
      };
      
      // Default to casual and happy if tones not provided
      const toneList = toneAdjectives[captionTone] || toneAdjectives.casual;
      const emotionList = emotionAdjectives[emotionalTone] || emotionAdjectives.happy;
      
      // Pick random adjectives
      const toneAdj = toneList[Math.floor(Math.random() * toneList.length)];
      const emotionAdj = emotionList[Math.floor(Math.random() * emotionList.length)];
      
      // Construct simple caption
      const captions = [
        `Feeling ${emotionAdj} today. Here's a ${toneAdj} moment captured in my creative journey.`,
        `This ${emotionAdj} collection reflects my ${toneAdj} side.`,
        `Embracing ${emotionAdj} vibes with this ${toneAdj} creative expression.`,
        `A ${toneAdj} glimpse into my ${emotionAdj} creative world.`
      ];
      
      return captions[Math.floor(Math.random() * captions.length)];
    } catch (error) {
      console.error("Error generating caption:", error);
      throw error;
    }
  }

  // Creative Symbiosis Framework functions
  async createUserEngagement(engagementData: InsertUserEngagement): Promise<UserEngagement> {
    const createdEngagements = await db.insert(userEngagement).values(engagementData).returning();
    return createdEngagements[0];
  }
  
  async trackUserEngagement(engagementData: InsertUserEngagement): Promise<UserEngagement> {
    // Create engagement record
    const engagement = await this.createUserEngagement(engagementData);
    
    // If points are included, add them to user's evolution points
    if (engagementData.points && engagementData.points > 0) {
      await this.addEvolutionPoints(engagementData.userId, engagementData.points);
    }
    
    return engagement;
  }

  async getUserEngagementsByUserId(userId: number): Promise<UserEngagement[]> {
    return await db
      .select()
      .from(userEngagement)
      .where(eq(userEngagement.userId, userId))
      .orderBy(desc(userEngagement.createdAt));
  }

  async getEvolutionPointsByUserId(userId: number): Promise<EvolutionPoints | null> {
    const result = await db.select().from(evolutionPoints).where(eq(evolutionPoints.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async createEvolutionPoints(pointsData: InsertEvolutionPoints): Promise<EvolutionPoints> {
    const createdPoints = await db.insert(evolutionPoints).values(pointsData).returning();
    return createdPoints[0];
  }

  async updateEvolutionPoints(userId: number, pointsData: Partial<EvolutionPoints>): Promise<EvolutionPoints> {
    const updatedPoints = await db
      .update(evolutionPoints)
      .set({ 
        ...pointsData, 
        lastPointsUpdate: new Date() 
      })
      .where(eq(evolutionPoints.userId, userId))
      .returning();
    return updatedPoints[0];
  }

  async addEvolutionPoints(userId: number, pointsToAdd: number): Promise<EvolutionPoints> {
    // First get the current points
    const userPoints = await this.getEvolutionPointsByUserId(userId);
    
    if (!userPoints) {
      // If user doesn't have points yet, create new record
      return await this.createEvolutionPoints({
        userId,
        totalPoints: pointsToAdd,
        currentTier: "Starter",
        nextMilestone: 100,
        creativeEnergyPoints: 100
      });
    }
    
    // Add points and determine new tier (safely handle null)
    const currentTotalPoints = userPoints.totalPoints || 0;
    const newTotalPoints = currentTotalPoints + pointsToAdd;
    let currentTier = userPoints.currentTier;
    let nextMilestone = userPoints.nextMilestone;
    
    // Update tier based on total points
    if (newTotalPoints >= 1000) {
      currentTier = "Expert";
      nextMilestone = 0; // Max tier
    } else if (newTotalPoints >= 500) {
      currentTier = "Advanced";
      nextMilestone = 1000;
    } else if (newTotalPoints >= 250) {
      currentTier = "Established";
      nextMilestone = 500;
    } else if (newTotalPoints >= 100) {
      currentTier = "Growing";
      nextMilestone = 250;
    } else {
      currentTier = "Starter";
      nextMilestone = 100;
    }
    
    // Update points in database
    return await this.updateEvolutionPoints(userId, {
      totalPoints: newTotalPoints,
      currentTier,
      nextMilestone
    });
  }

  async getUserCapabilities(userId: number): Promise<UserCapabilities[]> {
    return await db
      .select()
      .from(userCapabilities)
      .where(eq(userCapabilities.userId, userId));
  }
  
  async getUserCapabilitiesByUserId(userId: number): Promise<UserCapabilities[]> {
    return await db
      .select()
      .from(userCapabilities)
      .where(eq(userCapabilities.userId, userId));
  }

  async createUserCapability(capabilityData: InsertUserCapabilities): Promise<UserCapabilities> {
    const createdCapabilities = await db.insert(userCapabilities).values(capabilityData).returning();
    return createdCapabilities[0];
  }
  
  async updateUserCapability(id: number, capabilityData: Partial<UserCapabilities>): Promise<UserCapabilities> {
    const updatedCapabilities = await db
      .update(userCapabilities)
      .set(capabilityData)
      .where(eq(userCapabilities.id, id))
      .returning();
    return updatedCapabilities[0];
  }

  async unlockUserCapability(capabilityData: InsertUserCapabilities): Promise<UserCapabilities> {
    // Extract data
    const userId = capabilityData.userId;
    const capabilityName = capabilityData.capabilityName;
    const level = capabilityData.level || 1;
    
    // Check if capability already exists
    const existingCapability = await db
      .select()
      .from(userCapabilities)
      .where(
        and(
          eq(userCapabilities.userId, userId),
          eq(userCapabilities.capabilityName, capabilityName)
        )
      )
      .limit(1);
      
    if (existingCapability.length > 0) {
      // Update existing capability
      const result = await db.update(userCapabilities)
        .set({ 
          isUnlocked: true,
          level: level || existingCapability[0].level,
          unlockedAt: new Date()
        })
        .where(eq(userCapabilities.id, existingCapability[0].id))
        .returning();
      return result[0];
    }
    
    // Create new capability record
    const now = new Date();
    const result = await db.insert(userCapabilities)
      .values({
        userId,
        capabilityName,
        isUnlocked: true,
        level: level || 1,
        unlockedAt: now
      })
      .returning();
    
    // Update user engagement and creative history
    await this.trackUserEngagement({
      userId,
      engagementType: 'capability_unlocked',
      engagementDetails: JSON.stringify({
        capabilityName,
        timestamp: now.toISOString()
      }),
      points: 10 // Award extra points for unlocking capabilities
    });
    
    return result[0];
  }
  
  async upgradeCapabilityLevel(userId: number, capabilityName: string): Promise<UserCapabilities> {
    // Find the capability
    const capability = await db
      .select()
      .from(userCapabilities)
      .where(
        and(
          eq(userCapabilities.userId, userId),
          eq(userCapabilities.capabilityName, capabilityName)
        )
      )
      .limit(1);
      
    if (capability.length === 0) {
      throw new Error("Capability not found");
    }
    
    // Calculate new level
    const currentLevel = capability[0].level || 1;
    const newLevel = currentLevel + 1;
    
    // Update the capability
    const result = await db.update(userCapabilities)
      .set({ level: newLevel })
      .where(eq(userCapabilities.id, capability[0].id))
      .returning();
    
    // Update user engagement
    await this.trackUserEngagement({
      userId,
      engagementType: 'capability_upgraded',
      engagementDetails: JSON.stringify({
        capabilityName,
        fromLevel: currentLevel,
        toLevel: newLevel,
        timestamp: new Date().toISOString()
      }),
      points: 5 // Award points for upgrading
    });
    
    return result[0];
  }

  async getCreativeHistory(userId: number, period: string): Promise<CreativeHistory | null> {
    const result = await db
      .select()
      .from(creativeHistory)
      .where(
        and(
          eq(creativeHistory.userId, userId),
          eq(creativeHistory.period, period)
        )
      )
      .orderBy(desc(creativeHistory.date))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
  
  async getCreativeHistoryByUserIdAndPeriod(userId: number, period: string): Promise<CreativeHistory | null> {
    return this.getCreativeHistory(userId, period);
  }

  async createCreativeHistory(historyData: InsertCreativeHistory): Promise<CreativeHistory> {
    const createdHistory = await db.insert(creativeHistory).values(historyData).returning();
    return createdHistory[0];
  }

  async updateCreativeHistory(id: number, historyData: Partial<CreativeHistory>): Promise<CreativeHistory> {
    const updatedHistory = await db
      .update(creativeHistory)
      .set({ ...historyData, date: new Date() })
      .where(eq(creativeHistory.id, id))
      .returning();
    return updatedHistory[0];
  }

  async refreshCreativeEnergyPoints(userId: number): Promise<EvolutionPoints> {
    // Get current user points
    const userPoints = await this.getEvolutionPointsByUserId(userId);
    if (!userPoints) {
      throw new Error("User points record not found");
    }
    
    // Calculate time since last refresh
    const now = new Date();
    // Safely handle null lastEnergyRefresh
    const lastRefresh = userPoints.lastEnergyRefresh ? new Date(userPoints.lastEnergyRefresh) : new Date(Date.now() - 3600000); // Default to 1 hour ago
    const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
    
    // Calculate points to add (5 per hour)
    const pointsToAdd = Math.floor(hoursSinceRefresh * 5);
    
    if (pointsToAdd <= 0) {
      return userPoints; // No points to add
    }
    
    // Calculate max points based on tier
    let maxPoints = 100; // Default for Starter
    
    if (userPoints.currentTier === "Growing") {
      maxPoints = 125;
    } else if (userPoints.currentTier === "Established") {
      maxPoints = 150;
    } else if (userPoints.currentTier === "Advanced") {
      maxPoints = 175;
    } else if (userPoints.currentTier === "Expert") {
      maxPoints = 200;
    }
    
    // Calculate new energy points (not exceeding max)
    // Safely handle null creativeEnergyPoints
    const currentEnergyPoints = userPoints.creativeEnergyPoints || 0;
    const newEnergyPoints = Math.min(currentEnergyPoints + pointsToAdd, maxPoints);
    
    // Update points in database
    return await this.updateEvolutionPoints(userId, {
      creativeEnergyPoints: newEnergyPoints,
      lastEnergyRefresh: now
    });
  }

  // Task Verification functions
  async createTask(data: InsertTaskVerification): Promise<TaskVerification> {
    const insertedTask = await db.insert(taskVerification).values(data).returning();
    return insertedTask[0];
  }
  
  async getTaskVerificationTasksByUserId(userId: number): Promise<TaskVerification[]> {
    return await db
      .select()
      .from(taskVerification)
      .where(eq(taskVerification.userId, userId))
      .orderBy(desc(taskVerification.createdAt));
  }
  
  async getTaskById(taskId: number): Promise<TaskVerification | null> {
    const result = await db
      .select()
      .from(taskVerification)
      .where(eq(taskVerification.id, taskId))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
  
  async verifyTask(taskId: string, userId: number): Promise<TaskVerification | null> {
    const taskIdNum = parseInt(taskId);
    
    if (isNaN(taskIdNum)) {
      return null;
    }
    
    // Get the task first to ensure it exists
    const task = await this.getTaskById(taskIdNum);
    
    if (!task || task.userId !== userId || task.status !== 'completed') {
      return null;
    }
    
    // Update the task status to verified
    const updatedTask = await db
      .update(taskVerification)
      .set({ 
        status: 'verified',
        verifiedAt: new Date()
      })
      .where(eq(taskVerification.id, taskIdNum))
      .returning();
    
    return updatedTask.length > 0 ? updatedTask[0] : null;
  }
  
  async updateTaskStatus(taskId: number, status: string): Promise<TaskVerification | null> {
    const updates: any = { status };
    
    // If the status is being set to completed, update completedAt
    if (status === 'completed') {
      updates.completedAt = new Date();
    }
    
    const updatedTask = await db
      .update(taskVerification)
      .set(updates)
      .where(eq(taskVerification.id, taskId))
      .returning();
    
    return updatedTask.length > 0 ? updatedTask[0] : null;
  }
}

export const storage = new Storage();