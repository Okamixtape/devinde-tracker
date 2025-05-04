'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  AppError, 
  ErrorResponse, 
  handleError,
  ErrorCategory,
  ErrorSeverity 
} from '../services/utils/error-handling';
import ErrorNotification from '../components/error/ErrorNotification';
import ErrorBoundary from '../components/error/ErrorBoundary';
import { ServiceResult } from '../services/interfaces/data-models';

// Define the context shape
interface ErrorHandlingContextType {
  // Current error state
  error: ErrorResponse | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  
  // Utility functions
  handleServiceResult: <T>(result: ServiceResult<T>) => T | null;
  wrapPromise: <T>(promise: Promise<T>) => Promise<T>;
  
  // Settings
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
}

// Create the context with default values
const ErrorHandlingContext = createContext<ErrorHandlingContextType>({
  error: null,
  setError: () => {},
  clearError: () => {},
  handleServiceResult: () => null,
  wrapPromise: async (promise) => promise,
  showDebugInfo: false,
  setShowDebugInfo: () => {}
});

interface ErrorHandlingProviderProps {
  children: ReactNode;
  initialShowDebugInfo?: boolean;
}

/**
 * Provider component that makes error handling available throughout the app
 */
export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({
  children,
  initialShowDebugInfo = process.env.NODE_ENV === 'development'
}) => {
  // State for current error
  const [error, setErrorState] = useState<ErrorResponse | null>(null);
  
  // State for showing debug info
  const [showDebugInfo, setShowDebugInfo] = useState(initialShowDebugInfo);
  
  // Set error handler
  const setError = useCallback((err: unknown) => {
    // Convert unknown error to standard error response
    const errorResponse = handleError(err, { 
      includeDebugInfo: showDebugInfo,
      logError: true
    });
    
    setErrorState(errorResponse);
  }, [showDebugInfo]);
  
  // Clear error handler
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);
  
  // Handle service result by extracting data or setting error
  const handleServiceResult = useCallback(<T,>(result: ServiceResult<T>): T | null => {
    if (!result.success || !result.data) {
      if (result.error) {
        // Convert ServiceResult error to AppError
        const appError = new AppError(result.error.code || 'UNKNOWN_ERROR', {
          message: result.error.message || 'An operation failed',
          details: result.error.details,
          category: ErrorCategory.DATA,
          severity: ErrorSeverity.ERROR
        });
        
        setError(appError);
      } else {
        setError(new Error('Operation failed with no detailed error information'));
      }
      return null;
    }
    
    return result.data;
  }, [setError]);
  
  // Wrap promises to automatically handle errors
  const wrapPromise = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      return await promise;
    } catch (err) {
      setError(err);
      throw err; // Re-throw to allow further handling if needed
    }
  }, [setError]);
  
  // Create the context value
  const contextValue: ErrorHandlingContextType = {
    error,
    setError,
    clearError,
    handleServiceResult,
    wrapPromise,
    showDebugInfo,
    setShowDebugInfo
  };
  
  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      <ErrorBoundary>
        {children}
        <ErrorNotification 
          error={error}
          onClose={clearError}
          showDetails={showDebugInfo}
        />
      </ErrorBoundary>
    </ErrorHandlingContext.Provider>
  );
};

/**
 * Hook to access the error handling context
 */
export const useErrorHandling = () => {
  const context = useContext(ErrorHandlingContext);
  
  if (context === undefined) {
    throw new Error('useErrorHandling must be used within an ErrorHandlingProvider');
  }
  
  return context;
};

export default ErrorHandlingProvider;
