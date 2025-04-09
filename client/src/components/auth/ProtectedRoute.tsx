import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield, Loader2 } from 'lucide-react';
import { isDevelopmentAutoLogin, performDevAutoLogin, isAlreadyAutoLoggedIn } from '@/lib/devBypass';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // Optional roles for role-based access control
  redirectPath?: string; // Optional redirect path, defaults to /login
}

/**
 * A route wrapper that protects routes requiring authentication
 * If the user is not authenticated, they are redirected to the login page
 * Optionally supports role-based access control
 */
export const ProtectedRoute = ({
  children,
  roles = [],
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, login } = useAuth();
  const [, setLocation] = useLocation();
  const [match] = useRoute(redirectPath);
  // State to track if we should show an auth prompt before redirect
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  // State to track if auto-login attempt has been made
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Check if development auto-login is explicitly enabled via environment variable
  useEffect(() => {
    // Auto-login is now disabled by default and requires explicit opt-in
    if (isDevelopmentAutoLogin() && !isLoading && !isAuthenticated && !autoLoginAttempted) {
      console.log('🔑 Testing auto-login explicitly enabled via environment variable...');
      
      try {
        // Check if already auto-logged in to prevent unnecessary reloads
        if (!isAlreadyAutoLoggedIn()) {
          // Set up mock authentication only if explicitly enabled
          performDevAutoLogin();
          
          // Mark as attempted to prevent infinite loops
          setAutoLoginAttempted(true);
          
          // Don't force page reload, let the auth context handle it
        } else {
          // Already auto-logged in, just mark as attempted
          setAutoLoginAttempted(true);
        }
      } catch (error) {
        console.error('Testing auto-login error:', error);
        setAutoLoginAttempted(true);
      }
    }
  }, [isLoading, isAuthenticated, autoLoginAttempted]);

  // Regular authentication flow for redirecting unauthenticated users
  useEffect(() => {
    // Skip if auto-login is enabled and hasn't been attempted yet
    if (isDevelopmentAutoLogin() && !autoLoginAttempted) {
      return;
    }
    
    // If authentication check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated && !match) {
      // Show auth prompt first before redirecting
      setShowAuthPrompt(true);
      
      // Set a timer to auto-redirect after a few seconds if user doesn't click
      const timer = setTimeout(() => {
        setLocation(redirectPath);
      }, 3000); // 3 seconds
      
      return () => clearTimeout(timer);
    }
    
    // If roles are specified and user doesn't have required role
    if (!isLoading && isAuthenticated && roles.length > 0 && user) {
      const hasRequiredRole = roles.includes(user.role);
      if (!hasRequiredRole) {
        // Redirect to unauthorized page or dashboard
        setLocation('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, match, redirectPath, roles, setLocation, user, autoLoginAttempted]);

  // Handle immediate login click
  const handleLoginClick = () => {
    setLocation(redirectPath);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  // If not authenticated, show auth prompt
  if (!isAuthenticated && showAuthPrompt) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You need to sign in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You'll be redirected to the login page in a few seconds
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleLoginClick} className="w-full">
              Sign In Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If not authenticated and prompt not shown, render nothing (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If roles are specified and user doesn't have required role
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return null;
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
};

export default ProtectedRoute;