/**
 * BusinessPlanService - Implementation of business plan data operations
 * 
 * @version 2.0 - Updated to use standardized interfaces
 */
import { 
  BusinessPlanService, 
  BusinessPlan
} from "../interfaces/serviceInterfaces";
import { 
  BusinessPlanData, 
  ServiceResult,
  UserSettingsData,
  PitchData,
  ServicesData,
  BusinessModelData,
  MarketAnalysisData,
  FinancialsData,
  ActionPlanData,
  BusinessPlanMetaData,
  Section
} from "../interfaces/dataModels";

// Import standardized interfaces
import { 
  MilestoneWithDetails,
  TaskWithDetails,
  ActionPlanStatistics,
  TimelineItem
} from "../../interfaces/ActionPlanInterfaces";
import {
  BusinessModelCanvasData,
  PricingModel,
  RevenueProjections
} from "../../interfaces/BusinessModelInterfaces";
import {
  CustomerSegment,
  Competitor,
  MarketOpportunity,
  MarketTrend,
  SwotAnalysis
} from "../../interfaces/MarketAnalysisInterfaces";

// Import adapters for data transformation
import ActionPlanAdapter from "../../adapters/ActionPlanAdapter";
import BusinessModelAdapter from "../../adapters/BusinessModelAdapter";
import MarketAnalysisAdapter from "../../adapters/MarketAnalysisAdapter";
import { generateUUID, getCurrentISOTimestamp } from "../utils/helpers";
import { secureLocalStorage } from "../utils/security";
import { LocalStorageService } from './localStorageService';

/**
 * Storage key for business plans
 */
export const BUSINESS_PLANS_STORAGE_KEY = 'devinde-tracker-business-plans';

/**
 * Version de la structure de données - permet de gérer les migrations
 * Note: Cette clé utilise le stockage non-chiffré car elle ne contient pas de données sensibles
 */
export const CURRENT_DATA_VERSION = 1.1; // Convertir en nombre pour correspondre au type BusinessPlanMetaData.version
export const DATA_VERSION_STORAGE_KEY = 'devinde-tracker-data-version';

/**
 * Function to convert from BusinessPlanData to BusinessPlan
 * Enhanced with standardized interfaces and adapters
 */
function convertToBusinessPlan(data: BusinessPlanData): BusinessPlan {
  // Use the adapters to transform standardized data
  const uiActionPlan = data.actionPlan ? ActionPlanAdapter.toUI(data) : null;
  const uiBusinessModel = data.businessModel ? BusinessModelAdapter.toUI(data) : null;
  const uiMarketAnalysis = data.marketAnalysis ? MarketAnalysisAdapter.toUI(data) : null;

  return {
    id: data.id || generateUUID(),
    name: data.name,
    userId: data.userId || 'default-user',
    // Convert sections from DataModels.Section to ServiceInterfaces.Section
    sections: (data.sections || []).map(section => ({
      id: section.id,
      businessPlanId: section.businessPlanId,
      key: section.key,
      title: section.title,
      completion: section.completion,
      order: section.order,
      data: section.data,
      createdAt: section.updatedAt, // Use updatedAt as fallback for createdAt
      updatedAt: section.updatedAt
    })),
    createdAt: data.createdAt || getCurrentISOTimestamp(),
    updatedAt: data.updatedAt || getCurrentISOTimestamp(),
    // Include other properties by type conversion
    description: data.description,
    // Explicit conversion with appropriate typing
    pitch: data.pitch as PitchData,
    services: data.services as ServicesData,
    businessModel: data.businessModel as BusinessModelData,
    marketAnalysis: data.marketAnalysis as MarketAnalysisData,
    financials: data.financials as FinancialsData,
    actionPlan: data.actionPlan as ActionPlanData,
    meta: data.meta as BusinessPlanMetaData,
    settings: data.settings as UserSettingsData,
    // Include standardized data for UI components
    standardized: {
      actionPlan: uiActionPlan,
      businessModel: uiBusinessModel?.canvas,
      pricingModel: uiBusinessModel?.pricing,
      marketAnalysis: uiMarketAnalysis
    }
  };
}

