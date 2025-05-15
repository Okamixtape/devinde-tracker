'use client';

import React, { useState } from 'react';
import { 
  Button, 
  ErrorBoundary, 
  ErrorDisplay, 
  ErrorContainer,
  useErrorHandling
} from './common';
import { AppError, ErrorCategory, ErrorSeverity } from '../services/utils/errorHandling';

/**
 * Composant qui démontre l'utilisation des différentes approches de gestion d'erreur
 * REMARQUE: Ce composant est créé uniquement pour illustrer l'usage et n'est pas destiné à la production
 */
const ExampleUsage: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const { error, handleError, withErrorHandling, clearError, isLoading } = useErrorHandling();
  
  // Fonction qui génère une erreur pour démonstration
  const triggerError = () => {
    throw new Error('Ceci est une erreur de démonstration!');
  };
  
  // Fonction qui génère une AppError typée
  const triggerTypedError = () => {
    throw new AppError('INVALID_INPUT', {
      message: 'Données invalides fournies',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      details: { field: 'email', value: 'test', reason: 'format' }
    });
  };
  
  // Fonction async avec erreur pour tester withErrorHandling
  const asyncOperationWithError = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Erreur dans l\'opération asynchrone');
  };
  
  // Fonction encapsulée avec notre hook d'erreur
  const handleAsyncOperation = withErrorHandling(async () => {
    await asyncOperationWithError();
  });
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Démonstration des composants de gestion d'erreur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exemple d'ErrorBoundary */}
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">1. ErrorBoundary</h2>
          <p className="mb-4 text-gray-600">
            Capture les erreurs dans le cycle de vie du composant et affiche un fallback.
          </p>
          
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 mb-2">{error.message}</p>
                <Button variant="primary" size="sm" onClick={reset}>
                  Réinitialiser
                </Button>
              </div>
            )}
          >
            {showError ? (
              triggerError()
            ) : (
              <Button 
                variant="danger" 
                onClick={() => setShowError(true)}
              >
                Déclencher une erreur
              </Button>
            )}
          </ErrorBoundary>
        </div>
        
        {/* Exemple d'ErrorDisplay */}
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">2. ErrorDisplay</h2>
          <p className="mb-4 text-gray-600">
            Affiche une erreur de manière standardisée dans différentes variantes.
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="warning" 
              onClick={triggerTypedError}
            >
              Créer une erreur typée
            </Button>
            
            <ErrorDisplay 
              error={new AppError('INVALID_INPUT', {
                message: 'Format de courriel invalide',
                category: ErrorCategory.VALIDATION,
                severity: ErrorSeverity.WARNING,
                details: { field: 'email' }
              })}
              showDetails={true}
              variant="card"
              onRetry={() => alert('Action de réessai')}
              onDismiss={() => alert('Action de fermeture')}
            />
          </div>
        </div>
        
        {/* Exemple d'ErrorContainer */}
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">3. ErrorContainer</h2>
          <p className="mb-4 text-gray-600">
            Conteneur qui affiche les erreurs capturées par le service d'erreur.
          </p>
          
          <Button 
            variant="danger" 
            onClick={() => {
              const error = new AppError('NETWORK_ERROR', {
                message: 'Impossible de se connecter au serveur',
                category: ErrorCategory.NETWORK,
                severity: ErrorSeverity.ERROR
              });
              errorService.handleError(error);
            }}
          >
            Simuler erreur réseau
          </Button>
          
          <div className="mt-3">
            <ErrorContainer 
              maxErrors={3}
              variant="toast"
              autoDismissAfter={5000}
              showDetails={true}
            />
          </div>
        </div>
        
        {/* Exemple de useErrorHandling */}
        <div className="p-4 border rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">4. useErrorHandling</h2>
          <p className="mb-4 text-gray-600">
            Hook pour gérer facilement les erreurs dans les composants fonctionnels.
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="primary" 
              onClick={handleAsyncOperation}
              isLoading={isLoading}
            >
              Opération async avec erreur
            </Button>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="font-medium text-red-700">{error.message}</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2"
                  onClick={clearError}
                >
                  Effacer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Intégration complète</h2>
        <p className="mb-4 text-gray-600">
          Ces composants peuvent être combinés pour une gestion d'erreur robuste et cohérente.
        </p>
        
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`// Niveau application
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Niveau page
const ProfilePage = () => {
  const { withErrorHandling } = useErrorHandling();
  
  const saveProfile = withErrorHandling(async (data) => {
    await api.updateProfile(data);
  });
  
  return (
    <>
      <ProfileForm onSubmit={saveProfile} />
      <ErrorContainer context="profile" />
    </>
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default ExampleUsage;

// Import nécessaire pour l'exemple
import errorService from '../services/core/errorService';