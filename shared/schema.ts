import { pgTable, serial, text, timestamp, boolean, json, integer, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define the users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  displayName: text('display_name'),
  avatar: text('avatar_url'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the code snippets table
export const codeSnippets = pgTable('code_snippets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  code: text('code').notNull(),
  language: text('language').notNull(),
  tags: json('tags').default([]),
  isPublic: boolean('is_public').default(false),
  viewCount: integer('view_count').default(0),
  shareId: uuid('share_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the color palettes table
export const colorPalettes = pgTable('color_palettes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  colors: json('colors').notNull(),
  tags: json('tags').default([]),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the mood capsules table
export const moodCapsules = pgTable('mood_capsules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  emotionalTone: text('emotional_tone'),
  tags: json('tags').default([]),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const insertColorPaletteSchema = createInsertSchema(colorPalettes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMoodCapsuleSchema = createInsertSchema(moodCapsules).omit({ id: true, createdAt: true, updatedAt: true });

// Create derived types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;

export type ColorPalette = typeof colorPalettes.$inferSelect;
export type InsertColorPalette = z.infer<typeof insertColorPaletteSchema>;

export type MoodCapsule = typeof moodCapsules.$inferSelect;
export type InsertMoodCapsule = z.infer<typeof insertMoodCapsuleSchema>;

// Custom schemas for API requests
export const codeSnippetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.string().optional().transform(tags => 
    tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
  ),
  isPublic: z.boolean().default(false),
});

export type CodeSnippetFormValues = z.infer<typeof codeSnippetFormSchema>;