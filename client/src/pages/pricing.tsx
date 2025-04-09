import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const handleBillingToggle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Transparent & Simple Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the plan that fits your creative needs. All plans include core features with additional capabilities as you grow.
        </p>
      </header>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center mb-16">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}`}>
          Monthly Billing
        </span>
        <div className="mx-4">
          <Switch
            checked={billingCycle === 'yearly'}
            onCheckedChange={handleBillingToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <span className={`text-sm ${billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}`}>
          Yearly Billing
          <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
            Save 20%
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className="border-muted shadow-sm">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For individuals exploring creative tools</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Basic color extraction (5 per day)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Limited content library (100MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Core creative tools</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Community support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary shadow-lg relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
            Popular
          </div>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For creative professionals and teams</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                ${billingCycle === 'monthly' ? '19' : '15'}
              </span>
              <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'month, billed yearly'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited color extraction</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>10GB content storage</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>AI enhancement tools (100/mo)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Collaboration tools (up to 3 users)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full siri-glow">
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>

        {/* Business Plan */}
        <Card className="border-muted shadow-sm">
          <CardHeader>
            <CardTitle>Business</CardTitle>
            <CardDescription>For agencies and creative businesses</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                ${billingCycle === 'monthly' ? '49' : '39'}
              </span>
              <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'month, billed yearly'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Everything in Pro, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>50GB content storage</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited AI enhancements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>White-labeled exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Advanced user permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>API access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Team collaboration (up to 10 users)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Dedicated account manager</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Contact Sales
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Enterprise Section */}
      <section className="mt-20 bg-primary/5 rounded-xl p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
            <p className="text-muted-foreground mb-6">
              Need a custom solution for your large organization? Our enterprise plan offers tailored features, 
              dedicated support, and enhanced security for your creative workflows.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Custom integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Unlimited team members</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Advanced security features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">99.9% uptime SLA</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Dedicated success manager</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Custom training sessions</span>
              </li>
            </ul>
            <Button>Schedule a Demo</Button>
          </div>
          <div className="md:w-1/3 bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-2">Not sure which plan is right for you?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team of experts is ready to help you find the perfect solution for your specific needs.
            </p>
            <Button variant="outline" className="w-full" size="sm">Talk to Sales</Button>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="mt-20 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Features</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-6">Feature</th>
                <th className="text-center py-4 px-6">Free</th>
                <th className="text-center py-4 px-6 bg-primary/5">Pro</th>
                <th className="text-center py-4 px-6">Business</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">Color Extraction</td>
                <td className="text-center py-4 px-6">5 per day</td>
                <td className="text-center py-4 px-6 bg-primary/5">Unlimited</td>
                <td className="text-center py-4 px-6">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">
                  <div className="flex items-center gap-1">
                    Content Storage
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            Storage limits apply to all files including images, palettes, and exported content.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
                <td className="text-center py-4 px-6">100MB</td>
                <td className="text-center py-4 px-6 bg-primary/5">10GB</td>
                <td className="text-center py-4 px-6">50GB</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">AI Enhancement Tools</td>
                <td className="text-center py-4 px-6">Limited</td>
                <td className="text-center py-4 px-6 bg-primary/5">100/month</td>
                <td className="text-center py-4 px-6">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">Team Members</td>
                <td className="text-center py-4 px-6">1</td>
                <td className="text-center py-4 px-6 bg-primary/5">Up to 3</td>
                <td className="text-center py-4 px-6">Up to 10</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">Analytics</td>
                <td className="text-center py-4 px-6">Basic</td>
                <td className="text-center py-4 px-6 bg-primary/5">Advanced</td>
                <td className="text-center py-4 px-6">Advanced</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-6 font-medium">API Access</td>
                <td className="text-center py-4 px-6">—</td>
                <td className="text-center py-4 px-6 bg-primary/5">—</td>
                <td className="text-center py-4 px-6">✓</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium">Support</td>
                <td className="text-center py-4 px-6">Community</td>
                <td className="text-center py-4 px-6 bg-primary/5">Priority</td>
                <td className="text-center py-4 px-6">Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade, downgrade, or cancel your plan at any time. Upgrades take effect immediately, while downgrades apply at the end of your current billing cycle.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team within 14 days of your purchase for a full refund.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. Enterprise customers can also pay via invoice.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Do you offer a discount for nonprofits or educational institutions?</h3>
            <p className="text-muted-foreground">
              Yes, we offer special pricing for nonprofits, educational institutions, and students. Please contact our sales team for more information.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Creating?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of creative professionals who trust Creately for their creative workflows.
        </p>
        <Button size="lg" className="siri-glow">Get Started Today</Button>
      </section>
    </div>
  );
};

export default Pricing;