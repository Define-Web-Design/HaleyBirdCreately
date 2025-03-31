
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TermsOfService from '@/components/legal/TermsOfService';
import PrivacyNotice from '@/components/legal/PrivacyNotice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export default function LegalVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('terms');
  
  // The route to redirect to after acceptance
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';
  
  // Check if user has already accepted the terms
  useEffect(() => {
    const checkLegalAcceptance = async () => {
      try {
        // In a real implementation, this would check if the user has already accepted
        // the current versions of the legal documents
        const termsAcceptanceStatus = localStorage.getItem('termsAccepted');
        const privacyAcceptanceStatus = localStorage.getItem('privacyAccepted');
        
        if (termsAcceptanceStatus && privacyAcceptanceStatus) {
          // If already accepted, redirect to the intended destination
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('Error checking legal acceptance:', error);
      }
    };
    
    checkLegalAcceptance();
  }, [navigate, redirectPath]);
  
  const handleTermsAccept = async () => {
    try {
      // Record terms acceptance
      await fetch('/api/public/legal/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'terms',
          version: '1.0.0',
        }),
      });
      
      // Update local state
      setTermsAccepted(true);
      localStorage.setItem('termsAccepted', 'true');
      
      // Switch to privacy tab if not yet accepted
      if (!privacyAccepted) {
        setActiveTab('privacy');
      } else {
        // If both accepted, redirect
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
    }
  };
  
  const handlePrivacyAccept = async () => {
    try {
      // Record privacy acceptance
      await fetch('/api/public/legal/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: 'privacy',
          version: '1.0.0',
        }),
      });
      
      // Update local state
      setPrivacyAccepted(true);
      localStorage.setItem('privacyAccepted', 'true');
      
      // If terms also accepted, redirect
      if (termsAccepted) {
        navigate(redirectPath);
      } else {
        // Switch to terms tab if not yet accepted
        setActiveTab('terms');
      }
    } catch (error) {
      console.error('Error accepting privacy notice:', error);
    }
  };
  
  const handleTermsDecline = () => {
    // Show confirmation and then redirect to a public page
    if (confirm('You must accept the Terms of Service to continue. Do you want to leave the platform?')) {
      window.location.href = 'https://example.com';
    }
  };
  
  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Legal Verification Required</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Before you can access the platform, you must review and accept our Terms of Service 
          and Privacy Notice & Intellectual Property Protection statement.
        </p>
      </div>
      
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-amber-500">Important Notice</AlertTitle>
        <AlertDescription>
          All content, functionality, and intellectual property within this platform are protected by copyright 
          and other laws. Unauthorized use is strictly prohibited and may result in legal action.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="terms" className="text-base py-3">
            Terms of Service
            {termsAccepted && <span className="ml-2 text-green-500">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-base py-3">
            Privacy & IP Protection
            {privacyAccepted && <span className="ml-2 text-green-500">✓</span>}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="terms">
          <TermsOfService onAccept={handleTermsAccept} onDecline={handleTermsDecline} />
        </TabsContent>
        
        <TabsContent value="privacy">
          <PrivacyNotice onAccept={handlePrivacyAccept} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
