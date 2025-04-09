import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Blocks, 
  Book, 
  Code, 
  FileText, 
  GitBranch, 
  HelpCircle, 
  MessageSquare, 
  Palette, 
  Sparkles, 
  Terminal, 
  Video 
} from 'lucide-react';

const DocumentationPage = () => {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Helmet>
        <title>Documentation | Creately</title>
        <meta name="description" content="Learn how to use Creately's features and tools" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground max-w-3xl">
          Learn how to use Creately's tools, features, and creative workflows to enhance your creative process.
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 sm:grid-cols-3 md:grid-cols-none gap-2 md:gap-0">
          <TabsTrigger value="getting-started" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span>Getting Started</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Creative Tools</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Enhancement</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>API Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Creately</CardTitle>
              <CardDescription>Get to know the basics and start your creative journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Blocks className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Understanding the Interface</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Learn about the main sections of Creately's interface and how to navigate between features.
                  </p>
                  <a href="#" className="text-primary text-sm hover:underline">Read More →</a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <GitBranch className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Creative Workflows</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Explore common creative workflows and how Creately enhances each step of your process.
                  </p>
                  <a href="#" className="text-primary text-sm hover:underline">Read More →</a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Frequently Asked Questions</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Find answers to common questions about account setup, features, and troubleshooting.
                  </p>
                  <a href="#" className="text-primary text-sm hover:underline">Read More →</a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Video Tutorials</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Watch step-by-step video guides to get the most out of Creately's features.
                  </p>
                  <a href="#" className="text-primary text-sm hover:underline">View Tutorials →</a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Follow these steps to get up and running with Creately</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="pl-2">
                  <span className="font-medium">Create your account</span>
                  <p className="text-muted-foreground text-sm ml-6 mt-1">
                    Sign up with your email or connect through Google, Apple, or social accounts.
                  </p>
                </li>
                <li className="pl-2">
                  <span className="font-medium">Set up your profile</span>
                  <p className="text-muted-foreground text-sm ml-6 mt-1">
                    Add your creative preferences, interests, and connect your content sources.
                  </p>
                </li>
                <li className="pl-2">
                  <span className="font-medium">Explore creative tools</span>
                  <p className="text-muted-foreground text-sm ml-6 mt-1">
                    Try the color palette generator, mood boards, and content vault features.
                  </p>
                </li>
                <li className="pl-2">
                  <span className="font-medium">Discover AI enhancement</span>
                  <p className="text-muted-foreground text-sm ml-6 mt-1">
                    Learn how Creately's AI can help enhance your content while preserving your unique style.
                  </p>
                </li>
                <li className="pl-2">
                  <span className="font-medium">Create your first project</span>
                  <p className="text-muted-foreground text-sm ml-6 mt-1">
                    Start a new creative project using Creately's intelligent tools and your own content.
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creative Tools Documentation</CardTitle>
              <CardDescription>Learn how to use Creately's powerful creative tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Color Palette Generator</h3>
                  <p className="text-muted-foreground text-sm">
                    Extract colors from images, websites, or generate palettes based on mood and themes.
                  </p>
                  <a href="/color-palettes" className="text-primary text-sm hover:underline">Explore Tool →</a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Mood Boards</h3>
                  <p className="text-muted-foreground text-sm">
                    Create visual collections that capture the essence of your creative vision.
                  </p>
                  <a href="/mood-boards" className="text-primary text-sm hover:underline">Explore Tool →</a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Content Vault</h3>
                  <p className="text-muted-foreground text-sm">
                    Store and organize your creative assets for easy access and inspiration.
                  </p>
                  <a href="/content-vault" className="text-primary text-sm hover:underline">Explore Tool →</a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Creative Prompts</h3>
                  <p className="text-muted-foreground text-sm">
                    Get personalized prompts to spark your creativity and overcome creative blocks.
                  </p>
                  <a href="/creative-prompts" className="text-primary text-sm hover:underline">Explore Tool →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Enhancement</CardTitle>
              <CardDescription>Understanding how AI works with your creative process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Creative Symbiosis</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn how Creately's AI works alongside your natural creativity, enhancing rather than replacing your unique voice.
                  </p>
                  <a href="/creative-symbiosis" className="text-primary text-sm hover:underline mt-2 inline-block">Explore Creative Symbiosis →</a>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Adaptive Learning</h3>
                  <p className="text-muted-foreground text-sm">
                    Understand how the AI adapts to your skill level and creative preferences over time.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Privacy and Your Data</h3>
                  <p className="text-muted-foreground text-sm">
                    How Creately handles your data while providing AI-enhanced features and tools.
                  </p>
                  <a href="/privacy" className="text-primary text-sm hover:underline mt-2 inline-block">Privacy Policy →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Integrate with Creately's powerful creative APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <Terminal className="h-5 w-5 mr-2" />
                    <h3 className="font-mono text-sm font-semibold">Getting Started with the API</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Learn how to authenticate and make your first API request to Creately's services.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Available Endpoints</h3>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <code className="bg-muted px-1 py-0.5 rounded">/api/palettes</code> - Generate and manage color palettes
                    </li>
                    <li className="text-sm">
                      <code className="bg-muted px-1 py-0.5 rounded">/api/content</code> - Content analysis and enhancement
                    </li>
                    <li className="text-sm">
                      <code className="bg-muted px-1 py-0.5 rounded">/api/creative</code> - Creative prompt generation
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">API Keys</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage your API keys and usage limits through your developer dashboard.
                  </p>
                  <a href="/settings" className="text-primary text-sm hover:underline mt-2 inline-block">Manage API Keys →</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guides & Tutorials</CardTitle>
              <CardDescription>In-depth guides to help you master Creately</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Community Guides</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Tutorials and guides created by the Creately community, sharing tips and workflows.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Official Guides</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Step-by-step guides created by the Creately team to help you get the most out of the platform.
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-3">Featured Guides</h3>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">Getting the Most from Your Camera Roll</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Learn how to leverage your existing photos and turn them into creative assets with AI enhancement.
                      </p>
                      <a href="#" className="text-primary text-sm hover:underline mt-2 inline-block">Read Guide →</a>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium">Creating Your First AI-Enhanced Project</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        A complete walkthrough of creating a project that blends your creativity with AI assistance.
                      </p>
                      <a href="#" className="text-primary text-sm hover:underline mt-2 inline-block">Read Guide →</a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationPage;