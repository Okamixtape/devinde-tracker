/**
 * Service Interfaces - Defines the contract for all data services
 */
import { ServiceResult } from './data-models';

/**
 * Generic storage service interface - All storage services implement this
 */
export interface StorageService<T> {
  /**
   * Get an item by its ID
   */
  getItem(id: string): Promise<ServiceResult<T>>;
  
  /**
   * Get all items
   */
  getItems(): Promise<ServiceResult<T[]>>;
  
  /**
   * Create a new item
   */
  createItem(item: T): Promise<ServiceResult<T>>;
  
  /**
   * Update an existing item
   */
  updateItem(id: string, item: Partial<T>): Promise<ServiceResult<T>>;
  
  /**
   * Delete an item by its ID
   */
  deleteItem(id: string): Promise<ServiceResult<boolean>>;
}

/**
 * Business Plan Service - Specific operations for business plans
 */
export interface BusinessPlanService extends StorageService<any> {
  /**
   * Get business plans for a specific user
   */
  getUserBusinessPlans(userId: string): Promise<ServiceResult<any[]>>;
  
  /**
   * Export a business plan to a specified format
   */
  exportBusinessPlan(id: string, format?: string): Promise<ServiceResult<any>>;
  
  /**
   * Import a business plan from external data
   */
  importBusinessPlan(data: any): Promise<ServiceResult<any>>;
  
  /**
   * Create a duplicate of an existing business plan
   */
  duplicateBusinessPlan(id: string, newName?: string): Promise<ServiceResult<any>>;
}

/**
 * Section Service - For managing sections within a business plan
 */
export interface SectionService extends StorageService<any> {
  /**
   * Get all sections for a business plan
   */
  getSections(businessPlanId: string): Promise<ServiceResult<any[]>>;
  
  /**
   * Update the completion status of a section
   */
  updateSectionCompletion(id: string, completion: number): Promise<ServiceResult<any>>;
}

/**
 * Auth Service - Interface for authentication operations
 */
export interface AuthService {
  /**
   * Create a new user
   */
  register(email: string, password: string, userData?: any): Promise<ServiceResult<any>>;
  
  /**
   * Login a user
   */
  login(email: string, password: string): Promise<ServiceResult<any>>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<ServiceResult<boolean>>;
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<ServiceResult<any>>;
  
  /**
   * Check if a user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
}
