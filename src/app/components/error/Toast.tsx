'use client';

import React, { useState, useEffect } from 'react';
import { ErrorSeverity } from '../../services/utils/error-handling';

export type ToastType = 'success' | 'info' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom';

// Mappage des sévérités d'erreur vers les types de toast
const severityToToastTypeMap: Record<ErrorSeverity, ToastType> = {
  [ErrorSeverity.INFO]: 'info',
  [ErrorSeverity.WARNING]: 'warning',
  [ErrorSeverity.ERROR]: 'error',
  [ErrorSeverity.CRITICAL]: 'error',
  [ErrorSeverity.FATAL]: 'error',
};

export interface ToastProps {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  position?: ToastPosition;
  showDetails?: boolean;
  details?: string | Record<string, unknown>;
}

// Convertir une sévérité d'erreur en type de toast
export const getSeverityAsToastType = (severity: ErrorSeverity): ToastType => {
  return severityToToastTypeMap[severity];
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  position = 'top-right',
  showDetails = false,
  details
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Handle auto close
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Allow time for exit animation
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [autoClose, autoCloseDelay, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Allow time for exit animation
  };
  
  if (!isVisible) {
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
  
  // Determine toast style based on type
  let toastStyle = '';
  let iconStyle = '';
  
  switch (type) {
    case 'success':
      toastStyle = 'bg-green-50 border-green-300 text-green-800';
      iconStyle = 'text-green-500';
      break;
    case 'info':
      toastStyle = 'bg-blue-50 border-blue-300 text-blue-800';
      iconStyle = 'text-blue-500';
      break;
    case 'warning':
      toastStyle = 'bg-yellow-50 border-yellow-300 text-yellow-800';
      iconStyle = 'text-yellow-500';
      break;
    case 'error':
      toastStyle = 'bg-red-50 border-red-300 text-red-800';
      iconStyle = 'text-red-500';
      break;
    default:
      toastStyle = 'bg-gray-50 border-gray-300 text-gray-800';
      iconStyle = 'text-gray-500';
  }
  
  // Get details as string if they exist
  const detailsText = details
    ? typeof details === 'string'
      ? details
      : JSON.stringify(details, null, 2)
    : null;
  
  // Render appropriate icon based on type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Animation classes
  const animationClasses = "transition-all duration-300 transform";
  const enterClasses = "opacity-100 translate-y-0";
  const exitClasses = "opacity-0 translate-y-2";
  
  return (
    <div
      id={id}
      className={`fixed ${positionClass} z-50 max-w-md shadow-lg ${animationClasses} ${isVisible ? enterClasses : exitClasses}`}
      role="alert"
    >
      <div className={`${toastStyle} border rounded-lg p-4`}>
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className={`${iconStyle} mr-3`}>
              {renderIcon()}
            </div>
            <div>
              {title && <p className="font-semibold">{title}</p>}
              <p className={title ? "text-sm" : ""}>{message}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {showDetails && detailsText && (
          <details 
            className="mt-2 text-sm" 
            open={isDetailsOpen}
            onToggle={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            <summary className="cursor-pointer hover:text-blue-600">
              {isDetailsOpen ? "Masquer les détails" : "Afficher les détails"}
            </summary>
            <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-xs overflow-auto max-h-40">
              {detailsText}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default Toast;
