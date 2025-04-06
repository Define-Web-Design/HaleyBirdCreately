import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
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
  phone: varchar("phone", { length: 20 }),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
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
  phone: true,
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

// Platform integrations table
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  meta: jsonb("meta"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type PlatformIntegration = typeof platformIntegrations.$inferSelect;

export interface SocialPlatformCapabilities {
  maxImageSize?: number;
  maxVideoLength?: number;
  maxCharacters?: number;
  supportedMediaTypes: ('photo' | 'video' | 'text' | 'article')[];
  requiresAuthentication: boolean;
  supportsScheduling: boolean;
  supportsAnalytics: boolean;
}

export interface PlatformSettings {
  name: string;
  icon: string;
  color: string;
  capabilities: SocialPlatformCapabilities;
  authUrl: string;
}

// Apple Photos Integration
export interface ApplePhotoMetadata {
  createdAt: string;
  format: string;
  width: number;
  height: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ApplePhoto {
  id: string;
  url: string;
  metadata: ApplePhotoMetadata;
  tags?: string[];
}

export interface PhotoImportResponse {
  success: boolean;
  photos: ApplePhoto[];
  errors?: string[];
}

// User Engagement table - for tracking user interactions
export const userEngagement = pgTable("user_engagement", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  engagementType: text("engagement_type").notNull(), // content_created, ai_feature_used, etc.
  engagementDetails: jsonb("engagement_details"),
  points: integer("points").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Evolution Points table - tracks user growth and points
export const evolutionPoints = pgTable("evolution_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalPoints: integer("total_points").default(0),
  currentTier: text("current_tier").default("Novice"),
  nextMilestone: integer("next_milestone").default(100),
  creativeEnergyPoints: integer("creative_energy_points").default(10),
  lastPointsUpdate: timestamp("last_points_update").defaultNow(),
  lastEnergyRefresh: timestamp("last_energy_refresh").defaultNow(),
});

// User Capabilities table - for tracking unlocked AI features
export const userCapabilities = pgTable("user_capabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  capabilityName: text("capability_name").notNull(),
  isUnlocked: boolean("is_unlocked").default(false),
  level: integer("level").default(1),
  unlockedAt: timestamp("unlocked_at"),
  expiresAt: timestamp("expires_at"),
});

// Creative History table - for tracking user creative journey
export const creativeHistory = pgTable("creative_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly
  contentCreated: integer("content_created").default(0),
  aiCollaborations: integer("ai_collaborations").default(0),
  capabilitiesUnlocked: integer("capabilities_unlocked").default(0),
  milestones: jsonb("milestones"),
  date: timestamp("date").defaultNow(),
});

