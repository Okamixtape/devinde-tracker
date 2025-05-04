'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorSeverity, ErrorCategory } from '../../services/utils/error-handling';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

/**
 * Default fallback component to display when an error occurs
 */
const DefaultErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  // Determine if this is an AppError or a regular Error
  const isAppError = error instanceof AppError;
  const errorMessage = isAppError 
    ? error.userMessage 
    : error.message || 'An unexpected error occurred';
  
  const errorDetails = isAppError && error.details
    ? (typeof error.details === 'string' 
        ? error.details 
        : JSON.stringify(error.details, null, 2))
    : error.stack;
  
  return (
    <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <svg 
          className="w-8 h-8 text-red-500 mr-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
      </div>
      
      <p className="mb-4 text-red-700">{errorMessage}</p>
      
      {process.env.NODE_ENV === 'development' && errorDetails && (
        <details className="mb-4 p-2 bg-white border border-red-200 rounded">
          <summary className="cursor-pointer text-sm text-gray-600">Technical Details</summary>
          <pre className="mt-2 text-xs text-gray-800 overflow-auto max-h-64">
            {errorDetails}
          </pre>
        </details>
      )}
      
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        onClick={resetError}
      >
        Try Again
      </button>
    </div>
  );
};

/**
 * Error Boundary component for catching unhandled errors in React components
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    this.setState({
      errorInfo
    });
    
    // Convert regular errors to AppError with appropriate category
    if (!(error instanceof AppError)) {
      const appError = new AppError('INTERNAL_ERROR', {
        message: error.message || 'A component error occurred',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.ERROR,
        details: {
          componentStack: errorInfo.componentStack,
          errorStack: error.stack
        }
      });
      
      console.error('React Component Error:', appError);
    }
    
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: FallbackComponent = DefaultErrorFallback } = this.props;
    
    if (hasError && error) {
      // You can render any custom fallback UI
      return <FallbackComponent 
        error={error} 
        errorInfo={errorInfo} 
        resetError={this.resetError} 
      />;
    }

    return children;
  }
}

export default ErrorBoundary;
