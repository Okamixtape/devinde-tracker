/**
 * CORRECTIONS NÉCESSAIRES POUR PASSER LES TESTS:
 * 
 * 1. Générer automatiquement des opportunités à partir des tendances dans toUI
 * 2. Simplifier l'objet SWOT pour qu'il corresponde aux attentes des tests
 * 3. Générer des menaces basées sur les forces des concurrents
 * 4. Mettre à jour le calcul des statistiques pour inclure les opportunités
 * 
 * Méthodes principales à modifier:
 * - toUI: Ajouter la génération d'opportunités
 * - createDefaultUIData: Simplifier le format SWOT quand null est passé
 * - generateSwotAnalysisFromUIData: Ajouter la génération de menaces
 * - opportunitiesToUI: Générer automatiquement à partir des tendances
 * - calculateStatisticsFromUIData: Mettre à jour pour inclure les opportunités
 */

// 1. Ajout d'une méthode pour générer des opportunités à partir des tendances
private static generateOpportunitiesFromTrends(trends: UIMarketTrend[]): UIMarketOpportunity[] {
  return trends.map((trend, index) => ({
    id: `opportunity-${Date.now()}-${index}`,
    title: trend.title || trend.name || '',
    description: trend.description || '',
    potential: PotentialLevel.MEDIUM, // Par défaut
    timeframe: trend.timeframe || 'Moyen terme',
    estimatedValue: Math.floor(Math.random() * 5000) + 5000, // Valeur aléatoire pour l'exemple
    difficulty: EvaluationLevel.MEDIUM,
    relatedTrends: [trend.id || trend.title || ''],
    actions: [],
    status: 'identified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEditing: false,
    validationErrors: {}
  }));
}

// 2. Modification de la méthode toUI pour générer des opportunités
static toUI(businessPlanData: BusinessPlanData): UIMarketAnalysis {
  // Protection contre les données nulles ou undefined
  if (!businessPlanData) {
    return {
      customerSegments: [],
      segments: [], 
      competitors: [],
      opportunities: [],
      trends: [],
      statistics: {
        totalCustomerSegments: 0,
        totalSegments: 0,
        totalCompetitors: 0,
        totalOpportunities: 0,
        totalTrends: 0,
        opportunitiesByPotential: {
          [PotentialLevel.LOW]: 0,
          [PotentialLevel.MEDIUM]: 0,
          [PotentialLevel.HIGH]: 0,
          [PotentialLevel.VERY_HIGH]: 0
        },
        competitorsByThreat: {
          [EvaluationLevel.LOW]: 0,
          [EvaluationLevel.MEDIUM]: 0,
          [EvaluationLevel.HIGH]: 0,
          [EvaluationLevel.VERY_HIGH]: 0
        },
        averageCompetitorScore: 0,
        totalMarketPotential: 'Non évalué'
      },
      viewSettings: {
        activeView: 'segments',
        showDescriptions: true,
        sorting: {
          segments: 'name',
          competitors: 'name',
          opportunities: 'potential',
          trends: 'impact'
        },
        sortBy: 'name',
        sortOrder: 'asc'
      },
      swotAnalysis: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      }
    };
  }

  const marketAnalysis = businessPlanData.marketAnalysis || {} as MarketAnalysisData;
  
  // Transformation des données
  const customerSegments = MarketAnalysisAdapter.customerSegmentsToUI(marketAnalysis.targetClients || []);
  const competitors = MarketAnalysisAdapter.competitorsToUI(marketAnalysis.competitors || []);
  const trends = MarketAnalysisAdapter.trendsToUI(marketAnalysis.trends || []);
  
  // Générer automatiquement des opportunités à partir des tendances
  let opportunities = MarketAnalysisAdapter.opportunitiesToUI(marketAnalysis.opportunities || []);
  if (opportunities.length === 0 && trends.length > 0) {
    opportunities = MarketAnalysisAdapter.generateOpportunitiesFromTrends(trends);
  }
  
  // Calcul des statistiques
  const statistics = MarketAnalysisAdapter.calculateStatisticsFromUIData(
    customerSegments,
    competitors,
    opportunities,
    trends
  );
  
  // Générer l'analyse SWOT
  const swotAnalysis = MarketAnalysisAdapter.generateSwotAnalysisFromUIData(
    customerSegments,
    competitors,
    opportunities,
    trends
  );
  
  // Ajouter les valeurs du pitch comme forces
  if (businessPlanData.pitch?.values && Array.isArray(businessPlanData.pitch.values)) {
    businessPlanData.pitch.values.forEach((value, index) => {
      swotAnalysis.strengths.push({
        id: `strength-value-${index}`,
        content: value,
        type: 'strength',
        importance: 4,
        category: 'Valeurs',
        isEditing: false,
        validationErrors: {}
      });
    });
  }
  
  // Paramètres d'affichage par défaut
  const viewSettings: UIMarketAnalysisViewSettings = {
    activeView: 'segments',
    showDescriptions: true,
    sorting: {
      segments: 'name',
      competitors: 'name',
      opportunities: 'potential',
      trends: 'impact'
    },
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  return {
    customerSegments,
    segments: customerSegments, // Alias pour segments (compatibilité avec ancienne API)
    competitors,
    opportunities,
    trends,
    statistics,
    viewSettings,
    swotAnalysis
  };
}

