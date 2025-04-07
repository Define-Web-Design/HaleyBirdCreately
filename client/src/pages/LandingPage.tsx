import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2, Palette, Layers, PaintBucket, HeartHandshake } from 'lucide-react';

/**
 * Enhanced Landing page component that shows content and redirects based on authentication status
 * - If authenticated, redirects to dashboard
 * - If not authenticated, shows landing content with sign-in option
 */
export const LandingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Only redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      // Short delay for better UX
      const redirectTimer = setTimeout(() => {
        setLocation('/dashboard');
      }, 700); // Small delay for smoother transition
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while determining auth state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Initializing Creately...</p>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-6 md:py-24 md:px-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Emotion-Driven Color Palettes
          </h1>
          <p className="text-lg md:text-xl mb-8 text-muted-foreground">
            Creately helps you generate intelligent, mood-based color palettes for your design projects using advanced color theory and AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Intelligent Color Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Palette className="h-8 w-8 text-primary" />}
              title="Mood-Based Palettes"
              description="Generate color palettes based on emotions and moods using AI-powered analysis."
            />
            <FeatureCard 
              icon={<PaintBucket className="h-8 w-8 text-primary" />}
              title="Color Theory Integration"
              description="Leverage advanced color theory principles for balanced and harmonious palettes."
            />
            <FeatureCard 
              icon={<Layers className="h-8 w-8 text-primary" />}
              title="Creative Mood Capsules"
              description="Save and organize palettes with associated moods for your creative projects."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 flex flex-col items-center justify-center text-center bg-gradient-to-r from-primary/10 to-accent/10">
        <HeartHandshake className="h-16 w-16 text-primary mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your design process?</h2>
        <p className="text-lg mb-8 max-w-2xl">
          Join designers who use Creately to create emotion-driven color palettes that resonate with audiences.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};