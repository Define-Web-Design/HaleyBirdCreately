import { 
  users, type User, type InsertUser,
  content, type Content, type InsertContent,
  moodBoards, type MoodBoard, type InsertMoodBoard,
  analyticsData, type AnalyticsData, type InsertAnalyticsData,
  
  // Creative Symbiosis Framework types
  userEngagement, type UserEngagement, type InsertUserEngagement,
  evolutionPoints, type EvolutionPoints, type InsertEvolutionPoints,
  userCapabilities, type UserCapabilities, type InsertUserCapabilities,
  creativeHistory, type CreativeHistory, type InsertCreativeHistory
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
  
  private currentUserId: number;
  private currentContentId: number;
  private currentMoodBoardId: number;
  private currentAnalyticsId: number;
  private currentEngagementId: number = 1;
  private currentEvolutionPointsId: number = 1;
  private currentCapabilityId: number = 1;
  private currentCreativeHistoryId: number = 1;

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
    
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentMoodBoardId = 1;
    this.currentAnalyticsId = 1;
    this.currentEngagementId = 1;
    this.currentEvolutionPointsId = 1;
    this.currentCapabilityId = 1;
    this.currentCreativeHistoryId = 1;
    
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
}

export const storage = new MemStorage();
