'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { IErrorService } from '../services/interfaces/IErrorService';
import errorService from '../services/core/errorService';
import { ErrorContainer } from '../components/common/ErrorContainer';

interface ErrorContextProps {
  /** Service d'erreur à utiliser */
  errorService?: IErrorService;
  /** Enfants du context provider */
  children: ReactNode;
  /** Afficher un conteneur d'erreurs global */
  showGlobalErrors?: boolean;
  /** Nombre maximum d'erreurs à afficher */
  maxErrors?: number;
  /** Afficher les détails techniques des erreurs */
  showErrorDetails?: boolean;
  /** Durée d'affichage des erreurs auto-dismiss en ms */
  autoDismissAfter?: number;
}

interface ErrorContextValue {
  /** Service d'erreur */
  errorService: IErrorService;
  /** Dernières erreurs capturées */
  recentErrors: Array<{id: string, error: unknown}>;
  /** Effacer toutes les erreurs */
  clearAllErrors: () => void;
  /** Effacer une erreur spécifique */
  clearError: (errorId: string) => void;
}

// Création du contexte avec une valeur par défaut
const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

/**
 * Provider de contexte pour la gestion des erreurs au niveau application
 * 
 * Fournit un accès centralisé au service d'erreur et aux erreurs récentes
 * 
 * @example
 * <ErrorContextProvider showGlobalErrors>
 *   <App />
 * </ErrorContextProvider>
 */
export const ErrorContextProvider: React.FC<ErrorContextProps> = ({
  errorService: providedErrorService,
  children,
  showGlobalErrors = true,
  maxErrors = 3,
  showErrorDetails = process.env.NODE_ENV === 'development',
  autoDismissAfter = 5000
}) => {
  // Utiliser le service fourni ou celui par défaut
  const errorSvc = providedErrorService || errorService;
  
  // État pour stocker les erreurs récentes
  const [recentErrors, setRecentErrors] = useState<Array<{id: string, error: unknown}>>([]);
  
  // S'abonner aux erreurs émises par le service
  useEffect(() => {
    const handleError = (error: unknown) => {
      setRecentErrors(prev => {
        // Ajouter la nouvelle erreur au début du tableau
        const newErrors = [{ id: Date.now().toString(), error }, ...prev];
        // Limiter le nombre d'erreurs
        return newErrors.slice(0, maxErrors);
      });
    };
    
    // Ajouter le gestionnaire
    errorSvc.addErrorHandler(handleError);
    
    // Nettoyer l'abonnement
    return () => {
      errorSvc.removeErrorHandler(handleError);
    };
  }, [errorSvc, maxErrors]);
  
  // Fonction pour effacer toutes les erreurs
  const clearAllErrors = () => {
    setRecentErrors([]);
  };
  
  // Fonction pour effacer une erreur spécifique
  const clearError = (errorId: string) => {
    setRecentErrors(prev => prev.filter(e => e.id !== errorId));
  };
  
  // Valeur du contexte
  const contextValue: ErrorContextValue = {
    errorService: errorSvc,
    recentErrors,
    clearAllErrors,
    clearError
  };
  
  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Conteneur d'erreurs global */}
      {showGlobalErrors && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
          <ErrorContainer 
            errorService={errorSvc}
            maxErrors={maxErrors}
            showDetails={showErrorDetails}
            autoDismissAfter={autoDismissAfter}
            variant="toast"
          />
        </div>
      )}
    </ErrorContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'erreur
 * Lève une exception si utilisé en dehors d'un ErrorContextProvider
 */
export const useErrorContext = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorContext doit être utilisé à l'intérieur d'un ErrorContextProvider');
  }
  
  return context;
};

export default ErrorContextProvider;