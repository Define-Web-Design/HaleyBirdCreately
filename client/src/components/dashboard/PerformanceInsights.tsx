import { AnalyticsData, TopPerformingContent } from '@/lib/types';

interface PerformanceInsightsProps {
  analyticsData?: AnalyticsData;
  isLoading?: boolean;
}

const PerformanceInsights = ({ analyticsData, isLoading }: PerformanceInsightsProps) => {
  // Loading state
  if (isLoading) {
    return (
      <section className="mb-8 animate-slide-up opacity-75" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-['SF_Pro_Display'] font-semibold mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Default values if no data is provided
  const engagementRate = analyticsData?.engagementRate || 12;
  const currentEngagement = 3600;
  const previousEngagement = Math.round(currentEngagement / (1 + engagementRate / 100));
  const growthRate = analyticsData?.growthRate || 14.2;
  const topPerforming = analyticsData?.topPerforming || [
    {
      id: 1,
      title: 'Summer collection preview',
      thumbnail: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      likes: 1200,
      comments: 328,
      growth: 28
    },
    {
      id: 2,
      title: 'Studio workspace tour',
      thumbnail: 'https://images.unsplash.com/photo-1550430261-b8d4513a163e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      likes: 945,
      comments: 129,
      growth: 16
    }
  ];

  return (
    <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-xl font-['SF_Pro_Display'] font-semibold mb-4">Performance Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Engagement Overview Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Engagement Overview</h3>
            <span className="text-accent text-sm font-medium">
              <i className="fas fa-arrow-up mr-1"></i> {engagementRate}%
            </span>
          </div>
          
          <div className="flex items-end">
            <div className="h-32 w-full overflow-hidden">
              {/* Chart visualization */}
              <div className="h-full w-full bg-gradient-to-t from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 relative">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 border-t border-primary/30 flex items-end">
                  <div className="w-1/6 h-[20%] bg-primary/40 mx-[2px] rounded-t"></div>
                  <div className="w-1/6 h-[35%] bg-primary/40 mx-[2px] rounded-t"></div>
                  <div className="w-1/6 h-[45%] bg-primary/40 mx-[2px] rounded-t"></div>
                  <div className="w-1/6 h-[38%] bg-primary/40 mx-[2px] rounded-t"></div>
                  <div className="w-1/6 h-[60%] bg-primary/40 mx-[2px] rounded-t"></div>
                  <div className="w-1/6 h-[75%] bg-primary/60 mx-[2px] rounded-t"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Previous: {previousEngagement.toLocaleString()}</span>
            <span className="font-medium">Current: {currentEngagement.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Growth Prediction Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Growth Prediction</h3>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <i className="fas fa-info-circle"></i>
            </button>
          </div>
          
          <div className="flex flex-col h-32 justify-center">
            <div className="relative h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-full mb-2 overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: '67%' }}
              >
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Current</span>
              <span className="text-gray-500 dark:text-gray-400">Prediction</span>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center">
                <span className="text-2xl font-semibold">+{growthRate}%</span>
                <span className="ml-2 text-accent text-sm">
                  <i className="fas fa-chart-line mr-1"></i> Next 30 days
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Based on your recent content performance
              </p>
            </div>
          </div>
        </div>
        
        {/* Top Performing Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Top Performing</h3>
            <button className="text-sm text-primary">View All</button>
          </div>
          
          <div className="space-y-3">
            {topPerforming.map((content) => (
              <div key={content.id} className="flex items-center">
                <div className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src={content.thumbnail} 
                    alt={`${content.title} thumbnail`} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{content.title}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="mr-3">
                      <i className="fas fa-heart mr-1"></i> {content.likes.toLocaleString()}
                    </span>
                    <span>
                      <i className="fas fa-comment mr-1"></i> {content.comments}
                    </span>
                  </div>
                </div>
                <span className="text-accent text-sm font-medium ml-2">
                  <i className="fas fa-arrow-up"></i> {content.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceInsights;
