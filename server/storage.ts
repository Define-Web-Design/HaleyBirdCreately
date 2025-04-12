import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { randomUUID } from 'crypto';

/**
 * User model interface
 */
export interface User {
  id: string | number;
  username: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Storage interface
 */
export interface IStorage {
  // User methods
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findUserById(id: string | number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  updateUser(id: string | number, data: Partial<User>): Promise<User>;
  deleteUser(id: string | number): Promise<boolean>;
}

/**
 * In-memory storage implementation for development
 */
class MemStorage implements IStorage {
  private users: User[] = [];
  private userId = 1;

  // User methods
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser = {
      ...user,
      id: this.userId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findUserById(id: string | number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async updateUser(id: string | number, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    this.users[index] = {
      ...this.users[index],
      ...data,
      updatedAt: new Date()
    };
    
    return this.users[index];
  }

  async deleteUser(id: string | number): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return false;
    }
    
    this.users.splice(index, 1);
    return true;
  }
}

/**
 * Database storage implementation for production
 */
class DbStorage implements IStorage {
  private db: any;
  
  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema });
  }

  // User methods
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async findUserById(id: string | number): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return users.length > 0 ? users[0] : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
    return users.length > 0 ? users[0] : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    return users.length > 0 ? users[0] : null;
  }

  async updateUser(id: string | number, data: Partial<User>): Promise<User> {
    const result = await this.db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('User not found');
    }
    
    return result[0];
  }

  async deleteUser(id: string | number): Promise<boolean> {
    const result = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id });
    
    return result.length > 0;
  }

  // Code snippets
  async createCodeSnippet(snippet: Omit<schema.CodeSnippetInterface, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<schema.CodeSnippetModel> {
    // Generate a unique share ID
    const shareId = this.generateShareId();
    
    const result = await this.db
      .insert(schema.codeSnippets)
      .values({
        ...snippet,
        shareId,
        viewCount: 0
      })
      .returning();
    
    return result[0];
  }

  async getCodeSnippetById(id: string | number): Promise<schema.CodeSnippetModel | null> {
    const snippets = await this.db
      .select()
      .from(schema.codeSnippets)
      .where(eq(schema.codeSnippets.id, id));
    
    return snippets.length > 0 ? snippets[0] : null;
  }

  async getCodeSnippetByShareId(shareId: string): Promise<schema.CodeSnippetModel | null> {
    const snippets = await this.db
      .select()
      .from(schema.codeSnippets)
      .where(eq(schema.codeSnippets.shareId, shareId));
    
    return snippets.length > 0 ? snippets[0] : null;
  }

  async getCodeSnippetsByUserId(userId: string | number): Promise<schema.CodeSnippetModel[]> {
    return this.db
      .select()
      .from(schema.codeSnippets)
      .where(eq(schema.codeSnippets.userId, userId));
  }

  async getPublicCodeSnippets(): Promise<schema.CodeSnippetModel[]> {
    return this.db
      .select()
      .from(schema.codeSnippets)
      .where(eq(schema.codeSnippets.isPublic, true));
  }

  async updateCodeSnippet(id: string | number, data: Partial<schema.CodeSnippetInterface>): Promise<boolean> {
    const result = await this.db
      .update(schema.codeSnippets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.codeSnippets.id, id))
      .returning({ id: schema.codeSnippets.id });
    
    return result.length > 0;
  }

  async deleteCodeSnippet(id: string | number): Promise<boolean> {
    const result = await this.db
      .delete(schema.codeSnippets)
      .where(eq(schema.codeSnippets.id, id))
      .returning({ id: schema.codeSnippets.id });
    
    return result.length > 0;
  }

  async incrementCodeSnippetViewCount(id: string | number): Promise<boolean> {
    const snippet = await this.getCodeSnippetById(id);
    if (!snippet) return false;
    
    const result = await this.db
      .update(schema.codeSnippets)
      .set({
        viewCount: snippet.viewCount + 1,
        updatedAt: new Date()
      })
      .where(eq(schema.codeSnippets.id, id))
      .returning({ id: schema.codeSnippets.id });
    
    return result.length > 0;
  }

  // Helper method to generate a unique share ID
  private generateShareId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;
    let shareId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      shareId += characters.charAt(randomIndex);
    }

    return shareId;
  }
}

