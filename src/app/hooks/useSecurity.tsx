'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  validateInput, 
  sanitizeHtml, 
  checkRateLimit, 
  RateLimitOperation,
  checkSuspiciousPatterns,
  setupCsrfProtection,
  validateCsrfToken,
  recordSuspiciousActivity
} from '../services/utils/security';
import { useErrorHandling } from '../providers/ErrorHandlingProvider';
import { AppError, ErrorCategory, ErrorSeverity } from '../services/utils/error-handling';

/**
 * Hook for using security features in React components
 */
export function useSecurity() {
  const { setError } = useErrorHandling();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isRateLimited, setIsRateLimited] = useState<Record<RateLimitOperation, boolean>>({
    [RateLimitOperation.DATA_READ]: false,
    [RateLimitOperation.DATA_WRITE]: false,
    [RateLimitOperation.AUTHENTICATION]: false,
    [RateLimitOperation.EXPORT]: false,
    [RateLimitOperation.API_CALL]: false
  });
  
  // Initialize CSRF protection on mount
  useEffect(() => {
    try {
      const token = setupCsrfProtection();
      setCsrfToken(token);
    } catch (error) {
      console.error('Failed to set up CSRF protection:', error);
    }
  }, []);
  
  // Check for suspicious activity patterns periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const result = checkSuspiciousPatterns();
      if (result.hasSuspiciousActivity) {
        // Show a warning to the user
        setError(new AppError('SUSPICIOUS_ACTIVITY', {
          message: 'Suspicious activity detected on your account',
          severity: ErrorSeverity.WARNING,
          category: ErrorCategory.SECURITY,
          details: result.details
        }));
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(checkInterval);
  }, [setError]);
  
  /**
   * Validate user input with configurable rules
   */
  const validateUserInput = useCallback((
    value: string, 
    options: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowedChars?: string;
      disallowedChars?: string;
      required?: boolean;
      fieldName?: string;
    } = {}
  ) => {
    const { required, fieldName = 'Input' } = options;
    
    // Check if required
    if (required && (!value || value.trim() === '')) {
      return { 
        valid: false, 
        error: `${fieldName} is required` 
      };
    }
    
    // Skip validation if empty and not required
    if (!value || value.trim() === '') {
      return { valid: true };
    }
    
    return validateInput(value, options);
  }, []);
  
  /**
   * Sanitize HTML content to prevent XSS
   */
  const sanitizeContent = useCallback((html: string) => {
    return sanitizeHtml(html);
  }, []);
  
  /**
   * Check rate limit for an operation
   * Automatically updates state and throws errors if needed
   */
  const checkOperationRateLimit = useCallback((
    operation: RateLimitOperation,
    options: { throwError?: boolean } = {}
  ) => {
    const { throwError = true } = options;
    
    const isAllowed = checkRateLimit(operation);
    
    // Update rate limit state
    setIsRateLimited(prev => ({
      ...prev,
      [operation]: !isAllowed
    }));
    
    if (!isAllowed && throwError) {
      throw new AppError('RATE_LIMIT_EXCEEDED', {
        message: 'You are performing this action too frequently. Please try again later.',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.WARNING
      });
    }
    
    return isAllowed;
  }, []);
  
  /**
   * Report suspicious activity
   */
  const reportSuspiciousActivity = useCallback((
    activityType: string,
    details: unknown
  ) => {
    recordSuspiciousActivity(activityType, details);
  }, []);
  
  return {
    // Input validation
    validateUserInput,
    
    // Content sanitization
    sanitizeContent,
    
    // CSRF protection
    csrfToken,
    validateCsrfToken,
    
    // Rate limiting
    isRateLimited,
    checkOperationRateLimit,
    
    // Suspicious activity
    reportSuspiciousActivity
  };
}

export default useSecurity;
