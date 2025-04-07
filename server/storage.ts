import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { User, Session, RefreshToken } from '../shared/schema';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: { username: string, email: string, passwordHash: string, displayName?: string, avatar?: string, role?: string }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | null>;
  updateUserLastLogin(id: number): Promise<boolean>;
  
  // Session operations
  createSession(session: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  deleteSession(token: string): Promise<boolean>;
  deleteSessionsByUserId(userId: number): Promise<boolean>;
  cleanExpiredSessions(): Promise<number>; // Returns number of deleted sessions
  
  // Refresh token operations
  createRefreshToken(refreshToken: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | null>;
  getRefreshTokensByUserId(userId: number): Promise<RefreshToken[]>;
  deleteRefreshToken(token: string): Promise<boolean>;
  revokeRefreshToken(token: string): Promise<boolean>;
  deleteRefreshTokensByUserId(userId: number): Promise<boolean>;
  
  // Content operations
  getContentByUserId(userId: number): Promise<any[]>;
  getArchivedContentByUserId(userId: number): Promise<any[]>;
  getContentById(contentId: number): Promise<any | null>;
  
  // Analytics operations
  getAnalyticsByUserId(userId: number, period: string): Promise<any>;
  
  // Mood board operations
  getMoodBoardsByUserId(userId: number): Promise<any[]>;
  createMoodBoard(moodBoard: any): Promise<any>;
  
  // Task Verification operations
  getTaskVerificationTasksByUserId(userId: number): Promise<any[]>;
  verifyTask(taskId: string, userId: number): Promise<any>;
  addEvolutionPoints(userId: number, points: number): Promise<any>;
  trackUserEngagement(engagement: any): Promise<any>;
  createTask(task: any): Promise<any>;
  updateTaskStatus(taskId: string, userId: number, status: string): Promise<any>;
  updateTaskProgress(taskId: string, userId: number, progressPercentage: number): Promise<any>;
  
  // Platform Integration operations
  createPlatformIntegration(integration: any): Promise<any>;
  getPlatformIntegrationById(id: number): Promise<any>;
  deactivatePlatformIntegration(id: number): Promise<any>;
  
  // Legal acceptance operations
  recordLegalAcceptance(acceptance: any): Promise<any>;
  insertLegalAcceptance(acceptance: any): Promise<any>;
  getLegalAcceptanceByUser(userId: number, documentType: string): Promise<any>;
  
  // User capabilities
  getUserCapabilitiesByUserId(userId: number): Promise<any[]>;
  unlockUserCapability(capability: any): Promise<any>;
  upgradeCapabilityLevel(userId: number, capabilityName: string): Promise<any>;
  
  // Creative history
  getCreativeHistoryByUserIdAndPeriod(userId: number, period: string): Promise<any>;
  updateCreativeHistory(id: number, updates: any): Promise<any>;
  refreshCreativeEnergyPoints(userId: number): Promise<any>;
  
  // Color palettes
  getColorPalettesByUserId(userId: number): Promise<any[]>;
  getColorPaletteById(id: number): Promise<any>;
  createColorPalette(palette: any): Promise<any>;
  updateColorPalette(id: number, updates: any): Promise<any>;
  incrementColorPaletteUsage(id: number): Promise<any>;
  getColorPalettesByMood(mood: string): Promise<any[]>;
  
  // Mood capsules
  getMoodCapsulesByUserId(userId: number): Promise<any[]>;
  getMoodCapsuleById(id: number): Promise<any>;
  createMoodCapsule(capsule: any): Promise<any>;
  updateMoodCapsule(id: number, updates: any): Promise<any>;
  deleteMoodCapsule(id: number): Promise<boolean>;
  archiveMoodCapsule(id: number): Promise<any>;
  
  // Content sentiment
  getContentSentimentById(contentId: number): Promise<any>;
  getContentSentimentsByUserId(userId: number): Promise<any[]>;
  analyzeContentSentiment(contentIds: number[]): Promise<any[]>;
  generateCaptionForMoodCapsule(contentIds: number[], emotionalTone: string, captionTone?: string): Promise<string>;
  
  // Security and asset operations
  getAssetOwnership(assetId: string): Promise<any>;
  registerAssetOwnership(asset: any): Promise<any>;
  getSecurityAlerts(limit: number): Promise<any[]>;
  
  // User management
  getUser(userId: number): Promise<any>;
}
  cleanExpiredRefreshTokens(): Promise<number>; // Returns number of deleted refresh tokens
}

