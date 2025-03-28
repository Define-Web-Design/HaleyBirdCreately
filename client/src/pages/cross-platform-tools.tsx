import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Share2, ArrowUpRight, Copy, Check, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PLATFORMS } from '@/lib/constants';

// Mock content item for example content
interface ContentItem {
  id: number;
  title: string;
  description: string;
  image: string;
  platformVersions: Record<string, PlatformContent>;
}

interface PlatformContent {
  caption: string;
  hashtags: string[];
  dimensions: string;
  schedule: string | null;
  status: 'draft' | 'scheduled' | 'posted';
}

// Mock content item
const mockContentItem: ContentItem = {
  id: 1,
  title: "Summer Collection Launch",
  description: "Promotional material for our upcoming summer fashion line",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  platformVersions: {
    "Instagram": {
      caption: "Introducing our Summer 2025 Collection! 🌞 Fresh styles for the warmer days ahead. Sustainably made, endlessly stylish. Available now at our website and select retailers.",
      hashtags: ["SummerStyle", "SustainableFashion", "NewCollection", "Fashion2025"],
      dimensions: "1:1 (Square)",
      schedule: "June 1, 2025 - 10:00 AM",
      status: 'scheduled'
    },
    "LinkedIn": {
      caption: "We're excited to announce the launch of our Summer 2025 Collection, featuring sustainable materials and ethical manufacturing processes. This release represents our ongoing commitment to reducing environmental impact while delivering premium fashion products.",
      hashtags: ["SustainableBusiness", "FashionIndustry", "EthicalFashion"],
      dimensions: "1200x627px (Landscape)",
      schedule: "June 1, 2025 - 2:00 PM",
      status: 'draft'
    },
    "Facebook": {
      caption: "Summer is coming! 🌞 Check out our new collection that's perfect for the season – comfortable, stylish, and sustainably made. What's your favorite summer style?",
      hashtags: ["SummerFashion", "NewArrivals"],
      dimensions: "1200x630px (Landscape)",
      schedule: "June 1, 2025 - 12:00 PM",
      status: 'draft'
    },
    "X": {
      caption: "Our Summer 2025 Collection drops today! Sustainable fashion that doesn't compromise on style. Shop now:",
      hashtags: ["SustainableFashion", "SummerStyle"],
      dimensions: "1200x675px (Landscape)",
      schedule: null,
      status: 'draft'
    }
  }
};

const CrossPlatformTools = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Instagram");
  const [isAdapting, setIsAdapting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [platformContent, setPlatformContent] = useState<Record<string, PlatformContent>>(mockContentItem.platformVersions);
  const [editedCaption, setEditedCaption] = useState("");
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [showCopied, setShowCopied] = useState(false);
  
  // Initialize editing when changing tabs
  React.useEffect(() => {
    if (platformContent[activeTab]) {
      setEditedCaption(platformContent[activeTab].caption);
      setEditedHashtags(platformContent[activeTab].hashtags);
    }
  }, [activeTab, platformContent]);
  
  // Handle adapting content for all platforms
  const handleAdaptContent = () => {
    setIsAdapting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would call an AI service to adapt content
      setIsAdapting(false);
      toast({
        title: "Content Adapted",
        description: "Your content has been optimized for all platforms",
      });
    }, 2000);
  };
  
  // Handle publishing to platform
  const handlePublish = (platform: string) => {
    setIsPublishing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsPublishing(false);
      
      // Update status
      setPlatformContent(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'scheduled' as 'scheduled'
        }
      }));
      
      toast({
        title: "Scheduled for Publishing",
        description: `Your content will be published to ${platform} at the scheduled time`,
      });
    }, 1500);
  };
  
  // Handle saving edits
  const handleSaveEdits = () => {
    setPlatformContent(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        caption: editedCaption,
        hashtags: editedHashtags
      }
    }));
    
    toast({
      title: "Edits Saved",
      description: `Your changes to the ${activeTab} version have been saved`,
    });
  };
  
  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    const textToCopy = `${editedCaption}\n\n${editedHashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setShowCopied(true);
    
    setTimeout(() => setShowCopied(false), 2000);
    
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard",
    });
  };
  
  // Get status badge color
  const getStatusBadge = (status: 'draft' | 'scheduled' | 'posted') => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Draft
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Scheduled
          </Badge>
        );
      case 'posted':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Posted
          </Badge>
        );
    }
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <PageHeader
        heading="Cross-Platform Tools"
        description="Optimize and manage your content across multiple platforms"
        rightSection={
          <Button 
            onClick={handleAdaptContent}
            disabled={isAdapting}
            className="flex items-center gap-2"
          >
            {isAdapting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {isAdapting ? "Adapting..." : "Adapt for All Platforms"}
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left column - Content preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{mockContentItem.title}</CardTitle>
            <CardDescription>{mockContentItem.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-md">
              <img 
                src={mockContentItem.image} 
                alt={mockContentItem.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Platform Versions</h3>
              <div className="space-y-2">
                {Object.entries(platformContent).map(([platform, content]) => (
                  <div key={platform} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      {PLATFORMS.find(p => p.name === platform) && (
                        <i className={`${PLATFORMS.find(p => p.name === platform)?.icon} text-lg mr-2 ${PLATFORMS.find(p => p.name === platform)?.color}`}></i>
                      )}
                      <span>{platform}</span>
                    </div>
                    {getStatusBadge(content.status)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right columns - Platform tabs */}
        <Card className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg">Platform-Specific Content</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 h-8"
                  onClick={handleCopyToClipboard}
                >
                  {showCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {showCopied ? "Copied" : "Copy"}
                </Button>
              </div>
              <TabsList className="w-full justify-start mb-2 overflow-x-auto">
                {Object.keys(platformContent).map(platform => (
                  <TabsTrigger key={platform} value={platform} className="flex items-center gap-1.5">
                    {PLATFORMS.find(p => p.name === platform) && (
                      <i className={`${PLATFORMS.find(p => p.name === platform)?.icon} text-sm ${PLATFORMS.find(p => p.name === platform)?.color}`}></i>
                    )}
                    {platform}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="add-new" className="flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            {Object.keys(platformContent).map(platform => (
              <TabsContent key={platform} value={platform} className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Caption</h3>
                    <Badge variant="outline" className="text-xs">
                      {platformContent[platform].dimensions}
                    </Badge>
                  </div>
                  <Textarea 
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    placeholder="Enter your caption..."
                    className="h-32"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Hashtags</h3>
                  <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[60px]">
                    {editedHashtags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        #{tag}
                        <button 
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                          onClick={() => setEditedHashtags(prev => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Input 
                      placeholder="Add hashtag..."
                      className="border-0 bg-transparent p-0 text-sm h-6 w-32 min-w-[80px] flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          setEditedHashtags(prev => [...prev, e.currentTarget.value.trim()]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Scheduling</h3>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      {platformContent[platform].schedule ? (
                        <p className="text-sm">{platformContent[platform].schedule}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not scheduled</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Schedule
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveEdits}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => handlePublish(platform)}
                    disabled={isPublishing}
                    className="flex items-center gap-2"
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {platformContent[platform].status === 'draft' 
                      ? "Schedule Post" 
                      : platformContent[platform].status === 'scheduled'
                        ? "Update Schedule"
                        : "Repost"}
                  </Button>
                </div>
              </TabsContent>
            ))}
            
            <TabsContent value="add-new" className="p-6">
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Add New Platform</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Connect another social media platform to create optimized content versions
                </p>
                <Button>Connect Platform</Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CrossPlatformTools;