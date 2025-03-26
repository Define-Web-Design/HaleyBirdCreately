import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  role: text("role").default("creator"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content table to store social media content
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  status: text("status").notNull(), // Draft, Scheduled, Posted
  platform: text("platform"), // Instagram, TikTok, Pinterest, etc.
  engagement: integer("engagement").default(0),
  aiSentiment: integer("ai_sentiment").default(0), // 0-100 score
  aiPrediction: integer("ai_prediction").default(0), // 0-100 score
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
});

// MoodBoards table
export const moodBoards = pgTable("mood_boards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  images: text("images").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AnalyticsData table
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly
  engagementRate: integer("engagement_rate"),
  growthRate: integer("growth_rate"),
  topPerforming: jsonb("top_performing"),
  predictions: jsonb("predictions"),
  date: timestamp("date").defaultNow(),
});

// Export insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatar: true,
  role: true,
});

export const insertContentSchema = createInsertSchema(content).pick({
  userId: true,
  title: true,
  description: true,
  imageUrl: true,
  status: true,
  platform: true,
  tags: true,
  scheduledFor: true,
});

export const insertMoodBoardSchema = createInsertSchema(moodBoards).pick({
  userId: true,
  title: true,
  description: true,
  images: true,
  tags: true,
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).pick({
  userId: true,
  period: true,
  engagementRate: true,
  growthRate: true,
  topPerforming: true,
  predictions: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

export type InsertMoodBoard = z.infer<typeof insertMoodBoardSchema>;
export type MoodBoard = typeof moodBoards.$inferSelect;

export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type AnalyticsData = typeof analyticsData.$inferSelect;
