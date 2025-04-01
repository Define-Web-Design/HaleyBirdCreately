import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface LegalAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'terms' | 'privacy';
  version: string;
  requiredForFeature?: string;
}

export const LegalAcceptanceModal = ({
  isOpen,
  onClose,
  documentType,
  version,
  requiredForFeature = 'this feature'
}: LegalAcceptanceModalProps) => {
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const handleAccept = async () => {
    if (!hasAcknowledged) {
      toast({
        title: "Acknowledgment Required",
        description: "Please read and acknowledge the document first.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);

    try {
      await apiRequest('/api/public/legal/accept', {
        method: 'POST',
        body: JSON.stringify({
          documentType,
          version
        })
      });

      toast({
        title: "Accepted",
        description: documentType === 'terms' 
          ? "You've accepted the Terms of Service." 
          : "You've accepted the Privacy Policy."
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem recording your acceptance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const title = documentType === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const description = documentType === 'terms'
    ? 'Please review our Terms of Service before continuing.'
    : 'Please review our Privacy Policy before continuing.';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto border rounded-md p-4 my-4">
          {documentType === 'terms' ? (
            <div className="prose prose-sm dark:prose-invert">
              <h2>Terms of Service</h2>
              <p>Version: {version}</p>
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using our creative platform, you agree to be bound by these Terms of Service
                and all applicable laws and regulations. If you do not agree with any of these terms, you are
                prohibited from using or accessing this platform.
              </p>
              
              <h3>2. Use License</h3>
              <p>
                Permission is granted to temporarily use the platform for personal, non-commercial use only.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained in the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
              
              <h3>3. Content Creation and Ownership</h3>
              <p>
                When you create content using our AI tools, you retain ownership of the content you create,
                subject to any rights granted to us through these Terms. We reserve the right to use anonymized
                data to improve our services.
              </p>
              
              <h3>4. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account and password and for 
                restricting access to your computer. You agree to accept responsibility for all activities that
                occur under your account.
              </p>
              
              <h3>5. Limitation of Liability</h3>
              <p>
                In no event shall the platform, its operators, or suppliers be liable for any damages arising
                out of the use or inability to use the platform's materials, even if we have been notified of
                the possibility of such damage.
              </p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert">
              <h2>Privacy Policy</h2>
              <p>Version: {version}</p>
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Information Collection</h3>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the 
                platform, express interest in obtaining information about us or our products, or otherwise
                contact us.
              </p>
              
              <h3>2. Use of Your Information</h3>
              <p>
                We use personal information collected via our platform for business purposes described below:
              </p>
              <ul>
                <li>To provide and maintain our services</li>
                <li>To manage your account and provide you with customer support</li>
                <li>To improve and optimize our platform</li>
                <li>To monitor usage metrics and analyze trends</li>
                <li>To communicate with you about updates and new features</li>
              </ul>
              
              <h3>3. Data Retention</h3>
              <p>
                We will only keep your personal information for as long as it is necessary for the purposes
                set out in this privacy policy, unless a longer retention period is required or permitted by law.
              </p>
              
              <h3>4. AI Generated Content</h3>
              <p>
                When you use our AI features to generate content, we may store this content and related metadata
                to improve our services. All stored content is protected according to our security standards.
              </p>
              
              <h3>5. Your Rights</h3>
              <p>
                You have the right to access, correct, update, or request deletion of your personal information.
                You can object to processing of your personal information, ask us to restrict processing, or
                request portability of your information.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="terms" 
            checked={hasAcknowledged}
            onCheckedChange={(checked) => setHasAcknowledged(!!checked)}
          />
          <label 
            htmlFor="terms" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the {title}
          </label>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={isAccepting || !hasAcknowledged}>
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalAcceptanceModal;