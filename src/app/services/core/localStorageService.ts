/**
 * LocalStorageService - Core implementation of storage using localStorage
 */
import { ILocalStorageService, IStorageService, StorageService } from '../interfaces/service-interfaces';
import { ServiceResult, ServiceError } from '../interfaces/dataModels';
import { generateUUID, getCurrentTimestamp } from "../utils/helpers";
import { secureLocalStorage, RateLimitOperation, throttle, recordSuspiciousActivity } from "../utils/security";

/**
 * Generic LocalStorageService that can be used for any type of data
 * Implements both the legacy StorageService interface and the new ILocalStorageService interface
 * for backward compatibility
 */
export class LocalStorageServiceImpl<T extends { id?: string }> implements ILocalStorageService<T>, StorageService<T> {
  private storageKey: string;

  /**
   * Creates a new LocalStorageService instance
   * @param storageKey - The key to use for localStorage
   */
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Retrieves the storage key used for this service instance
   * @returns The storage key string used in localStorage
   */
  getStorageKey(): string {
    return this.storageKey;
  }
  
  /**
   * Sets a new storage key for this service instance
   * @param storageKey The new storage key to use
   */
  setStorageKey(storageKey: string): void {
    this.storageKey = storageKey;
  }

  /**
   * Retrieves all items from storage
   * @returns Promise with ServiceResult containing an array of items or an error
   */
  async getItems(): Promise<ServiceResult<T[]>> {
    try {
      // Use throttled function to prevent excessive reads
      const getItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        return secureLocalStorage.getItem<T[]>(this.storageKey) || [];
      }, RateLimitOperation.DATA_READ);
      
      const items = getItemsThrottled() as T[];
      
