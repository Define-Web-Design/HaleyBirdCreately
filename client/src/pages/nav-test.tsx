import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from '@/components/ui/page-header';
import { 
  Play, 
  CheckCheck, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle 
} from 'lucide-react';

import { 
  ALL_ROUTES, 
  validateMenuRoutes, 
  verifyNavigationLinks, 
  checkPageInteractiveElements,
  verifyToastBehavior
} from '@/utils/navigation-tester';

/**
 * Navigation Test Page
 * 
 * This page emulates the functionality of automated testing tools like Cypress or TestCafe
 * to verify application navigation, links, and interactive elements.
 */

const NavigationTest: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);
  const [testLog, setTestLog] = useState<string[]>([]);
  
  // Run a single test
  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setCurrentTest(testName);
    setTestLog((prev: string[]) => [...prev, `Starting test: ${testName}`]);
    
    try {
      const result = await testFn();
      setTestResults((prev: Record<string, any>) => ({ ...prev, [testName]: { result, status: 'success' } }));
      setTestLog((prev: string[]) => [...prev, `✓ Test completed: ${testName}`]);
      return result;
    } catch (error) {
      setTestResults((prev: Record<string, any>) => ({ ...prev, [testName]: { error, status: 'error' } }));
      setTestLog((prev: string[]) => [...prev, `✗ Test failed: ${testName} - ${error}`]);
      throw error;
    }
  };
  
  // Run all tests sequentially
  const runAllTests = async () => {
    setIsTesting(true);
    setProgress(0);
    setTestResults({});
    setTestLog(['Starting automated navigation tests...']);
    
    try {
      // Test 1: Validate menu routes
      await runTest('validateMenuRoutes', async () => {
        const result = validateMenuRoutes();
        setProgress(20);
        return resultult;
      });
      
      // Test 2: Verify navigation links
      await runTest('verifyNavigationLinks', async () => {
        const result = await verifyNavigationLinks();
        setProgress(40);
        return result;
      });
      
      // Test 3: Check home page elements
      await runTest('checkHomePageElements', async () => {
        const result = await checkPageInteractiveElements('/');
        setProgress(60);
        return result;
      });
      
      // Test 4: Verify toast behavior
      await runTest('verifyToastBehavior', async () => {
        const result = await verifyToastBehavior();
        setProgress(80);
        return result;
      });
      
      // Test 5: Test creating a toast notification
      await runTest('testToastNotification', async () => {
        toast({
          title: "Test Toast",
          description: "This is a test toast notification",
        });
        setProgress(100);
        return { success: true };
      });
      
      setTestLog((prev: string[]) => [...prev, 'All tests completed successfully!']);
    } catch (error) {
      setTestLog((prev: string[]) => [...prev, `Error during test execution: ${error}`]);
    } finally {
      setIsTesting(false);
      setCurrentTest('');
    }
  };

  // Test navigation to a specific page
  const testNavigation = (path: string) => {
    navigate(path);
    toast({
      title: "Navigation Test",
      description: `Navigated to: ${path}`,
    });
  };
  
  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        heading="Navigation Testing Dashboard"
        description="Automated testing for application navigation and functionality"
        rightSection={
          <Button 
            onClick={runAllTests} 
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <span className="animate-spin">
                <Play className="h-4 w-4" />
              </span>
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isTesting ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Routes List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Test Routes
            </CardTitle>
            <CardDescription>
              Click on a route to test navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <div className="space-y-2">
              {ALL_ROUTES.map((route) => (
                <div key={route.path} className="space-y-1">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => testNavigation(route.path)}
                  >
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Button>
                  
                  {route.subRoutes && route.subRoutes.length > 0 && (
                    <div className="pl-4 space-y-1 mt-1">
                      {route.subRoutes.map((subRoute) => (
                        <Button 
                          key={subRoute} 
                          variant="ghost" 
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => testNavigation(subRoute)}
                        >
                          <span className="text-xs">{subRoute.split('/').pop()}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Middle Column - Test Results */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-primary" />
              Test Results
            </CardTitle>
            <CardDescription>
              Status of automated navigation tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTesting && (
              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{currentTest || 'Preparing tests...'}</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, data]: [string, any]) => (
                <div key={testName} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {data.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{testName}</span>
                    </div>
                    <Badge variant={data.status === 'success' ? 'outline' : 'destructive'}>
                      {data.status}
                    </Badge>
                  </div>
                  
                  {data.status === 'success' && data.result && (
                    <div className="mt-2 text-sm">
                      {testName === 'validateMenuRoutes' && (
                        <span>
                          {data.result.valid ? 
                            'All menu routes are valid.' : 
                            `Missing routes: ${data.result.missingRoutes.join(', ')}`}
                        </span>
                      )}
                      
                      {testName === 'verifyNavigationLinks' && (
                        <span>
                          {data.result.success ? 
                            'All navigation links verified.' : 
                            `${data.result.errors.length} errors found.`}
                        </span>
                      )}
                      
                      {testName === 'checkHomePageElements' && (
                        <span>
                          {data.result.success ? 
                            'All elements functioning correctly.' : 
                            'Some page elements have issues.'}
                        </span>
                      )}
                      
                      {testName === 'verifyToastBehavior' && (
                        <div className="space-y-1">
                          <p>Auto-dismiss: {data.result.automatic ? 'Yes' : 'No'}</p>
                          <p>Manually closable: {data.result.closable ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                      
                      {testName === 'testToastNotification' && (
                        <span>Toast notification displayed successfully.</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {Object.keys(testResults).length === 0 && !isTesting && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>No tests have been run yet.</p>
                  <p className="text-sm">Click "Run All Tests" to begin testing.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Test Log */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M8 18h8"></path><path d="M8 14h8"></path><path d="M8 10h8"></path><path d="M8 6h8"></path><rect width="20" height="22" x="2" y="1" rx="2" ry="2"></rect>
              </svg>
              Test Log
            </CardTitle>
            <CardDescription>
              Detailed log of test execution
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-md p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {testLog.length > 0 ? (
                testLog.map((log, index) => (
                  <div key={index} className="pb-1">
                    <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">Test log will appear here...</span>
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      {/* Toast Recommendations */}
      {testResults.verifyToastBehavior && testResults.verifyToastBehavior.status === 'success' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Toast Notification Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {testResults.verifyToastBehavior.result.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Navigation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Controls</CardTitle>
          <CardDescription>
            Go back to the application after testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={() => navigate('/')}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reload Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTest;