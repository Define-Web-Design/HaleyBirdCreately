import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ContentItem, 
  ContentTransformation, 
  AdaptiveMetrics 
} from '@/lib/types';
import { 
  RefreshCwIcon, 
  LayoutGridIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon,
  LinkedinIcon,
  FacebookIcon,
  PenToolIcon,
  ZapIcon,
  BarChart3Icon,
  EyeIcon,
  SparklesIcon,
  PlusIcon,
  ArrowRightIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  CheckIcon,
  ArrowUpIcon
} from 'lucide-react';

interface ContentTransformationHubProps {
  userContent?: ContentItem[];
}

// Sample content data for development
const mockContent: ContentItem[] = [
  {
    id: 1,
    userId: 1,
    title: "The Future of Sustainable Technology",
    description: "An exploration of how technology is adapting to environmental challenges",
    imageUrl: "https://images.unsplash.com/photo-1507668339897-8a035aa9527d",
    status: "Posted",
    platform: "blog",
    engagement: 843,
    aiSentiment: 76,
    aiPrediction: 82,
    tags: ["technology", "sustainability", "future"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    transformationHistory: [
      {
        id: 101,
        transformationType: "adapt",
        description: "Optimized for Instagram with visual focus and concise copy",
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        platform: "instagram",
        performanceChange: 28,
        aiContribution: 65
      },
      {
        id: 102,
        transformationType: "adapt",
        description: "Reformatted into a LinkedIn article with professional tone",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
        platform: "linkedin",
        performanceChange: 43,
        aiContribution: 58
      }
    ],
    adaptiveMetrics: {
      platformSpecificScores: {
        "blog": 85,
        "instagram": 78,
        "linkedin": 92,
        "twitter": 68
      },
      audienceReception: 83,
      authenticitySimilarity: 91,
      suggestedImprovements: [
        "Add more visual data representations for Twitter",
        "Develop a video summary for YouTube audience"
      ],
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    intellectualGrowthScore: 78,
    creativeGrowthScore: 65
  },
  {
    id: 2,
    userId: 1,
    title: "Personal Growth Through Creative Expression",
    description: "How creative activities can foster personal development and well-being",
    imageUrl: "https://images.unsplash.com/photo-1513364778587-6f4f69bde7af",
    status: "Posted",
    platform: "blog",
    engagement: 926,
    aiSentiment: 89,
    aiPrediction: 85,
    tags: ["creativity", "personal-growth", "wellbeing"],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    postedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    transformationHistory: [
      {
        id: 201,
        transformationType: "adapt",
        description: "Transformed into a Twitter thread with key insights",
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        platform: "twitter",
        performanceChange: 35,
        aiContribution: 52
      },
      {
        id: 202,
        transformationType: "enhance",
        description: "Enhanced with additional research and case studies for LinkedIn",
        timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        platform: "linkedin",
        performanceChange: 47,
        aiContribution: 45
      },
      {
        id: 203,
        transformationType: "adapt",
        description: "Adapted for Instagram with creative visuals and quotes",
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        platform: "instagram",
        performanceChange: 52,
        aiContribution: 60
      }
    ],
    adaptiveMetrics: {
      platformSpecificScores: {
        "blog": 88,
        "instagram": 92,
        "linkedin": 86,
        "twitter": 83
      },
      audienceReception: 91,
      authenticitySimilarity: 88,
      suggestedImprovements: [
        "Create a shareable infographic summarizing key points",
        "Develop a short-form video version for TikTok"
      ],
      lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    intellectualGrowthScore: 82,
    creativeGrowthScore: 88
  },
  {
    id: 3,
    userId: 1,
    title: "The Psychology of Color in Digital Design",
    description: "How color choices affect user perception and behavior in digital interfaces",
    imageUrl: "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0",
    status: "Draft",
    platform: "blog",
    aiSentiment: 81,
    aiPrediction: 88,
    tags: ["design", "psychology", "color-theory", "ux"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    intellectualGrowthScore: 90,
    creativeGrowthScore: 75
  }
];

// Define platform icons
const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <InstagramIcon className="w-4 h-4" />;
    case 'twitter':
      return <TwitterIcon className="w-4 h-4" />;
    case 'linkedin':
      return <LinkedinIcon className="w-4 h-4" />;
    case 'youtube':
      return <YoutubeIcon className="w-4 h-4" />;
    case 'facebook':
      return <FacebookIcon className="w-4 h-4" />;
    case 'blog':
      return <PenToolIcon className="w-4 h-4" />;
    default:
      return <LayoutGridIcon className="w-4 h-4" />;
  }
};

// Platform colors
const getPlatformColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'from-purple-500 to-pink-500';
    case 'twitter':
      return 'from-blue-400 to-blue-600';
    case 'linkedin':
      return 'from-blue-600 to-blue-800';
    case 'youtube':
      return 'from-red-500 to-red-700';
    case 'facebook':
      return 'from-blue-500 to-blue-700';
    case 'blog':
      return 'from-green-500 to-teal-500';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

const ContentTransformationHub = ({ userContent = mockContent }: ContentTransformationHubProps) => {
  const [activeTab, setActiveTab] = useState('allContent');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<string>('');
  const [showTransformationPanel, setShowTransformationPanel] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const handleStartTransformation = (content: ContentItem) => {
    setSelectedContent(content);
    setShowTransformationPanel(true);
    // Default to a platform not yet transformed
    const availablePlatforms = ['instagram', 'linkedin', 'twitter', 'youtube', 'facebook'];
    const existingPlatforms = content.transformationHistory?.map(t => t.platform) || [];
    const recommendedPlatform = availablePlatforms.find(p => !existingPlatforms.includes(p)) || 'instagram';
    setTargetPlatform(recommendedPlatform);
  };
  
  // Filter content based on active tab
  const filteredContent = userContent.filter(content => {
    if (activeTab === 'allContent') return true;
    if (activeTab === 'transformed') return content.transformationHistory && content.transformationHistory.length > 0;
    if (activeTab === 'original') return !content.originalSource;
    if (activeTab === 'drafts') return content.status === 'Draft';
    return true;
  });
  
  return (
    <section className="mb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Transformation Hub</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Transform your existing content across platforms while preserving your authentic voice
          </p>
        </div>
        
        <Button className="flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </div>
      
      {/* Main content area */}
      {!showTransformationPanel ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto justify-start">
              <TabsTrigger value="allContent" className="flex items-center">
                <LayoutGridIcon className="w-4 h-4 mr-2" /> All Content
              </TabsTrigger>
              <TabsTrigger value="transformed" className="flex items-center">
                <RefreshCwIcon className="w-4 h-4 mr-2" /> Transformed
              </TabsTrigger>
              <TabsTrigger value="original" className="flex items-center">
                <PenToolIcon className="w-4 h-4 mr-2" /> Original
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center">
                <MessageCircleIcon className="w-4 h-4 mr-2" /> Drafts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((content) => (
                  <Card key={content.id} className="overflow-hidden flex flex-col h-full">
                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {content.imageUrl ? (
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${content.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <SparklesIcon className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      
                      {/* Platform badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`bg-gradient-to-r ${getPlatformColor(content.platform || 'blog')} text-white flex items-center gap-1.5`}>
                          {getPlatformIcon(content.platform || 'blog')}
                          {content.platform ? content.platform.charAt(0).toUpperCase() + content.platform.slice(1) : 'Blog'}
                        </Badge>
                      </div>
                      
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className={`
                          ${content.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                          ${content.status === 'Draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                          ${content.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                        `}>
                          {content.status}
                        </Badge>
                      </div>
                      
                      {/* Transformations count */}
                      {content.transformationHistory && content.transformationHistory.length > 0 && (
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-blue-500 text-white">
                            {content.transformationHistory.length} Transformations
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{content.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2 flex-grow">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Intellectual Value</div>
                          <div className="flex items-center gap-1.5">
                            <Progress 
                              value={content.intellectualGrowthScore || 0} 
                              className="h-1.5 flex-grow" 
                            />
                            <span className="text-xs font-medium">{content.intellectualGrowthScore || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Creative Value</div>
                          <div className="flex items-center gap-1.5">
                            <Progress 
                              value={content.creativeGrowthScore || 0} 
                              className="h-1.5 flex-grow" 
                            />
                            <span className="text-xs font-medium">{content.creativeGrowthScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Transformation preview */}
                      {content.adaptiveMetrics && (
                        <div className="mt-3 space-y-2">
                          <h4 className="text-sm font-medium flex items-center">
                            <BarChart3Icon className="w-3 h-3 mr-1.5 text-primary" />
                            Platform Performance
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(content.adaptiveMetrics.platformSpecificScores).map(([platform, score]) => (
                              <div key={platform} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                                <div className="mr-1.5">
                                  {getPlatformIcon(platform)}
                                </div>
                                <span className="text-xs font-medium">{score}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {content.tags && content.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {content.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-2">
                      <div className="w-full flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="default" 
                          className="w-full sm:flex-1"
                          onClick={() => handleStartTransformation(content)}
                        >
                          <RefreshCwIcon className="w-4 h-4 mr-1.5" />
                          Transform
                        </Button>
                        <Button variant="outline" className="w-full sm:flex-1">
                          <EyeIcon className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        // Transformation panel
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="flex items-center"
              onClick={() => setShowTransformationPanel(false)}
            >
              <ArrowRightIcon className="w-4 h-4 mr-1.5 rotate-180" />
              Back to content
            </Button>
            
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Content Transformation
            </Badge>
          </div>
          
          {selectedContent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original content card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Original Content</CardTitle>
                      <CardDescription>Your authentic content source</CardDescription>
                    </div>
                    <Badge className={`bg-gradient-to-r ${getPlatformColor(selectedContent.platform || 'blog')} text-white flex items-center gap-1.5`}>
                      {getPlatformIcon(selectedContent.platform || 'blog')}
                      {selectedContent.platform ? selectedContent.platform.charAt(0).toUpperCase() + selectedContent.platform.slice(1) : 'Blog'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-md">
                    {selectedContent.imageUrl ? (
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${selectedContent.imageUrl})` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <SparklesIcon className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">{selectedContent.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedContent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Created</div>
                      <div className="font-medium">{formatDate(selectedContent.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Status</div>
                      <div className="font-medium">{selectedContent.status}</div>
                    </div>
                  </div>
                  
                  {/* Authenticity metrics */}
                  {selectedContent.adaptiveMetrics && (
                    <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Voice Authenticity</div>
                        <span className="text-sm">{selectedContent.adaptiveMetrics.authenticitySimilarity}%</span>
                      </div>
                      <Progress value={selectedContent.adaptiveMetrics.authenticitySimilarity} className="h-1.5" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your authentic voice is preserved at {selectedContent.adaptiveMetrics.authenticitySimilarity}% similarity across transformations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Transformation card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Transform Content</CardTitle>
                      <CardDescription>Adapt for your target platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Platform selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Platform</label>
                    <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram" className="flex items-center">
                          <div className="flex items-center">
                            <InstagramIcon className="w-4 h-4 mr-2" /> Instagram
                          </div>
                        </SelectItem>
                        <SelectItem value="twitter">
                          <div className="flex items-center">
                            <TwitterIcon className="w-4 h-4 mr-2" /> Twitter
                          </div>
                        </SelectItem>
                        <SelectItem value="linkedin">
                          <div className="flex items-center">
                            <LinkedinIcon className="w-4 h-4 mr-2" /> LinkedIn
                          </div>
                        </SelectItem>
                        <SelectItem value="youtube">
                          <div className="flex items-center">
                            <YoutubeIcon className="w-4 h-4 mr-2" /> YouTube
                          </div>
                        </SelectItem>
                        <SelectItem value="facebook">
                          <div className="flex items-center">
                            <FacebookIcon className="w-4 h-4 mr-2" /> Facebook
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Transformation options */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-medium">Transformation Options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                              <RefreshCwIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Adaptive Transformation</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Optimize content format, length, and style for {targetPlatform}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5">
                              <SparklesIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Creative Enhancement</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Add creative elements while maintaining your voice
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5">
                              <RotateCcwIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Reformat Only</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Simple reformatting without changing content
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mt-0.5">
                              <BarChart3Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Engagement Focus</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Optimize for maximum engagement on platform
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Voice authenticity preservation */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Voice Authenticity Preservation</h4>
                      <span className="text-sm font-medium text-primary">High</span>
                    </div>
                    <Progress value={85} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your transformation will maintain your authentic voice while optimizing for {targetPlatform}
                    </p>
                  </div>
                  
                  {/* Preview metrics */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-medium flex items-center">
                      <ZapIcon className="w-4 h-4 mr-1.5 text-amber-500" />
                      Predicted Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Est. Engagement</div>
                        <div className="text-sm font-medium flex items-center">
                          <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
                          +38% vs. original
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">AI Sentiment</div>
                        <div className="text-sm font-medium">Highly Positive</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Growth Impact</div>
                        <div className="text-sm font-medium flex items-center">
                          <CheckIcon className="w-3 h-3 text-primary mr-1" />
                          Intellectual +12 pts
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Transformation</div>
                        <div className="text-sm font-medium">~5 min processing</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  <Button className="w-full" size="lg">
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Transform for {targetPlatform.charAt(0).toUpperCase() + targetPlatform.slice(1)}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Existing transformations */}
          {selectedContent && selectedContent.transformationHistory && selectedContent.transformationHistory.length > 0 && (
            <div className="space-y-4 pt-4 mt-2">
              <h3 className="text-lg font-medium">Previous Transformations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedContent.transformationHistory.map((transformation) => (
                  <Card key={transformation.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{transformation.platform ? transformation.platform.charAt(0).toUpperCase() + transformation.platform.slice(1) : 'Platform'}</CardTitle>
                        <Badge className={`bg-gradient-to-r ${getPlatformColor(transformation.platform || '')} text-white flex items-center gap-1.5`}>
                          {getPlatformIcon(transformation.platform || '')}
                        </Badge>
                      </div>
                      <CardDescription>{transformation.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 space-y-3">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Transformed</div>
                          <div className="font-medium">{formatDate(transformation.timestamp)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Performance</div>
                          <div className="font-medium flex items-center">
                            <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
                            +{transformation.performanceChange}%
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI Contribution</div>
                        <div className="flex items-center gap-2">
                          <Progress value={transformation.aiContribution} className="h-1.5 flex-grow" />
                          <span className="text-xs font-medium">{transformation.aiContribution}%</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button variant="outline" className="w-full" size="sm">
                        <EyeIcon className="w-4 h-4 mr-1.5" />
                        View Transformation
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ContentTransformationHub;