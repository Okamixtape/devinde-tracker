/**
 * API Service Adapter - DevIndé Tracker
 * 
 * Ce service fournit une adaptation entre les interfaces de service locales
 * et les API externes. Il implémente les mêmes interfaces que les services
 * locaux mais communique avec un backend via HTTP.
 */

import { ServiceResult } from "../services/interfaces/dataModels";
import { StorageService } from "../services/interfaces/serviceInterfaces";
import { ErrorType } from "../services/utils/errorHandling";
import { errorTrackingService } from './errorTrackingService';
import { httpService, HttpService, RequestConfig } from './httpService';

// Configuration API par défaut
export interface ApiServiceConfig<T> {
  baseUrl: string;
  resourcePath: string;
  httpService?: HttpService;
  requestConfig?: RequestConfig;
  // Options de transformation pour adapter les réponses API au format interne
  transformers?: {
    toApi?: (item: T) => any; // Transformer un objet local vers le format API
    fromApi?: (apiData: any) => T; // Transformer une réponse API vers l'objet local
  };
}

/**
 * Adaptateur de service API générique
 * Implémente l'interface StorageService pour tous les types de données
 */
class ApiServiceAdapter<T> implements StorageService<T> {
  private baseUrl: string;
  private resourcePath: string;
  private httpService: HttpService;
  private requestConfig: RequestConfig;
  private toApi?: (item: T) => any;
  private fromApi?: (apiData: any) => T;

  constructor(config: ApiServiceConfig<T>) {
    this.baseUrl = config.baseUrl;
    this.resourcePath = config.resourcePath;
    this.httpService = config.httpService || httpService;
    this.requestConfig = config.requestConfig || {};
    this.toApi = config.transformers?.toApi;
    this.fromApi = config.transformers?.fromApi;
  }

  /**
   * Construit l'URL complète pour une ressource
   */
  private getResourceUrl(id?: string): string {
    const base = `${this.baseUrl}/${this.resourcePath}`;
    return id ? `${base}/${id}` : base;
  }

  /**
   * Transforme les données pour l'API si un transformateur est défini
   */
  private transformToApi(item: T): any {
    return this.toApi ? this.toApi(item) : item;
  }

  /**
   * Transforme les données de l'API si un transformateur est défini
   */
  private transformFromApi(apiData: any): T {
    return this.fromApi ? this.fromApi(apiData) : apiData as T;
  }

  /**
   * Transforme un tableau de données de l'API
   */
  private transformArrayFromApi(apiData: any[]): T[] {
    return apiData.map(item => this.transformFromApi(item));
  }

  /**
   * Récupère un élément par son ID
   */
  async getItem(id: string): Promise<ServiceResult<T>> {
    try {
      const response = await this.httpService.get(
        this.getResourceUrl(id),
        this.requestConfig
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: this.transformFromApi(response.data)
        };
      }

      return {
        success: false,
        error: response.error
      };
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'getItem', id }
      );
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la récupération des données',
          code: 'API_ERROR'
        }
      };
    }
  }

  /**
   * Récupère tous les éléments
   */
  async getItems(): Promise<ServiceResult<T[]>> {
    try {
      const response = await this.httpService.get(
        this.getResourceUrl(),
        this.requestConfig
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: this.transformArrayFromApi(response.data)
        };
      }

      return {
        success: false,
        error: response.error
      };
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'getItems' }
      );
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la récupération des données',
          code: 'API_ERROR'
        }
      };
    }
  }

  /**
   * Crée un nouvel élément
   */
  async createItem(item: T): Promise<ServiceResult<T>> {
    try {
      const response = await this.httpService.post(
        this.getResourceUrl(),
        this.transformToApi(item),
        this.requestConfig
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: this.transformFromApi(response.data)
        };
      }

      return {
        success: false,
        error: response.error
      };
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'createItem' }
      );
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la création des données',
          code: 'API_ERROR'
        }
      };
    }
  }

  /**
   * Met à jour un élément existant
   */
  async updateItem(id: string, item: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const response = await this.httpService.put(
        this.getResourceUrl(id),
        this.transformToApi(item as T),
        this.requestConfig
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: this.transformFromApi(response.data)
        };
      }

      return {
        success: false,
        error: response.error
      };
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'updateItem', id }
      );
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour des données',
          code: 'API_ERROR'
        }
      };
    }
  }

  /**
   * Supprime un élément par son ID
   */
  async deleteItem(id: string): Promise<ServiceResult<boolean>> {
    try {
      const response = await this.httpService.delete(
        this.getResourceUrl(id),
        this.requestConfig
      );

      if (response.success) {
        return {
          success: true,
          data: true
        };
      }

      return {
        success: false,
        error: response.error
      };
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'deleteItem', id }
      );
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la suppression des données',
          code: 'API_ERROR'
        }
      };
    }
  }
}

/**
 * Crée un adaptateur de service API pour un type de données spécifique
 */
export function createApiService<T>(config: ApiServiceConfig<T>): StorageService<T> {
  return new ApiServiceAdapter<T>(config);
}

export default ApiServiceAdapter;
