import { 
  users, type User, type InsertUser,
  content, type Content, type InsertContent,
  moodBoards, type MoodBoard, type InsertMoodBoard,
  analyticsData, type AnalyticsData, type InsertAnalyticsData,
  
  // Creative Symbiosis Framework types
  userEngagement, type UserEngagement, type InsertUserEngagement,
  evolutionPoints, type EvolutionPoints, type InsertEvolutionPoints,
  userCapabilities, type UserCapabilities, type InsertUserCapabilities,
  creativeHistory, type CreativeHistory, type InsertCreativeHistory,
  
  // Color Palette types
  colorPalettes, type ColorPalette, type InsertColorPalette,
  
  // Mood Capsules types
  moodCapsules, type MoodCapsule, type InsertMoodCapsule,
  contentSentiment, type ContentSentiment, type InsertContentSentiment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content methods
  getContentByUserId(userId: number): Promise<Content[]>;
  getArchivedContentByUserId(userId: number): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Mood board methods
  getMoodBoardsByUserId(userId: number): Promise<MoodBoard[]>;
  createMoodBoard(moodBoard: InsertMoodBoard): Promise<MoodBoard>;
  
  // Analytics methods
  getAnalyticsByUserId(userId: number, period: string): Promise<AnalyticsData | undefined>;
  createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData>;
  
  // Creative Symbiosis Framework methods
  
  // User Engagement methods
  getUserEngagementByUserId(userId: number): Promise<UserEngagement[]>;
  trackUserEngagement(engagement: InsertUserEngagement): Promise<UserEngagement>;
  
  // Evolution Points methods
  getEvolutionPointsByUserId(userId: number): Promise<EvolutionPoints | undefined>;
  createEvolutionPoints(points: InsertEvolutionPoints): Promise<EvolutionPoints>;
  updateEvolutionPoints(userId: number, pointsToAdd: number): Promise<EvolutionPoints>;
  refreshCreativeEnergyPoints(userId: number): Promise<EvolutionPoints>;
  
  // User Capabilities methods
  getUserCapabilitiesByUserId(userId: number): Promise<UserCapabilities[]>;
  unlockUserCapability(capability: InsertUserCapabilities): Promise<UserCapabilities>;
  upgradeCapabilityLevel(userId: number, capabilityName: string): Promise<UserCapabilities>;
  
  // Creative History methods
  getCreativeHistoryByUserIdAndPeriod(userId: number, period: string): Promise<CreativeHistory | undefined>;
  createCreativeHistory(history: InsertCreativeHistory): Promise<CreativeHistory>;
  updateCreativeHistory(userId: number, period: string, updates: Partial<InsertCreativeHistory>): Promise<CreativeHistory>;
  
  // Color Palette methods
  getColorPalettesByUserId(userId: number): Promise<ColorPalette[]>;
  getColorPaletteById(id: number): Promise<ColorPalette | undefined>;
  createColorPalette(palette: InsertColorPalette): Promise<ColorPalette>;
  updateColorPalette(id: number, updates: Partial<InsertColorPalette>): Promise<ColorPalette>;
  incrementColorPaletteUsage(id: number): Promise<ColorPalette>;
  getColorPalettesByMood(mood: string): Promise<ColorPalette[]>;
  
  // Mood Capsules methods
  getMoodCapsulesByUserId(userId: number): Promise<MoodCapsule[]>;
  getMoodCapsuleById(id: number): Promise<MoodCapsule | undefined>;
  createMoodCapsule(capsule: InsertMoodCapsule): Promise<MoodCapsule>;
  updateMoodCapsule(id: number, updates: Partial<InsertMoodCapsule>): Promise<MoodCapsule>;
  deleteMoodCapsule(id: number): Promise<boolean>;
  archiveMoodCapsule(id: number): Promise<MoodCapsule>;
  
  // Content Sentiment methods
  getContentSentimentById(contentId: number): Promise<ContentSentiment | undefined>;
  getContentSentimentsByUserId(userId: number): Promise<ContentSentiment[]>;
  createContentSentiment(sentiment: InsertContentSentiment): Promise<ContentSentiment>;
  updateContentSentiment(contentId: number, updates: Partial<InsertContentSentiment>): Promise<ContentSentiment>;
  analyzeContentSentiment(contentIds: number[]): Promise<ContentSentiment[]>;
  generateCaptionForMoodCapsule(contentIds: number[], emotionalTone: string, captionTone: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private moodBoards: Map<number, MoodBoard>;
  private analyticsData: Map<number, AnalyticsData>;
  
  // Creative Symbiosis Framework storage
  private userEngagements: Map<number, UserEngagement> = new Map();
  private evolutionPointsData: Map<number, EvolutionPoints> = new Map();
  private userCapabilitiesData: Map<number, UserCapabilities> = new Map();
  private creativeHistoryData: Map<number, CreativeHistory> = new Map();
  private colorPalettesData: Map<number, ColorPalette> = new Map();
  
  // Mood Capsules storage
  private moodCapsulesData: Map<number, MoodCapsule> = new Map();
  private contentSentimentsData: Map<number, ContentSentiment> = new Map();
  
  private currentUserId: number;
  private currentContentId: number;
  private currentMoodBoardId: number;
  private currentAnalyticsId: number;
  private currentEngagementId: number = 1;
  private currentEvolutionPointsId: number = 1;
  private currentCapabilityId: number = 1;
  private currentCreativeHistoryId: number = 1;
  private currentColorPaletteId: number = 1;
  private currentMoodCapsuleId: number = 1;
  private currentContentSentimentId: number = 1;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.moodBoards = new Map();
    this.analyticsData = new Map();
    
    // Initialize Creative Symbiosis Framework storage
    this.userEngagements = new Map();
    this.evolutionPointsData = new Map();
    this.userCapabilitiesData = new Map();
    this.creativeHistoryData = new Map();
    this.colorPalettesData = new Map();
    
    // Initialize Mood Capsules storage
    this.moodCapsulesData = new Map();
    this.contentSentimentsData = new Map();
    
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentMoodBoardId = 1;
    this.currentAnalyticsId = 1;
    this.currentEngagementId = 1;
    this.currentEvolutionPointsId = 1;
    this.currentCapabilityId = 1;
    this.currentCreativeHistoryId = 1;
    this.currentColorPaletteId = 1;
    this.currentMoodCapsuleId = 1;
    this.currentContentSentimentId = 1;
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create a mock user
    const mockUser: User = {
      id: this.currentUserId,
      username: "demo_user",
      password: "password123",
      displayName: "Creative Creator",
      email: "creator@example.com",
      avatar: "https://i.pravatar.cc/150?u=demo_user",
      role: "creator",
      phone: null,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(mockUser.id, mockUser);
    
    // Create mock content
    const contentStatuses = ["Draft", "Scheduled", "Posted"];
    const platforms = ["Instagram", "TikTok", "Pinterest", "Twitter"];
    
    for (let i = 0; i < 8; i++) {
      const contentItem: Content = {
        id: this.currentContentId++,
        userId: mockUser.id,
        title: `Sample Content ${i + 1}`,
        description: `This is a sample content description for item ${i + 1}`,
        imageUrl: `https://picsum.photos/seed/${i + 100}/400/300`,
        status: contentStatuses[i % contentStatuses.length] as 'Draft' | 'Scheduled' | 'Posted',
        platform: platforms[i % platforms.length],
        engagement: Math.floor(Math.random() * 1000),
        aiSentiment: Math.floor(Math.random() * 100),
        aiPrediction: Math.floor(Math.random() * 100),
        tags: ["sample", `tag${i}`, "content"],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        scheduledFor: i % 2 === 0 ? new Date(Date.now() + i * 24 * 60 * 60 * 1000) : null,
        postedAt: i % 3 === 0 ? new Date(Date.now() - i * 12 * 60 * 60 * 1000) : null
      };
      this.contents.set(contentItem.id, contentItem);
    }
    
    // Create mock mood boards
    const moodBoardThemes = ["Summer Vibes", "Minimalist", "Bold Colors", "Nature Inspired"];
    
    for (let i = 0; i < 4; i++) {
      const moodBoard: MoodBoard = {
        id: this.currentMoodBoardId++,
        userId: mockUser.id,
        title: moodBoardThemes[i],
        description: `A collection of ${moodBoardThemes[i].toLowerCase()} inspiration`,
        images: [
          `https://picsum.photos/seed/${i + 200}/400/300`,
          `https://picsum.photos/seed/${i + 201}/400/300`,
          `https://picsum.photos/seed/${i + 202}/400/300`
        ],
        tags: [moodBoardThemes[i].toLowerCase().replace(" ", "-"), "inspiration", "design"],
        createdAt: new Date(Date.now() - i * 48 * 60 * 60 * 1000)
      };
      this.moodBoards.set(moodBoard.id, moodBoard);
    }
    
    // Create mock analytics data
    const periods = ["daily", "weekly", "monthly"];
    
    for (let i = 0; i < 3; i++) {
      const analyticsItem: AnalyticsData = {
        id: this.currentAnalyticsId++,
        userId: mockUser.id,
        period: periods[i],
        engagementRate: 5 + Math.floor(Math.random() * 15),
        growthRate: 2 + Math.floor(Math.random() * 8),
        topPerforming: {
          posts: [
            {
              id: i + 1,
              title: `Top Performing Content ${i + 1}`,
              thumbnail: `https://picsum.photos/seed/${i + 300}/100/100`,
              likes: 100 + Math.floor(Math.random() * 900),
              comments: 10 + Math.floor(Math.random() * 90),
              growth: 5 + Math.floor(Math.random() * 25)
            }
          ]
        },
        predictions: {
          growthRate: 3 + Math.floor(Math.random() * 7),
          nextThirtyDays: 10 + Math.floor(Math.random() * 20),
          recommendedActions: [
            "Post more consistently",
            "Engage with trending hashtags",
            "Respond to comments more quickly"
          ]
        },
        date: new Date()
      };
      this.analyticsData.set(analyticsItem.id, analyticsItem);
    }
    
    // Create mock Creative Symbiosis data
    
    // User engagement data
    const interactionTypes = ["content_created", "tool_used", "feature_explored", "feedback_given"];
    for (let i = 0; i < 5; i++) {
      const engagement: UserEngagement = {
        id: this.currentEngagementId++,
        userId: mockUser.id,
        interactionType: interactionTypes[i % interactionTypes.length],
        interactionDetails: {
          location: i % 2 === 0 ? "dashboard" : "content_editor",
          duration: 5 + Math.floor(Math.random() * 25),
          outcome: i % 3 === 0 ? "completed" : "in_progress"
        },
        createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
      };
      this.userEngagements.set(engagement.id, engagement);
    }
    
    // Evolution points data
    const evolutionTiers = ["starter", "growing", "established", "advanced", "expert"];
    const pointsData: EvolutionPoints = {
      id: this.currentEvolutionPointsId++,
      userId: mockUser.id,
      totalPoints: 250,
      currentTier: evolutionTiers[1], // growing
      nextMilestone: 500,
      creativeEnergyPoints: 75,
      lastPointsUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    this.evolutionPointsData.set(pointsData.id, pointsData);
    
    // User capabilities data
    const capabilities = [
      "basic_analysis", 
      "content_generation", 
      "mood_board_creation", 
      "schedule_optimization"
    ];
    
    for (let i = 0; i < capabilities.length; i++) {
      const capability: UserCapabilities = {
        id: this.currentCapabilityId++,
        userId: mockUser.id,
        capabilityName: capabilities[i],
        isUnlocked: i < 2, // First two capabilities are unlocked
        unlockedAt: i < 2 ? new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000) : null,
        expiresAt: null, // Permanent capabilities
        level: i < 2 ? 2 : 1 // First two capabilities are at level 2
      };
      this.userCapabilitiesData.set(capability.id, capability);
    }
    
    // Creative history data
    const historyPeriods = ["weekly", "monthly", "quarterly"];
    
    for (let i = 0; i < historyPeriods.length; i++) {
      const history: CreativeHistory = {
        id: this.currentCreativeHistoryId++,
        userId: mockUser.id,
        period: historyPeriods[i],
        creativePatterns: {
          preferredStyles: ["minimalist", "vibrant"],
          commonThemes: ["nature", "technology"],
          peakCreativeTimes: ["morning", "late evening"]
        },
        contentStats: {
          totalCreated: 12 + i * 8,
          completion: 85 - i * 5,
          averageQualityScore: 7.5 + i * 0.5
        },
        growthInsights: {
          skillsImproving: ["composition", "storytelling"],
          areas: ["technical_details", "color_theory"],
          recommendedResources: ["Color Theory for Creators", "Visual Storytelling Course"]
        },
        createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000)
      };
      this.creativeHistoryData.set(history.id, history);
    }
    
    // Create mock color palettes
    const moods = ["happy", "calm", "energetic", "melancholic", "professional"];
    const colorSets = [
      ["#FF6B6B", "#4ECDC4", "#1A535C", "#FF9F1C", "#F7FFF7"], // happy
      ["#8AA8B0", "#A8DADC", "#E0FBFC", "#457B9D", "#1D3557"], // calm
      ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"], // energetic
      ["#2B2D42", "#8D99AE", "#EDF2F4", "#D90429", "#457B9D"], // melancholic
      ["#194B7E", "#314E6F", "#547AA5", "#C2DBF5", "#E2EBF4"]  // professional
    ];
    
    for (let i = 0; i < moods.length; i++) {
      const colorPalette: ColorPalette = {
        id: this.currentColorPaletteId++,
        userId: mockUser.id,
        name: `${moods[i].charAt(0).toUpperCase() + moods[i].slice(1)} Palette`,
        mood: moods[i],
        colors: colorSets[i],
        tags: [moods[i], "palette", i % 2 === 0 ? "vibrant" : "subtle"],
        isFavorite: i < 2, // First two are favorites
        usageCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000)
      };
      this.colorPalettesData.set(colorPalette.id, colorPalette);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure required fields have proper types
      avatar: insertUser.avatar || null,
      role: insertUser.role || null,
      phone: insertUser.phone || null,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Content methods
  async getContentByUserId(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter(content => content.userId === userId && content.status !== 'Posted');
  }
  
  async getArchivedContentByUserId(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter(content => content.userId === userId && content.status === 'Posted');
  }
  
  async getContentById(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const content: Content = {
      ...insertContent,
      id,
      description: insertContent.description || null,
      imageUrl: insertContent.imageUrl || null,
      platform: insertContent.platform || null,
      engagement: 0,
      aiSentiment: 0,
      aiPrediction: 0,
      tags: insertContent.tags || null,
      createdAt: new Date(),
      scheduledFor: insertContent.scheduledFor || null,
      postedAt: null
    };
    this.contents.set(id, content);
    return content;
  }
  
  // Mood board methods
  async getMoodBoardsByUserId(userId: number): Promise<MoodBoard[]> {
    return Array.from(this.moodBoards.values())
      .filter(board => board.userId === userId);
  }
  
  async createMoodBoard(insertMoodBoard: InsertMoodBoard): Promise<MoodBoard> {
    const id = this.currentMoodBoardId++;
    const moodBoard: MoodBoard = {
      ...insertMoodBoard,
      id,
      description: insertMoodBoard.description || null,
      tags: insertMoodBoard.tags || null,
      images: insertMoodBoard.images || null,
      createdAt: new Date()
    };
    this.moodBoards.set(id, moodBoard);
    return moodBoard;
  }
  
  // Analytics methods
  async getAnalyticsByUserId(userId: number, period: string): Promise<AnalyticsData | undefined> {
    return Array.from(this.analyticsData.values())
      .find(data => data.userId === userId && data.period === period);
  }
  
  async createAnalyticsData(insertData: InsertAnalyticsData): Promise<AnalyticsData> {
    const id = this.currentAnalyticsId++;
    const data: AnalyticsData = {
      ...insertData,
      id,
      engagementRate: insertData.engagementRate || null,
      growthRate: insertData.growthRate || null,
      topPerforming: insertData.topPerforming || null,
      predictions: insertData.predictions || null,
      date: new Date()
    };
    this.analyticsData.set(id, data);
    return data;
  }

  // Creative Symbiosis Framework Methods

  // User Engagement methods
  async getUserEngagementByUserId(userId: number): Promise<UserEngagement[]> {
    return Array.from(this.userEngagements.values())
      .filter(engagement => engagement.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by latest first
  }
  
  async trackUserEngagement(engagement: InsertUserEngagement): Promise<UserEngagement> {
    const id = this.currentEngagementId++;
    const userEngagement: UserEngagement = {
      ...engagement,
      id,
      createdAt: new Date()
    };
    this.userEngagements.set(id, userEngagement);
    
    // Also update user's evolution points
    await this.updateEvolutionPoints(engagement.userId, 5); // Award 5 points for any interaction
    
    return userEngagement;
  }
  
  // Evolution Points methods
  async getEvolutionPointsByUserId(userId: number): Promise<EvolutionPoints | undefined> {
    return Array.from(this.evolutionPointsData.values())
      .find(points => points.userId === userId);
  }
  
  async createEvolutionPoints(points: InsertEvolutionPoints): Promise<EvolutionPoints> {
    const id = this.currentEvolutionPointsId++;
    const evolutionPoints: EvolutionPoints = {
      ...points,
      id,
      lastPointsUpdate: new Date(),
      updatedAt: new Date()
    };
    this.evolutionPointsData.set(id, evolutionPoints);
    return evolutionPoints;
  }
  
  async updateEvolutionPoints(userId: number, pointsToAdd: number): Promise<EvolutionPoints> {
    let userPoints = await this.getEvolutionPointsByUserId(userId);
    
    // If user doesn't have evolution points yet, create them
    if (!userPoints) {
      userPoints = await this.createEvolutionPoints({
        userId,
        totalPoints: 0,
        currentTier: "starter",
        nextMilestone: 100,
        creativeEnergyPoints: 100
      });
    }
    
    // Update the points
    const totalPoints = userPoints.totalPoints + pointsToAdd;
    
    // Determine tier based on total points
    let currentTier = userPoints.currentTier;
    let nextMilestone = userPoints.nextMilestone;
    
    if (totalPoints >= 1000) {
      currentTier = "expert";
      nextMilestone = 1500;
    } else if (totalPoints >= 500) {
      currentTier = "advanced";
      nextMilestone = 1000;
    } else if (totalPoints >= 250) {
      currentTier = "established";
      nextMilestone = 500;
    } else if (totalPoints >= 100) {
      currentTier = "growing";
      nextMilestone = 250;
    }
    
    // Update the record
    const updatedPoints: EvolutionPoints = {
      ...userPoints,
      totalPoints,
      currentTier,
      nextMilestone,
      updatedAt: new Date()
    };
    
    this.evolutionPointsData.set(userPoints.id, updatedPoints);
    
    return updatedPoints;
  }
  
  async refreshCreativeEnergyPoints(userId: number): Promise<EvolutionPoints> {
    const userPoints = await this.getEvolutionPointsByUserId(userId);
    
    if (!userPoints) {
      return this.createEvolutionPoints({
        userId,
        totalPoints: 0,
        currentTier: "starter",
        nextMilestone: 100,
        creativeEnergyPoints: 100 // Start with full energy
      });
    }
    
    // Calculate how many points to regenerate based on time elapsed
    const now = new Date();
    const hoursElapsed = Math.floor((now.getTime() - userPoints.lastPointsUpdate.getTime()) / (1000 * 60 * 60));
    
    // Regenerate at a rate of 5 points per hour, up to a maximum based on tier
    const pointsToRegenerate = Math.min(hoursElapsed * 5, 100);
    
    // Max energy depends on tier
    let maxEnergy = 100;
    switch (userPoints.currentTier) {
      case "expert":
        maxEnergy = 200;
        break;
      case "advanced":
        maxEnergy = 150;
        break;
      case "established":
        maxEnergy = 125;
        break;
      case "growing":
        maxEnergy = 110;
        break;
    }
    
    // Update energy points
    const newEnergyPoints = Math.min(userPoints.creativeEnergyPoints + pointsToRegenerate, maxEnergy);
    
    // Update the record
    const updatedPoints: EvolutionPoints = {
      ...userPoints,
      creativeEnergyPoints: newEnergyPoints,
      lastPointsUpdate: now,
      updatedAt: now
    };
    
    this.evolutionPointsData.set(userPoints.id, updatedPoints);
    
    return updatedPoints;
  }
  
  // User Capabilities methods
  async getUserCapabilitiesByUserId(userId: number): Promise<UserCapabilities[]> {
    return Array.from(this.userCapabilitiesData.values())
      .filter(capability => capability.userId === userId);
  }
  
  async unlockUserCapability(capability: InsertUserCapabilities): Promise<UserCapabilities> {
    const id = this.currentCapabilityId++;
    const userCapability: UserCapabilities = {
      ...capability,
      id,
      isUnlocked: true,
      unlockedAt: new Date(),
      level: capability.level || 1
    };
    this.userCapabilitiesData.set(id, userCapability);
    return userCapability;
  }
  
  async upgradeCapabilityLevel(userId: number, capabilityName: string): Promise<UserCapabilities> {
    // Find the capability
    const capability = Array.from(this.userCapabilitiesData.values())
      .find(cap => cap.userId === userId && cap.capabilityName === capabilityName);
    
    if (!capability) {
      throw new Error(`Capability ${capabilityName} not found for user ${userId}`);
    }
    
    // Upgrade the level
    const updatedCapability: UserCapabilities = {
      ...capability,
      level: capability.level + 1,
      updatedAt: new Date()
    };
    
    this.userCapabilitiesData.set(capability.id, updatedCapability);
    
    return updatedCapability;
  }
  
  // Creative History methods
  async getCreativeHistoryByUserIdAndPeriod(userId: number, period: string): Promise<CreativeHistory | undefined> {
    return Array.from(this.creativeHistoryData.values())
      .find(history => history.userId === userId && history.period === period);
  }
  
  async createCreativeHistory(history: InsertCreativeHistory): Promise<CreativeHistory> {
    const id = this.currentCreativeHistoryId++;
    const creativeHistory: CreativeHistory = {
      ...history,
      id,
      createdAt: new Date()
    };
    this.creativeHistoryData.set(id, creativeHistory);
    return creativeHistory;
  }
  
  async updateCreativeHistory(userId: number, period: string, updates: Partial<InsertCreativeHistory>): Promise<CreativeHistory> {
    // Find the history record
    const history = await this.getCreativeHistoryByUserIdAndPeriod(userId, period);
    
    if (!history) {
      // If not found, create a new one with the updates
      return this.createCreativeHistory({
        userId,
        period,
        ...(updates as InsertCreativeHistory)
      });
    }
    
    // Update the existing record
    const updatedHistory: CreativeHistory = {
      ...history,
      ...updates,
      // Keep the original fields
      userId: history.userId,
      period: history.period,
      id: history.id,
      createdAt: history.createdAt
    };
    
    this.creativeHistoryData.set(history.id, updatedHistory);
    
    return updatedHistory;
  }
  
  // Color Palette methods
  async getColorPalettesByUserId(userId: number): Promise<ColorPalette[]> {
    return Array.from(this.colorPalettesData.values())
      .filter(palette => palette.userId === userId);
  }
  
  async getColorPaletteById(id: number): Promise<ColorPalette | undefined> {
    return this.colorPalettesData.get(id);
  }
  
  async createColorPalette(palette: InsertColorPalette): Promise<ColorPalette> {
    const id = this.currentColorPaletteId++;
    const colorPalette: ColorPalette = {
      ...palette,
      id,
      colors: palette.colors || [],
      tags: palette.tags || [],
      isFavorite: palette.isFavorite || false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.colorPalettesData.set(id, colorPalette);
    return colorPalette;
  }
  
  async updateColorPalette(id: number, updates: Partial<InsertColorPalette>): Promise<ColorPalette> {
    const palette = await this.getColorPaletteById(id);
    
    if (!palette) {
      throw new Error(`Color palette with id ${id} not found`);
    }
    
    const updatedPalette: ColorPalette = {
      ...palette,
      ...updates,
      // Keep the original fields
      id: palette.id,
      userId: palette.userId,
      usageCount: palette.usageCount,
      createdAt: palette.createdAt,
      updatedAt: new Date()
    };
    
    this.colorPalettesData.set(id, updatedPalette);
    
    return updatedPalette;
  }
  
  async incrementColorPaletteUsage(id: number): Promise<ColorPalette> {
    const palette = await this.getColorPaletteById(id);
    
    if (!palette) {
      throw new Error(`Color palette with id ${id} not found`);
    }
    
    const updatedPalette: ColorPalette = {
      ...palette,
      usageCount: palette.usageCount + 1,
      updatedAt: new Date()
    };
    
    this.colorPalettesData.set(id, updatedPalette);
    
    return updatedPalette;
  }
  
  async getColorPalettesByMood(mood: string): Promise<ColorPalette[]> {
    return Array.from(this.colorPalettesData.values())
      .filter(palette => palette.mood.toLowerCase() === mood.toLowerCase());
  }

  // Mood Capsules methods
  async getMoodCapsulesByUserId(userId: number): Promise<MoodCapsule[]> {
    return Array.from(this.moodCapsulesData.values())
      .filter(capsule => capsule.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getMoodCapsuleById(id: number): Promise<MoodCapsule | undefined> {
    return this.moodCapsulesData.get(id);
  }

  async createMoodCapsule(capsule: InsertMoodCapsule): Promise<MoodCapsule> {
    const id = this.currentMoodCapsuleId++;
    const moodCapsule: MoodCapsule = {
      ...capsule,
      id,
      description: capsule.description || null,
      captionTone: capsule.captionTone || "balanced",
      aiGeneratedCaption: capsule.aiGeneratedCaption || null,
      thumbnailUrl: capsule.thumbnailUrl || null,
      contentIds: capsule.contentIds || [],
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.moodCapsulesData.set(id, moodCapsule);
    return moodCapsule;
  }

  async updateMoodCapsule(id: number, updates: Partial<InsertMoodCapsule>): Promise<MoodCapsule> {
    const capsule = await this.getMoodCapsuleById(id);
    if (!capsule) {
      throw new Error(`Mood capsule with id ${id} not found`);
    }

    const updatedCapsule: MoodCapsule = {
      ...capsule,
      ...updates,
      updatedAt: new Date()
    };
    this.moodCapsulesData.set(id, updatedCapsule);
    return updatedCapsule;
  }

  async deleteMoodCapsule(id: number): Promise<boolean> {
    const exists = this.moodCapsulesData.has(id);
    if (!exists) {
      return false;
    }
    return this.moodCapsulesData.delete(id);
  }

  async archiveMoodCapsule(id: number): Promise<MoodCapsule> {
    const capsule = await this.getMoodCapsuleById(id);
    if (!capsule) {
      throw new Error(`Mood capsule with id ${id} not found`);
    }

    const archivedCapsule: MoodCapsule = {
      ...capsule,
      isArchived: true,
      updatedAt: new Date()
    };
    this.moodCapsulesData.set(id, archivedCapsule);
    return archivedCapsule;
  }

  // Content Sentiment methods
  async getContentSentimentById(contentId: number): Promise<ContentSentiment | undefined> {
    return Array.from(this.contentSentimentsData.values())
      .find(sentiment => sentiment.contentId === contentId);
  }

  async getContentSentimentsByUserId(userId: number): Promise<ContentSentiment[]> {
    return Array.from(this.contentSentimentsData.values())
      .filter(sentiment => sentiment.userId === userId)
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime()); // Most recent first
  }

  async createContentSentiment(sentiment: InsertContentSentiment): Promise<ContentSentiment> {
    const id = this.currentContentSentimentId++;
    const contentSentiment: ContentSentiment = {
      ...sentiment,
      id,
      dominantEmotion: sentiment.dominantEmotion || null,
      emotionIntensity: sentiment.emotionIntensity || 0,
      emotionBreakdown: sentiment.emotionBreakdown || {},
      keywords: sentiment.keywords || [],
      analyzedAt: new Date()
    };
    this.contentSentimentsData.set(id, contentSentiment);
    return contentSentiment;
  }

  async updateContentSentiment(contentId: number, updates: Partial<InsertContentSentiment>): Promise<ContentSentiment> {
    const sentiment = await this.getContentSentimentById(contentId);
    if (!sentiment) {
      throw new Error(`Content sentiment for content ID ${contentId} not found`);
    }

    const updatedSentiment: ContentSentiment = {
      ...sentiment,
      ...updates,
      analyzedAt: new Date()
    };
    this.contentSentimentsData.set(sentiment.id, updatedSentiment);
    return updatedSentiment;
  }

  async analyzeContentSentiment(contentIds: number[]): Promise<ContentSentiment[]> {
    const results: ContentSentiment[] = [];
    
    for (const contentId of contentIds) {
      const content = await this.getContentById(contentId);
      if (!content) {
        continue;
      }
      
      // Check if sentiment already exists
      let sentiment = await this.getContentSentimentById(contentId);
      
      // If sentiment exists and is less than 1 day old, skip reanalysis
      if (sentiment && 
          (new Date().getTime() - sentiment.analyzedAt.getTime()) < 24 * 60 * 60 * 1000) {
        results.push(sentiment);
        continue;
      }
      
      // Simulate AI analysis - in a real implementation, this would call an AI service
      const emotions = ["joyful", "nostalgic", "energetic", "thoughtful", "relaxed"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomIntensity = Math.floor(Math.random() * 100);
      
      // Create a breakdown of emotions (with the dominant one having the highest value)
      const emotionBreakdown: Record<string, number> = {};
      emotions.forEach(emotion => {
        emotionBreakdown[emotion] = Math.floor(Math.random() * 40);
      });
      emotionBreakdown[randomEmotion] += 60; // Make sure the dominant emotion has the highest value
      
      // Extract keywords from content title and description
      const keywordsSource = `${content.title} ${content.description || ''}`;
      const keywords = keywordsSource
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5);
      
      // Create or update sentiment
      if (sentiment) {
        sentiment = await this.updateContentSentiment(contentId, {
          dominantEmotion: randomEmotion,
          emotionIntensity: randomIntensity,
          emotionBreakdown,
          keywords
        });
      } else {
        sentiment = await this.createContentSentiment({
          contentId,
          userId: content.userId,
          dominantEmotion: randomEmotion,
          emotionIntensity: randomIntensity,
          emotionBreakdown,
          keywords
        });
      }
      
      results.push(sentiment);
    }
    
    return results;
  }

  async generateCaptionForMoodCapsule(
    contentIds: number[], 
    emotionalTone: string, 
    captionTone: string
  ): Promise<string> {
    // In a real implementation, this would call an AI service to generate a caption
    // based on the emotional tone and content analysis
    
    // Get the content items
    const contentItems = await Promise.all(
      contentIds.map(id => this.getContentById(id))
    );
    const validContentItems = contentItems.filter(item => item !== undefined) as Content[];
    
    if (validContentItems.length === 0) {
      return "No content found to generate a caption.";
    }
    
    // Get content sentiment analysis
    await this.analyzeContentSentiment(contentIds);
    
    // Generate a caption based on the emotional tone and caption tone
    const captionIntros: Record<string, string[]> = {
      joyful: ["Embracing moments of pure joy", "Celebrating life's brightest moments", "Finding happiness in the everyday"],
      nostalgic: ["Reminiscing about times gone by", "A gentle look back at cherished memories", "Treasuring the moments that shaped us"],
      energetic: ["Capturing the vibrant spirit of life", "Embracing the dynamic energy around us", "Moving forward with unstoppable momentum"],
      thoughtful: ["Reflecting on life's deeper meanings", "Contemplating the beauty in stillness", "Finding wisdom in quiet moments"],
      relaxed: ["Embracing the peaceful rhythm of life", "Finding tranquility in simple moments", "Unwinding in a world of calm"]
    };
    
    const captionStyles: Record<string, (intro: string) => string> = {
      poetic: (intro) => `${intro}, where each frame tells a story of emotion that transcends time, connecting us to the universal language of human experience.`,
      concise: (intro) => `${intro}. Captured with intention.`,
      balanced: (intro) => `${intro}. These moments reveal the authentic emotional landscape of a journey worth remembering.`,
      conversational: (intro) => `${intro}. Isn't it amazing how these moments can make us feel so alive and connected? Let's cherish them together.`,
      technical: (intro) => `${intro}. This collection demonstrates the interplay between composition, lighting, and subject matter to evoke specific emotional responses.`
    };
    
    // Default to balanced if tone not found
    const defaultEmotion = "thoughtful";
    const defaultCaptionTone = "balanced";
    
    const introOptions = captionIntros[emotionalTone] || captionIntros[defaultEmotion];
    const intro = introOptions[Math.floor(Math.random() * introOptions.length)];
    const styleFunction = captionStyles[captionTone] || captionStyles[defaultCaptionTone];
    
    return styleFunction(intro);
  }
}

export const storage = new MemStorage();
