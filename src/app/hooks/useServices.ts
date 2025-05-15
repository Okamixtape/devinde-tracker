/**
 * useServices - Hook React pour la gestion des services
 * 
 * Ce hook encapsule toute la logique nécessaire pour interagir avec les services,
 * incluant le chargement des données, les transformations via adaptateurs,
 * et les opérations de mise à jour.
 * 
 * @module hooks/useServices
 * @version 1.0
 * @standardized true
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessPlanServiceImpl } from '../services/core/businessPlanService';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import ServiceCatalogAdapter from '../adapters/services/ServiceCatalogAdapter';
import AvailabilityAdapter from '../adapters/services/AvailabilityAdapter';
import {
  Service,
  UIService,
  UIServiceListItem,
  UIServiceCatalog,
  ServiceCategory,
  ServiceCatalogServiceData
} from '../interfaces/services/service-catalog';
import {
  UIAvailabilitySettings,
  UIDateRangeAvailability,
  WeeklyAvailabilityRule,
  DateRangeAvailabilityRule,
  BlockedTimeSlot,
  ServiceAvailabilityData
} from '../interfaces/services/availability';

/**
 * Paramètres du hook
 */
interface UseServicesParams {
  planId?: string;
  autoLoad?: boolean;
}

/**
 * Résultat du hook
 */
interface UseServicesResult {
  // Données
  businessPlanData: BusinessPlanData | null;
  serviceCatalog: UIServiceCatalog | null;
  availabilitySettings: UIAvailabilitySettings | null;
  
  // États
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  dirty: boolean;
  
  // Actions pour le catalogue de services
  loadServiceCatalog: (planId: string) => Promise<void>;
  saveService: (service: UIService) => Promise<boolean>;
  deleteService: (serviceId: string) => Promise<boolean>;
  saveCategory: (category: ServiceCategory) => Promise<boolean>;
  
  // Actions pour la disponibilité
  loadAvailabilitySettings: (planId: string) => Promise<void>;
  saveAvailabilitySettings: (settings: UIAvailabilitySettings) => Promise<boolean>;
  updateAvailabilityRule: (rule: WeeklyAvailabilityRule | DateRangeAvailabilityRule) => Promise<boolean>;
  addBlockedPeriod: (period: BlockedTimeSlot) => Promise<boolean>;
  deleteBlockedPeriod: (periodId: string) => Promise<boolean>;
  getAvailability: (startDate: string, endDate: string) => Promise<UIDateRangeAvailability>;
}

/**
 * Hook pour la gestion des services
 */
