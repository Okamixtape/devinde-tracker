/**
 * Service Interfaces - Defines the contract for all data services
 */
import { SearchQuery, SearchResults, FilterOption } from '../core/searchService';
import { ServiceResult } from './dataModels';
import { ClientIncident, RiskClient, RiskLevel, RiskStats } from '../../interfaces/client-risk';
import { Document, DocumentType, Payment } from '../../interfaces/invoicing';

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
 * @deprecated Use IStorageService instead
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
 * Standardized storage service interface - Base interface for all storage services
 * Provides methods to create, read, update, and delete items in a generic storage system
 */
export interface IStorageService<T> {
  /**
   * Retrieves an item by its unique identifier
   * @param id The unique identifier of the item to retrieve
   * @returns Promise with ServiceResult containing the item or an error
   */
  getItem(id: string): Promise<ServiceResult<T>>;
  
  /**
   * Retrieves all items from storage
   * @returns Promise with ServiceResult containing an array of items or an error
   */
  getItems(): Promise<ServiceResult<T[]>>;
  
  /**
   * Creates a new item in storage
   * @param item The item to create
   * @returns Promise with ServiceResult containing the created item or an error
   */
  createItem(item: T): Promise<ServiceResult<T>>;
  
  /**
   * Updates an existing item with new field values
   * @param id The unique identifier of the item to update
   * @param item Partial object containing the fields to update
   * @returns Promise with ServiceResult containing the updated item or an error
   */
  updateItem(id: string, item: Partial<T>): Promise<ServiceResult<T>>;
  
  /**
   * Deletes an item from storage by its unique identifier
   * @param id The unique identifier of the item to delete
   * @returns Promise with ServiceResult containing a boolean success indicator or an error
   */
  deleteItem(id: string): Promise<ServiceResult<boolean>>;
}

/**
 * Business Plan Service - Specific operations for business plans
 */
// Define a proper BusinessPlan interface with support for standardized interfaces
export interface BusinessPlan {
  id: string;
  name: string;
  userId: string;
  sections: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
  // Standardized data using the new interface format
  standardized?: {
    actionPlan?: unknown;
    businessModel?: unknown;
    pricingModel?: unknown;
    marketAnalysis?: unknown;
  };
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
 * @deprecated Use ISectionService instead
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
}

/**
 * Standard Section Service Interface - For managing sections within a business plan
 * Provides methods to create, read, update, and delete sections, as well as
 * utilities for working with section data
 */
export interface ISectionService extends StorageService<Section> {
  /**
   * Retrieves all sections for a specific business plan
   * @param businessPlanId The ID of the business plan to get sections for
   * @returns Promise with ServiceResult containing the list of sections or an error
   */
  getSections(businessPlanId: string): Promise<ServiceResult<Section[]>>;
  
  /**
   * Updates the completion percentage of a section
   * @param id The ID of the section to update
   * @param completion The new completion percentage (0-100)
   * @returns Promise with ServiceResult containing the updated section or an error
   */
  updateSectionCompletion(id: string, completion: number): Promise<ServiceResult<Section>>;
  
  /**
   * Enriches an existing list of sections with any missing default sections from configuration
   * @param businessPlanId The ID of the business plan the sections belong to
   * @param existingSections The current list of sections to enrich
   * @returns A complete list of sections including any missing default sections
   */
  enrichSections(businessPlanId: string, existingSections: Section[]): Section[];
  
  /**
   * Retrieves a section template from configuration by its key
   * @param key The unique key of the section
   * @returns A section object or null if not found
   */
  getSectionByKey(key: string): Section | null;

  /**
   * Gets the display title for a section based on its key
   * @param key The unique key of the section
   * @returns The display title of the section
   */
  getSectionTitle(key: string): string;

  /**
   * Gets the icon name for a section based on its key
   * @param key The unique key of the section
   * @returns The icon name for the section
   */
  getIconForSection(key: string): string;
  
  /**
   * Gets the description text for a section based on its key
   * @param sectionKey The unique key of the section
   * @returns The description text for the section
   */
  getDescriptionForSection(sectionKey: string): string;
  
  /**
   * Creates a new standard section from the sections configuration
   * @param businessPlanId The ID of the business plan to add the section to
   * @param sectionKey The key of the section to create
   * @returns Promise with ServiceResult containing the created section or an error
   */
  createStandardSection(businessPlanId: string, sectionKey: string): Promise<ServiceResult<Section>>;
  
  /**
   * Reorders sections within a business plan
   * @param businessPlanId The ID of the business plan containing the sections
   * @param sectionIds An array of section IDs in the desired order
   * @returns Promise with ServiceResult containing the reordered sections or an error
   */
  reorderSections(businessPlanId: string, sectionIds: string[]): Promise<ServiceResult<Section[]>>;
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

/**
 * Risk Client Service - Interface for risk client operations
 */
export interface IRiskClientService {
  /**
   * Retrieves all risk clients
   * @returns Array of all risk clients
   */
  getAllRiskClients(): RiskClient[];
  
  /**
   * Retrieves a risk client by their ID
   * @param id The ID of the risk client to retrieve
   * @returns The risk client or null if not found
   */
  getRiskClientById(id: string): RiskClient | null;
  
  /**
   * Saves a risk client (creates new or updates existing)
   * @param client The risk client to save
   * @returns The saved risk client
   */
  saveRiskClient(client: RiskClient): RiskClient;
  
