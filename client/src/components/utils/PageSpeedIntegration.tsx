import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface PageSpeedMetric {
  name: string;
  score: number;
  value?: number;
  unit?: string;
  threshold?: number;
  isPassing: boolean;
}

interface PageSpeedResult {
  url: string;
  date: Date;
  metrics: PageSpeedMetric[];
  overall: number;
}

const PageSpeedIntegration: React.FC = () => {
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runPageSpeedTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pagespeed/analyze', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run PageSpeed analysis');
      }

      const data = await response.json();
      processPageSpeedData(data);

      toast({
        title: "PageSpeed analysis complete",
        description: "Core Web Vitals have been analyzed for your site",
      });
    } catch (error) {
      console.error('PageSpeed analysis error:', error);
      toast({
        title: "PageSpeed analysis failed",
        description: "Unable to analyze Core Web Vitals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPageSpeedData = (data: any) => {
    // Extract the key metrics from PageSpeed Insights response
    const metrics: PageSpeedMetric[] = [];

    if (data.lighthouseResult) {
      const { audits } = data.lighthouseResult;

      // Largest Contentful Paint
      if (audits['largest-contentful-paint']) {
        const lcp = audits['largest-contentful-paint'];
        metrics.push({
          name: 'LCP (Largest Contentful Paint)',
          score: lcp.score * 100,
          value: lcp.numericValue / 1000, // Convert to seconds
          unit: 's',
          threshold: 2.5, // Good is < 2.5s
          isPassing: lcp.score >= 0.9
        });
      }

      // Cumulative Layout Shift
      if (audits['cumulative-layout-shift']) {
        const cls = audits['cumulative-layout-shift'];
        metrics.push({
          name: 'CLS (Cumulative Layout Shift)',
          score: cls.score * 100,
          value: cls.numericValue,
          threshold: 0.1, // Good is < 0.1
          isPassing: cls.score >= 0.9
        });
      }

      // Total Blocking Time (proxy for INP)
      if (audits['total-blocking-time']) {
        const tbt = audits['total-blocking-time'];
        metrics.push({
          name: 'TBT (Total Blocking Time)',
          score: tbt.score * 100,
          value: tbt.numericValue,
          unit: 'ms',
          threshold: 200, // Good is < 200ms
          isPassing: tbt.score >= 0.9
        });
      }

      // First Contentful Paint
      if (audits['first-contentful-paint']) {
        const fcp = audits['first-contentful-paint'];
        metrics.push({
          name: 'FCP (First Contentful Paint)',
          score: fcp.score * 100,
          value: fcp.numericValue / 1000, // Convert to seconds
          unit: 's',
          threshold: 1.8, // Good is < 1.8s
          isPassing: fcp.score >= 0.9
        });
      }
    }

    // Calculate overall score (average of individual scores)
    const overall = metrics.reduce((acc, metric) => acc + metric.score, 0) / metrics.length;

    setResult({
      url: data.id || window.location.origin,
      date: new Date(),
      metrics,
      overall
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Core Web Vitals Monitor</CardTitle>
        <CardDescription>
          Track and optimize your site's performance using Google's Core Web Vitals metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold">{result.overall.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Overall Performance</div>
            </div>

            <div className="space-y-4">
              {result.metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {metric.isPassing ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <span className="text-sm">
                      {metric.value !== undefined && `${metric.value.toFixed(2)}${metric.unit || ''}`}
                      {metric.threshold && ` (Target: <${metric.threshold}${metric.unit || ''})`}
                    </span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Last checked: {result.date.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-muted-foreground text-center">
              Run a PageSpeed test to analyze your site's Core Web Vitals and identify optimization opportunities
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runPageSpeedTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Analyzing..." : "Run PageSpeed Analysis"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PageSpeedIntegration;