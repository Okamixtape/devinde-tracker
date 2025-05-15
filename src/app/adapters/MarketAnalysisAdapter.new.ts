/**
 * MarketAnalysisAdapter - Adaptateur pour les données d'analyse de marché
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (MarketAnalysisInterfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData, MarketAnalysisData, TargetClient, Competitor as ServiceCompetitor } from '../services/interfaces/dataModels';
import {
  CustomerSegment,
  Competitor,
  MarketOpportunity,
  MarketTrend,
  SwotAnalysis,
  SwotItem,
  MarketAnalysisStatistics
} from '../interfaces/MarketAnalysisInterfaces';

/**
 * Adaptateur pour les données d'analyse de marché
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (CustomerSegment, Competitor, etc.).
 */
export class MarketAnalysisAdapter {
  /**
   * Transforme les données d'analyse de marché du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données d'analyse de marché au format UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): {
    segments: CustomerSegment[],
    competitors: Competitor[],
    opportunities: MarketOpportunity[],
    trends: MarketTrend[],
    swotAnalysis: SwotAnalysis,
    statistics: MarketAnalysisStatistics
  } {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) {
      return {
        segments: [],
        competitors: [],
        opportunities: [],
        trends: [],
        swotAnalysis: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        statistics: MarketAnalysisAdapter.createEmptyStatistics()
      };
    }
    
    return {
      segments: MarketAnalysisAdapter.toCustomerSegments(businessPlanData),
      competitors: MarketAnalysisAdapter.toCompetitors(businessPlanData),
      opportunities: MarketAnalysisAdapter.toOpportunities(businessPlanData),
      trends: MarketAnalysisAdapter.toMarketTrends(businessPlanData),
      swotAnalysis: MarketAnalysisAdapter.generateSwotAnalysis(businessPlanData),
      statistics: MarketAnalysisAdapter.calculateStatistics(businessPlanData)
    };
  }

  /**
   * Crée un objet de statistiques vide pour gérer les cas où les données sont manquantes
   * @private
   */
  private static createEmptyStatistics(): MarketAnalysisStatistics {
    return {
      totalSegments: 0,
      totalCompetitors: 0,
      totalOpportunities: 0,
      totalTrends: 0,
      competitionLevel: 'low',
      potentialCustomersCount: 0,
      marketGrowthRate: 0,
      estimatedMarketShare: 0
    };
  }

