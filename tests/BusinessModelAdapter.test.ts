/**
 * Test unitaire pour BusinessModelAdapter
 * 
 * Teste les fonctionnalités de conversion bidirectionnelle et les mises à jour partielles.
 */

import { BusinessModelAdapter } from '../src/app/adapters/BusinessModelAdapter';
import { BusinessPlanData } from '../src/app/services/interfaces/dataModels';
import { 
  BusinessModelCanvasData,
  PricingModel
} from '../src/app/interfaces/BusinessModelInterfaces';

describe('BusinessModelAdapter', () => {
  // Données de test
  const mockServiceData: BusinessPlanData = {
    id: 'test-123',
    name: 'Test Business Plan',
    businessModel: {
      hourlyRates: [
        { id: 'rate-1', serviceType: 'Développement', rate: 80, currency: '€' },
        { id: 'rate-2', serviceType: 'Conseil', rate: 100, currency: '€' }
      ],
      packages: [
        { 
          id: 'pkg-1', 
          name: 'Site basique', 
          description: 'Site web simple', 
          price: 1500, 
          currency: '€',
          services: ['Design', 'Développement', 'Hébergement'] 
        }
      ],
      subscriptions: [
        {
          id: 'sub-1',
          name: 'Maintenance Mensuelle',
          description: 'Maintenance et mise à jour',
          monthlyPrice: 50,
          currency: '€',
          features: ['Mises à jour', 'Support']
        }
      ],
      // Propriétés étendues pour le canvas
      partners: [
        { id: 'partner-1', name: 'Hébergeur Web', description: 'Fournit les serveurs', priority: 'high' }
      ],
      activities: [
        { id: 'activity-1', name: 'Développement', description: 'Création de sites web', priority: 'high' }
      ],
      resources: [
        { id: 'resource-1', name: 'Équipe de développeurs', description: 'Experts en développement web', priority: 'high' }
      ],
      valuePropositions: [
        { id: 'value-1', name: 'Sites web performants', description: 'Sites optimisés pour le SEO', priority: 'high' }
      ],
      customerRelations: [
        { id: 'relation-1', name: 'Support personnalisé', description: 'Assistance dédiée', priority: 'medium' }
      ],
      channels: [
        { id: 'channel-1', name: 'Site web', description: 'Présentation des services', priority: 'medium' }
      ],
      segments: [
        { id: 'segment-1', name: 'PME', description: 'Petites et moyennes entreprises', priority: 'high' }
      ],
      costStructure: [
        { id: 'cost-1', name: 'Serveurs', description: 'Coûts d\'hébergement', priority: 'medium' }
      ],
      revenueStreams: [
        { id: 'revenue-1', name: 'Abonnements', description: 'Revenus récurrents', priority: 'high' }
      ],
      customPricing: [
        { 
          id: 'custom-1', 
          name: 'Projet sur mesure', 
          description: 'Prix selon spécifications', 
          minPrice: 2000,
          maxPrice: 10000,
          currency: '€',
          pricingFactors: ['Complexité', 'Délai']
        }
      ]
    },
    // Ajout des champs requis pour la structure BusinessPlanData
    pitch: { title: '', summary: '', vision: '', values: [] },
    services: { offerings: [], technologies: [], process: [] },
    marketAnalysis: { competitors: [], targetClients: [], trends: [] },
    financials: { initialInvestment: 0, quarterlyGoals: [], expenses: [] },
    actionPlan: { milestones: [], tasks: [] }
  };

  describe('toUI', () => {
    test('devrait transformer correctement les données de service en données UI', () => {
      // Act
      const uiData = BusinessModelAdapter.toUI(mockServiceData);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.canvas).toBeDefined();
      expect(uiData.pricing).toBeDefined();
      
      // Canvas - vérifier que toutes les sections sont présentes
      expect(uiData.canvas.partners.length).toBe(1);
      expect(uiData.canvas.partners[0].name).toBe('Hébergeur Web');
      expect(uiData.canvas.activities.length).toBe(1);
      expect(uiData.canvas.resources.length).toBe(1);
      expect(uiData.canvas.valueProposition.length).toBe(1);
      expect(uiData.canvas.customerRelations.length).toBe(1);
      expect(uiData.canvas.channels.length).toBe(1);
      expect(uiData.canvas.segments.length).toBe(1);
      expect(uiData.canvas.costStructure.length).toBe(1);
      expect(uiData.canvas.revenueStreams.length).toBe(1);
      
      // Pricing - vérifier que toutes les sections sont présentes
      expect(uiData.pricing.hourlyRates.length).toBe(2);
      expect(uiData.pricing.hourlyRates[0].ratePerHour).toBe(80);
      expect(uiData.pricing.packages.length).toBe(1);
      expect(uiData.pricing.packages[0].features.length).toBe(3);
      expect(uiData.pricing.subscriptions.length).toBe(1);
      expect(uiData.pricing.custom.length).toBe(1);
      expect(uiData.pricing.custom[0].priceRange.min).toBe(2000);
    });

    test('devrait gérer les données nulles ou undefined', () => {
      // Arrange
      const emptyData = null;
      const incompleteData: Partial<BusinessPlanData> = {
        id: 'incomplete',
        name: 'Incomplet',
        businessModel: {
          hourlyRates: [],
          packages: [],
          subscriptions: []
        }
      };
      
      // Act
      const emptyResult = BusinessModelAdapter.toUI(emptyData as any);
      const incompleteResult = BusinessModelAdapter.toUI(incompleteData as BusinessPlanData);
      
      // Assert
      expect(emptyResult).toBeDefined();
      expect(emptyResult.canvas).toBeDefined();
      expect(emptyResult.pricing).toBeDefined();
      
      expect(incompleteResult).toBeDefined();
      expect(incompleteResult.canvas.partners).toEqual([]);
      expect(incompleteResult.pricing.hourlyRates).toEqual([]);
    });
  });

  describe('toService', () => {
    test('devrait transformer correctement les données UI en données de service', () => {
      // Arrange
      const uiData = BusinessModelAdapter.toUI(mockServiceData);
      
      // Act
      const serviceData = BusinessModelAdapter.toService(uiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.businessModel).toBeDefined();
      
      // Vérifier les transformations des tarifs
      const hourlyRates = serviceData.businessModel.hourlyRates;
      expect(hourlyRates).toBeDefined();
      expect(hourlyRates[0].serviceType).toBe('Développement');
      expect(hourlyRates[0].rate).toBe(80);
      
      // Vérifier les transformations des forfaits
      const packages = serviceData.businessModel.packages;
      expect(packages).toBeDefined();
      expect(packages[0].name).toBe('Site basique');
      expect(packages[0].services.length).toBe(3);
      
      // Vérifier les transformations des abonnements
      const subscriptions = serviceData.businessModel.subscriptions;
      expect(subscriptions).toBeDefined();
      expect(subscriptions[0].monthlyPrice).toBe(50);
    });

    test('devrait gérer les données UI partielles', () => {
      // Arrange
      const partialUiData = {
        canvas: {
          partners: [{ id: 'new-partner', name: 'Nouveau Partenaire', description: 'Description test', priority: 'medium' }],
          activities: [],
          resources: [],
          valueProposition: [],
          customerRelations: [],
          channels: [],
          segments: [],
          costStructure: [],
          revenueStreams: []
        } as BusinessModelCanvasData
      };
      
      // Act
      const serviceData = BusinessModelAdapter.toService(partialUiData);
      
      // Assert
      expect(serviceData).toBeDefined();
      expect(serviceData.businessModel).toBeDefined();
      expect((serviceData.businessModel as any).partners).toBeDefined();
      expect((serviceData.businessModel as any).partners[0].name).toBe('Nouveau Partenaire');
    });
  });

  describe('updateServiceWithUIChanges', () => {
    test('devrait fusionner correctement les modifications partielles', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      const uiChanges = {
        canvas: {
          partners: [
            { id: 'partner-1', name: 'Hébergeur Web Premium', description: 'Serveurs haute performance', priority: 'high' },
            { id: 'partner-2', name: 'Nouveau Partenaire', description: 'Description', priority: 'medium' }
          ]
        },
        pricing: {
          hourlyRates: [
            { id: 'rate-1', title: 'Développement Avancé', description: 'Dev complexe', ratePerHour: 90, currency: '€' }
          ]
        }
      };
      
      // Act
      const updatedData = BusinessModelAdapter.updateServiceWithUIChanges(originalData, uiChanges);
      
      // Assert
      expect(updatedData).toBeDefined();
      expect(updatedData.businessModel).toBeDefined();
      
      // Vérifier que le partenaire existant a été mis à jour
      const partners = (updatedData.businessModel as any).partners;
      expect(partners.length).toBe(2);
      expect(partners.find((p: any) => p.id === 'partner-1').name).toBe('Hébergeur Web Premium');
      
      // Vérifier que le nouveau partenaire a été ajouté
      expect(partners.find((p: any) => p.id === 'partner-2')).toBeDefined();
      
      // Vérifier que le tarif horaire a été mis à jour
      const hourlyRates = updatedData.businessModel.hourlyRates;
      expect(hourlyRates.find(r => r.id === 'rate-1')?.rate).toBe(90);
      
      // Vérifier que le second tarif n'a pas été modifié
      expect(hourlyRates.find(r => r.id === 'rate-2')?.rate).toBe(100);
    });

    test('devrait gérer les valeurs undefined et null', () => {
      // Arrange
      const originalData = { ...mockServiceData };
      
      // Act
      const nullResult = BusinessModelAdapter.updateServiceWithUIChanges(originalData, null as any);
      const undefinedResult = BusinessModelAdapter.updateServiceWithUIChanges(originalData, undefined as any);
      const emptyResult = BusinessModelAdapter.updateServiceWithUIChanges(originalData, {});
      
      // Assert
      expect(nullResult).toEqual(originalData);
      expect(undefinedResult).toEqual(originalData);
      expect(emptyResult).toEqual(originalData);
    });
  });

  describe('Méthodes dépréciées', () => {
    test('transformToBusinessModelCanvas devrait appeler toBusinessModelCanvas', () => {
      // Arrange
      const spy = jest.spyOn(BusinessModelAdapter, 'toBusinessModelCanvas');
      
      // Act
      BusinessModelAdapter.transformToBusinessModelCanvas(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });

    test('transformToPricingModel devrait appeler toPricingModel', () => {
      // Arrange
      const spy = jest.spyOn(BusinessModelAdapter, 'toPricingModel');
      
      // Act
      BusinessModelAdapter.transformToPricingModel(mockServiceData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(mockServiceData);
      
      // Cleanup
      spy.mockRestore();
    });
  });
});
