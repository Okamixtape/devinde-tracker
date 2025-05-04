/**
 * Helper utilities for the service layer
 */

/**
 * Generate a UUID v4
 * @returns A randomly generated UUID string
 */
export function generateUUID(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get the current timestamp in ISO format
 * @returns Current time as ISO string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate the structure of an object against required fields
 * @param object The object to validate
 * @param requiredFields Array of field names that must be present and non-empty
 * @returns A validation result object
 */
export function validateObject(object: any, requiredFields: string[]): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    // Check if the field exists and has a value
    const value = object[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Deep copy an object to avoid reference issues
 * @param object Object to clone
 * @returns A deep copy of the object
 */
export function deepCopy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object)) as T;
}

/**
 * Format a date string in a user-friendly format
 * @param dateString ISO date string
 * @param format Optional format specifier
 * @returns Formatted date string
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  if (format === 'short') {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleString();
  }
}

/**
 * Safely access localStorage with error handling for environments where it's not available
 * @param operation Function that interacts with localStorage
 * @param fallbackValue Value to return if operation fails
 * @returns Result of the operation or fallback value
 */
export function safeLocalStorage<T>(operation: () => T, fallbackValue: T): T {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallbackValue;
    }
    
    return operation();
  } catch (error) {
    console.error('LocalStorage operation failed:', error);
    return fallbackValue;
  }
}
