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
import { ServiceResult } from './interfaces/data-models';

// Define missing interfaces that would be in data-models.ts
interface BusinessPlanData {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: SectionData[];
}

interface SectionData {
  id?: string;
  businessPlanId: string;
  title: string;
  content: string;
  order: number;
  completion?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserData {
  id?: string;
  username: string;
  password?: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Singleton instances
let businessPlanServiceInstance: BusinessPlanService | null = null;
let sectionServiceInstance: SectionService | null = null;
let authServiceInstance: AuthService | null = null;

// Storage service instances
let businessPlanStorageService: StorageService<BusinessPlanData> | null = null;
let sectionStorageService: StorageService<SectionData> | null = null;
let userStorageService: StorageService<UserData> | null = null;

/**
 * Get the storage service for business plans
 */
export function getBusinessPlanStorageService(): StorageService<BusinessPlanData> {
  if (!businessPlanStorageService) {
    businessPlanStorageService = {
      getItems: async (): Promise<ServiceResult<BusinessPlanData[]>> => {
        return { success: true, data: [] };
      },
      getItem: async (id: string): Promise<ServiceResult<BusinessPlanData>> => {
        // Log the id to ensure it's used
        console.log(`Fetching business plan with id: ${id}`);
        return { success: true, data: { id, name: 'Example Plan' } };
      },
      createItem: async (item: BusinessPlanData): Promise<ServiceResult<BusinessPlanData>> => {
        return { success: true, data: { ...item, id: 'new-id' } };
      },
      updateItem: async (id: string, updates: Partial<BusinessPlanData>): Promise<ServiceResult<BusinessPlanData>> => {
        return { success: true, data: { ...updates, id, name: updates.name || 'Updated Plan' } };
      },
      deleteItem: async (id: string): Promise<ServiceResult<boolean>> => {
        return { success: true, data: true };
      }
    };
  }
  return businessPlanStorageService;
}

/**
 * Get the storage service for sections
 */
export function getSectionStorageService(): StorageService<SectionData> {
  if (!sectionStorageService) {
    sectionStorageService = {
      getItems: async (): Promise<ServiceResult<SectionData[]>> => {
        return { success: true, data: [] };
      },
      getItem: async (id: string): Promise<ServiceResult<SectionData>> => {
        // Log the id to ensure it's used
        console.log(`Fetching section with id: ${id}`);
        return { 
          success: true, 
          data: { 
            id, 
            businessPlanId: 'plan-1',
            title: 'Example Section',
            content: 'Content here',
            order: 1
          } 
        };
      },
      createItem: async (item: SectionData): Promise<ServiceResult<SectionData>> => {
        return { success: true, data: { ...item, id: 'new-section-id' } };
      },
      updateItem: async (id: string, updates: Partial<SectionData>): Promise<ServiceResult<SectionData>> => {
        return { 
          success: true, 
          data: { 
            id,
            businessPlanId: updates.businessPlanId || 'plan-1',
            title: updates.title || 'Updated Section',
            content: updates.content || 'Updated content',
            order: updates.order || 1
          }
        };
      },
      deleteItem: async (id: string): Promise<ServiceResult<boolean>> => {
        return { success: true, data: true };
      }
    };
  }
  return sectionStorageService;
}

/**
 * Get the storage service for users
 */
export function getUserStorageService(): StorageService<UserData> {
  if (!userStorageService) {
    userStorageService = {
      getItems: async (): Promise<ServiceResult<UserData[]>> => {
        return { success: true, data: [] };
      },
      getItem: async (id: string): Promise<ServiceResult<UserData>> => {
        // Log the id to ensure it's used
        console.log(`Fetching user with id: ${id}`);
        return { success: true, data: { id, username: 'user123' } };
      },
      createItem: async (item: UserData): Promise<ServiceResult<UserData>> => {
        return { success: true, data: { ...item, id: 'new-user-id' } };
      },
      updateItem: async (id: string, updates: Partial<UserData>): Promise<ServiceResult<UserData>> => {
        return { success: true, data: { ...updates, id, username: updates.username || 'user123' } };
      },
      deleteItem: async (id: string): Promise<ServiceResult<boolean>> => {
        return { success: true, data: true };
      }
    };
  }
  return userStorageService;
}

/**
 * Get the business plan service
 */
export function getBusinessPlanService(): BusinessPlanService {
  if (!businessPlanServiceInstance) {
    const storage = getBusinessPlanStorageService();
    businessPlanServiceInstance = {
      ...storage,
      getUserBusinessPlans: async (userId: string): Promise<ServiceResult<BusinessPlanData[]>> => {
        console.log(`Fetching business plans for user: ${userId}`);
        return { success: true, data: [] };
      },
      exportBusinessPlan: async (id: string, format?: string): Promise<ServiceResult<unknown>> => {
        const result = await storage.getItem(id);
        if (!result.success) {
          return result;
        }
        return { 
          success: true, 
          data: {
            format: format || 'json',
            content: JSON.stringify(result.data)
          }
        };
      },
      importBusinessPlan: async (data: BusinessPlanData): Promise<ServiceResult<BusinessPlanData>> => {
        return { 
          success: true, 
          data: { 
            id: 'imported-plan',
            name: data.name || 'Imported Plan' 
          } 
        };
      },
      duplicateBusinessPlan: async (id: string, newName?: string): Promise<ServiceResult<BusinessPlanData>> => {
        const result = await storage.getItem(id);
        if (!result.success) {
          return result;
        }
        const planData = result.data;
        return { 
          success: true, 
          data: { 
            ...planData,
            id: 'new-' + id,
            name: newName || `Copy of ${planData.name}`
          } 
        };
      }
    };
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
      getSections: async (businessPlanId: string): Promise<ServiceResult<SectionData[]>> => {
        return { 
          success: true, 
          data: [
            { 
              id: 'section-1', 
              businessPlanId, 
              title: 'Executive Summary', 
              content: 'Executive summary content', 
              order: 1 
            },
            { 
              id: 'section-2', 
              businessPlanId, 
              title: 'Market Analysis', 
              content: 'Market analysis content', 
              order: 2
            }
          ]
        };
      },
      updateSectionCompletion: async (id: string, completion: number): Promise<ServiceResult<SectionData>> => {
        const result = await storage.getItem(id);
        if (!result.success) {
          return result;
        }
        
        // Ensure we have all required properties from the original section
        const sectionData = result.data;
        
        return { 
          success: true, 
          data: { 
            ...sectionData,
            completion 
          }
        };
      }
    };
  }
  return sectionServiceInstance;
}

/**
 * Get the auth service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = {
      register: async (email: string, password: string, userData?: UserData): Promise<ServiceResult<UserData>> => {
        console.log(`Registering user with email: ${email} and password length: ${password.length}`);
        return { 
          success: true, 
          data: { 
            id: 'new-user',
            username: email,
            email,
            ...userData
          } 
        };
      },
      login: async (email: string, password: string): Promise<ServiceResult<{ token: string; user: UserData }>> => {
        console.log(`Logging in user with email: ${email} and password length: ${password.length}`);
        return { 
          success: true, 
          data: { 
            token: 'mock-jwt-token',
            user: {
              id: 'user-1',
              username: email,
              email
            }
          } 
        };
      },
      logout: async (): Promise<ServiceResult<boolean>> => {
        return { success: true, data: true };
      },
      getCurrentUser: async (): Promise<ServiceResult<UserData | null>> => {
        return { 
          success: true, 
          data: {
            id: 'user-1',
            username: 'current-user@example.com',
            email: 'current-user@example.com',
            role: 'user'
          }
        };
      },
      isAuthenticated: async (): Promise<boolean> => {
        return true; 
      }
    };
  }
  return authServiceInstance;
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
