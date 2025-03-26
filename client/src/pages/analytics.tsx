import { useQuery } from '@tanstack/react-query';
import PerformanceInsights from '@/components/dashboard/PerformanceInsights';
import { AnalyticsData } from '@/lib/types';

const AnalyticsPage = () => {
  // Query for analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData | null>({
    queryKey: ['/api/analytics'],
    enabled: false, // Disabled for now
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-['SF_Pro_Display'] font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">View your performance metrics and content insights</p>
      </div>
      
      <PerformanceInsights 
        analyticsData={analytics || undefined} 
        isLoading={isLoading} 
      />
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This section would contain more detailed analytics visualizations and reports.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
