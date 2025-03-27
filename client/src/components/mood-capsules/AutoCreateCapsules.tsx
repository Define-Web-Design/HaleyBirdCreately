import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentItem } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';

interface AutoCreateCapsuleProps {
  onSuccess: () => void;
}

// Analytics data structure returned from auto-create endpoint
interface CapsuleAnalytics {
  totalContentItems: number;
  processedItems: number;
  groupsCreated: number;
  emotionDistribution: Record<string, { count: number; intensity: number }>;
}

// Response data structure
interface AutoCreateResponse {
  success: boolean;
  capsules: any[];
  emotionGroups: string[];
  analytics: CapsuleAnalytics;
}

const captionTones = [
  { label: 'Balanced', value: 'balanced' },
  { label: 'Poetic', value: 'poetic' },
  { label: 'Concise', value: 'concise' },
  { label: 'Conversational', value: 'conversational' },
  { label: 'Professional', value: 'professional' },
  { label: 'Humorous', value: 'humorous' },
  { label: 'Inspirational', value: 'inspirational' },
];

const AutoCreateCapsules: React.FC<AutoCreateCapsuleProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form values
  const [selectedContent, setSelectedContent] = useState<{label: string, value: string}[]>([]);
  const [captionTone, setCaptionTone] = useState('balanced');
  const [minGroupSize, setMinGroupSize] = useState(2);
  const [useAllContent, setUseAllContent] = useState(false);
  
  // Fetch content for selection
  const { data: contentItems = [], isLoading: isLoadingContent } = useQuery<ContentItem[]>({
    queryKey: ['/api/content'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Create mutation for auto-creating mood capsules
  const autoCreateMutation = useMutation({
    mutationFn: (data: { contentIds: number[], captionTone: string, minGroupSize: number }) =>
      apiRequest<AutoCreateResponse>({
        url: '/api/mood-capsules/auto-create',
        method: 'POST',
        data
      }),
    onSuccess: (data) => {
      if (data && data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/mood-capsules'] });
        
        // Show success toast with analytics
        toast({
          title: 'Mood Capsules Created Successfully',
          description: `Created ${data.capsules.length} mood capsules from ${data.analytics.processedItems} content items.`,
        });
        
        onSuccess();
      } else {
        throw new Error('Failed to create mood capsules');
      }
    },
    onError: (error) => {
      console.error('Error creating mood capsules:', error);
      toast({
        title: 'Error Creating Mood Capsules',
        description: 'There was a problem creating your mood capsules. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get content IDs to process
    let contentIds: number[];
    
    if (useAllContent) {
      // Use all available content
      contentIds = contentItems.map(item => item.id);
    } else {
      // Use selected content
      contentIds = selectedContent.map(item => parseInt(item.value, 10));
    }
    
    if (contentIds.length === 0) {
      toast({
        title: 'No Content Selected',
        description: 'Please select at least one content item to create mood capsules.',
        variant: 'destructive',
      });
      return;
    }
    
    // Start the auto-creation process
    autoCreateMutation.mutate({
      contentIds,
      captionTone,
      minGroupSize
    });
  };
  
  // Convert content items to options for MultiSelect
  const contentOptions = React.useMemo(() => {
    return contentItems.map(item => ({
      label: item.title || `Content ${item.id}`,
      value: item.id.toString(),
    }));
  }, [contentItems]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Driven Mood Capsules
        </CardTitle>
        <CardDescription>
          Let AI analyze your content and automatically create mood capsules based on emotional tone
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content-select">
              Select Content
            </label>
            
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="use-all-content" 
                checked={useAllContent}
                onCheckedChange={(checked) => {
                  setUseAllContent(checked === true);
                  if (checked) {
                    setSelectedContent([]);
                  }
                }}
              />
              <label
                htmlFor="use-all-content"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use all available content ({contentItems.length} items)
              </label>
            </div>
            
            {!useAllContent && (
              <MultiSelect
                options={contentOptions}
                value={selectedContent}
                onChange={setSelectedContent}
                placeholder="Select content items..."
                disabled={useAllContent || isLoadingContent}
                className="w-full"
              />
            )}
            
            <p className="text-xs text-muted-foreground">
              AI will analyze these content items and group them based on emotional tone
            </p>
          </div>
          
          {/* Caption Tone */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="caption-tone">
              Caption Style
            </label>
            <Select
              value={captionTone}
              onValueChange={setCaptionTone}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select caption style" />
              </SelectTrigger>
              <SelectContent>
                {captionTones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The writing style for AI-generated captions
            </p>
          </div>
          
          {/* Min Group Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="min-group-size">
              Minimum Group Size
            </label>
            <Select
              value={minGroupSize.toString()}
              onValueChange={(value) => setMinGroupSize(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum group size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 item (no grouping)</SelectItem>
                <SelectItem value="2">2 items</SelectItem>
                <SelectItem value="3">3 items</SelectItem>
                <SelectItem value="4">4 items</SelectItem>
                <SelectItem value="5">5 items</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Minimum number of content items required to create a mood capsule group
            </p>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={autoCreateMutation.isPending || (selectedContent.length === 0 && !useAllContent)}
        >
          {autoCreateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Mood Capsules with AI
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutoCreateCapsules;