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
  StorageService
} from './interfaces/service-interfaces';
import { 
  ServiceResult, 
  Section 
} from './interfaces/data-models';
import { BusinessPlanServiceImpl } from './core/business-plan-service';
import { LocalStorageService } from './core/local-storage-service';
import { UserData, UserRole } from './core/auth-service';

// Singleton instances
let businessPlanServiceInstance: BusinessPlanService | null = null;
let sectionServiceInstance: SectionService | null = null;
let authServiceInstance: AuthService | null = null;

// Storage service instances
let businessPlanStorageService: BusinessPlanService | null = null;
let sectionStorageService: StorageService<Section> | null = null;
let userStorageService: StorageService<UserData> | null = null;

/**
 * Get the storage service for business plans
 */
export function getBusinessPlanStorageService(): BusinessPlanService {
  if (!businessPlanStorageService) {
    // Use the real BusinessPlanServiceImpl instead of the mock implementation
    businessPlanStorageService = new BusinessPlanServiceImpl();
  }
  // Not null assertion is safe here because we just instantiated it if it was null
  return businessPlanStorageService!;
}

/**
 * Get the storage service for sections
 */
export function getSectionStorageService(): StorageService<Section> {
  if (!sectionStorageService) {
    // Use proper storage service for sections
    sectionStorageService = new LocalStorageService<Section>('devinde-tracker-sections');
  }
  // Not null assertion is safe here because we just instantiated it if it was null
  return sectionStorageService!;
}

/**
 * Get the storage service for users
 */
export function getUserStorageService(): StorageService<UserData> {
  if (!userStorageService) {
    // Use proper storage service for users
    userStorageService = new LocalStorageService<UserData>('devinde-tracker-users');
  }
  // Not null assertion is safe here because we just instantiated it if it was null
  return userStorageService!;
}

/**
 * Get the business plan service
 */
export function getBusinessPlanService(): BusinessPlanService {
  if (!businessPlanServiceInstance) {
    // Instead of creating a new service, we should use the storage service we've already configured
    businessPlanServiceInstance = getBusinessPlanStorageService();
  }
  return businessPlanServiceInstance;
}

/**
 * Get the section service
 */
export function getSectionService(): SectionService {
  if (!sectionServiceInstance) {
    const storage = getSectionStorageService();
    sectionServiceInstance = {
      ...storage,
      getSections: async (businessPlanId: string): Promise<ServiceResult<Section[]>> => {
        return { 
          success: true, 
          data: [
            { 
              id: 'section-1', 
              businessPlanId,
              key: 'pitch',
              title: 'Pitch', 
              icon: 'presentation',
              color: 'blue',
              completion: 0,
              route: '/pitch'
            },
            {
              id: 'section-2',
              businessPlanId,
              key: 'services',
              title: 'Services',
              icon: 'tools',
              color: 'green',
              completion: 0,
              route: '/services'
            }
          ]
        };
      },
      updateSectionCompletion: async (id: string, completion: number): Promise<ServiceResult<Section>> => {
        const result = await storage.getItem(id);
        if (!result.success || !result.data) {
          return {
            success: false,
            error: {
              code: 'SECTION_NOT_FOUND',
              message: `Section with ID ${id} not found`
            }
          };
        }
        
        // Ensure we have all required properties from the original section
        const sectionData = result.data;
        
        // Make sure we have a valid ID
        if (!sectionData.id) {
          return {
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'Section ID is required'
            }
          };
        }
        
        // Return updated section with required fields
        return { 
          success: true, 
          data: { 
            id: sectionData.id,
            businessPlanId: sectionData.businessPlanId || '',
            key: sectionData.key || 'default',
            title: sectionData.title || 'Untitled',
            icon: sectionData.icon || 'document',
            color: sectionData.color || 'gray',
            route: sectionData.route || '/',
            completion: completion,
          }
        };
      }
    };
  }
  return sectionServiceInstance!;
}

/**
 * Get the auth service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = {
      register: async (email: string, password: string, userData?: Record<string, unknown>): Promise<ServiceResult<UserData>> => {
        // Password is used for validation in a real implementation
        console.log(`Registering user with email: ${email} and password length: ${password.length}`);
        return { 
          success: true, 
          data: { 
            id: 'new-user-id',
            email,
            name: userData?.name as string,
            role: UserRole.USER,
            createdAt: new Date().toISOString(),
          } 
        };
      },
      login: async (email: string, password: string): Promise<ServiceResult<UserData>> => {
        // Password is used for validation in a real implementation
        console.log(`Login attempt for user: ${email} with password length: ${password.length}`);
        return { 
          success: true, 
          data: { 
            id: 'user-123',
            email,
            role: UserRole.USER,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          } 
        };
      },
      logout: async (): Promise<ServiceResult<boolean>> => {
        return { success: true, data: true };
      },
      getCurrentUser: async (): Promise<ServiceResult<UserData>> => {
        return { 
          success: true, 
          data: { 
            id: 'user-123',
            email: 'user@example.com',
            role: UserRole.USER,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          } 
        };
      },
      isAuthenticated: async (): Promise<boolean> => {
        return true;
      }
    };
  }
  return authServiceInstance!;
}

/**
 * Reset all service instances (mainly for testing)
 */
export function resetServices(): void {
  businessPlanServiceInstance = null;
  sectionServiceInstance = null;
  authServiceInstance = null;
  businessPlanStorageService = null;
  sectionStorageService = null;
  userStorageService = null;
}

// Create an object with all the exports
const serviceFactoryExports = {
  getBusinessPlanService,
  getSectionService,
  getAuthService,
  resetServices
};

// Export the object as the default export
export default serviceFactoryExports;
