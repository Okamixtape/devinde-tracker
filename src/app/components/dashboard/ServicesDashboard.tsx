'use client';

import React, { useEffect, useState } from 'react';
import { BusinessPlanData } from '@/app/services/interfaces/dataModels';

// Importer les types et utilitaires depuis nos composants modulaires
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { loadServiceDetailsFromLocalStorage, calculateTotalPotentialRevenue, getValidServicesCount } from '@/app/plans/[id]/services/components/serviceUtils';
import { useFinancial } from '@/app/contexts/financialContext';

interface ServicesDashboardProps {
  businessPlan: BusinessPlanData;
}

export default function ServicesDashboard({ businessPlan }: ServicesDashboardProps) {
  // Utiliser le contexte financier partagé
  const { services: contextServices, updateServices } = useFinancial();
  
  // État pour stocker les détails des services récupérés du localStorage
  const [serviceDetails, setServiceDetails] = useState<Service[]>([]);
  
  // Charger les services du plan d'affaires ou du contexte
  useEffect(() => {
    // Si pas de plan d'affaires, sortir tôt
    if (!businessPlan?.id) return;
    
    // Si nous avons déjà des services dans le contexte, les utiliser
    if (contextServices && contextServices.length > 0) {
      setServiceDetails(contextServices);
      return;
    }
    
    // Sinon, récupérer les détails des services depuis le localStorage
    try {
      // Utiliser la fonction utilitaire pour charger les services
      const services = loadServiceDetailsFromLocalStorage(
        businessPlan.id, 
        businessPlan.services && typeof businessPlan.services === 'object' && 'offerings' in businessPlan.services 
          ? (businessPlan.services.offerings as string[] || []) 
          : []
      );
      
      // Mettre à jour l'état local
      setServiceDetails(services);
      
      // Mettre à jour le contexte pour les autres composants
      updateServices(services);
    } catch (e) {
      console.error('Erreur lors de la lecture des détails de services:', e);
    }
  }, [businessPlan, contextServices, updateServices]);
  
  // Synchroniser le contexte lorsque l'état local change
  useEffect(() => {
    if (serviceDetails.length > 0 && JSON.stringify(serviceDetails) !== JSON.stringify(contextServices)) {
      updateServices(serviceDetails);
    }
  }, [serviceDetails, contextServices, updateServices]);
  
  // Vérifier si pas de services, afficher un message
  if (!businessPlan) {
    return <div className="text-gray-500 dark:text-gray-400">Chargement des données...</div>;
  }
  
  const { services } = businessPlan || { services: {} };
  
  if (!services) {
    return <div className="text-gray-500 dark:text-gray-400">Aucune donnée de service disponible</div>;
  }

  
  // Calculer le revenu potentiel mensuel et le nombre de services valides en utilisant les fonctions utilitaires
  const getRevenue = () => calculateTotalPotentialRevenue(serviceDetails);
  const getValidCount = () => getValidServicesCount(serviceDetails);
  
  return (
    <div className="space-y-6">
      {/* Section des services */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold mb-3">Offres de service ({services.offerings.length})</h3>
        
        <div className="space-y-3">
          {/* Utiliser les détails du localStorage pour afficher les services avec leurs tarifs */}
          {serviceDetails.map((service, index) => (
            <div key={index} className="flex flex-col bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-800 dark:text-white">{service.name}</p>
              </div>
              
              <div className="gap-2 text-sm">
                {/* Mode horaire - afficher uniquement si le mode est horaire */}
                {service.billingMode === 'hourly' && service.hourlyRate && service.hourlyRate > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded flex items-center justify-between mb-1">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      {service.hourlyRate} €/h × {service.estimatedHours || 10}h = {(service.hourlyRate * (service.estimatedHours || 10))} €
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Tarif horaire</span>
                  </div>
                )}
                
                {/* Mode forfaitaire - afficher uniquement si le mode est forfaitaire */}
                {service.billingMode === 'package' && service.packagePrice && service.packagePrice > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded flex flex-col mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        {service.packagePrice} €
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Forfait fixe</span>
                    </div>
                    {service.estimatedHours && service.estimatedHours > 0 && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {service.estimatedHours}h estimées
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          ({Math.round(service.packagePrice / service.estimatedHours)}€/h)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Mode abonnement - afficher uniquement si le mode est abonnement */}
                {service.billingMode === 'subscription' && service.subscriptionPrice && service.subscriptionPrice > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded flex flex-col mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {service.subscriptionPrice} €/mois × {service.subscriptionDuration || 12} mois = {(service.subscriptionPrice * (service.subscriptionDuration || 12))} €
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Abonnement</span>
                    </div>
                    {service.estimatedHours && service.estimatedHours > 0 && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {service.estimatedHours}h estimées par mois
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          ({Math.round(service.subscriptionPrice / service.estimatedHours)}€/h)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact financier */}
      <div className="bg-white dark:bg-gray-800 bg-opacity-50 rounded-lg shadow-md p-4 dark:bg-opacity-50">
        <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Impact financier</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nombre de services proposés</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{services.offerings.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenu potentiel mensuel</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(getRevenue())} €
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({getValidCount()} projet{getValidCount() > 1 ? 's' : ''})</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
