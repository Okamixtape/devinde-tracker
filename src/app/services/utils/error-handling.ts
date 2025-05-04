/**
 * Error Handling Framework - Comprehensive utilities for handling errors
 * 
 * This module provides a standardized approach to error handling across
 * the DevIndé Tracker application, including:
 * 
 * - Standardized error types and codes
 * - Centralized error handling
 * - User-friendly error messages
 * - Developer debug information
 * - Error logging capabilities
 */

// Error Severity Levels
export enum ErrorSeverity {
  INFO = 'info',       // Informational messages that aren't actual errors
  WARNING = 'warning', // Warnings that don't prevent the operation from completing
  ERROR = 'error',     // Errors that prevent a specific operation from completing
  CRITICAL = 'critical', // Critical errors that affect system functionality
  FATAL = 'fatal'      // Severe errors that prevent the application from functioning
}

// Error Categories to organize errors by domain
export enum ErrorCategory {
  VALIDATION = 'validation',  // Input validation errors
  AUTHENTICATION = 'authentication', // Auth-related errors
  AUTHORIZATION = 'authorization',   // Permission-related errors
  DATA = 'data',             // Data storage/retrieval errors
  NETWORK = 'network',        // Network-related errors
  UI = 'ui',                 // UI-related errors
  BUSINESS_LOGIC = 'business', // Business logic errors
  SYSTEM = 'system'          // System/infrastructure errors
}

// Standard error codes with descriptions
export const ErrorCodes = {
  // Validation errors (1000-1999)
  INVALID_INPUT: { code: 1000, message: 'Invalid input provided' },
  REQUIRED_FIELD: { code: 1001, message: 'Required field is missing' },
  INVALID_FORMAT: { code: 1002, message: 'Field format is invalid' },
  
  // Authentication errors (2000-2999)
  AUTH_REQUIRED: { code: 2000, message: 'Authentication required' },
  INVALID_CREDENTIALS: { code: 2001, message: 'Invalid credentials' },
  SESSION_EXPIRED: { code: 2002, message: 'Session has expired' },
  ACCOUNT_LOCKED: { code: 2003, message: 'Account is locked' },
  
  // Authorization errors (3000-3999)
  PERMISSION_DENIED: { code: 3000, message: 'Permission denied' },
  INSUFFICIENT_ROLE: { code: 3001, message: 'Insufficient role permissions' },
  RESOURCE_FORBIDDEN: { code: 3002, message: 'Access to resource is forbidden' },
  
  // Data errors (4000-4999)
  NOT_FOUND: { code: 4000, message: 'Resource not found' },
  ALREADY_EXISTS: { code: 4001, message: 'Resource already exists' },
  STORAGE_ERROR: { code: 4002, message: 'Storage operation failed' },
  DATA_CORRUPTED: { code: 4003, message: 'Data is corrupted or invalid' },
  CONFLICT: { code: 4004, message: 'Data conflict detected' },
  
  // Network errors (5000-5999)
  NETWORK_ERROR: { code: 5000, message: 'Network error occurred' },
  SERVICE_UNAVAILABLE: { code: 5001, message: 'Service is unavailable' },
  TIMEOUT: { code: 5002, message: 'Operation timed out' },
  
  // System errors (9000-9999)
  INTERNAL_ERROR: { code: 9000, message: 'Internal system error' },
  NOT_IMPLEMENTED: { code: 9001, message: 'Feature not implemented' },
  UNKNOWN_ERROR: { code: 9999, message: 'Unknown error occurred' }
};

// Error code to HTTP status code mapping
export const ErrorCodeToHttpStatus: Record<number, number> = {
  // Validation errors -> 400 Bad Request
  1000: 400,
  1001: 400,
  1002: 400,
  
  // Authentication errors -> 401 Unauthorized
  2000: 401,
  2001: 401,
  2002: 401,
  2003: 401,
  
  // Authorization errors -> 403 Forbidden
  3000: 403,
  3001: 403,
  3002: 403,
  
  // Data errors -> 404 Not Found or 409 Conflict
  4000: 404,
  4001: 409,
  4002: 500,
  4003: 500,
  4004: 409,
  
  // Network errors -> 503 Service Unavailable or 504 Gateway Timeout
  5000: 503,
  5001: 503,
  5002: 504,
  
  // System errors -> 500 Internal Server Error
  9000: 500,
  9001: 501,
  9999: 500
};

