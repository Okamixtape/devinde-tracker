'use client';

import React from 'react';
import { AppError, ErrorCategory, ErrorSeverity } from '../../services/utils/errorHandling';
import Button from './Button';

export interface ErrorDisplayProps {
  /** L'erreur à afficher (AppError ou Error standard ou objet avec message) */
  error: unknown;
  /** Fonction appelée lorsque l'utilisateur souhaite réessayer */
  onRetry?: () => void;
  /** Fonction appelée lorsque l'utilisateur souhaite fermer l'erreur */
  onDismiss?: () => void;
  /** Style d'affichage (banner = pleine largeur, card = format carte) */
  variant?: 'banner' | 'card' | 'inline' | 'toast';
  /** Classe CSS additionnelle */
  className?: string;
  /** Afficher les détails techniques de l'erreur */
  showDetails?: boolean;
  /** Texte personnalisé pour le bouton de réessai */
  retryText?: string;
  /** Texte personnalisé pour le bouton de fermeture */
  dismissText?: string;
}

/**
 * Composant qui affiche une erreur de manière standardisée
 * 
 * Adapte l'affichage en fonction du type d'erreur et de la variante choisie
 * Démontre le principe d'interface-segregation en n'attendant que les props nécessaires
 * 
 * @example
 * // Affichage simple
 * <ErrorDisplay error={error} />
 * 
 * @example
 * // Avec bouton de réessai
 * <ErrorDisplay 
 *   error={error} 
 *   variant="card"
 *   onRetry={() => fetchData()}
 *   showDetails={isDevelopment}
 * />
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'card',
  className = '',
  showDetails = false,
  retryText = 'Réessayer',
  dismissText = 'Fermer'
}) => {
  // Extraire les informations d'erreur selon son type
  const getErrorInfo = () => {
    if (error instanceof AppError) {
      return {
        title: getCategoryTitle(error.category),
        message: error.userMessage || error.message,
        details: error.details,
        severity: error.severity,
        code: error.code
      };
    } else if (error instanceof Error) {
      return {
        title: 'Erreur',
        message: error.message,
        details: error.stack,
        severity: ErrorSeverity.ERROR,
        code: 'UNKNOWN'
      };
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      return {
        title: 'Erreur',
        message: String(error.message),
        details: error,
        severity: ErrorSeverity.ERROR,
        code: 'UNKNOWN'
      };
    } else {
      return {
        title: 'Erreur inconnue',
        message: 'Une erreur s\'est produite',
        details: error,
        severity: ErrorSeverity.ERROR,
        code: 'UNKNOWN'
      };
    }
  };

  const { title, message, details, severity, code } = getErrorInfo();

  // Obtenir un titre lisible pour la catégorie d'erreur
  function getCategoryTitle(category?: ErrorCategory): string {
    if (!category) return 'Erreur';
    
    switch (category) {
      case ErrorCategory.VALIDATION:
        return 'Erreur de validation';
      case ErrorCategory.AUTHENTICATION:
        return 'Erreur d\'authentification';
      case ErrorCategory.AUTHORIZATION:
        return 'Erreur d\'autorisation';
      case ErrorCategory.DATA:
        return 'Erreur de données';
      case ErrorCategory.NETWORK:
        return 'Erreur réseau';
      case ErrorCategory.UI:
        return 'Erreur d\'interface';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'Erreur métier';
      case ErrorCategory.SYSTEM:
        return 'Erreur système';
      default:
        return 'Erreur';
    }
  }

  // Obtenir les styles selon la sévérité de l'erreur
  function getSeverityStyles(severity: ErrorSeverity): { bg: string; border: string; text: string; icon: string } {
    switch (severity) {
      case ErrorSeverity.FATAL:
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-900',
          icon: '❌'
        };
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: '⚠️'
        };
      case ErrorSeverity.WARNING:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: '⚠️'
        };
      case ErrorSeverity.INFO:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-400',
          text: 'text-gray-800',
          icon: 'ℹ️'
        };
    }
  }

  const styles = getSeverityStyles(severity);
  
  // Appliquer différents styles selon la variante
  let containerClasses = '';
  
  switch (variant) {
    case 'banner':
      containerClasses = `w-full px-4 py-3 ${styles.bg} ${styles.border} border-l-4 ${styles.text} flex items-center justify-between`;
      break;
    case 'card':
      containerClasses = `rounded-lg shadow-sm p-4 ${styles.bg} ${styles.border} border ${styles.text}`;
      break;
    case 'inline':
      containerClasses = `${styles.text} flex items-center`;
      break;
    case 'toast':
      containerClasses = `rounded-lg shadow-md p-4 ${styles.bg} ${styles.border} border ${styles.text} max-w-md`;
      break;
  }

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex-1">
        {variant !== 'inline' && (
          <div className="flex items-center mb-2">
            <span className="mr-2">{styles.icon}</span>
            <h3 className="font-semibold">{title}</h3>
            {showDetails && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">{code}</span>
            )}
          </div>
        )}
        
        <div className={variant === 'inline' ? 'flex items-center' : ''}>
          {variant === 'inline' && <span className="mr-2">{styles.icon}</span>}
          <p className={variant === 'inline' ? 'text-sm' : 'mb-3'}>{message}</p>
        </div>
        
        {showDetails && details && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Afficher les détails</summary>
            <pre className="mt-2 p-2 bg-gray-800 text-gray-100 rounded overflow-auto text-xs">
              {typeof details === 'string' 
                ? details 
                : JSON.stringify(details, null, 2)}
            </pre>
          </details>
        )}
        
        {(onRetry || onDismiss) && variant !== 'inline' && (
          <div className="flex space-x-2 mt-3">
            {onRetry && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onRetry}
              >
                {retryText}
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onDismiss}
              >
                {dismissText}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {variant === 'inline' && onDismiss && (
        <button 
          className="ml-2 text-gray-500 hover:text-gray-700" 
          onClick={onDismiss}
          aria-label="Fermer"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;