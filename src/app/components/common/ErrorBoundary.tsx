'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IErrorService } from '../../services/interfaces/IErrorService';
import errorService from '../../services/core/errorService';

interface ErrorBoundaryProps {
  /** Contenu à encapsuler et protéger des erreurs */
  children: ReactNode;
  /** Service de gestion d'erreur à utiliser (utilise l'instance par défaut si non fourni) */
  errorService?: IErrorService;
  /** Composant de secours à afficher en cas d'erreur */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Fonction appelée lorsqu'une erreur est capturée */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** ID unique pour identifier cette boundary */
  id?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Composant qui capture les erreurs JavaScript dans son arbre d'enfants
 * et affiche un fallback UI au lieu de l'arbre qui a planté.
 *
 * Implémente le pattern d'inversion de dépendance en permettant l'injection
 * d'un service d'erreur personnalisé via les props.
 *
 * @example
 * // Usage basique
 * <ErrorBoundary>
 *   <ComponentQuiPeutPlanter />
 * </ErrorBoundary>
 *
 * @example
 * // Avec un fallback personnalisé
 * <ErrorBoundary 
 *   fallback={<div>Quelque chose s'est mal passé</div>}
 *   onError={(error) => console.error('Erreur capturée:', error)}
 * >
 *   <MonComposant />
 * </ErrorBoundary>
 *
 * @example
 * // Avec une fonction de fallback qui permet de réessayer
 * <ErrorBoundary 
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Erreur: {error.message}</p>
 *       <button onClick={reset}>Réessayer</button>
 *     </div>
 *   )}
 * >
 *   <MonComposant />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private readonly errorSvc: IErrorService;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
    
    // Utiliser le service fourni en prop ou l'instance par défaut
    this.errorSvc = props.errorService || errorService;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour le prochain rendu
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Journaliser l'erreur
    this.errorSvc.handleError(error, {
      context: {
        component: 'ErrorBoundary',
        boundaryId: this.props.id,
        componentStack: errorInfo.componentStack,
        react: true
      }
    });
    
    // Appeler le callback onError s'il existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ 
      hasError: false,
      error: null 
    });
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError && error) {
      // Afficher le fallback personnalisé
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }
      
      // Fallback par défaut
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Une erreur est survenue</h2>
          <p className="mb-4">{error.message || 'Une erreur inconnue est survenue'}</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={this.resetError}
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    return children;
  }
}

export default ErrorBoundary;