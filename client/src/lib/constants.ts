import { useState, useEffect } from 'react';

// Color scheme
export const COLORS = {
  PRIMARY: "#F2994A", // warm orange
  SECONDARY: "#FF9DAE", // soft magenta
  ACCENT: "#6FCF97", // fresh green
  LIGHT_BG: "#FAFAFA", // cloud white for light mode
  DARK_BG: "#121212", // charcoal for dark mode
  TEXT_DARK: "#333333", // slate gray
  TEXT_LIGHT: "#FAFAFA", // white text for dark mode
};

// Navigation menu items
export const MENU_ITEMS = [
  {
    name: "Dashboard",
    path: "/",
    icon: "fas fa-home",
  },
  {
    name: "Content Library",
    path: "/content-library",
    icon: "fas fa-image",
  },
  {
    name: "Content Calendar",
    path: "/content-calendar",
    icon: "fas fa-calendar-alt",
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: "fas fa-chart-line",
  },
  {
    name: "Mood Boards",
    path: "/mood-boards",
    icon: "fas fa-palette",
  },
  {
    name: "Content Vault",
    path: "/content-vault",
    icon: "fas fa-archive",
  },
  {
    name: "Apple Photos",
    path: "/apple-photos",
    icon: "fas fa-camera",
  },
  {
    name: "Creative Symbiosis",
    path: "/creative-symbiosis",
    icon: "fas fa-seedling",
    isNew: true,
  },
  {
    name: "Color Palettes",
    path: "/color-palettes",
    icon: "fas fa-swatchbook",
    isNew: true,
  },
  {
    name: "Mood Capsules",
    path: "/mood-capsules",
    icon: "fas fa-brain",
    isNew: true,
  },
];

export const SMART_TOOLS = [
  {
    name: "AI Enhancement",
    path: "/ai-enhancement",
    icon: "fas fa-magic",
  },
  {
    name: "Creative Prompts",
    path: "/creative-prompts",
    icon: "fas fa-lightbulb",
  },
  {
    name: "Cross-Platform Tools",
    path: "/cross-platform-tools",
    icon: "fas fa-sync",
  },
];

// Social media platforms with integration status
export interface Platform {
  name: string;
  icon: string;
  color: string;
  type: 'photo_video' | 'video' | 'photo' | 'text_photo_video' | 'blog';
  authUrl: string;
}

export const PLATFORMS: Platform[] = [
  { 
    name: "Instagram",
    icon: "fab fa-instagram",
    color: "text-pink-600",
    type: "photo_video",
    authUrl: "/api/auth/instagram"
  },
  { 
    name: "X",
    icon: "fab fa-x-twitter",
    color: "text-slate-800",
    type: "text_photo_video",
    authUrl: "/api/auth/twitter"
  },
  { 
    name: "Facebook",
    icon: "fab fa-facebook",
    color: "text-blue-600",
    type: "text_photo_video",
    authUrl: "/api/auth/facebook"
  },
  { 
    name: "LinkedIn",
    icon: "fab fa-linkedin",
    color: "text-blue-700",
    type: "text_photo_video",
    authUrl: "/api/auth/linkedin"
  },
  { 
    name: "Medium",
    icon: "fab fa-medium",
    color: "text-slate-800",
    type: "blog",
    authUrl: "/api/auth/medium"
  }
];

// Hook to get integrated platforms
export const useIntegratedPlatforms = () => {
  //This needs to be implemented with a proper query library like react-query or swr.  This is a placeholder.
  const [integratedPlatforms, setIntegratedPlatforms] = useState<Platform[]>([]);
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await fetch('/api/user/integrations');
        if (!response.ok) throw new Error('Failed to fetch integrations');
        const data = await response.json();
        setIntegratedPlatforms(data);
      } catch (error) {
        console.error("Error fetching integrations:", error);
      }
    };
    fetchIntegrations();
  }, []);
  return integratedPlatforms;
};


// Status types for content
export const CONTENT_STATUS = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  POSTED: "Posted",
};

// Time periods for analytics
export const TIME_PERIODS = [
  { label: "Last 30 Days", value: "30days" },
  { label: "Last Week", value: "7days" },
  { label: "Last 3 Months", value: "90days" },
];

// Enhancement tools with vibrant visual styling
export const ENHANCEMENT_TOOLS = [
  {
    title: "Mood Board Generator",
    description: "Generate AI-powered mood boards based on your content style and audience preferences.",
    icon: "fas fa-palette",
    gradient: "from-purple-600/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-500/20",
    border: "border-purple-600/20 dark:border-purple-600/10",
    iconGradient: "bg-gradient-to-r from-purple-600 to-pink-500",
    buttonColor: "bg-purple-600 hover:bg-purple-600/90",
    isNew: true,
    animation: "hover:shadow-[0_0_20px_rgba(98,0,234,0.3)] transition-all duration-300",
  },
  {
    title: "Caption Generator",
    description: "Create engaging, on-brand captions that match your voice and boost engagement.",
    icon: "fas fa-comment-alt",
    gradient: "from-pink-500/10 to-cyan-400/10 dark:from-pink-500/20 dark:to-cyan-400/20",
    border: "border-pink-500/20 dark:border-pink-500/10",
    iconGradient: "bg-gradient-to-r from-pink-500 to-cyan-400",
    buttonColor: "bg-pink-500 hover:bg-pink-500/90",
    isNew: false,
    animation: "hover:shadow-[0_0_20px_rgba(255,64,129,0.3)] transition-all duration-300",
  },
  {
    title: "Cross-Platform Adapter",
    description: "Automatically optimize and format your content for different social platforms.",
    icon: "fas fa-sync-alt",
    gradient: "from-cyan-400/10 to-green-400/10 dark:from-cyan-400/20 dark:to-green-400/20",
    border: "border-cyan-400/20 dark:border-cyan-400/10",
    iconGradient: "bg-gradient-to-r from-cyan-400 to-green-400",
    buttonColor: "bg-cyan-400 hover:bg-cyan-400/90",
    isNew: false,
    animation: "hover:shadow-[0_0_20px_rgba(0,188,212,0.3)] transition-all duration-300",
  },
  {
    title: "Color Mood Analyzer",
    description: "Analyze your content palette and suggest complementary color schemes for cohesion.",
    icon: "fas fa-eye-dropper",
    gradient: "from-amber-400/10 to-purple-600/10 dark:from-amber-400/20 dark:to-purple-600/20",
    border: "border-amber-400/20 dark:border-amber-400/10",
    iconGradient: "bg-gradient-to-r from-amber-400 to-purple-600",
    buttonColor: "bg-amber-400 hover:bg-amber-400/90",
    isNew: true,
    animation: "hover:shadow-[0_0_20px_rgba(255,171,0,0.3)] transition-all duration-300",
  },
];