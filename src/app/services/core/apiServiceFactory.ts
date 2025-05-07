/**
 * API Service Factory - DevIndé Tracker
 * 
 * Factory pour créer des services API avec différentes configurations.
 * Permet de basculer facilement entre le stockage local et les API externes.
 */

import { StorageService } from "../services/interfaces/serviceInterfaces";
import { getBusinessPlanService, getSectionService } from '../serviceFactory';
import { BusinessPlanData, Section } from "../services/interfaces/dataModels";
import { createApiService, ApiServiceConfig } from './apiServiceAdapter';

// Configuration de l'environnement
const API_ENABLED = process.env.NEXT_PUBLIC_API_ENABLED === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Factory qui retourne un service approprié basé sur la configuration
 * Si les API sont activées, retourne le service API
 * Sinon, retourne le service de stockage local
 */
export function getServiceByEnvironment<T>(
  localService: StorageService<T>,
  apiConfig: ApiServiceConfig<T>
): StorageService<T> {
  // Si les API sont désactivées ou en mode dev sans backend,
  // utiliser le service de stockage local
  if (!API_ENABLED) {
    return localService;
  }
  
  // Sinon, créer un service API
  return createApiService<T>({
    ...apiConfig,
    baseUrl: API_BASE_URL
  });
}

/**
 * Retourne le service BusinessPlan approprié selon l'environnement
 */
export function getBusinessPlanApiService(): StorageService<BusinessPlanData> {
  const localService = getBusinessPlanService();
  
  const apiConfig: ApiServiceConfig<BusinessPlanData> = {
    baseUrl: API_BASE_URL,
    resourcePath: 'business-plans',
    transformers: {
      // Ces transformateurs peuvent être étendus pour adapter les données
      // entre le format d'API et le format local si nécessaire
      toApi: (data: BusinessPlanData) => ({
        ...data,
        // Convertir les champs si nécessaire
      }),
      fromApi: (apiData: any) => ({
        ...apiData,
        // Convertir les champs si nécessaire
      })
    }
  };
  
  return getServiceByEnvironment<BusinessPlanData>(localService, apiConfig);
}

/**
 * Retourne le service Section approprié selon l'environnement
 */
export function getSectionApiService(): StorageService<Section> {
  const localService = getSectionService();
  
  const apiConfig: ApiServiceConfig<Section> = {
    baseUrl: API_BASE_URL,
    resourcePath: 'sections',
    transformers: {
      // Ces transformateurs peuvent être étendus pour adapter les données
      // entre le format d'API et le format local si nécessaire
      toApi: (data: Section) => ({
        ...data,
        // Convertir les champs si nécessaire
      }),
      fromApi: (apiData: any) => ({
        ...apiData,
        // Convertir les champs si nécessaire
      })
    }
  };
  
  return getServiceByEnvironment<Section>(localService, apiConfig);
}

// Export d'autres fonctions de création de services API au besoin
const apiServiceFactory = {
  getBusinessPlanApiService,
  getSectionApiService
};

export default apiServiceFactory;
