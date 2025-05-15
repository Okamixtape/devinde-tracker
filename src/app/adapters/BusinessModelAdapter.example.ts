/**
 * BusinessModelAdapter - Adaptateur pour les données du modèle économique
 * 
 * Exemple de mise à jour pour utiliser les interfaces standardisées
 * 
 * @version 2.0
 * @standardized true
 */

import { BusinessPlanData } from '../services/interfaces/dataModels';
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
  PriorityLevel
} from '../interfaces';

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
      ? {} as any 
      : businessPlanData.businessModel;
    
    // Transformation des partenaires clés
    const partners: UICanvasItem[] = !businessModel || !businessModel.partners 
      ? [] 
      : businessModel.partners.map(partner => ({
        id: partner.id || `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: partner.name,
        description: !partner.description ? '' : partner.description,
        priority: !partner.priority ? PriorityLevel.MEDIUM 
                                    : partner.priority === 'high' ? PriorityLevel.HIGH 
                                    : partner.priority === 'low' ? PriorityLevel.LOW 
                                    : PriorityLevel.MEDIUM
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
    
    // Exemple de transformation pour les autres sections du canvas
    // (Le même pattern est répété pour toutes les sections)
    const resources: UICanvasItem[] = []; // Implementation similaire
    const valueProposition: UICanvasItem[] = []; // Implementation similaire
    const customerRelations: UICanvasItem[] = []; // Implementation similaire
    const channels: UICanvasItem[] = []; // Implementation similaire
    const segments: UICanvasItem[] = []; // Implementation similaire 
    const costStructure: UICanvasItem[] = []; // Implementation similaire
    const revenueStreams: UICanvasItem[] = []; // Implementation similaire
    
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
      ? {} as any 
      : businessPlanData.businessModel;
    
    // Transformation des tarifs horaires
    const hourlyRates: UIHourlyRateModel[] = !businessModel || !businessModel.hourlyRates 
      ? [] 
      : businessModel.hourlyRates.map(rate => ({
        id: !rate.id ? `hourly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : rate.id,
        title: rate.name || rate.serviceType,
        description: !rate.description ? '' : rate.description,
        ratePerHour: rate.amount || rate.rate,
        currency: !rate.currency ? '€' : rate.currency,
        specialConditions: rate.conditions,
        minHours: rate.minimumHours
      }));
    
    // Autres transformations (packages, subscriptions, custom pricing)
    // suivent le même pattern
    
    return {
      hourlyRates,
      packages: [], // Implementation similaire à hourlyRates
      subscriptions: [], // Implementation similaire
      custom: [] // Implementation similaire
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
      businessModel: {} as any
    };

    // Transformer le canvas si présent
    if (uiData.canvas) {
      result.businessModel = {
        ...result.businessModel,
        ...BusinessModelAdapter.canvasToService(uiData.canvas)
      };
    }

    // Transformer le pricing si présent
    if (uiData.pricing) {
      result.businessModel = {
        ...result.businessModel,
        ...BusinessModelAdapter.pricingToService(uiData.pricing)
      };
    }

    return result;
  }

  /**
   * Transforme le canvas UI en format service
   * @param canvas Données du canvas UI
   * @returns Données du canvas au format service
   */
  static canvasToService(canvas: UIBusinessModelCanvas): Partial<any> {
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
  static pricingToService(pricing: UIPricingModel): Partial<any> {
    if (!pricing) return {};

    return {
      hourlyRates: BusinessModelAdapter.hourlyRatesToService(pricing.hourlyRates),
      packages: BusinessModelAdapter.packagesToService(pricing.packages),
      subscriptions: BusinessModelAdapter.subscriptionsToService(pricing.subscriptions),
      customPricing: BusinessModelAdapter.customPricingToService(pricing.custom)
    };
  }

  /**
   * Transforme les tarifs horaires UI en format service
   * @param rates Tarifs horaires UI
   * @returns Tarifs horaires au format service
   */
  static hourlyRatesToService(rates: UIHourlyRateModel[]): ServiceHourlyRateModel[] {
    if (!rates || !Array.isArray(rates)) return [];

    return rates.map(rate => ({
      id: rate.id,
      serviceType: rate.title,
      name: rate.title,
      rate: rate.ratePerHour, 
      amount: rate.ratePerHour, // Pour compatibilité
      currency: rate.currency,
      description: rate.description,
      minimumHours: rate.minHours,
      conditions: rate.specialConditions
    }));
  }

  // Autres méthodes de transformation (packages, subscriptions, custom pricing)
  // Méthode updateServiceWithUIChanges
  // Méthodes dépréciées pour compatibilité

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
      result.businessModel = {} as any;
    }

    // Exemple de mise à jour du canvas (simplifié)
    if (uiChanges.canvas) {
      if (uiChanges.canvas.partners) {
        const servicePartners = BusinessModelAdapter.canvasItemsToService(
          uiChanges.canvas.partners, 'partner'
        );
        result.businessModel.partners = BusinessModelAdapter.mergeArraysById(
          !result.businessModel || !result.businessModel.partners 
            ? [] 
            : result.businessModel.partners,
          servicePartners
        );
      }
      
      // Autres sections du canvas (activités, ressources, etc.)
    }
    
    // Mise à jour du pricing (simplifié)
    if (uiChanges.pricing) {
      if (uiChanges.pricing.hourlyRates) {
        const serviceRates = BusinessModelAdapter.hourlyRatesToService(
          uiChanges.pricing.hourlyRates
        );
        result.businessModel.hourlyRates = BusinessModelAdapter.mergeArraysById(
          !result.businessModel || !result.businessModel.hourlyRates 
            ? [] 
            : result.businessModel.hourlyRates,
          serviceRates
        );
      }
      
      // Autres parties du pricing (packages, subscriptions, custom)
    }

    return result;
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