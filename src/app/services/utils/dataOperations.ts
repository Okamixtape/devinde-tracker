/**
 * Data Operations - Utility functions for handling data operations
 * 
 * This module provides utilities for data processing, validation, formatting,
 * pagination, filtering, and sorting of data stored in localStorage.
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Sorting parameters
 */
export interface SortingParams<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Filtering parameters - support multiple fields with different operators
 */
export interface FilterParams<T> {
  field: keyof T;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean | Date | null;
}

/**
 * Data operation result with pagination metadata
 */
export interface DataOperationResult<T> {
  items: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Apply pagination to an array of data
 */
export function paginate<T>(data: T[], params: PaginationParams): DataOperationResult<T> {
  const { page, pageSize } = params;
  
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(100, pageSize)); // Cap page size at 100
  
  const startIndex = (validPage - 1) * validPageSize;
  const endIndex = startIndex + validPageSize;
  
  const paginatedItems = data.slice(startIndex, endIndex);
  const total = data.length;
  const totalPages = Math.ceil(total / validPageSize);
  
  return {
    items: paginatedItems,
    metadata: {
      total,
      page: validPage,
      pageSize: validPageSize,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1
    }
  };
}

/**
 * Apply sorting to an array of data
 */
export function sort<T>(data: T[], params: SortingParams<T>): T[] {
  const { field, direction } = params;
  
  return [...data].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    
    // Handle different types of values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    if (valueA instanceof Date && valueB instanceof Date) {
      return direction === 'asc' 
        ? valueA.getTime() - valueB.getTime() 
        : valueB.getTime() - valueA.getTime();
    }
    
    // For numbers and other comparable types
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Compare values based on the specified operator
 */
/**
 * Compare values supports different primitive types depending on operator
 */
type ComparisonValue = string | number | boolean | Date | null | undefined;

function compareValues(value: ComparisonValue, filterValue: ComparisonValue, operator: string): boolean {
  // Handle null/undefined values - treat them as equal to each other and not equal to anything else
  if (value === null || value === undefined) {
    if (filterValue === null || filterValue === undefined) {
      return operator === 'eq' || operator === 'gte' || operator === 'lte';
    }
    return operator === 'neq';
  }
  
  if (filterValue === null || filterValue === undefined) {
    return operator === 'neq';
  }
  switch (operator) {
    case 'eq': 
      return value === filterValue;
    case 'neq': 
      return value !== filterValue;
    case 'gt': 
      // Safe comparison after null checks above
      return value > filterValue!;
    case 'gte': 
      // Safe comparison after null checks above
      return value >= filterValue!;
    case 'lt': 
      // Safe comparison after null checks above
      return value < filterValue!;
    case 'lte': 
      // Safe comparison after null checks above
      return value <= filterValue!;
    case 'contains': 
      // Safe string operations after null checks above
      return String(value).toLowerCase().includes(String(filterValue!).toLowerCase());
    case 'startsWith':
      // Safe string operations after null checks above
      return String(value).toLowerCase().startsWith(String(filterValue!).toLowerCase());
    case 'endsWith':
      // Safe string operations after null checks above
      return String(value).toLowerCase().endsWith(String(filterValue!).toLowerCase());
    default:
      return false;
  }
}

/**
 * Apply a single filter to data
 */
export function applyFilter<T>(data: T[], filter: FilterParams<T>): T[] {
  const { field, operator, value } = filter;
  
  return data.filter(item => {
    // Type assertion to handle generic T values safely
    const itemValue = item[field] as ComparisonValue;
    return compareValues(itemValue, value, operator);
  });
}

/**
 * Apply multiple filters to data (AND logic)
 */
export function filter<T>(data: T[], filters: FilterParams<T>[]): T[] {
  if (!filters || filters.length === 0) {
    return data;
  }
  
  return filters.reduce((filteredData, filter) => {
    return applyFilter(filteredData, filter);
  }, data);
}

/**
 * Combined data operation with pagination, sorting, and filtering
 */
