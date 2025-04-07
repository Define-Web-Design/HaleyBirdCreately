import { ReactNode, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [match] = useRoute(redirectPath);

  useEffect(() => {
    // If authentication check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated && !match) {
      // Redirect to login
      setLocation(redirectPath);
    }
    
    // If roles are specified and user doesn't have required role
    if (!isLoading && isAuthenticated && roles.length > 0 && user) {
      const hasRequiredRole = roles.includes(user.role);
      if (!hasRequiredRole) {
        // Redirect to unauthorized page or dashboard
        setLocation('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, match, redirectPath, roles, setLocation, user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  // If not authenticated, render nothing (will redirect in useEffect)
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