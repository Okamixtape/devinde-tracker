/**
 * API Service Factory - DevIndé Tracker
 * 
 * Factory pour créer des services API avec différentes configurations.
 * Permet de basculer facilement entre le stockage local et les API externes.
 */

import { StorageService, BusinessPlanService, SectionService } from "../interfaces/serviceInterfaces";
import { getBusinessPlanService, getSectionService } from '../serviceFactory';
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
export function getBusinessPlanApiService(): BusinessPlanService {
  // Pour le moment, nous retournons simplement le service local
  // car BusinessPlanService a des méthodes spécifiques non présentes dans StorageService<BusinessPlanData>
  // comme getUserBusinessPlans, exportBusinessPlan, importBusinessPlan, duplicateBusinessPlan
  return getBusinessPlanService();
  
  // Note: Si à l'avenir nous implémentons une API complète pour les business plans,
  // il faudra adapter cette fonction pour supporter toutes les méthodes spécifiques
}

/**
 * Retourne le service Section approprié selon l'environnement
 */
export function getSectionApiService(): SectionService {
  // Pour le moment, nous retournons simplement le service local
  // car SectionService n'implémente pas StorageService<Section>
  return getSectionService();
  
  // Note: Si à l'avenir nous implémentons une API pour les sections,
  // il faudra adapter cette fonction et s'assurer que l'implémentation
  // de SectionService inclut les méthodes de StorageService<Section>
}

// Export d'autres fonctions de création de services API au besoin
const apiServiceFactory = {
  getBusinessPlanApiService,
  getSectionApiService
};

export default apiServiceFactory;