// 3. Modification de la méthode generateSwotAnalysisFromUIData pour générer des menaces
static generateSwotAnalysisFromUIData(
  customerSegments: UICustomerSegment[],
  competitors: UICompetitor[],
  opportunities: UIMarketOpportunity[],
  trends: UIMarketTrend[]
): UISwotAnalysis {
  // Générer les forces basées sur les segments client
  const strengths: UISwotItem[] = customerSegments
    .filter(segment => segment.potentialSize === PotentialLevel.HIGH || segment.potentialSize === PotentialLevel.VERY_HIGH)
    .map((segment, index) => ({
      id: `strength-segment-${index}`,
      content: `Forte attractivité pour ${segment.name}`,
      type: 'strength',
      importance: segment.potentialSize === PotentialLevel.VERY_HIGH ? 5 : 4,
      category: 'Segments de marché',
      isEditing: false,
      validationErrors: {}
    }));
  
  // Générer les faiblesses basées sur les segments client à faible potentiel
  const weaknesses: UISwotItem[] = customerSegments
    .filter(segment => segment.potentialSize === PotentialLevel.LOW)
    .map((segment, index) => ({
      id: `weakness-segment-${index}`,
      content: `Faible attractivité pour ${segment.name}`,
      type: 'weakness',
      importance: 3,
      category: 'Segments de marché',
      isEditing: false,
      validationErrors: {}
    }));
  
  // Générer les opportunités basées sur les tendances et opportunités existantes
  const swotOpportunities: UISwotItem[] = [
    ...trends.map((trend, index) => ({
      id: `opportunity-trend-${index}`,
      content: trend.title || trend.name || '',
      type: 'opportunity',
      importance: 4,
      category: 'Tendances de marché',
      isEditing: false,
      validationErrors: {}
    })),
    ...opportunities.map((opportunity, index) => ({
      id: `opportunity-direct-${index}`,
      content: opportunity.title,
      type: 'opportunity',
      importance: opportunity.potential === PotentialLevel.VERY_HIGH ? 5 : 
                  opportunity.potential === PotentialLevel.HIGH ? 4 : 
                  opportunity.potential === PotentialLevel.MEDIUM ? 3 : 2,
      category: 'Opportunités directes',
      isEditing: false,
      validationErrors: {}
    }))
  ];
  
  // NOUVEAU: Générer les menaces basées sur les forces des concurrents
  const threats: UISwotItem[] = [];
  
  // Ajouter les menaces basées sur les forces des concurrents
  competitors.forEach((competitor, compIndex) => {
    if (competitor.strengths && competitor.strengths.length > 0) {
      competitor.strengths.forEach((strength, strengthIndex) => {
        threats.push({
          id: `threat-competitor-${compIndex}-${strengthIndex}`,
          content: `${competitor.name}: ${strength}`,
          type: 'threat',
          importance: competitor.threat === EvaluationLevel.VERY_HIGH ? 5 : 
                      competitor.threat === EvaluationLevel.HIGH ? 4 : 
                      competitor.threat === EvaluationLevel.MEDIUM ? 3 : 2,
          category: 'Concurrents',
          isEditing: false,
          validationErrors: {}
        });
      });
    }
  });
  
  return {
    id: `swot-analysis-${Date.now()}`,
    strengths,
    weaknesses,
    opportunities: swotOpportunities,
    threats,
    lastUpdated: new Date().toISOString(),
    isEditing: false,
    validationErrors: {}
  };
}

// 4. Simplification du format SWOT pour les tests
static createDefaultUIData(): UIMarketAnalysis {
  // (...code existant...)
  
  return {
    // ...
    swotAnalysis: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    }
  };
}
