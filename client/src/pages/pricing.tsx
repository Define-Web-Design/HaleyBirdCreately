import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, HelpCircle, Info, LifeBuoy, Palette, Sparkles, Users, Zap } from 'lucide-react';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // Define the type for plans
  type PlanType = {
    name: string;
    description: string;
    price: string;
    priceDetails: string;
    features: string[];
    limitations?: string[];
    cta: string;
    variant: 'outline' | 'default';
    popular?: boolean;
    savings?: string;
  };

  // Define the type for pricing plans
  type PricingPlansType = {
    monthly: PlanType[];
    annual: PlanType[];
  };

  const pricingPlans: PricingPlansType = {
    monthly: [
      {
        name: 'Free',
        description: 'Start your creative journey with essential tools and features.',
        price: '$0',
        priceDetails: 'forever free',
        features: [
          'Basic color palette generation',
          'Limited access to AI enhancement tools',
          'Standard creative symbiosis features',
          'Personal content vault (100MB)',
          'Community access',
        ],
        limitations: [
          'No API access',
          'Limited exports per month',
          'Basic support only',
        ],
        cta: 'Get Started',
        variant: 'outline',
      },
      {
        name: 'Pro',
        description: 'Unlock advanced features for serious creators and professionals.',
        price: '$9.99',
        priceDetails: 'per month',
        features: [
          'Everything in Free, plus:',
          'Advanced color extraction & analysis',
          'Full access to AI enhancement tools',
          'Enhanced creative symbiosis',
          'Expanded content vault (10GB)',
          'Priority support',
          'Unlimited exports',
          'API access (limited requests)',
        ],
        cta: 'Go Pro',
        variant: 'default',
        popular: true,
      },
      {
        name: 'Team',
        description: 'Collaborative tools for creative teams and businesses.',
        price: '$24.99',
        priceDetails: 'per user/month',
        features: [
          'Everything in Pro, plus:',
          'Team collaboration tools',
          'Shared content libraries',
          'Advanced analytics',
          'Custom branding options',
          'Enterprise-grade security',
          'Admin dashboard',
          'Dedicated account manager',
          'Full API access',
        ],
        cta: 'Contact Sales',
        variant: 'outline',
      }
    ],
    annual: [
      {
        name: 'Free',
        description: 'Start your creative journey with essential tools and features.',
        price: '$0',
        priceDetails: 'forever free',
        features: [
          'Basic color palette generation',
          'Limited access to AI enhancement tools',
          'Standard creative symbiosis features',
          'Personal content vault (100MB)',
          'Community access',
        ],
        limitations: [
          'No API access',
          'Limited exports per month',
          'Basic support only',
        ],
        cta: 'Get Started',
        variant: 'outline',
      },
      {
        name: 'Pro',
        description: 'Unlock advanced features for serious creators and professionals.',
        price: '$7.99',
        priceDetails: 'per month, billed annually',
        features: [
          'Everything in Free, plus:',
          'Advanced color extraction & analysis',
          'Full access to AI enhancement tools',
          'Enhanced creative symbiosis',
          'Expanded content vault (10GB)',
          'Priority support',
          'Unlimited exports',
          'API access (limited requests)',
        ],
        cta: 'Go Pro',
        variant: 'default',
        popular: true,
        savings: 'Save 20%',
      },
      {
        name: 'Team',
        description: 'Collaborative tools for creative teams and businesses.',
        price: '$19.99',
        priceDetails: 'per user/month, billed annually',
        features: [
          'Everything in Pro, plus:',
          'Team collaboration tools',
          'Shared content libraries',
          'Advanced analytics',
          'Custom branding options',
          'Enterprise-grade security',
          'Admin dashboard',
          'Dedicated account manager',
          'Full API access',
        ],
        cta: 'Contact Sales',
        variant: 'outline',
        savings: 'Save 20%',
      }
    ]
  };

  const faqs = [
    {
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be available immediately. If you downgrade, you\'ll continue to have access to your current plan until the end of the billing period.'
    },
    {
      question: 'Is there a trial period for paid plans?',
      answer: 'Yes, we offer a 14-day free trial for our Pro plan. No credit card is required to start your trial. You\'ll receive a notification before the trial ends so you can decide if you want to continue with a paid subscription.'
    },
    {
      question: 'How does the freemium model work?',
      answer: 'Our freemium model provides access to core features for free, forever. We believe in making creative tools accessible to everyone. Premium features available in paid plans enhance your experience but aren\'t necessary to benefit from the platform.'
    },
    {
      question: 'Can I use Creately commercially on the free plan?',
      answer: 'Yes, you can use Creately for commercial projects even on the free plan. However, the Pro and Team plans provide more advanced features, higher quality exports, and better collaboration tools that may benefit professional and commercial use.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay. For Team plans, we can also accommodate invoice payments and purchase orders.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Yes, we offer a 30-day money-back guarantee for annual subscriptions. If you\'re not satisfied with your purchase, contact our support team within 30 days for a full refund.'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Pricing | Creately</title>
        <meta name="description" content="Flexible pricing plans for Creately - find the perfect option for your creative needs" />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Choose the perfect plan to enhance your creative journey. All plans include core features of creative symbiosis and AI enhancement.
        </p>
        
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Label htmlFor="billing-toggle" className={`${billingPeriod === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </Label>
            <Switch 
              id="billing-toggle" 
              checked={billingPeriod === 'annual'}
              onCheckedChange={(checked) => {
                setBillingPeriod(checked ? 'annual' : 'monthly');
              }}
            />
            <div className="flex items-center gap-1.5">
              <Label htmlFor="billing-toggle" className={`${billingPeriod === 'annual' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Annual
              </Label>
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans[billingPeriod].map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.priceDetails}</span>
                  </div>
                  {plan.savings && (
                    <div className="text-primary text-sm font-medium mt-1">
                      {plan.savings} with annual billing
                    </div>
                  )}
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant={plan.variant} 
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Compare Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the plan that's right for your creative needs with our detailed feature comparison
          </p>
        </div>

        <Tabs defaultValue="creative" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 sm:grid-cols-4 md:grid-cols-none gap-2 md:gap-0 mb-8">
            <TabsTrigger value="creative" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Creative Tools</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>AI Enhancement</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Content & Storage</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Teams & Collaboration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creative">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b">Free</th>
                    <th className="text-center p-4 border-b">Pro</th>
                    <th className="text-center p-4 border-b">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b">Color palette generation</td>
                    <td className="text-center p-4 border-b">Basic</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Website color extraction</td>
                    <td className="text-center p-4 border-b">Limited</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Creative prompt generation</td>
                    <td className="text-center p-4 border-b">5/day</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Mood board creation</td>
                    <td className="text-center p-4 border-b">2 active</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                    <td className="text-center p-4 border-b">Unlimited + Shared</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Export options</td>
                    <td className="text-center p-4 border-b">Basic formats</td>
                    <td className="text-center p-4 border-b">All formats</td>
                    <td className="text-center p-4 border-b">All formats + Custom</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b">Free</th>
                    <th className="text-center p-4 border-b">Pro</th>
                    <th className="text-center p-4 border-b">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b">AI-powered suggestions</td>
                    <td className="text-center p-4 border-b">Basic</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Adaptive learning</td>
                    <td className="text-center p-4 border-b">Limited</td>
                    <td className="text-center p-4 border-b">Full access</td>
                    <td className="text-center p-4 border-b">Full access</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Style preservation</td>
                    <td className="text-center p-4 border-b">Standard</td>
                    <td className="text-center p-4 border-b">Enhanced</td>
                    <td className="text-center p-4 border-b">Enhanced + Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Content enhancement</td>
                    <td className="text-center p-4 border-b">3/day</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                    <td className="text-center p-4 border-b">Unlimited + Priority</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">AI processing priority</td>
                    <td className="text-center p-4 border-b">Standard</td>
                    <td className="text-center p-4 border-b">Priority</td>
                    <td className="text-center p-4 border-b">Highest priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="storage">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b">Free</th>
                    <th className="text-center p-4 border-b">Pro</th>
                    <th className="text-center p-4 border-b">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b">Content vault storage</td>
                    <td className="text-center p-4 border-b">100MB</td>
                    <td className="text-center p-4 border-b">10GB</td>
                    <td className="text-center p-4 border-b">100GB per user</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Project saving</td>
                    <td className="text-center p-4 border-b">Up to 5</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Version history</td>
                    <td className="text-center p-4 border-b">None</td>
                    <td className="text-center p-4 border-b">30 days</td>
                    <td className="text-center p-4 border-b">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Backup & restore</td>
                    <td className="text-center p-4 border-b">Manual</td>
                    <td className="text-center p-4 border-b">Automated</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Content organization</td>
                    <td className="text-center p-4 border-b">Basic</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                    <td className="text-center p-4 border-b">Advanced + Shared</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b">Free</th>
                    <th className="text-center p-4 border-b">Pro</th>
                    <th className="text-center p-4 border-b">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b">Team members</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Collaborative editing</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">Limited</td>
                    <td className="text-center p-4 border-b">Real-time</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Shared libraries</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Team permissions</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Admin dashboard</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">-</td>
                    <td className="text-center p-4 border-b">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQs */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our pricing and plans
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/10 py-16 px-4 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Our team is ready to help you find the perfect plan for your creative needs.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <LifeBuoy className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;