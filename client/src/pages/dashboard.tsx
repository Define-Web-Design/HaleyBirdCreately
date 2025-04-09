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
          <TabsList className="h-auto p-0 bg-transparent w-full justify-start overflow-x-auto">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <LayoutGridIcon className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger 
              value="transformation" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <RefreshCwIcon className="w-4 h-4" /> Content Transformation
            </TabsTrigger>
            <TabsTrigger 
              value="growth" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <BarChart3Icon className="w-4 h-4" /> Growth Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="collaboration" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <UsersIcon className="w-4 h-4" /> Collaborative Workspace
            </TabsTrigger>
            <TabsTrigger 
              value="ai-tools" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <SparklesIcon className="w-4 h-4" /> AI Growth Ecosystem
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
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-amber-50 dark:from-indigo-950/20 dark:to-amber-950/20 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Evolutionary AI</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                  The AI is continuously learning from your interactions to better serve your creative and intellectual needs
                </p>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
                    <div className="text-sm font-medium">Personalization Level</div>
                    <div className="text-2xl font-bold text-primary">68%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Based on 142 interactions
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
                    <div className="text-sm font-medium">Voice Matching</div>
                    <div className="text-2xl font-bold text-primary">91%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Preserving your authentic style
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
                    <div className="text-sm font-medium">Learning Progress</div>
                    <div className="text-2xl font-bold text-primary">Level 3</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Moving toward adaptive mastery
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="whitespace-nowrap">
                <RotateCwIcon className="w-4 h-4 mr-2" />
                Train AI with New Content
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
