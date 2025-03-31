
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import TermsOfService from './TermsOfService';
import PrivacyNotice from './PrivacyNotice';

interface LegalAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (accepted: { terms: boolean; privacy: boolean }) => void;
  requiredDocuments: {
    terms: boolean;
    privacy: boolean;
  };
}

const LegalAcceptanceModal: React.FC<LegalAcceptanceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  requiredDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    requiredDocuments.terms ? 'terms' : 'privacy'
  );
  const [accepted, setAccepted] = useState<{
    terms: boolean;
    privacy: boolean;
  }>({
    terms: !requiredDocuments.terms,
    privacy: !requiredDocuments.privacy,
  });

  const handleCheckboxChange = (document: 'terms' | 'privacy') => {
    setAccepted({
      ...accepted,
      [document]: !accepted[document],
    });
  };

  const handleAccept = () => {
    onAccept(accepted);
  };

  const canAccept = 
    (!requiredDocuments.terms || accepted.terms) && 
    (!requiredDocuments.privacy || accepted.privacy);

  return (
    <Dialog open={isOpen} onOpenChange={() => canAccept && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Important Legal Documents
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please review and accept the following documents to continue using the platform.
          </p>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            {requiredDocuments.terms && (
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            )}
            {requiredDocuments.privacy && (
              <TabsTrigger value="privacy">Privacy Notice</TabsTrigger>
            )}
          </TabsList>
          
          <div className="overflow-y-auto flex-1 mt-4 pr-2">
            {requiredDocuments.terms && (
              <TabsContent value="terms" className="mt-0 h-full">
                <TermsOfService />
              </TabsContent>
            )}
            
            {requiredDocuments.privacy && (
              <TabsContent value="privacy" className="mt-0 h-full">
                <PrivacyNotice />
              </TabsContent>
            )}
          </div>
        </Tabs>

        <div className="pt-4 border-t space-y-4">
          {requiredDocuments.terms && (
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={accepted.terms} 
                onCheckedChange={() => handleCheckboxChange('terms')}
              />
              <label 
                htmlFor="terms"
                className="text-sm cursor-pointer"
              >
                I have read and agree to the Terms of Service
              </label>
            </div>
          )}
          
          {requiredDocuments.privacy && (
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="privacy" 
                checked={accepted.privacy} 
                onCheckedChange={() => handleCheckboxChange('privacy')}
              />
              <label 
                htmlFor="privacy"
                className="text-sm cursor-pointer"
              >
                I have read and agree to the Privacy Notice
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            className="mt-4"
          >
            Accept and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalAcceptanceModal;
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface LegalAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  title?: string;
  description?: string;
}

export const LegalAcceptanceModal: React.FC<LegalAcceptanceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  title = "Legal Terms Acceptance",
  description = "Please review and accept our terms and conditions"
}) => {
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  
  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 border rounded-md">
            <h3 className="text-lg font-medium">Terms of Service for AI Enhancement Tools</h3>
            
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>1. Intellectual Property Rights.</strong> All content generated through our AI enhancement tools remains your intellectual property with the following conditions:
              </p>
              
              <p className="text-muted-foreground">
                <strong>2. Ownership Verification.</strong> Each enhanced content includes embedded ownership information and digital watermarks to protect your intellectual property.
              </p>
              
              <p className="text-muted-foreground">
                <strong>3. Usage Restrictions.</strong> Enhanced content is provided for your personal or commercial use according to your account level. Redistribution or reselling of AI-generated content as standalone products is prohibited without proper attribution.
              </p>
              
              <p className="text-muted-foreground">
                <strong>4. Legal Protections.</strong> Our platform provides tools to help you protect your intellectual property and report unauthorized usage or copyright infringement.
              </p>
              
              <p className="text-muted-foreground">
                <strong>5. Prohibited Content.</strong> You agree not to use our AI tools to generate content that infringes on others' intellectual property rights, contains offensive material, or violates any laws.
              </p>
              
              <p className="text-muted-foreground">
                <strong>6. Privacy and Data.</strong> Content submitted for AI enhancement is processed according to our Privacy Policy, which includes data protection measures.
              </p>
            </div>
            
            <h3 className="text-lg font-medium mt-6">Privacy Notice</h3>
            
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>1. Data Usage.</strong> When using our AI enhancement tools, we collect and process your content for the purpose of providing the requested AI services. This includes temporary storage and analysis necessary for enhancement.
              </p>
              
              <p className="text-muted-foreground">
                <strong>2. Ownership Records.</strong> We maintain records of ownership for AI-enhanced content to help protect your intellectual property rights and provide verification services.
              </p>
              
              <p className="text-muted-foreground">
                <strong>3. Security Measures.</strong> We implement technical and organizational measures to secure your content and ownership information, including encryption and access controls.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the Terms of Service for AI Enhancement Tools
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
              />
              <Label htmlFor="privacy" className="text-sm">
                I understand and agree to the Privacy Notice
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleAccept} 
            disabled={!termsAccepted || !privacyAccepted}
          >
            Accept and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
