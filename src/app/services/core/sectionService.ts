/**
 * SectionService - Implementation of section data operations
 */
import { SectionService } from '../interfaces/serviceInterfaces';
import { ServiceResult, Section } from '../interfaces/dataModels';
import { generateUUID, getCurrentTimestamp } from '../utils/helpers';
import { SECTIONS_CONFIG } from '../../config/sections-config';
import { BusinessPlanServiceImpl } from './businessPlanService';

/**
 * SectionServiceImpl - Concrete implementation for section operations
 * Note: This is slightly different as sections are stored within business plans
 * and not as separate entities in localStorage
 */
export class SectionServiceImpl implements SectionService {
  private businessPlanService: BusinessPlanServiceImpl;
  
  constructor() {
    this.businessPlanService = new BusinessPlanServiceImpl();
  }

  /**
   * Get a section by ID
   */
  async getItem(id: string): Promise<ServiceResult<Section>> {
    try {
      // Get all business plans since we need to search across all of them
      const plansResult = await this.businessPlanService.getItems();
      
      if (!plansResult.success || !plansResult.data) {
        return {
          success: false,
          error: plansResult.error
        };
      }
      
      // Search through all plans for the section
      for (const plan of plansResult.data) {
        if (!plan.sections) continue;
        
        // Find the section with matching ID
        const section = plan.sections.find(s => s.id === id);
        
        if (section) {
          return {
            success: true,
            data: {
              ...section,
              id: section.id || '',
              key: section.key || '',
              title: section.title || '',
              icon: section.icon || 'file',
              color: section.color || '#4285F4',
              route: section.route || '',
              completion: section.completion || 0,
              order: section.order || 0, 
              businessPlanId: plan.id || '',
              data: section.data || {},
              updatedAt: section.updatedAt || new Date().toISOString()
            } as Section
          };
        }
      }
      
      // Section not found
      return {
        success: false,
        error: {
          code: 'SECTION_NOT_FOUND',
          message: `Section with ID ${id} not found`
        }
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTION_GET_ERROR',
          message: `Error retrieving section with ID ${id}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get all sections (not typically used, as sections are fetched by business plan)
   */
  async getItems(): Promise<ServiceResult<Section[]>> {
    try {
      // Get all business plans
      const plansResult = await this.businessPlanService.getItems();
      
      if (!plansResult.success || !plansResult.data) {
        return {
          success: false,
          error: plansResult.error
        };
      }
      
      // Collect all sections from all plans
      const allSections: Section[] = [];
      
      for (const plan of plansResult.data) {
        if (!plan.sections) continue;
        
        // Add business plan ID to each section
        const sectionsWithPlanId = plan.sections.map(section => {
          return {
            ...(section as unknown as object),
            businessPlanId: plan.id || ''
          } as Section;
        });
        
        allSections.push(...sectionsWithPlanId);
      }
      
      return {
        success: true,
        data: allSections
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTIONS_GET_ERROR',
          message: 'Error retrieving all sections',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Get section configuration by key
   */
  getSectionByKey(key: string): Section | null {
    const config = SECTIONS_CONFIG.find(section => section.key === key);
    if (!config) return null;
    
    // Create a Section instance from config
    return {
      id: `section-${config.key}`,
      businessPlanId: '', // Will be set when creating a real section
      key: config.key,
      title: config.title,
      icon: config.icon,
      color: config.color || '#4285F4',
      route: config.route || `/section/${config.key}`,
      completion: 0,
      order: config.order || 0,
      data: {},
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Get icon for a section
   */
  getIconForSection(sectionKey: string): string {
    const config = SECTIONS_CONFIG.find(section => section.key === sectionKey);
    return config?.icon || 'file';
  }

  /**
   * Get section display title
   */
  getSectionTitle(key: string): string {
    const section = this.getSectionByKey(key);
    return section ? section.title : key;
  }

  /**
   * Enrich existing sections with missing sections from SECTIONS_CONFIG
   */
  enrichSections(businessPlanId: string, existingSections: Section[]): Section[] {
    // Récupérer tous les identifiants de sections existantes
    const existingKeys = existingSections.map(s => s.key);
    
    // Filtrer les sections de configuration qui ne sont pas déjà présentes
    const missingSections = SECTIONS_CONFIG.filter(config => !existingKeys.includes(config.key));
    
    // Créer de nouvelles sections à partir des configurations manquantes
    const newSections = missingSections.map(config => {
      // Convertir les timestamps en strings pour correspondre à l'interface Section
      const now = new Date(getCurrentTimestamp()).toISOString();
      
      return {
        id: generateUUID(),
        key: config.key,
        title: config.title,
        icon: config.icon,
        color: config.color,
        route: config.route,
        businessPlanId,
        updatedAt: now,
        completion: 0,
        order: config.order || 0,
        data: {}
      } as Section;
    });
    
    // Combiner les sections existantes et nouvelles
    return [...existingSections, ...newSections];
  }

  /**
   * Get description for a section key
   */
  getDescriptionForSection(sectionKey: string): string {
    // La variable section n'est pas utilisée, mais pourrait l'être pour des métadonnées supplémentaires
    const descriptions: {[key: string]: string} = {
      'dashboard': 'Vue d\'ensemble de votre activité indépendante',
      'pitch': 'Présentez votre activité en quelques lignes',
      'services': 'Décrivez vos offres de services en détail',
      'business-model': 'Définissez votre modèle économique',
      'market-analysis': 'Analysez votre marché et vos concurrents',
      'finances': 'Gérez vos finances et prévisions',
      'action-plan': 'Planifiez vos actions et suivez leur progression',
      'revenue': 'Suivez vos revenus et fixez vos objectifs'
    };
    
    return descriptions[sectionKey] || 'Section de plan d\'affaires';
  }

  /**
   * Get all sections for a specific business plan
   */
  async getSections(businessPlanId: string): Promise<ServiceResult<Section[]>> {
    try {
      // Get the business plan
      const planResult = await this.businessPlanService.getItem(businessPlanId);
      
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error
        };
      }
      
      const plan = planResult.data;
      
      // Check if sections exist on the plan
      if (!plan.sections || !Array.isArray(plan.sections)) {
        return {
          success: true,
          data: []
        };
      }
      
      // Add business plan ID to each section
      const sectionsWithPlanId = plan.sections.map(section => {
        return {
          ...(section as unknown as object),
          businessPlanId: plan.id || ''
        } as Section;
      });
      
      return {
        success: true,
        data: sectionsWithPlanId
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTIONS_GET_ERROR',
          message: `Error retrieving sections for business plan ${businessPlanId}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Create a new section within a business plan
   */
  async createItem(section: Partial<Section>): Promise<ServiceResult<Section>> {
    try {
      if (!section.businessPlanId) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Business plan ID is required to create a section'
          }
        };
      }
      
      // Get the business plan
      const planResult = await this.businessPlanService.getItem(section.businessPlanId);
      
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error
        };
      }
      
