'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../core/Layout/AppLayout';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { ErrorContextProvider } from '../../contexts/ErrorContext';
import { BusinessModelForm } from '../business/BusinessModel/BusinessModelForm';
import { useErrorHandling } from '../../hooks/useErrorHandling';
import { BusinessModelData } from '../../services/interfaces/dataModels';

// Exemple de sidebar simple pour la démo
const Sidebar = () => (
  <div className="p-4">
    <div className="text-xl font-bold mb-6 text-white">DevIndé Tracker</div>
    <nav>
      <ul className="space-y-2">
        <li>
          <a href="#" className="block py-2 px-4 rounded bg-indigo-800 text-white">
            Modèle d'affaires
          </a>
        </li>
        <li>
          <a href="#" className="block py-2 px-4 rounded hover:bg-indigo-800 text-indigo-100">
            Plan d'action
          </a>
        </li>
        <li>
          <a href="#" className="block py-2 px-4 rounded hover:bg-indigo-800 text-indigo-100">
            Analyse de marché
          </a>
        </li>
        <li>
          <a href="#" className="block py-2 px-4 rounded hover:bg-indigo-800 text-indigo-100">
            Dashboard
          </a>
        </li>
      </ul>
    </nav>
  </div>
);

// Exemple de header simple pour la démo
const Header = () => (
  <div className="flex justify-end items-center">
    <div className="relative">
      <button className="flex items-center focus:outline-none">
        <span className="mr-2 text-sm">John Doe</span>
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          JD
        </div>
      </button>
    </div>
  </div>
);

/**
 * Page complète de modèle d'affaires
 * Démontre l'intégration des composants core, business et des contexts
 */
export const BusinessModelPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { handleError, withErrorHandling } = useErrorHandling();
  const [businessModel, setBusinessModel] = useState<BusinessModelData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simuler le chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives
        setBusinessModel({
          hourlyRates: [
            { id: '1', serviceType: 'Développement', rate: 85, currency: 'EUR' },
            { id: '2', serviceType: 'Consultation', rate: 120, currency: 'EUR' },
            { id: '3', serviceType: 'Formation', rate: 95, currency: 'EUR' }
          ],
          packages: [
            { 
              id: '1', 
              name: 'Site Web de Base', 
              description: 'Site vitrine avec 5 pages et formulaire de contact',
              price: 1500,
              currency: 'EUR',
              services: ['Design responsive', 'SEO de base', 'Formulaire de contact'] 
            },
            { 
              id: '2', 
              name: 'E-commerce Starter', 
              description: 'Boutique en ligne avec jusqu\'à 50 produits',
              price: 3500,
              currency: 'EUR',
              services: ['Catalogue produits', 'Panier d\'achat', 'Passerelle de paiement', 'Gestion des stocks'] 
            }
          ],
          subscriptions: []
        });
      } catch (error) {
        handleError(error, { context: { operation: 'loadBusinessModel' } });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [handleError]);
  
  // Simuler la sauvegarde des données
  const saveBusinessModel = withErrorHandling(async (data: BusinessModelData) => {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simuler une réponse
    const success = Math.random() > 0.3; // 70% de chance de succès pour la démo
    
    if (!success) {
      throw new Error('Erreur de serveur lors de l\'enregistrement des données');
    }
    
    // Mettre à jour les données
    setBusinessModel(data);
    
    // Simuler une notification de succès
    alert('Modèle d\'affaires enregistré avec succès!');
  });
  
  return (
    <ErrorContextProvider showGlobalErrors>
      <AppLayout
        title="Modèle d'affaires"
        sidebar={<Sidebar />}
        header={<Header />}
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      >
        <div className="max-w-4xl mx-auto">
          <ErrorBoundary>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h1 className="text-2xl font-bold mb-2">Modèle d'affaires</h1>
              <p className="text-gray-600">
                Définissez vos taux horaires, forfaits et abonnements pour présenter clairement 
                votre offre à vos clients potentiels.
              </p>
            </div>
            
            {loading ? (
              <div className="bg-white p-8 rounded-lg shadow flex justify-center items-center">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-lg text-gray-700">Chargement du modèle d'affaires...</span>
              </div>
            ) : (
              <BusinessModelForm
                initialData={businessModel || undefined}
                onSubmit={saveBusinessModel}
              />
            )}
          </ErrorBoundary>
        </div>
      </AppLayout>
    </ErrorContextProvider>
  );
};

export default BusinessModelPage;