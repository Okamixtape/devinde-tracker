'use client';

import { useAppState } from '@/app/contexts/AppStateContext';
import { useState, useCallback, useEffect } from 'react';
import { Section } from '@/app/services/interfaces/service-interfaces';
import { AppError } from '@/app/services/utils/errorHandling';

/**
 * Hook for interacting with application data through the global state
 * Provides simplified access to data operations and loading/error states
 */
export function useAppData<T extends Record<string, unknown>>() {
  const {
    state,
    setLoading,
    handleError,
    clearError,
    updateSectionData,
    loadSections
  } = useAppState();

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  
  // Derived values
  const isLoading = state.isLoading || localLoading;
  const error = state.error || localError;
  
  // Reset local error state when global error changes
  useEffect(() => {
    if (!state.error) {
      setLocalError(null);
    }
  }, [state.error]);
  
  /**
   * Fetches data for a specific section
   */
  const fetchSectionData = useCallback(async (sectionId: string): Promise<Record<string, unknown> | null> => {
    setLocalLoading(true);
    try {
      const section = state.sections.find(s => s.id === sectionId);
      
      if (!section) {
        // If section not found, try loading sections
        if (state.currentPlanId) {
          await loadSections(state.currentPlanId);
          const refreshedSection = state.sections.find(s => s.id === sectionId);
          return refreshedSection?.data || null;
        }
        
        throw new Error(`Section with ID ${sectionId} not found`);
      }
      
      return section.data || null;
    } catch (err) {
      setLocalError(err as Error);
      handleError(err);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [state.sections, state.currentPlanId, loadSections, handleError]);
  
  /**
   * Saves data for a specific section
   */
  const saveSectionData = useCallback(async (
    sectionId: string, 
    data: Record<string, unknown>,
    options?: { merge?: boolean }
  ): Promise<boolean> => {
    setLocalLoading(true);
    try {
      // If merge is true, merge with existing data
      if (options?.merge) {
        const section = state.sections.find(s => s.id === sectionId);
        const existingData = section?.data || {};
        const mergedData = { ...existingData, ...data };
        await updateSectionData(sectionId, mergedData);
      } else {
        await updateSectionData(sectionId, data);
      }
      
      return true;
    } catch (err) {
      setLocalError(err as Error);
      handleError(err);
      return false;
    } finally {
      setLocalLoading(false);
    }
  }, [updateSectionData, state.sections, handleError]);
  
  /**
   * Gets all sections of a specific type (by key)
   */
  const getSectionsByKey = useCallback((key: string): Section[] => {
    return state.sections.filter(section => section.key === key);
  }, [state.sections]);
  
  /**
   * Safely access typed data from a section
   */
  const getTypedSectionData = useCallback(<DataType extends Record<string, unknown>>(
    section: Section | null
  ): DataType | null => {
    if (!section || !section.data) return null;
    return section.data as unknown as DataType;
  }, []);

  /**
   * Handle asynchronous operations with automatic loading and error states
   */
  const withAsyncHandler = useCallback(async <ResultType>(
    operation: () => Promise<ResultType>,
    errorMessage?: string
  ): Promise<ResultType | null> => {
    setLocalLoading(true);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new AppError('OPERATION_FAILED', {
            message: errorMessage || 'Operation failed',
            details: err
          });
          
      setLocalError(error);
      handleError(error);
      return null;
    } finally {
      setLocalLoading(false);
    }
  }, [handleError]);
  
  return {
    // Data
    sections: state.sections,
    currentPlanId: state.currentPlanId,
    
    // Status
    isLoading,
    error,
    
    // Actions
    clearError,
    fetchSectionData,
    saveSectionData,
    getSectionsByKey,
    getTypedSectionData,
    withAsyncHandler
  };
}

export default useAppData;