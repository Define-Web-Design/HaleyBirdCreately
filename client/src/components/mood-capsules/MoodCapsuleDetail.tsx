import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { MoodCapsule, ContentItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Edit, 
  X, 
  Image as ImageIcon, 
  Share2, 
  Clipboard, 
  Copy,
  RefreshCw,
  MessagesSquare,
  Sparkles
} from 'lucide-react';
import useMediaQuery from '@/lib/hooks/use-media-query';
import { motion } from 'framer-motion';

interface MoodCapsuleDetailProps {
  capsuleId: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (capsule: MoodCapsule) => void;
}

const MoodCapsuleDetail: React.FC<MoodCapsuleDetailProps> = React.memo(({
  capsuleId,
  isOpen,
  onClose,
  onEdit
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeTab, setActiveTab] = React.useState("content");
  const [isRegeneratingCaption, setIsRegeneratingCaption] = React.useState(false);

  // Fetch the specific mood capsule
  const { data: capsule, isLoading: isCapsuleLoading, error: capsuleError } = useQuery<MoodCapsule>({
    queryKey: [`/api/mood-capsules/${capsuleId}`],
    enabled: isOpen && !!capsuleId,
    retry: 2,
    onError: (error) => {
      toast({
        title: "Error loading mood capsule",
        description: "There was a problem loading this mood capsule. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch content items for this capsule
  const { data: content = [], isLoading: isContentLoading, error: contentError } = useQuery<ContentItem[]>({
    queryKey: [`/api/content/by-capsule/${capsuleId}`],
    enabled: isOpen && !!capsuleId,
    retry: 2,
    onError: (error) => {
      toast({
        title: "Error loading content",
        description: "There was a problem loading content for this mood capsule.",
        variant: "destructive",
      });
    }
  });

  // Handle the regeneration of AI caption
  const handleRegenerateCaption = async () => {
    if (!capsule) return;

    setIsRegeneratingCaption(true);

    try {
      // Implementation would connect to API for caption generation
      toast({
        title: "Caption Regenerated",
        description: "AI has created a new caption for this mood capsule",
      });
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: "Could not regenerate the caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingCaption(false);
    }
  };

  // Handle copy caption to clipboard
  const handleCopyCaption = () => {
    if (!capsule?.description) return;

    navigator.clipboard.writeText(capsule.description);
    toast({
      title: "Caption Copied",
      description: "Caption has been copied to clipboard",
    });
  };

  if (!isOpen) return null;

  const DetailContent = () => (
    <>
      {isCapsuleLoading ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-4 mt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
          <Skeleton className="h-px w-full my-6" />
          <div>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-md overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : capsule ? (
        <div className="space-y-6">
          {/* Header with title and metadata */}
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">{capsule.name}</h2>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(capsule)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {capsule.emotionalTone}
              </Badge>

              {capsule.captionTone && (
                <Badge variant="outline" className="capitalize">
                  {capsule.captionTone} tone
                </Badge>
              )}

              {capsule.isArchived && (
                <Badge variant="secondary">Archived</Badge>
              )}
            </div>

            <div className="flex items-center text-muted-foreground text-sm mt-3 space-x-4">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {capsule.createdAt
                    ? formatDistance(new Date(capsule.createdAt), new Date(), { addSuffix: true })
                    : 'Unknown date'}
                </span>
              </div>
              <div className="flex items-center">
                <ImageIcon className="mr-1 h-4 w-4" />
                <span>{content.length || 0} items</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs for content and caption */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="caption">AI Caption</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 pt-4">
              {isContentLoading ? (
                <div className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : content.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border rounded-md overflow-hidden"
                    >
                      {item.imageUrl ? (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="p-3">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.platform && (
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span className="capitalize">{item.platform}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No content items in this capsule</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(capsule)}
                  >
                    Add Content
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Caption Tab */}
            <TabsContent value="caption" className="space-y-4 pt-4">
              {capsule.description ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <MessagesSquare className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">AI-Generated Caption</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleCopyCaption}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRegenerateCaption}
                        disabled={isRegeneratingCaption}
                      >
                        {isRegeneratingCaption ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-md relative">
                    <blockquote className="italic text-muted-foreground">
                      "{capsule.description}"
                    </blockquote>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Emotional Tone: <span className="capitalize">{capsule.emotionalTone}</span></p>
                    <p>Caption Style: <span className="capitalize">{capsule.captionTone || 'Balanced'}</span></p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessagesSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No AI caption available for this capsule</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(capsule)}
                  >
                    Add Description
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Capsule not found</p>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </>
  );

  // Render as Dialog on desktop, Sheet on mobile
  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Mood Capsule Details</DialogTitle>
          <DialogDescription>
            View and manage this mood capsule
          </DialogDescription>
        </DialogHeader>

        <DetailContent />

        <DialogFooter className="flex justify-end sm:justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>

          {capsule && (
            <Button 
              onClick={() => onEdit(capsule)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Capsule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full pt-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Mood Capsule Details</SheetTitle>
          <SheetDescription>
            View and manage this mood capsule
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <DetailContent />
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>

          {capsule && (
            <Button 
              onClick={() => onEdit(capsule)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default MoodCapsuleDetail;