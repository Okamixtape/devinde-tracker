import React, { useEffect, useState } from 'react';
import errorService, { ErrorService } from '../../../services/core/errorService';
import { ErrorCategory } from '../../../services/utils/errorHandling';

export interface CardContainerProps {
  /**
   * Card title displayed in the header
   */
  title?: string | React.ReactNode;
  
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: string;
  
  /**
   * Actions to display in the card header (right side)
   */
  actions?: React.ReactNode;
  
  /**
   * Main content of the card
   */
  children: React.ReactNode;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Status variant that changes the card styling
   */
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Loading state - shows a loading indicator when true
   */
  isLoading?: boolean;
  
  /**
   * Error state - shows error UI when provided
   */
  error?: Error | unknown;
  
  /**
   * Empty state - shows empty state UI when true and children is empty
   */
  isEmpty?: boolean;
  
  /**
   * Custom message to show in empty state
   */
  emptyMessage?: string;
  
  /**
   * Custom component to show in empty state
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * CSS class to apply to the container
   */
  className?: string;
  
  /**
   * Optional error service for error handling
   */
  errorService?: ErrorService;
  
  /**
   * Whether to show the error inline
   */
  showInlineError?: boolean;
  
  /**
   * Callback when retry is clicked in error state
   */
  onRetry?: () => void;
}

/**
 * CardContainer - A versatile card component for displaying content with consistent styling
 * 
 * This component implements the standardized card pattern found throughout the application
 * design mockups. It provides built-in support for loading, empty, and error states,
 * as well as integration with the error service.
 */
export const CardContainer: React.FC<CardContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  footer,
  status = 'default',
  isLoading = false,
  error,
  isEmpty = false,
  emptyMessage = "Aucun élément à afficher",
  emptyComponent,
  className = '',
  errorService: providedErrorService,
  showInlineError = true,
  onRetry
}) => {
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    category?: string;
  } | null>(null);
  
  // Use the provided errorService or the default instance
  const errService = providedErrorService || errorService;
  
  // Process error if one is provided
  useEffect(() => {
    if (error) {
      const errorResponse = errService.handleError(error, {
        includeDebugInfo: process.env.NODE_ENV === 'development'
      });
      
      setErrorDetails({
        message: errorResponse.error.message,
        category: errorResponse.error.category
      });
    } else {
      setErrorDetails(null);
    }
  }, [error, errService]);

  // Helper to get border color classes based on status
  const getStatusClasses = () => {
    switch (status) {
      case 'success': return 'border-l-4 border-green-500';
      case 'warning': return 'border-l-4 border-yellow-500';
      case 'error': return 'border-l-4 border-red-500';
      case 'info': return 'border-l-4 border-blue-500';
      default: return '';
    }
  };

  // Determine if content is actually empty
  const hasContent = React.Children.count(children) > 0 && !isEmpty;
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-blue-600 opacity-75 flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <span className="mt-3 text-sm text-gray-400">Chargement en cours...</span>
      </div>
    </div>
  );

  // Render empty state
  const renderEmpty = () => {
    if (emptyComponent) {
      return emptyComponent;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    // Get error category and icon based on category
    const category = errorDetails?.category || 'system';
    let icon = (
      <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
    
    if (category === ErrorCategory.NETWORK) {
      icon = (
        <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    } else if (category === ErrorCategory.AUTHENTICATION) {
      icon = (
        <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {icon}
        <h3 className="text-lg font-medium text-gray-200 mb-2">Une erreur est survenue</h3>
        <p className="text-gray-400 mb-4">{errorDetails?.message || 'Impossible de charger le contenu'}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`bg-gray-800 rounded-lg shadow-md overflow-hidden ${getStatusClasses()} ${className}`}
      data-testid="card-container"
    >
      {/* Card Header */}
      {(title || actions) && (
        <div className="p-5 flex justify-between items-start">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-lg font-medium">{title}</h3>
            ) : title}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      {/* Card Content */}
      <div className={`p-5 ${title || actions ? 'pt-0' : ''}`}>
        {/* Show error if there is one and showInlineError is true */}
        {error && showInlineError ? renderError() : 
          // Otherwise show loading state, empty state, or content
          isLoading ? renderLoading() :
            !hasContent ? renderEmpty() :
              children
        }
      </div>
      
      {/* Card Footer */}
      {footer && (
        <div className="bg-gray-700 bg-opacity-50 p-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default CardContainer;