/**
 * Security Utilities for DevIndé Tracker
 * 
 * This module provides security features to protect client-side data
 * and operations from common vulnerabilities. It includes:
 * 
 * - Data encryption/decryption for localStorage
 * - Input validation and sanitization
 * - XSS protection
 * - Rate limiting for UI operations
 * - Suspicious activity monitoring
 */

import { ErrorCategory, ErrorSeverity, AppError } from './error-handling';

// Préfixe utilisé pour marquer les données chiffrées
const ENCRYPTION_PREFIX = 'DEVINDE_ENC_V1:';

/**
 * Simple client-side encryption for localStorage data
 * Note: This is not meant to be cryptographically secure, but to provide
 * basic protection against casual inspection of localStorage
 */
export function encryptData(data: unknown): string {
  try {
    // Version simplifiée et robuste : nous utilisons simplement Base64
    // pour encoder les données, avec un marqueur pour indiquer qu'elles sont encodées
    const serialized = JSON.stringify(data);
    const encoded = btoa(serialized);
    return `${ENCRYPTION_PREFIX}${encoded}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new AppError(1100, {
      message: 'Failed to encrypt data',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      details: error
    });
  }
}

/**
 * Decrypt data from localStorage
 */
export function decryptData<T>(encryptedData: string): T {
  try {
    // Vérifier si les données sont dans le nouveau format
    if (encryptedData.startsWith(ENCRYPTION_PREFIX)) {
      const encoded = encryptedData.slice(ENCRYPTION_PREFIX.length);
      const decoded = atob(encoded);
      return JSON.parse(decoded) as T;
    }
    
    // Si pas au nouveau format, essayons simplement de parser directement
    // (pour les données qui n'étaient peut-être pas du tout chiffrées)
    return JSON.parse(encryptedData) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new AppError(1101, {
      message: 'Failed to decrypt data',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      details: error
    });
  }
}

/**
 * Secure storage wrapper for localStorage with encryption
 */
export const secureLocalStorage = {
  setItem(key: string, value: unknown): void {
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Failed to securely store item with key ${key}:`, 
        error instanceof Error ? error.message : 'Unknown error');
      // En cas d'erreur, essayer de nettoyer cette entrée
      localStorage.removeItem(key);
      throw error;
    }
  },
  
  getItem<T>(key: string): T | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) {
        return null;
      }
      
      try {
        return decryptData<T>(encryptedValue);
      } catch (error) {
        console.error(`Failed to decrypt item with key ${key}, removing corrupted data:`, 
          error instanceof Error ? error.message : 'Unknown error');
        // Supprimer automatiquement les données corrompues
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, 
        error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item with key ${key}:`, 
        error instanceof Error ? error.message : 'Unknown error');
    }
  },
  
  clear(): void {
    try {
      // Supprimer uniquement les clés liées à l'application
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devinde-tracker')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear secure localStorage:', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }
};

/**
 * HTML sanitization to prevent XSS attacks
 * In a real app, use a dedicated library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Simple approach - strip all HTML tags
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Input validation for string inputs
 */
export function validateInput(
  value: string, 
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowedChars?: string;
    disallowedChars?: string;
  } = {}
): { valid: boolean; error?: string } {
  const { 
    minLength, 
    maxLength, 
    pattern,
    allowedChars,
    disallowedChars
  } = options;
  
  // Check min length
  if (minLength !== undefined && value.length < minLength) {
    return { 
      valid: false, 
      error: `Input must be at least ${minLength} characters long` 
    };
  }
  
  // Check max length
  if (maxLength !== undefined && value.length > maxLength) {
    return { 
      valid: false, 
      error: `Input must be at most ${maxLength} characters long` 
    };
  }
  
  // Check regex pattern
  if (pattern && !pattern.test(value)) {
    return { 
      valid: false, 
      error: 'Input format is invalid' 
    };
  }
  
  // Check allowed characters
  if (allowedChars) {
    const allowedSet = new Set(allowedChars.split(''));
    for (const char of value) {
      if (!allowedSet.has(char)) {
        return { 
          valid: false, 
          error: `Input contains invalid character: "${char}"` 
        };
      }
    }
  }
  
  // Check disallowed characters
  if (disallowedChars) {
    const disallowedSet = new Set(disallowedChars.split(''));
    for (const char of value) {
      if (disallowedSet.has(char)) {
        return { 
          valid: false, 
          error: `Input contains disallowed character: "${char}"` 
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Type of operation for rate limiting
 */
export enum RateLimitOperation {
  DATA_READ = 'data_read',
  DATA_WRITE = 'data_write',
  AUTHENTICATION = 'auth',
  EXPORT = 'export',
  API_CALL = 'api_call'
}

// Rate limits for different operations
const RATE_LIMITS: Record<RateLimitOperation, { maxOperations: number; intervalMs: number }> = {
  [RateLimitOperation.DATA_READ]: { maxOperations: 100, intervalMs: 60000 }, // 100 reads per minute
  [RateLimitOperation.DATA_WRITE]: { maxOperations: 30, intervalMs: 60000 }, // 30 writes per minute
  [RateLimitOperation.AUTHENTICATION]: { maxOperations: 5, intervalMs: 60000 }, // 5 auth operations per minute
  [RateLimitOperation.EXPORT]: { maxOperations: 5, intervalMs: 60000 }, // 5 exports per minute
  [RateLimitOperation.API_CALL]: { maxOperations: 50, intervalMs: 60000 } // 50 API calls per minute
};

// Track operations for rate limiting
const operationTracker: Record<RateLimitOperation, { timestamp: number; count: number }[]> = {
  [RateLimitOperation.DATA_READ]: [],
  [RateLimitOperation.DATA_WRITE]: [],
  [RateLimitOperation.AUTHENTICATION]: [],
  [RateLimitOperation.EXPORT]: [],
  [RateLimitOperation.API_CALL]: []
};

/**
 * Check rate limits for an operation
 * Returns true if operation is allowed, false if rate limit is exceeded
 */
export function checkRateLimit(operation: RateLimitOperation): boolean {
  const now = Date.now();
  const { maxOperations, intervalMs } = RATE_LIMITS[operation];
  
  // Clean up old entries
  operationTracker[operation] = operationTracker[operation].filter(
    entry => now - entry.timestamp < intervalMs
  );
  
  // Check if rate limit is exceeded
  if (operationTracker[operation].length >= maxOperations) {
    return false;
  }
  
  // Record new operation
  operationTracker[operation].push({ timestamp: now, count: 1 });
  return true;
}

/**
 * Apply throttling to a function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  operation: RateLimitOperation
): (...args: Parameters<T>) => ReturnType<T> | Promise<ReturnType<T>> {
  return (...args: Parameters<T>): ReturnType<T> | Promise<ReturnType<T>> => {
    if (!checkRateLimit(operation)) {
      throw new AppError(1102, {
        message: 'Operation rate limit exceeded. Please try again later.',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.WARNING
      });
    }
    
    return func(...args) as ReturnType<T>;
  };
}

// Suspicious activity detection thresholds
const SUSPICIOUS_THRESHOLDS = {
  FAILED_LOGINS: 3, // Number of failed logins before triggering alert
  RAPID_DATA_CHANGES: 20, // Number of data changes in a short period
  LARGE_DATA_DELETIONS: 5, // Number of deletions in a short period
};

// Track suspicious activities
let suspiciousActivities: {
  activityType: string;
  timestamp: number;
  details: unknown;
}[] = [];

/**
 * Record a potentially suspicious activity
 */
export function recordSuspiciousActivity(
  activityType: string,
  details: unknown
): void {
  const now = Date.now();
  
  suspiciousActivities.push({
    activityType,
    timestamp: now,
    details
  });
  
  // Log to console for demonstration purposes
  console.warn('Suspicious activity detected:', activityType, details);
  
  // In a real app, this might send data to a monitoring service
  // or trigger additional security measures
}

/**
 * Check for patterns of suspicious activity
 */
export function checkSuspiciousPatterns(): {
  hasSuspiciousActivity: boolean;
  details: { activityType: string; count: number }[];
} {
  const now = Date.now();
  const recentActivities = suspiciousActivities.filter(
    activity => now - activity.timestamp < 30 * 60 * 1000 // Last 30 minutes
  );
  
  // Group by activity type
  const activityCounts: Record<string, number> = {};
  for (const activity of recentActivities) {
    activityCounts[activity.activityType] = (activityCounts[activity.activityType] || 0) + 1;
  }
  
  // Check thresholds
  const suspiciousPatterns = [];
  
  if (activityCounts['failedLogin'] >= SUSPICIOUS_THRESHOLDS.FAILED_LOGINS) {
    suspiciousPatterns.push({ 
      activityType: 'failedLogin', 
      count: activityCounts['failedLogin'] 
    });
  }
  
  if (activityCounts['dataChange'] >= SUSPICIOUS_THRESHOLDS.RAPID_DATA_CHANGES) {
    suspiciousPatterns.push({ 
      activityType: 'dataChange', 
      count: activityCounts['dataChange'] 
    });
  }
  
  if (activityCounts['dataDeletion'] >= SUSPICIOUS_THRESHOLDS.LARGE_DATA_DELETIONS) {
    suspiciousPatterns.push({ 
      activityType: 'dataDeletion', 
      count: activityCounts['dataDeletion'] 
    });
  }
  
  return {
    hasSuspiciousActivity: suspiciousPatterns.length > 0,
    details: suspiciousPatterns
  };
}

/**
 * Clear old suspicious activities
 */
export function cleanupSuspiciousActivities(): void {
  const now = Date.now();
  // Keep only activities from the last 24 hours
  suspiciousActivities = suspiciousActivities.filter(
    activity => now - activity.timestamp < 24 * 60 * 60 * 1000
  );
}

/**
 * Generate a CSRF token for forms
 * This is more relevant for server interactions, but included for completeness
 */
export function generateCsrfToken(): string {
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Set up CSRF protection
 * Store the token in secureLocalStorage and return it for use in forms
 */
export function setupCsrfProtection(): string {
  const token = generateCsrfToken();
  secureLocalStorage.setItem('csrf_token', token);
  return token;
}

/**
 * Validate a CSRF token against the stored token
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = secureLocalStorage.getItem<string>('csrf_token');
  return storedToken === token;
}

/**
 * Schedule regular cleanup and monitoring tasks
 */
export function initializeSecurityMonitoring(): void {
  // Clean up old suspicious activities every hour
  setInterval(cleanupSuspiciousActivities, 60 * 60 * 1000);
  
  // Check for suspicious patterns every 5 minutes
  setInterval(() => {
    const result = checkSuspiciousPatterns();
    if (result.hasSuspiciousActivity) {
      console.warn('Suspicious activity patterns detected:', result.details);
      // In a real app, this might trigger additional security measures
      // or send an alert to the user
    }
  }, 5 * 60 * 1000);
}
