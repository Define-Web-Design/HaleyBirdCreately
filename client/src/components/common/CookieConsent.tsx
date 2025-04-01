import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookieConsentProps {
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  privacyPolicyUrl = '/privacy-policy',
  termsOfServiceUrl = '/terms-of-service',
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented to cookies
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem('cookieConsent', 'all');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setVisible(false);
    
    // Optional: Set cookies or trigger analytics here
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: { consent: 'all' } 
    }));
  };

  const acceptEssentialCookies = () => {
    localStorage.setItem('cookieConsent', 'essential');
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setVisible(false);
    
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: { consent: 'essential' } 
    }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 pr-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We use cookies to enhance your experience on our site. By clicking "Accept All", you agree to our use of cookies as described in our{' '}
              <a href={privacyPolicyUrl} className="text-primary hover:underline">
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href={termsOfServiceUrl} className="text-primary hover:underline">
                Terms of Service
              </a>.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptEssentialCookies}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAllCookies}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              Accept All
            </button>
          </div>
          
          <button
            onClick={acceptEssentialCookies}
            className="absolute top-4 right-4 md:relative md:top-auto md:right-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close cookie consent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;