import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useIsMobile from '@/hooks/use-mobile';
import { apiRequest } from '@/lib/queryClient';

interface PageSpeedResult {
  score: number;
  loadingSpeed: number;
  recommendations: string[];
  timestamp: string;
}

interface PageSpeedIntegrationProps {
  pageUrl?: string;
}

export function PageSpeedIntegration({ pageUrl }: PageSpeedIntegrationProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PageSpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const url = pageUrl || window.location.href;

  const runPageSpeedTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<PageSpeedResult>(`/api/pagespeed?url=${encodeURIComponent(url)}&mobile=${isMobile}`, {
        method: 'GET',
      });

      setResults(response);
    } catch (err) {
      console.error('PageSpeed API error:', err);
      setError('Failed to run PageSpeed test. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>PageSpeed Insights</span>
          <span className="text-sm text-muted-foreground">
            {isMobile ? 'Mobile' : 'Desktop'} Analysis
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <div className="text-sm text-center">Running PageSpeed analysis...</div>
              <Progress value={45} className="h-2" />
            </div>
          )}

          {results && !isLoading && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Performance Score:</span>
                <span className={`text-xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Loading Speed:</span>
                <span className="text-sm">{results.loadingSpeed}s</span>
              </div>

              {results.recommendations && results.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommendations:</h4>
                  <ul className="text-xs space-y-1 list-disc pl-5">
                    {results.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                    {results.recommendations.length > 3 && (
                      <li className="text-muted-foreground">
                        +{results.recommendations.length - 3} more recommendations
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-right">
                Last tested: {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          <Button 
            onClick={runPageSpeedTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Run PageSpeed Test'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PageSpeedIntegration;