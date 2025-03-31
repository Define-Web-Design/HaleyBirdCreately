import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MoodCapsule, ContentItem } from '@/lib/types';
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
  contentIds: z.array(z.number()).min(1, 'Select at least one content item'),
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
  const { data: contentItems = [], isLoading: isContentLoading, error: contentError } = useQuery({
    queryKey: ['/api/content'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);

  // Show loading indicator when content is loading
  React.useEffect(() => {
    if (isContentLoading) {
      toast({
        title: "Loading Content",
        description: "Fetching available content items...",
      });
    }

    if (contentError) {
      toast({
        title: "Error Loading Content",
        description: "Could not load content items. Please try refreshing.",
        variant: "destructive",
      });
    }
  }, [isContentLoading, contentError, toast]);

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
          data: { ...data, contentIds: selectedContent.map(item => item.id) }, // Updated data submission
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
          data: { ...data, contentIds: selectedContent.map(item => item.id) }, // Updated data submission
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
    const contentIds = selectedContent.map(item => item.id); // Use selectedContent
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
      // Explicitly type the response
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
                    <FormControl>
                      <div className="w-full">
                        <Controller
                          name="emotionalTone"
                          control={form.control}
                          render={({ field: { onChange, value } }) => {
                            // Emotional Tone is a string in the schema, convert to array for MultiSelect
                            // and back to comma-separated string for storage
                            let selectedValues: { label: string, value: string }[] = [];

                            try {
                              // Handle both comma-separated string or direct value formats
                              if (value) {
                                if (value.includes(',')) {
                                  selectedValues = value.split(',')
                                    .filter(v => v !== '')
                                    .map(val => ({
                                      label: emotionalTones.find(tone => tone.value === val)?.label || val,
                                      value: val
                                    }));
                                } else {
                                  // Single value case
                                  const foundTone = emotionalTones.find(tone => tone.value === value);
                                  if (foundTone) {
                                    selectedValues = [{ label: foundTone.label, value: foundTone.value }];
                                  }
                                }
                              }
                            } catch (err) {
                              console.error('Error parsing emotional tones:', err);
                              // Fallback to empty array
                              selectedValues = [];
                            }

                            return (
                              <MultiSelect
                                options={emotionalTones}
                                value={selectedValues}
                                onChange={(selected) => {
                                  // Store as comma-separated string
                                  if (selected.length === 0) {
                                    // If nothing selected, use the first emotional tone as default
                                    onChange(emotionalTones[0].value);
                                  } else {
                                    onChange(selected.map(option => option.value).join(','));
                                  }
                                }}
                                placeholder="Select emotional tones..."
                                className="w-full"
                              />
                            );
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select one or more emotional tones for this content group
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
                      value={field.value || 'balanced'}
                      defaultValue="balanced"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select caption writing style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {captionTones
                          .filter(tone => tone.value !== '')
                          .map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))
                        }
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
                      <div className="space-y-3">
                        <div className="mb-4">
                          <div className="relative">
                            <select
                              id="content-select"
                              multiple
                              className="hidden"
                              value={selectedItems}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedItems(selected);
                                setSelectedContent(contentItems.filter(item => selected.includes(item.id.toString())));
                              }}
                            >
                              {contentItems.map(item => (
                                <option key={item.id} value={item.id.toString()}>
                                  {item.title}
                                </option>
                              ))}
                            </select>

                            <div className="relative">
                              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[80px] bg-white dark:bg-gray-800">
                                {selectedContent.length === 0 ? (
                                  <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                                    Select content items to include
                                  </div>
                                ) : (
                                  selectedContent.map(item => (
                                    <div
                                      key={item.id}
                                      className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1"
                                    >
                                      <span className="truncate max-w-[150px]">{item.title}</span>
                                      <button
                                        type="button"
                                        className="ml-1 text-primary hover:text-primary/80"
                                        onClick={() => {
                                          setSelectedItems(prev => prev.filter(id => id !== item.id.toString()));
                                          setSelectedContent(prev => prev.filter(content => content.id !== item.id));
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
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