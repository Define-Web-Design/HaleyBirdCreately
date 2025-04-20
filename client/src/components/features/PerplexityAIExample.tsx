
import React, { useState } from 'react';
import perplexityClient from '@/utils/perplexity-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function PerplexityAIExample() {
  const [prompt, setPrompt] = useState('');
  const [contentToAnalyze, setContentToAnalyze] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [analysis, setAnalysis] = useState<{
    sentiment: string;
    topics: string[];
    keywords: string[];
  } | null>(null);

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({ 
        title: "Empty prompt", 
        description: "Please enter a prompt first.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await perplexityClient.generateText(prompt, {
        model: 'sonar-medium-online',
        temperature: 0.7
      });
      setResult(response);
    } catch (error) {
      console.error('Error generating text:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate text. Check console for details.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!contentToAnalyze.trim()) {
      toast({ 
        title: "Empty content", 
        description: "Please enter some content to analyze.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await perplexityClient.analyzeContent(contentToAnalyze);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({ 
        title: "Error", 
        description: "Failed to analyze content. Check console for details.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Sentiment</h3>
          <p className="text-muted-foreground">{analysis.sentiment}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Topics</h3>
          <ul className="list-disc pl-5">
            {analysis.topics.map((topic, index) => (
              <li key={index} className="text-muted-foreground">{topic}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Keywords</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {analysis.keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="text-generation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text-generation">Text Generation</TabsTrigger>
          <TabsTrigger value="content-analysis">Content Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text-generation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Text with Perplexity AI</CardTitle>
              <CardDescription>
                Enter a prompt and Perplexity AI will generate a response using the sonar-medium-online model.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Enter your prompt here..."
                    className="min-h-[100px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Result</h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{result || "Response will appear here"}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateText} 
                disabled={loading || !prompt.trim()}
              >
                {loading ? "Generating..." : "Generate Text"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="content-analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis with Perplexity AI</CardTitle>
              <CardDescription>
                Enter some content and Perplexity AI will analyze it for sentiment, topics, and keywords.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Enter content to analyze..."
                    className="min-h-[100px]"
                    value={contentToAnalyze}
                    onChange={(e) => setContentToAnalyze(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                    </div>
                  ) : (
                    renderAnalysisResults() || <p className="text-muted-foreground">Analysis will appear here</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyzeContent} 
                disabled={loading || !contentToAnalyze.trim()}
              >
                {loading ? "Analyzing..." : "Analyze Content"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-lg font-medium mb-2 text-yellow-800 dark:text-yellow-300">API Key Required</h2>
        <p>
          To use Perplexity AI, you need to add your API key to the environment variables.
          Create or edit the <code className="px-1 py-0.5 bg-muted rounded text-sm">.env.local</code> file 
          in the client directory and add:
          <code className="block px-3 py-2 mt-2 bg-muted rounded text-sm">
            VITE_PERPLEXITY_API_KEY=your_api_key_here
          </code>
        </p>
      </div>
    </div>
  );
}
