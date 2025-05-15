/**
 * Tests des interfaces du modèle économique
 * 
 * Ce fichier définit des tests TypeScript pour vérifier que les interfaces
 * fonctionnent correctement et sont compatibles avec les structures de données
 * existantes.
 */

import { 
  UIBusinessModel,
  UIBusinessModelCanvas,
  UIPricingModel,
  UIHourlyRateModel, 
  UIPackageModel,
  UISubscriptionModel,
  ServiceHourlyRateModel,
  ServicePackageModel,
  ServiceSubscriptionModel,
  RevenueSourceType
} from './business-model';

import { 
  UIBusinessModelProjections,
  ServiceBusinessModelProjections,
  RevenueProjections,
  BreakEvenAnalysis
} from './projections';

import { PriorityLevel } from '../common/common-types';

// Test de création d'un modèle UI
describe('BusinessModel UI Interfaces', () => {
  it('should create valid UI models', () => {
    // Création d'un élément du canvas
    const canvasItem: UICanvasItem = {
      id: '1',
      name: 'Partenariat clé',
      description: 'Description du partenariat',
      priority: PriorityLevel.HIGH,
      color: '#4C51BF'
    };
    
    expect(canvasItem.id).toBe('1');
    expect(canvasItem.priority).toBe(PriorityLevel.HIGH);
    
    // Création d'un modèle de tarification horaire
    const hourlyRate: UIHourlyRateModel = {
      id: 'hr1',
      title: 'Développement web',
      description: 'Services de développement web',
      ratePerHour: 75,
      currency: '€',
      minHours: 4
    };
    
    expect(hourlyRate.ratePerHour).toBe(75);
    expect(hourlyRate.minHours).toBe(4);
    
    // Création d'un forfait
    const packageModel: UIPackageModel = {
      id: 'pkg1',
      title: 'Site vitrine',
      description: 'Création de site vitrine',
      price: 1500,
      currency: '€',
      features: ['Design responsive', '5 pages', 'SEO de base'],
      popular: true
    };
    
    expect(packageModel.price).toBe(1500);
    expect(packageModel.features.length).toBe(3);
    
    // Création d'un abonnement
    const subscription: UISubscriptionModel = {
      id: 'sub1',
      title: 'Maintenance mensuelle',
      description: 'Service de maintenance',
      monthlyPrice: 95,
      currency: '€',
      billingFrequency: 'monthly',
      features: ['Mises à jour', 'Sauvegardes', 'Support']
    };
    
    expect(subscription.monthlyPrice).toBe(95);
    expect(subscription.billingFrequency).toBe('monthly');
  });
});

// Test de compatibilité avec les modèles service existants
describe('BusinessModel Service Interfaces', () => {
  it('should be compatible with existing service models', () => {
    // Modèle service existant
    const existingServiceModel = {
      id: 'hr1',
      serviceType: 'Développement web',
      rate: 75,
      currency: '€',
      name: 'Développement web',
      description: 'Services de développement web'
    };
    
    // Vérification de compatibilité
    const serviceModel: ServiceHourlyRateModel = existingServiceModel;
    
    expect(serviceModel.id).toBe('hr1');
    expect(serviceModel.rate).toBe(75);
    expect(serviceModel.serviceType).toBe('Développement web');
  });
});

// Test de compatibilité avec BusinessModelProjections
describe('BusinessModelProjections Interfaces', () => {
  it('should create valid projection models', () => {
    // Création de projections de revenus
    const revenueProjections: RevenueProjections = {
      monthly: [
        {
          month: 0,
          year: 2023,
          label: 'Janvier 2023',
          revenue: 5000,
          expenses: 3000,
          profit: 2000,
          bySource: [
            { sourceType: RevenueSourceType.HOURLY, amount: 3000 },
            { sourceType: RevenueSourceType.PACKAGE, amount: 2000 }
          ]
        }
      ],
      quarterly: [
        {
          quarter: 1,
          year: 2023,
          label: 'T1 2023',
          revenue: 15000,
          expenses: 9000,
          profit: 6000,
          bySource: [
            { sourceType: RevenueSourceType.HOURLY, amount: 9000 },
            { sourceType: RevenueSourceType.PACKAGE, amount: 6000 }
          ]
        }
      ],
      annual: {
        firstYear: {
          revenue: 60000,
          expenses: 36000,
          profit: 24000,
          roi: 0.8
        },
        threeYear: {
          revenue: 200000,
          expenses: 120000,
          profit: 80000,
          cagr: 0.2
        },
        fiveYear: {
          revenue: 400000,
          expenses: 200000,
          profit: 200000,
          cagr: 0.15
        }
      },
      bySource: [
        {
          sourceType: RevenueSourceType.HOURLY,
          amount: 30000,
          percentage: 50,
          color: '#4C51BF'
        },
        {
          sourceType: RevenueSourceType.PACKAGE,
          amount: 20000,
          percentage: 33.3,
          color: '#38B2AC'
        },
        {
          sourceType: RevenueSourceType.SUBSCRIPTION,
          amount: 10000,
          percentage: 16.7,
          color: '#ED8936'
        }
      ]
    };
    
    expect(revenueProjections.monthly.length).toBe(1);
    expect(revenueProjections.annual.firstYear.revenue).toBe(60000);
    expect(revenueProjections.bySource.length).toBe(3);
    
    // Création d'une analyse de point d'équilibre
    const breakEvenAnalysis: BreakEvenAnalysis = {
      daysToBreakEven: 180,
      monthsToBreakEven: 6,
      breakEvenDate: new Date('2023-06-30'),
      breakEvenAmount: 30000,
      breakEvenChart: [
        {
          period: 'Initial',
          revenue: 0,
          expenses: 10000,
          cumulativeProfit: -10000
        },
        {
          period: 'Mois 1',
          revenue: 5000,
          expenses: 3000,
          cumulativeProfit: -8000
        }
      ]
    };
    
    expect(breakEvenAnalysis.monthsToBreakEven).toBe(6);
    expect(breakEvenAnalysis.breakEvenChart.length).toBe(2);
  });
});