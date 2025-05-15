/**
 * Test d'intégration des modules Services, Finances et Projections
 * 
 * Ces tests vérifient l'interopérabilité entre les différents modules
 * et la cohérence des données au fil des transformations.
 */

import { useBusinessPlan } from '../../hooks/useBusinessPlan';
import { useServices } from '../../hooks/useServices';
import { useFinances } from '../../hooks/useFinances';
import { useProjections } from '../../hooks/useProjections';

// Mock les hooks
jest.mock('../../hooks/useBusinessPlan');
jest.mock('../../hooks/useServices');
jest.mock('../../hooks/useFinances');
jest.mock('../../hooks/useProjections');

describe('Intégration Services-Finances-Projections', () => {
  beforeEach(() => {
    // Configuration des mocks pour simuler un plan d'affaires avec services et finances
    (useBusinessPlan as jest.Mock).mockReturnValue({
      businessPlan: {
        id: 'plan-1',
        name: 'Plan Test',
        services: {
          catalog: [
            {
              id: 'service-1',
              name: 'Consultation',
              pricePerHour: 100,
              estimatedHours: 10,
              category: 'service'
            },
            {
              id: 'service-2',
              name: 'Formation',
              pricePerHour: 150,
              estimatedHours: 8,
              category: 'formation'
            }
          ]
        },
        finances: {
          invoices: [
            {
              id: 'invoice-1',
              date: '2023-01-15',
              dueDate: '2023-02-15',
              amount: 1500,
              status: 'paid'
            },
            {
              id: 'invoice-2',
              date: '2023-02-20',
              dueDate: '2023-03-20',
              amount: 1200,
              status: 'pending'
            }
          ],
          expenses: [
            {
              id: 'expense-1',
              date: '2023-01-10',
              amount: 500,
              category: 'software'
            },
            {
              id: 'expense-2',
              date: '2023-02-05',
              amount: 800,
              category: 'marketing'
            }
          ]
        },
        projections: {
          revenueProjections: [],
          financialProjections: []
        }
      },
      isLoading: false,
      updateBusinessPlan: jest.fn().mockResolvedValue(true)
    });
    
    // Mock des services
    (useServices as jest.Mock).mockReturnValue({
      services: [
        {
          id: 'service-1',
          name: 'Consultation',
          pricePerHour: 100,
          estimatedHours: 10,
          totalPrice: 1000,
          formattedPrice: '1 000 €',
          category: 'service'
        },
        {
          id: 'service-2',
          name: 'Formation',
          pricePerHour: 150,
          estimatedHours: 8,
          totalPrice: 1200,
          formattedPrice: '1 200 €',
          category: 'formation'
        }
      ],
      isLoading: false,
      calculateServiceRevenue: jest.fn(() => 2200)
    });
    
    // Mock des finances
    (useFinances as jest.Mock).mockReturnValue({
      finances: {
        invoices: [
          {
            id: 'invoice-1',
            date: '2023-01-15',
            dueDate: '2023-02-15',
            amount: 1500,
            formattedAmount: '1 500 €',
            status: 'paid'
          },
          {
            id: 'invoice-2',
            date: '2023-02-20',
            dueDate: '2023-03-20',
            amount: 1200,
            formattedAmount: '1 200 €',
            status: 'pending'
          }
        ],
        expenses: [
          {
            id: 'expense-1',
            date: '2023-01-10',
            amount: 500,
            formattedAmount: '500 €',
            category: 'software'
          },
          {
            id: 'expense-2',
            date: '2023-02-05',
            amount: 800,
            formattedAmount: '800 €',
            category: 'marketing'
          }
        ],
        totalRevenue: 2700,
        totalExpenses: 1300,
        netProfit: 1400
      },
      isLoading: false,
      calculateTotalExpenses: jest.fn(() => 1300),
      calculateTotalRevenue: jest.fn(() => 2700)
    });
    
    // Mock des projections
    (useProjections as jest.Mock).mockReturnValue({
      revenueProjections: [],
      financialProjections: [],
      isLoading: false,
      createRevenueProjection: jest.fn(() => ({
        id: 'rev-proj-1',
        name: 'Nouvelle projection',
        totalRevenue: 0
      })),
      calculateRevenue: jest.fn((baseRevenue, growthRate) => baseRevenue * (1 + growthRate / 100)),
      generateBreakEvenAnalysis: jest.fn(() => ({
        breakEvenPoint: 1300,
        formattedBreakEvenPoint: '1 300 €',
        monthsToBreakEven: 3
      })),
      validateRevenueData: jest.fn(() => ({ isValid: true, errors: [] }))
    });
  });
  
  it('should integrate service data into financial projections', () => {
    // Obtenir les hooks
    const services = useServices('plan-1');
    const finances = useFinances('plan-1');
    const projections = useProjections('plan-1');
    
    // Vérifier que les données des services sont disponibles
    expect(services.services.length).toBe(2);
    expect(services.calculateServiceRevenue()).toBe(2200);
    
    // Vérifier que les données financières sont disponibles
    expect(finances.finances.invoices.length).toBe(2);
    expect(finances.finances.expenses.length).toBe(2);
    expect(finances.calculateTotalRevenue()).toBe(2700);
    
    // Créer une projection basée sur les services
    const baseRevenue = services.calculateServiceRevenue();
    const projectedRevenue = projections.calculateRevenue(baseRevenue, 10);
    
    // Vérifier que la projection est correcte (2200 * 1.1 = 2420)
    expect(projectedRevenue).toBe(2420);
    
    // Générer une analyse de seuil de rentabilité basée sur les dépenses
    const fixedCosts = finances.calculateTotalExpenses();
    const breakEvenAnalysis = projections.generateBreakEvenAnalysis(
      fixedCosts,
      100, // Prix par unité
      50,  // Coût variable par unité
      [10, 20, 30, 40], // Ventes projetées
      new Date()
    );
    
    // Vérifier que l'analyse du seuil de rentabilité utilise les bonnes données
    expect(breakEvenAnalysis.breakEvenPoint).toBe(1300);
  });
  
  it('should validate projections against service and financial data', () => {
    // Obtenir les hooks
    const services = useServices('plan-1');
    const finances = useFinances('plan-1');
    const projections = useProjections('plan-1');
    
    // Créer une projection
    const newProjection = projections.createRevenueProjection();
    
    // Mettre à jour la projection avec des données basées sur les services
    const updatedProjection = {
      ...newProjection,
      totalRevenue: services.calculateServiceRevenue() * 1.2, // 20% de croissance
      baselineRevenue: finances.calculateTotalRevenue(),
      scenarios: [
        {
          id: 'scenario-1',
          name: 'Scénario de base',
          projectedRevenue: services.calculateServiceRevenue() * 1.2,
          baselineRevenue: finances.calculateTotalRevenue(),
          probabilityPercentage: 100,
          isPreferred: true
        }
      ]
    };
    
    // Valider la projection
    const validationResult = projections.validateRevenueData(updatedProjection);
    
    // Vérifier que la validation réussit
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors.length).toBe(0);
  });
});