/**
 * Test unitaire pour MarketAnalysisAdapter
 * 
 * Teste les fonctionnalités de conversion bidirectionnelle et les mises à jour partielles.
 */

import { MarketAnalysisAdapter, transformToCustomerSegments, transformToCompetitors } from '../src/app/adapters/MarketAnalysisAdapter';
import { BusinessPlanData } from '../src/app/services/interfaces/dataModels';
import { 
  CustomerSegment,
  Competitor,
  MarketTrend,
  MarketOpportunity,
  SwotAnalysis,
  MarketAnalysisStatistics
} from '../src/app/interfaces/MarketAnalysisInterfaces';

describe('MarketAnalysisAdapter', () => {
  // Données de test
  const mockServiceData: BusinessPlanData = {
    id: 'test-123',
    name: 'Test Business Plan',
    marketAnalysis: {
      targetClients: [
        { 
          id: 'client-1', 
          segment: 'Freelances tech', 
          description: 'Freelances du secteur tech, taille: large, growth: rapid', 
          needs: ['Gestion de projets', 'Facturation automatisée']
        },
        { 
          id: 'client-2', 
          segment: 'PME services', 
          description: 'Petites entreprises de services, size: medium', 
          needs: ['Marketing digital', 'Présence en ligne']
        }
      ],
      competitors: [
        { 
          id: 'comp-1', 
          name: 'TechSolutions', 
          strengths: ['Bon service client', 'Interface conviviale'],
          weaknesses: ['Prix élevé', 'Fonctionnalités limitées'],
          url: 'https://techsolutions.com'
        },
        { 
          id: 'comp-2', 
          name: 'DigitPro', 
          strengths: ['Innovation constante', 'Tarifs abordables'],
          weaknesses: ['Support client lent'],
          url: 'https://digitpro.com'
        }
      ],
      trends: [
        'Adoption du cloud: Transition vers des services hébergés dans le cloud',
        'IA et automatisation: Intégration de l\'intelligence artificielle',
        'Télétravail: Évolution des modes de travail à distance'
      ]
    },
    // Ajout des champs requis pour la structure BusinessPlanData
    pitch: { title: 'MonPitch', summary: 'Résumé du pitch', vision: 'Vision', values: ['Innovation', 'Qualité'] },
    services: { offerings: [], technologies: [], process: [] },
    actionPlan: { milestones: [], tasks: [] },
    businessModel: { hourlyRates: [], packages: [], subscriptions: [] },
    financials: { initialInvestment: 0, quarterlyGoals: [], expenses: [] }
  };

  describe('toUI', () => {
    test('devrait transformer correctement les données de service en données UI', () => {
      // Act
      const uiData = MarketAnalysisAdapter.toUI(mockServiceData);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.segments).toBeDefined();
      expect(uiData.competitors).toBeDefined();
      expect(uiData.opportunities).toBeDefined();
      expect(uiData.trends).toBeDefined();
      expect(uiData.swotAnalysis).toBeDefined();
      expect(uiData.statistics).toBeDefined();
      
      // Vérifier les segments client
      expect(uiData.segments.length).toBe(2);
      expect(uiData.segments[0].name).toBe('Freelances tech');
      expect(uiData.segments[0].needs).toContain('Gestion de projets');
      expect(uiData.segments[0].growthRate).toBe('rapid');
      expect(uiData.segments[0].size).toBe('large');
      
      // Vérifier les concurrents
      expect(uiData.competitors.length).toBe(2);
      expect(uiData.competitors[0].name).toBe('TechSolutions');
      expect(uiData.competitors[0].strengths).toHaveLength(2);
      expect(uiData.competitors[0].website).toBe('https://techsolutions.com');
      
      // Vérifier les tendances
      expect(uiData.trends.length).toBe(3);
      expect(uiData.trends[0].name).toBe('Adoption du cloud');
      
      // Vérifier les opportunités
      expect(uiData.opportunities.length).toBeGreaterThan(0);
      
      // Vérifier l'analyse SWOT
      expect(uiData.swotAnalysis.strengths.length).toBeGreaterThan(0);
      expect(uiData.swotAnalysis.threats.length).toBeGreaterThan(0);
      
      // Vérifier les statistiques
      expect(uiData.statistics.totalSegments).toBe(2);
      expect(uiData.statistics.totalCompetitors).toBe(2);
      expect(uiData.statistics.totalTrends).toBe(3);
    });

    test('devrait gérer les données nulles ou undefined', () => {
      // Act
      const uiData = MarketAnalysisAdapter.toUI(null);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.segments).toHaveLength(0);
      expect(uiData.competitors).toHaveLength(0);
      expect(uiData.opportunities).toHaveLength(0);
      expect(uiData.trends).toHaveLength(0);
      expect(uiData.swotAnalysis).toEqual({
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      });
      expect(uiData.statistics).toEqual(expect.objectContaining({
        totalSegments: 0,
        totalCompetitors: 0,
        totalOpportunities: 0,
        totalTrends: 0
      }));
    });
  });

  describe('toService', () => {
    test('devrait transformer correctement les données UI en données de service', () => {
      // Arrange
      const uiData = MarketAnalysisAdapter.toUI(mockServiceData);
      
      // Act
      const serviceData = MarketAnalysisAdapter.toService(uiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.marketAnalysis).toBeDefined();
      
      // Vérifier la conversion des segments client
      const targetClients = serviceData.marketAnalysis.targetClients;
      expect(targetClients).toBeDefined();
      expect(targetClients.length).toBe(2);
      expect(targetClients[0].segment).toBe('Freelances tech');
      expect(targetClients[0].needs).toContain('Gestion de projets');
      
      // Vérifier la conversion des concurrents
      const competitors = serviceData.marketAnalysis.competitors;
      expect(competitors).toBeDefined();
      expect(competitors.length).toBe(2);
      expect(competitors[0].name).toBe('TechSolutions');
      expect(competitors[0].strengths).toHaveLength(2);
      expect(competitors[0].url).toBe('https://techsolutions.com');
      
      // Vérifier la conversion des tendances
      const trends = serviceData.marketAnalysis.trends;
      expect(trends).toBeDefined();
      expect(trends.length).toBe(3);
    });

    test('devrait gérer les données UI partielles', () => {
      // Arrange
      const partialUiData = {
        segments: [{
          id: 'test-segment',
          name: 'Nouveau segment',
          description: 'Description du segment',
          needs: ['Besoin 1', 'Besoin 2'],
          size: 'large',
          growthRate: 'rapid',
          acquisitionCost: 'medium',
          acquisitionChannels: [],
          budget: 'medium',
          painPoints: [],
          interests: []
        }]
      };
      
      // Act
      const serviceData = MarketAnalysisAdapter.toService(partialUiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.marketAnalysis).toBeDefined();
      expect(serviceData.marketAnalysis.targetClients).toHaveLength(1);
      expect(serviceData.marketAnalysis.competitors).toHaveLength(0);
      expect(serviceData.marketAnalysis.trends).toHaveLength(0);
    });
  });

  describe('updateServiceWithUIChanges', () => {
    test('devrait fusionner correctement les modifications partielles', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      const uiChanges = {
        segments: [{
          id: 'client-1',
          name: 'Freelances tech modifié',
          description: 'Description modifiée',
          needs: ['Gestion de projets améliorée'],
          size: 'large',
          growthRate: 'stable',
          acquisitionCost: 'medium',
          acquisitionChannels: [],
          budget: 'medium',
          painPoints: [],
          interests: []
        }]
      };
      
      // Act
      const updatedData = MarketAnalysisAdapter.updateServiceWithUIChanges(originalData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.marketAnalysis).toBeDefined();
      expect(updatedData.marketAnalysis.targetClients).toHaveLength(1);
      expect(updatedData.marketAnalysis.targetClients[0].segment).toBe('Freelances tech modifié');
      expect(updatedData.marketAnalysis.targetClients[0].needs).toContain('Gestion de projets améliorée');
      
      // Vérifier que les autres données sont préservées
      expect(updatedData.marketAnalysis.competitors).toEqual(originalData.marketAnalysis.competitors);
      expect(updatedData.marketAnalysis.trends).toEqual(originalData.marketAnalysis.trends);
    });

    test('devrait gérer les valeurs undefined et null', () => {
      // Arrange & Act
      const result1 = MarketAnalysisAdapter.updateServiceWithUIChanges(null, { segments: [] });
      const result2 = MarketAnalysisAdapter.updateServiceWithUIChanges(mockServiceData, null);
      
      // Assert
      expect(result1).toEqual({});
      expect(result2).toEqual(mockServiceData);
    });
  });

  describe('Méthodes spécifiques', () => {
    test('toCustomerSegments devrait créer des segments client corrects', () => {
      // Act
      const segments = MarketAnalysisAdapter.toCustomerSegments(mockServiceData);
      
      // Assert
      expect(segments).toHaveLength(2);
      expect(segments[0].name).toBe('Freelances tech');
      expect(segments[0].size).toBe('large');
      expect(segments[0].growthRate).toBe('rapid');
      expect(segments[0].needs).toContain('Gestion de projets');
    });

    test('toCompetitors devrait créer des concurrents corrects', () => {
      // Act
      const competitors = MarketAnalysisAdapter.toCompetitors(mockServiceData);
      
      // Assert
      expect(competitors).toHaveLength(2);
      expect(competitors[0].name).toBe('TechSolutions');
      expect(competitors[0].website).toBe('https://techsolutions.com');
      expect(competitors[0].strengths).toContain('Bon service client');
      expect(competitors[1].name).toBe('DigitPro');
      
      // Vérifier les scores calculés
      expect(competitors[0].pricingScore).toBeDefined();
      expect(competitors[0].innovationScore).toBeDefined();
      expect(competitors[0].reputationScore).toBeDefined();
    });

    test('toMarketTrends devrait créer des tendances correctes', () => {
      // Act
      const trends = MarketAnalysisAdapter.toMarketTrends(mockServiceData);
      
      // Assert
      expect(trends).toHaveLength(3);
      expect(trends[0].name).toBe('Adoption du cloud');
      expect(trends[0].description).toContain('Transition vers des services hébergés');
      expect(trends[1].name).toBe('IA et automatisation');
      expect(trends[2].name).toBe('Télétravail');
    });

    test('generateSwotAnalysis devrait créer une analyse SWOT correcte', () => {
      // Act
      const swot = MarketAnalysisAdapter.generateSwotAnalysis(mockServiceData);
      
      // Assert
      expect(swot).toBeDefined();
      expect(swot.strengths).toBeDefined();
      expect(swot.weaknesses).toBeDefined();
      expect(swot.opportunities).toBeDefined();
      expect(swot.threats).toBeDefined();
      
      // Vérifier que les forces sont basées sur les valeurs du pitch
      expect(swot.strengths).toHaveLength(2);
      expect(swot.strengths[0].content).toBe('Innovation');
      expect(swot.strengths[1].content).toBe('Qualité');
      
      // Vérifier que les opportunités sont basées sur les tendances
      expect(swot.opportunities).toHaveLength(3);
      
      // Vérifier que les menaces sont basées sur les forces des concurrents
      expect(swot.threats.length).toBeGreaterThan(0);
    });

    test('calculateStatistics devrait calculer des statistiques correctes', () => {
      // Act
      const stats = MarketAnalysisAdapter.calculateStatistics(mockServiceData);
      
      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalSegments).toBe(2);
      expect(stats.totalCompetitors).toBe(2);
      expect(stats.totalTrends).toBe(3);
      expect(stats.totalOpportunities).toBeGreaterThan(0);
      expect(stats.competitionLevel).toBe('medium');
      expect(stats.potentialCustomersCount).toBeGreaterThan(0);
      expect(stats.marketGrowthRate).toBeDefined();
      expect(stats.estimatedMarketShare).toBeDefined();
    });
  });

  describe('Méthodes dépréciées', () => {
    test('transformToCustomerSegments devrait appeler toCustomerSegments', () => {
      // Arrange
      const spy = jest.spyOn(MarketAnalysisAdapter, 'toCustomerSegments');
      
      // Act
      transformToCustomerSegments(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });

    test('transformToCompetitors devrait appeler toCompetitors', () => {
      // Arrange
      const spy = jest.spyOn(MarketAnalysisAdapter, 'toCompetitors');
      
      // Act
      transformToCompetitors(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });
  });
});
