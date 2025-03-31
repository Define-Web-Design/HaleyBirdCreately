
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log the error to an error reporting service
    console.error('UI Error:', error, errorInfo);
  }
  
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-6 max-w-xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-4 mt-4">
            <Button 
              variant="outline" 
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
              <details>
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
                <pre className="whitespace-pre-wrap mt-4">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
