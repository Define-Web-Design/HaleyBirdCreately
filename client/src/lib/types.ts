// User types
export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: string;
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
