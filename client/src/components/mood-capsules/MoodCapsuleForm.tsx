import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MoodCapsule } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';

interface MoodCapsuleFormProps {
  capsule?: MoodCapsule;
  onSuccess: () => void;
  onCancel: () => void;
}

// Validation schema
const moodCapsuleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  emotionalTone: z.string().min(1, 'Emotional tone is required'),
  captionTone: z.string().optional(),
  contentIds: z.array(z.number()).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

// Form data type
type MoodCapsuleFormData = z.infer<typeof moodCapsuleSchema>;

const MoodCapsuleForm: React.FC<MoodCapsuleFormProps> = ({
  capsule,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const isEditMode = !!capsule;
  
  // Fetch content for content selection
  const { data: contentItems = [] } = useQuery({
    queryKey: ['/api/content'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Initialize form with existing data or defaults
  const form = useForm<MoodCapsuleFormData>({
    resolver: zodResolver(moodCapsuleSchema),
    defaultValues: {
      name: capsule?.name || '',
      description: capsule?.description || '',
      emotionalTone: capsule?.emotionalTone || '',
      captionTone: capsule?.captionTone || 'balanced',
      contentIds: capsule?.contentIds || [],
      thumbnailUrl: capsule?.thumbnailUrl || '',
    },
  });
  
  const { formState } = form;
  const { isSubmitting, isDirty } = formState;
  
  // Available emotional tones
  const emotionalTones = [
    { label: 'Joyful', value: 'joyful' },
    { label: 'Nostalgic', value: 'nostalgic' },
    { label: 'Energetic', value: 'energetic' },
    { label: 'Peaceful', value: 'peaceful' },
    { label: 'Romantic', value: 'romantic' },
    { label: 'Melancholic', value: 'melancholic' },
    { label: 'Powerful', value: 'powerful' },
    { label: 'Mysterious', value: 'mysterious' },
  ];
  
  // Available caption tones
  const captionTones = [
    { label: 'Balanced', value: 'balanced' },
    { label: 'Poetic', value: 'poetic' },
    { label: 'Concise', value: 'concise' },
    { label: 'Conversational', value: 'conversational' },
    { label: 'Professional', value: 'professional' },
    { label: 'Humorous', value: 'humorous' },
    { label: 'Inspirational', value: 'inspirational' },
  ];
  
  // Submit form
  const onSubmit = async (data: MoodCapsuleFormData) => {
    try {
      if (isEditMode) {
        // Update existing capsule
        await apiRequest({
          url: `/api/mood-capsules/${capsule.id}`,
          method: 'PUT',
          data,
        });
        
        toast({
          title: 'Mood Capsule Updated',
          description: `"${data.name}" has been successfully updated`,
        });
      } else {
        // Create new capsule
        await apiRequest({
          url: '/api/mood-capsules',
          method: 'POST',
          data,
        });
        
        toast({
          title: 'Mood Capsule Created',
          description: `"${data.name}" has been successfully created`,
        });
      }
      
      // Invalidate cache and call success callback
      queryClient.invalidateQueries({ queryKey: ['/api/mood-capsules'] });
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} mood capsule. Please try again.`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle cancel with confirmation if form is dirty
  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  };
  
  // Generate AI caption based on selected content
  const generateCaption = async () => {
    const contentIds = form.getValues('contentIds');
    const emotionalTone = form.getValues('emotionalTone');
    const captionTone = form.getValues('captionTone');
    
    if (!contentIds || contentIds.length === 0) {
      toast({
        title: 'No Content Selected',
        description: 'Please select at least one content item to generate a caption',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeneratingCaption(true);
    
    try {
      const response = await apiRequest<{ success: boolean; caption: string }>({
        url: '/api/mood-capsules/generate-caption',
        method: 'POST',
        data: {
          contentIds,
          emotionalTone,
          captionTone,
        },
      });
      
      if (response && response.success && response.caption) {
        form.setValue('description', response.caption);
        
        toast({
          title: 'Caption Generated',
          description: 'AI has generated a caption based on your content and mood',
        });
      } else {
        throw new Error('Failed to generate caption');
      }
    } catch (error) {
      toast({
        title: 'Caption Generation Failed',
        description: 'Could not generate caption. Please try again or write your own.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit' : 'Create'} Mood Capsule</CardTitle>
          <CardDescription>
            Group content by emotional tone to create cohesive mood stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Summer Memories" />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this mood capsule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Emotional Tone */}
              <FormField
                control={form.control}
                name="emotionalTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotional Tone</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the primary emotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emotionalTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The dominant emotional tone of this content group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Caption Tone */}
              <FormField
                control={form.control}
                name="captionTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption Tone</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select caption writing style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {captionTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The writing style for AI-generated captions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description / Caption */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCaption}
                        disabled={isGeneratingCaption}
                      >
                        {isGeneratingCaption ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <>✨ Generate with AI</>
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter a description or use AI to generate one"
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe this mood capsule or let AI generate a caption based on content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Content Selection */}
              <FormField
                control={form.control}
                name="contentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Content</FormLabel>
                    <FormControl>
                      <div>
                        {/* This would need a proper multi-select component implementation */}
                        <div className="border rounded-md p-2 bg-muted/20">
                          <p className="text-sm text-muted-foreground mb-2">Selected {field.value?.length || 0} items</p>
                          {/* Example implementation - actual component needed */}
                          <p className="text-xs text-muted-foreground italic">
                            Note: Multi-select component will be integrated here
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose content items to include in this mood capsule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Thumbnail URL */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormDescription>
                      URL for capsule thumbnail image (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Form buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEditMode ? 'Updating...' : 'Creating...'}</>
                  ) : (
                    isEditMode ? 'Update Capsule' : 'Create Capsule'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to cancel?
              All your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MoodCapsuleForm;