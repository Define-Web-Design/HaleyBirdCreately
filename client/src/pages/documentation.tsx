import React from 'react';
import { Link } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Code, 
  Compass, 
  FileText, 
  Grid, 
  RefreshCw, 
  Zap 
} from 'lucide-react';

const Documentation = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Creately Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A complete guide to Creately's features, APIs, and best practices for
          unlocking your creative potential.
        </p>
      </header>

      <Tabs defaultValue="guides" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Getting Started</CardTitle>
                </div>
                <CardDescription>
                  Everything you need to know to begin your creative journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <Link href="/docs/introduction" className="text-primary hover:underline">
                      Introduction to Creately
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/quickstart" className="text-primary hover:underline">
                      Quick Start Guide
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/core-concepts" className="text-primary hover:underline">
                      Core Concepts
                    </Link>
                  </li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  View All Guides
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>AI Features</CardTitle>
                </div>
                <CardDescription>
                  Learn how to leverage our AI-powered creative tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <Link href="/docs/ai-enhancement" className="text-primary hover:underline">
                      AI Enhancement Studio
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/color-extraction" className="text-primary hover:underline">
                      Color Extraction Technology
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/creative-symbiosis" className="text-primary hover:underline">
                      Creative Symbiosis
                    </Link>
                  </li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Explore AI Features
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Grid className="h-5 w-5 text-primary" />
                  <CardTitle>Content Management</CardTitle>
                </div>
                <CardDescription>
                  Organize and optimize your creative assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <Link href="/docs/content-library" className="text-primary hover:underline">
                      Content Library
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/content-vault" className="text-primary hover:underline">
                      Content Vault Security
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/analytics" className="text-primary hover:underline">
                      Content Analytics
                    </Link>
                  </li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Content Management Guides
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <CardTitle>Creative Exploration</CardTitle>
                </div>
                <CardDescription>
                  Discover techniques for expanding your creative horizons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <Link href="/docs/mood-capsules" className="text-primary hover:underline">
                      Mood Capsules
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/creative-prompts" className="text-primary hover:underline">
                      Creative Prompts
                    </Link>
                  </li>
                  <li className="text-sm">
                    <Link href="/docs/mood-boards" className="text-primary hover:underline">
                      Advanced Mood Boards
                    </Link>
                  </li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Creative Techniques
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle>API Reference</CardTitle>
              </div>
              <CardDescription>
                Complete documentation for integrating with Creately's powerful APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Our comprehensive API allows you to integrate Creately's powerful creative tools
                  into your own applications and workflows.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">REST API</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Core API for content management and analysis
                    </p>
                    <Button variant="outline" size="sm">View Documentation</Button>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">Color Extraction API</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Extract color palettes from images and websites
                    </p>
                    <Button variant="outline" size="sm">View Documentation</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Learn how to authenticate with our API
                </p>
                <Link href="/docs/api/authentication" className="text-primary text-sm hover:underline">
                  View Documentation →
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Understand API rate limits and quotas
                </p>
                <Link href="/docs/api/rate-limits" className="text-primary text-sm hover:underline">
                  View Documentation →
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Setting up and handling webhook events
                </p>
                <Link href="/docs/api/webhooks" className="text-primary text-sm hover:underline">
                  View Documentation →
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Color Extraction</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract a color palette from any image or website URL.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-xs">
                    <pre className="whitespace-pre-wrap">
                      {`const response = await fetch('/api/extract-colors', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com' })
});

const { colors, palette } = await response.json();`}
                    </pre>
                  </code>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Try It Out →
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Content Pipeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an automated content processing pipeline.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-xs">
                    <pre className="whitespace-pre-wrap">
                      {`// Create content processing pipeline
const pipeline = new ContentPipeline();

pipeline
  .addStep('analyze')
  .addStep('enhance')
  .addStep('distribute')
  .start();`}
                    </pre>
                  </code>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  View Tutorial →
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">AI Caption Generation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate engaging captions for your images.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-xs">
                    <pre className="whitespace-pre-wrap">
                      {`// Generate AI captions for an image
const caption = await creately.ai.generateCaption({
  imageUrl: 'https://example.com/image.jpg',
  toneOfVoice: 'professional',
  maxLength: 280
});`}
                    </pre>
                  </code>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Try AI Features →
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
        <p className="text-muted-foreground mb-6">
          Our team is here to help you get the most out of Creately.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" size="lg">
            Contact Support
          </Button>
          <Button variant="outline" size="lg">
            Join Community
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Documentation;