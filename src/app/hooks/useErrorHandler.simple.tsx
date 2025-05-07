'use client';

import { useState, useCallback } from 'react';
import { 
  AppError, 
  ErrorResponse,
  handleError
} from "@/app/services/utils/errorHandling";

interface UseErrorHandlerResult {
  error: ErrorResponse | null;
  clearError: () => void;
  handleError: (error: unknown) => ErrorResponse;
}

export function useErrorHandler(): UseErrorHandlerResult {
  const [error, setError] = useState<ErrorResponse | null>(null);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const handleErrorWithState = useCallback((err: unknown): ErrorResponse => {
    const errorResponse = handleError(err, {});
    setError(errorResponse);
    return errorResponse;
  }, []);
  
  return {
    error,
    clearError,
    handleError: handleErrorWithState
  };
}
