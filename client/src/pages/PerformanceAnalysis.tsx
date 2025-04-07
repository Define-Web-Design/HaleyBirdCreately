import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageSpeedIntegration from '@/components/utils/PageSpeedIntegration';

/**
 * Performance Analysis Page
 * 
 * This page provides tools for analyzing and improving application performance.
 * It integrates with Google PageSpeed Insights to provide actionable insights.
 */
export const PerformanceAnalysis = () => {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Helmet>
        <title>Performance Analysis | Creately</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and improve application performance with integrated analysis tools
        </p>
      </header>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">PageSpeed Insights</h2>
          <p className="mb-6 text-muted-foreground">
            Use Google PageSpeed Insights to analyze your application and get actionable recommendations
            for improving performance, especially for mobile experiences.
          </p>
          
          <PageSpeedIntegration />
        </div>
        
        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-semibold mb-4">Performance Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Core Web Vitals</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Core Web Vitals are specific factors that Google considers important for user experience.
                These metrics focus on loading, interactivity, and visual stability.
              </p>
              <a 
                href="https://web.dev/vitals/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Learn more about Core Web Vitals →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Mobile Optimization</h3>
              <p className="text-sm text-muted-foreground mb-3">
                With our focus on mobile-first experiences, it's essential to optimize for touch interactions,
                responsive layouts, and efficient resource loading on mobile networks.
              </p>
              <a 
                href="https://developers.google.com/search/mobile-sites" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Mobile optimization best practices →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Performance Budgets</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Setting performance budgets helps maintain consistent performance as new features are added.
                This includes limits on bundle sizes, image weights, and key metrics.
              </p>
              <a 
                href="https://web.dev/performance-budgets-101/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Creating performance budgets →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Touch Optimizations</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Creating responsive touch interactions is essential for mobile experiences. 
                Proper touch targets, gesture recognition, and haptic feedback all contribute to a premium feel.
              </p>
              <a 
                href="https://developer.mozilla.org/en-US/docs/Web/API/Touch_events" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Touch event handling →
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mt-12">
        <div className="rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
          <p className="text-muted-foreground mb-4">
            For more details on using our PageSpeed Insights integration and implementing performance
            optimizations, refer to the following documentation:
          </p>
          
          <ul className="space-y-2 list-disc pl-6">
            <li>
              <span className="font-medium">PageSpeed Guide:</span>{' '}
              <code className="text-sm bg-muted p-1 rounded">docs/pagespeed-guide.md</code>
            </li>
            <li>
              <span className="font-medium">Bash Helper Script:</span>{' '}
              <code className="text-sm bg-muted p-1 rounded">scripts/pagespeed.sh</code>
            </li>
            <li>
              <span className="font-medium">Node.js Integration:</span>{' '}
              <code className="text-sm bg-muted p-1 rounded">scripts/pagespeed-insights.js</code>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default PerformanceAnalysis;