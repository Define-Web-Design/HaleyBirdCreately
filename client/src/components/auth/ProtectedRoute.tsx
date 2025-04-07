import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 * Protects routes that require authentication or specific roles
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full p-8 flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-3/4 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-5/6 rounded-lg" />
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles.length > 0 && (!user || !requiredRoles.includes(user.role))) {
    return <Redirect to="/unauthorized" />;
  }

  // Render the protected content
  return <>{children}</>;
}

/**
 * AdminRoute component
 * Protects routes that require admin privileges
 */
export function AdminRoute({ children, redirectTo = '/unauthorized' }: Omit<ProtectedRouteProps, 'requireAuth' | 'requiredRoles'>) {
  return (
    <ProtectedRoute requireAuth={true} requiredRoles={['admin']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * WithRole component
 * Protects routes that require specific roles
 */
export function WithRole({ 
  children, 
  roles, 
  redirectTo = '/unauthorized' 
}: Omit<ProtectedRouteProps, 'requireAuth' | 'requiredRoles'> & { roles: string[] }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRoles={roles} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}