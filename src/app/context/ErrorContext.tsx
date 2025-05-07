'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ErrorResponse, AppError, handleError, ErrorCategory, ErrorSeverity } from "@/app/services/utils/errorHandling";
import ErrorNotification from "@/app/components/error/ErrorNotification";

// Interface pour définir la forme du contexte d'erreur
interface ErrorContextType {
  // Erreur actuelle
  error: ErrorResponse | null;
  // Fonction pour définir une erreur
  setError: (error: unknown) => void;
  // Fonction pour effacer l'erreur
  clearError: () => void;
  // État de chargement global
  isLoading: boolean;
  // Fonction pour définir l'état de chargement
  setIsLoading: (loading: boolean) => void;
  // Historique des erreurs
  errorHistory: ErrorResponse[];
  // Fonction pour nettoyer l'historique des erreurs
  clearErrorHistory: () => void;
}

// Création du contexte avec une valeur par défaut
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Options pour la configuration du contexte d'erreur
interface ErrorProviderProps {
  children: ReactNode;
  maxHistorySize?: number;
  includeDebugInfo?: boolean;
  autoHideDelay?: number | null; // null pour ne jamais masquer automatiquement
  notificationPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom';
}

// Provider du contexte d'erreur
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxHistorySize = 10,
  includeDebugInfo = process.env.NODE_ENV === 'development',
  autoHideDelay = 5000,
  notificationPosition = 'top-right'
}) => {
  // État pour l'erreur actuelle
  const [error, setErrorState] = useState<ErrorResponse | null>(null);
  // État pour l'historique des erreurs
  const [errorHistory, setErrorHistory] = useState<ErrorResponse[]>([]);
  // État de chargement global
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction pour définir une erreur
  const setError = useCallback((err: unknown) => {
    // Convertir l'erreur reçue en ErrorResponse standardisée
    const errorResponse = handleError(err, { includeDebugInfo });

    // Mettre à jour l'état de l'erreur
    setErrorState(errorResponse);

    // Ajouter l'erreur à l'historique tout en respectant la taille maximale
    setErrorHistory(prev => {
      const newHistory = [errorResponse, ...prev];
      return newHistory.slice(0, maxHistorySize);
    });

    // Log l'erreur dans la console
    console.error('Error captured by ErrorContext:', errorResponse);

    return errorResponse;
  }, [includeDebugInfo, maxHistorySize]);

  // Fonction pour effacer l'erreur actuelle
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Fonction pour nettoyer l'historique des erreurs
  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  // Gestionnaire global d'erreurs non capturées
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setError(event.reason);
    };

    const handleWindowError = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error || new Error(event.message));
    };

    // Ajouter des écouteurs d'événements pour les erreurs non capturées
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
    };
  }, [setError]);

  return (
    <ErrorContext.Provider value={{
      error,
      setError,
      clearError,
      isLoading,
      setIsLoading,
      errorHistory,
      clearErrorHistory
    }}>
      {children}
      {error && (
        <ErrorNotification
          error={error}
          onClose={clearError}
          autoClose={autoHideDelay !== null}
          autoCloseDelay={autoHideDelay || undefined}
          position={notificationPosition}
          showDetails={includeDebugInfo}
        />
      )}
    </ErrorContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'erreur
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook personnalisé pour gérer les opérations async avec gestion d'erreur
export const useAsyncOperation = () => {
  const { setError, setIsLoading } = useError();

  // Fonction pour exécuter une opération async avec gestion d'erreur
  const runAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: {
      errorMessage?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      showLoading?: boolean;
      throwError?: boolean;
    } = {}
  ): Promise<T | null> => {
    const {
      errorMessage,
      category = ErrorCategory.SYSTEM,
      severity = ErrorSeverity.ERROR,
      showLoading = true,
      throwError = false
    } = options;

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      const result = await operation();
      return result;
    } catch (error) {
      let appError;
      
      if (error instanceof AppError) {
        appError = error;
      } else {
        appError = new AppError('INTERNAL_ERROR', {
          message: errorMessage || (error instanceof Error ? error.message : 'Une erreur est survenue'),
          category,
          severity,
          details: error
        });
      }
      
      setError(appError);
      
      if (throwError) {
        throw appError;
      }
      
      return null;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [setError, setIsLoading]);

  return { runAsync };
};

// Exporter le contexte lui-même (pour des utilisations avancées)
export default ErrorContext;
