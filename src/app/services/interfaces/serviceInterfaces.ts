/**
 * Service Interfaces - Defines the contract for all data services
 */
import { SearchQuery, SearchResults, FilterOption } from '../core/searchService';
import { ServiceResult } from './dataModels';

/**
 * Section - Interface for business plan sections
 */
export interface Section {
  id: string;
  key: string;
  title: string;
  businessPlanId: string;
  completion: number;
  order: number;
  data?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

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
// Define a proper BusinessPlan interface
export interface BusinessPlan {
  id: string;
  name: string;
  userId: string;
  sections: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface BusinessPlanService extends StorageService<BusinessPlan> {
  /**
   * Get business plans for a specific user
   */
  getUserBusinessPlans(userId: string): Promise<ServiceResult<BusinessPlan[]>>;
  
  /**
   * Export a business plan to a specified format
   */
  exportBusinessPlan(id: string, format?: string): Promise<ServiceResult<unknown>>;
  
  /**
   * Import a business plan from external data
   */
  importBusinessPlan(data: Record<string, unknown>): Promise<ServiceResult<BusinessPlan>>;
  
  /**
   * Create a duplicate of an existing business plan
   */
  duplicateBusinessPlan(id: string, newName?: string): Promise<ServiceResult<BusinessPlan>>;
}

/**
 * Section Service - For managing sections within a business plan
 */
export interface SectionService extends StorageService<Section> {
  /**
   * Get all sections for a business plan
   */
  getSections(businessPlanId: string): Promise<ServiceResult<Section[]>>;
  
  /**
   * Update the completion status of a section
   */
  updateSectionCompletion(id: string, completion: number): Promise<ServiceResult<Section>>;
  
  /**
   * Enrich existing sections with missing sections from SECTIONS_CONFIG
   */
  enrichSections(businessPlanId: string, existingSections: Section[]): Section[];
  
  /**
   * Get section configuration by key
   */
  getSectionByKey(key: string): Section | null;

  /**
   * Get section display title
   */
  getSectionTitle(key: string): string;

  /**
   * Get icon for section by key
   */
  getIconForSection(key: string): string;
  
  /**
   * Get description for a section key
   */
  getDescriptionForSection(sectionKey: string): string;
  
  /**
   * Get complete section definition by key
   */
  getSectionByKey(key: string): Section | null;
  
  /**
   * Get section display title
   */
  getSectionTitle(key: string): string;
}

/**
 * User Data - Type for user data
 */
export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * User Preferences - Type for user preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
  dashboardLayout?: string;
  [key: string]: string | boolean | undefined;
}

/**
 * Search Service - Interface for search operations
 */
export interface SearchService {
  /**
   * Search items based on specified query
   */
  search(query: SearchQuery): Promise<ServiceResult<SearchResults>>;
  
  /**
   * Get suggestions for autocomplete based on input term
   */
  getSuggestions(term: string): Promise<ServiceResult<string[]>>;
  
  /**
   * Get available filter options for search
   */
  getFilterOptions(): Promise<ServiceResult<FilterOption[]>>;
}

/**
 * Auth Service - Interface for authentication operations
 */
export interface AuthService {
  /**
   * Create a new user
   */
  register(email: string, password: string, userData?: Partial<UserData>): Promise<ServiceResult<UserData>>;
  
  /**
   * Login a user
   */
  login(email: string, password: string): Promise<ServiceResult<UserData>>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<ServiceResult<boolean>>;
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<ServiceResult<UserData>>;
  
  /**
   * Check if a user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Update user profile information
   */
  updateUserProfile(userData: Partial<UserData>): Promise<ServiceResult<UserData>>;
  
  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Promise<ServiceResult<boolean>>;
  
  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: UserPreferences): Promise<ServiceResult<UserPreferences>>;
}
