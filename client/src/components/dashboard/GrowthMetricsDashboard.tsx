import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, GrowthInsight, UserGrowthMetrics } from '@/lib/types';
import { 
  ArrowUpIcon, 
  ArrowRightIcon, 
  ChevronUpIcon,
  ChevronDownIcon,
  MinusIcon,
  BrainIcon,
  SparklesIcon,
  ZapIcon,
  UsersIcon,
  BarChart3Icon,
  TrendingUpIcon,
  GraduationCapIcon
} from 'lucide-react';

interface GrowthMetricsDashboardProps {
  user?: User;
}

const GrowthMetricsDashboard = ({ user }: GrowthMetricsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('intellectual');
  
  // Mock growth insights for development - would come from API in production
  const growthInsights: GrowthInsight[] = [
    {
      id: 1,
      userId: 1,
      insightType: 'intellectual',
      title: 'Research Pattern Recognition',
      description: 'Your content research is becoming more methodical and comprehensive',
      relatedContentIds: [101, 102],
      suggestedActions: ['Try expanding your research to include academic sources', 'Create a structured note-taking system for your findings'],
      createdAt: new Date().toISOString(),
      acknowledged: false,
      impact: 85
    },
    {
      id: 2,
      userId: 1,
      insightType: 'creative',
      title: 'Visual Storytelling Improvement',
      description: 'Your visual content is showing a consistent and distinctive style, becoming more recognizable',
      relatedContentIds: [103, 104],
      suggestedActions: ['Experiment with a signature color palette across platforms', 'Develop a template system for visual cohesion'],
      createdAt: new Date().toISOString(),
      acknowledged: false,
      impact: 78
    },
    {
      id: 3,
      userId: 1,
      insightType: 'impact',
      title: 'Audience Engagement Patterns',
      description: 'Your content with personal stories receives 47% higher engagement',
      relatedContentIds: [105, 106],
      suggestedActions: ['Include more authentic personal experiences in your content', 'Develop a storytelling framework for complex topics'],
      createdAt: new Date().toISOString(),
      acknowledged: true,
      impact: 92
    },
    {
      id: 4,
      userId: 1,
      insightType: 'collaboration',
      title: 'Feedback Integration Growth',
      description: 'You\'ve shown significant improvement in incorporating team feedback',
      relatedContentIds: [107, 108],
      suggestedActions: ['Create a structured system for feedback collection', 'Schedule regular retrospectives to discuss implemented changes'],
      createdAt: new Date().toISOString(),
      acknowledged: false,
      impact: 65
    }
  ];
  
  // Mock growth metrics - would come from the user object in production
  const growthMetrics: UserGrowthMetrics = user?.growthMetrics || {
    intellectual: 72,
    creative: 85,
    impact: 64,
    trend: {
      intellectual: 'rising',
      creative: 'rising',
      impact: 'stable'
    },
    lastUpdated: new Date().toISOString()
  };
  
  // Historical data for growth charts (mock data)
  const historicalData = {
    intellectual: [45, 48, 52, 58, 65, 68, 72],
    creative: [60, 64, 70, 74, 78, 82, 85],
    impact: [40, 42, 48, 55, 60, 62, 64]
  };
  
  // Function to get trend icon
  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch(trend) {
      case 'rising':
        return <ChevronUpIcon className="w-4 h-4 text-green-500" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4 text-amber-500" />;
      case 'declining':
        return <ChevronDownIcon className="w-4 h-4 text-red-500" />;
    }
  };
  
  // Filter insights based on active tab
  const filteredInsights = growthInsights.filter(insight => {
    if (activeTab === 'all') return true;
    return insight.insightType === activeTab;
  });
  
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">Growth Metrics</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track your personal and professional development
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30 text-xs sm:text-sm self-start sm:self-center mt-1 sm:mt-0">
          Updated: {new Date(growthMetrics.lastUpdated).toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Intellectual Growth Card */}
        <Card className={`${activeTab === 'intellectual' ? 'ring-1 ring-indigo-400' : ''}`}>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-md font-medium flex justify-between items-center">
              <div className="flex items-center">
                <BrainIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500" />
                <span className="hidden xs:inline">Intellectual</span><span className="xs:hidden">Intel.</span> Growth
              </div>
              {getTrendIcon(growthMetrics.trend.intellectual)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-end justify-between mb-2">
              <div className="text-xl sm:text-2xl font-bold">{growthMetrics.intellectual}%</div>
              <div className="text-xs text-gray-500 flex items-center">
                <TrendingUpIcon className="w-3 h-3 mr-1" />
                +{historicalData.intellectual[historicalData.intellectual.length - 1] - 
                  historicalData.intellectual[historicalData.intellectual.length - 2]}% <span className="hidden xs:inline">this month</span>
              </div>
            </div>
            <Progress value={growthMetrics.intellectual} className="h-1.5 sm:h-2 mb-2 sm:mb-3" />
            <div className="flex justify-between">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {historicalData.intellectual.map((value, i) => (
                  <div key={i} className="bg-indigo-100 dark:bg-indigo-900/40 rounded-sm relative h-8 sm:h-10">
                    <div 
                      className="absolute bottom-0 w-full bg-indigo-500 rounded-sm" 
                      style={{ height: `${value}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Creative Growth Card */}
        <Card className={`${activeTab === 'creative' ? 'ring-1 ring-fuchsia-400' : ''}`}>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-md font-medium flex justify-between items-center">
              <div className="flex items-center">
                <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-fuchsia-500" />
                Creative Growth
              </div>
              {getTrendIcon(growthMetrics.trend.creative)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-end justify-between mb-2">
              <div className="text-xl sm:text-2xl font-bold">{growthMetrics.creative}%</div>
              <div className="text-xs text-gray-500 flex items-center">
                <TrendingUpIcon className="w-3 h-3 mr-1" />
                +{historicalData.creative[historicalData.creative.length - 1] - 
                  historicalData.creative[historicalData.creative.length - 2]}% <span className="hidden xs:inline">this month</span>
              </div>
            </div>
            <Progress value={growthMetrics.creative} className="h-1.5 sm:h-2 mb-2 sm:mb-3" />
            <div className="flex justify-between">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {historicalData.creative.map((value, i) => (
                  <div key={i} className="bg-fuchsia-100 dark:bg-fuchsia-900/40 rounded-sm relative h-8 sm:h-10">
                    <div 
                      className="absolute bottom-0 w-full bg-fuchsia-500 rounded-sm" 
                      style={{ height: `${value}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Impact Growth Card */}
        <Card className={`${activeTab === 'impact' ? 'ring-1 ring-amber-400' : ''}`}>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-sm sm:text-md font-medium flex justify-between items-center">
              <div className="flex items-center">
                <ZapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-amber-500" />
                <span className="hidden xs:inline">Practical</span><span className="xs:hidden">Pract.</span> Impact
              </div>
              {getTrendIcon(growthMetrics.trend.impact)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-end justify-between mb-2">
              <div className="text-xl sm:text-2xl font-bold">{growthMetrics.impact}%</div>
              <div className="text-xs text-gray-500 flex items-center">
                <TrendingUpIcon className="w-3 h-3 mr-1" />
                +{historicalData.impact[historicalData.impact.length - 1] - 
                  historicalData.impact[historicalData.impact.length - 2]}% <span className="hidden xs:inline">this month</span>
              </div>
            </div>
            <Progress value={growthMetrics.impact} className="h-1.5 sm:h-2 mb-2 sm:mb-3" />
            <div className="flex justify-between">
              <div className="grid grid-cols-7 gap-1 flex-1">
                {historicalData.impact.map((value, i) => (
                  <div key={i} className="bg-amber-100 dark:bg-amber-900/40 rounded-sm relative h-8 sm:h-10">
                    <div 
                      className="absolute bottom-0 w-full bg-amber-500 rounded-sm" 
                      style={{ height: `${value}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Growth Insights */}
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-md font-medium">Growth Insights</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto scrollbar-hide">
              <TabsTrigger value="all" className="flex items-center text-xs sm:text-sm">
                <BarChart3Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> All
              </TabsTrigger>
              <TabsTrigger value="intellectual" className="flex items-center text-xs sm:text-sm">
                <BrainIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-indigo-500" /> Intellectual
              </TabsTrigger>
              <TabsTrigger value="creative" className="flex items-center text-xs sm:text-sm">
                <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-fuchsia-500" /> Creative
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center text-xs sm:text-sm">
                <ZapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-amber-500" /> Impact
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center text-xs sm:text-sm">
                <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-blue-500" /> Collaborate
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredInsights.length > 0 ? (
                  filteredInsights.map(insight => (
                    <Card key={insight.id} className="bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`mt-0.5 sm:mt-1 p-1.5 sm:p-2 rounded-full 
                            ${insight.insightType === 'intellectual' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : ''}
                            ${insight.insightType === 'creative' ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-300' : ''}
                            ${insight.insightType === 'impact' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' : ''}
                            ${insight.insightType === 'collaboration' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                          `}>
                            {insight.insightType === 'intellectual' && <BrainIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {insight.insightType === 'creative' && <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {insight.insightType === 'impact' && <ZapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {insight.insightType === 'collaboration' && <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm sm:text-base font-medium">{insight.title}</h3>
                              <Badge 
                                variant="outline" 
                                className="ml-1.5 sm:ml-2 text-xs bg-white dark:bg-gray-900 whitespace-nowrap"
                              >
                                Impact: {insight.impact}%
                              </Badge>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
                            
                            {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                              <div className="mt-2 sm:mt-3">
                                <h4 className="text-xs font-medium mb-1 sm:mb-1.5 text-gray-700 dark:text-gray-300">Suggested Actions:</h4>
                                <ul className="space-y-0.5 sm:space-y-1">
                                  {insight.suggestedActions.map((action, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                      <ArrowRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 mt-0.5 text-primary" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <GraduationCapIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2 sm:mb-3" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">No insights yet</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                      Continue creating and collaborating to generate new growth insights in this area.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};

export default GrowthMetricsDashboard;