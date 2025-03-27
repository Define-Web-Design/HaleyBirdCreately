import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentItem } from '@/lib/types';
import { Edit, Share2, Wand2 } from 'lucide-react';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = parseInt(id);
  
  // Fetch content details
  const { data: content, isLoading, error } = useQuery({
    queryKey: ['/api/content', contentId],
    enabled: !isNaN(contentId)
  });

  // If we don't have actual API yet, use sample content
  const sampleContent: ContentItem = {
    id: contentId,
    userId: 1,
    title: "Morning Coffee Routine",
    description: "The perfect start to a productive day begins with mindfulness and a great cup of coffee. I've been developing this ritual for months, and it's transformed how I approach each day with purpose and clarity.",
    imageUrl: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
    status: "Posted",
    platform: "Instagram",
    engagement: 842,
    aiSentiment: 78,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  };

  const displayContent = content || sampleContent;
  
  if (isLoading) {
    return (
      <div className="container py-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Card className="p-0 overflow-hidden">
          <Skeleton className="w-full h-96" />
          <div className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || isNaN(contentId)) {
    return (
      <div className="container py-6 max-w-5xl mx-auto">
        <PageHeader
          heading="Content Not Found"
          description="We couldn't locate the content you're looking for"
        />
        <Card className="p-6 text-center">
          <p className="mb-4">The content may have been deleted or you may have followed an invalid link.</p>
          <Link href="/content-library"><Button>Return to Content Library</Button></Link>
        </Card>
      </div>
    );
  }

  // Get dates for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const postedDate = displayContent.postedAt 
    ? formatDate(displayContent.postedAt)
    : displayContent.scheduledFor
      ? `Scheduled for ${formatDate(displayContent.scheduledFor)}`
      : `Created on ${formatDate(displayContent.createdAt)}`;

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <PageHeader
        heading={displayContent.title}
        description={`${displayContent.platform} • ${postedDate}`}
        rightSection={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="default" size="sm">
              <Wand2 className="h-4 w-4 mr-2" />
              Enhance
            </Button>
          </div>
        }
      />
      
      <Card className="p-0 overflow-hidden mb-8">
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img 
            src={displayContent.imageUrl || 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'} 
            alt={displayContent.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {displayContent.status}
              </span>
              {displayContent.platform && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {displayContent.platform}
                </span>
              )}
            </div>
            
            {displayContent.engagement && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-3">
                  <i className="fas fa-heart mr-1"></i> {displayContent.engagement}
                </span>
                <span>
                  <i className="fas fa-comment mr-1"></i> {Math.floor(displayContent.engagement / 15)}
                </span>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">{displayContent.title}</h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
            {displayContent.description}
          </p>
          
          {/* AI Analysis Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold mb-2">AI Analysis</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Emotional Sentiment</span>
                <span className="text-sm font-medium">{displayContent.aiSentiment || 78}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                  style={{ width: `${displayContent.aiSentiment || 78}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium mb-1">Top Emotions</h4>
                <ul className="text-sm">
                  <li className="flex justify-between">
                    <span>Inspiration</span>
                    <span>45%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Calmness</span>
                    <span>30%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Satisfaction</span>
                    <span>25%</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">Suggested Tags</h4>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">#mindfulness</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">#morningroutine</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">#productivity</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <i className="far fa-copy mr-2"></i> Copy Text
            </Button>
            <Button variant="outline">
              <i className="fas fa-palette mr-2"></i> Extract Color Palette
            </Button>
            <Button variant="outline">
              <i className="fas fa-hashtag mr-2"></i> Generate More Tags
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Related Content Section could go here */}
    </div>
  );
};

export default ContentDetail;