// Color Palettes table for mood-based color generation
export const colorPalettes = pgTable("color_palettes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  mood: text("mood").notNull(), // happy, calm, energetic, etc.
  colors: text("colors").array(), // Array of hex color codes
  tags: text("tags").array(),
  isFavorite: boolean("is_favorite").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mood Capsules table for AI-driven content grouping by emotional tone
export const moodCapsules = pgTable("mood_capsules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  emotionalTone: text("emotional_tone").notNull(), // joyful, nostalgic, energetic, etc.
  captionTone: text("caption_tone").default("balanced"), // poetic, concise, conversational, etc.
  aiGeneratedCaption: text("ai_generated_caption"),
  contentIds: integer("content_ids").array(), // Array of content IDs that belong to this capsule
  thumbnailUrl: text("thumbnail_url"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Sentiment Analysis table for storing mood-related data about content
export const contentSentiment = pgTable("content_sentiment", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  dominantEmotion: text("dominant_emotion"), // primary emotion detected in the content
  emotionIntensity: integer("emotion_intensity"), // 0-100 scale of emotional intensity
  emotionBreakdown: jsonb("emotion_breakdown"), // detailed breakdown of detected emotions
  keywords: text("keywords").array(), // emotion-related keywords extracted from content
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

// Export insert schemas for new tables
export const insertUserEngagementSchema = createInsertSchema(userEngagement).pick({
  userId: true,
  engagementType: true,
  engagementDetails: true,
  points: true,
});

export const insertEvolutionPointsSchema = createInsertSchema(evolutionPoints).pick({
  userId: true,
  totalPoints: true,
  currentTier: true,
  nextMilestone: true,
  creativeEnergyPoints: true,
});

export const insertUserCapabilitiesSchema = createInsertSchema(userCapabilities).pick({
  userId: true,
  capabilityName: true,
  isUnlocked: true,
  level: true,
});

export const insertCreativeHistorySchema = createInsertSchema(creativeHistory).pick({
  userId: true,
  period: true,
  contentCreated: true,
  aiCollaborations: true,
  capabilitiesUnlocked: true,
  milestones: true,
});

export const insertColorPaletteSchema = createInsertSchema(colorPalettes).pick({
  userId: true,
  name: true,
  mood: true,
  colors: true,
  tags: true,
  isFavorite: true,
});

export const insertMoodCapsuleSchema = createInsertSchema(moodCapsules).pick({
  userId: true,
  name: true,
  description: true,
  emotionalTone: true,
  captionTone: true,
  aiGeneratedCaption: true,
  contentIds: true,
  thumbnailUrl: true,
});

export const insertContentSentimentSchema = createInsertSchema(contentSentiment).pick({
  contentId: true,
  userId: true,
  dominantEmotion: true,
  emotionIntensity: true,
  emotionBreakdown: true,
  keywords: true,
});

// Export types for all tables
export type InsertUserEngagement = z.infer<typeof insertUserEngagementSchema>;
export type UserEngagement = typeof userEngagement.$inferSelect;

export type InsertEvolutionPoints = z.infer<typeof insertEvolutionPointsSchema>;
export type EvolutionPoints = typeof evolutionPoints.$inferSelect;

export type InsertUserCapabilities = z.infer<typeof insertUserCapabilitiesSchema>;
export type UserCapabilities = typeof userCapabilities.$inferSelect;

export type InsertCreativeHistory = z.infer<typeof insertCreativeHistorySchema>;
export type CreativeHistory = typeof creativeHistory.$inferSelect;

export type InsertColorPalette = z.infer<typeof insertColorPaletteSchema>;
export type ColorPalette = typeof colorPalettes.$inferSelect;

export type InsertMoodCapsule = z.infer<typeof insertMoodCapsuleSchema>;
export type MoodCapsule = typeof moodCapsules.$inferSelect;

export type InsertContentSentiment = z.infer<typeof insertContentSentimentSchema>;
export type ContentSentiment = typeof contentSentiment.$inferSelect;

// Interface for Mood Capsule API response
export interface MoodCapsuleAnalysisResponse {
  success: boolean;
  moodCapsules: MoodCapsule[];
  contentSentiments: ContentSentiment[];
  errors?: string[];
}

// Interface for AI caption generation
export interface CaptionGenerationRequest {
  contentIds: number[];
  emotionalTone: string;
  captionTone: string;
}

export interface CaptionGenerationResponse {
  success: boolean;
  caption: string;
  errors?: string[];
}

// Define MoodTone enum for palette generation
export enum MoodTone {
  ENERGETIC = "ENERGETIC",
  CALM = "CALM",
  PROFESSIONAL = "PROFESSIONAL",
  PLAYFUL = "PLAYFUL",
  ELEGANT = "ELEGANT",
  NOSTALGIC = "NOSTALGIC",
  MYSTERIOUS = "MYSTERIOUS",
  BOLD = "BOLD",
}

// Security and Legal schemas

// Legal document acceptance tracking
export const legalAcceptance = pgTable("legal_acceptance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(), // terms, privacy, etc.
  version: text("version").notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Security alerts and monitoring
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  alertType: text("alert_type").notNull(), // access, scraping, extraction, unauthorized
  severity: text("severity").notNull(), // low, medium, high
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
  userId: integer("user_id"),
  resolved: boolean("resolved").default(false),
  resolutionNotes: text("resolution_notes"),
});

// Access attempts tracking
export const accessAttempts = pgTable("access_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  userAgent: text("user_agent"),
  authorized: boolean("authorized").default(false),
  userId: integer("user_id"),
});

// Asset ownership and watermarking
export const assetOwnership = pgTable("asset_ownership", {
  id: serial("id").primaryKey(),
  assetId: text("asset_id").notNull(),
  assetType: text("asset_type").notNull(), // image, text, code
  watermarkHash: text("watermark_hash").notNull(),
  ownerInfo: text("owner_info").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at"),
  verificationStatus: boolean("verification_status").default(true),
});

// Export insert schemas for security tables
export const insertLegalAcceptanceSchema = createInsertSchema(legalAcceptance).pick({
  userId: true,
  documentType: true,
  version: true,
  acceptedAt: true,
  ipAddress: true,
  userAgent: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).pick({
  alertType: true,
  severity: true,
  details: true,
  timestamp: true,
  ipAddress: true,
  userId: true,
});

export const insertAccessAttemptSchema = createInsertSchema(accessAttempts).pick({
  ipAddress: true,
  path: true,
  method: true,
  timestamp: true,
  userAgent: true,
  authorized: true,
  userId: true,
});

export const insertAssetOwnershipSchema = createInsertSchema(assetOwnership).pick({
  assetId: true,
  assetType: true,
  watermarkHash: true,
  ownerInfo: true,
  lastVerifiedAt: true,
  verificationStatus: true,
});

// Export types for security tables
export type InsertLegalAcceptance = z.infer<typeof insertLegalAcceptanceSchema>;
export type LegalAcceptance = typeof legalAcceptance.$inferSelect;

export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;

export type InsertAccessAttempt = z.infer<typeof insertAccessAttemptSchema>;
export type AccessAttempt = typeof accessAttempts.$inferSelect;

export type InsertAssetOwnership = z.infer<typeof insertAssetOwnershipSchema>;
export type AssetOwnership = typeof assetOwnership.$inferSelect;

// Task Verification table
export const taskVerification = pgTable("task_verification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, verified
  category: text("category").notNull(), // content, feature, security, system
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  verifiedAt: timestamp("verified_at"),
});

// Export insert schema for Task Verification
export const insertTaskVerificationSchema = createInsertSchema(taskVerification).pick({
  userId: true,
  title: true,
  description: true,
  status: true,
  category: true,
  points: true,
  completedAt: true,
});

// Export types for Task Verification
export type InsertTaskVerification = z.infer<typeof insertTaskVerificationSchema>;
export type TaskVerification = typeof taskVerification.$inferSelect;
