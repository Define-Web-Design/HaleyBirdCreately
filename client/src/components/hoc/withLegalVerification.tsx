
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import LegalAcceptanceModal from '../legal/LegalAcceptanceModal';

/**
 * Higher Order Component that ensures users have accepted the required legal documents
 * before accessing the wrapped component
 */
const withLegalVerification = (WrappedComponent: React.ComponentType<any>) => {
  const WithLegalVerification = (props: any) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalCheckComplete, setLegalCheckComplete] = useState(false);
    const [acceptedDocs, setAcceptedDocs] = useState<{
      terms: boolean;
      privacy: boolean;
    }>({
      terms: false,
      privacy: false,
    });

    useEffect(() => {
      // Skip verification for public routes or when not logged in yet
      const isPublicRoute = ['/login', '/register', '/'].includes(router.pathname);
      if (isPublicRoute || status !== 'authenticated') {
        setLegalCheckComplete(true);
        return;
      }

      // Check if user has accepted the latest terms and privacy policy
      const checkLegalAcceptance = async () => {
        try {
          const response = await fetch('/api/legal/status');
          const data = await response.json();

          // If user has accepted all required documents
          if (data.termsAccepted && data.privacyAccepted) {
            setAcceptedDocs({
              terms: true,
              privacy: true,
            });
            setLegalCheckComplete(true);
          } else {
            // Show modal if any document hasn't been accepted
            setAcceptedDocs({
              terms: data.termsAccepted,
              privacy: data.privacyAccepted,
            });
            setShowLegalModal(true);
          }
        } catch (error) {
          console.error('Error checking legal acceptance status:', error);
          // On error, proceed with caution (could be configured to block instead)
          setLegalCheckComplete(true);
        }
      };

      checkLegalAcceptance();
    }, [router.pathname, status]);

    const handleAcceptLegal = async (documents: { terms: boolean; privacy: boolean }) => {
      try {
        // Record acceptance in the backend
        const response = await fetch('/api/legal/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documents),
        });

        if (response.ok) {
          setAcceptedDocs({
            terms: acceptedDocs.terms || documents.terms,
            privacy: acceptedDocs.privacy || documents.privacy,
          });

          // Only close modal and proceed if all documents are accepted
          if (
            (acceptedDocs.terms || documents.terms) &&
            (acceptedDocs.privacy || documents.privacy)
          ) {
            setShowLegalModal(false);
            setLegalCheckComplete(true);
          }
        } else {
          console.error('Failed to record legal acceptance');
        }
      } catch (error) {
        console.error('Error recording legal acceptance:', error);
      }
    };

    if (!legalCheckComplete) {
      // Show loading state while checking
      return (
        <>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="spinner animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4">Verifying legal requirements...</p>
            </div>
          </div>
          
          {showLegalModal && (
            <LegalAcceptanceModal
              isOpen={showLegalModal}
              onClose={() => {}} // Prevent closing without acceptance
              onAccept={handleAcceptLegal}
              requiredDocuments={{
                terms: !acceptedDocs.terms,
                privacy: !acceptedDocs.privacy,
              }}
            />
          )}
        </>
      );
    }

    // Render the wrapped component once verification is complete
    return <WrappedComponent {...props} />;
  };

  // Set display name for the HOC
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithLegalVerification.displayName = `withLegalVerification(${displayName})`;

  return WithLegalVerification;
};

export default withLegalVerification;
