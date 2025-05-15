/**
 * Services Index - Central export point for all services
 */

// Service Interfaces - Export façon sélective pour éviter les collisions
// Exporter de service-interfaces.ts
export type {
  StorageService,
  BusinessPlanService,
  SectionService,
  ISectionService,
  Section as SectionInterface,
  BusinessPlan,
  AuthService,
  UserPreferences
} from "./interfaces/service-interfaces";

// Exporter de dataModels.ts (sans l'interface Section qui est déjà exportée)
export type {
  BusinessPlanData,
  BusinessPlanMetaData,
  UserSettingsData,
  PitchData,
  ServicesData,
  BusinessModelData,
  MarketAnalysisData,
  FinancialsData,
  ActionPlanData,
  ServiceResult,
  ServiceError,
  HourlyRate,
  ServicePackage,
  Subscription,
  Milestone,
  Task
} from "./interfaces/dataModels";

// Core Services
export { LocalStorageService } from './core/localStorageService';
export { BusinessPlanServiceImpl } from './core/businessPlanService';
export { SectionServiceImpl } from './core/sectionService';
export { authService } from './core/authService';

// Utility Helpers
export * from './utils/helpers';

// Service Instances (Singletons)
import { BusinessPlanServiceImpl } from './core/businessPlanService';
import { SectionServiceImpl } from './core/sectionService';
import { authService } from './core/authService';

// Create singleton instances
export const businessPlanService = new BusinessPlanServiceImpl();
export const sectionService = new SectionServiceImpl();
// L'instance authService est déjà exportée depuis authService.ts

/**
 * Service Factory - Get instances of services
 */
export const serviceFactory = {
  getBusinessPlanService: () => businessPlanService,
  getSectionService: () => sectionService as ISectionService,
  getAuthService: () => authService
};