      return {
        success: true,
        data: items
      };
    } catch (e) {
      return this.handleError('STORAGE_GET_ERROR', 'Failed to retrieve items from storage', e);
    }
  }

  /**
   * Retrieves an item by its unique identifier
   * @param id The unique identifier of the item to retrieve
   * @returns Promise with ServiceResult containing the item or an error
   */
  async getItem(id: string): Promise<ServiceResult<T>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      const item = result.data?.find(item => item.id === id);
      
      if (!item) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: `Item with ID ${id} not found`
          }
        };
      }
      
      return {
        success: true,
        data: item
      };
    } catch (e) {
      return this.handleError('STORAGE_GET_ERROR', `Failed to retrieve item with ID ${id}`, e);
    }
  }

  /**
   * Creates a new item in storage
   * @param item The item to create
   * @returns Promise with ServiceResult containing the created item or an error
   */
  async createItem(item: T): Promise<ServiceResult<T>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      // Generate a UUID if the item doesn't have an ID
      const newItem = { 
        ...item, 
        id: item.id || generateUUID(),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      };
      
      // Add to the array of items
      const items = [...(result.data || []), newItem];
      
      // Use throttled function to prevent excessive writes
      const setItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        secureLocalStorage.setItem(this.storageKey, items);
      }, RateLimitOperation.DATA_WRITE);
      
      setItemsThrottled();
      
      return {
        success: true,
        data: newItem as T
      };
    } catch (e) {
      return this.handleError('STORAGE_CREATE_ERROR', 'Failed to create item', e);
    }
  }

  /**
   * Updates an existing item with new field values
   * @param id The unique identifier of the item to update
   * @param updatedFields Partial object containing the fields to update
   * @returns Promise with ServiceResult containing the updated item or an error
   */
  async updateItem(id: string, updatedFields: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      const items = result.data || [];
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: `Item with ID ${id} not found`
          }
        };
      }
      
      // Update the item with new fields
      const updatedItem = { 
        ...items[index], 
        ...updatedFields,
        updatedAt: getCurrentTimestamp()
      };
      
      // Replace the old item with the updated one
      items[index] = updatedItem;
      
      // Use throttled function to prevent excessive writes
      const setItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        secureLocalStorage.setItem(this.storageKey, items);
      }, RateLimitOperation.DATA_WRITE);
      
      setItemsThrottled();
      
      return {
        success: true,
        data: updatedItem as T
      };
    } catch (e) {
      return this.handleError('STORAGE_UPDATE_ERROR', `Failed to update item with ID ${id}`, e);
    }
  }

  /**
   * Deletes an item from storage by its unique identifier
   * @param id The unique identifier of the item to delete
   * @returns Promise with ServiceResult containing a boolean success indicator or an error
   */
  async deleteItem(id: string): Promise<ServiceResult<boolean>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      const items = result.data || [];
      const originalLength = items.length;
      const filteredItems = items.filter(item => item.id !== id);
      
      // If the lengths are the same, no item was removed
      if (filteredItems.length === originalLength) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: `Item with ID ${id} not found`
          }
        };
      }
      
      // Record this as a potentially suspicious activity if multiple deletions
      if (originalLength - filteredItems.length > 1) {
        recordSuspiciousActivity('dataDeletion', {
          count: originalLength - filteredItems.length,
          storageKey: this.storageKey
        });
      }
      
      // Use throttled function to prevent excessive writes
      const setItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        secureLocalStorage.setItem(this.storageKey, filteredItems);
      }, RateLimitOperation.DATA_WRITE);
      
      setItemsThrottled();
      
      return {
        success: true,
        data: true
      };
    } catch (e) {
      return this.handleError('STORAGE_DELETE_ERROR', `Failed to delete item with ID ${id}`, e);
    }
  }

  /**
   * Handles errors in a consistent way across storage operations
   * @param code Error code for categorizing the error
   * @param message Human-readable error message
   * @param error Original error object if available
   * @returns ServiceResult with error information
   */
  handleError(code: string, message: string, error?: unknown): ServiceResult<any> {
    console.error(`${code}: ${message}`, error);
    
    const serviceError: ServiceError = {
      code,
      message,
      details: error instanceof Error ? error.message : String(error)
    };
    
    return {
      success: false,
      error: serviceError
    };
  }
  
  /**
   * Clears all items from this storage collection
   * @returns Promise with ServiceResult containing success status or an error
   */
  async clearItems(): Promise<ServiceResult<boolean>> {
    try {
      // Use throttled function to prevent excessive writes
      const clearItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        secureLocalStorage.setItem(this.storageKey, []);
      }, RateLimitOperation.DATA_WRITE);
      
      clearItemsThrottled();
      
      return {
        success: true,
        data: true
      };
    } catch (e) {
      return this.handleError('STORAGE_CLEAR_ERROR', `Failed to clear items for key ${this.storageKey}`, e);
    }
  }
  
  /**
   * Bulk creates or updates multiple items at once
   * @param items Array of items to create or update
   * @returns Promise with ServiceResult containing the created/updated items or an error
   */
  async bulkSave(items: T[]): Promise<ServiceResult<T[]>> {
    try {
      const result = await this.getItems();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      const existingItems = result.data || [];
      const timestamp = getCurrentTimestamp();
      const updatedItems: T[] = [];
      
      // Process each item in the bulk operation
      for (const item of items) {
        if (!item.id) {
          // Create new item
          const newItem = {
            ...item,
            id: generateUUID(),
            createdAt: timestamp,
            updatedAt: timestamp
          } as T;
          updatedItems.push(newItem);
        } else {
          // Update existing item
          const existingIndex = existingItems.findIndex(existing => existing.id === item.id);
          if (existingIndex >= 0) {
            // Item exists, update it
            const updatedItem = {
              ...existingItems[existingIndex],
              ...item,
              updatedAt: timestamp
            } as T;
            existingItems[existingIndex] = updatedItem;
            updatedItems.push(updatedItem);
          } else {
            // Item doesn't exist yet but has ID, add it
            const newItem = {
              ...item,
              createdAt: timestamp,
              updatedAt: timestamp
            } as T;
            updatedItems.push(newItem);
          }
        }
      }
      
      // Combine items that weren't updated with the new/updated items
      const itemsToSave = [
        ...existingItems.filter(existing => !items.some(item => item.id === existing.id)),
        ...updatedItems
      ];
      
      // Use throttled function to prevent excessive writes
      const setItemsThrottled = throttle(() => {
        // Use secureLocalStorage instead of localStorage
        secureLocalStorage.setItem(this.storageKey, itemsToSave);
      }, RateLimitOperation.DATA_WRITE);
      
      setItemsThrottled();
      
      return {
        success: true,
        data: updatedItems
      };
    } catch (e) {
      return this.handleError('STORAGE_BULK_SAVE_ERROR', 'Failed to bulk save items', e);
    }
  }
}

// Create singleton factory function for LocalStorageService
export function createLocalStorageService<T extends { id?: string }>(storageKey: string): ILocalStorageService<T> {
  return new LocalStorageServiceImpl<T>(storageKey);
}

// For backward compatibility
export class LocalStorageService<T extends { id?: string }> extends LocalStorageServiceImpl<T> {}
