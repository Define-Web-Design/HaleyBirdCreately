import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, CheckCircle, Info, Smartphone, Monitor, Clock } from 'lucide-react';

/**
 * PageSpeed Insights Integration Component
 * 
 * This component provides a UI for running and displaying PageSpeed analysis.
 * It's meant to be used in development/testing environments to help optimize
 * the application's performance.
 */
export const PageSpeedIntegration = () => {
  const [url, setUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [results, setResults] = useState<null | {
    scores: Record<string, number>;
    opportunities: Array<{ title: string; description: string }>;
    coreVitals: Record<string, { value: string; description: string }>;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Make an API call to the backend for PageSpeed analysis
  const runAnalysis = async () => {
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    setResults(null);
    
    try {
      // Call our backend API that integrates with PageSpeed Insights
      const response = await fetch('/api/pagespeed/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          device: device
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to run PageSpeed analysis');
      }
      
      if (data.success) {
        // Set the results to display them in the UI
        setResults(data.results);
      } else {
        setError(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  const formatScore = (score: number) => {
    if (score >= 0.9) return { color: 'bg-green-100 text-green-800', label: 'Good' };
    if (score >= 0.5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Improvement' };
    return { color: 'bg-red-100 text-red-800', label: 'Poor' };
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          PageSpeed Insights Integration
        </CardTitle>
        <CardDescription>
          Analyze your application's performance using Google PageSpeed Insights
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="run" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="run">Run Analysis</TabsTrigger>
            <TabsTrigger value="help">How It Works</TabsTrigger>
          </TabsList>
          
          <TabsContent value="run" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to analyze</Label>
                <Input
                  id="url"
                  placeholder="https://your-app.replit.app"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Device Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={device === 'mobile' ? 'default' : 'outline'}
                    className="flex items-center gap-2 flex-1"
                    onClick={() => setDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                  <Button
                    type="button"
                    variant={device === 'desktop' ? 'default' : 'outline'}
                    className="flex items-center gap-2 flex-1"
                    onClick={() => setDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </Button>
                </div>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {results && !error && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.scores).map(([category, score]) => {
                    const { color, label } = formatScore(score);
                    return (
                      <div key={category} className="text-center p-4 rounded-lg border">
                        <div className="text-2xl font-bold">{Math.round(score * 100)}</div>
                        <Badge className={color}>{label}</Badge>
                        <div className="text-sm mt-1">{category}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Core Web Vitals</h3>
                  {Object.entries(results.coreVitals).map(([name, data]) => (
                    <div key={name} className="flex justify-between p-2 border-b">
                      <div>{name}</div>
                      <div>{data.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="help">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About PageSpeed Insights
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Google PageSpeed Insights analyzes your web page and provides suggestions to make it faster.
                  Our integration makes it easy to run these analyses and track your performance over time.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Key Metrics to Watch
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <strong>Largest Contentful Paint (LCP)</strong>: Measures loading performance. Should be under 2.5s.
                  </p>
                  <p className="text-sm">
                    <strong>First Input Delay (FID)</strong>: Measures interactivity. Should be under 100ms.
                  </p>
                  <p className="text-sm">
                    <strong>Cumulative Layout Shift (CLS)</strong>: Measures visual stability. Should be under 0.1.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  How to Use the Results
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Focus on fixing issues that impact Core Web Vitals first. These have the most significant impact
                  on user experience and SEO. Then address opportunities for improvement in order of potential impact.
                </p>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Documentation</AlertTitle>
                <AlertDescription>
                  For more detailed information on using this integration, check out the PageSpeed guide in the 
                  docs folder: <code className="text-xs bg-muted p-1 rounded">docs/pagespeed-guide.md</code>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button onClick={runAnalysis} disabled={isRunning || !url} className="w-full">
          {isRunning ? 'Running Analysis...' : 'Run PageSpeed Analysis'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PageSpeedIntegration;