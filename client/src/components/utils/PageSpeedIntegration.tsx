
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';

interface PageSpeedResult {
  score: number;
  metrics: {
    [key: string]: {
      value: number;
      unit?: string;
      category?: string;
    };
  };
  suggestions: string[];
  success: boolean;
}

const PageSpeedIntegration: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PageSpeedResult | null>(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pagespeed/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, device }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze URL');
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>PageSpeed Insights</CardTitle>
        <CardDescription>
          Analyze your website's performance using Google PageSpeed Insights
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Device</Label>
            <RadioGroup
              value={device}
              onValueChange={(value) => setDevice(value as 'mobile' | 'desktop')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile">Mobile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="desktop" id="desktop" />
                <Label htmlFor="desktop">Desktop</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading && (
            <div className="space-y-2">
              <div className="text-center">Analyzing website performance...</div>
              <Progress value={45} className="w-full" />
            </div>
          )}
          
          {results && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <div className="text-xl font-bold">Performance Score</div>
                <div className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                  {Math.round(results.score * 100)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="font-medium text-lg">Key Metrics</div>
                {Object.entries(results.metrics).map(([key, metric]) => (
                  <div key={key} className="flex justify-between items-center">
                    <div>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="font-medium">
                      {metric.value} {metric.unit || ''}
                    </div>
                  </div>
                ))}
              </div>
              
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-lg">Suggestions</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageSpeedIntegration;