/**
 * Function to convert from BusinessPlan to BusinessPlanData
 * Enhanced with standardized interfaces and adapters
 */
function convertToBusinessPlanData(plan: BusinessPlan): BusinessPlanData {
  // Get default values to ensure all required properties are present
  const defaultData = getDefaultBusinessPlanData();
  
  // Prepare the base structure
  const baseData: BusinessPlanData = {
    id: plan.id,
    name: plan.name,
    userId: plan.userId,
    // Convert sections from ServiceInterfaces.Section to DataModels.Section
    sections: (plan.sections || []).map(section => ({
      id: section.id || '',
      businessPlanId: section.businessPlanId || '',
      key: section.key || '',
      title: section.title || '',
      // Provide default values for properties that only exist in DataModels.Section
      icon: 'default-icon',
      color: '#333333',
      route: `/sections/${section.key || 'unknown'}`,
      completion: typeof section.completion === 'number' ? section.completion : 0,
      order: typeof section.order === 'number' ? section.order : 0,
      data: section.data || {},
      updatedAt: section.updatedAt || getCurrentISOTimestamp()
    })) as Section[],
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt || getCurrentISOTimestamp(),
    description: plan.description as string,
    // Use the plan properties or default values
    // Explicit conversion with appropriate typing
    pitch: (plan.pitch as PitchData) || defaultData.pitch,
    services: (plan.services as ServicesData) || defaultData.services,
    businessModel: (plan.businessModel as BusinessModelData) || defaultData.businessModel,
    marketAnalysis: (plan.marketAnalysis as MarketAnalysisData) || defaultData.marketAnalysis,
    financials: (plan.financials as FinancialsData) || defaultData.financials,
    actionPlan: (plan.actionPlan as ActionPlanData) || defaultData.actionPlan,
    meta: (plan.meta as BusinessPlanMetaData) || defaultData.meta,
    settings: (plan.settings as UserSettingsData) || defaultData.settings
  };
  
  // Apply standardized data if available
  if (plan.standardized) {
    // Convert UI action plan to service format
    if (plan.standardized.actionPlan) {
      const actionPlanUpdates = ActionPlanAdapter.toService(plan.standardized.actionPlan);
      baseData.actionPlan = {
        ...baseData.actionPlan,
        ...actionPlanUpdates.actionPlan
      };
    }
    
    // Convert UI business model to service format
    if (plan.standardized.businessModel && plan.standardized.pricingModel) {
      const businessModelUpdates = BusinessModelAdapter.toService({
        canvas: plan.standardized.businessModel,
        pricing: plan.standardized.pricingModel
      });
      baseData.businessModel = {
        ...baseData.businessModel,
        ...businessModelUpdates.businessModel
      };
    }
    
    // Convert UI market analysis to service format
    if (plan.standardized.marketAnalysis) {
      const marketAnalysisUpdates = MarketAnalysisAdapter.toService(plan.standardized.marketAnalysis);
      baseData.marketAnalysis = {
        ...baseData.marketAnalysis,
        ...marketAnalysisUpdates.marketAnalysis
      };
    }
  }
  
  return baseData;
}

/**
 * Default empty data for a new business plan
 * Also creates default values for the standardized interfaces
 */
