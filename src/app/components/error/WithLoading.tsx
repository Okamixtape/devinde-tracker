'use client';

import React, { ComponentType, useState } from 'react';
import { useError } from '@/app/context/ErrorContext';

// Types d'options pour le HOC WithLoading
export interface WithLoadingOptions {
  loadingComponent?: React.ReactNode;
  globalLoading?: boolean;
  fullScreen?: boolean;
}

// Props pour le composant LoadingIndicator
interface LoadingIndicatorProps {
  fullScreen?: boolean;
}

// Composant de chargement par défaut
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ fullScreen = false }) => {
  const baseClass = "flex items-center justify-center p-4";
  const fullScreenClass = fullScreen 
    ? "fixed inset-0 bg-white bg-opacity-75 z-50" 
    : "min-h-[100px]";
    
  return (
    <div className={`${baseClass} ${fullScreenClass}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Chargement en cours...</p>
      </div>
    </div>
  );
};

// HOC pour ajouter un état de chargement à un composant
export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingOptions = {}
) {
  // Options par défaut
  const {
    loadingComponent = <LoadingIndicator fullScreen={options.fullScreen} />,
    globalLoading = false,
  } = options;

  // Composant avec état de chargement
  const WithLoadingComponent: React.FC<P & { 
    isLoading?: boolean;
    loadingMessage?: string;
  }> = (props) => {
    // État local de chargement
    const [localLoading, setLocalLoading] = useState(false);
    
    // Utiliser le contexte d'erreur pour l'état de chargement global
    const { isLoading: globalIsLoading } = useError();
    
    // Déterminer si on doit afficher le chargement
    const showLoading = props.isLoading || localLoading || (globalLoading && globalIsLoading);
    
    // Fonction pour contrôler l'état de chargement
    const setLoading = (loading: boolean) => {
      setLocalLoading(loading);
    };
    
    // Si en chargement, afficher l'indicateur
    if (showLoading) {
      return <>{loadingComponent}</>;
    }
    
    // Sinon, rendre le composant original avec des props supplémentaires
    return <WrappedComponent {...props} setLoading={setLoading} />;
  };
  
  // Définir le nom d'affichage pour faciliter le débogage
  WithLoadingComponent.displayName = `WithLoading(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return WithLoadingComponent;
}

export default withLoading;
