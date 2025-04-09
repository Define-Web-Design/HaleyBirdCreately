// User types
export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: string;
  growthMetrics?: UserGrowthMetrics;
  collaborationStats?: CollaborationStats;
  learningJourney?: LearningJourney;
}

// Growth metrics representing user's intellectual, creative, and impact growth
export interface UserGrowthMetrics {
  intellectual: number; // 0-100 scale of intellectual growth
  creative: number; // 0-100 scale of creative growth
  impact: number; // 0-100 scale of content impact
  trend: {
    intellectual: 'rising' | 'stable' | 'declining';
    creative: 'rising' | 'stable' | 'declining';
    impact: 'rising' | 'stable' | 'declining';
  };
  lastUpdated: string;
}

// Collaboration statistics for team engagement
export interface CollaborationStats {
  activeCollaborations: number;
  contributionsGiven: number;
  contributionsReceived: number;
  teamSynergy: number; // 0-100 scale of team synergy
  recentCollaborators: CollaboratorInfo[];
}

// Represents a collaborator
export interface CollaboratorInfo {
  id: number;
  displayName: string;
  avatar?: string;
  role: string;
  lastInteraction: string;
}

// User's learning and growth journey
export interface LearningJourney {
  currentLevel: number;
  nextMilestone: string;
  recentInsights: string[];
  skillsGained: string[];
  personalizationIndex: number; // How personalized the AI has become to the user
}

// Content types
export interface ContentItem {
  id: number;
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  status: 'Draft' | 'Scheduled' | 'Posted';
  platform?: string;
  engagement?: number;
  aiSentiment?: number;
  aiPrediction?: number;
  tags?: string[];
  createdAt: string;
  scheduledFor?: string;
  postedAt?: string;
  // Advanced content properties for transformation
  transformationHistory?: ContentTransformation[];
  adaptiveMetrics?: AdaptiveMetrics;
  collaborators?: number[]; // User IDs of collaborators
  intellectualGrowthScore?: number; // How much this content contributes to intellectual growth
  creativeGrowthScore?: number; // How much this content contributes to creative growth
  originalSource?: string; // Reference to original content if transformed
}

// Tracks the transformation history of content
export interface ContentTransformation {
  id: number;
  transformationType: 'resize' | 'adapt' | 'enhance' | 'reformat' | 'translate' | 'optimize';
  description: string;
  timestamp: string;
  platform?: string; // Target platform
  performanceChange?: number; // Performance difference after transformation
  aiContribution?: number; // How much AI contributed to transformation (percentage)
}

// Adaptive metrics for content performance analysis
export interface AdaptiveMetrics {
  platformSpecificScores: Record<string, number>; // Performance scores by platform
  audienceReception: number; // 0-100 score of audience reception
  authenticitySimilarity: number; // How similar to original voice (percentage)
  suggestedImprovements?: string[];
  lastUpdated: string;
}

// MoodBoard types
export interface MoodBoard {
  id: number;
  userId: number;
  title: string;
  description?: string;
  images: string[];
  tags?: string[];
  createdAt: string;
}

// Analytics types
export interface AnalyticsData {
  id: number;
  userId: number;
  period: string;
  engagementRate?: number;
  growthRate?: number;
  topPerforming?: TopPerformingContent[];
  predictions?: Predictions;
  date: string;
}

export interface TopPerformingContent {
  id: number;
  title: string;
  thumbnail: string;
  likes: number;
  comments: number;
  growth: number;
}

export interface Predictions {
  growthRate: number;
  nextThirtyDays: number;
  recommendedActions?: string[];
}

// Calendar types
export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  scheduledContent?: ScheduledContent[];
}

export interface ScheduledContent {
  id: number;
  title: string;
  platform: string;
  time?: string;
  type: string;
}

// Enhancement tool types
export interface ToolCard {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  border: string;
  iconGradient: string;
  buttonColor: string;
  isNew?: boolean;
  buttonText?: string;
  onClick?: () => void;
}

// Theme types
export interface ActivePalette {
  primary: string;
  accent?: string;
  background?: string;
  isPaletteActive: boolean;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  activePalette: ActivePalette;
  setActivePalette: (palette: Partial<ActivePalette>) => void;
  resetPalette: () => void;
}

// Mood Capsule types
export interface MoodCapsule {
  id: number;
  userId: number;
  name: string;
  description?: string;
  emotionalTone: string;
  captionTone?: string;
  aiGeneratedCaption?: string;
  contentIds?: number[];
  thumbnailUrl?: string;
  isArchived?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ContentSentiment {
  id: number;
  contentId: number;
  userId: number;
  dominantEmotion?: string;
  emotionIntensity?: number;
  emotionBreakdown?: Record<string, number>;
  keywords?: string[];
  analyzedAt?: Date | null;
}

// Collaboration workspace types
export interface CollaborativeWorkspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  members: CollaborativeMember[];
  projects: CollaborativeProject[];
  createdAt: string;
  updatedAt?: string;
  teamSynergy?: number; // 0-100 scale of team effectiveness
  activityMetrics?: WorkspaceActivityMetrics;
}

export interface CollaborativeMember {
  userId: number;
  displayName: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  avatar?: string;
  contributionScore?: number; // Score based on contributions
  insights?: string[]; // AI-generated insights about this member's contributions
}

export interface CollaborativeProject {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  contentItems: number[]; // IDs of associated content
  assignedMembers: number[]; // User IDs
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  intellectualValue?: number; // How much the project contributes to intellectual growth
  creativeValue?: number; // How much the project contributes to creative growth
  collaborationScore?: number; // How collaborative the project was
}

export interface WorkspaceActivityMetrics {
  activeDays: number;
  totalContributions: number;
  contributionsByUser: Record<number, number>; // User ID -> contribution count
  peakActivityTimes: string[];
  teamFeedback: TeamFeedback[];
  lastUpdated: string;
}

export interface TeamFeedback {
  id: number;
  message: string;
  sentiment: 'positive' | 'neutral' | 'constructive';
  createdAt: string;
  fromUserId?: number;
  targetType: 'workspace' | 'project' | 'content';
  targetId: number;
}

// Growth and learning system
export interface GrowthInsight {
  id: number;
  userId: number;
  insightType: 'intellectual' | 'creative' | 'impact' | 'collaboration';
  title: string;
  description: string;
  relatedContentIds?: number[];
  suggestedActions?: string[];
  createdAt: string;
  acknowledged: boolean;
  impact: number; // 0-100 scale of estimated impact if applied
}

export interface LearningResource {
  id: number;
  title: string;
  description: string;
  resourceType: 'article' | 'video' | 'tool' | 'exercise' | 'template';
  url?: string;
  categories: string[];
  skillsTargeted: string[];
  estimatedTimeMinutes: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  relevanceScore?: number; // Personalized relevance to the user
}
