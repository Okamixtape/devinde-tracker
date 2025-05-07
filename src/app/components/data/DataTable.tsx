'use client';

import React, { useMemo, useState } from 'react';
import { 
  FilterParams, 
  SortingParams,
  PaginationParams
} from "@/app/services/utils/dataOperations";
import { useDataOperation } from '@/app/hooks/useDataOperation';

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: () => Promise<T[]>;
  initialData?: T[];
  initialPageSize?: number;
  className?: string;
  emptyMessage?: string;
  rowKey: keyof T;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  fetchData,
  initialData = [],
  initialPageSize = 10,
  className = '',
  emptyMessage = 'No data available',
  rowKey,
  onRowClick
}: DataTableProps<T>): React.ReactElement {
  // Active filter input state
  const [activeFilter, setActiveFilter] = useState<{
    field: keyof T;
    value: string;
    operator: FilterParams<T>['operator'];
  } | null>(null);
  
  // Set up data operation hook
  const {
    data,
    isLoading,
    error,
    pagination,
    sorting,
    filters,
    setPagination,
    setSorting,
    addFilter,
    removeFilter,
    refresh
  } = useDataOperation<T>({
    initialData,
    fetchData,
    initialPagination: { page: 1, pageSize: initialPageSize }
  });
  
  // Memoized filter operators for UI
  const filterOperators = useMemo(() => [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater Than or Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less Than or Equal' }
  ], []);
  
  // Toggle sorting for a column
  const handleSort = (field: keyof T) => {
    if (!sorting || sorting.field !== field) {
      setSorting({ field, direction: 'asc' });
    } else {
      if (sorting.direction === 'asc') {
        setSorting({ field, direction: 'desc' });
      } else {
        setSorting(undefined);
      }
    }
  };
  
  // Start filtering a column
  const handleFilterClick = (field: keyof T) => {
    const existingFilter = filters.find(f => f.field === field);
    
    setActiveFilter({
      field,
      value: existingFilter?.value || '',
      operator: existingFilter?.operator || 'contains'
    });
  };
  
  // Apply the current filter
  const applyFilter = () => {
    if (!activeFilter) return;
    
    if (activeFilter.value.trim()) {
      addFilter({
        field: activeFilter.field,
        operator: activeFilter.operator,
        value: activeFilter.value
      } as FilterParams<T>);
    } else {
      removeFilter(activeFilter.field);
    }
    
    setActiveFilter(null);
  };
  
  // Change page
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  // Change page size
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPagination({ page: 1, pageSize: newPageSize });
  };
  
  // Handle key press in filter input
  const handleFilterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilter();
    } else if (e.key === 'Escape') {
      setActiveFilter(null);
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: keyof T) => {
    if (!sorting || sorting.field !== field) return null;
    
    return (
      <span className="ml-1">
        {sorting.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Render filter indicator
  const renderFilterIndicator = (field: keyof T) => {
    const hasFilter = filters.some(f => f.field === field);
    
    if (!hasFilter) return null;
    
    return (
      <span className="ml-1 text-blue-500" title="Filtered">
        🔍
      </span>
    );
  };
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          Error: {error}
          <button 
            onClick={refresh}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="min-w-full overflow-hidden rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key.toString()}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center">
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center hover:text-gray-700 focus:outline-none"
                      >
                        {column.header}
                        {renderSortIndicator(column.key)}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                    
                    {column.filterable && (
                      <button
                        onClick={() => handleFilterClick(column.key)}
                        className="ml-2 text-gray-400 hover:text-gray-700 focus:outline-none"
                        title="Filter"
                      >
                        <span>🔍</span>
                        {renderFilterIndicator(column.key)}
                      </button>
                    )}
                  </div>
                  
                  {activeFilter && activeFilter.field === column.key && (
                    <div className="mt-2 flex space-x-1">
                      <select
                        value={activeFilter.operator}
                        onChange={(e) => setActiveFilter({
                          ...activeFilter,
                          operator: e.target.value as FilterParams<T>['operator']
                        })}
                        className="text-xs border rounded px-1 py-1"
                      >
                        {filterOperators.map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={activeFilter.value}
                        onChange={(e) => setActiveFilter({
                          ...activeFilter,
                          value: e.target.value
                        })}
                        onKeyDown={handleFilterKeyPress}
                        placeholder="Filter value..."
                        className="text-xs border rounded px-2 py-1 flex-1"
                        autoFocus
                      />
                      
                      <button
                        onClick={applyFilter}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Apply
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter(null)}
                        className="text-xs bg-gray-300 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-4 text-center text-sm text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.items.map((item) => (
                <tr
                  key={String(item[rowKey])}
                  className={
                    onRowClick
                      ? 'cursor-pointer hover:bg-gray-50'
                      : ''
                  }
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map(column => (
                    <td
                      key={`${String(item[rowKey])}-${String(column.key)}`}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <span>Show:</span>
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 25, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>items per page</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>
            {`${data.metadata.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}-${
              Math.min(pagination.page * pagination.pageSize, data.metadata.total)
            } of ${data.metadata.total}`}
          </span>
          
          <div className="flex ml-4">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-2 py-1 border rounded-l disabled:opacity-50"
              title="First Page"
            >
              {'<<'}
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-2 py-1 border-t border-b disabled:opacity-50"
              title="Previous Page"
            >
              {'<'}
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!data.metadata.hasNextPage}
              className="px-2 py-1 border-t border-b disabled:opacity-50"
              title="Next Page"
            >
              {'>'}
            </button>
            
            <button
              onClick={() => handlePageChange(data.metadata.totalPages)}
              disabled={pagination.page === data.metadata.totalPages || data.metadata.totalPages === 0}
              className="px-2 py-1 border rounded-r disabled:opacity-50"
              title="Last Page"
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export for convenience
export type { Column };
