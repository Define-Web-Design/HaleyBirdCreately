import { pgTable, serial, text, varchar, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Mood and sentiment-related enums
export enum ContentSentiment {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  MIXED = 'MIXED'
}

// Programming language enum for code snippets
export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CSHARP = 'csharp',
  PHP = 'php',
  RUBY = 'ruby',
  GO = 'go',
  RUST = 'rust',
  HTML = 'html',
  CSS = 'css',
  JSON = 'json',
  MARKDOWN = 'markdown',
  TEXT = 'text',
  OTHER = 'other'
}

// MoodCapsule interface
export interface MoodCapsule {
  id: number;
  userId: number;
  name: string;
  description?: string;
  emotionalTone: string;
  captionTone: string;
  aiGeneratedCaption?: string;
  contentIds: number[];
  thumbnailUrl?: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ColorPalette interface
export interface ColorPalette {
  id: number;
  userId: number;
  name: string;
  description?: string;
  colors: string[];
  mood?: string;
  isPublic: boolean;
  usageCount: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// CodeSnippet interface
export interface CodeSnippetInterface {
  id: number;
  userId: number;
  title: string;
  description?: string;
  code: string;
  language: ProgrammingLanguage;
  tags?: string[];
  isPublic: boolean;
  viewCount: number;
  shareId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatar: text('avatar'),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true).notNull()
});

// User Session Table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent')
});

// Refresh Token Table
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent')
});

// Color Palettes Table
export const colorPalettes = pgTable('color_palettes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  colors: text('colors').array().notNull(),
  mood: varchar('mood', { length: 50 }),
  isPublic: boolean('is_public').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Code Snippets Table
export const codeSnippets = pgTable('code_snippets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  code: text('code').notNull(),
  language: varchar('language', { length: 20 }).notNull(),
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(true).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  shareId: varchar('share_id', { length: 20 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define insert schemas with zod
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, passwordHash: true, createdAt: true, updatedAt: true, lastLogin: true })
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters long')
  });

export const insertSessionSchema = createInsertSchema(sessions)
  .omit({ id: true, createdAt: true });

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens)
  .omit({ id: true, createdAt: true, isRevoked: true });

export const insertColorPaletteSchema = createInsertSchema(colorPalettes)
  .omit({ id: true, usageCount: true, createdAt: true, updatedAt: true })
  .extend({
    tags: z.array(z.string()).optional()
  });

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets)
  .omit({ id: true, viewCount: true, createdAt: true, updatedAt: true })
  .extend({
    tags: z.array(z.string()).optional()
  });

// Define types based on the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type InsertColorPalette = z.infer<typeof insertColorPaletteSchema>;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type ColorPalette = typeof colorPalettes.$inferSelect;
export type CodeSnippet = typeof codeSnippets.$inferSelect;