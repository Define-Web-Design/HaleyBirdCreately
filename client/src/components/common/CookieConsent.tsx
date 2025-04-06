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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-4 shadow-lg z-50 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 pr-8">
          <h3 className="text-lg font-semibold mb-1 dark:text-white">Cookie Consent</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            We use cookies to enhance your experience on our site, analyze site usage, and assist in our marketing efforts. 
            By clicking "Accept", you agree to the storing of cookies on your device.
            {(privacyPolicyUrl || termsOfServiceUrl) && (
              <span className="ml-1">
                {privacyPolicyUrl && (
                  <a href={privacyPolicyUrl} className="text-primary hover:underline ml-1">Privacy Policy</a>
                )}
                {privacyPolicyUrl && termsOfServiceUrl && (
                  <span className="mx-1">•</span>
                )}
                {termsOfServiceUrl && (
                  <a href={termsOfServiceUrl} className="text-primary hover:underline">Terms of Service</a>
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReject}>
            Reject Non-Essential
          </Button>
          <Button variant="default" onClick={handleAccept}>
            Accept All
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;