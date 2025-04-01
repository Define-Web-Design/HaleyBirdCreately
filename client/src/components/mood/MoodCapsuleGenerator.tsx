import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Check, Loader2, Images, MoveLeft, MoveRight, Calendar, Archive } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SwipeableContainer } from '@/components/ui/swipeable-container';
import { useSwipe } from '@/lib/useGestures';

interface MoodCapsule {
  id: number;
  userId: number;
  name: string;
  description?: string;
  emotionalTone: string;
  captionTone: string;
  aiGeneratedCaption?: string;
  contentIds: number[];
  thumbnailUrl?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Content {
  id: number;
  userId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  status: string;
  platform?: string;
  tags?: string[];
  createdAt: string;
}

interface ContentSentiment {
  id: number;
  contentId: number;
  userId: number;
  dominantEmotion?: string;
  emotionIntensity?: number;
  emotionBreakdown?: Record<string, number>;
  keywords?: string[];
  analyzedAt: string;
}

// Common emotion tones for selection
const emotionTones = [
  { value: 'joy', label: 'Joyful' },
  { value: 'nostalgia', label: 'Nostalgic' },
  { value: 'excitement', label: 'Excited' },
  { value: 'calm', label: 'Calm' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'melancholy', label: 'Melancholic' },
  { value: 'energetic', label: 'Energetic' },
];

// Caption tone options
const captionTones = [
  { value: 'poetic', label: 'Poetic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'concise', label: 'Concise' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'balanced', label: 'Balanced' },
];

const MoodCapsuleGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('capsules');
  const [selectedContent, setSelectedContent] = useState<number[]>([]);
  const [capsuleName, setCapsuleName] = useState<string>('');
  const [capsuleDescription, setCapsuleDescription] = useState<string>('');
  const [emotionalTone, setEmotionalTone] = useState<string>('joy');
  const [captionTone, setCaptionTone] = useState<string>('balanced');
  const [captionOnly, setCaptionOnly] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // Swipe navigation
  const { swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
      if (activeTab === 'capsules') setActiveTab('create');
      else if (activeTab === 'create') setActiveTab('content');
    },
    onSwipeRight: () => {
      if (activeTab === 'content') setActiveTab('create');
      else if (activeTab === 'create') setActiveTab('capsules');
    }
  });

  // Get existing mood capsules
  const capsuleQuery = useQuery({
    queryKey: ['/api/mood-capsules', showArchived],
    queryFn: () => apiRequest('/api/mood-capsules'),
  });

  // Get user content for selection
  const contentQuery = useQuery({
    queryKey: ['/api/content'],
    queryFn: () => apiRequest('/api/content'),
    enabled: activeTab === 'content' || activeTab === 'create',
  });

  // Mutation for creating a mood capsule
  const createCapsuleMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      emotionalTone: string;
      captionTone: string;
      contentIds: number[];
    }) => apiRequest('/api/mood-capsules', { method: 'POST', data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-capsules'] });
      toast({
        title: 'Mood Capsule Created',
        description: 'Your mood capsule has been created successfully.',
      });
      // Reset form
      setCapsuleName('');
      setCapsuleDescription('');
      setSelectedContent([]);
      setActiveTab('capsules');
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create mood capsule. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation for generating AI caption
  const generateCaptionMutation = useMutation({
    mutationFn: (data: {
      contentIds: number[];
      emotionalTone: string;
      captionTone: string;
    }) => apiRequest('/api/mood-capsules/generate-caption', { method: 'POST', data }),
    onSuccess: (data) => {
      if (data.caption) {
        toast({
          title: 'Caption Generated',
          description: 'AI caption has been generated successfully.',
        });
        // If we're in caption-only mode, update the field
        if (captionOnly) {
          setCapsuleDescription(data.caption);
        }
      }
    },
    onError: (error) => {
      toast({
        title: 'Caption Generation Failed',
        description: 'Failed to generate AI caption. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation for archiving a capsule
  const archiveCapsuleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/mood-capsules/${id}/archive`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-capsules'] });
      toast({
        title: 'Capsule Archived',
        description: 'The mood capsule has been archived.',
      });
    },
  });

  // Form validation
  const isFormValid = (): boolean => {
    if (!capsuleName.trim()) return false;
    
    // If not in caption-only mode, we need content
    if (!captionOnly && selectedContent.length === 0) return false;
    
    return true;
  };

  // Handle content selection
  const toggleContentSelection = (contentId: number) => {
    if (selectedContent.includes(contentId)) {
      setSelectedContent(selectedContent.filter(id => id !== contentId));
    } else {
      setSelectedContent([...selectedContent, contentId]);
    }
  };

  // Handle capsule creation
  const handleCreateCapsule = () => {
    if (!isFormValid()) {
      toast({
        title: 'Incomplete Form',
        description: captionOnly
          ? 'Please provide a name for your mood capsule.'
          : 'Please provide a name and select at least one content item.',
        variant: 'destructive',
      });
      return;
    }

    createCapsuleMutation.mutate({
      name: capsuleName,
      description: capsuleDescription,
      emotionalTone,
      captionTone,
      contentIds: selectedContent,
    });
  };

  // Generate caption only
  const handleGenerateCaption = () => {
    if (selectedContent.length === 0) {
      toast({
        title: 'No Content Selected',
        description: 'Please select at least one content item to generate a caption.',
        variant: 'destructive',
      });
      return;
    }

    generateCaptionMutation.mutate({
      contentIds: selectedContent,
      emotionalTone,
      captionTone,
    });
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle archived status filter
  const toggleArchivedStatus = () => {
    setShowArchived(!showArchived);
  };

  return (
    <div className="space-y-6 p-1 md:p-4" {...swipeHandlers}>
      <Card>
        <CardHeader>
          <CardTitle>AI-Driven Mood Capsules</CardTitle>
          <CardDescription>
            Group your content based on emotional tones and generate AI captions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="capsules">Your Capsules</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="content">Select Content</TabsTrigger>
            </TabsList>

            {/* View Existing Capsules */}
            <TabsContent value="capsules" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Your Mood Capsules</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-archived" className="text-sm">Show Archived</Label>
                  <Switch
                    id="show-archived"
                    checked={showArchived}
                    onCheckedChange={toggleArchivedStatus}
                  />
                </div>
              </div>

              {capsuleQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your mood capsules...</span>
                </div>
              ) : capsuleQuery.isError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load mood capsules. Please try again.
                </div>
              ) : capsuleQuery.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Images className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>You haven't created any mood capsules yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    Create Your First Capsule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filter capsules based on archived status */}
                  {capsuleQuery.data
                    .filter((capsule: MoodCapsule) => showArchived || !capsule.isArchived)
                    .map((capsule: MoodCapsule) => (
                      <SwipeableContainer
                        key={capsule.id}
                        className="border rounded-lg hover:shadow-md transition-shadow overflow-hidden"
                        onSwipeLeft={() => archiveCapsuleMutation.mutate(capsule.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{capsule.name}</h4>
                            <Badge variant={capsule.isArchived ? "outline" : "secondary"}>
                              {capsule.emotionalTone}
                            </Badge>
                          </div>
                          
                          {capsule.thumbnailUrl && (
                            <div 
                              className="w-full h-32 bg-cover bg-center rounded-md mb-3"
                              style={{ backgroundImage: `url(${capsule.thumbnailUrl})` }}
                            />
                          )}
                          
                          {capsule.aiGeneratedCaption && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                              {capsule.aiGeneratedCaption}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(capsule.createdAt)}
                            </div>
                            <div>
                              {capsule.contentIds.length} item{capsule.contentIds.length !== 1 ? 's' : ''}
                            </div>
                            {capsule.isArchived && (
                              <div className="flex items-center">
                                <Archive className="h-3 w-3 mr-1" />
                                Archived
                              </div>
                            )}
                          </div>
                        </div>
                      </SwipeableContainer>
                    ))}
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Swipe left on a capsule to archive it
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Create New Capsule */}
            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capsule-name">Capsule Name</Label>
                  <Input
                    id="capsule-name"
                    value={capsuleName}
                    onChange={(e) => setCapsuleName(e.target.value)}
                    placeholder="My Mood Capsule"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="caption-toggle">Caption Only</Label>
                    <Switch
                      id="caption-toggle"
                      checked={captionOnly}
                      onCheckedChange={setCaptionOnly}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toggle to create a capsule with only a caption, without selecting content.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emotional-tone">Emotional Tone</Label>
                    <Select value={emotionalTone} onValueChange={setEmotionalTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emotional tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotionTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption-tone">Caption Tone</Label>
                    <Select value={captionTone} onValueChange={setCaptionTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select caption tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {captionTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="capsule-description">Description / Caption</Label>
                    {!captionOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateCaption}
                        disabled={generateCaptionMutation.isPending || selectedContent.length === 0}
                      >
                        {generateCaptionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Generate AI Caption'
                        )}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="capsule-description"
                    value={capsuleDescription}
                    onChange={(e) => setCapsuleDescription(e.target.value)}
                    placeholder="Describe this mood capsule or let our AI generate a caption"
                    rows={4}
                  />
                </div>

                {!captionOnly && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Selected Content ({selectedContent.length})</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('content')}
                      >
                        Edit Selection
                      </Button>
                    </div>
                    {selectedContent.length > 0 ? (
                      <ScrollArea className="h-20 w-full border rounded-md p-2">
                        <div className="space-y-1">
                          {selectedContent.map((id) => {
                            const contentItem = contentQuery.data?.find((item: Content) => item.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between text-sm">
                                <span className="truncate">{contentItem?.title || `Item #${id}`}</span>
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center p-4 border rounded-md text-muted-foreground">
                        No content selected. Please select content items.
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleCreateCapsule}
                  disabled={createCapsuleMutation.isPending || !isFormValid()}
                  className="w-full"
                >
                  {createCapsuleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Mood Capsule'
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Select Content */}
            <TabsContent value="content" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Select Content</h3>
                <Badge variant="outline" className="ml-2">
                  {selectedContent.length} selected
                </Badge>
              </div>

              {contentQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your content...</span>
                </div>
              ) : contentQuery.isError ? (
                <div className="text-center py-8 text-red-500">
                  Failed to load content. Please try again.
                </div>
              ) : contentQuery.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any content yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {contentQuery.data.map((contentItem: Content) => (
                    <div 
                      key={contentItem.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedContent.includes(contentItem.id) ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => toggleContentSelection(contentItem.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium truncate">{contentItem.title}</h4>
                          {contentItem.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {contentItem.description}
                            </p>
                          )}
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span>{formatDate(contentItem.createdAt)}</span>
                            {contentItem.platform && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-3" />
                                <span>{contentItem.platform}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {selectedContent.includes(contentItem.id) ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab('create')}>
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back to Form
                </Button>
                <Button 
                  onClick={() => setActiveTab('create')}
                  disabled={selectedContent.length === 0}
                >
                  Continue
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Tip:</span> Group similar emotional content for more coherent capsules.
          </div>
        </CardFooter>
      </Card>

      {/* Mobile navigation hint */}
      <div className="md:hidden flex items-center justify-center text-sm text-muted-foreground">
        <MoveLeft className="h-4 w-4" />
        <span className="mx-2">Swipe to navigate tabs</span>
        <MoveRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default MoodCapsuleGenerator;