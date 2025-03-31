import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import withLegalVerification from '@/components/hoc/withLegalVerification';

function LegalVerificationPage() {
  const [assetId, setAssetId] = useState('');
  const [verificationResult, setVerificationResult] = useState<null | {
    valid: boolean;
    assetDetails?: {
      assetId: string;
      assetType: string;
      ownerInfo: string;
      verificationStatus: boolean;
      lastVerifiedAt: string;
    };
    message: string;
  }>(null);

  const handleVerification = async () => {
    if (!assetId.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/security/verify-asset?assetId=${encodeURIComponent(assetId)}`);
      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        message: 'An error occurred during verification. Please try again.'
      });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Ownership Verification</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Verify the ownership and integrity of any asset within our platform
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Asset Verification</CardTitle>
            <CardDescription>
              Enter the Asset ID to verify ownership and authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter Asset ID"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleVerification}>Verify</Button>
            </div>
          </CardContent>
        </Card>

        {verificationResult && (
          <Card className={`mt-6 ${
            verificationResult.valid 
              ? 'border-green-500 dark:border-green-700' 
              : 'border-red-500 dark:border-red-700'
          }`}>
            <CardHeader>
              <CardTitle className={
                verificationResult.valid 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }>
                {verificationResult.valid ? 'Verification Successful' : 'Verification Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{verificationResult.message}</p>

              {verificationResult.assetDetails && (
                <div className="mt-4 space-y-2">
                  <p><strong>Asset ID:</strong> {verificationResult.assetDetails.assetId}</p>
                  <p><strong>Asset Type:</strong> {verificationResult.assetDetails.assetType}</p>
                  <p><strong>Owner:</strong> {verificationResult.assetDetails.ownerInfo}</p>
                  <p><strong>Last Verified:</strong> {new Date(verificationResult.assetDetails.lastVerifiedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              All platform assets contain embedded ownership information and are regularly monitored for unauthorized usage.
            </CardFooter>
          </Card>
        )}

        <Separator className="my-8" />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About Our Verification System</h2>
          <p>
            Our platform employs advanced digital watermarking and ownership verification technologies to ensure 
            the integrity and authenticity of all content. Each asset in our system contains:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Unique cryptographic signatures that validate ownership</li>
            <li>Embedded metadata that tracks the asset's origin and permissions</li>
            <li>Tamper-proof watermarks that can be verified but not easily removed</li>
          </ul>

          <p className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <strong>IMPORTANT:</strong> Unauthorized reproduction, distribution, or use of any platform 
            assets constitutes copyright infringement and is subject to legal action. All assets are 
            continuously monitored for unauthorized usage across the internet.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withLegalVerification(LegalVerificationPage);