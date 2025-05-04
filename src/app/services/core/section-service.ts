/**
 * SectionService - Implementation of section data operations
 */
import { SectionService } from '../interfaces/service-interfaces';
import { ServiceResult, Section, BusinessPlanData } from '../interfaces/data-models';
import { BusinessPlanServiceImpl } from './business-plan-service';
import { generateUUID, getCurrentTimestamp } from '../utils/helpers';

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
        const section = plan.sections.find((s) => s.id === id);
        
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
        const sectionsWithPlanId = plan.sections.map((section) => ({
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
      const sectionsWithPlanId = plan.sections.map((section) => ({
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
        updatedAt: getCurrentTimestamp()
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
      const updatedSections = plan.sections.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            ...sectionUpdate,
            updatedAt: getCurrentTimestamp()
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
      const updatedSection = updatedSections.find((s) => s.id === id);
      
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
      
      if (!plan.sections) {
        return {
          success: false,
          error: {
            code: 'SECTIONS_NOT_FOUND',
            message: 'Business plan does not have any sections'
          }
        };
      }
      
      // Filter out the section to be deleted
      const filteredSections = plan.sections.filter((s) => s.id !== id);
      
      // Check if section was found and removed
      if (filteredSections.length === plan.sections.length) {
        return {
          success: false,
          error: {
            code: 'SECTION_NOT_FOUND',
            message: `Section with ID ${id} not found in business plan`
          }
        };
      }
      
      // Update the business plan with the filtered sections
      const updateResult = await this.businessPlanService.updateItem(businessPlanId, {
        sections: filteredSections
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
}