function getDefaultBusinessPlanData(): Omit<BusinessPlanData, 'name'> {
  const timestamp = getCurrentISOTimestamp();
  
  // Default data object following the old interface model
  const defaultData = {
    id: generateUUID(),
    userId: 'default-user',
    createdAt: timestamp,
    updatedAt: timestamp,
    description: '',
    // Following the exact structure of PitchData
    pitch: {
      title: '',
      summary: '',
      vision: '',
      values: [],
      problem: '',
      solution: '',
      uniqueValueProposition: '',
      targetAudience: '',
      competitiveAdvantage: ''
    },
    // Following the exact structure of ServicesData
    services: {
      offerings: [],
      technologies: [],
      process: []
    },
    // Following the exact structure of BusinessModelData
    businessModel: {
      hourlyRates: [],
      packages: [],
      subscriptions: []
    },
    // Following the exact structure of MarketAnalysisData
    marketAnalysis: {
      competitors: [],
      targetClients: [],
      trends: []
    },
    // Following the exact structure of FinancialsData
    financials: {
      initialInvestment: 0,
      quarterlyGoals: [],
      expenses: [],
      projects: []
    },
    // Following the exact structure of ActionPlanData
    actionPlan: {
      milestones: [],
      tasks: []
    },
    meta: {
      version: CURRENT_DATA_VERSION,
      lastUpdated: timestamp,
      exportCount: 0
    },
    settings: {
      theme: 'light',
      language: 'fr',
      notifications: true
    },
    sections: []
  };
  
  // Create default standardized data using the adapters
  // This ensures we have a proper standardized data structure from the start
  const uiActionPlan = ActionPlanAdapter.toUI(defaultData);
  const uiBusinessModel = BusinessModelAdapter.toUI(defaultData);
  const uiMarketAnalysis = MarketAnalysisAdapter.toUI(defaultData);
  
  // Add standardized data to the default business plan
  // (This won't affect the returned object, it's just for reference)
  const withStandardized = {
    ...defaultData,
    standardized: {
      actionPlan: uiActionPlan,
      businessModel: uiBusinessModel.canvas,
      pricingModel: uiBusinessModel.pricing,
      marketAnalysis: uiMarketAnalysis
    }
  };
  
  return defaultData;
}

/**
 * BusinessPlanServiceImpl - Concrete implementation using localStorage
 */
/**
 * BusinessPlanServiceImpl - Implémentation complète du service de gestion des business plans
 * Cette classe implémente l'interface BusinessPlanService et utilise LocalStorageService
 * pour les opérations CRUD sous-jacentes
 */
export class BusinessPlanServiceImpl implements BusinessPlanService {
  private storageService: LocalStorageService<BusinessPlanData>;
  private storageKey = BUSINESS_PLANS_STORAGE_KEY;
  