export function processData<T>(
  data: T[], 
  paginationParams: PaginationParams,
  sortingParams?: SortingParams<T>,
  filterParams?: FilterParams<T>[]
): DataOperationResult<T> {
  // Start with original data
  let processedData = [...data];
  
  // Apply filters if provided
  if (filterParams && filterParams.length > 0) {
    processedData = filter(processedData, filterParams);
  }
  
  // Apply sorting if provided
  if (sortingParams) {
    processedData = sort(processedData, sortingParams);
  }
  
  // Apply pagination and return results
  return paginate(processedData, paginationParams);
}

/**
 * Data validation based on schema
 */
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: Array<string | number>;
    validate?: (value: unknown) => boolean;
  };
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate data against a schema
 */
export function validateData(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Check each field in the schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `Field '${field}' is required`
      });
      continue;
    }
    
    // Skip validations for undefined optional fields
    if (value === undefined) {
      continue;
    }
    
    // Type validation
    if (rules.type === 'string') {
      if (value === null || value === undefined || typeof value !== 'string') {
        errors.push({
          field,
          message: `Field '${field}' must be a string`
        });
      }
    }
    
    if (rules.type === 'number') {
      if (value === null || value === undefined || typeof value !== 'number') {
        errors.push({
          field,
          message: `Field '${field}' must be a number`
        });
      }
    }
    
    if (rules.type === 'boolean') {
      if (value === null || value === undefined || typeof value !== 'boolean') {
        errors.push({
          field,
          message: `Field '${field}' must be a boolean`
        });
      }
    }
    
    if (rules.type === 'date') {
      if (value === null || value === undefined || (!(value instanceof Date) && isNaN(Date.parse(String(value))))) {
        errors.push({
          field,
          message: `Field '${field}' must be a valid date`
        });
      }
    }
    
    if (rules.type === 'array') {
      if (value === null || value === undefined || !Array.isArray(value)) {
        errors.push({
          field,
          message: `Field '${field}' must be an array`
        });
      }
    }
    
    if (rules.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      errors.push({
        field,
        message: `Field '${field}' must be an object`
      });
    }
    
    // Min/Max validations
    if (value !== null && value !== undefined && typeof value === 'string' && rules.min !== undefined && value.length < rules.min) {
      errors.push({
        field,
        message: `Field '${field}' must be at least ${rules.min} characters long`
      });
    }
    
    if (value !== null && value !== undefined && typeof value === 'string' && rules.max !== undefined && value.length > rules.max) {
      errors.push({
        field,
        message: `Field '${field}' must be no more than ${rules.max} characters long`
      });
    }
    
    if (typeof value === 'number' && rules.min !== undefined && value < rules.min) {
      errors.push({
        field,
        message: `Field '${field}' must be at least ${rules.min}`
      });
    }
    
    if (typeof value === 'number' && rules.max !== undefined && value > rules.max) {
      errors.push({
        field,
        message: `Field '${field}' must be no more than ${rules.max}`
      });
    }
    
    if (value !== null && value !== undefined && Array.isArray(value) && rules.min !== undefined && value.length < rules.min) {
      errors.push({
        field,
        message: `Field '${field}' must have at least ${rules.min} items`
      });
    }
    
    if (value !== null && value !== undefined && Array.isArray(value) && rules.max !== undefined && value.length > rules.max) {
      errors.push({
        field,
        message: `Field '${field}' must have no more than ${rules.max} items`
      });
    }
    
    // Pattern validation
    if (value !== null && value !== undefined && typeof value === 'string' && rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: `Field '${field}' does not match the required pattern`
      });
    }
    
    // Enum validation
    if (rules.enum && value !== null && value !== undefined) {
      // Type assertion to handle the enum values safely
      const valueToCheck = value as string | number;
      if (!rules.enum.includes(valueToCheck)) {
        errors.push({
          field,
          message: `Field '${field}' must be one of the allowed values`
        });
      }
    } else if (rules.enum && (value === null || value === undefined) && rules.required) {
      errors.push({
        field,
        message: `Field '${field}' must be one of the allowed values`
      });
    }
    
    // Custom validation function
    if (rules.validate && !rules.validate(value)) {
      errors.push({
        field,
        message: `Field '${field}' failed validation`
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
