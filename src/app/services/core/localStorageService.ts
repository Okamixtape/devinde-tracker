/**
 * LocalStorageService - Core implementation of storage using localStorage
 */
import { StorageService } from '../interfaces/serviceInterfaces';
import { ServiceResult, ServiceError } from '../interfaces/dataModels';
import { generateUUID, getCurrentTimestamp } from "../utils/helpers";
import { secureLocalStorage, RateLimitOperation, throttle, recordSuspiciousActivity } from "../utils/security";

/**
 * Generic LocalStorageService that can be used for any type of data
 */
export class LocalStorageService<T extends { id?: string }> implements StorageService<T> {
  private storageKey: string;

  /**
   * @param storageKey - The key to use for localStorage
   */
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Get all items from localStorage
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
   * Get a single item by ID
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
   * Create a new item
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
   * Update an existing item
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
   * Delete an item by ID
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
   * Handle errors consistently
   */
  private handleError(code: string, message: string, error?: unknown): ServiceResult<any> {
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
}
