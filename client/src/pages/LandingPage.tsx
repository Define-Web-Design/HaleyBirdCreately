import { Link } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/ThemeContext';

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
        <div 
          className="relative flex flex-col items-center justify-center px-4 py-16 md:py-32"
          style={{ backgroundColor: theme || '#F2994A' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Welcome to Creately
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              AI-powered creative platform generating intelligent, emotion-driven color palettes for design professionals
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                title="AI-Driven Color Generation" 
                description="Create intelligent, emotion-driven color palettes with our advanced algorithms."
              />
              <FeatureCard 
                title="Mood-Based Palette Creation" 
                description="Generate palettes that perfectly match specific moods and emotions."
              />
              <FeatureCard 
                title="Enhanced Authentication" 
                description="Secure and streamlined user authentication system."
              />
              <FeatureCard 
                title="Responsive Design" 
                description="Beautiful interface that works on all devices and screen sizes."
              />
              <FeatureCard 
                title="Color Theory Integration" 
                description="Incorporates principles of color theory for professional results."
              />
              <FeatureCard 
                title="Accessibility Features" 
                description="Designed with accessibility in mind for all users."
              />
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join Creately today and unlock the power of AI-driven color palettes for your design projects.
            </p>
            
            {isAuthenticated ? (
              <Link href="/color-palettes">
                <Button size="lg">
                  Start Creating Palettes
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">
                  Create Your Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Simple Footer */}
        <footer className="py-8 bg-background border-t">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Creately. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

/**
 * Feature card component for the landing page
 */
const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default LandingPage;