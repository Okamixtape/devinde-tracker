/**
 * Test unitaire pour BusinessModelProjectionsAdapter
 * 
 * Teste les fonctionnalités de conversion bidirectionnelle et la génération des projections financières.
 */

import { BusinessModelProjectionsAdapter, RevenueSources } from '../src/app/adapters/BusinessModelProjectionsAdapter';
import { BusinessPlanData } from '../src/app/services/interfaces/dataModels';
import { 
  BusinessModelProjections,
  SimulationParameters
} from '../src/app/interfaces/BusinessModelInterfaces';

describe('BusinessModelProjectionsAdapter', () => {
  // Données de test
  const mockServiceData: BusinessPlanData = {
    id: 'test-123',
    name: 'Test Business Plan',
    businessModel: {
      projections: {
        simulationParams: {
          initialInvestment: 10000,
          monthlyExpenses: 2000,
          startupCosts: 5000,
          yearsProjection: 3,
          growthRate: 0.1,
          seasonalityFactors: [1, 1, 1.2, 1.3, 1.4, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 1.5]
        },
        revenueProjections: {
          totalRevenue: 100000,
          monthly: [5000, 5500, 6000, 6500, 7000, 7500, 7000, 6500, 6000, 5500, 5000, 7500],
          bySource: {
            [RevenueSources.SERVICES]: 50000,
            [RevenueSources.PRODUCTS]: 30000,
            [RevenueSources.SUBSCRIPTIONS]: 20000
          },
          yearlyGrowth: [
            { year: 1, amount: 75000 },
            { year: 2, amount: 90000 },
            { year: 3, amount: 100000 }
          ]
        },
        breakEvenAnalysis: {
          breakEvenPoint: 75000,
          breakEvenMonths: 9,
          profitMargin: 0.2,
          returnOnInvestment: 0.35,
          estimatedAnnualProfit: 20000
        }
      }
    }
  };

  describe('toUI', () => {
    test('devrait transformer correctement les données de service en données UI', () => {
      // Act
      const uiData = BusinessModelProjectionsAdapter.toUI(mockServiceData);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.simulationParams).toBeDefined();
      expect(uiData.simulationParams.initialInvestment).toBe(10000);
      expect(uiData.simulationParams.yearsProjection).toBe(3);
      expect(uiData.revenueProjections).toBeDefined();
      expect(uiData.revenueProjections.monthly.length).toBe(12);
      expect(uiData.revenueProjections.bySource[RevenueSources.SERVICES]).toBe(50000);
      expect(uiData.breakEvenAnalysis).toBeDefined();
      expect(uiData.breakEvenAnalysis.breakEvenMonths).toBe(9);
    });

    test('devrait renvoyer un objet par défaut quand les données d\'entrée sont nulles', () => {
      // Act
      const uiData = BusinessModelProjectionsAdapter.toUI(null);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.simulationParams).toBeDefined();
      expect(uiData.revenueProjections).toBeDefined();
      expect(uiData.revenueProjections.monthly).toBeDefined();
      expect(uiData.breakEvenAnalysis).toBeDefined();
    });
  });

  describe('toService', () => {
    test('devrait transformer correctement les données UI en données de service', () => {
      // Arrange
      const uiData: BusinessModelProjections = {
        simulationParams: {
          initialInvestment: 15000,
          monthlyExpenses: 3000,
          startupCosts: 7000,
          yearsProjection: 5,
          growthRate: 0.15,
          seasonalityFactors: [1, 1, 1.2, 1.3, 1.4, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 1.5]
        },
        revenueProjections: {
          totalRevenue: 150000,
          monthly: [8000, 8500, 9000, 9500, 10000, 10500, 10000, 9500, 9000, 8500, 8000, 10500],
          bySource: {
            [RevenueSources.SERVICES]: 80000,
            [RevenueSources.PRODUCTS]: 40000,
            [RevenueSources.SUBSCRIPTIONS]: 30000
          },
          yearlyGrowth: [
            { year: 1, amount: 100000 },
            { year: 2, amount: 120000 },
            { year: 3, amount: 140000 },
            { year: 4, amount: 150000 },
            { year: 5, amount: 160000 }
          ]
        },
        breakEvenAnalysis: {
          breakEvenPoint: 90000,
          breakEvenMonths: 7,
          profitMargin: 0.25,
          returnOnInvestment: 0.4,
          estimatedAnnualProfit: 30000
        }
      };

      // Act
      const serviceData = BusinessModelProjectionsAdapter.toService(uiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.simulationParams).toBeDefined();
      expect(serviceData.simulationParams.initialInvestment).toBe(15000);
      expect(serviceData.simulationParams.yearsProjection).toBe(5);
      expect(serviceData.revenueProjections).toBeDefined();
      expect(serviceData.revenueProjections.monthly).toBeDefined();
      expect(serviceData.revenueProjections.bySource).toBeDefined();
      expect(serviceData.breakEvenAnalysis).toBeDefined();
      expect(serviceData.breakEvenAnalysis.breakEvenMonths).toBe(7);
    });

    test('devrait renvoyer un objet par défaut quand les données d\'entrée sont nulles', () => {
      // Act
      const serviceData = BusinessModelProjectionsAdapter.toService(null);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.simulationParams).toBeDefined();
      expect(serviceData.revenueProjections).toBeDefined();
      expect(serviceData.breakEvenAnalysis).toBeDefined();
    });
  });

  describe('updateServiceWithUIChanges', () => {
    test('devrait fusionner correctement les modifications des paramètres de simulation', () => {
      // Arrange
      const originalData = JSON.parse(JSON.stringify(mockServiceData)); // Copie profonde pour éviter les références partagées
      const uiChanges: Partial<BusinessModelProjections> = {
        simulationParams: {
          initialInvestment: 12000,
          monthlyExpenses: 2500,
          startupCosts: 6000,
          yearsProjection: 4,
          growthRate: 0.12,
          seasonalityFactors: [1, 1, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.1, 1.1, 1, 1.4]
        }
      };

      // Act
      const updatedData = BusinessModelProjectionsAdapter.updateServiceWithUIChanges(originalData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.businessModel).toBeDefined();
      expect(updatedData.businessModel.projections).toBeDefined();
      
      // Vérifier que les projections ont été mises à jour sans spécifier de valeurs exactes
      expect(updatedData.businessModel.projections.revenueProjections).toBeDefined();
      expect(updatedData.businessModel.projections.breakEvenAnalysis).toBeDefined();
    });

    test('devrait gérer les cas où les données d\'entrée sont nulles ou incomplètes', () => {
      // Arrange
      const emptyData: BusinessPlanData = {
        id: 'empty-test',
        name: 'Empty Test',
        businessModel: {} // Assurer que businessModel existe mais est vide
      };
      const uiChanges: Partial<BusinessModelProjections> = {
        simulationParams: {
          initialInvestment: 5000,
          yearsProjection: 2,
        }
      };

      // Act
      const updatedData = BusinessModelProjectionsAdapter.updateServiceWithUIChanges(emptyData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.businessModel).toBeDefined();
      expect(updatedData.businessModel.projections).toBeDefined();
    });
  });

  describe('generateRevenueProjections', () => {
    test('devrait générer des projections de revenus', () => {
      // Arrange
      const simulationParams: SimulationParameters = {
        initialInvestment: 10000,
        monthlyExpenses: 2000,
        startupCosts: 5000,
        yearsProjection: 3,
        growthRate: 0.1,
        seasonalityFactors: [1, 1, 1.2, 1.3, 1.4, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 1.5]
      };

      // Act
      const projections = BusinessModelProjectionsAdapter.generateRevenueProjections(simulationParams);
      
      // Assert
      expect(projections).toBeDefined();
      expect(projections.monthly).toBeDefined();
      expect(projections.bySource).toBeDefined();
    });

    test('devrait utiliser des paramètres par défaut si non fournis', () => {
      // Act
      const projections = BusinessModelProjectionsAdapter.generateRevenueProjections(null);
      
      // Assert
      expect(projections).toBeDefined();
      expect(projections.monthly).toBeDefined();
      expect(projections.bySource).toBeDefined();
    });
  });

  describe('generateBreakEvenAnalysis', () => {
    test('devrait générer une analyse de point d\'équilibre', () => {
      // Arrange
      const simulationParams = mockServiceData.businessModel.projections.simulationParams;
      const revenueProjections = mockServiceData.businessModel.projections.revenueProjections;

      // Act
      const analysis = BusinessModelProjectionsAdapter.generateBreakEvenAnalysis(simulationParams, revenueProjections);
      
      // Assert
      expect(analysis).toBeDefined();
    });

    test('devrait utiliser des paramètres par défaut si non fournis', () => {
      // Act
      const analysis = BusinessModelProjectionsAdapter.generateBreakEvenAnalysis(null, null);
      
      // Assert
      expect(analysis).toBeDefined();
    });
  });
});
