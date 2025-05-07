'use client';

import { useState, useCallback } from 'react';
import { 
  AppError, 
  ErrorResponse,
  handleError,
  ErrorCategory,
  ErrorSeverity,
  createValidationError,
  createAuthError,
  createNotFoundError
} from "../services/utils/errorHandling";

interface UseErrorHandlerOptions {
  defaultMessage?: string;
  includeDebugInfo?: boolean;
  logErrors?: boolean;
}

interface UseErrorHandlerResult {
  // Error state
  error: ErrorResponse | null;
  hasError: boolean;
  clearError: () => void;
  
  // Error handling functions
  handleError: (error: unknown) => ErrorResponse;
  handlePromise: <T>(promise: Promise<T>) => Promise<T>;
  
  // Error creation helpers
  createError: (code: string | number, message?: string, details?: unknown) => AppError;
  createValidationError: (message: string, details?: unknown) => AppError;
  createAuthError: (
    code: 'AUTH_REQUIRED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCOUNT_LOCKED',
    message?: string, 
    details?: unknown
  ) => AppError;
  createNotFoundError: (resourceType: string, resourceId?: string) => AppError;
}

/**
 * Hook for handling errors in components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerResult {
  const {
    defaultMessage = 'An unexpected error occurred',
    includeDebugInfo = process.env.NODE_ENV === 'development',
    logErrors = true
  } = options;
  
  const [error, setError] = useState<ErrorResponse | null>(null);
  
  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Handle any error and update error state
  const handleErrorWithState = useCallback((err: unknown): ErrorResponse => {
    const errorResponse = handleError(err, {
      includeDebugInfo,
      logError: logErrors
    });
    
    setError(errorResponse);
    return errorResponse;
  }, [includeDebugInfo, logErrors]);
  
  // Wrap a promise and handle errors
  const handlePromise = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      clearError();
      return await promise;
    } catch (err) {
      handleErrorWithState(err);
      throw err; // Re-throw to allow further handling if needed
    }
  }, [clearError, handleErrorWithState]);
  
  // Create a new AppError
  const createError = useCallback((
    code: string | number, 
    message?: string, 
    details?: unknown
  ): AppError => {
    return new AppError(code, {
      message: message || defaultMessage,
      details
    });
  }, [defaultMessage]);
  
  return {
    // Error state
    error,
    hasError: error !== null,
    clearError,
    
    // Error handling functions
    handleError: handleErrorWithState,
    handlePromise,
    
    // Error creation helpers
    createError,
    createValidationError,
    createAuthError,
    createNotFoundError
  };
}

export { 
  AppError,
  ErrorResponse,
  ErrorCategory,
  ErrorSeverity
};
