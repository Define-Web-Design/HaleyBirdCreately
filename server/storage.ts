import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { User, Session, RefreshToken } from '../shared/schema';
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
 * MoodCapsule model interface
 */
export interface MoodCapsule {
  id: string | number;
  userId: string | number;
  name: string;
  description?: string;
  emotionalTone: string;
  captionTone?: string;
  aiGeneratedCaption?: string;
  contentIds?: number[];
  thumbnailUrl?: string;
  isArchived?: boolean;
  colorPalette?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Color Palette interface
 */
export interface ColorPalette {
  id: string | number;
  userId: string | number;
  name: string;
  colors: string[];
  mood?: string;
  usageCount?: number;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

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
}

/**
 * In-memory implementation of the storage interface for development/testing
 */
class InMemoryStorage implements StorageInterface {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, string[]> = new Map();
  private moodCapsules: Map<string, MoodCapsule> = new Map();

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

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.set(id, {
      ...user,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Token management
  async storeRefreshToken(userId: string, token: string): Promise<boolean> {
    const userTokens = this.refreshTokens.get(userId) || [];
    userTokens.push(token);
    this.refreshTokens.set(userId, userTokens);
    return true;
  }

  async getRefreshToken(userId: string, token: string): Promise<string | null> {
    const userTokens = this.refreshTokens.get(userId) || [];
    return userTokens.includes(token) ? token : null;
  }

  async removeRefreshToken(userId: string, token: string): Promise<boolean> {
    const userTokens = this.refreshTokens.get(userId) || [];
    const updatedTokens = userTokens.filter(t => t !== token);
    this.refreshTokens.set(userId, updatedTokens);
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

  async getMoodCapsuleById(id: string): Promise<MoodCapsule | null> {
    return this.moodCapsules.get(id) || null;
  }

  async getMoodCapsulesByUserId(userId: string): Promise<MoodCapsule[]> {
    const userCapsules: MoodCapsule[] = [];

    for (const capsule of this.moodCapsules.values()) {
      if (capsule.userId === userId) {
        userCapsules.push(capsule);
      }
    }

    return userCapsules;
  }

  async updateMoodCapsule(id: string, data: Partial<MoodCapsule>): Promise<boolean> {
    const capsule = this.moodCapsules.get(id);
    if (!capsule) return false;

    this.moodCapsules.set(id, {
      ...capsule,
      ...data,
      updatedAt: new Date()
    });

    return true;
  }

  async deleteMoodCapsule(id: string): Promise<boolean> {
    return this.moodCapsules.delete(id);
  }
}

// Export an instance of the in-memory storage by default
export default new InMemoryStorage();