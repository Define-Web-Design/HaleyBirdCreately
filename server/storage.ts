import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and, or, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as schema from '../shared/schema';

export interface IStorage {
  // User methods
  registerUser(username: string, email: string, password: string): Promise<schema.User>;
  loginUser(email: string, password: string): Promise<schema.User | null>;
  getUserById(id: number): Promise<schema.User | null>;
  updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | null>;
  
  // Code snippet methods
  createCodeSnippet(snippet: Omit<schema.InsertCodeSnippet, 'shareId'>): Promise<schema.CodeSnippet>;
  getCodeSnippetById(id: number): Promise<schema.CodeSnippet | null>;
  getCodeSnippetByShareId(shareId: string): Promise<schema.CodeSnippet | null>;
  getCodeSnippetsByUserId(userId: number): Promise<schema.CodeSnippet[]>;
  getPublicCodeSnippets(): Promise<schema.CodeSnippet[]>;
  updateCodeSnippet(id: number, data: Partial<schema.CodeSnippet>): Promise<schema.CodeSnippet | null>;
  deleteCodeSnippet(id: number): Promise<boolean>;
  incrementCodeSnippetViewCount(id: number): Promise<schema.CodeSnippet | null>;
  
  // Color palette methods
  createColorPalette(palette: schema.InsertColorPalette): Promise<schema.ColorPalette>;
  getColorPaletteById(id: number): Promise<schema.ColorPalette | null>;
  getColorPalettesByUserId(userId: number): Promise<schema.ColorPalette[]>;
  getPublicColorPalettes(): Promise<schema.ColorPalette[]>;
  updateColorPalette(id: number, data: Partial<schema.ColorPalette>): Promise<schema.ColorPalette | null>;
  deleteColorPalette(id: number): Promise<boolean>;
  
  // Mood capsule methods
  createMoodCapsule(capsule: schema.InsertMoodCapsule): Promise<schema.MoodCapsule>;
  getMoodCapsuleById(id: number): Promise<schema.MoodCapsule | null>;
  getMoodCapsulesByUserId(userId: number): Promise<schema.MoodCapsule[]>;
  getPublicMoodCapsules(): Promise<schema.MoodCapsule[]>;
  updateMoodCapsule(id: number, data: Partial<schema.MoodCapsule>): Promise<schema.MoodCapsule | null>;
  deleteMoodCapsule(id: number): Promise<boolean>;
}

