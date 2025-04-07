import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check if the user has a specific role
 * @param requiredRoles Array of roles to check against
 * @returns Object containing authentication status
 */
export const useAuthStatus = (requiredRoles: string[] = []) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    // If no role is required, any authenticated user passes
    if (requiredRoles.length === 0) {
      setHasRequiredRole(true);
      return;
    }

    // If user exists, check if they have any of the required roles
    if (user) {
      const roleMatch = requiredRoles.includes(user.role);
      setHasRequiredRole(roleMatch);
    } else {
      setHasRequiredRole(false);
    }
  }, [user, requiredRoles]);

  return {
    isLoading,
    isAuthenticated,
    hasRequiredRole,
    // Convenience computed property
    canAccess: isAuthenticated && (requiredRoles.length === 0 || hasRequiredRole)
  };
};

export default useAuthStatus;