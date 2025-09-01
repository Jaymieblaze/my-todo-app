import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';

// ## 1. Define the types for the component's props
interface ErrorBoundaryProps {
  children: ReactNode;
  showDetails?: boolean; // Optional prop to control error detail visibility
}

// ## 2. Define the types for the component's state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ## 3. Apply the prop and state types to the component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Use public class field for cleaner state initialization
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // ## 4. Type the lifecycle method's parameters and return value
  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // ## 5. Type the lifecycle method's parameters
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <Card className="max-w-md w-full text-center p-8">
            <CardHeader>
              <CardTitle className="text-red-600">Something went wrong.</CardTitle>
              <CardDescription>
                We're sorry, an unexpected error occurred. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {this.props.showDetails && this.state.error && (
                <details className="mt-4 text-left text-sm text-gray-700 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <summary className="font-semibold cursor-pointer">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button onClick={() => window.location.reload()} className="mt-6">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;