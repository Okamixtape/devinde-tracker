'use client';

import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/interfaces/service-interfaces';
import { ServiceResult } from '../services/interfaces/data-models';
import { errorTrackingService } from '../services/core/error-tracking-service';
import { ErrorType, ErrorSeverity } from '../services/utils/error-handling';

// Options pour le hook
export interface UseDataServiceOptions<T> {
  initialData?: T | T[] | null;
  autoFetch?: boolean;
  onSuccess?: (data: T | T[]) => void;
  onError?: (error: string) => void;
  errorTracking?: boolean;
}

// État retourné par le hook
export interface DataServiceState<T> {
  data: T | T[] | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// Actions retournées par le hook
export interface DataServiceActions<T> {
  fetchData: (id?: string) => Promise<void>;
  fetchAll: () => Promise<void>;
  createItem: (item: T) => Promise<ServiceResult<T>>;
  updateItem: (id: string, item: Partial<T>) => Promise<ServiceResult<T>>;
  deleteItem: (id: string) => Promise<ServiceResult<boolean>>;
  reset: () => void;
}

// Type retourné par le hook useDataService
export type UseDataServiceReturn<T> = [
  DataServiceState<T>,
  DataServiceActions<T>
];

/**
 * Hook useDataService
 * 
 * Fournit une interface simplifiée pour interagir avec les services de données.
 * Gère l'état de chargement, les erreurs et les données retournées.
 * 
 * @example
 * // Dans un composant React
 * const [plansState, plansActions] = useDataService(getBusinessPlanService());
 * 
 * // Charger les données au montage du composant
 * useEffect(() => {
 *   plansActions.fetchAll();
 * }, [plansActions]);
 * 
 * // Afficher les résultats
 * if (plansState.isLoading) return <LoadingSpinner />;
 * if (plansState.error) return <ErrorMessage error={plansState.error} />;
 * return <PlansList plans={plansState.data} />;
 */
export function useDataService<T>(
  service: StorageService<T>,
  options: UseDataServiceOptions<T> = {}
): UseDataServiceReturn<T> {
  // Options par défaut
  const {
    initialData = null,
    autoFetch = false,
    onSuccess,
    onError,
    errorTracking = true
  } = options;

  // État du service
  const [state, setState] = useState<DataServiceState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    success: false
  });

  // Fonction pour mettre à jour l'état
  const updateState = useCallback((newState: Partial<DataServiceState<T>>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Fonction pour gérer les erreurs
  const handleError = useCallback((error: any) => {
    const errorMessage = error?.message || error?.error || "Une erreur est survenue";
    
    updateState({
      isLoading: false,
      error: errorMessage,
      success: false
    });
    
    if (errorTracking) {
      errorTrackingService.captureException(
        error instanceof Error ? error : new Error(errorMessage),
        ErrorType.JAVASCRIPT,
        { source: 'useDataService' }
      );
    }
    
    if (onError) {
      onError(errorMessage);
    }
  }, [errorTracking, onError, updateState]);

  // Fonction pour charger un élément par son ID
  const fetchData = useCallback(async (id?: string) => {
    try {
      updateState({ isLoading: true, error: null });
      
      let result: ServiceResult<T | T[]>;
      
      if (id) {
        result = await service.getItem(id);
      } else {
        result = await service.getItems() as ServiceResult<T[]>;
      }
      
      if (result.success && result.data) {
        updateState({
          data: result.data,
          isLoading: false,
          success: true
        });
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || "Échec de récupération des données");
      }
    } catch (error) {
      handleError(error);
    }
  }, [service, updateState, onSuccess, handleError]);
  
  // Fonction pour charger tous les éléments
  const fetchAll = useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  
  // Fonction pour créer un élément
  const createItem = useCallback(async (item: T): Promise<ServiceResult<T>> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await service.createItem(item);
      
      if (result.success && result.data) {
        updateState({
          isLoading: false,
          success: true,
          // Si data est un tableau, ajouter le nouvel élément
          data: Array.isArray(state.data)
            ? [...state.data as T[], result.data]
            : result.data
        });
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || "Échec de création de l'élément");
      }
      
      return result;
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        data: null
      };
    }
  }, [service, state.data, updateState, onSuccess, handleError]);
  
  // Fonction pour mettre à jour un élément
  const updateItem = useCallback(async (id: string, item: Partial<T>): Promise<ServiceResult<T>> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await service.updateItem(id, item);
      
      if (result.success && result.data) {
        // Mise à jour de l'état en fonction du type de données
        if (Array.isArray(state.data)) {
          // Si c'est un tableau, mettre à jour l'élément correspondant
          const updatedData = (state.data as T[]).map((d: any) => 
            d.id === id ? { ...d, ...result.data } : d
          );
          
          updateState({
            data: updatedData,
            isLoading: false,
            success: true
          });
        } else if (state.data && (state.data as any).id === id) {
          // Si c'est un objet unique et que son ID correspond, le mettre à jour
          updateState({
            data: { ...(state.data as T), ...result.data },
            isLoading: false,
            success: true
          });
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || "Échec de mise à jour de l'élément");
      }
      
      return result;
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        data: null
      };
    }
  }, [service, state.data, updateState, onSuccess, handleError]);
  
  // Fonction pour supprimer un élément
  const deleteItem = useCallback(async (id: string): Promise<ServiceResult<boolean>> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const result = await service.deleteItem(id);
      
      if (result.success) {
        // Si les données sont un tableau, filtrer l'élément supprimé
        if (Array.isArray(state.data)) {
          const filteredData = (state.data as any[]).filter(item => item.id !== id);
          
          updateState({
            data: filteredData,
            isLoading: false,
            success: true
          });
        } else if (state.data && (state.data as any).id === id) {
          // Si c'est un objet unique et que son ID correspond, le supprimer
          updateState({
            data: null,
            isLoading: false,
            success: true
          });
        }
        
        if (onSuccess) {
          onSuccess(state.data as T | T[]);
        }
      } else {
        throw new Error(result.error || "Échec de suppression de l'élément");
      }
      
      return result;
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        data: false
      };
    }
  }, [service, state.data, updateState, onSuccess, handleError]);
  
  // Fonction pour réinitialiser l'état
  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      success: false
    });
  }, [initialData]);
  
  // Charger automatiquement les données si autoFetch est true
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);
  
  // Retourner l'état et les actions
  return [
    state,
    {
      fetchData,
      fetchAll,
      createItem,
      updateItem,
      deleteItem,
      reset
    }
  ];
}

export default useDataService;
