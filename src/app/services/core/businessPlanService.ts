/**
 * BusinessPlanService - Implementation of business plan data operations
 */
import { BusinessPlanService } from "../services/interfaces/serviceInterfaces";
import { 
  BusinessPlanData, 
  ServiceResult,
  Section
} from "../services/interfaces/dataModels";
import { generateUUID, getCurrentISOTimestamp, validateObject } from '../utils/helpers';
import { secureLocalStorage } from '../utils/security';
import { LocalStorageService } from './localStorageService';

/**
 * Storage key for business plans
 */
export const BUSINESS_PLANS_STORAGE_KEY = 'devinde-tracker-business-plans';

/**
 * Version de la structure de données - permet de gérer les migrations
 * Note: Cette clé utilise le stockage non-chiffré car elle ne contient pas de données sensibles
 */
export const CURRENT_DATA_VERSION = '1.1.0';
export const DATA_VERSION_KEY = 'devinde-tracker-data-version-plain';

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
  
  private storageService: LocalStorageService<BusinessPlanData>;
  
  constructor() {
    super(BUSINESS_PLANS_STORAGE_KEY);
    this.storageService = new LocalStorageService<BusinessPlanData>(BUSINESS_PLANS_STORAGE_KEY);
    // Reset corrupted storage on init
    this.resetStorageIfCorrupted();
    // Exécuter les migrations si nécessaire au démarrage
    this.runDataMigrations();
  }
  
  /**
   * Exécute les migrations de données nécessaires
   * Une approche robuste et propre pour gérer les évolutions du modèle de données
   */
  private async runDataMigrations(): Promise<void> {
    // Ne s'exécute que côté client
    if (typeof window === 'undefined') {
      console.log('runDataMigrations appelé côté serveur - ignoré');
      return;
    }
    
    try {
      // Vérifier la version actuelle des données (stockage non-chiffré)
      const currentVersion = localStorage.getItem(DATA_VERSION_KEY) || '1.0.0';
      
      console.log(`Vérification de migration des données: version actuelle ${currentVersion}, version cible ${CURRENT_DATA_VERSION}`);
      
      // Si déjà à jour, ne rien faire
      if (currentVersion === CURRENT_DATA_VERSION) {
        console.log('Données déjà à jour, aucune migration nécessaire');
        return;
      }
      
      console.log(`Migration des données: ${currentVersion} -> ${CURRENT_DATA_VERSION}`);
      
      // Obtenir tous les plans d'affaires
      const result = await this.getItems();
      if (!result.success || !result.data) return;
      
      const plans = result.data;
      let modified = false;
      
      // Appliquer les migrations nécessaires selon la version
      if (this.compareVersions(currentVersion, '1.1.0') < 0) {
        // Migration: Corriger les routes incohérentes
        console.log('Migration: Standardisation des routes');
        plans.forEach((plan: BusinessPlanData) => {
          if (plan.sections && Array.isArray(plan.sections)) {
            plan.sections.forEach((section: Section) => {
              // Correction des routes
              if (section.route === '/financials') {
                section.route = '/finances';
                modified = true;
                console.log(`Plan ${plan.id}: Route corrigée: /financials -> /finances`);
              } else if (section.route === '/market') {
                section.route = '/market-analysis';
                // Corriger aussi la clé si nécessaire
                if (section.key === 'market') {
                  section.key = 'market-analysis';
                }
                modified = true;
                console.log(`Plan ${plan.id}: Route corrigée: /market -> /market-analysis`);
              }
            });
          }
        });
      }
      
      // Sauvegarder les données migrées si des modifications ont été effectuées
      if (modified) {
        // Utiliser secureLocalStorage directement pour cette opération
        try {
          secureLocalStorage.setItem(BUSINESS_PLANS_STORAGE_KEY, plans);
          console.log('Migration des données terminée avec succès');
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des données migrées:', error);
        }
      }
      
      // Mettre à jour la version des données (stockage non-chiffré)
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      console.log(`Version des données mise à jour vers ${CURRENT_DATA_VERSION}`);
      
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error);
    }
  }
  
  /**
   * Compare deux versions sémantiques
   * @returns -1 si v1 < v2, 0 si v1 = v2, 1 si v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
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
