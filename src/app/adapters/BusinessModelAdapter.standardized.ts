/**
 * BusinessModelAdapter - Adaptateur pour les données du modèle économique
 * 
 * Version standardisée utilisant les nouvelles interfaces TypeScript.
 * Transforme les données entre le format service (dataModels) et le format UI standardisé.
 * 
 * @version 2.0
 * @standardized true
 */

import { BusinessPlanData, BusinessModelData, HourlyRate, ServicePackage, Subscription } from '../services/interfaces/dataModels';
import { 
  UIBusinessModel,
  UIBusinessModelCanvas,
  UIPricingModel,
  UICanvasItem,
  UIHourlyRateModel,
  UIPackageModel,
  UISubscriptionModel,
  UICustomPricingModel,
  ServiceCanvasItem,
  ServiceHourlyRateModel,
  ServicePackageModel,
  ServiceSubscriptionModel,
  ServiceCustomPricingModel,
  RevenueSourceType
} from '../interfaces/business-model';
import { PriorityLevel } from '../interfaces/common/common-types';

/**
 * Extension de l'interface BusinessModelData pour le modèle étendu avec les éléments du Canvas
 */
interface ExtendedBusinessModelData extends BusinessModelData {
  partners?: Array<ServiceCanvasItem>;
  activities?: Array<ServiceCanvasItem>;
  resources?: Array<ServiceCanvasItem>;
  valuePropositions?: Array<ServiceCanvasItem>;
  customerRelations?: Array<ServiceCanvasItem>;
  channels?: Array<ServiceCanvasItem>;
  segments?: Array<ServiceCanvasItem>;
  costStructure?: Array<ServiceCanvasItem>;
  revenueStreams?: Array<ServiceCanvasItem>;
  customPricing?: Array<ServiceCustomPricingModel>;
}

/**
 * Adaptateur pour le modèle économique
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (UIBusinessModel, etc.).
 */
