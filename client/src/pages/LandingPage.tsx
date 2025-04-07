import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Landing page component that redirects based on authentication status
 * - If authenticated, redirects to dashboard
 * - If not authenticated, redirects to login
 */
export const LandingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Only redirect when authentication state is determined
    if (!isLoading) {
      // Short delay for better UX
      const redirectTimer = setTimeout(() => {
        if (isAuthenticated) {
          setLocation('/dashboard');
        } else {
          setLocation('/login');
        }
      }, 700); // Small delay for smoother transition
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while determining auth state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-lg">Initializing Creately...</p>
    </div>
  );
};