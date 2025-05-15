'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ErrorDisplay from './ErrorDisplay';
import { IErrorService } from '../../services/interfaces/IErrorService';
import errorService from '../../services/core/errorService';

export interface ErrorContainerProps {
  /** Service d'erreur à utiliser (utilise l'instance par défaut si non fourni) */
  errorService?: IErrorService;
  /** ID unique pour identifier ce conteneur (utilisé pour filtrer les erreurs) */
  id?: string;
  /** Contexte associé à ce conteneur (ex: 'checkout', 'login') */
  context?: string;
  /** Nombre d'erreurs à afficher (0 = toutes) */
  maxErrors?: number;
  /** Afficher les détails techniques des erreurs */
  showDetails?: boolean;
  /** Durée d'affichage des erreurs auto-dismiss en ms (0 = pas d'auto-dismiss) */
  autoDismissAfter?: number;
  /** Variante d'affichage des erreurs */
  variant?: 'banner' | 'card' | 'inline' | 'toast';
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Conteneur qui affiche les erreurs récentes capturées par le ErrorService
 * 
 * Démontre le pattern de composition et l'utilisation d'hooks avec inversion de dépendance
 * 
 * @example
 * // Usage basique
 * <ErrorContainer />
 * 
 * @example
 * // Usage avancé
 * <ErrorContainer 
 *   errorService={customErrorService}
 *   context="checkout" 
 *   maxErrors={3}
 *   variant="toast"
 *   autoDismissAfter={5000}
 * />
 */
export const ErrorContainer: React.FC<ErrorContainerProps> = ({
  errorService = errorService,
  id = 'global',
  context,
  maxErrors = 3,
  showDetails = false,
  autoDismissAfter = 0,
  variant = 'card',
  className = ''
}) => {
  const [errors, setErrors] = useState<{ id: string, error: unknown }[]>([]);
  
  // Fonction qui sera appelée par le service d'erreur
  const handleError = useCallback((error: unknown, errorContext?: Record<string, unknown>) => {
    // Ne pas traiter l'erreur si le contexte ne correspond pas
    if (context && errorContext && errorContext.context !== context) {
      return;
    }
    
    // Ajouter l'erreur à notre état local
    setErrors(prev => {
      const newErrors = [...prev, { id: Date.now().toString(), error }];
      // Limiter le nombre d'erreurs affichées si nécessaire
      return maxErrors > 0 ? newErrors.slice(0, maxErrors) : newErrors;
    });
  }, [context, maxErrors]);
  
  // Enregistrer notre handler au service d'erreur
  useEffect(() => {
    errorService.addErrorHandler(handleError);
    
    return () => {
      errorService.removeErrorHandler(handleError);
    };
  }, [errorService, handleError]);
  
  // Fonction pour retirer une erreur spécifique
  const dismissError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);
  
  // Configurer l'auto-dismiss si nécessaire
  useEffect(() => {
    if (autoDismissAfter <= 0) return;
    
    const timers = errors.map(e => {
      return setTimeout(() => {
        dismissError(e.id);
      }, autoDismissAfter);
    });
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [errors, autoDismissAfter, dismissError]);
  
  // Si aucune erreur, ne rien afficher
  if (errors.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`error-container ${className}`}
      data-testid={`error-container-${id}`}
    >
      {errors.map(({ id: errorId, error }) => (
        <div 
          key={errorId}
          className={variant === 'toast' ? 'mb-2' : ''}
        >
          <ErrorDisplay
            error={error}
            variant={variant}
            showDetails={showDetails}
            onDismiss={() => dismissError(errorId)}
          />
        </div>
      ))}
    </div>
  );
};

export default ErrorContainer;