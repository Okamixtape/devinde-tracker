'use client';

import React from 'react';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, CheckCircle, Clock, CircleDollarSign, ArrowUpCircle, ArrowDownCircle, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface DashboardSummaryProps {
  businessPlanId: string;
  businessPlanData: BusinessPlanData;
}

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

/**
 * Composant qui affiche un résumé synthétique des données clés 
 * sous forme de widgets pour la page d'accueil du dashboard
 */
export function DashboardSummary({ businessPlanId, businessPlanData }: DashboardSummaryProps) {
  // Calcul du total des tâches et jalons
  const tasks = businessPlanData.actionPlan?.tasks || [];
  const milestones = businessPlanData.actionPlan?.milestones || [];
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completedMilestones = milestones.filter(milestone => milestone.isCompleted).length;
  
  // Données pour le graphique des services
  const hourlyRates = businessPlanData.businessModel?.hourlyRates || [];
  const packages = businessPlanData.businessModel?.packages || [];
  const subscriptions = businessPlanData.businessModel?.subscriptions || [];
  
  const totalServices = hourlyRates.length + packages.length + subscriptions.length;
  
  // Données pour le graphique de répartition des revenus
  const revenueDistribution = [
    { name: 'Taux horaire', value: hourlyRates.reduce((acc, curr) => acc + (curr.rate || 0), 0) },
    { name: 'Forfaits', value: packages.reduce((acc, curr) => acc + (curr.price || 0), 0) },
    { name: 'Abonnements', value: subscriptions.reduce((acc, curr) => acc + (curr.monthlyPrice || 0), 0) },
  ].filter(item => item.value > 0);
  
  // Données pour le graphique des objectifs
  const quarterlyGoals = businessPlanData.financials?.quarterlyGoals || [0, 0, 0, 0];
  const quarterlyData = [
    { name: 'T1', revenue: quarterlyGoals[0] || 0 },
    { name: 'T2', revenue: quarterlyGoals[1] || 0 },
    { name: 'T3', revenue: quarterlyGoals[2] || 0 },
    { name: 'T4', revenue: quarterlyGoals[3] || 0 },
  ];
  
  // Données pour le graphique des tâches
  const taskStatus = [
    { name: 'Terminées', value: completedTasks },
    { name: 'En cours', value: tasks.filter(task => task.status === 'in-progress').length },
    { name: 'À faire', value: tasks.filter(task => task.status === 'todo').length },
  ].filter(item => item.value > 0);
  
  // Données pour le calendrier (prochaines dates clés)
  const today = new Date();
  const upcomingTasks = tasks
    .filter(task => task.status !== 'done' && task.dueDate)
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate > today;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Formatage des montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      {/* Widgets Grid - Première ligne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget: Vue d'ensemble */}
        <div className={`${UI_CLASSES.CARD} col-span-1 md:col-span-1`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>Plan d'affaires</h3>
            <BarChart3 size={20} className="text-blue-500" />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className={UI_CLASSES.TEXT_SMALL}>Taux de complétion</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${businessPlanData.completion || 0}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-1 text-gray-500 dark:text-gray-400">
                {businessPlanData.completion || 0}%
              </p>
            </div>
            
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={UI_CLASSES.TEXT_SMALL}>Sections complétées</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                      {businessPlanData.sections?.filter(s => s.completion === 100).length || 0}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className={UI_CLASSES.TEXT_SMALL}>Sections en cours</p>
                  <div className="flex items-center mt-1">
                    <Clock size={16} className="text-amber-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">
                      {businessPlanData.sections?.filter(s => s.completion > 0 && s.completion < 100).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href={`/plans/${businessPlanId}/edit`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Voir le détail du plan
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Widget: Finances */}
        <div className={`${UI_CLASSES.CARD} col-span-1 md:col-span-1`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>Finances</h3>
            <CircleDollarSign size={20} className="text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Revenu mensuel</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(businessPlanData.businessModel?.estimatedMonthlyRevenue || 0)}
                </p>
              </div>
              
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Services</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {totalServices}
                </p>
              </div>
            </div>
            
            <div>
              <p className={UI_CLASSES.TEXT_SMALL}>Répartition des revenus</p>
              {revenueDistribution.length > 0 ? (
                <div className="h-[120px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Aucune donnée de revenus disponible
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href={`/plans/${businessPlanId}/financial-dashboard`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Voir le détail financier
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Widget: Plan d'action */}
        <div className={`${UI_CLASSES.CARD} col-span-1 md:col-span-1`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>Plan d'action</h3>
            <Calendar size={20} className="text-purple-500" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Tâches</p>
                <div className="flex items-center mt-1">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    {completedTasks}/{tasks.length}
                  </span>
                </div>
              </div>
              
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Jalons</p>
                <div className="flex items-center mt-1">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    {completedMilestones}/{milestones.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className={UI_CLASSES.TEXT_SMALL}>Prochaines échéances</p>
              {upcomingTasks.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-amber-200 mt-1"></div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(task.dueDate).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Aucune tâche à venir
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href={`/plans/${businessPlanId}/action-plan`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Gérer le plan d'action
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Widgets Grid - Deuxième ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget: Objectifs trimestriels */}
        <div className={UI_CLASSES.CARD}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>Objectifs trimestriels</h3>
            <ArrowUpCircle size={20} className="text-blue-500" />
          </div>
          
          <div className="h-[200px]">
            {quarterlyGoals.some(goal => goal > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun objectif trimestriel défini
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Widget: Marché et clients */}
        <div className={UI_CLASSES.CARD}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={UI_CLASSES.HEADING_3}>Marché et clients</h3>
            <Users size={20} className="text-purple-500" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Clients cibles</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {businessPlanData.marketAnalysis?.targetClients?.length || 0}
                </p>
              </div>
              
              <div>
                <p className={UI_CLASSES.TEXT_SMALL}>Concurrents</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {businessPlanData.marketAnalysis?.competitors?.length || 0}
                </p>
              </div>
            </div>
            
            <div>
              <p className={UI_CLASSES.TEXT_SMALL}>Clients principaux</p>
              {businessPlanData.marketAnalysis?.targetClients?.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {businessPlanData.marketAnalysis?.targetClients.slice(0, 3).map((client, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-purple-200 mt-1"></div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{client.name}</p>
                        {client.needs && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{client.needs}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Aucun client cible défini
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href={`/plans/${businessPlanId}/market-analysis`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Voir l'analyse de marché
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Accès rapide aux fonctionnalités */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link 
          href={`/plans/${businessPlanId}/business-model`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <div className="flex flex-col items-center">
            <CircleDollarSign size={24} className="text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-white text-center">Business Model</p>
          </div>
        </Link>
        
        <Link 
          href={`/plans/${businessPlanId}/revenue`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors"
        >
          <div className="flex flex-col items-center">
            <TrendingUp size={24} className="text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-white text-center">Revenus</p>
          </div>
        </Link>
        
        <Link 
          href={`/plans/${businessPlanId}/finances`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
        >
          <div className="flex flex-col items-center">
            <ArrowDownCircle size={24} className="text-amber-600 dark:text-amber-400 mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-white text-center">Dépenses</p>
          </div>
        </Link>
        
        <Link 
          href={`/plans/${businessPlanId}/services`}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
        >
          <div className="flex flex-col items-center">
            <Users size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-white text-center">Services</p>
          </div>
        </Link>
      </div>
    </div>
  );
}