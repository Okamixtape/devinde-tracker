'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DataOperationResult, 
  PaginationParams, 
  SortingParams, 
  FilterParams, 
  processData 
} from "@/app/services/utils/dataOperations";

interface UseDataOperationProps<T> {
  initialData?: T[];
  fetchData?: () => Promise<T[]>;
  initialPagination?: PaginationParams;
  initialSorting?: SortingParams<T>;
  initialFilters?: FilterParams<T>[];
}

interface UseDataOperationResult<T> {
  data: DataOperationResult<T>;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationParams;
  sorting: SortingParams<T> | undefined;
  filters: FilterParams<T>[];
  setPagination: (params: PaginationParams) => void;
  setSorting: (params: SortingParams<T> | undefined) => void;
  setFilters: (filters: FilterParams<T>[]) => void;
  addFilter: (filter: FilterParams<T>) => void;
  removeFilter: (field: keyof T) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for data operations with pagination, sorting, and filtering
 */
export function useDataOperation<T extends Record<string, any>>({
  initialData = [],
  fetchData,
  initialPagination = { page: 1, pageSize: 10 },
  initialSorting,
  initialFilters = []
}: UseDataOperationProps<T>): UseDataOperationResult<T> {
  const [rawData, setRawData] = useState<T[]>(initialData);
  const [processedData, setProcessedData] = useState<DataOperationResult<T>>({
    items: [],
    metadata: {
      total: 0,
      page: initialPagination.page,
      pageSize: initialPagination.pageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
  
  const [pagination, setPagination] = useState<PaginationParams>(initialPagination);
  const [sorting, setSorting] = useState<SortingParams<T> | undefined>(initialSorting);
  const [filters, setFilters] = useState<FilterParams<T>[]>(initialFilters);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Process data when raw data or operation parameters change
   */
  const processDataWithCurrentParams = useCallback(() => {
    const result = processData(rawData, pagination, sorting, filters);
    setProcessedData(result);
  }, [rawData, pagination, sorting, filters]);
  
  /**
   * Load data from the fetch function if provided
   */
  const loadData = useCallback(async () => {
    if (!fetchData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchData();
      setRawData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  /**
   * Add a single filter
   */
  const addFilter = useCallback((filter: FilterParams<T>) => {
    setFilters(prevFilters => {
      // Replace existing filter for same field, or add new one
      const otherFilters = prevFilters.filter(f => f.field !== filter.field);
      return [...otherFilters, filter];
    });
    
    // Reset to page 1 when adding filters
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  /**
   * Remove a filter by field
   */
  const removeFilter = useCallback((field: keyof T) => {
    setFilters(prevFilters => prevFilters.filter(f => f.field !== field));
    
    // Reset to page 1 when removing filters
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  // Initial data load
  useEffect(() => {
    if (fetchData) {
      loadData();
    }
  }, [fetchData, loadData]);
  
  // Process data whenever raw data or operation parameters change
  useEffect(() => {
    processDataWithCurrentParams();
  }, [rawData, pagination, sorting, filters, processDataWithCurrentParams]);
  
  return {
    data: processedData,
    isLoading,
    error,
    pagination,
    sorting,
    filters,
    setPagination,
    setSorting,
    setFilters,
    addFilter,
    removeFilter,
    refresh
  };
}
