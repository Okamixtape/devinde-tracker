/**
 * BusinessPlanService - Implementation of business plan data operations
 */
import { BusinessPlanService } from '../interfaces/service-interfaces';
import { 
  BusinessPlanData, 
  ServiceResult
} from '../interfaces/data-models';
import { LocalStorageService } from './local-storage-service';
import { generateUUID, getCurrentISOTimestamp, validateObject } from '../utils/helpers';
import { secureLocalStorage } from '../utils/security';

/**
 * Storage key for business plans
 */
export const BUSINESS_PLANS_STORAGE_KEY = 'devinde-tracker-business-plans';

/**
 * Default empty data for a new business plan
 */
export const getDefaultBusinessPlanData = (): Omit<BusinessPlanData, 'name'> => ({
  pitch: {
    title: "",
    summary: "",
    vision: "",
    values: []
  },
  services: {
    offerings: [],
    technologies: [],
    process: []
  },
  businessModel: {
    hourlyRates: [],
    packages: [],
    subscriptions: []
  },
  marketAnalysis: {
    competitors: [],
    targetClients: [],
    trends: []
  },
  financials: {
    initialInvestment: 0,
    quarterlyGoals: [0, 0, 0, 0],
    expenses: []
  },
  actionPlan: {
    milestones: [],
    tasks: []
  },
  sections: []
});

/**
 * BusinessPlanServiceImpl - Concrete implementation using localStorage
 */