  constructor() {
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
  /**
   * Exécute les migrations de données nécessaires entre les versions
   */
  private async runDataMigrations(): Promise<void> {
    // Récupérer la version actuelle stockée (ou null si première utilisation)
    const storedVersion = localStorage.getItem(DATA_VERSION_STORAGE_KEY);
    
    if (!storedVersion || this.compareVersions(storedVersion, CURRENT_DATA_VERSION.toString()) < 0) {
      // Migration requise
      console.log(`Migration des données de la version ${storedVersion || 'aucune'} à ${CURRENT_DATA_VERSION}`);
      
      try {
        // Récupérer tous les business plans
        const result = await this.getItems();
        
        if (result.success && result.data && result.data.length > 0) {
          // Pour chaque plan, appliquer les migrations nécessaires
          for (const plan of result.data) {
            // Effectuer les migrations nécessaires selon la version du plan
            const planVersion = (plan.meta as BusinessPlanMetaData)?.version?.toString() || '1.0.0';
            
            // Si le plan est à une version antérieure, le mettre à jour
            if (this.compareVersions(planVersion, CURRENT_DATA_VERSION.toString()) < 0) {
              // Appliquons les migrations spécifiques ici...
              
              // Par exemple, pour la migration de 1.0.0 à 1.1.0
              if (this.compareVersions(planVersion, '1.1.0') < 0) {
                // Mettre à jour avec de nouveaux champs, etc.
                await this.updateItem(plan.id || '', {
                  meta: {
                    version: CURRENT_DATA_VERSION,
                    lastUpdated: getCurrentISOTimestamp(),
                    exportCount: (plan.meta as BusinessPlanMetaData)?.exportCount || 0
                  }
                });
              }
            }
          }
        }
        
        // Mettre à jour la version stockée
        localStorage.setItem(DATA_VERSION_STORAGE_KEY, CURRENT_DATA_VERSION.toString());
        
      } catch (error) {
        console.error('Erreur lors de la migration des données:', error);
      }
    }
  }

  /**
   * Compare deux versions sémantiques
   * @returns -1 si v1 < v2, 0 si v1 = v2, 1 si v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = i < parts1.length ? parts1[i] : 0;
      const p2 = i < parts2.length ? parts2[i] : 0;
      
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    
    return 0; // Versions égales
  }

  /**
   * Reset storage if it contains corrupted data
   */
  /**
   * Réinitialise le stockage s'il contient des données corrompues
   */
  private resetStorageIfCorrupted(): void {
    try {
      // Tenter de récupérer et parser les données
      secureLocalStorage.getItem(this.storageKey);
    } catch (e) {
      console.error("Données corrompues détectées, réinitialisation du stockage", e);
      secureLocalStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Create a new business plan with validation
   */
  async createItem(item: BusinessPlan): Promise<ServiceResult<BusinessPlan>> {
    try {
      // Validation des champs requis
      if (!item.name || item.name.trim() === '') {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le nom du business plan est requis'
          }
        };
      }
      
      // Convertir en BusinessPlanData pour le stockage
      const businessPlanData = convertToBusinessPlanData(item);
      
      // Assurer l'unicité de l'ID
      if (!businessPlanData.id) {
        businessPlanData.id = generateUUID();
      }
      
      // Mettre à jour les timestamps
      businessPlanData.createdAt = businessPlanData.createdAt || getCurrentISOTimestamp();
      businessPlanData.updatedAt = getCurrentISOTimestamp();
      
      // S'assurer que les sections respectent le modèle de données
      if (businessPlanData.sections && businessPlanData.sections.length > 0) {
        businessPlanData.sections = businessPlanData.sections.map(section => ({
          ...section,
          businessPlanId: businessPlanData.id || '',
          updatedAt: getCurrentISOTimestamp()
        }));
      }
      
      // Utiliser le service de base pour créer l'élément
      const result = await this.storageService.createItem(businessPlanData);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Convertir vers BusinessPlan pour le retour
      return {
        success: true,
        data: convertToBusinessPlan(result.data)
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'BUSINESS_PLAN_CREATE_ERROR',
          message: 'Error creating business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Update a business plan with proper metadata updates
   */
  async updateItem(id: string, item: Partial<BusinessPlan>): Promise<ServiceResult<BusinessPlan>> {
    try {
      // D'abord, récupérer l'élément existant
      const currentItemResult = await this.storageService.getItem(id);
      
      if (!currentItemResult.success || !currentItemResult.data) {
        return {
          success: false,
          error: currentItemResult.error || {
            code: 'NOT_FOUND',
            message: `Business plan with ID ${id} not found`
          }
        };
      }
      
      const currentItem = currentItemResult.data;
      
      // Préparer les données de section si elles existent dans l'item à mettre à jour
      let sectionsToUpdate: Section[] | undefined;
      
      if (item.sections && Array.isArray(item.sections)) {
        // Convertir les sections fournies en Section[] conforme
        sectionsToUpdate = item.sections.map((sectionData: Record<string, unknown>) => {
          const sectionId = typeof sectionData.id === 'string' ? sectionData.id : generateUUID();
          const sectionBusinessPlanId = typeof sectionData.businessPlanId === 'string' ? sectionData.businessPlanId : id;
          const sectionKey = typeof sectionData.key === 'string' ? sectionData.key : '';
          const sectionTitle = typeof sectionData.title === 'string' ? sectionData.title : '';
          const sectionData2 = typeof sectionData.data === 'object' && sectionData.data ? sectionData.data as Record<string, unknown> : {};
          const sectionCompletion = typeof sectionData.completion === 'number' ? sectionData.completion : 0;
          const sectionOrder = typeof sectionData.order === 'number' ? sectionData.order : 0;
          
          const section: Section = {
            id: sectionId,
            businessPlanId: sectionBusinessPlanId,
            key: sectionKey,
            title: sectionTitle,
            icon: 'default-icon',
            color: '#333333',
            route: `/sections/${sectionKey || 'unknown'}`,
            completion: sectionCompletion,
            order: sectionOrder,
            data: sectionData2,
            updatedAt: getCurrentISOTimestamp()
          };
          
          return section;
        });
      }
      
      // Créer l'objet de mise à jour en excluant explicitement les sections
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sections, ...restOfItem } = item;
      
      // Construire l'objet final de mise à jour
      const metaUpdate: BusinessPlanMetaData = {
        version: ((currentItem.meta?.version as number) || 1) + 0.1,
        lastUpdated: getCurrentISOTimestamp(),
        exportCount: (currentItem.meta?.exportCount as number) || 0
      };
      
      // Créer l'objet partiel correctement typé
      const updatedItem: Partial<BusinessPlanData> = {
        ...restOfItem,
        updatedAt: getCurrentISOTimestamp(),
        meta: metaUpdate
      };
      
      // Ajouter les sections si elles existent
      if (sectionsToUpdate) {
        updatedItem.sections = sectionsToUpdate;
      }
      
      // Utiliser le service de base pour mettre à jour l'élément
      const result = await this.storageService.updateItem(id, updatedItem);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Convertir vers BusinessPlan pour le retour
      return {
        success: true,
        data: convertToBusinessPlan(result.data)
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'BUSINESS_PLAN_UPDATE_ERROR',
          message: 'Error updating business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get all business plans for a specific user
   */
  /**
   * Récupère tous les business plans pour un utilisateur spécifique
   */
  async getUserBusinessPlans(userId: string): Promise<ServiceResult<BusinessPlan[]>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Filtrer les plans par ID utilisateur
      const userPlans = result.data.filter(plan => plan.userId === userId);
      
      return {
        success: true,
        data: userPlans
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'USER_PLANS_FETCH_ERROR',
          message: `Impossible de récupérer les business plans pour l'utilisateur ${userId}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get all business plans
   */
  async getItems(): Promise<ServiceResult<BusinessPlan[]>> {
    try {
      // Utiliser la méthode de base pour récupérer les données
      const result = await this.storageService.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Convertir chaque BusinessPlanData en BusinessPlan
      const businessPlans = result.data.map(plan => convertToBusinessPlan(plan));
      
      return {
        success: true,
        data: businessPlans
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'BUSINESS_PLANS_FETCH_ERROR',
          message: 'Failed to fetch business plans',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get a business plan by ID with proper error handling
   */
  async getItem(id: string): Promise<ServiceResult<BusinessPlan>> {
    try {
      // Utiliser la méthode de base pour récupérer les données
      const result = await this.storageService.getItem(id);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || {
            code: 'NOT_FOUND',
            message: `Business plan with ID ${id} not found`
          }
        };
      }
      
      // Convertir les données en BusinessPlan
      return {
        success: true,
        data: convertToBusinessPlan(result.data)
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: e instanceof Error ? e.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Export a business plan to a specified format
   * Enhanced to include standardized interfaces
   */
  async exportBusinessPlan(id: string, format: string = 'json', includeStandardized: boolean = true): Promise<ServiceResult<{
    content: string;
    filename: string;
    contentType: string;
  }>> {
    try {
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
            version: (plan.meta as BusinessPlanMetaData).version || CURRENT_DATA_VERSION,
            lastUpdated: (plan.meta as BusinessPlanMetaData).lastUpdated || getCurrentISOTimestamp(),
            exportCount: (((plan.meta as BusinessPlanMetaData).exportCount) || 0) + 1
          }
        });
      }
      
      // Prepare the export object - may filter out standardized data if not requested
      const exportObject = includeStandardized 
        ? plan 
        : { ...plan, standardized: undefined };
      
      if (format === 'json') {
        return {
          success: true,
          data: {
            content: JSON.stringify(exportObject, null, 2),
            filename: `${plan.name.replace(/\s+/g, '-').toLowerCase()}-export.json`,
            contentType: 'application/json'
          }
        };
      } else if (format === 'pdf') {
        // Implementation to come
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: 'PDF export is not implemented yet'
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: `Format ${format} is not supported`
          }
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: 'Error exporting business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Import a business plan from JSON data
   * Enhanced to handle standardized interfaces
   */
  async importBusinessPlan(data: Record<string, unknown>): Promise<ServiceResult<BusinessPlan>> {
    try {
      // Basic validation
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          error: {
            code: 'INVALID_IMPORT_DATA',
            message: 'Invalid import data format'
          }
        };
      }
      
      // Convert data to BusinessPlanData
      let planData: Partial<BusinessPlanData> = data as Partial<BusinessPlanData>;
      
      // Check required fields
      if (!planData.name) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Imported business plan must have a name'
          }
        };
      }
      
      // Get default values
      const defaults = getDefaultBusinessPlanData();
      
      // Always generate a new ID to avoid duplicates
      const importedPlan: BusinessPlanData = {
        id: generateUUID(),
        name: planData.name,
        userId: planData.userId || 'default-user',
        sections: Array.isArray(planData.sections) ? planData.sections.map(section => {
          // Ensure each section is valid
          return {
            id: section.id || generateUUID(),
            businessPlanId: section.businessPlanId || '', // will be updated later
            key: section.key || '',
            title: section.title || '',
            icon: section.icon || 'default-icon',
            color: section.color || '#333333',
            route: section.route || '',
            completion: section.completion || 0,
            order: section.order || 0,
            data: section.data || {},
            updatedAt: section.updatedAt || getCurrentISOTimestamp()
          };
        }) : [],
        description: typeof planData.description === 'string' ? planData.description : '',
        createdAt: getCurrentISOTimestamp(),
        updatedAt: getCurrentISOTimestamp(),
        // Use imported values or defaults for required fields
        pitch: planData.pitch ? { ...defaults.pitch, ...planData.pitch } : defaults.pitch,
        services: planData.services ? { ...defaults.services, ...planData.services } : defaults.services,
        businessModel: planData.businessModel ? { ...defaults.businessModel, ...planData.businessModel } : defaults.businessModel,
        marketAnalysis: planData.marketAnalysis ? { ...defaults.marketAnalysis, ...planData.marketAnalysis } : defaults.marketAnalysis,
        financials: planData.financials ? { ...defaults.financials, ...planData.financials } : defaults.financials,
        actionPlan: planData.actionPlan ? { ...defaults.actionPlan, ...planData.actionPlan } : defaults.actionPlan,
        meta: {
          version: CURRENT_DATA_VERSION,
          lastUpdated: getCurrentISOTimestamp(),
          exportCount: 0
        },
        settings: planData.settings ? { ...defaults.settings, ...planData.settings } : defaults.settings
      };
      
      // Handle standardized data if present in the import
      if (data.standardized && typeof data.standardized === 'object') {
        const standardizedData = data.standardized as Record<string, unknown>;
        
        // Process action plan data if present
        if (standardizedData.actionPlan) {
          const actionPlanUpdates = ActionPlanAdapter.toService(standardizedData.actionPlan as any);
          importedPlan.actionPlan = {
            ...importedPlan.actionPlan,
            ...actionPlanUpdates.actionPlan
          };
        }
        
        // Process business model data if present
        if (standardizedData.businessModel && standardizedData.pricingModel) {
          const businessModelUpdates = BusinessModelAdapter.toService({
            canvas: standardizedData.businessModel as any,
            pricing: standardizedData.pricingModel as any
          });
          importedPlan.businessModel = {
            ...importedPlan.businessModel,
            ...businessModelUpdates.businessModel
          };
        }
        
        // Process market analysis data if present
        if (standardizedData.marketAnalysis) {
          const marketAnalysisUpdates = MarketAnalysisAdapter.toService(standardizedData.marketAnalysis as any);
          importedPlan.marketAnalysis = {
            ...importedPlan.marketAnalysis,
            ...marketAnalysisUpdates.marketAnalysis
          };
        }
      }
      
      // Create the imported business plan
      const result = await this.storageService.createItem(importedPlan);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Convert and return the result
      return {
        success: true,
        data: convertToBusinessPlan(result.data)
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'IMPORT_ERROR',
          message: 'Error importing business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Duplicate a business plan
   * Enhanced to include standardized interfaces in the duplication
   */
  async duplicateBusinessPlan(id: string, newName?: string): Promise<ServiceResult<BusinessPlan>> {
    try {
      // Get the original business plan
      const result = await this.getItem(id);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || {
            code: 'NOT_FOUND',
            message: `Business plan with ID ${id} not found`
          }
        };
      }
      
      const originalPlan = result.data;
      
      // Create a copy with a new ID
      // Get default values
      const defaults = getDefaultBusinessPlanData();
      const newId = generateUUID();
      
      // Create the duplicate with a new ID
      const duplicatedPlan: BusinessPlanData = {
        id: newId,
        name: newName || `Copie de ${originalPlan.name}`,
        userId: originalPlan.userId,
        // Duplicate sections with the new businessPlanId
        sections: Array.isArray(originalPlan.sections) ? originalPlan.sections.map(section => ({
          id: generateUUID(), // New section = new ID
          businessPlanId: newId, // Associate with the new business plan
          key: typeof section.key === 'string' ? section.key : '',
          title: typeof section.title === 'string' ? section.title : '',
          icon: 'default-icon', // Default value
          color: '#333333', // Default value
          route: `/sections/${typeof section.key === 'string' ? section.key : 'unknown'}`, // Default value
          completion: typeof section.completion === 'number' ? section.completion : 0,
          order: typeof section.order === 'number' ? section.order : 0,
          data: section.data || {},
          updatedAt: getCurrentISOTimestamp()
        })) as Section[] : [],
        description: typeof originalPlan.description === 'string' ? originalPlan.description : '',
        createdAt: getCurrentISOTimestamp(),
        updatedAt: getCurrentISOTimestamp(),
        meta: {
          version: CURRENT_DATA_VERSION,
          lastUpdated: getCurrentISOTimestamp(),
          exportCount: 0
        },
        // Use the original plan properties or default values
        pitch: originalPlan.pitch ? { ...defaults.pitch, ...(originalPlan.pitch as PitchData) } : defaults.pitch,
        services: originalPlan.services ? { ...defaults.services, ...(originalPlan.services as ServicesData) } : defaults.services,
        businessModel: originalPlan.businessModel ? { ...defaults.businessModel, ...(originalPlan.businessModel as BusinessModelData) } : defaults.businessModel,
        marketAnalysis: originalPlan.marketAnalysis ? { ...defaults.marketAnalysis, ...(originalPlan.marketAnalysis as MarketAnalysisData) } : defaults.marketAnalysis,
        financials: originalPlan.financials ? { ...defaults.financials, ...(originalPlan.financials as FinancialsData) } : defaults.financials,
        actionPlan: originalPlan.actionPlan ? { ...defaults.actionPlan, ...(originalPlan.actionPlan as ActionPlanData) } : defaults.actionPlan,
        settings: originalPlan.settings ? { ...defaults.settings, ...(originalPlan.settings as UserSettingsData) } : defaults.settings
      };
      
      // Create the business plan object with standardized interfaces
      const businessPlanObject = convertToBusinessPlan(duplicatedPlan);
      
      // Copy standardized data from the original plan if it exists
      if (originalPlan.standardized) {
        businessPlanObject.standardized = {
          ...businessPlanObject.standardized,
          actionPlan: originalPlan.standardized.actionPlan,
          businessModel: originalPlan.standardized.businessModel,
          pricingModel: originalPlan.standardized.pricingModel,
          marketAnalysis: originalPlan.standardized.marketAnalysis
        };
      }
      
      // Create the duplicate plan
      return this.createItem(businessPlanObject);
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'DUPLICATION_ERROR',
          message: 'Error duplicating business plan',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }
  
  /**
   * Supprimer un business plan par son ID
   */
  async deleteItem(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Vérifier si le business plan existe
      const existingItem = await this.getItem(id);
      if (!existingItem.success) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Business plan avec l'ID ${id} introuvable`
          }
        };
      }
      
      // Utiliser le service de stockage pour supprimer l'élément
      const result = await this.storageService.deleteItem(id);
      
      return result;
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: `Erreur lors de la suppression du business plan ${id}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }
}
