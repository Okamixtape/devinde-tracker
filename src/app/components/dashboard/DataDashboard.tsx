'use client';

import React from 'react';
import Link from 'next/link';
import { BusinessPlanData, Section } from "@/app/services/interfaces/dataModels";
import { useDataServiceContext } from '@/app/contexts/DataServiceContext';

interface DataDashboardProps {
  businessPlanId: string;
  businessPlanData: BusinessPlanData;
}

/**
 * DataDashboard Component
 * 
 * Aggregates data from various services and presents them in a unified dashboard view.
 * Follows the service architecture pattern established for the DevIndé Tracker.
 */
export function DataDashboard({
  businessPlanId,
  businessPlanData
}: DataDashboardProps) {
  // Utiliser le contexte pour accéder au service des sections
  const { sectionService } = useDataServiceContext();
  
  // Utiliser le service pour enrichir les sections du plan d'affaires
  const existingSections = businessPlanData.sections || [];
  const sections = sectionService.enrichSections(businessPlanId, existingSections);
  const totalSections = sections.length;
  const completedSections = sections.filter(section => section.completion === 100).length;
  const partialSections = sections.filter(section => section.completion > 0 && section.completion < 100).length;
  const completionPercentage = totalSections === 0 
    ? 0 
    : Math.round(sections.reduce((acc, section) => acc + section.completion, 0) / totalSections);
  
  // Extract financial data
  const hourlyRates = businessPlanData.businessModel?.hourlyRates || [];
  const packages = businessPlanData.businessModel?.packages || [];
  const subscriptions = businessPlanData.businessModel?.subscriptions || [];
  const revenueStreams = [
    ...hourlyRates.map(rate => ({ type: 'hourly', name: rate.serviceType, value: rate.rate })),
    ...packages.map(pkg => ({ type: 'package', name: pkg.name, value: pkg.price })),
    ...subscriptions.map(sub => ({ type: 'subscription', name: sub.name, value: sub.monthlyPrice }))
  ];
  
  // Extract target audience information
  const targetClients = businessPlanData.marketAnalysis?.targetClients || [];
  const competitors = businessPlanData.marketAnalysis?.competitors || [];
  
  // Extract action plan data
  const milestones = businessPlanData.actionPlan?.milestones || [];
  const tasks = businessPlanData.actionPlan?.tasks || [];
  const completedMilestones = milestones.filter(milestone => milestone.isCompleted).length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  
  // Group sections by completion status
  const groupSectionsByStatus = (): {
    complete: Section[];
    inProgress: Section[];
    notStarted: Section[];
  } => {
    return {
      complete: sections.filter(section => section.completion === 100),
      inProgress: sections.filter(section => section.completion > 0 && section.completion < 100),
      notStarted: sections.filter(section => section.completion === 0)
    };
  };
  
  const sectionStatus = groupSectionsByStatus();
  
  // Récupérer les informations du pitch (si disponible)
  const pitchExists = businessPlanData.pitch && (
    businessPlanData.pitch.title || 
    businessPlanData.pitch.summary || 
    businessPlanData.pitch.vision
  );
  
  // Récupérer les informations sur les services (si disponibles)
  const serviceOfferings = businessPlanData.services?.offerings || [];
  const serviceTechnologies = businessPlanData.services?.technologies || [];
  const serviceCount = serviceOfferings.length + serviceTechnologies.length;
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  };

  // Fonction pour déterminer le statut d'achèvement
  const getCompletionStatus = (completion: number) => {
    if (completion >= 100) return "Completed";
    if (completion > 0) return "In Progress";
    return "Not Started";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Progression et Métriques</h2>
        
        {/* Progress Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Progression Globale</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-2">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>{completionPercentage}% complet</span>
            <span>{completedSections} sur {totalSections} sections terminées</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
              Sections
            </h3>
            <p className="text-2xl font-bold">{totalSections}</p>
            <div className="mt-2 text-sm">
              <span className="text-green-600 dark:text-green-400">{completedSections} terminées</span>
              {partialSections > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400 ml-2">{partialSections} en cours</span>
              )}
            </div>
            <Link 
              href={`/plans/${businessPlanId}/edit`} 
              className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Gérer les sections 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
              Offres
            </h3>
            <p className="text-2xl font-bold">{revenueStreams.length}</p>
            <div className="mt-2 text-sm">
              {hourlyRates.length > 0 && (
                <span className="text-purple-600 dark:text-purple-400">{hourlyRates.length} taux horaires</span>
              )}
              {packages.length > 0 && (
                <span className="text-purple-600 dark:text-purple-400 ml-2">{packages.length} forfaits</span>
              )}
              {subscriptions.length > 0 && (
                <span className="text-purple-600 dark:text-purple-400 ml-2">{subscriptions.length} abonnements</span>
              )}
            </div>
            <Link 
              href={`/plans/${businessPlanId}/business-model`} 
              className="inline-flex items-center mt-3 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
            >
              Gérer les offres 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
              Clients Cibles
            </h3>
            <p className="text-2xl font-bold">{targetClients.length}</p>
            {competitors.length > 0 && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {competitors.length} concurrents analysés
              </p>
            )}
            <Link 
              href={`/plans/${businessPlanId}/market-analysis`} 
              className="inline-flex items-center mt-3 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
            >
              Analyser le marché 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">
              Jalons & Tâches
            </h3>
            <p className="text-2xl font-bold">{milestones.length} / {tasks.length}</p>
            <div className="mt-2 text-sm">
              <span className="text-red-600 dark:text-red-400">
                {completedMilestones} jalons terminés
              </span>
              <span className="text-red-600 dark:text-red-400 ml-2">
                {completedTasks} tâches terminées
              </span>
            </div>
            <Link 
              href={`/plans/${businessPlanId}/action-plan`} 
              className="inline-flex items-center mt-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              Gérer le plan d&apos;action 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Sections Status */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">État des Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Non Commencées</h4>
              {sectionStatus.notStarted.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune section dans cette catégorie</p>
              ) : (
                <ul className="space-y-2">
                  {sectionStatus.notStarted.map((section) => (
                    <li key={section.id} className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: section.color || '#3B82F6' }}
                      ></span>
                      <Link 
                        href={`/plans/${businessPlanId}${section.route}`}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                      >
                        {section.title}
                      </Link>
                      <div className="ml-2 text-sm text-blue-500 dark:text-blue-400">
                        {getCompletionStatus(section.completion) === "Completed" ? (
                          <span className="text-green-500 dark:text-green-400">✓ Terminé</span>
                        ) : getCompletionStatus(section.completion) === "In Progress" ? (
                          <span className="text-orange-500 dark:text-orange-400">⌛ En cours</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">◯ À compléter</span>
                        )}
                      </div>
                      <p className="ml-6 mb-0 text-sm text-gray-500 dark:text-gray-400">
                        { section.key === "pitch" && "Présentez votre projet en quelques phrases et définissez votre vision" }
                        { section.key === "services" && "Décrivez les services ou produits que vous proposez" }
                        { section.key === "business-model" && "Définissez comment votre business génère de la valeur" }
                        { section.key === "market-analysis" && "Analysez votre marché et votre positionnement" }
                        { section.key === "finances" && "Gérez vos revenus, dépenses et projections financières" }
                        { section.key === "action-plan" && "Planifiez les actions concrètes pour votre développement" }
                        { section.key === "revenue" && "Visualisez et projetez vos revenus sur le long terme" }
                      </p>
                      <div className="ml-6 mt-2">
                        <Link 
                          href={`/plans/${businessPlanId}${section.route}`}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Gérer cette section <span className="ml-1">→</span>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">En Cours</h4>
              {sectionStatus.inProgress.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune section dans cette catégorie</p>
              ) : (
                <ul className="space-y-2">
                  {sectionStatus.inProgress.map((section) => (
                    <li key={section.id} className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: section.color || '#3B82F6' }}
                      ></span>
                      <Link 
                        href={`/plans/${businessPlanId}${section.route}`}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                      >
                        {section.title}
                      </Link>
                      <div className="ml-2 text-sm text-blue-500 dark:text-blue-400">
                        {getCompletionStatus(section.completion) === "Completed" ? (
                          <span className="text-green-500 dark:text-green-400">✓ Terminé</span>
                        ) : getCompletionStatus(section.completion) === "In Progress" ? (
                          <span className="text-orange-500 dark:text-orange-400">⌛ En cours</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">◯ À compléter</span>
                        )}
                      </div>
                      <p className="ml-6 mb-0 text-sm text-gray-500 dark:text-gray-400">
                        { section.key === "pitch" && "Présentez votre projet en quelques phrases et définissez votre vision" }
                        { section.key === "services" && "Décrivez les services ou produits que vous proposez" }
                        { section.key === "business-model" && "Définissez comment votre business génère de la valeur" }
                        { section.key === "market-analysis" && "Analysez votre marché et votre positionnement" }
                        { section.key === "finances" && "Gérez vos revenus, dépenses et projections financières" }
                        { section.key === "action-plan" && "Planifiez les actions concrètes pour votre développement" }
                        { section.key === "revenue" && "Visualisez et projetez vos revenus sur le long terme" }
                      </p>
                      <div className="ml-6 mt-2">
                        <Link 
                          href={`/plans/${businessPlanId}${section.route}`}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Gérer cette section <span className="ml-1">→</span>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Terminées</h4>
              {sectionStatus.complete.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune section dans cette catégorie</p>
              ) : (
                <ul className="space-y-2">
                  {sectionStatus.complete.map((section) => (
                    <li key={section.id} className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: section.color || '#3B82F6' }}
                      ></span>
                      <Link 
                        href={`/plans/${businessPlanId}${section.route}`}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                      >
                        {section.title}
                      </Link>
                      <div className="ml-2 text-sm text-blue-500 dark:text-blue-400">
                        {getCompletionStatus(section.completion) === "Completed" ? (
                          <span className="text-green-500 dark:text-green-400">✓ Terminé</span>
                        ) : getCompletionStatus(section.completion) === "In Progress" ? (
                          <span className="text-orange-500 dark:text-orange-400">⌛ En cours</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">◯ À compléter</span>
                        )}
                      </div>
                      <p className="ml-6 mb-0 text-sm text-gray-500 dark:text-gray-400">
                        { section.key === "pitch" && "Présentez votre projet en quelques phrases et définissez votre vision" }
                        { section.key === "services" && "Décrivez les services ou produits que vous proposez" }
                        { section.key === "business-model" && "Définissez comment votre business génère de la valeur" }
                        { section.key === "market-analysis" && "Analysez votre marché et votre positionnement" }
                        { section.key === "finances" && "Gérez vos revenus, dépenses et projections financières" }
                        { section.key === "action-plan" && "Planifiez les actions concrètes pour votre développement" }
                        { section.key === "revenue" && "Visualisez et projetez vos revenus sur le long terme" }
                      </p>
                      <div className="ml-6 mt-2">
                        <Link 
                          href={`/plans/${businessPlanId}${section.route}`}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Gérer cette section <span className="ml-1">→</span>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pitch Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pitch de Présentation</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {pitchExists 
                ? "Votre pitch est en cours de développement."
                : "Vous n&apos;avez pas encore développé votre pitch de présentation. C&apos;est la première étape pour clarifier votre offre et convaincre vos clients potentiels."}
            </p>
            
            <Link
              href={`/plans/${businessPlanId}/pitch`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              {pitchExists ? "Continuer le pitch" : "Créer votre pitch"}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Services Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {serviceCount > 0
                ? `Vous proposez ${serviceCount} service${serviceCount > 1 ? 's' : ''}.`
                : "Vous n&apos;avez pas encore défini vos services. Définissez les services que vous proposez à vos clients."}
            </p>
            
            <Link
              href={`/plans/${businessPlanId}/services`}
              className="inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
            >
              {serviceCount > 0 ? "Gérer vos services" : "Définir vos services"}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Revenue Streams Overview */}
        {revenueStreams.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Aperçu des Revenus</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {revenueStreams.map((stream, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {stream.type === 'hourly' ? 'Taux Horaire' : 
                         stream.type === 'package' ? 'Forfait' : 'Abonnement'}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {stream.name}
                      </td>
                      <td className="py-2 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                        {formatCurrency(stream.value)}
                        {stream.type === 'hourly' && ' / heure'}
                        {stream.type === 'subscription' && ' / mois'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link 
              href={`/plans/${businessPlanId}/revenue`} 
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Projections de revenus 
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
        
        {/* Finances Link */}
        <div className="mb-8">
          <Link 
            href={`/plans/${businessPlanId}/finances`} 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Gérer les finances
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
