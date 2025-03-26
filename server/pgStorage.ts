import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { 
  users, type User, type InsertUser,
  content, type Content, type InsertContent,
  moodBoards, type MoodBoard, type InsertMoodBoard,
  analyticsData, type AnalyticsData, type InsertAnalyticsData
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
}