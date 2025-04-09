import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, ExternalLink, Download, Copy, RefreshCw, Info, Palette } from 'lucide-react';
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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Introduction Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/10 rounded-full p-3">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sf-pro-display">Website Color Extractor</h1>
            <p className="text-muted-foreground sf-pro-text">
              Analyze any website to extract its color scheme and create matching palettes
            </p>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex gap-3 items-start">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm">
                Enter a website URL below to analyze its colors. Our tool will extract dominant colors 
                and generate a harmonious palette that captures the site's visual identity.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                For best results, use complete URLs (including https://) of modern, visually rich websites.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* URL Input Card */}
      <Card className="w-full apple-rounded shadow-sm ios-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 pt-5">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="sf-pro-display text-lg">Enter Website URL</CardTitle>
          </div>
          <CardDescription className="sf-pro-text mt-1">
            Paste any website address to extract its colors
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-5">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="website-url" className="flex items-center gap-1 text-sm font-medium">
                Website Address
                <span className="text-xs text-muted-foreground">(include https://)</span>
              </Label>
              <div className="flex w-full items-center gap-3">
                <div className="relative flex-grow">
                  <Input
                    id="website-url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={handleUrlChange}
                    disabled={isLoading}
                    className="pr-10 font-mono text-sm"
                    aria-describedby="url-format-hint"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button 
                  onClick={extractColors} 
                  disabled={isLoading}
                  className="ios-button ios-button-filled gap-2 min-w-[140px]"
                  aria-label="Extract colors from website">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Colors</span>
                    </>
                  )}
                </Button>
              </div>
              
              <p id="url-format-hint" className="text-xs text-muted-foreground">
                Example: https://apple.com or https://www.nytimes.com
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Error
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Loading State */}
      {isLoading && (
        <Card className="w-full apple-rounded shadow-sm overflow-hidden border border-primary/10 animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              
              <Skeleton className="h-[250px] w-full rounded-xl" />
              
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Results Display */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Website Info */}
          <div className="bg-muted/20 rounded-lg p-4 border border-border">
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{result.title || 'Analyzed Website'}</h2>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    {result.url.length > 40 ? result.url.substring(0, 40) + '...' : result.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              <div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {result.colors.length} colors extracted
                </span>
              </div>
            </div>
          </div>
          
          {/* Main Results Card */}
          <Card className="w-full apple-rounded shadow-elevation-medium ios-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="sf-pro-display text-lg">Extracted Color Palette</CardTitle>
              <CardDescription className="sf-pro-text">
                These colors represent the visual identity of {result.title || 'the website'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs defaultValue="palette" className="w-full">
                <div className="border-b border-border/40">
                  <TabsList className="w-full rounded-none bg-muted/30 p-0 h-auto">
                    <TabsTrigger 
                      value="palette" 
                      className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-5 h-auto"
                    >
                      <Palette className="h-4 w-4" />
                      <span>Color Palette</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="preview" 
                      className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-5 h-auto"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website Preview</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="details" 
                      className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-5 h-auto"
                    >
                      <Info className="h-4 w-4" />
                      <span>Details</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="palette" className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span>Primary Color Palette</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {result.palette.length} colors
                        </span>
                      </h3>
                      
                      <div className="flex flex-wrap gap-4">
                        {result.palette.map((color, index) => (
                          <div 
                            key={index} 
                            className="group relative flex flex-col items-center"
                            onClick={() => {
                              navigator.clipboard.writeText(color);
                              toast({
                                title: "Color Copied",
                                description: `${color} copied to clipboard`,
                              });
                            }}
                          >
                            <div
                              className="w-20 h-20 rounded-lg border shadow-sm transition-transform hover:scale-110 cursor-pointer siri-glow"
                              style={{ backgroundColor: color }}
                              title={`Copy ${color}`}
                              aria-label={`Color ${color}`}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg">
                                <Copy className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <span className="text-sm font-mono mt-2">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <span>All Extracted Colors</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Showing {Math.min(result.colors.length, 20)} of {result.colors.length}
                        </span>
                      </h3>
                      
                      <div className="flex flex-wrap gap-3">
                        {result.colors.slice(0, 20).map((color, index) => (
                          <div
                            key={index}
                            className="group relative w-10 h-10 rounded-md border shadow-sm apple-rounded apple-glow cursor-pointer"
                            style={{ backgroundColor: color.normalized }}
                            title={`Copy ${color.original}`}
                            onClick={() => {
                              navigator.clipboard.writeText(color.original);
                              toast({
                                title: "Color Copied",
                                description: `${color.original} copied to clipboard`,
                              });
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-md">
                              <Copy className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ))}
                        
                        {result.colors.length > 20 && (
                          <div className="flex items-center justify-center w-10 h-10 rounded-md border bg-muted">
                            <span className="text-xs">+{result.colors.length - 20}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{result.title || 'Website Preview'}</h3>
                      
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm flex items-center gap-1 text-primary hover:underline"
                      >
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                      {result.screenshot ? (
                        <img
                          src={result.screenshot}
                          alt={`Screenshot of ${result.title}`}
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-muted/30 h-[300px] p-6 text-center">
                          <Globe className="h-10 w-10 text-muted-foreground/60 mb-3" />
                          <p className="text-muted-foreground">No preview available for this website</p>
                          <p className="text-xs text-muted-foreground/80 mt-2">
                            Preview generation may be limited for some sites due to their security settings
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Color Application Examples */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Preview with Extracted Colors</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Mock UI with extracted colors */}
                        <div className="border rounded-lg p-4 bg-background">
                          <h4 className="text-sm font-medium mb-2">UI Component Example</h4>
                          <div className="space-y-3">
                            <div 
                              className="h-10 rounded-md flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: result.palette[0] || '#888' }}
                            >
                              Primary Button
                            </div>
                            <div className="flex gap-2">
                              <div 
                                className="h-8 flex-1 rounded-md"
                                style={{ backgroundColor: result.palette[1] || '#ddd' }}
                              ></div>
                              <div 
                                className="h-8 flex-1 rounded-md"
                                style={{ backgroundColor: result.palette[2] || '#eee' }}
                              ></div>
                            </div>
                            <div 
                              className="h-6 w-3/4 rounded-md"
                              style={{ backgroundColor: result.palette[3] || '#f5f5f5' }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Palette Color Distribution */}
                        <div className="border rounded-lg p-4 bg-background">
                          <h4 className="text-sm font-medium mb-2">Color Distribution</h4>
                          <div className="flex h-20 overflow-hidden rounded-md">
                            {result.palette.map((color, i) => (
                              <div 
                                key={i} 
                                className="h-full flex-grow"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6 m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="space-y-5">
                    <div className="bg-muted/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">About This Extraction</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">URL</h4>
                          <p className="text-sm break-all">{result.url}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">Extraction Time</h4>
                          <p className="text-sm">{new Date(result.timestamp).toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">Total Colors</h4>
                          <p className="text-sm">{result.colors.length} colors found</p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground">Primary Palette</h4>
                          <p className="text-sm">{result.palette.length} colors selected</p>
                        </div>
                      </div>
                    </div>
                    
                    {result.description && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Website Description</h3>
                        <p className="text-sm border rounded-lg p-3 bg-muted/10">{result.description}</p>
                      </div>
                    )}
                    
                    {result.keywords && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.split(',').map((keyword, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Color Analysis</h3>
                      <p className="text-sm">
                        This extraction analyzed {result.colors.length} colors and generated a palette of {result.palette.length} representative colors. 
                        The palette is designed to reflect the visual identity of the website while ensuring color harmony.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-border/40 p-4">
              <Button 
                variant="outline" 
                onClick={() => setResult(null)}
                className="ios-button ios-button-tinted gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Extraction
              </Button>
              
              <Button 
                onClick={savePalette}
                className="ios-button ios-button-filled siri-glow gap-2"
              >
                <Download className="h-4 w-4" />
                Save Palette
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* User Guidance */}
      {!result && !isLoading && (
        <div className="bg-muted/20 rounded-lg p-5 border border-border">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <span>How It Works</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium">1</div>
                  <h4 className="font-medium">Enter a URL</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Paste any website address including the https:// prefix
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium">2</div>
                  <h4 className="font-medium">Extract Colors</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes the site and extracts its color palette
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center text-primary font-medium">3</div>
                  <h4 className="font-medium">Use the Results</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy colors to use in your designs or save the palette
                </p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground bg-background rounded-lg p-3 border border-border/50">
              <p><strong>Pro tip:</strong> For best results, try websites with rich visual designs like portfolio sites, 
              e-commerce platforms, or creative agency websites. The more visually diverse the site, the better the extracted palette will be.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}