  /**
   * Removes a risk client by their ID
   * @param id The ID of the risk client to remove
   * @returns True if removal was successful, false otherwise
   */
  removeRiskClient(id: string): boolean;
  
  /**
   * Adds an incident to a risk client
   * @param clientId The ID of the risk client
   * @param incident The incident to add
   * @returns The updated risk client or null if client not found
   */
  addIncident(clientId: string, incident: ClientIncident): RiskClient | null;
  
  /**
   * Updates the risk level of a client
   * @param clientId The ID of the risk client
   * @param riskLevel The new risk level
   * @returns The updated risk client or null if client not found
   */
  updateRiskLevel(clientId: string, riskLevel: RiskLevel): RiskClient | null;
  
  /**
   * Gets risk statistics across all clients
   * @returns Statistics about risk clients
   */
  getRiskStats(): RiskStats;
}

/**
 * Document Service - Interface for document operations (invoices and quotes)
 */
export interface IDocumentService {
  /**
   * Retrieves all documents
   * @returns Array of all documents
   */
  getAll(): Document[];
  
  /**
   * Retrieves a document by its ID
   * @param id The ID of the document to retrieve
   * @returns The document or null if not found
   */
  getById(id: string): Document | null;
  
  /**
   * Retrieves all documents associated with a business plan
   * @param businessPlanId The ID of the business plan
   * @returns Array of documents
   */
  getByBusinessPlanId(businessPlanId: string): Document[];
  
  /**
   * Retrieves all documents associated with a service
   * @param serviceId The ID of the service
   * @returns Array of documents
   */
  getByServiceId(serviceId: string): Document[];
  
  /**
   * Saves a document (creates new or updates existing)
   * @param document The document to save
   * @returns The saved document
   */
  save(document: Document): Document;
  
  /**
   * Deletes a document by its ID
   * @param id The ID of the document to delete
   * @returns True if deletion was successful, false otherwise
   */
  delete(id: string): boolean;
  
  /**
   * Creates a new document from a service
   * @param type The type of document (invoice or quote)
   * @param service The service to create the document from
   * @param businessPlanId The ID of the business plan
   * @param clientInfo The client information
   * @param companyInfo The company information
   * @param additionalDetails Additional document details
   * @returns The created document
   */
  createFromService(
    type: DocumentType, 
    service: any, 
    businessPlanId: string,
    clientInfo: Record<string, unknown>, 
    companyInfo: Record<string, unknown>,
    additionalDetails?: {
      notes?: string,
      paymentTerms?: string,
      validUntil?: string,
      dueDate?: string
    }
  ): Document;
}

/**
 * Payment Service - Interface for payment operations
 */
export interface IPaymentService {
  /**
   * Retrieves all payments
   * @returns Array of all payments
   */
  getAllPayments(): Payment[];
  
  /**
   * Retrieves payments for a specific document
   * @param documentId The ID of the document to retrieve payments for
   * @returns Array of payments
   */
  getDocumentPayments(documentId: string): Payment[];
  
  /**
   * Adds a new payment
   * @param payment The payment to add
   * @returns The added payment
   */
  addPayment(payment: Payment): Payment;
  
  /**
   * Deletes a payment
   * @param paymentId The ID of the payment to delete
   * @returns True if deletion was successful, false otherwise
   */
  deletePayment(paymentId: string): boolean;
  
  /**
   * Updates the payment status of a document
   * @param documentId The ID of the document to update
   */
  updateDocumentPaymentStatus(documentId: string): void;
  
  /**
   * Generates a payment receipt
   * @param payment The payment to generate a receipt for
   * @returns The receipt number
   */
  generatePaymentReceipt(payment: Payment): string;
  
  /**
   * Calculates payment statistics for a document
   * @param documentId The ID of the document to calculate statistics for
   * @returns Payment statistics
   */
  getPaymentStats(documentId: string): {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentCount: number;
    isPaid: boolean;
    isPartiallyPaid: boolean;
    isOverdue: boolean;
    paymentPercentage: number;
  };
}

/**
 * Local Storage Service - Interface for secure browser localStorage operations
 * Provides secure access to browser's localStorage with encryption and additional security features
 */
export interface ILocalStorageService<T extends { id?: string }> extends IStorageService<T> {
  /**
   * Retrieves the storage key used for this service instance
   * @returns The storage key string used in localStorage
   */
  getStorageKey(): string;
  
  /**
   * Sets a new storage key for this service instance
   * @param storageKey The new storage key to use
   */
  setStorageKey(storageKey: string): void;
  
  /**
   * Handles errors in a consistent way across storage operations
   * @param code Error code for categorizing the error
   * @param message Human-readable error message
   * @param error Original error object if available
   * @returns ServiceResult with error information
   */
  handleError(code: string, message: string, error?: unknown): ServiceResult<any>;
  
  /**
   * Clears all items from this storage collection
   * @returns Promise with ServiceResult containing success status or an error
   */
  clearItems(): Promise<ServiceResult<boolean>>;
  
  /**
   * Bulk creates or updates multiple items at once
   * @param items Array of items to create or update
   * @returns Promise with ServiceResult containing the created/updated items or an error
   */
  bulkSave(items: T[]): Promise<ServiceResult<T[]>>;
}
