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
  assetOwnership, AssetOwnership, InsertAssetOwnership
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
    const updatedRows = await db.update(platformIntegrations).set({active: false}).where(eq(platformIntegrations.id, id));
    return updatedRows.rowsAffected > 0;
  }
}

export const storage = new Storage();