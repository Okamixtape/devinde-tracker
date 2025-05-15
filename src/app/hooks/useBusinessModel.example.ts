/**
 * Hook useBusinessModel - Gestion du modèle économique
 * 
 * Exemple d'adaptation pour utiliser les interfaces standardisées
 * 
 * @version 2.0
 */
import { useCallback, useEffect, useState } from 'react';
import { BusinessModelAdapter } from '../adapters/BusinessModelAdapter';
import { useDataService } from './useDataService';
import { useErrorHandler } from './useErrorHandler';
import { 
  UIBusinessModel, 
  UIBusinessModelCanvas, 
  UIPricingModel,
  UICanvasItem
} from '../interfaces';

/**
 * Hook pour la gestion du modèle économique
 * 
 * Ce hook fournit les fonctionnalités pour visualiser et éditer
 * le modèle économique (canvas, tarification, etc.)
 */
export function useBusinessModel(businessPlanId: string) {
  // State pour le modèle économique
  const [businessModel, setBusinessModel] = useState<UIBusinessModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Services
  const dataService = useDataService();
  const { handleError } = useErrorHandler();
  
  /**
   * Charge les données du modèle économique depuis le service
   */
  const loadBusinessModel = useCallback(async () => {
    if (!businessPlanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await dataService.getBusinessPlan(businessPlanId);
      
      if (result && result.success) {
        // Utilisation de l'adaptateur avec les nouvelles interfaces
        const uiBusinessModel = BusinessModelAdapter.toUI(result.data);
        setBusinessModel(uiBusinessModel);
      } else {
        setError("Erreur lors du chargement du modèle économique");
      }
    } catch (err) {
      handleError(err, "Impossible de charger le modèle économique");
      setError("Erreur lors du chargement du modèle économique");
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanId, dataService, handleError]);
  
  /**
   * Met à jour le canvas du modèle économique
   */
  const updateCanvas = useCallback(async (
    updatedCanvas: Partial<UIBusinessModelCanvas>
  ) => {
    if (!businessPlanId || !businessModel) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les données actuelles
      const currentData = await dataService.getBusinessPlan(businessPlanId);
      
      if (!currentData || !currentData.success) {
        throw new Error("Impossible de récupérer les données actuelles");
      }
      
      // Mise à jour partielle avec l'adaptateur
      const updatedData = BusinessModelAdapter.updateServiceWithUIChanges(
        currentData.data,
        { canvas: updatedCanvas }
      );
      
      // Sauvegarder les données mises à jour
      const result = await dataService.updateBusinessPlan(businessPlanId, updatedData);
      
      if (result && result.success) {
        // Mettre à jour le state local pour refléter les changements
        setBusinessModel(prev => {
          if (!prev) return BusinessModelAdapter.toUI(result.data);
          
          return {
            ...prev,
            canvas: {
              ...prev.canvas,
              ...updatedCanvas
            }
          };
        });
      } else {
        setError("Erreur lors de la mise à jour du modèle économique");
      }
    } catch (err) {
      handleError(err, "Impossible de mettre à jour le modèle économique");
      setError("Erreur lors de la mise à jour du modèle économique");
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanId, businessModel, dataService, handleError]);
  
  /**
   * Ajoute un élément au canvas
   */
  const addCanvasItem = useCallback(async (
    section: keyof UIBusinessModelCanvas,
    item: Omit<UICanvasItem, 'id'>
  ) => {
    if (!businessPlanId || !businessModel) return;
    
    // Générer un ID pour le nouvel élément
    const newItem: UICanvasItem = {
      ...item,
      id: `${section}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Récupérer la section actuelle
    const currentSection = businessModel.canvas[section] || [];
    
    // Créer une mise à jour partielle pour cette section uniquement
    const partialUpdate: Partial<UIBusinessModelCanvas> = {
      [section]: [...currentSection, newItem]
    };
    
    // Utiliser la méthode de mise à jour du canvas
    await updateCanvas(partialUpdate);
  }, [businessPlanId, businessModel, updateCanvas]);
  
  /**
   * Met à jour le modèle de tarification
   */
  const updatePricing = useCallback(async (
    updatedPricing: Partial<UIPricingModel>
  ) => {
    if (!businessPlanId || !businessModel) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les données actuelles
      const currentData = await dataService.getBusinessPlan(businessPlanId);
      
      if (!currentData || !currentData.success) {
        throw new Error("Impossible de récupérer les données actuelles");
      }
      
      // Mise à jour partielle avec l'adaptateur
      const updatedData = BusinessModelAdapter.updateServiceWithUIChanges(
        currentData.data,
        { pricing: updatedPricing }
      );
      
      // Sauvegarder les données mises à jour
      const result = await dataService.updateBusinessPlan(businessPlanId, updatedData);
      
      if (result && result.success) {
        // Mettre à jour le state local pour refléter les changements
        setBusinessModel(prev => {
          if (!prev) return BusinessModelAdapter.toUI(result.data);
          
          return {
            ...prev,
            pricing: {
              ...prev.pricing,
              ...updatedPricing
            }
          };
        });
      } else {
        setError("Erreur lors de la mise à jour du modèle de tarification");
      }
    } catch (err) {
      handleError(err, "Impossible de mettre à jour le modèle de tarification");
      setError("Erreur lors de la mise à jour du modèle de tarification");
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanId, businessModel, dataService, handleError]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    loadBusinessModel();
  }, [loadBusinessModel]);
  
  // Retourner l'API publique du hook
  return {
    businessModel,
    isLoading,
    error,
    loadBusinessModel,
    updateCanvas,
    addCanvasItem,
    updatePricing
  };
}