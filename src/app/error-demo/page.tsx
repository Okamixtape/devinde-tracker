'use client';

import React from 'react';
import { useToast } from '../components/error/ToastManager';
import { useError } from '../context/ErrorContext';
import { AppError, ErrorCategory, ErrorSeverity } from '../services/utils/error-handling';
import { useAsyncHandler } from '../hooks/useAsyncHandler';
import { withLoading, LoadingIndicator } from '../components/error/WithLoading';

// Fonction qui simule une opération async qui échoue après un délai
const simulateErrorAfterDelay = (delay: number, shouldFail: boolean = true): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Ceci est une erreur simulée'));
      } else {
        resolve('Opération réussie !');
      }
    }, delay);
  });
};

// Demo component
const ErrorDemoPage: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const { setError, clearError, isLoading, setIsLoading } = useError();
  
  // Utilisation du hook d'opération asynchrone
  const { execute, isLoading: asyncLoading } = useAsyncHandler(
    async (shouldFail: boolean) => {
      return await simulateErrorAfterDelay(2000, shouldFail);
    },
    {
      successMessage: 'Opération réussie avec succès !',
      errorMessage: 'Une erreur est survenue lors de l\'opération',
    }
  );

  // Handler pour afficher un toast de succès
  const handleSuccessToast = () => {
    showSuccess('Opération réussie !', 'Succès');
  };

  // Handler pour afficher un toast d'information
  const handleInfoToast = () => {
    showInfo('Voici une information importante', 'Information');
  };

  // Handler pour afficher un toast d'avertissement
  const handleWarningToast = () => {
    showWarning('Attention, ceci est un avertissement', 'Avertissement');
  };

  // Handler pour afficher un toast d'erreur
  const handleErrorToast = () => {
    showError('Une erreur s\'est produite', 'Erreur');
  };

  // Handler pour afficher une erreur complexe
  const handleComplexError = () => {
    const appError = new AppError('INVALID_INPUT', {
      message: 'Les données saisies ne sont pas valides',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      details: {
        fields: {
          email: 'Format d\'email invalide',
          password: 'Le mot de passe doit contenir au moins 8 caractères'
        },
        requestId: '12345-abcde'
      }
    });
    
    setError(appError);
  };

  // Handler pour simuler un chargement global
  const handleGlobalLoading = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    showSuccess('Chargement terminé !');
  };

  // Handler pour simuler une opération asynchrone
  const handleAsyncOperation = async (shouldFail: boolean) => {
    await execute(shouldFail);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Démo du système de gestion d'erreurs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Toasts de notification</h2>
          <div className="space-y-3">
            <button
              onClick={handleSuccessToast}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Toast Succès
            </button>
            <button
              onClick={handleInfoToast}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Toast Information
            </button>
            <button
              onClick={handleWarningToast}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full"
            >
              Toast Avertissement
            </button>
            <button
              onClick={handleErrorToast}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Toast Erreur simple
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Erreurs d'application</h2>
          <div className="space-y-3">
            <button
              onClick={handleComplexError}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full"
            >
              Erreur avec détails
            </button>
            <button
              onClick={() => clearError()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full"
            >
              Effacer l'erreur
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">États de chargement</h2>
          <div className="space-y-3">
            <button
              onClick={handleGlobalLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement en cours...' : 'Simuler chargement global (3s)'}
            </button>
            
            <div className="mt-4">
              {isLoading && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  <LoadingIndicator />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Opérations asynchrones</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleAsyncOperation(false)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded w-full"
              disabled={asyncLoading}
            >
              {asyncLoading ? 'Chargement...' : 'Opération async réussie'}
            </button>
            <button
              onClick={() => handleAsyncOperation(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded w-full"
              disabled={asyncLoading}
            >
              {asyncLoading ? 'Chargement...' : 'Opération async échouée'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Documentation d'utilisation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Utiliser les toasts :</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto mt-2">
              {`// Dans n'importe quel composant
const { showSuccess, showError } = useToast();

// Afficher un message de succès
showSuccess('Opération réussie !', 'Titre optionnel');

// Afficher une erreur
showError('Une erreur est survenue', 'Titre optionnel');`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Gérer les opérations asynchrones :</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto mt-2">
              {`// Dans n'importe quel composant
const { execute, isLoading, data, error } = useAsyncHandler(
  async (param1, param2) => {
    // Appel API ou autre opération async
    return await apiCall(param1, param2);
  },
  {
    successMessage: 'Opération réussie !',
    errorMessage: 'Erreur lors de l\'opération',
  }
);

// Utiliser la fonction execute
const handleSubmit = async () => {
  const result = await execute('valeur1', 'valeur2');
  if (result) {
    // Opération réussie
  }
};`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Ajouter un état de chargement à un composant :</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto mt-2">
              {`// Composant avec état de chargement
const MyComponent = ({ isLoading, setLoading }) => {
  // ...
};

// Exporter avec HOC withLoading
export default withLoading(MyComponent);

// Utilisation
<MyComponent isLoading={true} />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDemoPage;
