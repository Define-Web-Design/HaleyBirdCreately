import React from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Camera, 
  CloudLightning, 
  Compass, 
  Database, 
  Image, 
  LayoutGrid, 
  Monitor, 
  Palette, 
  Sparkles, 
  Target, 
  Zap 
} from 'lucide-react';

const Features = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Create with Intelligence</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the powerful features that make Creately the ultimate platform for creative professionals and content creators.
        </p>
      </header>

      {/* Core Features Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl border border-primary/10 bg-primary/5">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Creativity</h3>
            <p className="text-muted-foreground">
              Harness the power of AI to enhance your creative workflow and generate stunning content effortlessly.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-primary/10 bg-primary/5">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Compass className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Intuitive Content Management</h3>
            <p className="text-muted-foreground">
              Organize and access your creative assets with a beautiful, intuitive interface designed for professionals.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-primary/10 bg-primary/5">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Target className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cross-Platform Publishing</h3>
            <p className="text-muted-foreground">
              Optimize and publish your content across multiple platforms with just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Feature Showcase</h2>

        <div className="space-y-20">
          {/* Feature 1: Color Extraction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block bg-primary/10 rounded-lg p-2 mb-4">
                <Palette className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Website Color Extractor</h3>
              <p className="text-muted-foreground mb-6">
                Extract beautiful color palettes from any website. Our advanced technology analyzes design elements and generates harmonious color schemes that capture the essence of any brand or website.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Extract colors from any URL</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Generate matching palettes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Export in multiple formats</span>
                </li>
              </ul>
              <Link href="/color-palettes">
                <Button>Try Color Extraction</Button>
              </Link>
            </div>
            <div className="bg-muted rounded-xl overflow-hidden h-80 flex items-center justify-center">
              <Image className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="sr-only">Color extraction demo image</p>
            </div>
          </div>

          {/* Feature 2: AI Enhancement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <div className="inline-block bg-primary/10 rounded-lg p-2 mb-4">
                <Zap className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Enhancement Studio</h3>
              <p className="text-muted-foreground mb-6">
                Enhance your content with AI-powered tools that understand context and creative intent. Generate captions, mood boards, and cross-platform adaptations while maintaining full ownership and rights.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Smart caption generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>AI-powered mood boards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Cross-platform content adaptation</span>
                </li>
              </ul>
              <Link href="/ai-enhancement">
                <Button>Explore AI Enhancement</Button>
              </Link>
            </div>
            <div className="bg-muted rounded-xl overflow-hidden h-80 flex items-center justify-center md:order-1">
              <CloudLightning className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="sr-only">AI enhancement demo image</p>
            </div>
          </div>

          {/* Feature 3: Camera Roll Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block bg-primary/10 rounded-lg p-2 mb-4">
                <Camera className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Camera Roll Intelligence</h3>
              <p className="text-muted-foreground mb-6">
                Scan your camera roll to discover patterns, extract insights, and unlock the creative potential of your photo library. Our intelligent algorithms group and suggest content connections.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Smart content grouping</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Theme identification</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Creative recommendations</span>
                </li>
              </ul>
              <Link href="/apple-photos">
                <Button>Analyze Camera Roll</Button>
              </Link>
            </div>
            <div className="bg-muted rounded-xl overflow-hidden h-80 flex items-center justify-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="sr-only">Camera roll analysis demo image</p>
            </div>
          </div>

          {/* Feature 4: Creative Symbiosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <div className="inline-block bg-primary/10 rounded-lg p-2 mb-4">
                <Monitor className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Creative Symbiosis</h3>
              <p className="text-muted-foreground mb-6">
                Connect your creative workflow across devices and platforms. Maintain creative integrity while transforming content for different contexts and audiences.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Cross-device synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Context-aware content adaptation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>Seamless creative flow</span>
                </li>
              </ul>
              <Link href="/creative-symbiosis">
                <Button>Experience Symbiosis</Button>
              </Link>
            </div>
            <div className="bg-muted rounded-xl overflow-hidden h-80 flex items-center justify-center md:order-1">
              <Database className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="sr-only">Creative symbiosis demo image</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">More Powerful Features</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Plan and schedule your content with an intuitive calendar interface. Set reminders and visualize your content strategy.
              </p>
              <Link href="/content-calendar">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Gain insights into your content performance with comprehensive analytics and reporting tools.
              </p>
              <Link href="/analytics">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mood Capsules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create and save emotional profiles that capture the essence of moods, brands, and creative directions.
              </p>
              <Link href="/mood-capsules">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Securely store and protect your most valuable creative assets with encrypted storage and access controls.
              </p>
              <Link href="/content-vault">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Creative Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Overcome creative blocks with AI-generated prompts and inspiration tailored to your style and goals.
              </p>
              <Link href="/creative-prompts">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cross-Platform Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Optimize your content for different platforms and formats with automated resizing and adaptation tools.
              </p>
              <Link href="/cross-platform-tools">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/5 py-16 px-6 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Amplify Your Creativity?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of creative professionals who are already using Creately to streamline their workflows and unlock new creative possibilities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="siri-glow">Get Started For Free</Button>
          <Link href="/pricing">
            <Button variant="outline" size="lg">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Documentation and Resources */}
      <section className="mt-20">
        <Separator className="mb-12" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Documentation and Resources</h3>
            </div>
            <p className="text-muted-foreground">
              Explore our comprehensive documentation to get the most out of Creately.
            </p>
          </div>
          <Link href="/documentation">
            <Button variant="outline">View Documentation</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;