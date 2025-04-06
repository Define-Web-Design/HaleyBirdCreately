import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface CookieConsentProps {
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

function CookieConsent({ privacyPolicyUrl, termsOfServiceUrl }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has previously consented
    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleReject = () => {
    // Store minimal consent
    localStorage.setItem('cookieConsent', 'minimal');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-md z-50 border-t border-border flex items-center justify-between">
      <p className="text-xs text-muted-foreground flex-1 mr-2">
        <span className="font-medium text-foreground">Cookies</span>
        {" "}used to improve experience.
        {(privacyPolicyUrl || termsOfServiceUrl) && (
          <span className="ml-1 whitespace-nowrap">
            {privacyPolicyUrl && (
              <a href={privacyPolicyUrl} className="text-primary hover:underline text-xs">Privacy</a>
            )}
            {privacyPolicyUrl && termsOfServiceUrl && (
              <span className="mx-1">•</span>
            )}
            {termsOfServiceUrl && (
              <a href={termsOfServiceUrl} className="text-primary hover:underline text-xs">Terms</a>
            )}
          </span>
        )}
      </p>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={handleReject} className="h-6 px-2 text-xs">
          Reject
        </Button>
        <Button variant="default" size="sm" onClick={handleAccept} className="h-6 px-2 text-xs">
          Accept
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close" className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default CookieConsent;