'use client';

import React, { useState, useEffect } from 'react';
import { ErrorResponse, ErrorSeverity } from '../../services/utils/error-handling';

interface ErrorNotificationProps {
  error: ErrorResponse | null;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom';
  showDetails?: boolean;
}

/**
 * Error notification component for displaying errors to users
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  position = 'top-right',
  showDetails = false
}) => {
  const [isVisible, setIsVisible] = useState(!!error);
  
  // Handle auto close
  useEffect(() => {
    setIsVisible(!!error);
    
    if (error && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [error, autoClose, autoCloseDelay, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!error || !isVisible) {
    return null;
  }
  
  // Determine position class
  let positionClass = '';
  switch (position) {
    case 'top-right':
      positionClass = 'top-4 right-4';
      break;
    case 'top-left':
      positionClass = 'top-4 left-4';
      break;
    case 'bottom-right':
      positionClass = 'bottom-4 right-4';
      break;
    case 'bottom-left':
      positionClass = 'bottom-4 left-4';
      break;
    case 'top':
      positionClass = 'top-4 left-1/2 transform -translate-x-1/2';
      break;
    case 'bottom':
      positionClass = 'bottom-4 left-1/2 transform -translate-x-1/2';
      break;
    default:
      positionClass = 'top-4 right-4';
  }
  
  // Determine notification style based on error severity
  let notificationStyle = '';
  let iconStyle = '';
  const severity = error.error.severity || ErrorSeverity.ERROR;
  
  switch (severity) {
    case ErrorSeverity.INFO:
      notificationStyle = 'bg-blue-50 border-blue-300 text-blue-800';
      iconStyle = 'text-blue-500';
      break;
    case ErrorSeverity.WARNING:
      notificationStyle = 'bg-yellow-50 border-yellow-300 text-yellow-800';
      iconStyle = 'text-yellow-500';
      break;
    case ErrorSeverity.ERROR:
      notificationStyle = 'bg-red-50 border-red-300 text-red-800';
      iconStyle = 'text-red-500';
      break;
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.FATAL:
      notificationStyle = 'bg-purple-50 border-purple-300 text-purple-800';
      iconStyle = 'text-purple-500';
      break;
    default:
      notificationStyle = 'bg-gray-50 border-gray-300 text-gray-800';
      iconStyle = 'text-gray-500';
  }
  
  // Get details as string if they exist
  const errorDetails = error.error.details
    ? typeof error.error.details === 'string'
      ? error.error.details
      : JSON.stringify(error.error.details, null, 2)
    : null;
  
  return (
    <div className={`fixed ${positionClass} z-50 w-96 max-w-full shadow-lg`}>
      <div className={`${notificationStyle} border rounded-lg p-4`}>
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className={`${iconStyle} mr-3`}>
              {severity === ErrorSeverity.INFO && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {severity === ErrorSeverity.WARNING && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {(severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.FATAL) && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold">{error.error.message}</p>
              {error.error.code && (
                <p className="text-sm opacity-75">
                  Code: {error.error.code}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {showDetails && errorDetails && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Show Details</summary>
            <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-xs overflow-auto max-h-40">
              {errorDetails}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorNotification;