export const useServices = ({
  planId,
  autoLoad = false
}: UseServicesParams = {}): UseServicesResult => {
  // Singleton du service
  const businessPlanService = useMemo(() => new BusinessPlanServiceImpl(), []);
  
  // État principal
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [serviceCatalog, setServiceCatalog] = useState<UIServiceCatalog | null>(null);
  const [availabilitySettings, setAvailabilitySettings] = useState<UIAvailabilitySettings | null>(null);
  
  // État de l'interface utilisateur
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  
  /**
   * Charge les données du catalogue de services à partir du service
   */
  const loadServiceCatalog = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setError('No business plan ID provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(id);
      
      if (result.success && result.data) {
        // Convertir BusinessPlan to BusinessPlanData pour backward compatibility
        const businessPlanDataFromService = result.data as any as BusinessPlanData;
        setBusinessPlanData(businessPlanDataFromService);
        
        // Extraire le catalogue de services
        const serviceData = ServiceCatalogAdapter.extractFromBusinessPlan(businessPlanDataFromService);
        
        // Transformer en format UI
        const uiServiceCatalog = ServiceCatalogAdapter.toUI(serviceData);
        setServiceCatalog(uiServiceCatalog);
        
        setDirty(false);
      } else {
        setError(result.error?.message || 'Unknown error while loading data');
      }
    } catch (err) {
      setError(`Loading error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading service catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Charge les paramètres de disponibilité à partir du service
   */
  const loadAvailabilitySettings = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setError('No business plan ID provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(id);
      
      if (result.success && result.data) {
        // Convertir BusinessPlan to BusinessPlanData pour backward compatibility
        const businessPlanDataFromService = result.data as any as BusinessPlanData;
        setBusinessPlanData(businessPlanDataFromService);
        
        // Extraire les paramètres de disponibilité
        const availabilityData = AvailabilityAdapter.extractFromBusinessPlan(businessPlanDataFromService);
        
        // Transformer en format UI
        const uiAvailabilitySettings = AvailabilityAdapter.toUI(availabilityData);
        setAvailabilitySettings(uiAvailabilitySettings);
        
        setDirty(false);
      } else {
        setError(result.error?.message || 'Unknown error while loading data');
      }
    } catch (err) {
      setError(`Loading error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading availability settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService]);
  
  /**
   * Calcule les disponibilités pour une plage de dates
   */
  const getAvailability = useCallback(async (startDate: string, endDate: string): Promise<UIDateRangeAvailability> => {
    if (!businessPlanData) {
      throw new Error('Business plan data not loaded');
    }
    
    try {
      // Extraire les paramètres de disponibilité
      const availabilityData = AvailabilityAdapter.extractFromBusinessPlan(businessPlanData);
      
      // Calculer les disponibilités
      const availabilityResult = AvailabilityAdapter.calculateAvailability(
        availabilityData,
        startDate,
        endDate
      );
      
      return {
        startDate,
        endDate,
        days: availabilityResult.availableDays,
        summary: {
          totalAvailableHours: availabilityResult.availableDays.reduce((sum, day) => sum + day.availableHours, 0),
          fullyAvailableDays: availabilityResult.availableDays.filter(day => day.status === 'available').length,
          partiallyAvailableDays: availabilityResult.availableDays.filter(day => day.status === 'partially_available').length,
          unavailableDays: availabilityResult.availableDays.filter(day => day.status === 'unavailable' || day.status === 'holiday').length
        }
      };
    } catch (err) {
      throw new Error(`Failed to calculate availability: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [businessPlanData]);
  
  /**
   * Sauvegarde un service
   */
  const saveService = useCallback(async (service: UIService): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire le catalogue de services actuel
      const currentServiceData = ServiceCatalogAdapter.extractFromBusinessPlan(businessPlanData);
      
      // Convertir le service UI en service pour le service
      const serviceForService = ServiceCatalogAdapter.uiServiceToService(service);
      
      // Mettre à jour la liste des services
      let services = [...currentServiceData.services];
      
      if (service.id) {
        // Mettre à jour un service existant
        const index = services.findIndex(s => s.id === service.id);
        if (index !== -1) {
          services[index] = serviceForService;
        } else {
          services.push(serviceForService);
        }
      } else {
        // Ajouter un nouveau service
        services.push(serviceForService);
      }
      
      // Créer un nouvel objet de données de service
      const updatedServiceData: ServiceCatalogServiceData = {
        ...currentServiceData,
        services
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = ServiceCatalogAdapter.updateBusinessPlanWithServiceCatalog(
        businessPlanData,
        updatedServiceData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        
        // Mettre à jour le catalogue de services
        const uiServiceCatalog = ServiceCatalogAdapter.toUI(updatedServiceData);
        setServiceCatalog(uiServiceCatalog);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving service');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving service:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Supprime un service
   */
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire le catalogue de services actuel
      const currentServiceData = ServiceCatalogAdapter.extractFromBusinessPlan(businessPlanData);
      
      // Supprimer le service
      const services = currentServiceData.services.filter(s => s.id !== serviceId);
      
      // Créer un nouvel objet de données de service
      const updatedServiceData: ServiceCatalogServiceData = {
        ...currentServiceData,
        services
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = ServiceCatalogAdapter.updateBusinessPlanWithServiceCatalog(
        businessPlanData,
        updatedServiceData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        
        // Mettre à jour le catalogue de services
        const uiServiceCatalog = ServiceCatalogAdapter.toUI(updatedServiceData);
        setServiceCatalog(uiServiceCatalog);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting service');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting service:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Sauvegarde une catégorie
   */
  const saveCategory = useCallback(async (category: ServiceCategory): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire le catalogue de services actuel
      const currentServiceData = ServiceCatalogAdapter.extractFromBusinessPlan(businessPlanData);
      
      // Mettre à jour la liste des catégories
      let categories = [...currentServiceData.categories];
      
      if (category.id) {
        // Mettre à jour une catégorie existante
        const index = categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
          categories[index] = category;
        } else {
          categories.push(category);
        }
      } else {
        // Ajouter une nouvelle catégorie
        categories.push({
          ...category,
          id: `category-${Date.now()}`
        });
      }
      
      // Créer un nouvel objet de données de service
      const updatedServiceData: ServiceCatalogServiceData = {
        ...currentServiceData,
        categories
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = ServiceCatalogAdapter.updateBusinessPlanWithServiceCatalog(
        businessPlanData,
        updatedServiceData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        
        // Mettre à jour le catalogue de services
        const uiServiceCatalog = ServiceCatalogAdapter.toUI(updatedServiceData);
        setServiceCatalog(uiServiceCatalog);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving category');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving category:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Sauvegarde les paramètres de disponibilité
   */
  const saveAvailabilitySettings = useCallback(async (settings: UIAvailabilitySettings): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Convertir les paramètres UI en format service
      const availabilityData: ServiceAvailabilityData = AvailabilityAdapter.toService(
        settings,
        businessPlanData.id || ''
      );
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = AvailabilityAdapter.updateBusinessPlanWithAvailability(
        businessPlanData,
        availabilityData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setAvailabilitySettings(settings);
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving availability settings');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving availability settings:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Met à jour une règle de disponibilité
   */
  const updateAvailabilityRule = useCallback(async (rule: WeeklyAvailabilityRule | DateRangeAvailabilityRule): Promise<boolean> => {
    if (!businessPlanData || !availabilitySettings) {
      setError('No business plan data or availability settings available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Créer une copie des paramètres de disponibilité
      const newSettings: UIAvailabilitySettings = {
        ...availabilitySettings
      };
      
      // Ajouter ou mettre à jour la règle
      if (rule.type === 'weekly') {
        // Générer un ID si nécessaire
        if (!rule.id) {
          rule.id = `weekly-${Date.now()}`;
        }
        
        // Vérifier si la règle existe déjà
        const existingIndex = newSettings.defaultWeeklyRules.findIndex(r => r.id === rule.id);
        if (existingIndex !== -1) {
          // Mettre à jour la règle existante
          newSettings.defaultWeeklyRules[existingIndex] = rule;
        } else {
          // Ajouter une nouvelle règle
          newSettings.defaultWeeklyRules.push(rule);
        }
      } else if (rule.type === 'dateRange') {
        // Générer un ID si nécessaire
        if (!rule.id) {
          rule.id = `dateRange-${Date.now()}`;
        }
        
        // Vérifier si la règle existe déjà
        const existingIndex = newSettings.customRules.findIndex(r => r.id === rule.id);
        if (existingIndex !== -1) {
          // Mettre à jour la règle existante
          newSettings.customRules[existingIndex] = rule;
        } else {
          // Ajouter une nouvelle règle
          newSettings.customRules.push(rule);
        }
      }
      
      // Sauvegarder les paramètres mis à jour
      return await saveAvailabilitySettings(newSettings);
    } catch (err) {
      setError(`Update error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error updating availability rule:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, availabilitySettings, saveAvailabilitySettings]);
  
  /**
   * Ajoute une période bloquée
   */
  const addBlockedPeriod = useCallback(async (period: BlockedTimeSlot): Promise<boolean> => {
    if (!businessPlanData || !availabilitySettings) {
      setError('No business plan data or availability settings available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Créer une copie des paramètres de disponibilité
      const newSettings: UIAvailabilitySettings = {
        ...availabilitySettings
      };
      
      // Générer un ID si nécessaire
      if (!period.id) {
        period.id = `blocked-${Date.now()}`;
      }
      
      // Vérifier si la période existe déjà
      const existingIndex = newSettings.blockedPeriods.findIndex(p => p.id === period.id);
      if (existingIndex !== -1) {
        // Mettre à jour la période existante
        newSettings.blockedPeriods[existingIndex] = period;
      } else {
        // Ajouter une nouvelle période
        newSettings.blockedPeriods.push(period);
      }
      
      // Sauvegarder les paramètres mis à jour
      return await saveAvailabilitySettings(newSettings);
    } catch (err) {
      setError(`Add error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error adding blocked period:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, availabilitySettings, saveAvailabilitySettings]);
  
  /**
   * Supprime une période bloquée
   */
  const deleteBlockedPeriod = useCallback(async (periodId: string): Promise<boolean> => {
    if (!businessPlanData || !availabilitySettings) {
      setError('No business plan data or availability settings available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Créer une copie des paramètres de disponibilité
      const newSettings: UIAvailabilitySettings = {
        ...availabilitySettings,
        blockedPeriods: availabilitySettings.blockedPeriods.filter(p => p.id !== periodId)
      };
      
      // Sauvegarder les paramètres mis à jour
      return await saveAvailabilitySettings(newSettings);
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting blocked period:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, availabilitySettings, saveAvailabilitySettings]);
  
  // Charger automatiquement les données si un planId est fourni
  useEffect(() => {
    if (autoLoad && planId) {
      loadServiceCatalog(planId);
      loadAvailabilitySettings(planId);
    }
  }, [autoLoad, planId, loadServiceCatalog, loadAvailabilitySettings]);
  
  return {
    // Données
    businessPlanData,
    serviceCatalog,
    availabilitySettings,
    
    // États
    isLoading,
    isSaving,
    error,
    dirty,
    
    // Actions pour le catalogue de services
    loadServiceCatalog,
    saveService,
    deleteService,
    saveCategory,
    
    // Actions pour la disponibilité
    loadAvailabilitySettings,
    saveAvailabilitySettings,
    updateAvailabilityRule,
    addBlockedPeriod,
    deleteBlockedPeriod,
    getAvailability
  };
};

export default useServices;