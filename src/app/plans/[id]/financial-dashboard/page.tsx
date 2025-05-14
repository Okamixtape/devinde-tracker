'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { BusinessPlanData } from "@/app/services/interfaces/dataModels";
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import ServicesDashboard from '@/app/components/dashboard/ServicesDashboard';
import FiscalSimulation from '@/app/components/dashboard/FiscalSimulation';
import PricingImpactSimulator from '@/app/components/dashboard/PricingImpactSimulator';
import { FinancialProvider } from '@/app/contexts/financialContext';
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { loadServiceDetailsFromLocalStorage, calculateTotalPotentialRevenue } from '@/app/plans/[id]/services/components/serviceUtils';

/**
 * Financial Dashboard Page
 * 
 * Tableau de bord centralisé qui intègre les différentes sections financières de l'application
 * avec une navigation par onglets pour une expérience utilisateur fluide.
 */
export default function FinancialDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const businessPlanService = getBusinessPlanService();
  
  // États principaux
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [services, setServices] = useState<Service[]>([]);
  
  // Chargement du plan d'affaires et des services
  useEffect(() => {
    const loadBusinessPlan = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await businessPlanService.getItem(id);
        
        if (result.success && result.data) {
          setBusinessPlan(result.data);
          
          // Chargement des services à partir du localStorage
          const loadedServices = loadServiceDetailsFromLocalStorage(
            id,
            result.data.services && typeof result.data.services === 'object' && 'offerings' in result.data.services 
              ? (result.data.services.offerings as string[] || []) 
              : []
          );
          setServices(loadedServices);
          
          setError(null);
        } else {
          setError("Impossible de charger les données du plan d'affaires");
        }
      } catch (err) {
        setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [id, businessPlanService]);
  
  // Fonction pour changer d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Mettre à jour l'URL pour la persistance entre rafraîchissements
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };
  
  // Vérifier si un onglet est spécifié dans l'URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'services', 'pricing', 'projections'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Affichage pendant le chargement
  if (loading && !businessPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-center">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Extraction des données financières si disponibles
  const financials = businessPlan?.financials || {
    initialInvestment: 0,
    quarterlyGoals: [],
    expenses: []
  };
  
  // Calcul du revenu mensuel estimé à partir des services
  const estimatedMonthlyRevenue = calculateTotalPotentialRevenue(services);
  
  // Calcul des coûts mensuels à partir des dépenses
  const monthlyExpenses = financials.expenses
    .filter(expense => expense.frequency === 'monthly')
    .reduce((total, expense) => total + expense.amount, 0);
  
  // Calcul de la marge mensuelle
  const monthlyMargin = estimatedMonthlyRevenue - monthlyExpenses;
  
  return (
    <FinancialProvider 
      businessPlanId={id}
      initialServices={services}
      initialTab={activeTab}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard Financier</h1>
      
      {/* Navigation par onglets */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 font-medium text-center rounded-t-lg border-b-2 ${activeTab === 'overview' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => handleTabChange('overview')}
            >
              Vue d&apos;ensemble
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 font-medium text-center rounded-t-lg border-b-2 ${activeTab === 'services' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => handleTabChange('services')}
            >
              Services
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 font-medium text-center rounded-t-lg border-b-2 ${activeTab === 'pricing' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => handleTabChange('pricing')}
            >
              Tarification
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 font-medium text-center rounded-t-lg border-b-2 ${activeTab === 'projections' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => handleTabChange('projections')}
            >
              Projections
            </button>
          </li>
        </ul>
      </div>
      
      {/* Contenu des onglets */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vue d&apos;ensemble financière</h2>
            <p className="text-gray-600 mb-6">
              Ce dashboard présente une vue consolidée de toutes vos informations financières.
              Naviguez entre les différents onglets pour voir et modifier les détails spécifiques.
            </p>
            
            {/* Widgets financiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Revenus estimés</h3>
                <p className="text-3xl font-bold text-green-600">
                  {estimatedMonthlyRevenue > 0 
                    ? `${estimatedMonthlyRevenue.toLocaleString()} €`
                    : 'Non défini'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Par mois</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Coûts mensuels</h3>
                <p className="text-3xl font-bold text-red-600">
                  {monthlyExpenses > 0 
                    ? `${monthlyExpenses.toLocaleString()} €`
                    : 'Non défini'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Par mois</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2">Marge mensuelle</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {estimatedMonthlyRevenue > 0 && monthlyExpenses > 0
                    ? `${monthlyMargin.toLocaleString()} €`
                    : 'Non défini'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Par mois</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'services' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Services et Prestations</h2>
            {businessPlan && (
              <div>
                <ServicesDashboard 
                  businessPlan={businessPlan}
                />
                <div className="mt-6 flex space-x-4 justify-end">
                  <button 
                    onClick={() => handleTabChange('pricing')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Simuler l&apos;impact fiscal →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Impact de la Tarification</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Cette section vous permet de simuler l&apos;impact de vos tarifs et de votre capacité de travail sur vos revenus potentiels.
                Ajustez les paramètres pour voir comment cela affecte votre chiffre d&apos;affaires mensuel et votre revenu net.
              </p>
            </div>
            
            {/* Nouveau simulateur d'impact de tarification */}
            {businessPlan && <PricingImpactSimulator businessPlan={businessPlan} />}
            
            {/* Composant de simulation fiscale avec l'ID du business plan pour calculer les revenus directement à partir des services */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Impact Fiscal</h3>
              <FiscalSimulation businessPlanId={id} />
              
              <div className="mt-6 flex space-x-4 justify-between">
                <button 
                  onClick={() => handleTabChange('services')}
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                >
                  ← Retour aux services
                </button>
                <button 
                  onClick={() => handleTabChange('projections')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Voir les projections →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'projections' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Projections Financières</h2>
            {/* Contenu de l'onglet Projections - À implémenter */}
            <p className="text-gray-600 mb-4">
              Cette section sera connectée au module de projections financières.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={() => handleTabChange('pricing')}
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
              >
                ← Retour à l&apos;impact fiscal
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </FinancialProvider>
  );
}
