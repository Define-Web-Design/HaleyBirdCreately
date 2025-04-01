import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'wouter';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HelmetProvider>
        <Helmet>
          <title>Privacy Policy | Creately</title>
          <meta name="description" content="Privacy policy for Creately users" />
        </Helmet>
      </HelmetProvider>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="mb-8">
          <p className="text-muted-foreground">
            Last updated: April 1, 2025
          </p>
          <p className="mt-4">
            At Creately, we take your privacy seriously. This Privacy Policy describes how we collect, use, process, and disclose your 
            information, including personal information, in conjunction with your access to and use of the Creately platform.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            <strong>1.1 Information You Provide:</strong> We collect information you provide when you create an account, 
            fill out forms, or interact with our platform, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Account information (name, email address, password)</li>
            <li>Profile information (profile picture, bio, location)</li>
            <li>Content you create, upload, or store using our services</li>
            <li>Communications with us or other users</li>
            <li>Payment information when you purchase subscriptions</li>
          </ul>
          
          <p className="mt-4">
            <strong>1.2 Information We Collect Automatically:</strong> When you use our platform, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Usage data (features used, time spent, actions taken)</li>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Log data (pages visited, links clicked, referring/exit pages)</li>
            <li>Cookies and similar technologies</li>
          </ul>
          
          <p className="mt-4">
            <strong>1.3 Creative Symbiosis Framework Data:</strong> Our platform tracks your engagement and interactions to power the Creative Symbiosis 
            Framework. This includes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Evolution Points earned through platform engagement</li>
            <li>Creative Energy points usage and regeneration</li>
            <li>Unlocked capabilities and tier progression</li>
            <li>Creative history and content patterns</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Personalize your experience and content</li>
            <li>Communicate with you about updates, features, and offers</li>
            <li>Power the Creative Symbiosis Framework, including tier progression</li>
            <li>Analyze usage patterns and improve our platform</li>
            <li>Detect, prevent, and address technical issues or security breaches</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. AI Training and Content Analysis</h2>
          <p>
            <strong>3.1 AI-Driven Features:</strong> Creately uses artificial intelligence to power various features like the Mood-Based Color 
            Palette Generator and AI-Driven Mood Capsules. These features analyze your content to understand emotions, themes, and patterns.
          </p>
          <p className="mt-2">
            <strong>3.2 Data Used for AI Training:</strong> We may use anonymized and aggregated user content to improve our AI models. 
            We do not use personally identifiable information in our training processes without explicit consent.
          </p>
          <p className="mt-2">
            <strong>3.3 Opt-Out Rights:</strong> You can opt out of having your content used for AI training by adjusting your privacy 
            settings in your account preferences.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Service Providers:</strong> Third-party vendors who help us provide and improve our services</li>
            <li><strong>Payment Processors:</strong> To process subscription payments</li>
            <li><strong>Analytics Providers:</strong> To help us understand user behavior and improve our platform</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Content Ownership and Privacy Controls</h2>
          <p>
            <strong>5.1 User Content Control:</strong> You control who can see the content you create on Creately. 
            We provide privacy settings that allow you to make content private, shared with specific users, or public.
          </p>
          <p className="mt-2">
            <strong>5.2 Ownership:</strong> You retain ownership of the content you create. Our license to use your content 
            is limited to operating and improving our services.
          </p>
          <p className="mt-2">
            <strong>5.3 Deletion:</strong> When you delete content, it will be removed from public view immediately. 
            However, we may retain backups for a limited time for technical and legal reasons.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. 
            However, no internet transmission is completely secure, and we cannot guarantee the security of information 
            transmitted through our platform.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Accessing your personal information</li>
            <li>Correcting inaccuracies in your personal information</li>
            <li>Deleting your personal information</li>
            <li>Restricting or objecting to processing</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information in the "Contact Us" section below.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
          <p>
            Your information may be transferred to, stored, and processed in countries other than the one in which you reside. 
            By using our platform, you consent to the transfer of information to countries that may have different data protection rules.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p>
            Creately is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. 
            If you believe we might have collected information from a child under 16, please contact us immediately.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new Privacy Policy 
            on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy regularly.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="mt-2 font-medium">privacy@creately.com</p>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <Link href="/" className="text-primary hover:underline">
          Return to Home
        </Link>
        <Link href="/legal" className="text-primary hover:underline">
          View Terms and Conditions
        </Link>
      </div>
    </div>
  );
}