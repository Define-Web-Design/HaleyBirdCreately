
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