// Create and export the appropriate storage implementation based on environment
const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const storage: IStorage = useInMemoryDb ? new MemStorage() : new DbStorage();

export default storage;

/**
 * Storage interface for database operations
 */
export interface StorageInterface {
  // User management
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getUserById(id: string | number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string | number, data: Partial<User>): Promise<boolean>;
  deleteUser(id: string | number): Promise<boolean>;
  getUser(id: string | number): Promise<User | null>;

  // Token management for authentication
  storeRefreshToken(userId: string | number, token: string): Promise<boolean>;
  getRefreshToken(userId: string | number, token: string): Promise<string | null>;
  removeRefreshToken(userId: string | number, token: string): Promise<boolean>;

  // MoodCapsule operations
  createMoodCapsule(capsule: Omit<MoodCapsule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | number>;
  getMoodCapsuleById(id: string | number): Promise<MoodCapsule | null>;
  getMoodCapsulesByUserId(userId: string | number): Promise<MoodCapsule[]>;
  updateMoodCapsule(id: string | number, data: Partial<MoodCapsule>): Promise<boolean>;
  deleteMoodCapsule(id: string | number): Promise<boolean>;
  archiveMoodCapsule(id: string | number): Promise<boolean>;
  
  // Platform integrations
  createPlatformIntegration(data: any): Promise<string | number>;
  getPlatformIntegrationById(id: string | number): Promise<any>;
  deactivatePlatformIntegration(id: string | number): Promise<boolean>;
  
  // Content management
  getContentByUserId(userId: string | number): Promise<any[]>;
  getArchivedContentByUserId(userId: string | number): Promise<any[]>;
  getContentById(id: string | number): Promise<any>;
  
  // Analytics
  getAnalyticsByUserId(userId: string | number): Promise<any>;
  
  // Mood boards
  getMoodBoardsByUserId(userId: string | number): Promise<any[]>;
  createMoodBoard(data: any): Promise<string | number>;
  
  // Color palettes
  getColorPalettesByUserId(userId: string | number): Promise<ColorPalette[]>;
  getColorPaletteById(id: string | number): Promise<ColorPalette | null>;
  createColorPalette(palette: Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | number>;
  updateColorPalette(id: string | number, data: Partial<ColorPalette>): Promise<boolean>;
  incrementColorPaletteUsage(id: string | number): Promise<boolean>;
  getColorPalettesByMood(mood: string): Promise<ColorPalette[]>;
  
  // Task verification
  getTaskVerificationTasksByUserId(userId: string | number): Promise<any[]>;
  verifyTask(taskId: string | number, data: any): Promise<boolean>;
  createTask(data: any): Promise<string | number>;
  updateTaskStatus(taskId: string | number, status: string): Promise<boolean>;
  updateTaskProgress(taskId: string | number, progress: number): Promise<boolean>;
  
  // User capabilities
  getUserCapabilitiesByUserId(userId: string | number): Promise<any[]>;
  unlockUserCapability(userId: string | number, capability: string): Promise<boolean>;
  upgradeCapabilityLevel(userId: string | number, capability: string, level: number): Promise<boolean>;
  
  // Creative history
  getCreativeHistoryByUserIdAndPeriod(userId: string | number, period: string): Promise<any[]>;
  updateCreativeHistory(id: string | number, data: any): Promise<boolean>;
  
  // Evolution points
  addEvolutionPoints(userId: string | number, points: number): Promise<boolean>;
  refreshCreativeEnergyPoints(userId: string | number): Promise<boolean>;
  
  // User engagement
  trackUserEngagement(userId: string | number, action: string): Promise<boolean>;
  
  // Content sentiment
  getContentSentimentById(id: string | number): Promise<any>;
  getContentSentimentsByUserId(userId: string | number): Promise<any[]>;
  analyzeContentSentiment(data: any): Promise<any>;
  
  // Caption generation
  generateCaptionForMoodCapsule(moodCapsuleId: string | number, platform: string): Promise<string>;
  
  // Legal
  recordLegalAcceptance(userId: string | number, documentType: string): Promise<boolean>;
  getLegalAcceptanceByUser(userId: string | number, documentType: string): Promise<any>;
  insertLegalAcceptance(data: any): Promise<string | number>;
  
  // Asset ownership
  getAssetOwnership(userId: string | number, assetId: string | number): Promise<any>;
  registerAssetOwnership(userId: string | number, assetId: string | number): Promise<boolean>;
  
  // Security
  getSecurityAlerts(userId: string | number): Promise<any[]>;
  
  // Code snippets
  createCodeSnippet(snippet: Omit<schema.CodeSnippetInterface, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<string | number>;
  getCodeSnippetById(id: string | number): Promise<schema.CodeSnippetInterface | null>;
  getCodeSnippetByShareId(shareId: string): Promise<schema.CodeSnippetInterface | null>;
  getCodeSnippetsByUserId(userId: string | number): Promise<schema.CodeSnippetInterface[]>;
  getPublicCodeSnippets(): Promise<schema.CodeSnippetInterface[]>;
  updateCodeSnippet(id: string | number, data: Partial<schema.CodeSnippetInterface>): Promise<boolean>;
  deleteCodeSnippet(id: string | number): Promise<boolean>;
  incrementCodeSnippetViewCount(id: string | number): Promise<boolean>;
}

/**
 * In-memory implementation of the storage interface for development/testing
 */
class InMemoryStorage implements StorageInterface {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, string[]> = new Map();
  private moodCapsules: Map<string, MoodCapsule> = new Map();
  private colorPalettes: Map<string, ColorPalette> = new Map();
  private platformIntegrations: Map<string, any> = new Map();
  private content: Map<string, any> = new Map();
  private moodBoards: Map<string, any> = new Map();
  private tasks: Map<string, any> = new Map();
  private userCapabilities: Map<string, any[]> = new Map();
  private creativeHistory: Map<string, any[]> = new Map();
  private contentSentiment: Map<string, any> = new Map();
  private legalAcceptance: Map<string, any[]> = new Map();
  private assetOwnership: Map<string, any[]> = new Map();
  private securityAlerts: Map<string, any[]> = new Map();
  private codeSnippets: Map<string, schema.CodeSnippetInterface> = new Map();

  // User management
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.users.set(id, {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async getUserById(id: string | number): Promise<User | null> {
    const strId = String(id);
    return this.users.get(strId) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string | number, data: Partial<User>): Promise<boolean> {
    const strId = String(id);
    const user = this.users.get(strId);
    if (!user) return false;

    this.users.set(strId, {
      ...user,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async deleteUser(id: string | number): Promise<boolean> {
    return this.users.delete(String(id));
  }

  async getUser(id: string | number): Promise<User | null> {
    return this.getUserById(id);
  }

  // Token management
  async storeRefreshToken(userId: string | number, token: string): Promise<boolean> {
    const strId = String(userId);
    const userTokens = this.refreshTokens.get(strId) || [];
    userTokens.push(token);
    this.refreshTokens.set(strId, userTokens);
    return true;
  }

  async getRefreshToken(userId: string | number, token: string): Promise<string | null> {
    const strId = String(userId);
    const userTokens = this.refreshTokens.get(strId) || [];
    return userTokens.includes(token) ? token : null;
  }

  async removeRefreshToken(userId: string | number, token: string): Promise<boolean> {
    const strId = String(userId);
    const userTokens = this.refreshTokens.get(strId) || [];
    const updatedTokens = userTokens.filter(t => t !== token);
    this.refreshTokens.set(strId, updatedTokens);
    return true;
  }

  // MoodCapsule operations
  async createMoodCapsule(capsule: Omit<MoodCapsule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.moodCapsules.set(id, {
      ...capsule,
      id,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async getMoodCapsuleById(id: string | number): Promise<MoodCapsule | null> {
    return this.moodCapsules.get(String(id)) || null;
  }

  async getMoodCapsulesByUserId(userId: string | number): Promise<MoodCapsule[]> {
    const strUserId = String(userId);
    const userCapsules: MoodCapsule[] = [];

    for (const capsule of this.moodCapsules.values()) {
      if (String(capsule.userId) === strUserId) {
        userCapsules.push(capsule);
      }
    }

    return userCapsules;
  }

  async updateMoodCapsule(id: string | number, data: Partial<MoodCapsule>): Promise<boolean> {
    const strId = String(id);
    const capsule = this.moodCapsules.get(strId);
    if (!capsule) return false;

    this.moodCapsules.set(strId, {
      ...capsule,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async deleteMoodCapsule(id: string | number): Promise<boolean> {
    return this.moodCapsules.delete(String(id));
  }

  async archiveMoodCapsule(id: string | number): Promise<boolean> {
    const strId = String(id);
    const capsule = this.moodCapsules.get(strId);
    if (!capsule) return false;

    this.moodCapsules.set(strId, {
      ...capsule,
      isArchived: true,
      updatedAt: new Date()
    });

    return true;
  }

  // Platform integrations
  async createPlatformIntegration(data: any): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.platformIntegrations.set(id, {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async getPlatformIntegrationById(id: string | number): Promise<any> {
    return this.platformIntegrations.get(String(id)) || null;
  }

  async deactivatePlatformIntegration(id: string | number): Promise<boolean> {
    const strId = String(id);
    const integration = this.platformIntegrations.get(strId);
    if (!integration) return false;

    this.platformIntegrations.set(strId, {
      ...integration,
      isActive: false,
      updatedAt: new Date()
    });

    return true;
  }

  // Content management
  async getContentByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    const userContent: any[] = [];

    for (const item of this.content.values()) {
      if (String(item.userId) === strUserId && !item.isArchived) {
        userContent.push(item);
      }
    }

    return userContent;
  }

  async getArchivedContentByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    const userContent: any[] = [];

    for (const item of this.content.values()) {
      if (String(item.userId) === strUserId && item.isArchived) {
        userContent.push(item);
      }
    }

    return userContent;
  }

  async getContentById(id: string | number): Promise<any> {
    return this.content.get(String(id)) || null;
  }

  // Analytics
  async getAnalyticsByUserId(userId: string | number): Promise<any> {
    // Mock analytics data
    return {
      userId: userId,
      impressions: 1000,
      engagement: 250,
      clicks: 75,
      conversions: 15
    };
  }

  // Mood boards
  async getMoodBoardsByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    const userMoodBoards: any[] = [];

    for (const board of this.moodBoards.values()) {
      if (String(board.userId) === strUserId) {
        userMoodBoards.push(board);
      }
    }

    return userMoodBoards;
  }

  async createMoodBoard(data: any): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.moodBoards.set(id, {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  // Color palettes
  async getColorPalettesByUserId(userId: string | number): Promise<ColorPalette[]> {
    const strUserId = String(userId);
    const userPalettes: ColorPalette[] = [];

    for (const palette of this.colorPalettes.values()) {
      if (String(palette.userId) === strUserId) {
        userPalettes.push(palette);
      }
    }

    return userPalettes;
  }

  async getColorPaletteById(id: string | number): Promise<ColorPalette | null> {
    return this.colorPalettes.get(String(id)) || null;
  }

  async createColorPalette(palette: Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.colorPalettes.set(id, {
      ...palette,
      id,
      usageCount: 0,
      isFavorite: false,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async updateColorPalette(id: string | number, data: Partial<ColorPalette>): Promise<boolean> {
    const strId = String(id);
    const palette = this.colorPalettes.get(strId);
    if (!palette) return false;

    this.colorPalettes.set(strId, {
      ...palette,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async incrementColorPaletteUsage(id: string | number): Promise<boolean> {
    const strId = String(id);
    const palette = this.colorPalettes.get(strId);
    if (!palette) return false;

    this.colorPalettes.set(strId, {
      ...palette,
      usageCount: (palette.usageCount || 0) + 1,
      updatedAt: new Date()
    });

    return true;
  }

  async getColorPalettesByMood(mood: string): Promise<ColorPalette[]> {
    const palettes: ColorPalette[] = [];

    for (const palette of this.colorPalettes.values()) {
      if (palette.mood === mood) {
        palettes.push(palette);
      }
    }

    return palettes;
  }

  // Task verification
  async getTaskVerificationTasksByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    const userTasks: any[] = [];

    for (const task of this.tasks.values()) {
      if (String(task.userId) === strUserId) {
        userTasks.push(task);
      }
    }

    return userTasks;
  }

  async verifyTask(taskId: string | number, data: any): Promise<boolean> {
    const strId = String(taskId);
    const task = this.tasks.get(strId);
    if (!task) return false;

    this.tasks.set(strId, {
      ...task,
      isVerified: true,
      verificationData: data,
      updatedAt: new Date()
    });

    return true;
  }

  async createTask(data: any): Promise<string> {
    const id = randomUUID();
    const now = new Date();

    this.tasks.set(id, {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async updateTaskStatus(taskId: string | number, status: string): Promise<boolean> {
    const strId = String(taskId);
    const task = this.tasks.get(strId);
    if (!task) return false;

    this.tasks.set(strId, {
      ...task,
      status,
      updatedAt: new Date()
    });

    return true;
  }

  async updateTaskProgress(taskId: string | number, progress: number): Promise<boolean> {
    const strId = String(taskId);
    const task = this.tasks.get(strId);
    if (!task) return false;

    this.tasks.set(strId, {
      ...task,
      progress,
      updatedAt: new Date()
    });

    return true;
  }

  // User capabilities
  async getUserCapabilitiesByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    return this.userCapabilities.get(strUserId) || [];
  }

  async unlockUserCapability(userId: string | number, capability: string): Promise<boolean> {
    const strUserId = String(userId);
    const capabilities = this.userCapabilities.get(strUserId) || [];
    
    // Check if capability already exists
    const existingCapability = capabilities.find(cap => cap.name === capability);
    
    if (existingCapability) {
      // Already unlocked
      return true;
    }
    
    // Add new capability
    capabilities.push({
      name: capability,
      level: 1,
      unlockedAt: new Date()
    });
    
    this.userCapabilities.set(strUserId, capabilities);
    return true;
  }

  async upgradeCapabilityLevel(userId: string | number, capability: string, level: number): Promise<boolean> {
    const strUserId = String(userId);
    const capabilities = this.userCapabilities.get(strUserId) || [];
    
    // Find the capability
    const capabilityIndex = capabilities.findIndex(cap => cap.name === capability);
    
    if (capabilityIndex === -1) {
      return false; // Capability not found
    }
    
    // Update the level
    capabilities[capabilityIndex].level = level;
    capabilities[capabilityIndex].updatedAt = new Date();
    
    this.userCapabilities.set(strUserId, capabilities);
    return true;
  }

  // Creative history
  async getCreativeHistoryByUserIdAndPeriod(userId: string | number, period: string): Promise<any[]> {
    const strUserId = String(userId);
    const history = this.creativeHistory.get(strUserId) || [];
    
    // Filter by period if needed
    if (period === 'all') {
      return history;
    }
    
    // Simple period filtering logic
    const now = new Date();
    let cutoff = new Date();
    
    switch (period) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return history;
    }
    
    return history.filter(item => new Date(item.createdAt) > cutoff);
  }

  async updateCreativeHistory(id: string | number, data: any): Promise<boolean> {
    const strId = String(id);
    const userId = data.userId;
    
    if (!userId) return false;
    
    const strUserId = String(userId);
    const history = this.creativeHistory.get(strUserId) || [];
    
    // Find the history item
    const itemIndex = history.findIndex(item => String(item.id) === strId);
    
    if (itemIndex === -1) {
      // Add new item if not found
      history.push({
        ...data,
        id: strId,
        updatedAt: new Date()
      });
    } else {
      // Update existing item
      history[itemIndex] = {
        ...history[itemIndex],
        ...data,
        updatedAt: new Date()
      };
    }
    
    this.creativeHistory.set(strUserId, history);
    return true;
  }

  // Evolution points
  async addEvolutionPoints(userId: string | number, points: number): Promise<boolean> {
    const strUserId = String(userId);
    const user = this.users.get(strUserId);
    
    if (!user) return false;
    
    // Add evolution points to user
    this.users.set(strUserId, {
      ...user,
      evolutionPoints: (user.evolutionPoints || 0) + points,
      updatedAt: new Date()
    });
    
    return true;
  }

  async refreshCreativeEnergyPoints(userId: string | number): Promise<boolean> {
    const strUserId = String(userId);
    const user = this.users.get(strUserId);
    
    if (!user) return false;
    
    // Refresh creative energy points (set to max)
    this.users.set(strUserId, {
      ...user,
      creativeEnergyPoints: 100, // Assuming 100 is max
      lastEnergyRefresh: new Date(),
      updatedAt: new Date()
    });
    
    return true;
  }

  // User engagement
  async trackUserEngagement(userId: string | number, action: string): Promise<boolean> {
    // Simple tracking implementation
    console.log(`User ${userId} performed action: ${action}`);
    return true;
  }

  // Content sentiment
  async getContentSentimentById(id: string | number): Promise<any> {
    return this.contentSentiment.get(String(id)) || null;
  }

  async getContentSentimentsByUserId(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    const sentiments: any[] = [];
    
    for (const sentiment of this.contentSentiment.values()) {
      if (String(sentiment.userId) === strUserId) {
        sentiments.push(sentiment);
      }
    }
    
    return sentiments;
  }

  async analyzeContentSentiment(data: any): Promise<any> {
    const id = randomUUID();
    const now = new Date();
    
    // Mock sentiment analysis
    const sentiment = {
      ...data,
      id,
      sentiment: 'POSITIVE', // Default sentiment
      score: 0.75,
      createdAt: now
    };
    
    this.contentSentiment.set(id, sentiment);
    return sentiment;
  }

  // Caption generation
  async generateCaptionForMoodCapsule(moodCapsuleId: string | number, platform: string): Promise<string> {
    const strId = String(moodCapsuleId);
    const capsule = this.moodCapsules.get(strId);
    
    if (!capsule) return 'No caption available';
    
    // Generate a simple caption based on mood capsule and platform
    return `${capsule.name} - A ${capsule.emotionalTone} moment shared on ${platform}. #creately`;
  }

  // Legal
  async recordLegalAcceptance(userId: string | number, documentType: string): Promise<boolean> {
    const strUserId = String(userId);
    const userAcceptances = this.legalAcceptance.get(strUserId) || [];
    
    userAcceptances.push({
      documentType,
      acceptedAt: new Date(),
      ipAddress: '127.0.0.1'
    });
    
    this.legalAcceptance.set(strUserId, userAcceptances);
    return true;
  }

  async getLegalAcceptanceByUser(userId: string | number, documentType: string): Promise<any> {
    const strUserId = String(userId);
    const userAcceptances = this.legalAcceptance.get(strUserId) || [];
    
    return userAcceptances.find(item => item.documentType === documentType);
  }

  async insertLegalAcceptance(data: any): Promise<string> {
    const id = randomUUID();
    const userId = data.userId;
    
    if (!userId) return id;
    
    const strUserId = String(userId);
    const userAcceptances = this.legalAcceptance.get(strUserId) || [];
    
    userAcceptances.push({
      ...data,
      id,
      acceptedAt: new Date()
    });
    
    this.legalAcceptance.set(strUserId, userAcceptances);
    return id;
  }

  // Asset ownership
  async getAssetOwnership(userId: string | number, assetId: string | number): Promise<any> {
    const strUserId = String(userId);
    const strAssetId = String(assetId);
    const userAssets = this.assetOwnership.get(strUserId) || [];
    
    return userAssets.find(asset => String(asset.assetId) === strAssetId);
  }

  async registerAssetOwnership(userId: string | number, assetId: string | number): Promise<boolean> {
    const strUserId = String(userId);
    const userAssets = this.assetOwnership.get(strUserId) || [];
    
    userAssets.push({
      assetId,
      registeredAt: new Date(),
      rights: 'full'
    });
    
    this.assetOwnership.set(strUserId, userAssets);
    return true;
  }

  // Security
  async getSecurityAlerts(userId: string | number): Promise<any[]> {
    const strUserId = String(userId);
    return this.securityAlerts.get(strUserId) || [];
  }

  // Code snippets
  async createCodeSnippet(snippet: Omit<schema.CodeSnippetInterface, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<string> {
    const id = randomUUID();
    const now = new Date();
    const shareId = this.generateShareId();

    this.codeSnippets.set(id, {
      ...snippet,
      id,
      viewCount: 0,
      shareId,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }

  async getCodeSnippetById(id: string | number): Promise<schema.CodeSnippetInterface | null> {
    return this.codeSnippets.get(String(id)) || null;
  }

  async getCodeSnippetByShareId(shareId: string): Promise<schema.CodeSnippetInterface | null> {
    for (const snippet of this.codeSnippets.values()) {
      if (snippet.shareId === shareId) {
        return snippet;
      }
    }
    return null;
  }

  async getCodeSnippetsByUserId(userId: string | number): Promise<schema.CodeSnippetInterface[]> {
    const strUserId = String(userId);
    const userSnippets: schema.CodeSnippetInterface[] = [];

    for (const snippet of this.codeSnippets.values()) {
      if (String(snippet.userId) === strUserId) {
        userSnippets.push(snippet);
      }
    }

    return userSnippets;
  }

  async getPublicCodeSnippets(): Promise<schema.CodeSnippetInterface[]> {
    const publicSnippets: schema.CodeSnippetInterface[] = [];

    for (const snippet of this.codeSnippets.values()) {
      if (snippet.isPublic) {
        publicSnippets.push(snippet);
      }
    }

    return publicSnippets;
  }

  async updateCodeSnippet(id: string | number, data: Partial<schema.CodeSnippetInterface>): Promise<boolean> {
    const strId = String(id);
    const snippet = this.codeSnippets.get(strId);
    if (!snippet) return false;

    this.codeSnippets.set(strId, {
      ...snippet,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async deleteCodeSnippet(id: string | number): Promise<boolean> {
    return this.codeSnippets.delete(String(id));
  }

  async incrementCodeSnippetViewCount(id: string | number): Promise<boolean> {
    const strId = String(id);
    const snippet = this.codeSnippets.get(strId);
    if (!snippet) return false;

    this.codeSnippets.set(strId, {
      ...snippet,
      viewCount: snippet.viewCount + 1,
      updatedAt: new Date()
    });

    return true;
  }

  // Helper method to generate a unique share ID
  private generateShareId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;
    let shareId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      shareId += characters.charAt(randomIndex);
    }

    // Check if the share ID already exists and regenerate if needed
    for (const snippet of this.codeSnippets.values()) {
      if (snippet.shareId === shareId) {
        return this.generateShareId(); // Recursively generate a new ID
      }
    }

    return shareId;
  }
}

// Export an instance of the in-memory storage by default
export default new InMemoryStorage();