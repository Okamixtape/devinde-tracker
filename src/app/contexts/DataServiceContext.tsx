'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  getBusinessPlanService, 
  getSectionService,
  getAuthService
} from '../services/service-factory';
import { 
  BusinessPlanService,
  SectionService,
  AuthService
} from '../services/interfaces/service-interfaces';

// Définition de l'interface du contexte
interface DataServiceContextType {
  businessPlanService: BusinessPlanService;
  sectionService: SectionService;
  authService: AuthService;
  // Ajouter d'autres services ici au besoin
}

// Création du contexte avec des valeurs par défaut
const DataServiceContext = createContext<DataServiceContextType | undefined>(undefined);

// Props du fournisseur de contexte
interface DataServiceProviderProps {
  children: ReactNode;
  // Options pour remplacer les services par défaut (utile pour les tests)
  services?: Partial<DataServiceContextType>;
}

/**
 * Fournisseur du contexte DataService
 * 
 * Fournit l'accès aux services de données dans toute l'application.
 * 
 * @example
 * // Dans _app.tsx ou layout.tsx :
 * <DataServiceProvider>
 *   <App />
 * </DataServiceProvider>
 */
export const DataServiceProvider: React.FC<DataServiceProviderProps> = ({
  children,
  services
}) => {
  // On utilise les services locaux directement via les factories existantes
  // Cela garantit le bon typage et l'accès à toutes les méthodes spécifiques  
  const businessPlanService = services?.businessPlanService || getBusinessPlanService();
  const sectionService = services?.sectionService || getSectionService();
  const authService = services?.authService || getAuthService();
  
  // Valeur du contexte
  const contextValue: DataServiceContextType = {
    businessPlanService,
    sectionService,
    authService
    // Ajouter d'autres services ici au besoin
  };
  
  return (
    <DataServiceContext.Provider value={contextValue}>
      {children}
    </DataServiceContext.Provider>
  );
};

/**
 * Hook useDataServiceContext
 * 
 * Permet d'accéder au contexte DataService dans les composants.
 * 
 * @example
 * // Dans un composant :
 * const { businessPlanService } = useDataServiceContext();
 * 
 * // Utiliser le service
 * const fetchPlans = async () => {
 *   const result = await businessPlanService.getItems();
 *   if (result.success) {
 *     setPlans(result.data);
 *   }
 * };
 */
export const useDataServiceContext = (): DataServiceContextType => {
  const context = useContext(DataServiceContext);
  
  if (context === undefined) {
    throw new Error('useDataServiceContext doit être utilisé à l\'intérieur d\'un DataServiceProvider');
  }
  
  return context;
};

export default DataServiceContext;
