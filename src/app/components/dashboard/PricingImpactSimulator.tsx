'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { loadServiceDetailsFromLocalStorage, calculateTotalPotentialRevenue } from '@/app/plans/[id]/services/components/serviceUtils';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';
import { useFinancial } from '@/app/contexts/financialContext';

interface PricingImpactSimulatorProps {
  businessPlan: BusinessPlanData;
}

/**
 * Composant de simulation d'impact de la tarification
 * 
 * Ce composant permet de visualiser l'impact des variations de capacité de travail
 * et d'acquisition client sur les revenus potentiels, et sert de lien entre les
 * différentes sections financières de l'application.
 */
const PricingImpactSimulator: React.FC<PricingImpactSimulatorProps> = ({ businessPlan }) => {
  // Utiliser le contexte financier partagé
  const { services: contextServices } = useFinancial();
  
  // États pour les services
  const [serviceDetails, setServiceDetails] = useState<Service[]>([]);
  
  // États pour les paramètres de simulation
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [newClientsPerMonth, setNewClientsPerMonth] = useState<number>(3);
  const [subscriptionClients, setSubscriptionClients] = useState<number>(5);
  
  // États pour les résultats calculés
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [potentialRevenue, setPotentialRevenue] = useState<number>(0);
  // État pour stocker la répartition des revenus par type de service
  const [revenueByType, setRevenueByType] = useState<{hourly: number, package: number, subscription: number}>({hourly: 0, package: 0, subscription: 0});
  
  // Utiliser les services du contexte ou charger depuis localStorage si nécessaire
  useEffect(() => {
    // Priorité aux services du contexte
    if (contextServices && contextServices.length > 0) {
      setServiceDetails(contextServices);
      return;
    }
    
    // Fallback : charger depuis localStorage
    if (businessPlan?.id) {
      try {
        const services = loadServiceDetailsFromLocalStorage(
          businessPlan.id, 
          businessPlan.services && typeof businessPlan.services === 'object' && 'offerings' in businessPlan.services 
            ? (businessPlan.services.offerings as string[] || []) 
            : []
        );
        setServiceDetails(services);
      } catch (e) {
        console.error('Erreur lors de la lecture des détails de services:', e);
      }
    }
  }, [businessPlan?.id, businessPlan?.services, contextServices]);
  
  // Calcul des revenus basés sur les paramètres
  useEffect(() => {
    // Calculer la capacité mensuelle en heures
    const monthlyCapacityHours = hoursPerWeek * 4;
    
    // Filtrer et catégoriser les services
    const hourlyServices = serviceDetails.filter(s => s.billingMode === 'hourly' && s.hourlyRate && s.hourlyRate > 0);
    const packageServices = serviceDetails.filter(s => s.billingMode === 'package' && s.packagePrice && s.packagePrice > 0);
    const subscriptionServices = serviceDetails.filter(s => s.billingMode === 'subscription' && s.subscriptionPrice && s.subscriptionPrice > 0);
    
    // Calculer les revenus horaires (basés sur la capacité disponible)
    let hourlyRevenue = 0;
    let hourlyHoursUsed = 0;
    
    for (const service of hourlyServices) {
      if (service.hourlyRate && service.estimatedHours) {
        // Limiter par la capacité disponible
        const hoursAvailable = Math.max(0, monthlyCapacityHours - hourlyHoursUsed);
        const serviceHours = Math.min(service.estimatedHours, hoursAvailable);
        
        if (serviceHours > 0) {
          hourlyRevenue += service.hourlyRate * serviceHours;
          hourlyHoursUsed += serviceHours;
        }
      }
    }
    
    // Calculer les revenus de forfaits (basés sur le nombre de nouveaux clients)
    let packageRevenue = 0;
    let packageHoursUsed = 0;
    
    // Distribuer les clients entre les packages disponibles
    const clientsPerPackage = newClientsPerMonth > 0 && packageServices.length > 0 
      ? Math.ceil(newClientsPerMonth / packageServices.length) 
      : 0;
    
    for (const service of packageServices) {
      if (service.packagePrice) {
        // Appliquer le nombre de clients par package (minimum 1)
        const serviceClients = Math.max(1, clientsPerPackage);
        packageRevenue += service.packagePrice * serviceClients;
        
        // Compter aussi les heures estimées pour les forfaits
        if (service.estimatedHours) {
          packageHoursUsed += service.estimatedHours * serviceClients;
        }
      }
    }
    
    // Vérifier si les heures totales requises dépassent la capacité
    const totalHoursRequired = hourlyHoursUsed + packageHoursUsed;
    const capacityExceeded = totalHoursRequired > monthlyCapacityHours;
    
    // Ajuster les revenus si la capacité est dépassée
    if (capacityExceeded) {
      const adjustmentFactor = monthlyCapacityHours / totalHoursRequired;
      hourlyRevenue *= adjustmentFactor;
      packageRevenue *= adjustmentFactor;
    }
    
    // Calculer les revenus d'abonnement (basés sur le nombre de clients abonnés)
    let subscriptionRevenue = 0;
    
    // Distribuer les clients abonnés entre les services d'abonnement disponibles
    const clientsPerSubscription = subscriptionClients > 0 && subscriptionServices.length > 0 
      ? Math.ceil(subscriptionClients / subscriptionServices.length) 
      : 0;
    
    for (const service of subscriptionServices) {
      if (service.subscriptionPrice) {
        // Appliquer le nombre de clients par abonnement (minimum 1 si des clients sont définis)
        const serviceClients = subscriptionClients > 0 ? Math.max(1, clientsPerSubscription) : 0;
        subscriptionRevenue += service.subscriptionPrice * serviceClients;
      }
    }
    
    // Stocker les revenus par type de service pour le calcul des pourcentages
    // Ces valeurs seront utilisées pour l'affichage de la répartition des revenus
    const revenueByType = {
      hourly: hourlyRevenue,
      package: packageRevenue,
      subscription: subscriptionRevenue
    };
    setRevenueByType(revenueByType);
    
    // Calculer le revenu mensuel total
    const calculatedMonthlyRevenue = hourlyRevenue + packageRevenue + subscriptionRevenue;
    setMonthlyRevenue(calculatedMonthlyRevenue);
    
    // Calculer le revenu potentiel (sans limites de capacité)
    setPotentialRevenue(calculateTotalPotentialRevenue(serviceDetails, newClientsPerMonth) + subscriptionRevenue);
    
  }, [serviceDetails, hoursPerWeek, newClientsPerMonth, subscriptionClients]);
  
  // Formatage des montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <>
      {/* Section des paramètres de simulation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Impact de votre Tarification
        </h3>
        
        {/* Curseurs pour les paramètres de simulation */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Heures travaillées par semaine
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{hoursPerWeek}h</span>
            </div>
            <input
              type="range"
              min={1}
              max={70}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveaux clients par mois (forfaits)
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{newClientsPerMonth}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={newClientsPerMonth}
              onChange={(e) => setNewClientsPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Clients en abonnement
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">{subscriptionClients}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={subscriptionClients}
              onChange={(e) => setSubscriptionClients(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
      
      {/* Section des projections de revenus */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Projections de Revenus
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenu mensuel estimé</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyRevenue)}</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                Basé sur votre capacité de travail et acquisition client
              </p>
            </div>
          </div>
          
          <div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenu potentiel maximal</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(potentialRevenue)}</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                Sans contrainte de capacité de travail
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section de répartition des sources de revenus */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Répartition des sources de revenus
        </h3>
        
        {/* Afficher un message si aucun revenu n'est généré */}
        {monthlyRevenue === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ajustez vos paramètres pour voir la répartition des revenus.</p>
        )}
        
        {/* Vérification pour afficher une légende du total */}
        {monthlyRevenue > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Total: 100% ({formatCurrency(monthlyRevenue)})
          </p>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          {revenueByType.hourly > 0 && (
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Taux horaire (%)</p>
              </div>
              <p className="text-lg font-semibold mt-1">
                {monthlyRevenue > 0 
                  ? Math.round((revenueByType.hourly / monthlyRevenue) * 100)
                  : 0}%
              </p>
            </div>
          )}
          
          {revenueByType.package > 0 && (
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Forfaits (%)</p>
              </div>
              <p className="text-lg font-semibold mt-1">
                {monthlyRevenue > 0 
                  ? Math.round((revenueByType.package / monthlyRevenue) * 100)
                  : 0}%
              </p>
            </div>
          )}
          
          {revenueByType.subscription > 0 && (
            <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Abonnements (%)</p>
              </div>
              <p className="text-lg font-semibold mt-1">
                {monthlyRevenue > 0 
                  ? Math.round((revenueByType.subscription / monthlyRevenue) * 100)
                  : 0}%
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Section de positionnement tarifaire */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Positionnement Tarifaire
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarifs dans la moyenne du marché
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre positionnement à la moyenne du marché
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stratégie équilibrée. Bons compromis entre volume et marge, confortable pour indépendants.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lien vers le calculateur financier */}
      <div className="mt-6 text-right">
        <a 
          href="/finances" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvrir le calculateur financier complet
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </>
  );
};

export default PricingImpactSimulator;
