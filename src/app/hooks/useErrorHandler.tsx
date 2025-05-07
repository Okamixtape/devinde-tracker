'use client';

import { useState, useCallback } from 'react';
import { AppError } from "../services/utils/errorHandling";

/**
 * Hook pour gérer les erreurs d'application de manière cohérente
 */
export const useErrorHandler = () => {
  // État de l'erreur
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Effacer l'erreur actuelle
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Gérer une erreur avec mise à jour d'état
  const handleErrorWithState = useCallback((err: unknown) => {
    if (err instanceof AppError) {
      setError(err);
    } else if (err instanceof Error) {
      setError(new AppError('UNKNOWN_ERROR', {
        message: err.message
      }));
    } else {
      setError(new AppError('UNKNOWN_ERROR', {
        message: 'Une erreur inconnue est survenue'
      }));
    }
    setIsLoading(false);
  }, []);

  // Exécuter une promesse avec gestion d'erreur
  const handlePromise = useCallback(<T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    return promise
      .then((result) => {
        setIsLoading(false);
        return result;
      })
      .catch((err) => {
        handleErrorWithState(err);
        throw err;
      });
  }, [clearError, handleErrorWithState]);

  return {
    error,
    isLoading,
    clearError,
    handleError: handleErrorWithState,
    handlePromise
  };
};

export default useErrorHandler;
