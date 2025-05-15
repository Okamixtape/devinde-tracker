/**
 * useBusinessModel - Hook React pour la gestion du modèle économique
 * 
 * Ce hook encapsule toute la logique nécessaire pour interagir avec le modèle économique,
 * incluant le chargement des données, les transformations via adaptateurs,
 * et les opérations de mise à jour.
 * 
 * @module hooks/useBusinessModel
 * @version 2.0 - Updated to use standardized interfaces
 * @standardized true
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessPlanServiceImpl } from '../services/core/businessPlanService';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import BusinessModelAdapter from '../adapters/BusinessModelAdapter';
import BusinessModelProjectionsAdapter from '../adapters/BusinessModelProjectionsAdapter';
import { 
  BusinessModelCanvasData, 
  PricingModel,
  BusinessModelSimulationParams,
  RevenueProjections,
  BreakEvenAnalysis,
  UIBusinessModelProjections,
  ServiceBusinessModelProjections,
  CanvasItem
} from '../interfaces/BusinessModelInterfaces';

/**
 * Paramètres du hook
 */
interface UseBusinessModelParams {
  planId?: string;
  initialSimulationParams?: Partial<BusinessModelSimulationParams>;
  autoLoad?: boolean;
}

/**
 * Résultat du hook avec support pour les interfaces standardisées
 */
interface UseBusinessModelResult {
  // Legacy data format (for backward compatibility)
  businessPlanData: BusinessPlanData | null;
  canvas: BusinessModelCanvasData | null;
  pricing: PricingModel | null;
  simulationParams: BusinessModelSimulationParams;
  projections: RevenueProjections | null;
  breakEven: BreakEvenAnalysis | null;
  
  // Standardized data format (for new UI components)
  standardizedBusinessModel: BusinessModelCanvasData | null;
  standardizedPricing: PricingModel | null;
  standardizedProjections: UIBusinessModelProjections | null;
  
  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  dirty: boolean;
  
  // Actions
  loadBusinessModel: (planId: string) => Promise<void>;
  saveBusinessModel: () => Promise<boolean>;
  updateCanvas: (newCanvas: BusinessModelCanvasData) => void;
  updatePricing: (newPricing: PricingModel) => void;
  updateSimulationParams: (params: Partial<BusinessModelSimulationParams>) => void;
  recalculateProjections: () => void;
}

/**
 * Paramètres de simulation par défaut
 */
const DEFAULT_SIMULATION_PARAMS: BusinessModelSimulationParams = {
  hoursPerWeek: 20,
  newClientsPerMonth: 2,
  hourlyRate: 45,
  packageRate: 1500,
  subscriptionRate: 400,
  yearsProjection: 3,
  monthlyExpenses: 1000,
  initialInvestment: 5000
};

/**
 * Hook pour la gestion du modèle économique
 */
