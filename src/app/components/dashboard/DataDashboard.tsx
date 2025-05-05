'use client';

import React from 'react';
import Link from 'next/link';
import { BusinessPlanData, Section } from '../../services/interfaces/data-models';

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
  // Extract key data points
  const planName = businessPlanData.name || 'Plan sans nom';
  const sections = businessPlanData.sections || [];
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
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  
  // Calculate next closest milestone
  const upcomingMilestones = milestones
    .filter(milestone => !milestone.isCompleted)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  const nextMilestone = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;
  
  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non définie';
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  };
  
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
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Tableau de Bord: {planName}</h2>
        
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
        
        {/* Section Status */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">État des Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Not Started */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Non Commencées</h4>
              {sectionStatus.notStarted.length === 0 ? (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">Aucune section</p>
              ) : (
                <ul className="space-y-1">
                  {sectionStatus.notStarted.map((section, index) => (
                    <li key={index} className="text-sm flex items-center space-x-2">
                      <span 
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.color || '#9CA3AF' }}
                      ></span>
                      <span>{section.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* In Progress */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-yellow-700 dark:text-yellow-300">En Cours</h4>
              {sectionStatus.inProgress.length === 0 ? (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">Aucune section</p>
              ) : (
                <ul className="space-y-1">
                  {sectionStatus.inProgress.map((section, index) => (
                    <li key={index} className="text-sm flex items-center space-x-2">
                      <span 
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.color || '#FBBF24' }}
                      ></span>
                      <span>{section.title} ({section.completion}%)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Completed */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">Terminées</h4>
              {sectionStatus.complete.length === 0 ? (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">Aucune section</p>
              ) : (
                <ul className="space-y-1">
                  {sectionStatus.complete.map((section, index) => (
                    <li key={index} className="text-sm flex items-center space-x-2">
                      <span 
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: section.color || '#10B981' }}
                      ></span>
                      <span>{section.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Prochaines Étapes</h3>
          
          {/* Next Milestone */}
          {nextMilestone && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-1 text-indigo-700 dark:text-indigo-300">Prochain Jalon</h4>
              <p className="text-lg font-semibold">{nextMilestone.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date cible: {formatDate(nextMilestone.targetDate)}
              </p>
              {nextMilestone.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {nextMilestone.description}
                </p>
              )}
              
              {/* Tasks for this milestone */}
              {tasks.filter(task => task.milestoneId === nextMilestone.id).length > 0 && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium mb-1">Tâches associées:</h5>
                  <ul className="pl-4 list-disc text-sm">
                    {tasks
                      .filter(task => task.milestoneId === nextMilestone.id)
                      .map((task, index) => (
                        <li key={index} className={task.status === 'done' ? 'line-through text-gray-500' : ''}>
                          {task.title}
                          {task.status === 'in-progress' && (
                            <span className="ml-2 text-yellow-600 dark:text-yellow-400">(En cours)</span>
                          )}
                        </li>
                      ))}
                  </ul>
                  {inProgressTasks > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      {inProgressTasks} tâche(s) en cours sur l&apos;ensemble du plan
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Incomplete Sections Requiring Attention */}
          {sectionStatus.notStarted.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-orange-700 dark:text-orange-300">
                Sections à compléter en priorité
              </h4>
              <ul className="space-y-2">
                {sectionStatus.notStarted.slice(0, 3).map((section, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {section.route ? (
                        <Link 
                          href={`/plans/${businessPlanId}${section.route}`}
                          className="text-orange-600 hover:underline"
                        >
                          Accéder à cette section
                        </Link>
                      ) : (
                        <span>Section non encore configurée</span>
                      )}
                    </div>
                  </li>
                ))}
                {sectionStatus.notStarted.length > 3 && (
                  <li className="text-sm italic">
                    + {sectionStatus.notStarted.length - 3} autres sections
                  </li>
                )}
              </ul>
            </div>
          )}
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