export class BusinessPlanServiceImpl 
  extends LocalStorageService<BusinessPlanData> 
  implements BusinessPlanService {
  
  constructor() {
    super(BUSINESS_PLANS_STORAGE_KEY);
    
    // Reset corrupted storage on init
    this.resetStorageIfCorrupted();
  }
  
  /**
   * Reset storage if it contains corrupted data
   */
  private resetStorageIfCorrupted(): void {
    // Vérifier si l'on est côté client (navigateur) avant d'utiliser localStorage
    if (typeof window === 'undefined') {
      // On est côté serveur, localStorage n'est pas disponible
      console.log('resetStorageIfCorrupted appelé côté serveur - ignoré');
      return;
    }
    
    try {
      // Approche plus agressive : vérifier et nettoyer toutes les clés de localStorage
      // liées aux plans d'affaires
      const keysToCheck = [
        BUSINESS_PLANS_STORAGE_KEY,
        'devinde-tracker-sections',
        'devinde-tracker-user',
        'devinde-tracker-auth'
      ];
      
      for (const key of keysToCheck) {
        try {
          // Essayer de récupérer et décrypter les données
          const rawData = localStorage.getItem(key);
          if (rawData) {
            try {
              // Si la déchiffrement échoue, supprimer cette clé
              secureLocalStorage.getItem(key);
            } catch (error) {
              console.log(`Détection de données corrompues pour ${key}, nettoyage:`, 
                error instanceof Error ? error.message : 'Erreur inconnue');
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.log(`Erreur lors de l'accès à ${key}, suppression:`, 
            error instanceof Error ? error.message : 'Erreur inconnue');
          localStorage.removeItem(key);
        }
      }
      
      // Vérifier s'il existe des clés orphelines ou corrompues qui commencent par devinde-tracker
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devinde-tracker')) {
          if (!keysToCheck.includes(key)) {
            try {
              // Essayer de déchiffrer, sinon supprimer
              secureLocalStorage.getItem(key);
            } catch (error) {
              console.log(`Détection d'une clé orpheline ou corrompue ${key}, nettoyage:`, 
                error instanceof Error ? error.message : 'Erreur inconnue');
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      // En cas d'erreur grave, réinitialiser complètement le stockage lié à l'application
      console.log('Erreur critique lors du nettoyage du stockage, réinitialisation complète:', 
        error instanceof Error ? error.message : 'Erreur inconnue');
      
      // Supprimer toutes les clés liées à l'application
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devinde-tracker')) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Create a new business plan with validation
   */
  async createItem(item: BusinessPlanData): Promise<ServiceResult<BusinessPlanData>> {
    // Validate required fields
    const validation = validateObject(item, ['name']);
    
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required fields: ${validation.missingFields.join(', ')}`
        }
      };
    }
    
    // Set default values for new business plan
    const now = getCurrentISOTimestamp();
    const defaultData = getDefaultBusinessPlanData();
    
    const newItem: BusinessPlanData = {
      ...defaultData,
      ...item,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
      meta: {
        version: 1,
        exportCount: 0,
        lastUpdated: now,
        ...(item.meta || {})
      },
      settings: {
        theme: 'light',
        language: 'en',
        notifications: false,
        ...(item.settings || {})
      },
      sections: item.sections || []
    };
    
    return super.createItem(newItem);
  }

  /**
   * Update a business plan with proper metadata updates
   */
  async updateItem(id: string, item: Partial<BusinessPlanData>): Promise<ServiceResult<BusinessPlanData>> {
    // Get the current item first
    const currentResult = await this.getItem(id);
    
    if (!currentResult.success || !currentResult.data) {
      return currentResult;
    }
    
    const currentItem = currentResult.data;
    const now = getCurrentISOTimestamp();
    
    // Update metadata while preserving other fields
    const updatedItem: Partial<BusinessPlanData> = {
      ...item,
      updatedAt: now,
      meta: {
        ...(currentItem.meta || { version: 1, exportCount: 0 }),
        ...(item.meta || {}),
        lastUpdated: now,
        version: ((currentItem.meta?.version || 1) + 1)
      }
    };
    
    return super.updateItem(id, updatedItem);
  }

  /**
   * Get all business plans for a specific user
   */
  async getUserBusinessPlans(userId: string): Promise<ServiceResult<BusinessPlanData[]>> {
    const result = await this.getItems();
    
    if (!result.success) {
      return result;
    }
    
    // Filter plans by user ID
    const userPlans = (result.data || []).filter(plan => plan.userId === userId);
    
    return {
      success: true,
      data: userPlans
    };
  }

  /**
   * Export a business plan to a specified format
   */
  async exportBusinessPlan(id: string, format: string = 'json'): Promise<ServiceResult<{
    content: string;
    filename: string;
    contentType: string;
  }>> {
    const result = await this.getItem(id);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || {
          code: 'NOT_FOUND',
          message: 'Business plan not found'
        }
      };
    }
    
    const plan = result.data;
    
    // Update export count
    if (plan.meta) {
      await this.updateItem(id, {
        meta: {
          ...plan.meta,
          exportCount: (plan.meta.exportCount || 0) + 1
        }
      });
    }
    
    if (format === 'json') {
      return {
        success: true,
        data: {
          content: JSON.stringify(plan, null, 2),
          filename: `${plan.name.replace(/\s+/g, '-').toLowerCase()}-${getCurrentISOTimestamp().split('T')[0]}.json`,
          contentType: 'application/json'
        }
      };
    }
    
    // Support for other export formats could be added here
    
    return {
      success: false,
      error: {
        code: 'UNSUPPORTED_FORMAT',
        message: `Export format '${format}' is not supported`
      }
    };
  }

  /**
   * Import a business plan from external data
   */
  async importBusinessPlan(data: unknown): Promise<ServiceResult<BusinessPlanData>> {
    try {
      let planData: Partial<BusinessPlanData>;
      
      // Handle string JSON input
      if (typeof data === 'string') {
        planData = JSON.parse(data);
      } else {
        planData = data as Partial<BusinessPlanData>;
      }
      
      // Validate the imported data
      if (!planData.name) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Imported business plan data is invalid: missing required fields'
          }
        };
      }
      
      // Create a new ID for the imported plan to avoid conflicts
      const defaultData = getDefaultBusinessPlanData();
      const importedPlan: BusinessPlanData = {
        ...defaultData,
        ...planData,
        name: planData.name,
        id: generateUUID(),
        createdAt: getCurrentISOTimestamp(),
        updatedAt: getCurrentISOTimestamp(),
        meta: {
          version: 1,
          exportCount: 0,
          lastUpdated: getCurrentISOTimestamp(),
          ...(planData.meta || {})
        }
      };
      
      // Save the imported plan
      return this.createItem(importedPlan);
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'IMPORT_ERROR',
          message: 'Failed to import business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Duplicate an existing business plan
   */
  async duplicateBusinessPlan(id: string, newName?: string): Promise<ServiceResult<BusinessPlanData>> {
    const result = await this.getItem(id);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || {
          code: 'NOT_FOUND',
          message: 'Business plan not found'
        }
      };
    }
    
    const originalPlan = result.data;
    
    // Create a new plan based on the original
    const duplicatedPlan: BusinessPlanData = {
      ...originalPlan,
      id: generateUUID(),
      name: newName || `${originalPlan.name} (Copy)`,
      createdAt: getCurrentISOTimestamp(),
      updatedAt: getCurrentISOTimestamp(),
      meta: {
        version: 1,
        exportCount: 0,
        lastUpdated: getCurrentISOTimestamp(),
        ...(originalPlan.meta || {})
      }
    };
    
    return this.createItem(duplicatedPlan);
  }
}
