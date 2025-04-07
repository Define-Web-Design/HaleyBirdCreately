
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Server, 
  Database, 
  Layout, 
  Clock, 
  Zap, 
  BarChart,
  RefreshCw
} from 'lucide-react';

// Define the app status report type
interface AppStatusReport {
  timestamp: string;
  overview: {
    status: 'online' | 'degraded' | 'offline';
    statusMessage: string;
    userImpact: string;
  };
  services: {
    frontend: { status: 'online' | 'degraded' | 'offline', issues: string[] };
    backend: { status: 'online' | 'degraded' | 'offline', issues: string[] };
    database: { status: 'online' | 'degraded' | 'offline', issues: string[] };
  };
  performance: {
    apiResponseTimes: {
      average: number;
      slowest: { endpoint: string; time: number };
    };
    pageLoadTimes: {
      average: number;
      slowest: { page: string; time: number };
    };
    errors: {
      critical: { count: number; messages: string[] };
      warnings: { count: number; messages: string[] };
    };
    memory: {
      usage: number;
      leaks: string[];
    };
  };
  userExperience: {
    accessibilityScore: number;
    responsiveDesignScore: number;
    brokenLinks: number;
    userFeedback: {
      sentiment: 'positive' | 'neutral' | 'negative';
      recentComments: string[];
    };
  };
  recommendations: {
    critical: string[];
    improvements: string[];
    optimizations: string[];
  };
}

// Function to fetch app status
const fetchAppStatus = async (): Promise<AppStatusReport> => {
  try {
    // In a production environment, this would call an API endpoint
    // For now, we're importing directly
    const { generateAppStatusReport } = await import('@/utils/app-status-monitor');
    return await generateAppStatusReport();
  } catch (error) {
    console.error('Error fetching app status:', error);
    throw error;
  }
};

