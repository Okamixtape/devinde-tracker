/**
 * SectionService - Implementation of section data operations
 */
import { SectionService } from '../interfaces/serviceInterfaces';
import { ServiceResult, Section, BusinessPlanData } from '../interfaces/dataModels';
import { generateUUID, getCurrentTimestamp } from '../utils/helpers';
import { SECTIONS_CONFIG, SectionConfig } from '@/app/config/sections-config';
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
        const section = plan.sections.find((s: Section) => s.id === id);
        
        if (section) {
          return {
            success: true,
            data: {
              ...section,
              businessPlanId: plan.id || ''
            }
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
        const sectionsWithPlanId = plan.sections.map((section: Section) => ({
          ...section,
          businessPlanId: plan.id || ''
        }));
        
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
  getSectionByKey(key: string): SectionConfig | undefined {
    return SECTIONS_CONFIG.find(section => section.key === key);
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
    const existingKeys = existingSections.map((s: Section) => s.key);
    
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
        data: {}
      } as Section;
    });
    
    // Combiner les sections existantes et nouvelles
    return [...existingSections, ...newSections];
  }

  /**
   * Get an icon component for a section key
   */
  getIconForSection(sectionKey: string): string {
    const section = this.getSectionByKey(sectionKey);
    return section ? section.icon : 'grid'; // Icône par défaut
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
      const sectionsWithPlanId = plan.sections.map((section: Section) => ({
        ...section,
        businessPlanId
      }));
      
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
        icon: section.icon || 'file',
        color: section.color || '#4285F4',
        completion: section.completion || 0,
        route: section.route || `/section/${section.key || `section-${Date.now()}`}`,
        data: section.data || {},
        updatedAt: new Date(getCurrentTimestamp()).toISOString()
      };
      
      // Update the business plan with the new section
      const currentSections = plan.sections || [];
      const updatedSections = [...currentSections, newSection];
      
      const updateResult = await this.businessPlanService.updateItem(section.businessPlanId, {
        sections: updatedSections
      } as Partial<BusinessPlanData>);
      
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
      const updatedSections = plan.sections.map((s: Section) => {
        if (s.id === id) {
          return {
            ...s,
            ...sectionUpdate,
            updatedAt: new Date(getCurrentTimestamp()).toISOString()
          };
        }
        return s;
      });
      
      // Update the business plan with the updated sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: updatedSections
      } as Partial<BusinessPlanData>);
      
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error
        };
      }
      
      // Get the updated section
      const updatedSection = updatedSections.find((s: Section) => s.id === id);
      
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
        }
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
      const updatedSections = plan.sections.filter((s: Section) => s.id !== id);
      
      // Update the business plan with the filtered sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: updatedSections
      } as Partial<BusinessPlanData>);
      
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
      const reorderedSections = sectionIds.map((id) => {
        return plan.sections!.find((s) => s.id === id)!;
      });
      
      // Add any sections that weren't in the reorder list
      const unorderedSections = plan.sections.filter((s) => !sectionIds.includes(s.id));
      reorderedSections.push(...unorderedSections);
      
      // Update the business plan with the reordered sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: reorderedSections
      } as Partial<BusinessPlanData>);
      
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
      }));
      
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
