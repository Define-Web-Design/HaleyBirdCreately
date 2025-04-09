import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Image, 
  Layout, 
  Palette, 
  Sparkles, 
  Wand2, 
  Zap, 
  BookOpen, 
  Brain, 
  Lightbulb,
  Layers,
  Users,
  LineChart
} from 'lucide-react';

const FeaturePage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Features | Creately</title>
        <meta name="description" content="Explore the powerful features of Creately's creative platform" />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Creately combines your natural creativity with intelligent tools to create 
          a seamless, personalized creative experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            View Documentation
          </Button>
        </div>
      </section>

      {/* Core Features */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Core Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines intuitive tools with AI capabilities to enhance your creative process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Brain className="h-10 w-10 text-primary" />}
            title="Creative Symbiosis"
            description="Our AI works alongside your creativity, enhancing rather than replacing your unique voice and style."
          />
          <FeatureCard 
            icon={<Camera className="h-10 w-10 text-primary" />}
            title="Camera Roll Integration"
            description="Seamlessly connect to your existing photos and use them as the foundation for new creative projects."
          />
          <FeatureCard 
            icon={<Palette className="h-10 w-10 text-primary" />}
            title="Color Palette Tools"
            description="Extract colors from images, websites, or generate palettes based on mood and themes."
          />
          <FeatureCard 
            icon={<Lightbulb className="h-10 w-10 text-primary" />}
            title="Adaptive Learning"
            description="Our system learns your skill level and preferences over time, providing a personalized experience."
          />
          <FeatureCard 
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Content Vault"
            description="Organize and store your creative assets in a secure, easily accessible digital vault."
          />
          <FeatureCard 
            icon={<Wand2 className="h-10 w-10 text-primary" />}
            title="AI Enhancement"
            description="Intelligent tools that help refine and enhance your content while preserving your authentic style."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20 bg-muted/50 py-16 px-4 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Creately Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform adapts to your creative process, providing the right tools at the right time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Content</h3>
            <p className="text-muted-foreground">
              Import your photos, inspiration, and existing creative assets to use as building blocks.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enhance with AI</h3>
            <p className="text-muted-foreground">
              Our intelligent tools analyze and enhance your content while preserving your unique style.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create & Share</h3>
            <p className="text-muted-foreground">
              Produce stunning creative works and share them across platforms with integrated tools.
            </p>
          </div>
        </div>
      </section>

      {/* Creative Tools */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Creative Tools Suite</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to enhance every aspect of your creative workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Color Tools</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Color palette extraction from images</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Website color analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Mood-based palette generation</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Color harmony and accessibility tools</span>
              </li>
            </ul>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Content Creation</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Mood board creation</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>AI-enhanced editing tools</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Creative prompt generation</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Cross-platform sharing</span>
              </li>
            </ul>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Enhancement</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Style preservation algorithms</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Content analysis and suggestions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Adaptive learning system</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Skill-level appropriate tools</span>
              </li>
            </ul>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Media Integration</h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Camera roll access</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Social media imports</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Cloud storage integration</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Multi-device synchronization</span>
              </li>
            </ul>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how Creately has helped creators unlock their potential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="mb-4 text-muted-foreground italic">
              "Creately helped me discover my creative style while giving me tools to enhance it. It's like having a creative partner that knows exactly what I need."
            </p>
            <p className="font-medium">Alex T.</p>
            <p className="text-sm text-muted-foreground">Graphic Designer</p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="mb-4 text-muted-foreground italic">
              "I was skeptical about AI tools, but Creately doesn't replace my creativity—it amplifies it. The way it learns my preferences is almost magical."
            </p>
            <p className="font-medium">Jamie L.</p>
            <p className="text-sm text-muted-foreground">Content Creator</p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="mb-4 text-muted-foreground italic">
              "The camera roll integration changed everything for me. Now my photos become the starting point for amazing creative projects with just a few taps."
            </p>
            <p className="font-medium">Morgan K.</p>
            <p className="text-sm text-muted-foreground">Photographer</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/10 py-16 px-4 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Creative Journey?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Join thousands of creators who are discovering new possibilities with Creately.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Schedule a Demo
          </Button>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeaturePage;