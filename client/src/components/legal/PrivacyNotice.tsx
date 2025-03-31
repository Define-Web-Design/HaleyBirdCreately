
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

interface PrivacyNoticeProps {
  onAccept: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ 
  onAccept 
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8 border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl font-bold">Privacy Notice & Intellectual Property Protection</CardTitle>
        <CardDescription>
          Information about how we protect your data and our intellectual property
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto p-6 text-sm space-y-4">
        <div className="space-y-4">
          <section id="ownership-statement">
            <h3 className="text-lg font-semibold">1. Ownership Statement</h3>
            <p>
              All content, functionality, and intellectual property appearing on or contained within this platform, 
              including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data 
              compilations, software, algorithms, frameworks, and code, are the exclusive property of the platform owner 
              and are protected by international copyright, trademark, patent, and other intellectual property laws.
            </p>
          </section>

          <section id="intellectual-property-rights">
            <h3 className="text-lg font-semibold">2. Intellectual Property Rights</h3>
            <p>
              The platform contains proprietary technology, inventions, methods, processes, and creative works that are 
              subject to intellectual property protection. These include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Copyrighted material including visual elements, text, and code</li>
              <li>Patented or patent-pending technologies and methods</li>
              <li>Proprietary algorithms and data processing techniques</li>
              <li>Trade secrets and confidential business information</li>
              <li>Trademarks, service marks, and trade dress</li>
            </ul>
            <p className="mt-2">
              Unauthorized use, reproduction, or distribution of any of these protected elements is strictly prohibited 
              and will be vigorously prosecuted to the full extent of the law.
            </p>
          </section>

          <section id="user-responsibilities">
            <h3 className="text-lg font-semibold">3. User Responsibilities</h3>
            <p>
              As a user of this platform, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You will not attempt to copy, modify, reverse engineer, or extract any part of the platform</li>
              <li>You will not distribute, publish, or share any content from the platform without explicit permission</li>
              <li>You will report any suspected intellectual property violations to the platform owner</li>
              <li>You will respect all copyright notices, watermarks, and other proprietary markings</li>
              <li>You understand that your access to the platform is monitored for compliance with these terms</li>
            </ul>
          </section>

          <section id="watermarking-notice">
            <h3 className="text-lg font-semibold">4. Digital Watermarking and Fingerprinting</h3>
            <p>
              Please be advised that all content within this platform is digitally watermarked and fingerprinted with 
              ownership information. These technological protection measures:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Are embedded invisibly within all digital assets</li>
              <li>Remain intact even if the content is captured, downloaded, or modified</li>
              <li>Allow for identification of the source of unauthorized copies</li>
              <li>Are regularly verified through automated processes</li>
            </ul>
            <p className="mt-2">
              Attempts to remove or circumvent these protective measures is prohibited and may constitute a violation of 
              the Digital Millennium Copyright Act and similar laws in other jurisdictions.
            </p>
          </section>

          <section id="monitoring-notice">
            <h3 className="text-lg font-semibold">5. Access Monitoring and Usage Tracking</h3>
            <p>
              For security purposes and to protect our intellectual property, this platform employs monitoring technologies that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Track and log all access to platform content and functionality</li>
              <li>Detect patterns consistent with unauthorized scraping or copying</li>
              <li>Monitor for unusual access patterns or potential security breaches</li>
              <li>Generate alerts for suspicious activity</li>
            </ul>
            <p className="mt-2">
              This monitoring is conducted solely for the protection of our intellectual property and platform security, 
              and all data collected is handled in accordance with our privacy practices.
            </p>
          </section>

          <section id="enforcement-actions">
            <h3 className="text-lg font-semibold">6. Enforcement Actions</h3>
            <p>
              Violations of our intellectual property rights may result in:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Immediate termination of access to the platform</li>
              <li>Legal action seeking injunctive relief and damages</li>
              <li>DMCA takedown notices and copyright infringement claims</li>
              <li>Reporting to law enforcement authorities</li>
            </ul>
          </section>

          <section id="acceptance">
            <h3 className="text-lg font-semibold">7. Acceptance</h3>
            <p>
              By accessing or using this platform, you acknowledge that you have read and understood this Privacy Notice 
              and Intellectual Property Protection statement, and you agree to abide by its terms. If you do not agree 
              to these terms, you must cease all use of the platform immediately.
            </p>
          </section>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-center font-medium">
              © 2023 All Rights Reserved. Unauthorized reproduction, distribution, or use is strictly prohibited and may result in legal action.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-primary/5 flex justify-end p-6">
        <Button onClick={onAccept}>
          I Acknowledge and Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrivacyNotice;