export const useBusinessModel = ({
  planId,
  initialSimulationParams = {},
  autoLoad = true
}: UseBusinessModelParams = {}): UseBusinessModelResult => {
  // Singleton du service
  const businessPlanService = useMemo(() => new BusinessPlanServiceImpl(), []);
  
  // État principal
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [canvas, setCanvas] = useState<BusinessModelCanvasData | null>(null);
  const [pricing, setPricing] = useState<PricingModel | null>(null);
  const [projections, setProjections] = useState<RevenueProjections | null>(null);
  const [breakEven, setBreakEven] = useState<BreakEvenAnalysis | null>(null);
  
  // État composé
  const [simulationParams, setSimulationParams] = useState<BusinessModelSimulationParams>({
    ...DEFAULT_SIMULATION_PARAMS,
    ...initialSimulationParams
  });
  
  // État de l'interface utilisateur
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  
  /**
   * Charge les données du modèle économique à partir du service
   * Enhanced to use standardized interfaces
   */
  const loadBusinessModel = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setError('No business plan ID provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(id);
      
      if (result.success && result.data) {
        // Convert BusinessPlan to BusinessPlanData for backward compatibility
        const businessPlanDataFromService = result.data as any as BusinessPlanData;
        setBusinessPlanData(businessPlanDataFromService);
        
        // Check if standardized data is available
        if (result.data.standardized && 
            result.data.standardized.businessModel && 
            result.data.standardized.pricingModel) {
          // Use standardized data directly
          setCanvas(result.data.standardized.businessModel as BusinessModelCanvasData);
          setPricing(result.data.standardized.pricingModel as PricingModel);
        } else {
          // Transform using adapter if standardized data is not available
          const transformedUI = BusinessModelAdapter.toUI(businessPlanDataFromService);
          setCanvas(transformedUI.canvas);
          setPricing(transformedUI.pricing);
        }
        
        // Calculate projections
        const initialProjections = BusinessModelProjectionsAdapter.calculateRevenueProjections(
          businessPlanDataFromService, 
          simulationParams
        );
        
        const initialBreakEven = BusinessModelProjectionsAdapter.calculateBreakEven(
          simulationParams,
          initialProjections
        );
        
        setProjections(initialProjections);
        setBreakEven(initialBreakEven);
        setDirty(false);
      } else {
        setError(result.error?.message || 'Unknown error while loading data');
      }
    } catch (err) {
      setError(`Loading error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading business model:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService, simulationParams]);
  
  /**
   * Met à jour le modèle économique dans les données du plan d'affaires
   */
  const updateBusinessPlanWithModelData = useCallback((): BusinessPlanData | null => {
    if (!businessPlanData || !canvas || !pricing) return null;
    
    // Utilisation de la méthode standardisée updateServiceWithUIChanges pour mettre à jour les données
    const updatedBusinessPlan = BusinessModelAdapter.updateServiceWithUIChanges(
      businessPlanData,
      {
        canvas,
        pricing
      }
    );
    
    return updatedBusinessPlan;
  }, [businessPlanData, canvas, pricing]);
  
  /**
   * Sauvegarde les modifications du modèle économique
   * Enhanced to use standardized interfaces
   */
  const saveBusinessModel = useCallback(async (): Promise<boolean> => {
    if (!businessPlanData || !canvas || !pricing) {
      setError('No data to save');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Get updated business plan data
      const updatedBusinessPlan = updateBusinessPlanWithModelData();
      
      if (!updatedBusinessPlan) {
        throw new Error('Unable to update business plan data');
      }
      
      // Include standardized data in the update
      const updatedBusinessPlanWithStandardized = {
        ...updatedBusinessPlan,
        standardized: {
          ...(businessPlanData as any).standardized,
          businessModel: canvas,
          pricingModel: pricing
        }
      };
      
      // Use the standardized service method
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlanWithStandardized
      );
      
      if (result.success) {
        // Update local state with the new data
        setBusinessPlanData(updatedBusinessPlanWithStandardized as BusinessPlanData);
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving changes');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving business model:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, canvas, pricing, updateBusinessPlanWithModelData]);
  
  /**
   * Met à jour le canvas du modèle économique
   */
  const updateCanvas = useCallback((newCanvas: BusinessModelCanvasData): void => {
    setCanvas(newCanvas);
    setDirty(true);
  }, []);
  
  /**
   * Met à jour le modèle de tarification
   */
  const updatePricing = useCallback((newPricing: PricingModel): void => {
    setPricing(newPricing);
    setDirty(true);
  }, []);
  
  /**
   * Met à jour les paramètres de simulation et recalcule les projections si demandé
   */
  const updateSimulationParams = useCallback((params: Partial<BusinessModelSimulationParams>): void => {
    setSimulationParams(prevParams => ({
      ...prevParams,
      ...params
    }));
  }, []);
  
  /**
   * Recalcule les projections financières
   */
  const recalculateProjections = useCallback((): void => {
    if (!businessPlanData) return;
    
    try {
      const newProjections = BusinessModelProjectionsAdapter.calculateRevenueProjections(
        businessPlanData,
        simulationParams
      );
      
      const newBreakEven = BusinessModelProjectionsAdapter.calculateBreakEven(
        simulationParams,
        newProjections
      );
      
      setProjections(newProjections);
      setBreakEven(newBreakEven);
    } catch (err) {
      console.error('Erreur lors du calcul des projections:', err);
      setError(`Erreur de calcul: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [businessPlanData, simulationParams]);
  
  // Recalculer les projections lorsque les paramètres de simulation changent
  useEffect(() => {
    recalculateProjections();
  }, [simulationParams, recalculateProjections]);
  
  // Charger automatiquement les données si un planId est fourni
  useEffect(() => {
    if (autoLoad && planId && !businessPlanData) {
      loadBusinessModel(planId);
    }
  }, [autoLoad, planId, businessPlanData, loadBusinessModel]);
  
  // Combine canvas and pricing into a unified business model projection
  const standardizedProjections: UIBusinessModelProjections | null = useMemo(() => {
    if (!projections || !breakEven) return null;
    
    return {
      revenueProjections: projections,
      breakEvenAnalysis: breakEven,
      simulationParams: simulationParams
    };
  }, [projections, breakEven, simulationParams]);

  return {
    // Legacy data format (for backward compatibility)
    businessPlanData,
    canvas,
    pricing,
    simulationParams,
    projections,
    breakEven,
    
    // Standardized data format (for new UI components)
    standardizedBusinessModel: canvas,
    standardizedPricing: pricing,
    standardizedProjections,
    
    // State
    isLoading,
    isSaving,
    error,
    dirty,
    
    // Actions
    loadBusinessModel,
    saveBusinessModel,
    updateCanvas,
    updatePricing,
    updateSimulationParams,
    recalculateProjections
  };
};

export default useBusinessModel;
