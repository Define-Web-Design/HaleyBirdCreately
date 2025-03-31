
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TermsOfServiceProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ 
  onAccept, 
  onDecline 
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8 border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl font-bold">Terms of Service</CardTitle>
        <CardDescription>
          Please read these terms carefully before using the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto p-6 text-sm space-y-4">
        <div className="space-y-4">
          <section id="ownership-rights">
            <h3 className="text-lg font-semibold">1. Ownership and Intellectual Property</h3>
            <p>
              All content, features, functionality, design elements, code, frameworks, algorithms, and assets within this platform 
              ("the Content") are the exclusive property of the platform owner and are protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mt-2">
              By accessing or using this platform, you acknowledge and agree that you do not acquire any ownership rights in any of 
              the Content. No part of the platform or its Content may be reproduced, duplicated, copied, sold, resold, reverse engineered, 
              decompiled, or exploited for any commercial purpose without the express written consent of the platform owner.
            </p>
          </section>

          <section id="prohibited-uses">
            <h3 className="text-lg font-semibold">2. Prohibited Uses</h3>
            <p>
              You are strictly prohibited from:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Copying, modifying, distributing, or creating derivative works based on the platform's Content</li>
              <li>Reverse engineering, decompiling, or attempting to extract the source code of the platform</li>
              <li>Removing any copyright, trademark, or other proprietary notices from the platform</li>
              <li>Using the platform or its Content for any commercial purpose without authorization</li>
              <li>Data mining, scraping, or collection of information from the platform through automated means</li>
              <li>Attempting to gain unauthorized access to restricted areas of the platform</li>
              <li>Redistributing, repackaging, or reselling any part of the platform or its Content</li>
            </ul>
          </section>

          <section id="usage-restrictions">
            <h3 className="text-lg font-semibold">3. Usage Restrictions</h3>
            <p>
              The platform is provided for personal, non-commercial use only. Access is granted on a limited, non-exclusive, 
              non-transferable, and revocable basis. Your use of the platform is subject to monitoring for compliance with these terms.
            </p>
            <p className="mt-2">
              Any unauthorized use of the platform may result in immediate termination of access, pursuit of legal remedies, 
              and/or reporting to law enforcement authorities.
            </p>
          </section>

          <section id="enforcement">
            <h3 className="text-lg font-semibold">4. Enforcement and Penalties</h3>
            <p>
              Violations of these Terms of Service may result in:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Immediate termination of your access to the platform</li>
              <li>Legal action seeking injunctive relief, damages, and attorney's fees</li>
              <li>DMCA takedown notices and copyright infringement claims</li>
              <li>Statutory damages up to $150,000 per work for willful copyright infringement</li>
              <li>Reporting of criminal violations to appropriate law enforcement authorities</li>
            </ul>
          </section>

          <section id="disclaimer">
            <h3 className="text-lg font-semibold">5. Disclaimer and Limitation of Liability</h3>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, 
              THE PLATFORM OWNER DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES 
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-2">
              IN NO EVENT SHALL THE PLATFORM OWNER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
            </p>
          </section>

          <section id="modifications">
            <h3 className="text-lg font-semibold">6. Modifications to Terms</h3>
            <p>
              The platform owner reserves the right to modify these Terms of Service at any time without prior notice. 
              Continued use of the platform after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </section>

          <section id="agreement">
            <h3 className="text-lg font-semibold">7. Acceptance of Terms</h3>
            <p>
              By accessing or using the platform, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, you must not access or use the platform.
            </p>
          </section>
        </div>
      </CardContent>
      <CardFooter className="bg-primary/5 flex justify-between p-6">
        <Button variant="outline" onClick={onDecline}>
          Decline
        </Button>
        <Button onClick={onAccept}>
          I Accept These Terms
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TermsOfService;
