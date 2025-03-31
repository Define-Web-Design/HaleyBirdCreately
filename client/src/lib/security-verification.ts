
import { securityStore } from './stores/securityStore';

/**
 * Content verification utility to validate ownership and integrity
 */
export const verifyContentOwnership = async (contentId: number): Promise<{
  isVerified: boolean;
  ownerInfo?: {
    userId: number;
    timestamp: string;
  };
  verificationMessage: string;
}> => {
  try {
    const response = await fetch(`/api/security/verify-content-ownership?contentId=${contentId}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        isVerified: data.verified,
        ownerInfo: data.ownerInfo,
        verificationMessage: 'Content ownership verified successfully'
      };
    }
    
    return {
      isVerified: false,
      verificationMessage: data.message || 'Verification failed'
    };
  } catch (error) {
    console.error('Content verification error:', error);
    return {
      isVerified: false,
      verificationMessage: 'Error during verification process'
    };
  }
};

/**
 * Apply digital watermarking to content
 */
export const applyDigitalWatermark = (content: string, ownerId: number): string => {
  const timestamp = Date.now();
  const watermarkSignature = `/* Protected: ${ownerId}-${timestamp} */`;
  
  return `${watermarkSignature}\n${content}`;
};

/**
 * Verify content integrity
 */
export const verifyContentIntegrity = async (contentId: number): Promise<boolean> => {
  try {
    // Record verification attempt for security logging
    securityStore.logVerificationAttempt(contentId);
    
    const response = await fetch(`/api/security/verify-asset?assetId=${contentId}`);
    const data = await response.json();
    
    return data.valid === true;
  } catch (error) {
    console.error('Integrity verification error:', error);
    return false;
  }
};
