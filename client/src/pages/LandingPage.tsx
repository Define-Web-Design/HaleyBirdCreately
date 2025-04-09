import { Link } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';
import { 
  ArrowRight, Sparkles, Lock, 
  Shapes, Recycle, Users, Palette, 
  Zap, HeartHandshake, Brain, 
  Layers, PersonStanding
} from 'lucide-react';
import '../styles/landing-animations.css';

/**
 * Landing page displayed for non-authenticated users
 */
export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Log to help with debugging
    console.log('Landing page mounted');
    console.log('Auth state:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  return (
    <>
      <Helmet>
        <title>Creately - Creative Platform</title>
        <meta name="description" content="AI-powered creative platform for design professionals" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Gradient background with animated effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 gradient-bg"
          />
          
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-40 rounded-full bg-black/10 blur-xl"></div>
          
          {/* Content */}
          <div className="relative px-4 py-20 md:py-32 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <div className="inline-block rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white mb-2">
                  <span className="mr-1">✨</span> Intelligent Design Tools
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Transform Your <span className="relative">
                    <span className="relative z-10">Content</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-white/20 -z-0 rounded-sm"></span>
                  </span> With Adaptive AI
                </h1>
                
                <p className="text-xl text-white/80 leading-relaxed">
                  Optimize and repurpose your media with AI-powered tools that learn from you, collaborate seamlessly, and deliver emotionally engaging content.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-6 font-medium flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-6 font-medium">
                          Get Started
                        </Button>
                      </Link>
                      <Link href="/color-palettes">
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-6">
                          Explore Features
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-2">
                    {[
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-amber-500',
                      'bg-purple-500'
                    ].map((color, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${color}`}></div>
                    ))}
                  </div>
                  <p className="text-sm text-white/70">
                    Trusted by 2,000+ designers worldwide
                  </p>
                </div>
              </div>
              
              {/* Hero image/mockup */}
              <div className="md:w-1/2 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-xl">
                  <div className="bg-black/80 rounded-lg overflow-hidden relative">
                    <div className="px-4 py-2 flex justify-between items-center border-b border-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="text-xs text-white/70">Creately Content Transformation</div>
                      <div></div>
                    </div>
                    <div className="p-6">
                      {/* Content transformation visualization */}
                      <div className="flex justify-between mb-4">
                        <div className="w-1/3 h-24 rounded-md bg-gray-800 flex items-center justify-center p-2">
                          <div className="w-full h-20 bg-blue-500/20 rounded-md flex items-center justify-center text-xs text-white/70">
                            Original Content
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-center mx-2">
                          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div className="h-4 w-16 border-t border-dashed border-white/20 mt-1"></div>
                        </div>
                        <div className="w-1/2 flex flex-col space-y-2">
                          <div className="h-11 rounded-md bg-gray-800 flex items-center justify-center text-xs text-white/70">
                            Instagram
                          </div>
                          <div className="h-11 rounded-md bg-gray-800 flex items-center justify-center text-xs text-white/70">
                            Twitter/X
                          </div>
                        </div>
                      </div>
                      
                      {/* Interactive metrics bar */}
                      <div className="w-full h-12 bg-gray-800 rounded-md flex items-center justify-between px-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                          <div className="text-xs text-white/70">Engagement</div>
                        </div>
                        <div className="h-3 w-32 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/70"></div>
                        </div>
                      </div>
                      
                      {/* AI adjustment panels */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="h-20 bg-gray-800 rounded-md p-3">
                          <div className="text-xs text-white/70 mb-2">Adaptive Learning</div>
                          <div className="mt-1 grid grid-cols-4 gap-1">
                            <div className="h-3 bg-primary/30 rounded-full"></div>
                            <div className="h-3 bg-primary/50 rounded-full"></div>
                            <div className="h-3 bg-primary/70 rounded-full"></div>
                            <div className="h-3 bg-primary rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-20 bg-gray-800 rounded-md p-3">
                          <div className="text-xs text-white/70 mb-2">Team Collaboration</div>
                          <div className="flex -space-x-2 mt-2">
                            {['bg-blue-500', 'bg-green-500', 'bg-purple-500'].map((color, i) => (
                              <div key={i} className={`w-6 h-6 rounded-full ${color} border border-gray-800`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/30 pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4 mr-1" /> Powerful Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for Creatives</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our intelligent tools streamline your workflow and inspire your creative process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Recycle />}
                title="Adaptive Content Recycling" 
                description="Analyze and optimize your media for platform-specific enhancements tailored to audience engagement."
              />
              <FeatureCard 
                icon={<Users />}
                title="Seamless Collaboration Tools" 
                description="Work together in real-time with intuitive team features that make creative collaboration effortless."
              />
              <FeatureCard 
                icon={<HeartHandshake />}
                title="Emotional Connection" 
                description="Foster deeper engagement through personalized dashboards and accessibility features that resonate with users."
              />
              <FeatureCard 
                icon={<Brain />}
                title="Evolutionary AI Learning" 
                description="Our AI adapts to your creative style and preferences over time, becoming more helpful with each interaction."
              />
              <FeatureCard 
                icon={<Zap />}
                title="Smart Content Transformation" 
                description="Instantly repurpose your content across multiple platforms while preserving your authentic voice and style."
              />
              <FeatureCard 
                icon={<Shapes />}
                title="Integrated Design Tools" 
                description="Access powerful color and design utilities that complement your creative workflow and enhance your content."
              />
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="py-20 bg-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-10 opacity-10">
            <div className="flex gap-2">
              {['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'].map((color, i) => (
                <div key={i} className={`w-12 h-12 rounded-md ${color}`}></div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-10 left-10 opacity-10">
            <div className="flex gap-2">
              {['bg-purple-500', 'bg-pink-500', 'bg-indigo-500'].map((color, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${color}`}></div>
              ))}
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Ready to transform your content creation?</h2>
                <p className="text-muted-foreground">
                  Join thousands of creators who use Creately to optimize their content, collaborate effectively, and build deeper emotional connections with their audience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                      Explore Your Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                        Start Your Creative Journey
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Secure authentication</span>
                </div>
                <div className="hidden sm:block bg-border/50 w-1 h-1 rounded-full"></div>
                <div>No credit card required</div>
                <div className="hidden sm:block bg-border/50 w-1 h-1 rounded-full"></div>
                <div>Cancel anytime</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-12 bg-background border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg mr-3">C</div>
                <span className="text-xl font-semibold">Creately</span>
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-end">
                <Link href="/features" className="hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/documentation" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0">
                &copy; {new Date().getFullYear()} Creately. All rights reserved.
              </p>
              
              <div className="flex gap-6 order-1 md:order-2">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-foreground">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Animation defined in landing-animations.css */}
    </>
  );
};

/**
 * Enhanced feature card component for the landing page
 */
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default LandingPage;