  /**
   * Transforme les données d'analyse de marché du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données au format UI
   * @returns Partie des données du plan d'affaires au format service
   */
  static toService(uiData: {
    segments?: CustomerSegment[],
    competitors?: Competitor[],
    trends?: MarketTrend[]
  }): Partial<BusinessPlanData> {
    // Protection contre les données nulles ou undefined
    if (!uiData) return {};

    return {
      marketAnalysis: {
        targetClients: uiData.segments?.map(segment => ({
          id: segment.id,
          segment: segment.name,
          description: segment.description,
          needs: segment.needs || []
        })) || [],
        
        competitors: uiData.competitors?.map(competitor => ({
          id: competitor.id,
          name: competitor.name,
          strengths: competitor.strengths || [],
          weaknesses: competitor.weaknesses || [],
          url: competitor.website
        })) || [],
        
        trends: uiData.trends?.map(trend => trend.name || trend.description) || []
      }
    };
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
      segments?: CustomerSegment[],
      competitors?: Competitor[],
      trends?: MarketTrend[],
      opportunities?: MarketOpportunity[]
    }
  ): BusinessPlanData {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;

    const current = businessPlanData.marketAnalysis || {
      targetClients: [],
      competitors: [],
      trends: []
    };
    
    return {
      ...businessPlanData,
      marketAnalysis: {
        ...current,
        // Appliquer les modifications pertinentes si elles existent
        ...(uiChanges.segments && { 
          targetClients: uiChanges.segments.map(segment => ({
            id: segment.id,
            segment: segment.name,
            description: segment.description,
            needs: segment.needs || []
          }))
        }),
        ...(uiChanges.competitors && { 
          competitors: uiChanges.competitors.map(competitor => ({
            id: competitor.id,
            name: competitor.name,
            strengths: competitor.strengths || [],
            weaknesses: competitor.weaknesses || [],
            url: competitor.website
          }))
        }),
        ...(uiChanges.trends && { 
          trends: uiChanges.trends.map(trend => trend.name || trend.description)
        })
      }
    };
  }

  /**
   * Transforme les segments client du format service vers le format UI
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Segments client transformés pour l'UI
   */
  static toCustomerSegments(businessPlanData: BusinessPlanData): CustomerSegment[] {
    const { marketAnalysis } = businessPlanData;
    const targetClients = marketAnalysis?.targetClients || [];
    
    return targetClients.map(client => ({
      id: client.id || MarketAnalysisAdapter.generateUniqueId('segment'),
      name: client.segment || '',
      description: client.description || '',
      size: MarketAnalysisAdapter.extractFromDescription(client.description, 'size', 'medium'),
      growthRate: MarketAnalysisAdapter.extractFromDescription(client.description, 'growth', 'stable'),
      needs: client.needs || [],
      acquisitionCost: 'medium', // Valeur par défaut
      acquisitionChannels: [],
      budget: 'medium', // Valeur par défaut
      painPoints: [],
      interests: []
    }));
  }

  /**
   * Transforme les concurrents du format service vers le format UI
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Concurrents transformés pour l'UI
   */
  static toCompetitors(businessPlanData: BusinessPlanData): Competitor[] {
    const { marketAnalysis } = businessPlanData;
    const serviceCompetitors = marketAnalysis?.competitors || [];
    
    return serviceCompetitors.map(competitor => ({
      id: competitor.id || MarketAnalysisAdapter.generateUniqueId('competitor'),
      name: competitor.name || '',
      description: '',
      website: competitor.url || '',
      strengths: competitor.strengths || [],
      weaknesses: competitor.weaknesses || [],
      marketShare: 0, // Valeur par défaut
      pricingScore: MarketAnalysisAdapter.estimatePricingScore(competitor),
      innovationScore: MarketAnalysisAdapter.estimateInnovationScore(competitor),
      reputationScore: MarketAnalysisAdapter.estimateReputationScore(competitor),
      directCompetitor: true
    }));
  }

  /**
   * Transforme les tendances du marché du format service vers le format UI
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Tendances du marché transformées pour l'UI
   */
  static toMarketTrends(businessPlanData: BusinessPlanData): MarketTrend[] {
    const { marketAnalysis } = businessPlanData;
    const trends = marketAnalysis?.trends || [];
    
    return trends.map((trend, index) => {
      // Le service stocke juste des chaînes, donc on extrait des infos de la description
      return {
        id: MarketAnalysisAdapter.generateUniqueId(`trend-${index}`),
        name: MarketAnalysisAdapter.extractTrendName(trend),
        description: trend,
        impact: 'medium', // Valeur par défaut
        timeline: 'mid-term', // Valeur par défaut
        relevance: 'medium', // Valeur par défaut
        sourceLinks: []
      };
    });
  }

  /**
   * Génère des opportunités de marché à partir des données du service
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Opportunités de marché déduites
   */
  static toOpportunities(businessPlanData: BusinessPlanData): MarketOpportunity[] {
    const { marketAnalysis } = businessPlanData;
    const targetClients = marketAnalysis?.targetClients || [];
    const trends = marketAnalysis?.trends || [];
    const opportunities: MarketOpportunity[] = [];
    
    // Générer des opportunités à partir des besoins des clients
    targetClients.forEach(client => {
      (client.needs || []).forEach((need, index) => {
        opportunities.push({
          id: MarketAnalysisAdapter.generateUniqueId(`opportunity-${client.id}-${index}`),
          name: `${need} pour ${client.segment}`,
          description: `Répondre au besoin: ${need} pour le segment ${client.segment}`,
          potential: 'medium', // Valeur par défaut
          effort: 'medium', // Valeur par défaut
          relevance: 'high', // Valeur par défaut
          targetSegmentId: client.id
        });
      });
    });
    
    // Générer des opportunités à partir des tendances
    trends.forEach((trend, index) => {
      opportunities.push({
        id: MarketAnalysisAdapter.generateUniqueId(`trend-opportunity-${index}`),
        name: `Opportunité: ${MarketAnalysisAdapter.extractTrendName(trend)}`,
        description: `Capitaliser sur la tendance: ${trend}`,
        potential: 'medium', // Valeur par défaut
        effort: 'medium', // Valeur par défaut
        relevance: 'medium', // Valeur par défaut
        sourceTrendId: MarketAnalysisAdapter.generateUniqueId(`trend-${index}`)
      });
    });
    
    return opportunities;
  }

  /**
   * Génère une analyse SWOT à partir des données du service
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Analyse SWOT générée
   */
  static generateSwotAnalysis(businessPlanData: BusinessPlanData): SwotAnalysis {
    const swotAnalysis: SwotAnalysis = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };
    
    const { marketAnalysis, businessModel, pitch } = businessPlanData;
    
    // Générer les forces à partir des valeurs et services
    if (pitch && pitch.values) {
      pitch.values.forEach((value, index) => {
        swotAnalysis.strengths.push({
          id: MarketAnalysisAdapter.generateUniqueId(`strength-${index}`),
          content: value,
          impact: 'high'
        });
      });
    }
    
    // Générer les opportunités à partir des tendances
    if (marketAnalysis && marketAnalysis.trends) {
      marketAnalysis.trends.forEach((trend, index) => {
        swotAnalysis.opportunities.push({
          id: MarketAnalysisAdapter.generateUniqueId(`swot-opportunity-${index}`),
          content: trend,
          impact: 'medium'
        });
      });
    }
    
    // Générer les menaces à partir des concurrents
    if (marketAnalysis && marketAnalysis.competitors) {
      marketAnalysis.competitors.forEach((competitor, index) => {
        if (competitor.strengths && competitor.strengths.length > 0) {
          swotAnalysis.threats.push({
            id: MarketAnalysisAdapter.generateUniqueId(`threat-${index}`),
            content: `Concurrent ${competitor.name}: ${competitor.strengths[0]}`,
            impact: 'medium'
          });
        }
      });
    }
    
    return swotAnalysis;
  }

  /**
   * Calcule des statistiques à partir des données d'analyse de marché
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Statistiques calculées
   */
  static calculateStatistics(businessPlanData: BusinessPlanData): MarketAnalysisStatistics {
    const { marketAnalysis } = businessPlanData;
    
    // Valeurs par défaut
    let totalSegments = 0;
    let totalCompetitors = 0;
    let totalOpportunities = 0;
    let totalTrends = 0;
    let competitionLevel: 'low' | 'medium' | 'high' = 'low';
    let potentialCustomersCount = 0;
    let marketGrowthRate = 0;
    let estimatedMarketShare = 0;
    
    // Calcul des métriques si les données sont disponibles
    if (marketAnalysis) {
      totalSegments = marketAnalysis.targetClients?.length || 0;
      totalCompetitors = marketAnalysis.competitors?.length || 0;
      totalTrends = marketAnalysis.trends?.length || 0;
      
      // Estimer le nombre de clients potentiels
      marketAnalysis.targetClients?.forEach(client => {
        const sizeText = MarketAnalysisAdapter.extractFromDescription(client.description, 'size', '').toLowerCase();
        if (sizeText.includes('grand') || sizeText.includes('large')) {
          potentialCustomersCount += 10000;
        } else if (sizeText.includes('moyen') || sizeText.includes('medium')) {
          potentialCustomersCount += 5000;
        } else {
          potentialCustomersCount += 1000; // Petite taille par défaut
        }
      });
      
      // Déterminer le niveau de concurrence
      if (totalCompetitors >= 5) {
        competitionLevel = 'high';
      } else if (totalCompetitors >= 2) {
        competitionLevel = 'medium';
      }
      
      // Estimer le taux de croissance du marché
      marketAnalysis.trends?.forEach(trend => {
        if (typeof trend === 'string' && 
            (trend.toLowerCase().includes('croissance') || 
             trend.toLowerCase().includes('growth') ||
             trend.toLowerCase().includes('augmentation'))) {
          marketGrowthRate += 5;
        }
      });
      marketGrowthRate = Math.min(marketGrowthRate, 30); // Cap à 30%
      
      // Estimer la part de marché
      if (totalCompetitors > 0) {
        estimatedMarketShare = Math.round(100 / (totalCompetitors + 1));
      } else {
        estimatedMarketShare = 80; // Si pas de concurrents, part de marché élevée
      }
      
      // Générer des opportunités à partir des segments clients
      totalOpportunities = marketAnalysis.targetClients?.reduce((total, client) => 
        total + (client.needs?.length || 0), 0) || 0;
      totalOpportunities += totalTrends; // Une opportunité par tendance
    }
    
    return {
      totalSegments,
      totalCompetitors,
      totalOpportunities,
      totalTrends,
      competitionLevel,
      potentialCustomersCount,
      marketGrowthRate,
      estimatedMarketShare
    };
  }

  /**
   * Génère un identifiant unique avec un préfixe
   * @private
   */
  private static generateUniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
  }

  /**
   * Extrait une information à partir d'une description textuelle
   * @private
   */
  private static extractFromDescription(description?: string, key?: string, defaultValue: string = ''): string {
    if (!description || !key) return defaultValue;
    
    const regexes = {
      'size': /taille:?\s*(\w+)|size:?\s*(\w+)/i,
      'growth': /croissance:?\s*(\w+)|growth:?\s*(\w+)/i,
    };
    
    const regex = regexes[key];
    if (!regex) return defaultValue;
    
    const match = description.match(regex);
    return match ? (match[1] || match[2]) : defaultValue;
  }

  /**
   * Extrait un nom de tendance à partir d'une description
   * @private
   */
  private static extractTrendName(trend: string): string {
    if (!trend) return '';
    
    // Si le format est "Nom: Description", extraire le nom
    const colonMatch = trend.match(/^([^:]+):/);
    if (colonMatch) return colonMatch[1].trim();
    
    // Sinon, utiliser les premiers mots (jusqu'à 5)
    const words = trend.split(' ');
    return words.slice(0, Math.min(5, words.length)).join(' ');
  }

  /**
   * Estime le score de prix d'un concurrent
   * @private
   */
  private static estimatePricingScore(competitor: ServiceCompetitor): number {
    // Score par défaut
    let score = 50;
    
    // Analyser les forces et faiblesses pour ajuster le score
    const allTexts = [
      ...(competitor.strengths || []), 
      ...(competitor.weaknesses || [])
    ].join(' ').toLowerCase();
    
    // Mots-clés indiquant un meilleur prix (score plus élevé)
    const cheapKeywords = ['bon marché', 'pas cher', 'abordable', 'économique', 'accessible', 'low cost'];
    cheapKeywords.forEach(keyword => {
      if (allTexts.includes(keyword)) score += 10;
    });
    
    // Mots-clés indiquant un prix élevé (score plus bas)
    const expensiveKeywords = ['premium', 'luxe', 'haut de gamme', 'coûteux', 'cher'];
    expensiveKeywords.forEach(keyword => {
      if (allTexts.includes(keyword)) score -= 10;
    });
    
    // Garantir que le score reste entre 0 et 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estime le score d'innovation d'un concurrent
   * @private
   */
  private static estimateInnovationScore(competitor: ServiceCompetitor): number {
    // Score par défaut
    let score = 50;
    
    // Analyser les forces et faiblesses pour ajuster le score
    const allTexts = [
      ...(competitor.strengths || []), 
      ...(competitor.weaknesses || [])
    ].join(' ').toLowerCase();
    
    // Mots-clés indiquant plus d'innovation (score plus élevé)
    const innovativeKeywords = ['innovation', 'innovant', 'technologie', 'avancé', 'moderne', 'nouveau', 'disruptif', 'R&D'];
    innovativeKeywords.forEach(keyword => {
      if (allTexts.includes(keyword)) score += 10;
    });
    
    // Mots-clés indiquant moins d'innovation (score plus bas)
    const traditionalKeywords = ['traditionnel', 'classique', 'conventionnel', 'obsolète', 'ancien'];
    traditionalKeywords.forEach(keyword => {
      if (allTexts.includes(keyword)) score -= 10;
    });
    
    // Garantir que le score reste entre 0 et 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estime le score de réputation d'un concurrent
   * @private
   */
  private static estimateReputationScore(competitor: ServiceCompetitor): number {
    // Score par défaut
    let score = 50;
    
    // Analyser les forces et faiblesses pour ajuster le score
    const strengths = competitor.strengths || [];
    const weaknesses = competitor.weaknesses || [];
    
    // Plus de forces = meilleure réputation
    score += strengths.length * 5;
    
    // Plus de faiblesses = moins bonne réputation
    score -= weaknesses.length * 5;
    
    // Analyser les mots-clés spécifiques
    const allTexts = [...strengths, ...weaknesses].join(' ').toLowerCase();
    
    // Mots-clés indiquant une bonne réputation
    const goodReputationKeywords = ['connu', 'reconnu', 'réputé', 'leader', 'établi', 'confiance', 'fiable', 'qualité'];
    goodReputationKeywords.forEach(keyword => {
      if (allTexts.includes(keyword) && strengths.some(s => s.toLowerCase().includes(keyword))) {
        score += 10;
      }
    });
    
    // Mots-clés indiquant une mauvaise réputation
    const badReputationKeywords = ['mauvais service', 'plaintes', 'critiques', 'problèmes', 'insatisfaction'];
    badReputationKeywords.forEach(keyword => {
      if (allTexts.includes(keyword)) score -= 10;
    });
    
    // Garantir que le score reste entre 0 et 100
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * @deprecated Utilisez MarketAnalysisAdapter.toCustomerSegments à la place
 */
export function transformToCustomerSegments(businessPlanData: BusinessPlanData): CustomerSegment[] {
  console.warn('Méthode dépréciée: Utilisez MarketAnalysisAdapter.toCustomerSegments');
  return MarketAnalysisAdapter.toCustomerSegments(businessPlanData);
}

/**
 * @deprecated Utilisez MarketAnalysisAdapter.toCompetitors à la place
 */
export function transformToCompetitors(businessPlanData: BusinessPlanData): Competitor[] {
  console.warn('Méthode dépréciée: Utilisez MarketAnalysisAdapter.toCompetitors');
  return MarketAnalysisAdapter.toCompetitors(businessPlanData);
}

export default MarketAnalysisAdapter;
