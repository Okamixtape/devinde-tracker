import { useState, useCallback } from 'react';
import { IErrorService } from '../services/interfaces/IErrorService';
import errorService from '../services/core/errorService';
import { ServiceResult } from '../services/interfaces/dataModels';

interface ErrorHandlingOptions {
  /** Contexte à inclure avec l'erreur */
  context?: Record<string, unknown>;
  /** Message d'erreur personnalisé à utiliser */
  errorMessage?: string;
  /** Niveau de détail pour les erreurs (true = détaillé) */
  includeDebugInfo?: boolean;
}

/**
 * Hook personnalisé pour gérer les erreurs de manière standardisée
 * 
 * Ce hook illustre le principe d'Inversion de Dépendance en permettant l'injection
 * d'une implémentation d'IErrorService, tout en fournissant une valeur par défaut.
 * 
 * @param errorSvc - Service d'erreur à utiliser (optionnel)
 * @returns Objet contenant des utilitaires pour gérer les erreurs
 * 
 * @example
 * // Usage basique
 * const { handleError, withErrorHandling, isLoading, error, clearError } = useErrorHandling();
 * 
 * // Gestion d'erreur simple
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleError(error);
 * }
 * 
 * // Avec le wrapper
 * const handleSubmit = withErrorHandling(async () => {
 *   await submitForm(data);
 * }, { context: { form: 'login' } });
 */
export function useErrorHandling(errorSvc: IErrorService = errorService) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Gère une erreur en utilisant le service d'erreur et stocke l'erreur localement
   */
  const handleError = useCallback((err: unknown, options?: ErrorHandlingOptions) => {
    const error = err instanceof Error ? err : new Error(String(err));
    
    // Utiliser le service d'erreur pour le traitement standard
    errorSvc.handleError(error, {
      context: options?.context,
      includeDebugInfo: options?.includeDebugInfo
    });
    
    // Stocker l'erreur dans l'état local
    setError(error);
    setIsLoading(false);
    
    return error;
  }, [errorSvc]);
  
  /**
   * Enveloppe une fonction async avec gestion d'erreur standardisée
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: ErrorHandlingOptions
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fn(...args);
        setIsLoading(false);
        return result;
      } catch (err) {
        handleError(err, options);
        return null;
      }
    };
  }, [handleError]);
  
  /**
   * Version qui retourne un ServiceResult
   */
  const withServiceResult = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: ErrorHandlingOptions
  ) => {
    return async (...args: T): Promise<ServiceResult<R>> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fn(...args);
        setIsLoading(false);
        return errorSvc.createSuccessResult(result);
      } catch (err) {
        handleError(err, options);
        return errorSvc.createErrorResult<R>(err, {
          context: options?.context,
          includeDebugInfo: options?.includeDebugInfo
        });
      }
    };
  }, [errorSvc, handleError]);
  
  /**
   * Efface l'erreur actuellement stockée
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Détermine si une erreur est d'un certain type
   */
  const isErrorOfType = useCallback(
    (errorType: string | RegExp): boolean => {
      if (!error) return false;
      
      if (typeof errorType === 'string') {
        return error.name === errorType || error.message.includes(errorType);
      }
      
      return errorType.test(error.name) || errorType.test(error.message);
    },
    [error]
  );
  
  return {
    error,
    isLoading,
    handleError,
    withErrorHandling,
    withServiceResult,
    clearError,
    isErrorOfType
  };
}

export default useErrorHandling;