// Standard error response structure
export interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    details?: unknown;
    timestamp?: string;
    path?: string;
    stack?: string;
  };
}

// Application Error class for standardized error handling
export class AppError extends Error {
  code: number;
  userMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: unknown;
  timestamp: string;
  path?: string;
  
  constructor(
    codeRef: keyof typeof ErrorCodes | number,
    options: {
      message?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      details?: unknown;
      path?: string;
    } = {}
  ) {
    // Handle code reference or direct code number
    const errorCode = typeof codeRef === 'number' 
      ? codeRef 
      : ErrorCodes[codeRef]?.code || ErrorCodes.UNKNOWN_ERROR.code;
    
    // Get default message for the error code
    const defaultMessage = Object.values(ErrorCodes).find(e => e.code === errorCode)?.message 
      || ErrorCodes.UNKNOWN_ERROR.message;
    
    // Use provided message or default
    const message = options.message || defaultMessage;
    
    super(message);
    
    this.name = 'AppError';
    this.code = errorCode;
    this.userMessage = message;
    this.category = options.category || ErrorCategory.SYSTEM;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.path = options.path;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
  
  // Convert to standard error response format
  toErrorResponse(includeDebugInfo = false): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: this.code,
        message: this.userMessage,
        category: this.category,
        severity: this.severity,
        timestamp: this.timestamp,
        path: this.path
      }
    };
    
    // Include details and stack trace for debugging if requested
    if (includeDebugInfo) {
      response.error.details = this.details;
      response.error.stack = this.stack;
    }
    
    return response;
  }
  
  // Get appropriate HTTP status code for this error
  getHttpStatus(): number {
    return ErrorCodeToHttpStatus[this.code] || 500;
  }
}

// Global error handler to standardize error handling
export function handleError(
  error: unknown, 
  options: { 
    includeDebugInfo?: boolean;
    logError?: boolean;
  } = {}
): ErrorResponse {
  const { includeDebugInfo = false, logError = true } = options;
  
  // Default error response
  let appError: AppError;
  
  // Normalize different error types to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError('INTERNAL_ERROR', {
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    });
  } else {
    appError = new AppError('UNKNOWN_ERROR', {
      details: error
    });
  }
  
  // Log the error if requested
  if (logError) {
    logErrorToConsole(appError);
  }
  
  // Return standardized error response
  return appError.toErrorResponse(includeDebugInfo);
}

// Helper to determine if an error is a specific category
export function isErrorOfCategory(
  error: unknown, 
  category: ErrorCategory
): boolean {
  return error instanceof AppError && error.category === category;
}

// Helper to determine if an error is a specific code
export function isErrorOfCode(
  error: unknown, 
  code: number | keyof typeof ErrorCodes
): boolean {
  if (!(error instanceof AppError)) return false;
  
  const errorCode = typeof code === 'number' 
    ? code 
    : ErrorCodes[code]?.code;
    
  return error.code === errorCode;
}

// Helper to convert any error to an AppError
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError('INTERNAL_ERROR', {
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    });
  }
  
  return new AppError('UNKNOWN_ERROR', {
    details: error
  });
}

// Simple console logger for errors
function logErrorToConsole(error: AppError): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    code: error.code,
    message: error.message,
    category: error.category,
    severity: error.severity,
    path: error.path,
    details: error.details,
    stack: error.stack
  };
  
  console.error('ERROR:', JSON.stringify(logEntry, null, 2));
}

// Create a validation error with appropriate defaults
export function createValidationError(
  message: string,
  details?: unknown
): AppError {
  return new AppError('INVALID_INPUT', {
    message,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.WARNING,
    details
  });
}

// Create an authentication error with appropriate defaults
export function createAuthError(
  codeRef: 'AUTH_REQUIRED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCOUNT_LOCKED',
  message?: string,
  details?: unknown
): AppError {
  return new AppError(codeRef, {
    message,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.ERROR,
    details
  });
}

// Create a not found error with appropriate defaults
export function createNotFoundError(
  resourceType: string,
  resourceId?: string
): AppError {
  const message = resourceId
    ? `${resourceType} with ID ${resourceId} not found`
    : `${resourceType} not found`;
    
  return new AppError('NOT_FOUND', {
    message,
    category: ErrorCategory.DATA,
    severity: ErrorSeverity.WARNING
  });
}
