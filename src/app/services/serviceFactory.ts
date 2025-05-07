/**
 * Service Factory - Provides access to singleton service instances
 * 
 * This module exports factory functions that return properly configured
 * service instances following the singleton pattern.
 */

import { 
  BusinessPlanService, 
  SectionService, 
  AuthService,
  SearchService,
  StorageService
} from "@/app/services/interfaces/serviceInterfaces";
import { MigrationService } from '@/app/services/interfaces/migrationService';
import { BusinessPlanServiceImpl } from '@/app/services/core/businessPlanService';
import { LocalStorageService } from '@/app/services/core/localStorageService';
import { authService } from '@/app/services/core/authService';
import { SectionServiceImpl } from '@/app/services/core/sectionService';
import { SearchServiceImpl } from '@/app/services/core/searchService';
import { MigrationServiceImpl } from '@/app/services/core/migrationService';
import { I18nService } from '@/app/services/interfaces/i18nService';
import { I18nServiceImpl } from '@/app/services/core/i18nService';

// Singleton instances
let businessPlanServiceInstance: BusinessPlanService | null = null;
let sectionServiceInstance: SectionService | null = null;
let i18nServiceInstance: I18nService | null = null;
let searchServiceInstance: SearchService | null = null;
let migrationServiceInstance: MigrationService | null = null;

/**
 * Get the business plan service
 */
export function getBusinessPlanService(): BusinessPlanService {
  if (!businessPlanServiceInstance) {
    businessPlanServiceInstance = new BusinessPlanServiceImpl();
  }
  return businessPlanServiceInstance;
}

/**
 * Get the section service
 */
export function getSectionService(): SectionService {
  if (!sectionServiceInstance) {
    sectionServiceInstance = new SectionServiceImpl();
  }
  return sectionServiceInstance;
}

/**
 * Get the search service
 */
export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchServiceImpl();
  }
  return searchServiceInstance;
}

/**
 * Get the authentication service
 */
export function getAuthService(): AuthService {
  // Utilisation directe de l'instance singleton importée
  return authService;
}

/**
 * Get the i18n service
 */
export function getI18nService(): I18nService {
  if (!i18nServiceInstance) {
    // Utiliser un type d'objet compatible avec StorageService
    // Structure attendue par I18nServiceImpl : { id?: string }
    interface StringItem { value: string; id?: string }
    const storageService = new LocalStorageService<StringItem>('devinde-tracker-preferences');
    i18nServiceInstance = new I18nServiceImpl(storageService as unknown as StorageService<string>);
  }
  return i18nServiceInstance;
}

/**
 * Get the migration service
 */
export function getMigrationService(): MigrationService {
  if (!migrationServiceInstance) {
    migrationServiceInstance = new MigrationServiceImpl();
  }
  return migrationServiceInstance;
}
