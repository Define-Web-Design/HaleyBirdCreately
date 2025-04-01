import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'wouter';

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HelmetProvider>
        <Helmet>
          <title>Legal Terms | Creately</title>
          <meta name="description" content="Legal terms and conditions for using Creately" />
        </Helmet>
      </HelmetProvider>

      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to Creately ("the Platform"). By accessing or using our services, you agree to be bound by these Terms and Conditions. 
            Please read them carefully. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Creative Symbiosis Framework</h2>
          <p>
            Creately provides the Creative Symbiosis Framework, a system designed to enhance user experience through engagement tracking,
            evolution points, and unlockable capabilities. Users progress through tiers (Starter, Growing, Established, Advanced, Expert)
            by engaging with the platform.
          </p>
          <p className="mt-2">
            <strong>Evolution Points:</strong> Points earned through platform engagement that determine your tier level.
          </p>
          <p className="mt-2">
            <strong>Creative Energy:</strong> A renewable resource that regenerates over time and is used for various platform actions.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property Rights</h2>
          <p>
            <strong>3.1 Platform Content:</strong> All content provided on the platform, including but not limited to text, graphics, logos,
            icons, images, audio clips, and software, is the property of Creately or its content suppliers and is protected by international
            copyright laws.
          </p>
          <p className="mt-2">
            <strong>3.2 User-Generated Content:</strong> You retain ownership of content you create and upload to the platform. However, by 
            uploading content, you grant Creately a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, and 
            distribute your content for the purpose of providing and promoting the platform's services.
          </p>
          <p className="mt-2">
            <strong>3.3 AI-Generated Content:</strong> Content created through AI tools on the platform falls under a shared license model. 
            You may use AI-generated content for personal and commercial purposes, but you may not claim exclusive ownership or copyright 
            of raw AI outputs without significant modification or creative input.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
          <p>
            Users must not:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the platform to violate any applicable laws or regulations</li>
            <li>Infringe upon the intellectual property rights of others</li>
            <li>Upload or share content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
            <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
            <li>Use automated scripts to collect information or interact with the platform</li>
            <li>Interfere with or disrupt the platform's functionality</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
          <p>
            <strong>5.1 Subscription Plans:</strong> Creately offers various subscription plans, each providing different levels of access and features.
          </p>
          <p className="mt-2">
            <strong>5.2 Billing Cycle:</strong> Subscriptions are billed on a recurring basis (monthly or annually) until cancelled.
          </p>
          <p className="mt-2">
            <strong>5.3 Cancellation:</strong> You may cancel your subscription at any time. Upon cancellation, you will continue to have access to 
            premium features until the end of your current billing period.
          </p>
          <p className="mt-2">
            <strong>5.4 Refunds:</strong> Refund policies vary by subscription type and are described at the time of purchase.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Creately shall not be liable for any indirect, incidental, special, consequential, or 
            punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
            or other intangible losses resulting from your access to or use of or inability to access or use the platform.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p>
            Creately reserves the right to modify these terms at any time. We will provide notice of significant changes by updating the 
            date at the top of these terms and/or by sending you an email notification. Your continued use of the platform after such 
            modifications constitutes your acceptance of the updated terms.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p>
            If you have any questions or concerns about these Terms and Conditions, please contact us at:
          </p>
          <p className="mt-2 font-medium">legal@creately.com</p>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <Link href="/" className="text-primary hover:underline">
          Return to Home
        </Link>
        <Link href="/privacy" className="text-primary hover:underline">
          View Privacy Policy
        </Link>
      </div>
    </div>
  );
}