/**
 * API Service Adapter - DevIndé Tracker
 * 
 * Ce service fournit une adaptation entre les interfaces de service locales
 * et les API externes. Il implémente les mêmes interfaces que les services
 * locaux mais communique avec un backend via HTTP.
 */

import { ServiceResult } from "../interfaces/dataModels";
import { StorageService } from "../interfaces/serviceInterfaces";
import { ErrorType } from "@/app/services/core/errorTrackingService";
import { errorTrackingService } from './errorTrackingService';
import { httpService, HttpService, RequestConfig, HttpResponse } from './httpService';

// Type for API data structure
export type ApiData = Record<string, unknown>;

// Configuration API par défaut
export interface ApiServiceConfig<T> {
  baseUrl: string;
  resourcePath: string;
  httpService?: HttpService;
  requestConfig?: RequestConfig;
  // Options de transformation pour adapter les réponses API au format interne
  transformers?: {
    toApi?: (item: T) => ApiData; // Transformer un objet local vers le format API
    fromApi?: (apiData: ApiData) => T; // Transformer une réponse API vers l'objet local
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
  private toApi?: (item: T) => ApiData;
  private fromApi?: (apiData: ApiData) => T;

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
  private transformToApi(item: T): ApiData {
    return this.toApi ? this.toApi(item) : item as unknown as ApiData;
  }

  /**
   * Transforme les données de l'API si un transformateur est défini
   */
  private transformFromApi(apiData: ApiData): T {
    return this.fromApi ? this.fromApi(apiData) : apiData as T;
  }

  /**
   * Transforme un tableau de données de l'API
   */
  private transformArrayFromApi(apiData: ApiData[]): T[] {
    return apiData.map(item => this.transformFromApi(item));
  }

  /**
   * Récupère un élément par son ID
   */
  /**
   * Convertit une réponse HTTP en ServiceResult avec conversion de type
   * @template R - Type des données retournées par l'API
   * @template S - Type des données attendues par le service (ex: T, T[], boolean)
   */
  private convertToServiceResult<R, S>(response: HttpResponse<R>, transform?: (data: R & ApiData) => S): ServiceResult<S> {
    // Si status est entre 200-299, considérer comme succès
    if (response.status >= 200 && response.status < 300 && response.data) {
      return {
        success: true,
        // Si une fonction de transformation est fournie, l'utiliser
        data: transform ? transform(response.data as R & ApiData) : response.data as unknown as S
      };
    }
    
    // Sinon, considérer comme échec
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: `Erreur API (${response.status})`,
        details: response.data
      }
    };
  }

  async getItem(id: string): Promise<ServiceResult<T>> {
    try {
      const response = await this.httpService.get(
        this.getResourceUrl(id),
        this.requestConfig
      );

      // Convertir HttpResponse en ServiceResult et transformer les données
      return this.convertToServiceResult<unknown, T>(response, 
        (data) => this.transformFromApi(data as ApiData)
      );
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

      // Convertir HttpResponse en ServiceResult avec transformation pour un tableau
      return this.convertToServiceResult<unknown, T[]>(response, 
        (data) => Array.isArray(data) ? data.map(item => this.transformFromApi(item)) : []
      );
    } catch (error) {
      errorTrackingService.trackError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.API,
        { method: 'getAllItems' }
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

      // Convertir HttpResponse en ServiceResult et transformer les données
      return this.convertToServiceResult<unknown, T>(response, 
        (data) => this.transformFromApi(data as ApiData)
      );
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

      // Convertir HttpResponse en ServiceResult et transformer les données
      return this.convertToServiceResult<unknown, T>(response, 
        (data) => this.transformFromApi(data as ApiData)
      );
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

      // Convertir HttpResponse en ServiceResult avec résultat booléen
      return this.convertToServiceResult<unknown, boolean>(response, 
        () => true
      );
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
