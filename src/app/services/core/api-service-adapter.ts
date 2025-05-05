/**
 * API Service Adapter - DevIndé Tracker
 * 
 * Ce service fournit une adaptation entre les interfaces de service locales
 * et les API externes. Il implémente les mêmes interfaces que les services
 * locaux mais communique avec un backend via HTTP.
 */

import { httpService, HttpService, RequestConfig } from './http-service';
import { ServiceResult } from '../interfaces/data-models';
import { StorageService } from '../interfaces/service-interfaces';
import { errorTrackingService } from './error-tracking-service';
import { ErrorType } from '../utils/error-handling';

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
export class ApiServiceAdapter<T> implements StorageService<T> {
  private config: ApiServiceConfig<T>;
  private http: HttpService;

  constructor(config: ApiServiceConfig<T>) {
    this.config = config;
    this.http = config.httpService || httpService;
  }

  /**
   * Construit l'URL complète pour une ressource
   */
  private getResourceUrl(id?: string): string {
    const basePath = this.config.resourcePath.replace(/^\/|\/$/g, '');
    return id ? `${basePath}/${id}` : basePath;
  }

  /**
   * Transforme les données pour l'API si un transformateur est défini
   */
  private toApiFormat(item: T): any {
    return this.config.transformers?.toApi ? this.config.transformers.toApi(item) : item;
  }

  /**
   * Transforme les données de l'API vers le format local si un transformateur est défini
   */
  private fromApiFormat(apiData: any): T {
    return this.config.transformers?.fromApi ? this.config.transformers.fromApi(apiData) : apiData;
  }

  /**
   * Gère les erreurs et les formate en ServiceResult
   */
  private handleError(error: any): ServiceResult<any> {
    // Capture l'erreur dans le service de tracking
    if (error instanceof Error) {
      errorTrackingService.captureException(error, ErrorType.API);
    }

    return {
      success: false,
      error: error.message || 'Une erreur est survenue',
      code: error.code || 'API_ERROR',
      data: null
    };
  }

  /**
   * Obtenir un élément par son ID
   */
  async getItem(id: string): Promise<ServiceResult<T>> {
    try {
      const response = await this.http.get<any>(
        this.getResourceUrl(id),
        this.config.requestConfig
      );
      
      return {
        success: true,
        data: this.fromApiFormat(response.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtenir tous les éléments
   */
  async getItems(): Promise<ServiceResult<T[]>> {
    try {
      const response = await this.http.get<any[]>(
        this.getResourceUrl(),
        this.config.requestConfig
      );
      
      return {
        success: true,
        data: Array.isArray(response.data) 
          ? response.data.map(item => this.fromApiFormat(item))
          : []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Créer un nouvel élément
   */
  async createItem(item: T): Promise<ServiceResult<T>> {
    try {
      const apiData = this.toApiFormat(item);
      const response = await this.http.post<any>(
        this.getResourceUrl(),
        apiData,
        this.config.requestConfig
      );
      
      return {
        success: true,
        data: this.fromApiFormat(response.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mettre à jour un élément existant
   */
  async updateItem(id: string, item: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const apiData = this.toApiFormat(item as T);
      const response = await this.http.put<any>(
        this.getResourceUrl(id),
        apiData,
        this.config.requestConfig
      );
      
      return {
        success: true,
        data: this.fromApiFormat(response.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Supprimer un élément par son ID
   */
  async deleteItem(id: string): Promise<ServiceResult<boolean>> {
    try {
      await this.http.delete(
        this.getResourceUrl(id),
        this.config.requestConfig
      );
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return this.handleError(error);
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
