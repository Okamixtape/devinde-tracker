'use client';

import React, { useState, useEffect } from 'react';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { DataDashboard } from '@/app/components/dashboard/DataDashboard';
import { DashboardSummary } from '@/app/components/dashboard/DashboardSummary';
import ServicesDashboard from '@/app/components/dashboard/ServicesDashboard';
import PricingImpactSimulator from '@/app/components/dashboard/PricingImpactSimulator';
import FiscalSimulation from '@/app/components/dashboard/FiscalSimulation';
import FinancialDashboard from '@/app/components/FinancialDashboard';
import { FinancialProvider } from '@/app/contexts/financialContext';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { CircleDollarSign, TrendingUp, Users, CalendarClock, Filter, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard principal qui intègre tous les composants de tableau de bord
 * pour offrir une vue unifiée des données de l'indépendant.
 */
export default function Dashboard() {
  // État pour les plans d'affaires et le plan actif
  const [businessPlans, setBusinessPlans] = useState<BusinessPlanData[]>([]);
  const [activePlan, setActivePlan] = useState<BusinessPlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Récupérer les plans d'affaires au chargement
  useEffect(() => {
    const fetchBusinessPlans = async () => {
      setIsLoading(true);
      try {
        const businessPlanService = getBusinessPlanService();
        const result = await businessPlanService.getItems();
        
        if (result.success && result.data && result.data.length > 0) {
          setBusinessPlans(result.data);
          setActivePlan(result.data[0]); // Définir le premier plan comme actif par défaut
        } else {
          setError('Aucun plan d\'affaires trouvé.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des plans:', err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessPlans();
  }, []);

  // Gérer le changement de plan
  const handlePlanChange = (id: string) => {
    const plan = businessPlans.find(p => p.id === id);
    if (plan) {
      setActivePlan(plan);
    }
  };

  // Afficher un message de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error || !activePlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Aucun plan disponible</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Vous n\'avez pas encore créé de plan d\'affaires.'}
          </p>
          <Link href="/plans" className={UI_CLASSES.BUTTON_PRIMARY}>
            Voir mes plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <FinancialProvider businessPlanId={activePlan.id} initialTab={activeTab}>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* En-tête avec sélection de plan */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className={UI_CLASSES.HEADING_1}>Tableau de bord</h1>
            <p className={UI_CLASSES.TEXT_SMALL}>
              Vue d'ensemble de votre activité d'indépendant
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label htmlFor="plan-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plan d'affaires
              </label>
              <select
                id="plan-selector"
                value={activePlan.id}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {businessPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name || `Plan #${plan.id.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                title="Rafraîchir les données"
              >
                <RefreshCw size={18} />
              </button>
              <button
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                title="Filtrer les données"
              >
                <Filter size={18} />
              </button>
              <button
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                title="Exporter les données"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Cartes KPI - Indicateurs clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenu mensuel potentiel */}
          <div className={UI_CLASSES.CARD}>
            <div className="flex items-center justify-between">
              <h3 className={UI_CLASSES.TEXT_SMALL}>Revenu mensuel</h3>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CircleDollarSign size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {(activePlan.businessModel?.estimatedMonthlyRevenue || 0).toLocaleString('fr-FR')}€
            </p>
            <div className="mt-1 flex items-center text-xs text-green-500">
              <TrendingUp size={12} className="mr-1" /> 
              <span>+12% ce mois-ci</span>
            </div>
          </div>

          {/* Taux de complétion du plan */}
          <div className={UI_CLASSES.CARD}>
            <div className="flex items-center justify-between">
              <h3 className={UI_CLASSES.TEXT_SMALL}>Complétion du plan</h3>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="flex items-end mt-2">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {activePlan.completion || 0}%
              </p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${activePlan.completion || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Clients cibles */}
          <div className={UI_CLASSES.CARD}>
            <div className="flex items-center justify-between">
              <h3 className={UI_CLASSES.TEXT_SMALL}>Clients cibles</h3>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {activePlan.marketAnalysis?.targetClients?.length || 0}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {activePlan.marketAnalysis?.competitors?.length || 0} concurrents identifiés
            </p>
          </div>

          {/* Tâches planifiées */}
          <div className={UI_CLASSES.CARD}>
            <div className="flex items-center justify-between">
              <h3 className={UI_CLASSES.TEXT_SMALL}>Plan d'action</h3>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <CalendarClock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {activePlan.actionPlan?.tasks?.filter(t => t.status === 'done').length || 0}/
              {activePlan.actionPlan?.tasks?.length || 0}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {activePlan.actionPlan?.milestones?.filter(m => m.isCompleted).length || 0}/
              {activePlan.actionPlan?.milestones?.length || 0} jalons terminés
            </p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex overflow-x-auto hide-scrollbar">
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              Résumé
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Vue d'ensemble
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'pricing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('pricing')}
            >
              Impact tarifaire
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'fiscal'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('fiscal')}
            >
              Simulation fiscale
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('financial')}
            >
              Dashboard financier
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="mb-8">
          {activeTab === 'summary' && (
            <DashboardSummary businessPlanId={activePlan.id} businessPlanData={activePlan} />
          )}
          
          {activeTab === 'overview' && (
            <DataDashboard businessPlanId={activePlan.id} businessPlanData={activePlan} />
          )}
          
          {activeTab === 'services' && (
            <ServicesDashboard businessPlan={activePlan} />
          )}
          
          {activeTab === 'pricing' && (
            <PricingImpactSimulator businessPlan={activePlan} />
          )}
          
          {activeTab === 'fiscal' && (
            <FiscalSimulation businessPlanId={activePlan.id} />
          )}
          
          {activeTab === 'financial' && (
            <FinancialDashboard 
              data={activePlan.financials || { 
                initialInvestment: 0, 
                quarterlyGoals: [0, 0, 0, 0], 
                expenses: [] 
              }} 
            />
          )}
        </div>

        {/* Liens rapides vers les autres sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href={`/plans/${activePlan.id}/edit`} className={`${UI_CLASSES.CARD} hover:shadow-md transition-shadow`}>
            <h3 className={UI_CLASSES.HEADING_3}>Éditer votre plan</h3>
            <p className={UI_CLASSES.TEXT_SMALL}>
              Modifiez et complétez les différentes sections de votre plan d'affaires.
            </p>
          </Link>
          
          <Link href={`/plans/${activePlan.id}/financial-dashboard`} className={`${UI_CLASSES.CARD} hover:shadow-md transition-shadow`}>
            <h3 className={UI_CLASSES.HEADING_3}>Finances détaillées</h3>
            <p className={UI_CLASSES.TEXT_SMALL}>
              Consultez les projections financières détaillées pour votre activité.
            </p>
          </Link>
          
          <Link href={`/plans/${activePlan.id}/action-plan`} className={`${UI_CLASSES.CARD} hover:shadow-md transition-shadow`}>
            <h3 className={UI_CLASSES.HEADING_3}>Plan d'action</h3>
            <p className={UI_CLASSES.TEXT_SMALL}>
              Gérez vos tâches et jalons pour atteindre vos objectifs d'indépendant.
            </p>
          </Link>
        </div>
      </div>
    </FinancialProvider>
  );
}