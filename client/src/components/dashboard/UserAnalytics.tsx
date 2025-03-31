
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for fallback when API fails
const MOCK_ANALYTICS_DATA = {
  engagementTrends: [
    { date: 'Jan', creativePoints: 40, interactions: 24 },
    { date: 'Feb', creativePoints: 30, interactions: 13 },
    { date: 'Mar', creativePoints: 20, interactions: 98 },
    { date: 'Apr', creativePoints: 27, interactions: 39 },
    { date: 'May', creativePoints: 18, interactions: 48 },
    { date: 'Jun', creativePoints: 23, interactions: 38 },
    { date: 'Jul', creativePoints: 34, interactions: 43 },
  ],
  topContent: [
    { id: 1, title: 'Summer Collection', viewCount: 210 },
    { id: 2, title: 'Creative Moments', viewCount: 184 },
    { id: 3, title: 'Product Photos', viewCount: 152 }
  ]
};

export default function UserAnalytics() {
  const [useLocalData, setUseLocalData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    data: analyticsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/analytics', retryCount],
    enabled: !useLocalData,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // If there's an error after retries, use local data
    if (isError && !useLocalData) {
      setUseLocalData(true);
      console.error('Analytics API error, using local data:', error);
    }
  }, [isError, useLocalData, error]);

  const handleRetry = () => {
    setUseLocalData(false);
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const displayData = useLocalData ? MOCK_ANALYTICS_DATA : analyticsData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Creative Journey Analytics</CardTitle>
            <CardDescription>
              {useLocalData ? 'Showing demo data (API unavailable)' : 'Your creative activity metrics'}
            </CardDescription>
          </div>
          {useLocalData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <>
            {isError && !useLocalData && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load analytics data. Please try again later.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData?.engagementTrends || []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="creativePoints" name="Creative Points" fill="#8884d8" />
                  <Bar dataKey="interactions" name="Interactions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {displayData?.topContent && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Top Performing Content</h3>
                <div className="space-y-2">
                  {displayData.topContent.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>{index + 1}. {item.title}</span>
                      <span className="text-sm text-muted-foreground">{item.viewCount} views</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