// PostgreSQL storage implementation
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private saltRounds = 10;
  
  constructor() {
    // Create Neon connection
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema });
  }
  
  // Initialize database tables if needed
  async init() {
    console.log('Database connection initialized');
    return true;
  }
  
  // User methods
  async registerUser(username: string, email: string, password: string): Promise<schema.User> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      
      // Insert the user
      const result = await this.db.insert(schema.users)
        .values({
          username,
          email,
          password: hashedPassword,
        })
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create user');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  async loginUser(email: string, password: string): Promise<schema.User | null> {
    try {
      // Find user by email
      const users = await this.db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email));
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error logging in user:', error);
      return null;
    }
  }
  
  async getUserById(id: number): Promise<schema.User | null> {
    try {
      const users = await this.db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
  
  async updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | null> {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, ...safeData } = data;
      
      // Update the user
      const result = await this.db.update(schema.users)
        .set({
          ...safeData,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
  
  // Code snippet methods
  async createCodeSnippet(snippet: Omit<schema.InsertCodeSnippet, 'shareId'>): Promise<schema.CodeSnippet> {
    try {
      // Generate unique share ID (UUID v4)
      const shareId = crypto.randomUUID();
      
      // Insert the snippet
      const result = await this.db.insert(schema.codeSnippets)
        .values({
          ...snippet,
          shareId,
        })
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create code snippet');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error creating code snippet:', error);
      throw error;
    }
  }
  
  async getCodeSnippetById(id: number): Promise<schema.CodeSnippet | null> {
    try {
      const snippets = await this.db.select()
        .from(schema.codeSnippets)
        .where(eq(schema.codeSnippets.id, id));
      
      return snippets.length > 0 ? snippets[0] : null;
    } catch (error) {
      console.error('Error getting code snippet by ID:', error);
      return null;
    }
  }
  
  async getCodeSnippetByShareId(shareId: string): Promise<schema.CodeSnippet | null> {
    try {
      const snippets = await this.db.select()
        .from(schema.codeSnippets)
        .where(eq(schema.codeSnippets.shareId, shareId));
      
      return snippets.length > 0 ? snippets[0] : null;
    } catch (error) {
      console.error('Error getting code snippet by share ID:', error);
      return null;
    }
  }
  
  async getCodeSnippetsByUserId(userId: number): Promise<schema.CodeSnippet[]> {
    try {
      return await this.db.select()
        .from(schema.codeSnippets)
        .where(eq(schema.codeSnippets.userId, userId))
        .orderBy(sql`${schema.codeSnippets.createdAt} desc`);
    } catch (error) {
      console.error('Error getting code snippets by user ID:', error);
      return [];
    }
  }
  
  async getPublicCodeSnippets(): Promise<schema.CodeSnippet[]> {
    try {
      return await this.db.select()
        .from(schema.codeSnippets)
        .where(eq(schema.codeSnippets.isPublic, true))
        .orderBy(sql`${schema.codeSnippets.createdAt} desc`);
    } catch (error) {
      console.error('Error getting public code snippets:', error);
      return [];
    }
  }
  
  async updateCodeSnippet(id: number, data: Partial<schema.CodeSnippet>): Promise<schema.CodeSnippet | null> {
    try {
      // Prevent updating certain fields
      const { id: _, userId: __, shareId: ___, viewCount: ____, createdAt: _____, ...safeData } = data;
      
      // Update the snippet
      const result = await this.db.update(schema.codeSnippets)
        .set({
          ...safeData,
          updatedAt: new Date(),
        })
        .where(eq(schema.codeSnippets.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating code snippet:', error);
      return null;
    }
  }
  
  async deleteCodeSnippet(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(schema.codeSnippets)
        .where(eq(schema.codeSnippets.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting code snippet:', error);
      return false;
    }
  }
  
  async incrementCodeSnippetViewCount(id: number): Promise<schema.CodeSnippet | null> {
    try {
      const result = await this.db.update(schema.codeSnippets)
        .set({
          viewCount: sql`${schema.codeSnippets.viewCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.codeSnippets.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error incrementing code snippet view count:', error);
      return null;
    }
  }
  
  // Color palette methods
  async createColorPalette(palette: schema.InsertColorPalette): Promise<schema.ColorPalette> {
    try {
      const result = await this.db.insert(schema.colorPalettes)
        .values(palette)
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create color palette');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error creating color palette:', error);
      throw error;
    }
  }
  
  async getColorPaletteById(id: number): Promise<schema.ColorPalette | null> {
    try {
      const palettes = await this.db.select()
        .from(schema.colorPalettes)
        .where(eq(schema.colorPalettes.id, id));
      
      return palettes.length > 0 ? palettes[0] : null;
    } catch (error) {
      console.error('Error getting color palette by ID:', error);
      return null;
    }
  }
  
  async getColorPalettesByUserId(userId: number): Promise<schema.ColorPalette[]> {
    try {
      return await this.db.select()
        .from(schema.colorPalettes)
        .where(eq(schema.colorPalettes.userId, userId))
        .orderBy(sql`${schema.colorPalettes.createdAt} desc`);
    } catch (error) {
      console.error('Error getting color palettes by user ID:', error);
      return [];
    }
  }
  
  async getPublicColorPalettes(): Promise<schema.ColorPalette[]> {
    try {
      return await this.db.select()
        .from(schema.colorPalettes)
        .where(eq(schema.colorPalettes.isPublic, true))
        .orderBy(sql`${schema.colorPalettes.createdAt} desc`);
    } catch (error) {
      console.error('Error getting public color palettes:', error);
      return [];
    }
  }
  
  async updateColorPalette(id: number, data: Partial<schema.ColorPalette>): Promise<schema.ColorPalette | null> {
    try {
      // Prevent updating certain fields
      const { id: _, userId: __, createdAt: ___, ...safeData } = data;
      
      // Update the palette
      const result = await this.db.update(schema.colorPalettes)
        .set({
          ...safeData,
          updatedAt: new Date(),
        })
        .where(eq(schema.colorPalettes.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating color palette:', error);
      return null;
    }
  }
  
  async deleteColorPalette(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(schema.colorPalettes)
        .where(eq(schema.colorPalettes.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting color palette:', error);
      return false;
    }
  }
  
  // Mood capsule methods
  async createMoodCapsule(capsule: schema.InsertMoodCapsule): Promise<schema.MoodCapsule> {
    try {
      const result = await this.db.insert(schema.moodCapsules)
        .values(capsule)
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create mood capsule');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error creating mood capsule:', error);
      throw error;
    }
  }
  
  async getMoodCapsuleById(id: number): Promise<schema.MoodCapsule | null> {
    try {
      const capsules = await this.db.select()
        .from(schema.moodCapsules)
        .where(eq(schema.moodCapsules.id, id));
      
      return capsules.length > 0 ? capsules[0] : null;
    } catch (error) {
      console.error('Error getting mood capsule by ID:', error);
      return null;
    }
  }
  
  async getMoodCapsulesByUserId(userId: number): Promise<schema.MoodCapsule[]> {
    try {
      return await this.db.select()
        .from(schema.moodCapsules)
        .where(eq(schema.moodCapsules.userId, userId))
        .orderBy(sql`${schema.moodCapsules.createdAt} desc`);
    } catch (error) {
      console.error('Error getting mood capsules by user ID:', error);
      return [];
    }
  }
  
  async getPublicMoodCapsules(): Promise<schema.MoodCapsule[]> {
    try {
      return await this.db.select()
        .from(schema.moodCapsules)
        .where(eq(schema.moodCapsules.isPublic, true))
        .orderBy(sql`${schema.moodCapsules.createdAt} desc`);
    } catch (error) {
      console.error('Error getting public mood capsules:', error);
      return [];
    }
  }
  
  async updateMoodCapsule(id: number, data: Partial<schema.MoodCapsule>): Promise<schema.MoodCapsule | null> {
    try {
      // Prevent updating certain fields
      const { id: _, userId: __, createdAt: ___, ...safeData } = data;
      
      // Update the capsule
      const result = await this.db.update(schema.moodCapsules)
        .set({
          ...safeData,
          updatedAt: new Date(),
        })
        .where(eq(schema.moodCapsules.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating mood capsule:', error);
      return null;
    }
  }
  
  async deleteMoodCapsule(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(schema.moodCapsules)
        .where(eq(schema.moodCapsules.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting mood capsule:', error);
      return false;
    }
  }
}

// Get DB_URL from environment
const dbUrl = process.env.DATABASE_URL;

// Create a storage instance based on the environment
let storage: IStorage;
if (dbUrl) {
  console.log('Using PostgreSQL storage');
  storage = new PostgresStorage();
} else {
  console.error('No database URL provided! PostgreSQL storage will fail.');
  storage = new PostgresStorage(); // Still create it, but it will fail when used
}

export default storage;