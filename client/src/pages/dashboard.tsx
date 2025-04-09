import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutGridIcon, 
  BarChart3Icon, 
  UsersIcon, 
  SparklesIcon, 
  RefreshCwIcon,
  RotateCwIcon 
} from 'lucide-react';

// Dashboard Components
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import PerformanceInsights from '@/components/dashboard/PerformanceInsights';
import ContentLibrary from '@/components/dashboard/ContentLibrary';
import AIEnhancementTools from '@/components/dashboard/AIEnhancementTools';
import ContentCalendar from '@/components/dashboard/ContentCalendar';
import GrowthMetricsDashboard from '@/components/dashboard/GrowthMetricsDashboard';
import ContentTransformationHub from '@/components/content/ContentTransformationHub';
import CollaborativeWorkspace from '@/components/collaboration/CollaborativeWorkspace';

// Types
import { 
  AnalyticsData, 
  ContentItem, 
  User, 
  CollaborativeWorkspace as WorkspaceType 
} from '@/lib/types';

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data to demonstrate full ecosystem capabilities
  const mockUser: User = {
    id: 1,
    username: 'sophia',
    displayName: 'Sophia Chen',
    email: 'sophia@example.com',
    avatar: '',
    role: 'creator',
    // Growth metrics following our multidimensional vision
    growthMetrics: {
      intellectual: 72,
      creative: 85,
      impact: 64,
      trend: {
        intellectual: 'rising',
        creative: 'rising',
        impact: 'stable'
      },
      lastUpdated: new Date().toISOString()
    },
    // Collaboration statistics to track team synergy
    collaborationStats: {
      activeCollaborations: 2,
      contributionsGiven: 28,
      contributionsReceived: 16,
      teamSynergy: 79,
      recentCollaborators: [
        {
          id: 2,
          displayName: 'Alex Morgan',
          avatar: '',
          role: 'editor',
          lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          displayName: 'Jordan Lee',
          avatar: '',
          role: 'designer',
          lastInteraction: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    // Learning journey to track personal growth
    learningJourney: {
      currentLevel: 3,
      nextMilestone: "Cross-Platform Content Mastery",
      recentInsights: [
        "Your authentic voice resonates most when discussing personal growth topics",
        "Visual content performs 38% better when using your signature color palette"
      ],
      skillsGained: ["Emotional Tone Crafting", "Visual Storytelling", "Platform Adaptation"],
      personalizationIndex: 68
    }
  };
  
  // Queries for data - using mock data for now to demonstrate full capabilities
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: false, // Disabled for now
    initialData: mockUser // Use mock data for demonstration
  });
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData | null>({
    queryKey: ['/api/analytics'],
    enabled: false, // Disabled for now
  });
  
  const { data: contentItems, isLoading: isLoadingContent } = useQuery<ContentItem[] | null>({
    queryKey: ['/api/content'],
    enabled: false, // Disabled for now
  });

  // Handle create content click
  const handleCreateContent = () => {
    toast({
      title: "Create Content",
      description: "The content creation modal would open here.",
    });
  };

  // Handle content actions
  const handleEditContent = (id: number) => {
    toast({
      title: "Edit Content",
      description: `Editing content with ID: ${id}`,
    });
  };

  const handleShareContent = (id: number) => {
    toast({
      title: "Share Content",
      description: `Sharing content with ID: ${id}`,
    });
  };

  const handleEnhanceContent = (id: number) => {
    toast({
      title: "Enhance Content",
      description: `Enhancing content with ID: ${id} with AI tools`,
    });
  };

  // Handle tool selection
  const handleToolSelect = (toolName: string) => {
    toast({
      title: toolName,
      description: `Opening ${toolName} tool`,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Main welcome section with growth metrics remains at the top */}
      <WelcomeSection 
        user={user || undefined} 
        onCreateContent={handleCreateContent} 
      />
      
      {/* Tabs for the different ecosystem sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="h-auto p-0 bg-transparent w-full justify-start overflow-x-auto scrollbar-hide">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-2.5 sm:px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <LayoutGridIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transformation" 
              className="flex items-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-2.5 sm:px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <RefreshCwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="sm:inline">Transform</span>
            </TabsTrigger>
            <TabsTrigger 
              value="growth" 
              className="flex items-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-2.5 sm:px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <BarChart3Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="sm:inline">Growth</span>
            </TabsTrigger>
            <TabsTrigger 
              value="collaboration" 
              className="flex items-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-2.5 sm:px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="sm:inline">Collaborate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-tools" 
              className="flex items-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-2.5 sm:px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary text-xs sm:text-sm whitespace-nowrap"
            >
              <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="sm:inline">AI Tools</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Overview Tab - Main Dashboard */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          <PerformanceInsights 
            analyticsData={analytics || undefined} 
            isLoading={isLoadingAnalytics} 
          />
          
          <ContentLibrary 
            contentItems={contentItems || []} 
            isLoading={isLoadingContent}
            onEdit={handleEditContent}
            onShare={handleShareContent}
            onEnhance={handleEnhanceContent}
          />
          
          <ContentCalendar 
            onDayClick={(day) => {
              toast({
                title: "Selected Date",
                description: `Selected ${day.date}/${day.month + 1}/${day.year}`,
              });
            }}
            onPrevMonth={() => {
              toast({
                title: "Calendar Navigation",
                description: "Navigated to previous month",
              });
            }}
            onNextMonth={() => {
              toast({
                title: "Calendar Navigation",
                description: "Navigated to next month",
              });
            }}
          />
        </TabsContent>
        
        {/* Content Transformation Tab */}
        <TabsContent value="transformation" className="mt-6">
          <ContentTransformationHub />
        </TabsContent>
        
        {/* Growth Metrics Tab */}
        <TabsContent value="growth" className="mt-6">
          <GrowthMetricsDashboard user={user || undefined} />
        </TabsContent>
        
        {/* Collaborative Workspace Tab */}
        <TabsContent value="collaboration" className="mt-6">
          <CollaborativeWorkspace userId={user?.id} />
        </TabsContent>
        
        {/* AI Growth Ecosystem Tab */}
        <TabsContent value="ai-tools" className="mt-6">
          <AIEnhancementTools onToolSelect={handleToolSelect} />
          
          {/* Evolution Progress Panel */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/20 dark:to-amber-950/20 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Your Evolutionary AI</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  The AI is continuously learning from your interactions to better serve your creative and intellectual needs
                </p>
                
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm font-medium">Personalization</div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">68%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      142 interactions
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3">
                    <div className="text-xs sm:text-sm font-medium">Voice Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">91%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Authentic style
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2.5 sm:p-3 col-span-2 sm:col-span-1">
                    <div className="text-xs sm:text-sm font-medium">Learning</div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">Level 3</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Adaptive mastery
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="whitespace-nowrap text-xs sm:text-sm h-8 sm:h-10 px-2.5 sm:px-4 mt-3 md:mt-0">
                <RotateCwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Train AI<span className="hidden xs:inline"> with New Content</span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
