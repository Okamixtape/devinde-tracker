/**
 * Services Index - Central export point for all services
 */

// Service Interfaces
export * from './interfaces/service-interfaces';
export * from './interfaces/data-models';

// Core Services
export { LocalStorageService } from './core/local-storage-service';
export { BusinessPlanServiceImpl } from './core/business-plan-service';
export { SectionServiceImpl, Section } from './core/section-service';
export { AuthServiceImpl } from './core/auth-service';

// Utility Helpers
export * from './utils/helpers';

// Service Instances (Singletons)
import { BusinessPlanServiceImpl } from './core/business-plan-service';
import { SectionServiceImpl } from './core/section-service';
import { AuthServiceImpl } from './core/auth-service';

// Create singleton instances
export const businessPlanService = new BusinessPlanServiceImpl();
export const sectionService = new SectionServiceImpl();
export const authService = new AuthServiceImpl();

/**
 * Service Factory - Get instances of services
 */
export const serviceFactory = {
  getBusinessPlanService: () => businessPlanService,
  getSectionService: () => sectionService,
  getAuthService: () => authService
};
