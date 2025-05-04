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
  value: any;
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
function compareValues(value: any, filterValue: any, operator: string): boolean {
  switch (operator) {
    case 'eq': 
      return value === filterValue;
    case 'neq': 
      return value !== filterValue;
    case 'gt': 
      return value > filterValue;
    case 'gte': 
      return value >= filterValue;
    case 'lt': 
      return value < filterValue;
    case 'lte': 
      return value <= filterValue;
    case 'contains': 
      return typeof value === 'string' && 
        value.toLowerCase().includes(filterValue.toString().toLowerCase());
    case 'startsWith': 
      return typeof value === 'string' && 
        value.toLowerCase().startsWith(filterValue.toString().toLowerCase());
    case 'endsWith': 
      return typeof value === 'string' && 
        value.toLowerCase().endsWith(filterValue.toString().toLowerCase());
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
    const itemValue = item[field];
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
    enum?: any[];
    validate?: (value: any) => boolean;
    message?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
}

/**
 * Validate data against a schema
 */
export function validateData(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: { [field: string]: string } = {};
  
  // Check each field in schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = rules.message || `${field} is required`;
      continue;
    }
    
    // Skip validation for undefined optional fields
    if (value === undefined || value === null) {
      continue;
    }
    
    // Check type
    const valueType = Array.isArray(value) ? 'array' : typeof value;
    const isDate = value instanceof Date;
    const schemaType = rules.type;
    
    if ((schemaType === 'date' && !isDate) || 
        (schemaType !== 'date' && schemaType !== valueType)) {
      errors[field] = rules.message || `${field} must be a ${rules.type}`;
      continue;
    }
    
    // Check min/max for strings, arrays, numbers
    if (rules.min !== undefined) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length < rules.min) {
        errors[field] = rules.message || `${field} must be at least ${rules.min} characters long`;
      } else if (typeof value === 'number' && value < rules.min) {
        errors[field] = rules.message || `${field} must be at least ${rules.min}`;
      }
    }
    
    if (rules.max !== undefined) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length > rules.max) {
        errors[field] = rules.message || `${field} must be at most ${rules.max} characters long`;
      } else if (typeof value === 'number' && value > rules.max) {
        errors[field] = rules.message || `${field} must be at most ${rules.max}`;
      }
    }
    
    // Check pattern for strings
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} has an invalid format`;
    }
    
    // Check enum values
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = rules.message || `${field} must be one of: ${rules.enum.join(', ')}`;
    }
    
    // Custom validation function
    if (rules.validate && !rules.validate(value)) {
      errors[field] = rules.message || `${field} is invalid`;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize data by removing fields not in the whitelist
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T, 
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }
  
  return sanitized;
}

/**
 * Format a date using the specified format
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const clone: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone((obj as Record<string, any>)[key]);
    }
  }
  
  return clone as T;
}
