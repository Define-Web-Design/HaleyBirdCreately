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

// Social media platforms
export const PLATFORMS = [
  { name: "Instagram", icon: "fab fa-instagram", color: "text-pink-600" },
  { name: "TikTok", icon: "fab fa-tiktok", color: "text-black dark:text-white" },
  { name: "Pinterest", icon: "fab fa-pinterest", color: "text-red-600" },
  { name: "Twitter", icon: "fab fa-twitter", color: "text-blue-400" },
];

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

// Enhancement tools
export const ENHANCEMENT_TOOLS = [
  {
    title: "Mood Board Generator",
    description: "Generate AI-powered mood boards based on your content style and audience preferences.",
    icon: "fas fa-palette",
    gradient: "from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
    border: "border-primary/20 dark:border-primary/10",
    iconGradient: "gradient-primary",
    buttonColor: "bg-primary hover:bg-primary/90",
    isNew: true,
  },
  {
    title: "Caption Generator",
    description: "Create engaging, on-brand captions that match your voice and boost engagement.",
    icon: "fas fa-comment-alt",
    gradient: "from-secondary/10 to-accent/10 dark:from-secondary/20 dark:to-accent/20",
    border: "border-secondary/20 dark:border-secondary/10",
    iconGradient: "bg-gradient-to-r from-secondary to-pink-400",
    buttonColor: "bg-secondary hover:bg-secondary/90",
    isNew: false,
  },
  {
    title: "Cross-Platform Adapter",
    description: "Automatically optimize and format your content for different social platforms.",
    icon: "fas fa-sync-alt",
    gradient: "from-accent/10 to-blue-400/10 dark:from-accent/20 dark:to-blue-400/20",
    border: "border-accent/20 dark:border-accent/10",
    iconGradient: "bg-gradient-to-r from-accent to-blue-400",
    buttonColor: "bg-accent hover:bg-accent/90",
    isNew: false,
  },
];
