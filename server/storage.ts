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
  id: string;
  email: string;
  password: string;
  name: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * MoodCapsule model interface
 */
export interface MoodCapsule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  emotion: string;
  colorPalette: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Storage interface for database operations
 */
export interface StorageInterface {
  // User management
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;

  // Token management for authentication
  storeRefreshToken(userId: string, token: string): Promise<boolean>;
  getRefreshToken(userId: string, token: string): Promise<string | null>;
  removeRefreshToken(userId: string, token: string): Promise<boolean>;

  // MoodCapsule operations
  createMoodCapsule(capsule: Omit<MoodCapsule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getMoodCapsuleById(id: string): Promise<MoodCapsule | null>;
  getMoodCapsulesByUserId(userId: string): Promise<MoodCapsule[]>;
  updateMoodCapsule(id: string, data: Partial<MoodCapsule>): Promise<boolean>;
  deleteMoodCapsule(id: string): Promise<boolean>;
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