export default function AppStatusPage() {
  const { data: statusReport, isLoading, error, refetch } = useQuery<AppStatusReport>({
    queryKey: ['appStatus'],
    queryFn: fetchAppStatus,
    refetchInterval: 60000, // Refetch every minute
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'offline':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading app status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load application status information. Please try again later.
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (!statusReport) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Creately App Status | System Health Dashboard</title>
        <meta name="description" content="Comprehensive overview of Creately application status and system health." />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Application Status Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(statusReport.timestamp).toLocaleString()}
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Status Overview Card */}
      <Card className={`p-6 mb-6 border-l-4 ${getStatusColor(statusReport.overview.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(statusReport.overview.status)}
            <div className="ml-4">
              <h2 className="text-2xl font-semibold capitalize">
                {statusReport.overview.status}
              </h2>
              <p className="text-muted-foreground">
                {statusReport.overview.statusMessage}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(statusReport.overview.status)}>
            {statusReport.overview.status.toUpperCase()}
          </Badge>
        </div>
        <Separator className="my-4" />
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium mb-2">User Impact</h3>
          <p>{statusReport.overview.userImpact}</p>
        </div>
      </Card>

      {/* Services Status */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-blue-500" />
              <h3 className="text-xl font-medium ml-3">Frontend</h3>
            </div>
            <Badge className={getStatusColor(statusReport.services.frontend.status)}>
              {statusReport.services.frontend.status}
            </Badge>
          </div>
          {statusReport.services.frontend.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Issues:</h4>
              <ul className="text-sm list-disc pl-5">
                {statusReport.services.frontend.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-purple-500" />
              <h3 className="text-xl font-medium ml-3">Backend</h3>
            </div>
            <Badge className={getStatusColor(statusReport.services.backend.status)}>
              {statusReport.services.backend.status}
            </Badge>
          </div>
          {statusReport.services.backend.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Issues:</h4>
              <ul className="text-sm list-disc pl-5">
                {statusReport.services.backend.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-500" />
              <h3 className="text-xl font-medium ml-3">Database</h3>
            </div>
            <Badge className={getStatusColor(statusReport.services.database.status)}>
              {statusReport.services.database.status}
            </Badge>
          </div>
          {statusReport.services.database.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Issues:</h4>
              <ul className="text-sm list-disc pl-5">
                {statusReport.services.database.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors & Warnings</TabsTrigger>
          <TabsTrigger value="userExperience">User Experience</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-amber-500" /> Performance Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2">API Response Times</h4>
                <p className="text-sm text-muted-foreground mb-1">Average: {statusReport.performance.apiResponseTimes.average.toFixed(2)}ms</p>
                <Progress 
                  value={Math.min(100, 100 - (statusReport.performance.apiResponseTimes.average / 10))} 
                  className="h-2 mb-4" 
                />
                
                <div className="bg-muted/50 p-3 rounded-md mb-6">
                  <p className="text-sm font-medium">Slowest Endpoint</p>
                  <p className="text-xs">{statusReport.performance.apiResponseTimes.slowest.endpoint}</p>
                  <p className="text-sm font-medium mt-1">{statusReport.performance.apiResponseTimes.slowest.time}ms</p>
                </div>
                
                <h4 className="font-medium mb-2">Memory Usage</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {(statusReport.performance.memory.usage / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Progress 
                  value={Math.min(100, (statusReport.performance.memory.usage / (1024 * 1024 * 100)) * 100)} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Page Load Times</h4>
                <p className="text-sm text-muted-foreground mb-1">Average: {statusReport.performance.pageLoadTimes.average.toFixed(2)}ms</p>
                <Progress 
                  value={Math.min(100, 100 - (statusReport.performance.pageLoadTimes.average / 50))} 
                  className="h-2 mb-4" 
                />
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium">Slowest Page</p>
                  <p className="text-xs">{statusReport.performance.pageLoadTimes.slowest.page}</p>
                  <p className="text-sm font-medium mt-1">{statusReport.performance.pageLoadTimes.slowest.time}ms</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Errors & Warnings
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Critical Errors</h4>
                <Badge variant={statusReport.performance.errors.critical.count > 0 ? "destructive" : "outline"}>
                  {statusReport.performance.errors.critical.count}
                </Badge>
              </div>
              
              {statusReport.performance.errors.critical.count > 0 ? (
                <ul className="bg-red-50 p-4 rounded-md list-disc pl-5">
                  {statusReport.performance.errors.critical.messages.map((message, index) => (
                    <li key={index} className="text-red-700 mb-1">{message}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 bg-green-50 p-3 rounded-md">No critical errors detected</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Warnings</h4>
                <Badge variant={statusReport.performance.errors.warnings.count > 0 ? "warning" : "outline"}>
                  {statusReport.performance.errors.warnings.count}
                </Badge>
              </div>
              
              {statusReport.performance.errors.warnings.count > 0 ? (
                <ul className="bg-amber-50 p-4 rounded-md list-disc pl-5">
                  {statusReport.performance.errors.warnings.messages.map((message, index) => (
                    <li key={index} className="text-amber-700 mb-1">{message}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 bg-green-50 p-3 rounded-md">No warnings detected</p>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="userExperience">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-blue-500" /> User Experience
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2">Accessibility Score</h4>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Score: {statusReport.userExperience.accessibilityScore}/100</p>
                  <Badge className={statusReport.userExperience.accessibilityScore >= 90 ? 'bg-green-100 text-green-800' : 
                               statusReport.userExperience.accessibilityScore >= 70 ? 'bg-amber-100 text-amber-800' : 
                               'bg-red-100 text-red-800'}>
                    {statusReport.userExperience.accessibilityScore >= 90 ? 'Excellent' : 
                     statusReport.userExperience.accessibilityScore >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                <Progress 
                  value={statusReport.userExperience.accessibilityScore} 
                  className="h-2 mb-6" 
                />
                
                <h4 className="font-medium mb-2">Broken Links</h4>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Found: {statusReport.userExperience.brokenLinks}</p>
                  <Badge className={statusReport.userExperience.brokenLinks === 0 ? 'bg-green-100 text-green-800' : 
                               statusReport.userExperience.brokenLinks <= 2 ? 'bg-amber-100 text-amber-800' : 
                               'bg-red-100 text-red-800'}>
                    {statusReport.userExperience.brokenLinks === 0 ? 'Perfect' : 
                     statusReport.userExperience.brokenLinks <= 2 ? 'Minor Issues' : 'Major Issues'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Responsive Design Score</h4>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Score: {statusReport.userExperience.responsiveDesignScore}/100</p>
                  <Badge className={statusReport.userExperience.responsiveDesignScore >= 90 ? 'bg-green-100 text-green-800' : 
                               statusReport.userExperience.responsiveDesignScore >= 70 ? 'bg-amber-100 text-amber-800' : 
                               'bg-red-100 text-red-800'}>
                    {statusReport.userExperience.responsiveDesignScore >= 90 ? 'Excellent' : 
                     statusReport.userExperience.responsiveDesignScore >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
                <Progress 
                  value={statusReport.userExperience.responsiveDesignScore} 
                  className="h-2 mb-6" 
                />
                
                <h4 className="font-medium mb-2">User Feedback</h4>
                <Badge className={statusReport.userExperience.userFeedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                           statusReport.userExperience.userFeedback.sentiment === 'neutral' ? 'bg-blue-100 text-blue-800' : 
                           'bg-red-100 text-red-800'}>
                  {statusReport.userExperience.userFeedback.sentiment.charAt(0).toUpperCase() + 
                   statusReport.userExperience.userFeedback.sentiment.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Recommendations</h3>
            
            {statusReport.recommendations.critical.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-red-600">Critical</h4>
                <ul className="bg-red-50 p-4 rounded-md list-disc pl-5">
                  {statusReport.recommendations.critical.map((rec, index) => (
                    <li key={index} className="text-red-700 mb-1">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {statusReport.recommendations.improvements.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-amber-600">Improvements</h4>
                <ul className="bg-amber-50 p-4 rounded-md list-disc pl-5">
                  {statusReport.recommendations.improvements.map((rec, index) => (
                    <li key={index} className="text-amber-700 mb-1">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {statusReport.recommendations.optimizations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-blue-600">Optimizations</h4>
                <ul className="bg-blue-50 p-4 rounded-md list-disc pl-5">
                  {statusReport.recommendations.optimizations.map((rec, index) => (
                    <li key={index} className="text-blue-700 mb-1">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