      const plan = planResult.data;
      
      // Create a new section with required fields
      const newSection: Section = {
        id: generateUUID(),
        businessPlanId: section.businessPlanId,
        key: section.key || `section-${Date.now()}`,
        title: section.title || 'New Section',
        icon: section.icon || this.getIconForSection(section.key || ''),
        color: section.color || '#4285F4',
        completion: section.completion || 0,
        route: section.route || `/section/${section.key || `section-${Date.now()}`}`,
        order: section.order || 0,
        data: section.data || {},
        updatedAt: new Date().toISOString()
      };
      
      // Update the business plan with the new section
      const currentSections = plan.sections || [];
      const updatedSections = [...currentSections, newSection];
      
      const updateResult = await this.businessPlanService.updateItem(section.businessPlanId, {
        sections: updatedSections as unknown as Record<string, unknown>[]
      });
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }
      
      return {
        success: true,
        data: newSection
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTION_CREATE_ERROR',
          message: 'Error creating section',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Update a section
   */
  async updateItem(id: string, sectionUpdate: Partial<Section>): Promise<ServiceResult<Section>> {
    try {
      // First, get the section to find which business plan it belongs to
      const sectionResult = await this.getItem(id);
      
      if (!sectionResult.success || !sectionResult.data) {
        return sectionResult;
      }
      
      const section = sectionResult.data;
      const businessPlanId = section.businessPlanId;
      
      if (!businessPlanId) {
        return {
          success: false,
          error: {
            code: 'MISSING_BUSINESS_PLAN_ID',
            message: 'Section does not have a business plan ID'
          }
        };
      }
      
      // Get the business plan
      const planResult = await this.businessPlanService.getItem(businessPlanId);
      
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error
        };
      }
      
      const plan = planResult.data;
      
      if (!plan.sections) {
        return {
          success: false,
          error: {
            code: 'SECTIONS_NOT_FOUND',
            message: 'Business plan does not have any sections'
          }
        };
      }
      
      // Find and update the section
      const updatedSections = plan.sections.map(s => {
        if (s.id === id) {
          return {
            ...s,
            ...sectionUpdate,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      
      // Update the business plan with the updated sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: updatedSections as unknown as Record<string, unknown>[]
      });
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }
      
      // Get the updated section
      const updatedSection = updatedSections.find(s => s.id === id);
      
      if (!updatedSection) {
        return {
          success: false,
          error: {
            code: 'SECTION_NOT_FOUND',
            message: `Updated section with ID ${id} not found`
          }
        };
      }
      
      return {
        success: true,
        data: {
          ...updatedSection,
          businessPlanId
        } as Section
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTION_UPDATE_ERROR',
          message: `Error updating section with ID ${id}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Update the completion status of a section
   */
  async updateSectionCompletion(id: string, completion: number): Promise<ServiceResult<Section>> {
    try {
      // Validate completion value
      if (completion < 0 || completion > 100) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Completion value must be between 0 and 100'
          }
        };
      }
      
      // Use the updateItem method with just the completion field
      return this.updateItem(id, { completion });
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'UPDATE_COMPLETION_ERROR',
          message: `Failed to update section completion: ${e instanceof Error ? e.message : String(e)}`
        }
      };
    }
  }

  /**
   * Delete a section
   */
  async deleteItem(id: string): Promise<ServiceResult<boolean>> {
    try {
      // First, get the section to find which business plan it belongs to
      const sectionResult = await this.getItem(id);
      
      if (!sectionResult.success || !sectionResult.data) {
        return {
          success: false,
          error: sectionResult.error
        };
      }
      
      const section = sectionResult.data;
      const businessPlanId = section.businessPlanId;
      
      if (!businessPlanId) {
        return {
          success: false,
          error: {
            code: 'MISSING_BUSINESS_PLAN_ID',
            message: 'Section does not have a business plan ID'
          }
        };
      }
      
      // Get the business plan
      const planResult = await this.businessPlanService.getItem(businessPlanId);
      
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error
        };
      }
      
      const plan = planResult.data;
      
      if (!plan.sections || !Array.isArray(plan.sections)) {
        return {
          success: false,
          error: {
            code: 'SECTIONS_NOT_FOUND',
            message: 'Business plan does not have any sections'
          }
        };
      }
      
      // Filter out the section to delete
      const updatedSections = plan.sections.filter(s => s.id !== id);
      
      // Update the business plan with the filtered sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: updatedSections as unknown as Record<string, unknown>[]
      });
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTION_DELETE_ERROR',
          message: `Error deleting section with ID ${id}`,
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }

  /**
   * Create a new standard section from the sections config
   */
  async createStandardSection(businessPlanId: string, sectionKey: string): Promise<ServiceResult<Section>> {
    // Check if the section key exists in the config
    const sectionConfig = SECTIONS_CONFIG.find((s) => s.key === sectionKey);
    
    if (!sectionConfig) {
      return {
        success: false,
        error: {
          code: 'INVALID_SECTION_KEY',
          message: `Section key '${sectionKey}' not found in configuration`
        }
      };
    }
    
    // Create the section using the config
    return this.createItem({
      businessPlanId,
      key: sectionConfig.key,
      title: sectionConfig.title,
      icon: sectionConfig.icon,
      color: sectionConfig.color,
      route: sectionConfig.route,
      order: sectionConfig.order,
      data: {}
    });
  }

  /**
   * Reorder sections in a business plan
   */
  async reorderSections(businessPlanId: string, sectionIds: string[]): Promise<ServiceResult<Section[]>> {
    try {
      // Get the business plan
      const planResult = await this.businessPlanService.getItem(businessPlanId);
      
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: planResult.error
        };
      }
      
      const plan = planResult.data;
      
      if (!plan.sections || !Array.isArray(plan.sections)) {
        return {
          success: false,
          error: {
            code: 'SECTIONS_NOT_FOUND',
            message: 'Business plan does not have any sections'
          }
        };
      }
      
      // Validate that all sections exist in the business plan
      const existingSectionIds = plan.sections.map((s) => s.id);
      const missingIds = sectionIds.filter((id) => !existingSectionIds.includes(id));
      
      if (missingIds.length > 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_SECTION_IDS',
            message: `The following section IDs do not exist in the business plan: ${missingIds.join(', ')}`
          }
        };
      }
      
      // Create a new ordered array of sections
      const reorderedSections = sectionIds.map((id, index) => {
        const section = plan.sections!.find((s) => s.id === id)!;
        return {
          ...section,
          order: index
        };
      });
      
      // Add any sections that weren't in the reorder list
      const unorderedSections = plan.sections.filter((s) => !sectionIds.includes(s.id as string));
      
      // Ajouter l'ordre aux sections non ordonnées avant de les ajouter
      const startOrder = reorderedSections.length;
      const processedUnorderedSections = unorderedSections.map((s, index) => ({
        ...s,
        order: startOrder + index
      }));
      
      reorderedSections.push(...processedUnorderedSections);
      
      // Update the business plan with the reordered sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: reorderedSections as unknown as Record<string, unknown>[]
      });
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }
      
      // Add businessPlanId to each section in the result
      const sectionsWithPlanId = reorderedSections.map((section) => ({
        ...section,
        businessPlanId
      })) as Section[];
      
      return {
        success: true,
        data: sectionsWithPlanId
      };
    } catch (e) {
      return {
        success: false,
        error: {
          code: 'SECTION_REORDER_ERROR',
          message: 'Error reordering sections',
          details: e instanceof Error ? e.message : String(e)
        }
      };
    }
  }
}
