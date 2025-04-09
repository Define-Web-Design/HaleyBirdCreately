import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isValidUrl } from '@/lib/utils';

interface WebCrawlerResult {
  url: string;
  title: string;
  screenshot?: string;
  description: string;
  keywords: string;
  colors: {
    original: string;
    normalized: string;
    format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';
  }[];
  palette: string[];
  timestamp: string;
}

export function WebsiteColorExtractor() {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebCrawlerResult | null>(null);
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const extractColors = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/web-crawler/extract-colors', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to extract colors from website');
      }

      setResult(response.data);
      toast({
        title: 'Colors extracted!',
        description: `Successfully extracted ${response.data.colors.length} colors from ${response.data.title}`,
      });
    } catch (err: any) {
      const message = err.message || 'An error occurred while extracting colors';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePalette = async () => {
    if (!result) return;

    try {
      // This would connect to your API to save the palette
      toast({
        title: 'Palette saved!',
        description: 'The color palette has been saved to your collection',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to save palette',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto apple-rounded shadow-elevation-medium ios-card">
      <CardHeader>
        <CardTitle className="sf-pro-display">Website Color Extractor</CardTitle>
        <CardDescription className="sf-pro-text">
          Extract color palettes from any website by entering its URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="website-url">Website URL</Label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={url}
                onChange={handleUrlChange}
                disabled={isLoading}
              />
              <Button 
                onClick={extractColors} 
                disabled={isLoading}
                className="ios-button ios-button-filled">
                {isLoading ? 'Extracting...' : 'Extract Colors'}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-md" />
                ))}
              </div>
            </div>
          )}

          {result && !isLoading && (
            <Tabs defaultValue="palette" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="palette">Color Palette</TabsTrigger>
                <TabsTrigger value="preview">Website Preview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="palette" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-2">Generated Palette</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.palette.map((color, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded-md border shadow-sm transition-transform hover:scale-110 cursor-pointer siri-glow"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-xs mt-1">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="py-2">
                  <h3 className="text-lg font-medium mb-2">All Extracted Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.colors.slice(0, 20).map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-sm border shadow-sm apple-rounded apple-glow"
                        style={{ backgroundColor: color.normalized }}
                        title={color.original}
                      />
                    ))}
                    {result.colors.length > 20 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-sm border bg-muted">
                        <span className="text-xs">+{result.colors.length - 20}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="space-y-4 py-4">
                  <h3 className="text-lg font-medium">{result.title}</h3>
                  
                  {result.screenshot && (
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={result.screenshot}
                        alt={`Screenshot of ${result.title}`}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {!result.screenshot && (
                    <div className="flex items-center justify-center border rounded-lg bg-muted h-[300px]">
                      <p className="text-muted-foreground">No preview available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4 py-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">URL</h3>
                    <p className="text-sm break-all">{result.url}</p>
                  </div>
                  
                  {result.description && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-sm">{result.description}</p>
                    </div>
                  )}
                  
                  {result.keywords && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Keywords</h3>
                      <p className="text-sm">{result.keywords}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Extraction Time</h3>
                    <p className="text-sm">{new Date(result.timestamp).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Colors Extracted</h3>
                    <p className="text-sm">{result.colors.length} colors</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      
      {result && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setResult(null)}
            className="ios-button ios-button-tinted">
            New Extraction
          </Button>
          <Button 
            onClick={savePalette}
            className="ios-button ios-button-filled siri-glow">
            Save Palette
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}