// Implementation for PostgreSQL database
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema });
  }

  // User operations
  async getUserById(id: number): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return users.length ? users[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return users.length ? users[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return users.length ? users[0] : null;
  }

  async createUser(user: { username: string, email: string, passwordHash: string, displayName?: string, avatar?: string, role?: string }): Promise<User> {
    const now = new Date();
    const [newUser] = await this.db.insert(schema.users).values({
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role || 'user',
      createdAt: now,
      updatedAt: now,
      isActive: true
    }).returning();
    
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };

    const [updatedUser] = await this.db.update(schema.users)
      .set(updatedData)
      .where(eq(schema.users.id, id))
      .returning();
    
    return updatedUser || null;
  }

  async updateUserLastLogin(id: number): Promise<boolean> {
    const result = await this.db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, id));
    
    return true; // Assuming no error means success
  }

  // Session operations
  async createSession(session: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<Session> {
    const [newSession] = await this.db.insert(schema.sessions).values({
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    }).returning();
    
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const sessions = await this.db.select().from(schema.sessions).where(eq(schema.sessions.token, token)).limit(1);
    return sessions.length ? sessions[0] : null;
  }

  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return await this.db.select().from(schema.sessions).where(eq(schema.sessions.userId, userId));
  }

  async deleteSession(token: string): Promise<boolean> {
    await this.db.delete(schema.sessions).where(eq(schema.sessions.token, token));
    return true; // Assuming no error means success
  }

  async deleteSessionsByUserId(userId: number): Promise<boolean> {
    await this.db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    return true; // Assuming no error means success
  }

  async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(schema.sessions)
      .where(
        sql`${schema.sessions.expiresAt} < ${now}`
      );
    return result ? (result as any).rowCount || 0 : 0;
  }

  // Refresh token operations
  async createRefreshToken(refreshToken: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<RefreshToken> {
    const [newRefreshToken] = await this.db.insert(schema.refreshTokens).values({
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      ipAddress: refreshToken.ipAddress || null,
      userAgent: refreshToken.userAgent || null,
      isRevoked: false
    }).returning();
    
    return newRefreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const tokens = await this.db.select().from(schema.refreshTokens).where(eq(schema.refreshTokens.token, token)).limit(1);
    return tokens.length ? tokens[0] : null;
  }
  
  // Keep old method for backwards compatibility
  async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.getRefreshToken(token);
  }

  async getRefreshTokensByUserId(userId: number): Promise<RefreshToken[]> {
    return await this.db.select().from(schema.refreshTokens).where(eq(schema.refreshTokens.userId, userId));
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    await this.db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, token));
    return true;
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    await this.db.update(schema.refreshTokens)
      .set({ isRevoked: true })
      .where(eq(schema.refreshTokens.token, token));
    return true;
  }

  async deleteRefreshTokensByUserId(userId: number): Promise<boolean> {
    await this.db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.userId, userId));
    return true;
  }

  async cleanExpiredRefreshTokens(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(schema.refreshTokens)
      .where(
        sql`${schema.refreshTokens.expiresAt} < ${now}`
      );
    return result ? (result as any).rowCount || 0 : 0;
  }
}

// In-memory storage for development/testing
export class MemStorage implements IStorage {
  private users: User[] = [];
  private sessions: Session[] = [];
  private refreshTokens: RefreshToken[] = [];
  private userId = 1;
  private sessionId = 1;
  private refreshTokenId = 1;

  // User operations
  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async createUser(user: { username: string, email: string, passwordHash: string, displayName?: string, avatar?: string, role?: string }): Promise<User> {
    const now = new Date();
    const newUser: User = {
      id: this.userId++,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName || null,
      avatar: user.avatar || null,
      role: user.role || 'user',
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      isActive: true
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async updateUserLastLogin(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      lastLogin: new Date()
    };
    
    return true;
  }

  // Session operations
  async createSession(session: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<Session> {
    const newSession: Session = {
      id: this.sessionId++,
      userId: session.userId,
      token: session.token,
      createdAt: new Date(),
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress || null,
      userAgent: session.userAgent || null
    };
    
    this.sessions.push(newSession);
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessions.find(session => session.token === token) || null;
  }

  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return this.sessions.filter(session => session.userId === userId);
  }

  async deleteSession(token: string): Promise<boolean> {
    this.sessions = this.sessions.filter(session => session.token !== token);
    return true;
  }

  async deleteSessionsByUserId(userId: number): Promise<boolean> {
    this.sessions = this.sessions.filter(session => session.userId !== userId);
    return true;
  }

  async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    const expiredCount = this.sessions.filter(session => session.expiresAt < now).length;
    this.sessions = this.sessions.filter(session => session.expiresAt >= now);
    return expiredCount;
  }
  
  // Refresh token operations
  async createRefreshToken(refreshToken: { userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string }): Promise<RefreshToken> {
    const newRefreshToken: RefreshToken = {
      id: this.refreshTokenId++,
      userId: refreshToken.userId,
      token: refreshToken.token,
      createdAt: new Date(),
      expiresAt: refreshToken.expiresAt,
      isRevoked: false,
      ipAddress: refreshToken.ipAddress || null,
      userAgent: refreshToken.userAgent || null
    };
    
    this.refreshTokens.push(newRefreshToken);
    return newRefreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokens.find(rt => rt.token === token) || null;
  }
  
  // Keep old method for backwards compatibility
  async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.getRefreshToken(token);
  }

  async getRefreshTokensByUserId(userId: number): Promise<RefreshToken[]> {
    return this.refreshTokens.filter(rt => rt.userId === userId);
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
    return true;
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    const tokenIndex = this.refreshTokens.findIndex(rt => rt.token === token);
    if (tokenIndex === -1) return false;
    
    this.refreshTokens[tokenIndex] = {
      ...this.refreshTokens[tokenIndex],
      isRevoked: true
    };
    
    return true;
  }

  async deleteRefreshTokensByUserId(userId: number): Promise<boolean> {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.userId !== userId);
    return true;
  }

  async cleanExpiredRefreshTokens(): Promise<number> {
    const now = new Date();
    const expiredCount = this.refreshTokens.filter(rt => rt.expiresAt < now).length;
    this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt >= now);
    return expiredCount;
  }
}

// Create and export a storage instance
let storageInstance: IStorage;

if (process.env.USE_IN_MEMORY_DB === 'true') {
  storageInstance = new MemStorage();
} else {
  storageInstance = new PostgresStorage();
}

export default storageInstance;