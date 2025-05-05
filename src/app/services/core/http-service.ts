/**
 * HTTP Service - DevIndé Tracker
 * 
 * Service responsable de toutes les communications HTTP avec les APIs externes
 * ou les services backend. Gère les headers, l'authentification et la gestion des erreurs.
 */

import { getAuthService } from '../service-factory';
import { errorTrackingService } from './error-tracking-service';
import { AppError, ErrorType, ErrorSeverity } from '../utils/error-handling';

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  withAuth?: boolean;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpService {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 secondes

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Construit l'URL complète à partir de l'URL relative
   */
  private buildUrl(url: string, params?: Record<string, string>): string {
    // Combine baseUrl et url relative
    const fullUrl = this.baseUrl ? `${this.baseUrl}/${url}` : url;
    
    // Ajoute les query params si présents
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      return `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
    
    return fullUrl;
  }

  /**
   * Prépare les headers pour la requête, incluant l'authentification si nécessaire
   */
  private async prepareHeaders(config?: RequestConfig): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config?.headers || {})
    });

    // Ajoute le token d'authentification si requis
    if (config?.withAuth !== false) {
      const authService = getAuthService();
      const token = await authService.getToken();
      
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Gère les erreurs de requête HTTP
   */
  private handleError<T>(error: any, url: string): Promise<HttpResponse<T>> {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Response) {
      appError = new AppError(
        `HTTP Error: ${error.status} ${error.statusText}`,
        error.status.toString(),
        ErrorSeverity.ERROR,
        { url, status: error.status }
      );
    } else {
      appError = new AppError(
        error.message || 'Unknown HTTP error',
        'HTTP_ERROR',
        ErrorSeverity.ERROR,
        { url, error: error.toString() }
      );
    }

    // Enregistrer l'erreur
    errorTrackingService.captureException(appError, ErrorType.API);

    return Promise.reject(appError);
  }

  /**
   * Exécute une requête HTTP
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<HttpResponse<T>> {
    try {
      const fullUrl = this.buildUrl(url, config?.params);
      const headers = await this.prepareHeaders(config);
      
      const timeout = config?.timeout || this.defaultTimeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        body: data ? JSON.stringify(data) : undefined
      };
      
      // Exécuter la requête avec un timeout
      const response = await fetch(fullUrl, options);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new AppError(
          `HTTP Error: ${response.status} ${response.statusText}`,
          response.status.toString(),
          ErrorSeverity.ERROR,
          { url: fullUrl, status: response.status }
        );
      }
      
      // Convertir les headers en objet simple
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Parser la réponse en fonction du content-type
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as unknown as T;
      }
      
      return {
        data: responseData,
        status: response.status,
        headers: responseHeaders
      };
    } catch (error) {
      return this.handleError<T>(error, url);
    }
  }

  /**
   * Effectue une requête GET
   */
  public get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Effectue une requête POST
   */
  public post<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Effectue une requête PUT
   */
  public put<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Effectue une requête DELETE
   */
  public delete<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Effectue une requête PATCH
   */
  public patch<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }
}

// Export une instance par défaut pour les appels sans backend spécifique
export const httpService = new HttpService();

export default httpService;
