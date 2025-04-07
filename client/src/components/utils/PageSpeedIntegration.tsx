import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, CheckCircle, Info, Smartphone, Monitor, Clock, Download, 
  Share2, History, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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
    opportunities: Array<{ 
      title: string; 
      description: string;
      impact?: number;
      displayValue?: string;
    }>;
    coreVitals: Record<string, { value: string; description: string }>;
    timestamp?: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousResults, setPreviousResults] = useState<Array<{
    url: string;
    device: 'mobile' | 'desktop';
    timestamp: string;
    scores: Record<string, number>;
  }>>([]);
  const [urlSuggestions, setUrlSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  
  // Load previous analyses from localStorage
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('pagespeed_history');
      if (savedResults) {
        setPreviousResults(JSON.parse(savedResults));
      }
    } catch (err) {
      console.error('Failed to load previous analyses:', err);
    }
    
    // Try to get recent URLs for suggestions
    try {
      const savedUrls = localStorage.getItem('pagespeed_urls');
      if (savedUrls) {
        setUrlSuggestions(JSON.parse(savedUrls));
      }
    } catch (err) {
      console.error('Failed to load URL suggestions:', err);
    }
  }, []);
  
  // Save URL to suggestions
  const saveUrlToSuggestions = (newUrl: string) => {
    if (!newUrl) return;
    
    try {
      // Add URL to suggestions if not already there
      const updatedSuggestions = [...new Set([newUrl, ...urlSuggestions])].slice(0, 5);
      setUrlSuggestions(updatedSuggestions);
      localStorage.setItem('pagespeed_urls', JSON.stringify(updatedSuggestions));
    } catch (err) {
      console.error('Failed to save URL suggestion:', err);
    }
  };
  
  // Auto-detect current URL
  useEffect(() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '0.0.0.0') {
      setUrl(window.location.origin);
    }
  }, []);
  
  // Make an API call to the backend for PageSpeed analysis
  const runAnalysis = async () => {
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }
    
    setIsRunning(true);
    setError(null);
    
    try {
      saveUrlToSuggestions(url);
      
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
        
        // Add to previous results
        const newResultSummary = {
          url: url,
          device: device,
          timestamp: data.results.timestamp || new Date().toISOString(),
          scores: data.results.scores
        };
        
        const updatedResults = [newResultSummary, ...previousResults].slice(0, 10);
        setPreviousResults(updatedResults);
        
        try {
          localStorage.setItem('pagespeed_history', JSON.stringify(updatedResults));
        } catch (err) {
          console.error('Failed to save results history:', err);
        }
        
        toast({
          title: "Analysis Complete",
          description: "PageSpeed Insights analysis has been completed successfully.",
        });
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
  
  // Generate a share URL with results
  const generateShareUrl = () => {
    if (!results) return null;
    
    try {
      const scoreParams = Object.entries(results.scores)
        .map(([category, score]) => `${category}=${Math.round(score * 100)}`)
        .join('&');
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?${scoreParams}&device=${device}&url=${encodeURIComponent(url)}`;
      
      return shareUrl;
    } catch (err) {
      console.error('Failed to generate share URL:', err);
      return null;
    }
  };

  // Share results function
  const shareResults = async () => {
    const shareUrl = generateShareUrl();
    if (!shareUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PageSpeed Insights Results',
          text: `Check out these PageSpeed Insights results for ${url} on ${device}`,
          url: shareUrl
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Results link has been copied to your clipboard.",
        });
      }
    } catch (err) {
      console.error('Error sharing results:', err);
    }
  };
  
  // Get the improvement recommendations based on the results
  const improvementRecommendations = useMemo(() => {
    if (!results || !results.opportunities) return [];
    
    return results.opportunities.map(opportunity => {
      const impact = opportunity.impact || 0;
      const priority = impact > 5000 ? 'High' : impact > 2000 ? 'Medium' : 'Low';
      const priorityColor = priority === 'High' ? 'text-red-500' : 
                           priority === 'Medium' ? 'text-yellow-500' : 
                           'text-green-500';
      
      return {
        ...opportunity,
        priority,
        priorityColor
      };
    });
  }, [results]);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          PageSpeed Insights Integration
        </CardTitle>
        <CardDescription>
          Analyze your application's performance using Google PageSpeed Insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="run" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="run">Run Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="help">How It Works</TabsTrigger>
          </TabsList>
          
          <TabsContent value="run" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to analyze</Label>
                <div className="relative">
                  <Input
                    id="url"
                    placeholder="https://your-app.replit.app"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setShowSuggestions(e.target.value.length > 0 && urlSuggestions.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(url.length > 0 && urlSuggestions.length > 0)}
                    onBlur={() => {
                      // Delay hiding suggestions to allow for clicks
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-background rounded-md border border-border shadow-md">
                      {urlSuggestions.filter(s => s.includes(url)).map((suggestion, i) => (
                        <div 
                          key={i}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => {
                            setUrl(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
            
            {isRunning && (
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <p>Running analysis for {device} experience...</p>
                  <p className="text-sm text-muted-foreground">This may take up to 30 seconds</p>
                </div>
                <Progress value={70} className="animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Performance', 'Accessibility', 'Best Practices', 'SEO'].map((category) => (
                    <div key={category} className="text-center p-4 rounded-lg border">
                      <Skeleton className="h-8 w-12 mx-auto mb-2" />
                      <Skeleton className="h-4 w-20 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {results && !error && (
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Results</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={shareResults}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (results) {
                          const resultText = `PageSpeed Insights Analysis
URL: ${url}
Device: ${device}
Date: ${new Date().toLocaleString()}

Scores:
${Object.entries(results.scores)
  .map(([category, score]) => `${category}: ${Math.round(score * 100)}/100`)
  .join('\n')}

Core Web Vitals:
${Object.entries(results.coreVitals)
  .map(([name, data]) => `${name}: ${data.value}`)
  .join('\n')}`;
                          
                          const blob = new Blob([resultText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `pagespeed-${device}-${new Date().toISOString().slice(0, 10)}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.scores).map(([category, score]) => {
                    const { color, label } = formatScore(score);
                    const scoreValue = Math.round(score * 100);
                    
                    return (
                      <div key={category} className="text-center p-4 rounded-lg border transition-all duration-300 hover:shadow-md">
                        <div className="text-2xl font-bold">{scoreValue}</div>
                        <Badge className={color}>{label}</Badge>
                        <div className="text-sm mt-1">{category}</div>
                        <Progress 
                          value={scoreValue} 
                          className={`mt-2 h-1.5 ${scoreValue >= 90 ? 'bg-green-100' : 
                                                scoreValue >= 50 ? 'bg-yellow-100' : 
                                                'bg-red-100'}`}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Core Web Vitals
                  </h3>
                  <div className="rounded-lg border overflow-hidden">
                    {Object.entries(results.coreVitals).map(([name, data], index) => (
                      <div 
                        key={name} 
                        className={`flex justify-between p-3 ${
                          index < Object.entries(results.coreVitals).length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">{data.description}</div>
                        </div>
                        <div className="font-mono">{data.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {results.opportunities && results.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recommendations
                    </h3>
                    
                    <Accordion type="single" collapsible className="border rounded-lg">
                      {improvementRecommendations.map((opportunity, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="py-3 px-4">
                            <div className="flex items-center gap-2 text-left">
                              <div className={`text-sm font-medium ${opportunity.priorityColor}`}>
                                {opportunity.priority}
                              </div>
                              <div>{opportunity.title}</div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                            {opportunity.displayValue && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">Potential saving: </span>
                                {opportunity.displayValue}
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Previous Analyses
            </h3>
            
            {previousResults.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">No previous analyses found</p>
                <p className="text-sm mt-1">Run an analysis to save results here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {previousResults.map((result, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setUrl(result.url);
                      setDevice(result.device);
                    }}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="font-medium truncate max-w-[60%]">{result.url}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">{result.device}</Badge>
                      <div className="flex gap-2">
                        {Object.entries(result.scores).map(([category, score]) => {
                          const { color } = formatScore(score);
                          return (
                            <Badge key={category} className={color}>
                              {category.substring(0, 1)}: {Math.round(score * 100)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviousResults([]);
                      localStorage.removeItem('pagespeed_history');
                      toast({
                        title: "History Cleared",
                        description: "Previous analysis results have been cleared.",
                      });
                    }}
                  >
                    Clear History
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4 pt-4">
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
      
      <CardFooter className="border-t pt-4">
        <Button 
          onClick={runAnalysis} 
          disabled={isRunning || !url} 
          className="w-full gap-2"
        >
          {isRunning ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Running Analysis...
            </>
          ) : (
            <>
              <BarChart className="h-4 w-4" />
              Run PageSpeed Analysis
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PageSpeedIntegration;