/**
 * API Service Factory - DevIndé Tracker
 * 
 * Factory pour créer des services API avec différentes configurations.
 * Permet de basculer facilement entre le stockage local et les API externes.
 */

import { createApiService, ApiServiceConfig } from './api-service-adapter';
import { StorageService } from '../interfaces/service-interfaces';
import { getBusinessPlanStorageService, getSectionStorageService } from '../service-factory';
import { BusinessPlanData, Section } from '../interfaces/data-models';

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
  const localService = getBusinessPlanStorageService();
  
  const apiConfig: ApiServiceConfig<BusinessPlanData> = {
    baseUrl: API_BASE_URL,
    resourcePath: 'business-plans',
    transformers: {
      // Ces transformateurs peuvent être étendus pour adapter les données
      // entre le format d'API et le format local si nécessaire
      toApi: (data: BusinessPlanData) => ({
        ...data,
        // Transformation spécifique ici si nécessaire
      }),
      fromApi: (apiData: any): BusinessPlanData => ({
        ...apiData,
        // Transformation spécifique ici si nécessaire
      }),
    }
  };
  
  return getServiceByEnvironment<BusinessPlanData>(localService, apiConfig);
}

/**
 * Retourne le service Section approprié selon l'environnement
 */
export function getSectionApiService(): StorageService<Section> {
  const localService = getSectionStorageService();
  
  const apiConfig: ApiServiceConfig<Section> = {
    baseUrl: API_BASE_URL,
    resourcePath: 'sections',
    transformers: {
      // Ces transformateurs peuvent être étendus pour adapter les données
      // entre le format d'API et le format local si nécessaire
      toApi: (data: Section) => ({
        ...data,
        // Transformation spécifique ici si nécessaire
      }),
      fromApi: (apiData: any): Section => ({
        ...apiData,
        // Transformation spécifique ici si nécessaire
      }),
    }
  };
  
  return getServiceByEnvironment<Section>(localService, apiConfig);
}

// Export d'autres fonctions de création de services API au besoin
export default {
  getBusinessPlanApiService,
  getSectionApiService
};
