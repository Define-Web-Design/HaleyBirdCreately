
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Higher-order component that ensures the user has accepted legal terms
 * before accessing protected content
 */
export const withLegalVerification = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithLegalVerification: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const [verified, setVerified] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
      const checkLegalAcceptance = () => {
        // In a real implementation, this would check with the server
        // For now, we'll use localStorage as a simple stand-in
        const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
        const privacyAccepted = localStorage.getItem('privacyAccepted') === 'true';
        
        if (termsAccepted && privacyAccepted) {
          setVerified(true);
        } else {
          // Redirect to legal verification page with return URL
          const currentPath = window.location.pathname;
          navigate(`/legal-verification?redirect=${encodeURIComponent(currentPath)}`);
        }
        
        setLoading(false);
      };
      
      checkLegalAcceptance();
    }, [navigate]);
    
    if (loading) {
      // Return loading state
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Only render the component if verification passed
    return verified ? <WrappedComponent {...props} /> : null;
  };
  
  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithLegalVerification.displayName = `withLegalVerification(${displayName})`;
  
  return WithLegalVerification;
};

export default withLegalVerification;
