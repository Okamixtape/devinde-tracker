'use client';

import { useState, useCallback } from 'react';
import { useToast } from '../components/error/ToastManager';
import { ServiceResult } from '../services/interfaces/data-models';
import { AppError, ErrorCategory, ErrorSeverity } from '../services/utils/error-handling';

// Options pour l'operation asynchrone
export interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  throwError?: boolean;
  skipToastForCodes?: number[];
  errorCategory?: ErrorCategory;
  errorSeverity?: ErrorSeverity;
}

// Retour du hook useAsyncHandler
export interface AsyncHandlerReturn<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

/**
 * Hook pour simplifier la gestion des opérations asynchrones avec feedback utilisateur
 * Particulièrement utile pour les appels de services retournant un ServiceResult
 */
export function useAsyncHandler<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T | ServiceResult<T>>,
  options: AsyncOperationOptions<T> = {}
): AsyncHandlerReturn<T, Args> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = !!successMessage,
    showErrorToast = true,
    throwError = false,
    skipToastForCodes = [],
    errorCategory = ErrorCategory.SYSTEM,
    errorSeverity = ErrorSeverity.ERROR
  } = options;

  // États
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  // Accès au gestionnaire de toasts
  const { showSuccess, showError } = useToast();

  // Réinitialiser les états
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  // Fonction d'exécution
  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...args);
      
      // Vérifier si le résultat est un ServiceResult
      const isServiceResult = result && typeof result === 'object' && 'success' in result;
      
      if (isServiceResult) {
        const serviceResult = result as ServiceResult<T>;
        
        if (serviceResult.success) {
          // Opération réussie
          setData(serviceResult.data || null);
          
          if (onSuccess && serviceResult.data) {
            onSuccess(serviceResult.data);
          }
          
          if (showSuccessToast && successMessage) {
            showSuccess(successMessage);
          }
          
          return serviceResult.data || null;
        } else {
          // Opération échouée
          const appError = new AppError(9999, {
            message: serviceResult.error?.message || errorMessage || 'Une erreur est survenue',
            category: errorCategory,
            severity: errorSeverity,
            details: serviceResult.error?.details
          });
          
          throw appError;
        }
      } else {
        // Résultat direct (non-ServiceResult)
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (showSuccessToast && successMessage) {
          showSuccess(successMessage);
        }
        
        return result;
      }
    } catch (err) {
      // Gestion des erreurs
      let handledException: AppError;
      
      if (err instanceof AppError) {
        handledException = err;
      } else if (err instanceof Error) {
        handledException = new AppError('INTERNAL_ERROR', {
          message: errorMessage || err.message,
          category: errorCategory,
          severity: errorSeverity,
          details: err.stack
        });
      } else {
        handledException = new AppError('UNKNOWN_ERROR', {
          message: errorMessage || 'Une erreur inconnue est survenue',
          category: errorCategory,
          severity: errorSeverity,
          details: err
        });
      }
      
      setError(handledException);
      
      if (onError) {
        onError(handledException);
      }
      
      // Afficher le toast d'erreur si requis et si le code n'est pas dans la liste à ignorer
      if (showErrorToast && !skipToastForCodes.includes(handledException.code)) {
        showError(handledException);
      }
      
      // Propager l'erreur si demandé
      if (throwError) {
        throw handledException;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    asyncFn, onSuccess, onError, successMessage, errorMessage,
    showSuccessToast, showErrorToast, throwError, skipToastForCodes,
    showSuccess, showError, errorCategory, errorSeverity
  ]);

  return { execute, isLoading, error, data, reset };
}

export default useAsyncHandler;
