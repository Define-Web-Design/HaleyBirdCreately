import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: ErrorInfo; // Added errorInfo to state
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null }; //Initialized error to null
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
      hasError: true //Ensure hasError is set to true
    });

    console.error('UI Error:', error, errorInfo);

    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/logs/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.toString(),
            componentStack: errorInfo.componentStack,
            location: window.location.href
          })
        }).catch(e => console.error('Failed to report error:', e));
      } catch (e) {
        console.error('Failed to send error to server:', e);
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: undefined });
    this.props.onReset && this.props.onReset(); // Call onReset prop if provided
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-xl mx-auto">
          <div>
            {/* Changed Alert to a simpler div for better fallback */}
            <p>Something went wrong</p>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          </div>
          <div className="flex space-x-4 mt-4">
            <button onClick={this.handleReset}>Try Again</button>
            <button onClick={() => window.location.href = '/'}>Go to Dashboard</button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details>
              <summary>Error Details</summary>
              <pre>
                {this.state.error?.stack}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}