export class BusinessModelAdapter {
  /**
   * Fusionne deux tableaux en se basant sur l'ID des éléments
   * Si un élément avec le même ID existe dans les deux tableaux, celui du second remplace celui du premier
   * Les éléments uniques des deux tableaux sont conservés
   * 
   * @private
   */
  private static mergeArraysById<T extends { id?: string }>(originalArray: T[], updatedArray: T[]): T[] {
    if (!Array.isArray(originalArray)) {
      originalArray = [];
    }
    
    if (!Array.isArray(updatedArray)) {
      updatedArray = [];
    }
    
    const mergedMap = new Map<string, T>();
    
    // Ajouter tous les éléments originaux
    originalArray.forEach(item => {
      if (item && item.id) {
        mergedMap.set(item.id, item);
      }
    });
    
    // Remplacer ou ajouter les éléments mis à jour
    updatedArray.forEach(item => {
      if (item && item.id) {
        mergedMap.set(item.id, item);
      }
    });
    
    // Convertir la map en tableau
    return Array.from(mergedMap.values());
  }
  
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): UIBusinessModel {
    if (!businessPlanData) {
      return {
        canvas: BusinessModelAdapter._createDefaultCanvas(),
        pricing: BusinessModelAdapter._createDefaultPricing()
      };
    }
    
    return {
      canvas: BusinessModelAdapter.toBusinessModelCanvas(businessPlanData),
      pricing: BusinessModelAdapter.toPricingModel(businessPlanData)
    };
  }
  
  /**
   * Crée un canvas par défaut quand les données sont manquantes
   * @private
   */
  private static _createDefaultCanvas(): UIBusinessModelCanvas {
    return {
      partners: [],
      activities: [],
      resources: [],
      valueProposition: [],
      customerRelations: [],
      channels: [],
      segments: [],
      costStructure: [],
      revenueStreams: []
    };
  }
  
  /**
   * Crée un modèle de tarification par défaut quand les données sont manquantes
   * @private
   */
  private static _createDefaultPricing(): UIPricingModel {
    return {
      hourlyRates: [],
      packages: [],
      subscriptions: [],
      custom: []
    };
  }

  /**
   * Transforme les données du modèle économique du format service vers le format UI Canvas
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données du Business Model Canvas au format UI
   */
  static toBusinessModelCanvas(businessPlanData: BusinessPlanData): UIBusinessModelCanvas {
    if (!businessPlanData) {
      businessPlanData = {} as BusinessPlanData;
    }
    
    const businessModel = !businessPlanData.businessModel 
      ? {} as ExtendedBusinessModelData
      : businessPlanData.businessModel as ExtendedBusinessModelData;
    
    // Transformation des partenaires clés
    const partners: UICanvasItem[] = !businessModel || !businessModel.partners 
      ? [] 
      : businessModel.partners.map(partner => ({
        id: partner.id || `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: partner.name,
        description: !partner.description ? '' : partner.description,
        priority: !partner.priority ? PriorityLevel.MEDIUM 
                                    : BusinessModelAdapter._stringToPriorityLevel(partner.priority)
      }));
    
    // Transformation des activités clés
    const activities: UICanvasItem[] = !businessModel || !businessModel.activities 
      ? [] 
      : businessModel.activities.map(activity => ({
        id: activity.id || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: activity.name,
        description: !activity.description ? '' : activity.description,
        priority: !activity.priority ? PriorityLevel.MEDIUM 
                                     : BusinessModelAdapter._stringToPriorityLevel(activity.priority)
      }));
    
    // Transformation des ressources clés
    const resources: UICanvasItem[] = !businessModel || !businessModel.resources 
      ? [] 
      : businessModel.resources.map(resource => ({
        id: resource.id || `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: resource.name,
        description: !resource.description ? '' : resource.description,
        priority: !resource.priority ? PriorityLevel.MEDIUM 
                                     : BusinessModelAdapter._stringToPriorityLevel(resource.priority)
      }));
    
    // Transformation des propositions de valeur
    const valueProposition: UICanvasItem[] = !businessModel || !businessModel.valuePropositions 
      ? [] 
      : businessModel.valuePropositions.map(value => ({
        id: value.id || `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: value.name,
        description: !value.description ? '' : value.description,
        priority: !value.priority ? PriorityLevel.HIGH 
                                  : BusinessModelAdapter._stringToPriorityLevel(value.priority)
      }));
    
    // Transformation des relations clients
    const customerRelations: UICanvasItem[] = !businessModel || !businessModel.customerRelations 
      ? [] 
      : businessModel.customerRelations.map(relation => ({
        id: relation.id || `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: relation.name,
        description: !relation.description ? '' : relation.description,
        priority: !relation.priority ? PriorityLevel.MEDIUM 
                                     : BusinessModelAdapter._stringToPriorityLevel(relation.priority)
      }));
    
    // Transformation des canaux
    const channels: UICanvasItem[] = !businessModel || !businessModel.channels 
      ? [] 
      : businessModel.channels.map(channel => ({
        id: channel.id || `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: channel.name,
        description: !channel.description ? '' : channel.description,
        priority: !channel.priority ? PriorityLevel.MEDIUM 
                                    : BusinessModelAdapter._stringToPriorityLevel(channel.priority)
      }));
    
    // Transformation des segments clients
    const segments: UICanvasItem[] = !businessModel || !businessModel.segments 
      ? [] 
      : businessModel.segments.map(segment => ({
        id: segment.id || `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: segment.name,
        description: !segment.description ? '' : segment.description,
        priority: !segment.priority ? PriorityLevel.HIGH 
                                    : BusinessModelAdapter._stringToPriorityLevel(segment.priority)
      }));
    
    // Transformation des structures de coûts
    const costStructure: UICanvasItem[] = !businessModel || !businessModel.costStructure 
      ? [] 
      : businessModel.costStructure.map(cost => ({
        id: cost.id || `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: cost.name,
        description: !cost.description ? '' : cost.description,
        priority: !cost.priority ? PriorityLevel.MEDIUM 
                                 : BusinessModelAdapter._stringToPriorityLevel(cost.priority)
      }));
    
    // Transformation des sources de revenus
    const revenueStreams: UICanvasItem[] = !businessModel || !businessModel.revenueStreams 
      ? [] 
      : businessModel.revenueStreams.map(stream => ({
        id: stream.id || `revenue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: stream.name,
        description: !stream.description ? '' : stream.description,
        priority: !stream.priority ? PriorityLevel.HIGH 
                                   : BusinessModelAdapter._stringToPriorityLevel(stream.priority)
      }));
    
    return {
      partners,
      activities,
      resources,
      valueProposition,
      customerRelations,
      channels,
      segments,
      costStructure,
      revenueStreams
    };
  }

  /**
   * Transforme les modèles de tarification du format service vers le format UI
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Modèle de tarification au format UI
   */
  static toPricingModel(businessPlanData: BusinessPlanData): UIPricingModel {
    if (!businessPlanData) {
      businessPlanData = {} as BusinessPlanData;
    }
    
    const businessModel = !businessPlanData.businessModel 
      ? {} as ExtendedBusinessModelData
      : businessPlanData.businessModel as ExtendedBusinessModelData;
    
    // Transformation des tarifs horaires
    const hourlyRates: UIHourlyRateModel[] = !businessModel || !businessModel.hourlyRates 
      ? [] 
      : businessModel.hourlyRates.map(rate => ({
        id: !rate.id ? `hourly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : rate.id,
        title: rate.serviceType || '',
        description: '',
        ratePerHour: rate.rate,
        currency: !rate.currency ? '€' : rate.currency,
        specialConditions: undefined,
        minHours: undefined
      }));
    
    // Transformation des forfaits
    const packages: UIPackageModel[] = !businessModel || !businessModel.packages 
      ? [] 
      : businessModel.packages.map(pkg => ({
        id: !pkg.id ? `package-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : pkg.id,
        title: pkg.name,
        description: !pkg.description ? '' : pkg.description,
        price: pkg.price,
        currency: !pkg.currency ? '€' : pkg.currency,
        duration: undefined,
        features: !pkg.services ? [] : pkg.services,
        popular: false
      }));
    
    // Transformation des abonnements
    const subscriptions: UISubscriptionModel[] = !businessModel || !businessModel.subscriptions 
      ? [] 
      : businessModel.subscriptions.map(sub => ({
        id: !sub.id ? `subscription-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : sub.id,
        title: sub.name,
        description: !sub.description ? '' : sub.description,
        monthlyPrice: sub.monthlyPrice,
        currency: !sub.currency ? '€' : sub.currency,
        billingFrequency: 'monthly',
        features: !sub.features ? [] : sub.features
      }));
    
    // Transformation des tarifications personnalisées
    const custom: UICustomPricingModel[] = !businessModel || !businessModel.customPricing 
      ? [] 
      : businessModel.customPricing.map(pricing => ({
        id: !pricing.id ? `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : pricing.id,
        title: !pricing.name ? '' : pricing.name,
        description: !pricing.description ? '' : pricing.description,
        priceRange: {
          min: !pricing.minPrice ? 0 : pricing.minPrice,
          max: !pricing.maxPrice ? 0 : pricing.maxPrice
        },
        currency: !pricing.currency ? '€' : pricing.currency,
        factors: !pricing.pricingFactors ? [] : pricing.pricingFactors
      }));
    
    return {
      hourlyRates,
      packages,
      subscriptions,
      custom
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service (partiel BusinessPlanData)
   */
  static toService(uiData: UIBusinessModel): Partial<BusinessPlanData> {
    if (!uiData) return {};

    const result: Partial<BusinessPlanData> = {
      businessModel: {} as BusinessModelData
    };

    // Transformer le canvas si présent
    if (uiData.canvas) {
      const extendedModel = result.businessModel as ExtendedBusinessModelData;
      Object.assign(extendedModel, BusinessModelAdapter.canvasToService(uiData.canvas));
    }

    // Transformer le pricing si présent
    if (uiData.pricing) {
      const pricingData = BusinessModelAdapter.pricingToService(uiData.pricing);
      Object.assign(result.businessModel, pricingData);
    }

    return result;
  }

  /**
   * Transforme le canvas UI en format service
   * @param canvas Données du canvas UI
   * @returns Données du canvas au format service
   */
  static canvasToService(canvas: UIBusinessModelCanvas): Partial<ExtendedBusinessModelData> {
    if (!canvas) return {};

    return {
      partners: BusinessModelAdapter.canvasItemsToService(canvas.partners, 'partner'),
      activities: BusinessModelAdapter.canvasItemsToService(canvas.activities, 'activity'),
      resources: BusinessModelAdapter.canvasItemsToService(canvas.resources, 'resource'),
      valuePropositions: BusinessModelAdapter.canvasItemsToService(canvas.valueProposition, 'value'),
      customerRelations: BusinessModelAdapter.canvasItemsToService(canvas.customerRelations, 'relation'),
      channels: BusinessModelAdapter.canvasItemsToService(canvas.channels, 'channel'),
      segments: BusinessModelAdapter.canvasItemsToService(canvas.segments, 'segment'),
      costStructure: BusinessModelAdapter.canvasItemsToService(canvas.costStructure, 'cost'),
      revenueStreams: BusinessModelAdapter.canvasItemsToService(canvas.revenueStreams, 'revenue')
    };
  }

  /**
   * Transforme les éléments de canvas UI en format service
   * @param items Éléments de canvas
   * @param defaultPriority Priorité par défaut
   * @returns Éléments au format service
   */
  static canvasItemsToService(items: UICanvasItem[], defaultPriority: string = 'medium'): ServiceCanvasItem[] {
    if (!items || !Array.isArray(items)) return [];

    return items.map(item => ({
      id: item.id,
      name: !item.name ? '' : item.name,
      description: !item.description ? '' : item.description,
      priority: !item.priority 
        ? defaultPriority 
        : BusinessModelAdapter._priorityLevelToString(item.priority)
    }));
  }

  /**
   * Transforme les modèles de tarification UI en format service
   * @param pricing Données de tarification UI
   * @returns Données de tarification au format service
   */
  static pricingToService(pricing: UIPricingModel): Partial<BusinessModelData> {
    if (!pricing) return {};

    return {
      hourlyRates: BusinessModelAdapter.hourlyRatesToService(pricing.hourlyRates),
      packages: BusinessModelAdapter.packagesToService(pricing.packages),
      subscriptions: BusinessModelAdapter.subscriptionsToService(pricing.subscriptions),
      // Les customPricing seront ajoutées à ExtendedBusinessModelData
    } as Partial<BusinessModelData>;
  }

  /**
   * Transforme les tarifs horaires UI en format service
   * @param rates Tarifs horaires UI
   * @returns Tarifs horaires au format service
   */
  static hourlyRatesToService(rates: UIHourlyRateModel[]): HourlyRate[] {
    if (!rates || !Array.isArray(rates)) return [];

    return rates.map(rate => ({
      id: rate.id,
      serviceType: rate.title,
      rate: rate.ratePerHour,
      currency: rate.currency
    }));
  }

  /**
   * Transforme les forfaits UI en format service
   * @param packages Forfaits UI
   * @returns Forfaits au format service
   */
  static packagesToService(packages: UIPackageModel[]): ServicePackage[] {
    if (!packages || !Array.isArray(packages)) return [];

    return packages.map(pkg => ({
      id: pkg.id,
      name: pkg.title,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      services: pkg.features || []
    }));
  }

  /**
   * Transforme les abonnements UI en format service
   * @param subscriptions Abonnements UI
   * @returns Abonnements au format service
   */
  static subscriptionsToService(subscriptions: UISubscriptionModel[]): Subscription[] {
    if (!subscriptions || !Array.isArray(subscriptions)) return [];

    return subscriptions.map(sub => ({
      id: sub.id,
      name: sub.title,
      description: sub.description,
      monthlyPrice: sub.monthlyPrice,
      currency: sub.currency,
      features: sub.features || []
    }));
  }

  /**
   * Transforme les tarifications personnalisées UI en format service
   * @param customPricing Tarifications personnalisées UI
   * @returns Tarifications personnalisées au format service
   */
  static customPricingToService(customPricing: UICustomPricingModel[]): ServiceCustomPricingModel[] {
    if (!customPricing || !Array.isArray(customPricing)) return [];

    return customPricing.map(custom => ({
      id: custom.id,
      name: custom.title,
      description: custom.description,
      minPrice: custom.priceRange?.min || 0,
      maxPrice: custom.priceRange?.max || 0,
      currency: custom.currency,
      pricingFactors: custom.factors || []
    }));
  }

  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * Méthode clé pour les mises à jour partielles qui préserve les données non modifiées
   * 
   * @param businessPlanData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: Partial<UIBusinessModel>
  ): BusinessPlanData {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;

    // Créer une copie pour éviter des modifications directes
    const result = { ...businessPlanData };

    // S'assurer que businessModel existe
    if (!result.businessModel) {
      result.businessModel = {} as BusinessModelData;
    }

    // Mise à jour du canvas si présent dans les changements
    if (uiChanges.canvas) {
      const extendedModel = result.businessModel as ExtendedBusinessModelData;
      
      // Mise à jour des partenaires
      if (uiChanges.canvas.partners) {
        extendedModel.partners = BusinessModelAdapter.mergeArraysById(
          !extendedModel.partners ? [] : extendedModel.partners,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.partners, 'partner')
        );
      }
      
      // Mise à jour des activités
      if (uiChanges.canvas.activities) {
        extendedModel.activities = BusinessModelAdapter.mergeArraysById(
          !extendedModel.activities ? [] : extendedModel.activities,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.activities, 'activity')
        );
      }
      
      // Mise à jour des ressources
      if (uiChanges.canvas.resources) {
        extendedModel.resources = BusinessModelAdapter.mergeArraysById(
          !extendedModel.resources ? [] : extendedModel.resources,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.resources, 'resource')
        );
      }
      
      // Mise à jour des propositions de valeur
      if (uiChanges.canvas.valueProposition) {
        extendedModel.valuePropositions = BusinessModelAdapter.mergeArraysById(
          !extendedModel.valuePropositions ? [] : extendedModel.valuePropositions,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.valueProposition, 'value')
        );
      }
      
      // Mise à jour des relations clients
      if (uiChanges.canvas.customerRelations) {
        extendedModel.customerRelations = BusinessModelAdapter.mergeArraysById(
          !extendedModel.customerRelations ? [] : extendedModel.customerRelations,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.customerRelations, 'relation')
        );
      }
      
      // Mise à jour des canaux
      if (uiChanges.canvas.channels) {
        extendedModel.channels = BusinessModelAdapter.mergeArraysById(
          !extendedModel.channels ? [] : extendedModel.channels,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.channels, 'channel')
        );
      }
      
      // Mise à jour des segments clients
      if (uiChanges.canvas.segments) {
        extendedModel.segments = BusinessModelAdapter.mergeArraysById(
          !extendedModel.segments ? [] : extendedModel.segments,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.segments, 'segment')
        );
      }
      
      // Mise à jour des structures de coûts
      if (uiChanges.canvas.costStructure) {
        extendedModel.costStructure = BusinessModelAdapter.mergeArraysById(
          !extendedModel.costStructure ? [] : extendedModel.costStructure,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.costStructure, 'cost')
        );
      }
      
      // Mise à jour des sources de revenus
      if (uiChanges.canvas.revenueStreams) {
        extendedModel.revenueStreams = BusinessModelAdapter.mergeArraysById(
          !extendedModel.revenueStreams ? [] : extendedModel.revenueStreams,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.revenueStreams, 'revenue')
        );
      }
    }
    
    // Mise à jour du pricing si présent dans les changements
    if (uiChanges.pricing) {
      // Mise à jour des tarifs horaires
      if (uiChanges.pricing.hourlyRates) {
        result.businessModel.hourlyRates = BusinessModelAdapter.mergeArraysById(
          !result.businessModel.hourlyRates ? [] : result.businessModel.hourlyRates,
          BusinessModelAdapter.hourlyRatesToService(uiChanges.pricing.hourlyRates)
        );
      }
      
      // Mise à jour des forfaits
      if (uiChanges.pricing.packages) {
        result.businessModel.packages = BusinessModelAdapter.mergeArraysById(
          !result.businessModel.packages ? [] : result.businessModel.packages,
          BusinessModelAdapter.packagesToService(uiChanges.pricing.packages)
        );
      }
      
      // Mise à jour des abonnements
      if (uiChanges.pricing.subscriptions) {
        result.businessModel.subscriptions = BusinessModelAdapter.mergeArraysById(
          !result.businessModel.subscriptions ? [] : result.businessModel.subscriptions,
          BusinessModelAdapter.subscriptionsToService(uiChanges.pricing.subscriptions)
        );
      }
      
      // Mise à jour des tarifications personnalisées
      if (uiChanges.pricing.custom) {
        const extendedModel = result.businessModel as ExtendedBusinessModelData;
        extendedModel.customPricing = BusinessModelAdapter.mergeArraysById(
          !extendedModel.customPricing ? [] : extendedModel.customPricing,
          BusinessModelAdapter.customPricingToService(uiChanges.pricing.custom)
        );
      }
    }

    return result;
  }

  /**
   * Convertit une chaîne de priorité en énumération PriorityLevel
   * @private
   */
  private static _stringToPriorityLevel(priority: string): PriorityLevel {
    switch(priority.toLowerCase()) {
      case 'high':
        return PriorityLevel.HIGH;
      case 'low':
        return PriorityLevel.LOW;
      case 'urgent':
        return PriorityLevel.URGENT;
      default:
        return PriorityLevel.MEDIUM;
    }
  }
  
  /**
   * Convertit une énumération PriorityLevel en chaîne de priorité
   * @private
   */
  private static _priorityLevelToString(priority: PriorityLevel): string {
    switch(priority) {
      case PriorityLevel.HIGH:
        return 'high';
      case PriorityLevel.LOW:
        return 'low';
      case PriorityLevel.URGENT:
        return 'urgent';
      default:
        return 'medium';
    }
  }

  /**
   * @deprecated Utiliser toBusinessModelCanvas à la place
   */
  static transformToBusinessModelCanvas(businessPlanData: BusinessPlanData): UIBusinessModelCanvas {
    console.warn('BusinessModelAdapter: transformToBusinessModelCanvas est déprécié, utiliser toBusinessModelCanvas à la place');
    return BusinessModelAdapter.toBusinessModelCanvas(businessPlanData);
  }

  /**
   * @deprecated Utiliser toPricingModel à la place
   */
  static transformToPricingModel(businessPlanData: BusinessPlanData): UIPricingModel {
    console.warn('BusinessModelAdapter: transformToPricingModel est déprécié, utiliser toPricingModel à la place');
    return BusinessModelAdapter.toPricingModel(businessPlanData);
  }
}

// Export par défaut pour la compatibilité avec le code existant
export default BusinessModelAdapter;