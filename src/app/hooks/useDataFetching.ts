'use client';

import { useState, useCallback } from 'react';
import { useAppState } from '@/app/contexts/AppStateContext';
import { ServiceResult } from '@/app/services/interfaces/dataModels';
import { AppError } from '@/app/services/utils/errorHandling';

/**
 * Generic hook for handling data fetching with proper loading and error states
 * Uses the AppStateContext to handle errors and loading states consistently
 */
export function useDataFetching<T>() {
  const { handleError, setLoading } = useAppState();
  const [data, setData] = useState<T | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [error, setLocalError] = useState<Error | null>(null);

  // Combined loading state
  const isLoading = isLocalLoading;

  /**
   * Fetches data from a function that returns a ServiceResult
   */
  const fetchData = useCallback(async (
    fetchFunction: () => Promise<ServiceResult<T>>,
    options?: {
      showGlobalLoader?: boolean;
      errorHandler?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    const { showGlobalLoader = false, errorHandler } = options || {};
    
    // Set loading state
    setIsLocalLoading(true);
    if (showGlobalLoader) setLoading(true);
    
    try {
      const result = await fetchFunction();
      
      if (result.success && result.data) {
        setData(result.data);
        setLocalError(null);
        return result.data;
      } else if (result.error) {
        const error = new AppError('DATA_FETCH_ERROR', {
          message: result.error.message,
          details: result.error
        });
        
        setLocalError(error);
        
        if (errorHandler) {
          errorHandler(error);
        } else {
          handleError(error);
        }
      }
      
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setLocalError(error);
      
      if (errorHandler) {
        errorHandler(error);
      } else {
        handleError(err);
      }
      
      return null;
    } finally {
      setIsLocalLoading(false);
      if (showGlobalLoader) setLoading(false);
    }
  }, [handleError, setLoading]);

  /**
   * Reset all state - useful when component unmounts or needs to refresh
   */
  const reset = useCallback(() => {
    setData(null);
    setLocalError(null);
    setIsLocalLoading(false);
  }, []);

  return {
    data,
    setData,
    isLoading,
    error,
    fetchData,
    reset
  };
}

export default useDataFetching;