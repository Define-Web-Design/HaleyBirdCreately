import { 
  users, type User, type InsertUser,
  content, type Content, type InsertContent,
  moodBoards, type MoodBoard, type InsertMoodBoard,
  analyticsData, type AnalyticsData, type InsertAnalyticsData
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private moodBoards: Map<number, MoodBoard>;
  private analyticsData: Map<number, AnalyticsData>;
  private currentUserId: number;
  private currentContentId: number;
  private currentMoodBoardId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.moodBoards = new Map();
    this.analyticsData = new Map();
    
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentMoodBoardId = 1;
    this.currentAnalyticsId = 1;
    
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
      createdAt: new Date()
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
      createdAt: new Date()
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
      engagement: 0,
      aiSentiment: 0,
      aiPrediction: 0,
      createdAt: new Date(),
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
      date: new Date()
    };
    this.analyticsData.set(id, data);
    return data;
  }
}

export const storage = new MemStorage();
