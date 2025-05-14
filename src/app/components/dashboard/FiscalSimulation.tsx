'use client';

import React, { useState, useEffect } from 'react';
import { 
  simulateFiscalImpact, 
  COTISATIONS_RATES, 
  ACRE_EXONERATION 
} from '@/app/utils/fiscalCalculations';
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { loadServiceDetailsFromLocalStorage, calculateTotalPotentialRevenue } from '@/app/plans/[id]/services/components/serviceUtils';
import { useFinancial } from '@/app/contexts/financialContext';

interface FiscalSimulationProps {
  revenue?: number;
  businessPlanId?: string;
}

/**
 * Composant pour afficher une simulation fiscale pour auto-entrepreneurs
 */
const FiscalSimulation: React.FC<FiscalSimulationProps> = ({ revenue = 0, businessPlanId }) => {
  // Utiliser le contexte financier partagé
  const { services: contextServices, monthlyRevenue } = useFinancial();
  
  // États pour les paramètres de simulation
  const [activityType, setActivityType] = useState<number>(COTISATIONS_RATES.SERVICES_LIBERAUX);
  const [firstYearReduction, setFirstYearReduction] = useState<number>(ACRE_EXONERATION.YEAR_1);
  const [isTVAApplicable, setIsTVAApplicable] = useState<boolean>(true);
  const [calculatedRevenue, setCalculatedRevenue] = useState<number>(revenue);
  const [serviceDetails, setServiceDetails] = useState<Service[]>([]);
  
  // Utiliser les services du contexte et charger les services du plan d'affaires si nécessaire
  useEffect(() => {
    if (contextServices.length > 0) {
      // Priorité aux services du contexte
      setServiceDetails(contextServices);
      setCalculatedRevenue(monthlyRevenue || calculateTotalPotentialRevenue(contextServices, 1));
    } else if (businessPlanId) {
      try {
        // Fallback : charger les services depuis le localStorage
        const services = loadServiceDetailsFromLocalStorage(businessPlanId, []);
        setServiceDetails(services);
        
        // Calculer le revenu potentiel à partir des services
        if (services.length > 0) {
          // Utiliser les valeurs par défaut pour les nouveaux clients (1) et les abonnements
          const calculatedTotal = calculateTotalPotentialRevenue(services, 1);
          setCalculatedRevenue(calculatedTotal);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des services pour la simulation fiscale:', e);
      }
    }
  }, [businessPlanId, contextServices, monthlyRevenue]);
  
  // Utiliser le revenu calculé ou celui fourni en props
  const revenueToUse = calculatedRevenue || monthlyRevenue || revenue;
  
  // Effectuer la simulation avec les paramètres actuels
  const simulation = simulateFiscalImpact(
    revenueToUse,
    activityType,
    firstYearReduction,
    isTVAApplicable
  );
  
  // Afficher les services utilisés pour le calcul
  const servicesInfo = serviceDetails.length > 0 ? (
    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
      <p className="font-medium">Services inclus dans le calcul :</p>
      <ul className="list-disc list-inside mt-1 space-y-1">
        {serviceDetails.map((service, index) => (
          <li key={index}>
            {service.name} - 
            {service.billingMode === 'hourly' && service.hourlyRate ? 
              `${service.hourlyRate}€/h × ${service.estimatedHours || 0}h` : 
              service.billingMode === 'package' && service.packagePrice ? 
              `${service.packagePrice}€ (forfait)` : 
              service.billingMode === 'subscription' && service.subscriptionPrice ? 
              `${service.subscriptionPrice}€/mois (abonnement)` : 
              'Non tarifé'}
          </li>
        ))}
      </ul>
    </div>
  ) : null;
  
  // Déterminer le libellé du type d'activité
  const getActivityTypeLabel = () => {
    switch(activityType) {
      case COTISATIONS_RATES.SERVICES_LIBERAUX:
        return "Services libéraux (21.8%)";
      case COTISATIONS_RATES.SERVICES_COMMERCIAUX:
        return "Services commerciaux (12.8%)";
      case COTISATIONS_RATES.VENTE_MARCHANDISES:
        return "Vente de marchandises (6.3%)";
      default:
        return "Services libéraux (21.8%)";
    }
  };
  
  // Déterminer le libellé de la réduction ACRE
  const getAcreReductionLabel = () => {
    switch(firstYearReduction) {
      case ACRE_EXONERATION.YEAR_1:
        return "1ère année (50%)";
      case ACRE_EXONERATION.YEAR_2:
        return "2ème année (25%)";
      case ACRE_EXONERATION.YEAR_3:
        return "3ème année (10%)";
      case 0:
        return "Aucune réduction";
      default:
        return "Aucune réduction";
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
        Simulation fiscale (Auto-entrepreneur)
      </h3>
      
      {/* Paramètres de la simulation */}
      <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Type d'activité
            </label>
            <select
              value={String(activityType)}
              onChange={(e) => setActivityType(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value={String(COTISATIONS_RATES.SERVICES_LIBERAUX)}>Services libéraux (21.8%)</option>
              <option value={String(COTISATIONS_RATES.SERVICES_COMMERCIAUX)}>Services commerciaux (12.8%)</option>
              <option value={String(COTISATIONS_RATES.VENTE_MARCHANDISES)}>Vente de marchandises (6.3%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Réduction ACRE
            </label>
            <select
              value={String(firstYearReduction)}
              onChange={(e) => setFirstYearReduction(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value={String(ACRE_EXONERATION.YEAR_1)}>1ère année (50%)</option>
              <option value={String(ACRE_EXONERATION.YEAR_2)}>2ème année (25%)</option>
              <option value={String(ACRE_EXONERATION.YEAR_3)}>3ème année (10%)</option>
              <option value="0">Aucune réduction</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Assujetti à la TVA
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isTVAApplicable}
                  onChange={(e) => setIsTVAApplicable(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {isTVAApplicable ? "Oui" : "Non"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résultats de la simulation */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Paramètres appliqués: {getActivityTypeLabel()} | {getAcreReductionLabel()} | TVA: {isTVAApplicable ? "Oui" : "Non"}
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Revenu brut */}
          <div className="grid grid-cols-2 p-4 items-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires mensuel HT</div>
              <div className="font-semibold text-gray-800 dark:text-white">{simulation.revenueHT.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires mensuel TTC</div>
              <div className="font-semibold text-gray-800 dark:text-white">{simulation.revenueTTC.toFixed(2)} €</div>
            </div>
          </div>
          
          {/* TVA */}
          <div className="grid grid-cols-1 p-4 items-center">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">TVA collectée (20%)</div>
                <div className="font-semibold text-blue-600 dark:text-blue-400">{simulation.tva.toFixed(2)} €</div>
              </div>
              <div className="text-sm italic text-gray-500 dark:text-gray-400 self-end">
                {isTVAApplicable ? "À reverser à l'état" : "Non applicable"}
              </div>
            </div>
          </div>
          
          {/* Cotisations sociales */}
          <div className="grid grid-cols-1 p-4 items-center">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Cotisations sociales ({(simulation.cotisationsRate * 100).toFixed(1)}%)
                </div>
                <div className="font-semibold text-red-600 dark:text-red-400">{simulation.cotisations.toFixed(2)} €</div>
              </div>
              <div className="text-sm italic text-gray-500 dark:text-gray-400 self-end">
                {firstYearReduction > 0 ? `Réduction ACRE de ${firstYearReduction * 100}% appliquée` : ""}
              </div>
            </div>
          </div>
          
          {/* Revenu net */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4">
            <div className="grid grid-cols-2 items-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Revenu net mensuel</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{simulation.revenueNet.toFixed(2)} €</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Taux de prélèvement effectif</div>
                <div className="font-semibold text-gray-700 dark:text-gray-300">
                  {((simulation.cotisations / simulation.revenueHT) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Afficher les services utilisés dans le calcul */}
      {servicesInfo}
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
        Note: Cette simulation est fournie à titre indicatif et ne remplace pas les conseils d'un expert-comptable.
        Les taux de cotisations sont basés sur les chiffres de 2023.
      </div>
    </div>
  );
};

export default FiscalSimulation;
