/**
 * ServiceCatalogAdapter - Adaptateur pour les données du catalogue de services
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (interfaces/services).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData } from '../../services/interfaces/dataModels';
import {
  Service,
  ServiceType,
  PricingType,
  ServiceCategory,
  UIServiceListItem,
  UIService,
  UIServiceCatalog,
  ServiceCatalogServiceData,
  HourlyPricedService,
  FixedPricedService,
  RecurringPricedService,
  CustomPricedService
} from '../../interfaces/services/service-catalog';

/**
 * Adaptateur pour le catalogue de services
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (UIServiceCatalog, UIService, etc.).
 */
export class ServiceCatalogAdapter {
  /**
   * Génère un ID unique pour un nouveau service
   * @private
   */
  private static _generateServiceId(): string {
    return `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crée une structure vide pour un catalogue de services
   * @private
   */
  private static _createEmptyServiceCatalog(): ServiceCatalogServiceData {
    return {
      services: [],
      categories: [],
      businessPlanId: ''
    };
  }

  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(serviceData: ServiceCatalogServiceData | null | undefined): UIServiceCatalog {
    if (!serviceData) {
      return {
        services: [],
        categories: [],
        stats: {
          activeServicesCount: 0,
          categoriesCount: 0
        }
      };
    }

    // Transformer les services en format liste pour l'UI
    const services: UIServiceListItem[] = serviceData.services.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      category: service.category,
      pricingType: service.pricingType,
      price: ServiceCatalogAdapter._formatPriceForDisplay(service),
      isActive: service.isActive
    }));

    // Calculer les statistiques
    const activeServices = serviceData.services.filter(s => s.isActive);
    const hourlyServices = activeServices.filter(s => s.pricingType === PricingType.HOURLY) as HourlyPricedService[];
    
    const stats = {
      activeServicesCount: activeServices.length,
      categoriesCount: serviceData.categories.length,
      averageHourlyRate: hourlyServices.length > 0
        ? hourlyServices.reduce((sum, s) => sum + s.hourlyRate, 0) / hourlyServices.length
        : undefined
    };

    return {
      services,
      categories: serviceData.categories,
      stats
    };
  }

  /**
   * Transforme un service individuel du format service vers le format UI pour édition
   * 
   * @param service Service provenant du service
   * @returns Service formaté pour l'UI
   */
  static serviceToUI(service: Service): UIService {
    // Créer l'objet de pricing en fonction du type
    let pricing: UIService['pricing'] = {
      type: service.pricingType
    };

    // Ajouter les champs spécifiques en fonction du type de tarification
    switch (service.pricingType) {
      case PricingType.HOURLY:
        pricing.hourlyRate = (service as HourlyPricedService).hourlyRate;
        break;
      case PricingType.FIXED:
        pricing.fixedPrice = (service as FixedPricedService).price;
        break;
      case PricingType.RECURRING:
        pricing.recurringPrice = (service as RecurringPricedService).price;
        break;
      case PricingType.CUSTOM:
        pricing.priceRange = (service as CustomPricedService).priceRange;
        break;
    }

    // Créer l'objet UI sans les champs createdAt et updatedAt
    const { createdAt, updatedAt, ...serviceWithoutDates } = service;

    return {
      ...serviceWithoutDates,
      pricing
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @param businessPlanId ID du plan d'affaires
   * @returns Données formatées pour le service
   */
  static toService(uiData: UIServiceCatalog, businessPlanId: string): ServiceCatalogServiceData {
    // Si les données UI sont nulles ou vides, retourner un catalogue vide
    if (!uiData || !uiData.services) {
      return ServiceCatalogAdapter._createEmptyServiceCatalog();
    }

    // Transformations basiques sans logique complexe pour l'instant
    return {
      services: [], // Les services complets ne sont pas dans UIServiceCatalog, il faudrait les récupérer individuellement
      categories: uiData.categories || [],
      businessPlanId
    };
  }

  /**
   * Transforme un service individuel du format UI vers le format service
   * 
   * @param uiService Service provenant de l'UI
   * @returns Service formaté pour le service
   */
  static uiServiceToService(uiService: UIService): Service {
    const now = new Date().toISOString();
    const baseService: Omit<BaseService, 'pricingType'> = {
      id: uiService.id || ServiceCatalogAdapter._generateServiceId(),
      name: uiService.name,
      description: uiService.description,
      type: uiService.type,
      category: uiService.category,
      tags: uiService.tags,
      isActive: uiService.isActive,
      createdAt: now,
      updatedAt: now
    };

    // Créer le service final en fonction du type de tarification
    switch (uiService.pricing.type) {
      case PricingType.HOURLY:
        return {
          ...baseService,
          pricingType: PricingType.HOURLY,
          hourlyRate: uiService.pricing.hourlyRate || 0,
          minimumHours: uiService.minimumHours,
          discountThresholds: (uiService as any).discountThresholds
        } as HourlyPricedService;

      case PricingType.FIXED:
        return {
          ...baseService,
          pricingType: PricingType.FIXED,
          price: uiService.pricing.fixedPrice || 0,
          estimatedHours: (uiService as any).estimatedHours,
          deliverables: (uiService as any).deliverables || [],
          estimatedTimeframe: (uiService as any).estimatedTimeframe
        } as FixedPricedService;

      case PricingType.RECURRING:
        return {
          ...baseService,
          pricingType: PricingType.RECURRING,
          price: uiService.pricing.recurringPrice || 0,
          billingCycle: (uiService as any).billingCycle || 'monthly',
          minimumCommitment: (uiService as any).minimumCommitment,
          includedItems: (uiService as any).includedItems || []
        } as RecurringPricedService;

      case PricingType.CUSTOM:
        return {
          ...baseService,
          pricingType: PricingType.CUSTOM,
          priceRange: uiService.pricing.priceRange,
          pricingFactors: (uiService as any).pricingFactors || [],
          requiresConsultation: (uiService as any).requiresConsultation || false
        } as CustomPricedService;

      default:
        throw new Error(`Type de tarification non supporté: ${uiService.pricing.type}`);
    }
  }

  /**
   * Extrait le catalogue de services à partir des données d'un plan d'affaires
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données du catalogue de services
   */
  static extractFromBusinessPlan(businessPlanData: BusinessPlanData): ServiceCatalogServiceData {
    if (!businessPlanData) {
      return ServiceCatalogAdapter._createEmptyServiceCatalog();
    }

    // Pour l'instant, cette méthode est un emplacement pour extraire les données
    // du modèle de plan d'affaires existant. Dans une version ultérieure,
    // cette logique pourrait être adaptée au format des données réel.
    
    return {
      services: [], // À implémenter selon la structure de businessPlanData
      categories: [], // À implémenter selon la structure de businessPlanData
      businessPlanId: businessPlanData.id || ''
    };
  }

  /**
   * Met à jour le plan d'affaires avec les données du catalogue de services
   * 
   * @param businessPlanData Données du plan d'affaires
   * @param serviceCatalog Données du catalogue de services
   * @returns Plan d'affaires mis à jour
   */
  static updateBusinessPlanWithServiceCatalog(
    businessPlanData: BusinessPlanData,
    serviceCatalog: ServiceCatalogServiceData
  ): BusinessPlanData {
    if (!businessPlanData) {
      return {} as BusinessPlanData;
    }

    // Créer une copie des données du plan d'affaires
    const updatedBusinessPlan = { ...businessPlanData };

    // Mettre à jour les données de services du plan d'affaires
    // Cette logique sera adaptée au format réel des données dans la prochaine version
    
    // Assurer que l'objet services existe
    if (!updatedBusinessPlan.services) {
      updatedBusinessPlan.services = {};
    }

    // Stocker également des données dans un format standardisé
    if (!updatedBusinessPlan.standardized) {
      updatedBusinessPlan.standardized = {};
    }

    updatedBusinessPlan.standardized.serviceCatalog = serviceCatalog;

    return updatedBusinessPlan;
  }

  /**
   * Formate le prix d'un service pour l'affichage
   * @private
   */
  private static _formatPriceForDisplay(service: Service): string {
    switch (service.pricingType) {
      case PricingType.HOURLY:
        return `${(service as HourlyPricedService).hourlyRate}€/h`;
      
      case PricingType.FIXED:
        return `${(service as FixedPricedService).price}€`;
      
      case PricingType.RECURRING:
        const recurringService = service as RecurringPricedService;
        return `${recurringService.price}€/${
          recurringService.billingCycle === 'monthly' ? 'mois' :
          recurringService.billingCycle === 'quarterly' ? 'trim.' :
          recurringService.billingCycle === 'annually' ? 'an' : 'période'
        }`;
      
      case PricingType.CUSTOM:
        const customService = service as CustomPricedService;
        return customService.priceRange 
          ? `${customService.priceRange.min}-${customService.priceRange.max}€` 
          : 'Sur devis';
      
      default:
        return 'Prix non défini';
    }
  }
}

export default ServiceCatalogAdapter;