'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Service } from '@/app/plans/[id]/services/components/ServiceCard';
import { calculateTotalPotentialRevenue } from '@/app/plans/[id]/services/components/serviceUtils';

/**
 * Interface pour le contexte financier partagé
 */
interface FinancialContextType {
  services: Service[];
  monthlyRevenue: number;
  businessPlanId: string;
  updateServices: (services: Service[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Props du provider de contexte financier
 */
interface FinancialProviderProps {
  children: ReactNode;
  businessPlanId: string;
  initialServices?: Service[];
  initialTab?: string;
}

// Création du contexte avec des valeurs par défaut
export const FinancialContext = createContext<FinancialContextType>({
  services: [],
  monthlyRevenue: 0,
  businessPlanId: '',
  updateServices: () => {},
  activeTab: 'overview',
  setActiveTab: () => {},
});

/**
 * Hook personnalisé pour utiliser le contexte financier
 */
export const useFinancial = () => useContext(FinancialContext);

/**
 * Provider du contexte financier
 */
export const FinancialProvider: React.FC<FinancialProviderProps> = ({
  children,
  businessPlanId,
  initialServices = [],
  initialTab = 'overview',
}) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  // Calcul du revenu mensuel basé sur les services
  const monthlyRevenue = calculateTotalPotentialRevenue(services);
  
  // Fonction pour mettre à jour les services et recalculer le revenu
  const updateServices = (newServices: Service[]) => {
    setServices(newServices);
  };
  
  return (
    <FinancialContext.Provider
      value={{
        services,
        monthlyRevenue,
        businessPlanId,
        updateServices,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
