import { useState } from 'react';
import { Link } from 'wouter';
import ContentCard from '@/components/ui/content-card';
import { ContentItem } from '@/lib/types';
import { TIME_PERIODS } from '@/lib/constants';

interface ContentLibraryProps {
  contentItems?: ContentItem[];
  isLoading?: boolean;
  onEdit?: (id: number) => void;
  onShare?: (id: number) => void;
  onEnhance?: (id: number) => void;
}

const ContentLibrary = ({ 
  contentItems = [], 
  isLoading, 
  onEdit, 
  onShare, 
  onEnhance 
}: ContentLibraryProps) => {
  const [platform, setPlatform] = useState("All Platforms");
  const [period, setPeriod] = useState(TIME_PERIODS[0].value);
  
  // Loading state
  if (isLoading) {
    return (
      <section className="mb-8 animate-slide-up opacity-80" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-['SF_Pro_Display'] font-semibold text-gray-900 dark:text-white">Recent Content</h2>
            <div className="ml-3 h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm h-96 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Sample content if none provided
  const defaultContent: ContentItem[] = [
    {
      id: 1,
      userId: 1,
      title: "Morning Coffee Routine",
      description: "The perfect start to a productive day begins with mindfulness and a great cup of coffee.",
      imageUrl: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      status: "Posted",
      platform: "Instagram",
      engagement: 842,
      aiSentiment: 78,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      title: "Creative Workspace Setup",
      description: "How I organize my desk for maximum productivity and creative inspiration.",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      status: "Scheduled",
      platform: "TikTok",
      aiPrediction: 92,
      createdAt: new Date().toISOString(),
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      userId: 1,
      title: "Spring Fashion Essentials",
      description: "My go-to spring wardrobe pieces that are both stylish and sustainable.",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      status: "Draft",
      platform: "Instagram",
      aiSentiment: 65,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      userId: 1,
      title: "Healthy Breakfast Ideas",
      description: "Five quick and nutritious breakfast recipes that take less than 10 minutes to prepare.",
      imageUrl: "https://images.unsplash.com/photo-1482482097755-0b595893ba63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      status: "Posted",
      platform: "Pinterest",
      engagement: 1300,
      aiSentiment: 95,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayContent = contentItems.length > 0 ? contentItems : defaultContent;

  return (
    <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <h2 className="text-xl font-['SF_Pro_Display'] font-semibold text-gray-900 dark:text-white">Recent Content</h2>
          <Link href="/library" className="ml-3 text-sm text-primary hover:text-primary/80 transition-colors flex items-center">
            View All <i className="fas fa-chevron-right ml-1.5 text-xs"></i>
          </Link>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="relative">
            <label htmlFor="platform-select" className="sr-only">Select platform</label>
            <select
              id="platform-select"
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
                rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 
                focus:ring-primary transition-colors shadow-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>All Platforms</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Pinterest</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="time-period-select" className="sr-only">Select time period</label>
            <select
              id="time-period-select"
              className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
                rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 
                focus:ring-primary transition-colors shadow-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {TIME_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
        {displayContent.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            onEdit={onEdit}
            onShare={onShare}
            onEnhance={onEnhance}
          />
        ))}
      </div>
    </section>
  );
};

export default ContentLibrary;
