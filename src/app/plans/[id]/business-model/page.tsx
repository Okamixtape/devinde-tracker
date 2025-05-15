'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBusinessModel } from '@/app/hooks/useBusinessModel';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import BusinessModelForm from '@/app/components/business-model/BusinessModelForm';
import ScenarioSimulator from '@/app/components/business-model/ScenarioSimulator';
import KPIDashboard from '@/app/components/business-model/KPIDashboard';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { Settings, CreditCard, BarChart2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Page principale du modèle économique
 * 
 * Intègre les différentes composantes du modèle économique :
 * - Configuration du modèle
 * - Simulateur de scénarios
 * - Tableau de suivi des KPIs
 */
export default function BusinessModelPage() {
  const params = useParams();
  const planId = params?.id as string || '';
  
  // États pour la gestion de la page
  const [activeTab, setActiveTab] = useState<'configuration' | 'simulator' | 'kpis'>('configuration');
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les données du plan d'affaires
  useEffect(() => {
    const fetchBusinessPlan = async () => {
      try {
        setIsLoading(true);
        const businessPlanService = getBusinessPlanService();
        
        // Si aucun ID n'est fourni, récupérer le premier plan d'affaires
        if (!planId) {
          const result = await businessPlanService.getItems();
          
          if (result.success && result.data && result.data.length > 0) {
            setBusinessPlan(result.data[0] as any as BusinessPlanData);
          } else {
            setError('Aucun plan d\'affaires trouvé.');
          }
        } else {
          // Sinon, récupérer le plan spécifié
          const result = await businessPlanService.getItem(planId);
          
          if (result.success && result.data) {
            setBusinessPlan(result.data as any as BusinessPlanData);
          } else {
            setError(`Plan d'affaires avec l'ID ${planId} non trouvé.`);
          }
        }
      } catch (err) {
        setError(`Erreur lors du chargement du plan d'affaires: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessPlan();
  }, [planId]);

  // Afficher un chargement pendant le chargement des données
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du modèle économique...</p>
        </div>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error || !businessPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Erreur</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Impossible de charger le plan d\'affaires. Veuillez réessayer.'}
          </p>
          <div className="flex justify-center">
            <Link href="/plans" className={UI_CLASSES.BUTTON_PRIMARY}>
              Retour aux plans d'affaires
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ID du plan à utiliser
  const currentPlanId = businessPlan.id || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      {/* En-tête de la page */}
      <div className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={UI_CLASSES.HEADING_1}>Modèle Économique</h1>
            <p className={UI_CLASSES.TEXT_SMALL}>
              Définissez votre stratégie tarifaire, configurez vos objectifs financiers, et simulez différents scénarios.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link 
              href={`/plans/${currentPlanId}/business-model/canvas`}
              className={`${UI_CLASSES.BUTTON_SECONDARY} flex items-center`}
            >
              <Settings size={18} className="mr-2" />
              Business Model Canvas
            </Link>
            
            <Link 
              href={`/plans/${currentPlanId}/financial-dashboard`}
              className={`${UI_CLASSES.BUTTON_SECONDARY} flex items-center`}
            >
              <CreditCard size={18} className="mr-2" />
              Dashboard Financier
            </Link>
          </div>
        </div>
      </div>
      
      {/* Onglets de navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto hide-scrollbar">
        <button
          className={`mr-6 py-3 px-1 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'configuration'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setActiveTab('configuration')}
        >
          Configuration des Tarifs
        </button>
        <button
          className={`mr-6 py-3 px-1 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setActiveTab('simulator')}
        >
          Simulateur de Scénarios
        </button>
        <button
          className={`mr-6 py-3 px-1 font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'kpis'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setActiveTab('kpis')}
        >
          Tableau de Bord KPI
        </button>
      </div>
      
      {/* Contenu de l'onglet actif */}
      <div className="mb-8">
        {activeTab === 'configuration' && (
          <>
            <BusinessModelForm 
              planId={currentPlanId} 
              onSaved={() => {
                // Recharger automatiquement les autres composants après sauvegarde
              }}
            />
          </>
        )}
        
        {activeTab === 'simulator' && (
          <>
            <ScenarioSimulator 
              planId={currentPlanId}
              initialParams={{
                hoursPerWeek: 40,
                newClientsPerMonth: 3,
              }}
            />
          </>
        )}
        
        {activeTab === 'kpis' && (
          <>
            <KPIDashboard planId={currentPlanId} />
          </>
        )}
      </div>
      
      {/* Section d'aide contextuelle */}
      <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 mt-8`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <HelpCircle size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Comment utiliser cette section ?</h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                Le module Modèle Économique vous aide à définir une stratégie tarifaire rentable et à analyser différents scénarios de revenus :
              </p>
              
              <ol className="list-decimal pl-5 space-y-1">
                <li><span className="font-medium text-gray-800 dark:text-white">Configuration des Tarifs:</span> Définissez vos taux horaires, forfaits et abonnements.</li>
                <li><span className="font-medium text-gray-800 dark:text-white">Simulateur de Scénarios:</span> Testez différentes combinaisons de paramètres pour voir leur impact sur vos revenus.</li>
                <li><span className="font-medium text-gray-800 dark:text-white">Tableau de Bord KPI:</span> Suivez vos indicateurs clés et recevez des recommandations personnalisées.</li>
              </ol>
              
              <p className="pt-2">
                Commencez par configurer vos offres dans l'onglet <span className="font-medium text-gray-800 dark:text-white">Configuration des Tarifs</span>, 
                puis utilisez le <span className="font-medium text-gray-800 dark:text-white">Simulateur de Scénarios</span> pour évaluer leur impact financier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}