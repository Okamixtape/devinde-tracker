/**
 * BusinessModelAdapter - Adaptateur pour les données du modèle économique
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (BusinessModelInterfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData, BusinessModelData } from '../services/interfaces/dataModels';
import { 
  BusinessModelCanvasData,
  CanvasItem,
  PricingModel,
  HourlyRateModel,
  PackageModel,
  SubscriptionModel
} from '../interfaces/BusinessModelInterfaces';
import { ServiceHourlyRateModel } from '../interfaces/business-model/business-model';

// Extension de l'interface BusinessModelData pour le modèle étendu avec les éléments du Canvas
interface ExtendedBusinessModelData extends BusinessModelData {
  partners?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  activities?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  resources?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  valuePropositions?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  customerRelations?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  channels?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  segments?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  costStructure?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  revenueStreams?: Array<{id?: string; name: string; description?: string; priority?: string}>;
  customPricing?: Array<{id?: string; name: string; description?: string; minPrice?: number; maxPrice?: number; currency?: string; pricingFactors?: string[]}>;
}

/**
 * Adaptateur pour le modèle économique
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (BusinessModelCanvasData, PricingModel, etc.).
 */
/**
 * Adaptateur pour le modèle économique
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (BusinessModelCanvasData, PricingModel, etc.).
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
  static toUI(businessPlanData: BusinessPlanData): { canvas: BusinessModelCanvasData, pricing: PricingModel } {
    if (!businessPlanData) {
      return {
        canvas: BusinessModelAdapter.toBusinessModelCanvas({} as BusinessPlanData),
        pricing: BusinessModelAdapter.toPricingModel({} as BusinessPlanData)
      };
    }
    
    return {
      canvas: BusinessModelAdapter.toBusinessModelCanvas(businessPlanData),
      pricing: BusinessModelAdapter.toPricingModel(businessPlanData)
    };
  }
  
  /**
   * Transforme les données du modèle économique du format service vers le format UI Canvas
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données du Business Model Canvas au format UI
   */
  static toBusinessModelCanvas(businessPlanData: BusinessPlanData): BusinessModelCanvasData {
  if (!businessPlanData) {
    businessPlanData = {} as BusinessPlanData;
  }
  
  const businessModel = !businessPlanData.businessModel 
    ? {} as ExtendedBusinessModelData 
    : businessPlanData.businessModel;
  
  // Transformation des partenaires clés
  const partners: CanvasItem[] = !businessModel || !businessModel.partners 
    ? [] 
    : businessModel.partners.map(partner => ({
      id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: partner.name,
      description: !partner.description ? '' : partner.description,
      priority: !partner.priority ? 'medium' : partner.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des activités clés
  const activities: CanvasItem[] = !businessModel || !businessModel.activities 
    ? [] 
    : businessModel.activities.map(activity => ({
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: activity.name,
      description: !activity.description ? '' : activity.description,
      priority: !activity.priority ? 'medium' : activity.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des ressources clés
  const resources: CanvasItem[] = !businessModel || !businessModel.resources 
    ? [] 
    : businessModel.resources.map(resource => ({
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: resource.name,
      description: !resource.description ? '' : resource.description,
      priority: !resource.priority ? 'medium' : resource.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des propositions de valeur
  const valueProposition: CanvasItem[] = !businessModel || !businessModel.valuePropositions 
    ? [] 
    : businessModel.valuePropositions.map(proposition => ({
      id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: proposition.name,
      description: !proposition.description ? '' : proposition.description,
      priority: !proposition.priority ? 'high' : proposition.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des relations clients
  const customerRelations: CanvasItem[] = !businessModel || !businessModel.customerRelations 
    ? [] 
    : businessModel.customerRelations.map(relation => ({
      id: `relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: relation.name,
      description: !relation.description ? '' : relation.description,
      priority: !relation.priority ? 'medium' : relation.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des canaux
  const channels: CanvasItem[] = !businessModel || !businessModel.channels 
    ? [] 
    : businessModel.channels.map(channel => ({
      id: `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: channel.name,
      description: !channel.description ? '' : channel.description,
      priority: !channel.priority ? 'medium' : channel.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des segments clients
  const segments: CanvasItem[] = !businessModel || !businessModel.segments 
    ? [] 
    : businessModel.segments.map(segment => ({
      id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: segment.name,
      description: !segment.description ? '' : segment.description,
      priority: !segment.priority ? 'high' : segment.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des structures de coûts
  const costStructure: CanvasItem[] = !businessModel || !businessModel.costStructure 
    ? [] 
    : businessModel.costStructure.map(cost => ({
      id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: cost.name,
      description: !cost.description ? '' : cost.description,
      priority: !cost.priority ? 'medium' : cost.priority as 'low' | 'medium' | 'high'
    }));
  
  // Transformation des sources de revenus
  const revenueStreams: CanvasItem[] = !businessModel || !businessModel.revenueStreams 
    ? [] 
    : businessModel.revenueStreams.map(stream => ({
      id: `revenue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: stream.name,
      description: !stream.description ? '' : stream.description,
      priority: !stream.priority ? 'high' : stream.priority as 'low' | 'medium' | 'high'
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
  static toPricingModel(businessPlanData: BusinessPlanData): PricingModel {
  if (!businessPlanData) {
    businessPlanData = {} as BusinessPlanData;
  }
  
  const businessModel = !businessPlanData.businessModel 
    ? {} as ExtendedBusinessModelData 
    : businessPlanData.businessModel;
  
  // Transformation des tarifs horaires
  const hourlyRates: HourlyRateModel[] = !businessModel || !businessModel.hourlyRates 
    ? [] 
    : businessModel.hourlyRates.map(rate => ({
      id: !rate.id ? `hourly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : rate.id,
      title: rate.serviceType || rate.name, // Utiliser serviceType en priorité, ou name par compatibilité
      description: !rate.description ? '' : rate.description,
      ratePerHour: rate.amount || rate.rate, // Utiliser amount ou rate selon ce qui est disponible
      currency: !rate.currency ? '€' : rate.currency,
      specialConditions: rate.conditions,
      minHours: rate.minimumHours
    }));
  
  // Transformation des forfaits
  const packages: PackageModel[] = !businessModel || !businessModel.packages 
    ? [] 
    : businessModel.packages.map(pkg => ({
      id: !pkg.id ? `package-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : pkg.id,
      title: pkg.name,
      description: !pkg.description ? '' : pkg.description,
      price: pkg.price,
      currency: !pkg.currency ? '€' : pkg.currency,
      duration: pkg.duration,
      features: !pkg.services ? [] : pkg.services, // Utiliser services côté service comme features côté UI
      popular: pkg.isPopular
    }));
  
  // Transformation des abonnements
  const subscriptions: SubscriptionModel[] = !businessModel || !businessModel.subscriptions 
    ? [] 
    : businessModel.subscriptions.map(sub => ({
      id: !sub.id ? `subscription-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : sub.id,
      title: sub.name,
      description: !sub.description ? '' : sub.description,
      monthlyPrice: sub.monthlyPrice,
      annualPrice: sub.annualPrice,
      currency: !sub.currency ? '€' : sub.currency,
      billingFrequency: !sub.billingCycle ? 'monthly' : sub.billingCycle as 'monthly' | 'quarterly' | 'biannual' | 'annual',
      features: !sub.features ? [] : sub.features,
      cancellationTerms: sub.cancellationTerms,
      popular: sub.isPopular
    }));
  
  // Ajout de tarifications personnalisées
  const custom = !businessModel || !businessModel.customPricing 
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
  static toService(uiData: { canvas?: BusinessModelCanvasData, pricing?: PricingModel }): Partial<BusinessPlanData> {
    if (!uiData) return {};

    const result: Partial<BusinessPlanData> = {
      businessModel: {} as BusinessModelData
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
  static canvasToService(canvas: BusinessModelCanvasData): Partial<ExtendedBusinessModelData> {
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
  static canvasItemsToService(items: CanvasItem[], defaultPriority: string = 'medium'): Array<{ id?: string; name: string; description: string; priority: string; }> {
    if (!items || !Array.isArray(items)) return [];

    return items.map(item => ({
      id: item.id,
      name: !item.name ? '' : item.name,
      description: !item.description ? '' : item.description,
      priority: !item.priority ? defaultPriority : item.priority
    }));
  }

  /**
   * Transforme les modèles de tarification UI en format service
   * @param pricing Données de tarification UI
   * @returns Données de tarification au format service
   */
  static pricingToService(pricing: PricingModel): Partial<ExtendedBusinessModelData> {
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
  static hourlyRatesToService(rates: HourlyRateModel[]): ServiceHourlyRateModel[] {
    if (!rates || !Array.isArray(rates)) return [];

    return rates.map(rate => ({
      id: rate.id,
      serviceType: rate.title, // Adaptation du champ title vers serviceType
      name: rate.title, // Dupliquer pour la compatibilité
      rate: rate.ratePerHour, // Adaptation du champ ratePerHour vers rate
      amount: rate.ratePerHour, // Dupliquer pour la compatibilité
      currency: !rate.currency ? '€' : rate.currency,
      minimumHours: rate.minHours,
      conditions: rate.specialConditions,
      description: rate.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Transforme les forfaits UI en format service
   * @param packages Forfaits UI
   * @returns Forfaits au format service
   */
  static packagesToService(packages: PackageModel[]): Array<{ id?: string; name: string; description: string; price: number; currency: string; services: string[]; }> {
    if (!packages || !Array.isArray(packages)) return [];

    return packages.map(pkg => ({
      id: pkg.id,
      name: pkg.title,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      services: pkg.features || [] // Adaptation du champ features côté UI vers services côté service
    }));
  }

  /**
   * Transforme les abonnements UI en format service
   * @param subscriptions Abonnements UI
   * @returns Abonnements au format service
   */
  static subscriptionsToService(subscriptions: SubscriptionModel[]): Array<{ id?: string; name: string; description: string; monthlyPrice: number; currency: string; features: string[]; }> {
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
  static customPricingToService(customPricing: Array<{ id: string; title: string; description: string; priceRange?: { min: number; max: number; }; currency: string; factors?: string[]; }>): Array<{ id?: string; name: string; description: string; minPrice?: number; maxPrice?: number; currency: string; pricingFactors?: string[]; }> {
    if (!customPricing || !Array.isArray(customPricing)) return [];

    return customPricing.map(custom => ({
      id: custom.id,
      name: custom.title,
      description: custom.description,
      minPrice: custom.priceRange?.min,
      maxPrice: custom.priceRange?.max,
      currency: custom.currency,
      pricingFactors: custom.factors
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
    uiChanges: {
      canvas?: Partial<BusinessModelCanvasData>,
      pricing?: Partial<PricingModel>
    }
  ): BusinessPlanData {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;

    // Créer une copie pour éviter des modifications directes
    const result = { ...businessPlanData };

    // S'assurer que businessModel existe
    if (!result.businessModel) {
      result.businessModel = {} as ExtendedBusinessModelData;
    }

    // Mettre à jour le canvas si présent dans les changements
    if (uiChanges.canvas) {
      result.businessModel = {
        ...result.businessModel,
        // Appliquer les mises à jour pour chaque section du canvas
        ...(uiChanges.canvas.partners && {
          partners: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.partners ? [] : result.businessModel.partners,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.partners, 'partner'))
        }),
        ...(uiChanges.canvas.activities && {
          activities: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.activities ? [] : result.businessModel.activities,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.activities, 'activity'))
        }),
        ...(uiChanges.canvas.resources && {
          resources: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.resources ? [] : result.businessModel.resources,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.resources, 'resource'))
        }),
        ...(uiChanges.canvas.valueProposition && {
          valuePropositions: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.valuePropositions ? [] : result.businessModel.valuePropositions,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.valueProposition, 'value'))
        }),
        ...(uiChanges.canvas.customerRelations && {
          customerRelations: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.customerRelations ? [] : result.businessModel.customerRelations,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.customerRelations, 'relation'))
        }),
        ...(uiChanges.canvas.channels && {
          channels: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.channels ? [] : result.businessModel.channels,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.channels, 'channel'))
        }),
        ...(uiChanges.canvas.segments && {
          segments: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.segments ? [] : result.businessModel.segments,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.segments, 'segment'))
        }),
        ...(uiChanges.canvas.costStructure && {
          costStructure: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.costStructure ? [] : result.businessModel.costStructure,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.costStructure, 'cost'))
        }),
        ...(uiChanges.canvas.revenueStreams && {
          revenueStreams: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.revenueStreams ? [] : result.businessModel.revenueStreams,
            BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.revenueStreams, 'revenue'))
        })
      };
    }

    // Mettre à jour le pricing si présent dans les changements
    if (uiChanges.pricing) {
      result.businessModel = {
        ...result.businessModel,
        // Appliquer les mises à jour pour chaque type de pricing
        ...(uiChanges.pricing.hourlyRates && {
          hourlyRates: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.hourlyRates ? [] : result.businessModel.hourlyRates,
            BusinessModelAdapter.hourlyRatesToService(uiChanges.pricing.hourlyRates))
        }),
        ...(uiChanges.pricing.packages && {
          packages: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.packages ? [] : result.businessModel.packages,
            BusinessModelAdapter.packagesToService(uiChanges.pricing.packages))
        }),
        ...(uiChanges.pricing.subscriptions && {
          subscriptions: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.subscriptions ? [] : result.businessModel.subscriptions,
            BusinessModelAdapter.subscriptionsToService(uiChanges.pricing.subscriptions))
        }),
        ...(uiChanges.pricing.custom && {
          customPricing: BusinessModelAdapter.mergeArraysById(
            !result.businessModel || !result.businessModel.customPricing ? [] : result.businessModel.customPricing,
            BusinessModelAdapter.customPricingToService(uiChanges.pricing.custom))
        })
      };
    }

    return result;
  }

  /**
   * @deprecated Utiliser toBusinessModelCanvas à la place
   */
  static transformToBusinessModelCanvas(businessPlanData: BusinessPlanData): BusinessModelCanvasData {
    console.warn('BusinessModelAdapter: transformToBusinessModelCanvas est déprécié, utiliser toBusinessModelCanvas à la place');
    return BusinessModelAdapter.toBusinessModelCanvas(businessPlanData);
  }

  /**
   * @deprecated Utiliser toPricingModel à la place
   */
  static transformToPricingModel(businessPlanData: BusinessPlanData): PricingModel {
    console.warn('BusinessModelAdapter: transformToPricingModel est déprécié, utiliser toPricingModel à la place');
    return BusinessModelAdapter.toPricingModel(businessPlanData);
  }
}

/**
 * Fonctions utilitaires privées
 */


// Export par défaut pour la compatibilité avec le code existant
export default BusinessModelAdapter;
