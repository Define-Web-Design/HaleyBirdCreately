
import React, { useState, useEffect } from 'react';
import LegalAcceptanceModal from '../legal/LegalAcceptanceModal';
import { useToast } from '@/hooks/use-toast';

/**
 * Higher Order Component that informs users about legal documents
 * but doesn't block access to features
 */
const withLegalVerification = (WrappedComponent: React.ComponentType<any>) => {
  const WithLegalVerification = (props: any) => {
    const { toast } = useToast();
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [hasSeenLegalInfo, setHasSeenLegalInfo] = useState(() => {
      try {
        return localStorage.getItem('hasSeenLegalInfo') === 'true';
      } catch (e) {
        return false;
      }
    });

    useEffect(() => {
      // Show legal info modal if user hasn't seen it yet
      // In a real app, we'd check the current path to identify feature pages
      // But for this simplified version, we'll just check if they've seen it
      if (!hasSeenLegalInfo) {
        setShowLegalModal(true);
      }
    }, [hasSeenLegalInfo]);

    // Handle legal modal close with skip option
    const handleLegalModalClose = () => {
      setShowLegalModal(false);
      
      // Remember that user has seen the legal info
      try {
        localStorage.setItem('hasSeenLegalInfo', 'true');
        setHasSeenLegalInfo(true);
      } catch (e) {
        console.error('Error saving legal info status:', e);
      }
    };

    // Listen for legal events
    useEffect(() => {
      const handleLegalEvent = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.action === 'accept' || customEvent.detail?.action === 'skip') {
          handleLegalModalClose();
          
          if (customEvent.detail?.action === 'accept') {
            toast({
              title: "Terms Accepted",
              description: "Thank you for accepting our terms.",
            });
          } else {
            toast({
              title: "Access Granted",
              description: "You can review the terms later in account settings.",
            });
          }
        }
      };
      
      document.addEventListener('legalAction', handleLegalEvent as EventListener);
      return () => {
        document.removeEventListener('legalAction', handleLegalEvent as EventListener);
      };
    }, [toast]);

    // Render legal modal if needed, but always render the component
    return (
      <>
        <WrappedComponent {...props} />
        
        {showLegalModal && (
          <LegalAcceptanceModal
            isOpen={showLegalModal}
            onClose={handleLegalModalClose}
            documentType="terms"
            version="1.0"
            requiredForFeature="feature access"
          />
        )}
      </>
    );
  };

  // Set display name for the HOC
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithLegalVerification.displayName = `withLegalVerification(${displayName})`;

  return WithLegalVerification;
};

export default withLegalVerification;
