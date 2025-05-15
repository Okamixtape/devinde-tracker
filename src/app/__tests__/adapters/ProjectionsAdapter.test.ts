import { ProjectionsAdapter } from '../../adapters/projections/ProjectionsAdapter';
import { 
  ServiceRevenueProjection,
  ServiceRevenueScenario,
  ServiceRevenueBreakdown,
  ServiceBreakEvenAnalysis
} from '../../interfaces/projections/revenue-projections';
import {
  ServiceFinancialProjection,
  ServiceIncomeStatement,
  ServiceCashFlowStatement,
  ServiceBalanceSheet,
  ServiceProfitabilityAnalysis
} from '../../interfaces/projections/financial-projections';

describe('ProjectionsAdapter', () => {
  let adapter: ProjectionsAdapter;
  
  beforeEach(() => {
    adapter = new ProjectionsAdapter();
  });
  
  describe('revenue projections', () => {
    const mockServiceRevenueScenario: ServiceRevenueScenario = {
      id: 'scenario-1',
      name: 'Baseline Scenario',
      description: 'Standard growth projection',
      projectedRevenue: 150000,
      baselineRevenue: 120000,
      probabilityPercentage: 70,
      assumptions: ['5% market growth', 'No new competitors'],
      isPreferred: true,
      monthlyBreakdown: []
    };
    
    const mockServiceRevenueBreakdown: ServiceRevenueBreakdown = {
      totalAmount: 150000,
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      categories: [
        { id: 'cat-1', name: 'Services', amount: 100000, source: 'manual' },
        { id: 'cat-2', name: 'Produits', amount: 50000, source: 'manual' }
      ]
    };
    
    const mockServiceBreakEvenAnalysis: ServiceBreakEvenAnalysis = {
      breakEvenPoint: 120000,
      breakEvenDate: '2023-06-15T00:00:00.000Z',
      monthsToBreakEven: 6,
      fixedCosts: 60000,
      variableCostsPerUnit: 50,
      revenuePerUnit: 100,
      unitsAtBreakEven: 1200,
      assumptions: ['Fixed costs: 60000€']
    };
    
    const mockServiceRevenueProjection: ServiceRevenueProjection = {
      id: 'proj-1',
      planId: 'plan-1',
      name: 'Annual Revenue Projection',
      description: 'Revenue projection for 2023',
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      totalRevenue: 150000,
      previousPeriodRevenue: 120000,
      calculationMethod: 'linear',
      confidenceLevel: 'medium',
      lastUpdated: '2023-01-01T00:00:00.000Z',
      scenarios: [mockServiceRevenueScenario],
      revenueBreakdown: mockServiceRevenueBreakdown,
      breakEvenAnalysis: mockServiceBreakEvenAnalysis
    };
    
    it('should transform service revenue projection to UI format correctly', () => {
      const uiProjection = adapter.toUIRevenueProjection(mockServiceRevenueProjection);
      
      // Check basic fields
      expect(uiProjection.id).toBe(mockServiceRevenueProjection.id);
      expect(uiProjection.name).toBe(mockServiceRevenueProjection.name);
      expect(uiProjection.totalRevenue).toBe(150000);
      
      // Check UI-specific fields
      expect(uiProjection.displayCurrency).toBe('€');
      expect(uiProjection.formattedTotalRevenue).toBe('150 000 €');
      expect(uiProjection.percentGrowth).toBe('25.0%');
      expect(uiProjection.isEditable).toBe(true);
      
      // Check nested objects transformation
      expect(uiProjection.scenarios.length).toBe(1);
      expect(uiProjection.scenarios[0].formattedRevenue).toBe('150 000 €');
      expect(uiProjection.scenarios[0].percentChange).toBe('25.0%');
      expect(uiProjection.scenarios[0].colorCode).toBe('#4CAF50'); // Should be green for preferred scenario
      
      // Check breakdown transformation
      expect(uiProjection.revenueBreakdown.categories.length).toBe(2);
      expect(uiProjection.revenueBreakdown.categories[0].formattedAmount).toBe('100 000 €');
      expect(uiProjection.revenueBreakdown.categories[0].percentage).toBe('66.7%');
      
      // Check break-even analysis transformation
      expect(uiProjection.breakEvenAnalysis).toBeDefined();
      if (uiProjection.breakEvenAnalysis) {
        expect(uiProjection.breakEvenAnalysis.formattedBreakEvenPoint).toBe('120 000 €');
        expect(uiProjection.breakEvenAnalysis.formattedBreakEvenDate).toBe('15/06/2023');
        expect(uiProjection.breakEvenAnalysis.statusColor).toBe('#FFC107'); // Yellow for 6 months
      }
    });
    
    it('should transform UI revenue projection back to service format correctly', () => {
      // First convert to UI
      const uiProjection = adapter.toUIRevenueProjection(mockServiceRevenueProjection);
      
      // Then convert back to service format
      const serviceProjection = adapter.toServiceRevenueProjection(uiProjection);
      
      // Check that essential data is preserved
      expect(serviceProjection.id).toBe(mockServiceRevenueProjection.id);
      expect(serviceProjection.planId).toBe(mockServiceRevenueProjection.planId);
      expect(serviceProjection.name).toBe(mockServiceRevenueProjection.name);
      expect(serviceProjection.totalRevenue).toBe(mockServiceRevenueProjection.totalRevenue);
      expect(serviceProjection.previousPeriodRevenue).toBe(mockServiceRevenueProjection.previousPeriodRevenue);
      
      // Check that scenario data is preserved
      expect(serviceProjection.scenarios.length).toBe(1);
      expect(serviceProjection.scenarios[0].id).toBe(mockServiceRevenueScenario.id);
      expect(serviceProjection.scenarios[0].projectedRevenue).toBe(mockServiceRevenueScenario.projectedRevenue);
      
      // Check that breakdown data is preserved
      expect(serviceProjection.revenueBreakdown.categories.length).toBe(2);
      expect(serviceProjection.revenueBreakdown.categories[0].id).toBe(mockServiceRevenueBreakdown.categories[0].id);
      
      // Check that break-even data is preserved
      expect(serviceProjection.breakEvenAnalysis).toBeDefined();
      if (serviceProjection.breakEvenAnalysis) {
        expect(serviceProjection.breakEvenAnalysis.breakEvenPoint).toBe(mockServiceBreakEvenAnalysis.breakEvenPoint);
        expect(serviceProjection.breakEvenAnalysis.monthsToBreakEven).toBe(mockServiceBreakEvenAnalysis.monthsToBreakEven);
      }
      
      // Verify UI-specific fields are not present in service format
      expect((serviceProjection as any).formattedTotalRevenue).toBeUndefined();
      expect((serviceProjection as any).percentGrowth).toBeUndefined();
      expect((serviceProjection as any).isEditable).toBeUndefined();
    });
    
    it('should create a new revenue projection with default values', () => {
      const planId = 'plan-123';
      const newProjection = adapter.createNewRevenueProjection(planId);
      
      // Check basic fields are initialized
      expect(newProjection.id).toBeDefined();
      expect(newProjection.planId).toBe(planId);
      expect(newProjection.name).toBe('Nouvelle projection de revenus');
      expect(newProjection.totalRevenue).toBe(0);
      
      // Check scenarios have been initialized
      expect(newProjection.scenarios.length).toBe(1);
      expect(newProjection.scenarios[0].isPreferred).toBe(true);
      
      // Check UI-specific fields
      expect(newProjection.formattedTotalRevenue).toBe('0 €');
      expect(newProjection.isEditable).toBe(true);
    });
  });
  
  describe('financial projections', () => {
    const mockServiceIncomeStatement: ServiceIncomeStatement = {
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      revenue: 200000,
      costOfSales: 80000,
      grossProfit: 120000,
      operatingExpenses: 50000,
      operatingProfit: 70000,
      taxes: 20000,
      netProfit: 50000,
      revenueItems: [],
      expenseItems: []
    };
    
    const mockServiceCashFlowStatement: ServiceCashFlowStatement = {
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      operatingCashFlow: 60000,
      investingCashFlow: -20000,
      financingCashFlow: 10000,
      netCashFlow: 50000,
      beginningCashBalance: 30000,
      endingCashBalance: 80000,
      operatingActivities: [],
      investingActivities: [],
      financingActivities: []
    };
    
    const mockServiceBalanceSheet: ServiceBalanceSheet = {
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      currentAssets: 100000,
      nonCurrentAssets: 200000,
      totalAssets: 300000,
      currentLiabilities: 50000,
      nonCurrentLiabilities: 100000,
      totalLiabilities: 150000,
      equity: 150000,
      assetItems: [],
      liabilityItems: [],
      equityItems: []
    };
    
    const mockServiceProfitabilityAnalysis: ServiceProfitabilityAnalysis = {
      roi: 15,
      npv: 50000,
      irr: 18,
      paybackPeriod: 3.5,
      discountRate: 10,
      initialInvestment: 100000,
      cashFlows: [30000, 35000, 40000, 45000]
    };
    
    const mockServiceFinancialProjection: ServiceFinancialProjection = {
      id: 'fin-proj-1',
      planId: 'plan-1',
      name: 'Annual Financial Projection',
      description: 'Financial projection for 2023',
      period: {
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        periodType: 'annual'
      },
      totalRevenue: 200000,
      totalExpenses: 150000,
      netProfit: 50000,
      taxRate: 25,
      lastUpdated: '2023-01-01T00:00:00.000Z',
      incomeStatement: mockServiceIncomeStatement,
      cashFlowStatement: mockServiceCashFlowStatement,
      balanceSheet: mockServiceBalanceSheet,
      profitabilityAnalysis: mockServiceProfitabilityAnalysis
    };
    
    it('should transform service financial projection to UI format correctly', () => {
      const uiProjection = adapter.toUIFinancialProjection(mockServiceFinancialProjection);
      
      // Check basic fields
      expect(uiProjection.id).toBe(mockServiceFinancialProjection.id);
      expect(uiProjection.name).toBe(mockServiceFinancialProjection.name);
      
      // Check UI-specific fields
      expect(uiProjection.formattedTotalRevenue).toBe('200 000 €');
      expect(uiProjection.formattedTotalExpenses).toBe('150 000 €');
      expect(uiProjection.formattedNetProfit).toBe('50 000 €');
      expect(uiProjection.profitMargin).toBe('25.0%');
      expect(uiProjection.isEditable).toBe(true);
      
      // Check income statement transformation
      expect(uiProjection.incomeStatement.formattedRevenue).toBe('200 000 €');
      expect(uiProjection.incomeStatement.formattedGrossProfit).toBe('120 000 €');
      expect(uiProjection.incomeStatement.grossProfitMargin).toBe('60.0%');
      
      // Check cash flow statement transformation
      expect(uiProjection.cashFlowStatement.formattedOperatingCashFlow).toBe('60 000 €');
      expect(uiProjection.cashFlowStatement.formattedNetCashFlow).toBe('50 000 €');
      expect(uiProjection.cashFlowStatement.cashFlowTrend).toBe('positive');
      
      // Check balance sheet transformation
      expect(uiProjection.balanceSheet.formattedTotalAssets).toBe('300 000 €');
      expect(uiProjection.balanceSheet.formattedTotalLiabilities).toBe('150 000 €');
      expect(uiProjection.balanceSheet.debtToEquityRatio).toBe('1.00');
      
      // Check profitability analysis transformation
      expect(uiProjection.profitabilityAnalysis.formattedROI).toBe('15.00%');
      expect(uiProjection.profitabilityAnalysis.formattedNPV).toBe('50 000 €');
      expect(uiProjection.profitabilityAnalysis.npvStatus).toBe('positive');
      expect(uiProjection.profitabilityAnalysis.roiComparison).toBe('good');
    });
    
    it('should transform UI financial projection back to service format correctly', () => {
      // First convert to UI
      const uiProjection = adapter.toUIFinancialProjection(mockServiceFinancialProjection);
      
      // Then convert back to service format
      const serviceProjection = adapter.toServiceFinancialProjection(uiProjection);
      
      // Check that essential data is preserved
      expect(serviceProjection.id).toBe(mockServiceFinancialProjection.id);
      expect(serviceProjection.planId).toBe(mockServiceFinancialProjection.planId);
      expect(serviceProjection.name).toBe(mockServiceFinancialProjection.name);
      expect(serviceProjection.totalRevenue).toBe(mockServiceFinancialProjection.totalRevenue);
      expect(serviceProjection.totalExpenses).toBe(mockServiceFinancialProjection.totalExpenses);
      expect(serviceProjection.netProfit).toBe(mockServiceFinancialProjection.netProfit);
      
      // Check that income statement data is preserved
      expect(serviceProjection.incomeStatement.revenue).toBe(mockServiceIncomeStatement.revenue);
      expect(serviceProjection.incomeStatement.grossProfit).toBe(mockServiceIncomeStatement.grossProfit);
      
      // Check that cash flow data is preserved
      expect(serviceProjection.cashFlowStatement.operatingCashFlow).toBe(mockServiceCashFlowStatement.operatingCashFlow);
      expect(serviceProjection.cashFlowStatement.netCashFlow).toBe(mockServiceCashFlowStatement.netCashFlow);
      
      // Check that balance sheet data is preserved
      expect(serviceProjection.balanceSheet.totalAssets).toBe(mockServiceBalanceSheet.totalAssets);
      expect(serviceProjection.balanceSheet.equity).toBe(mockServiceBalanceSheet.equity);
      
      // Check that profitability data is preserved
      expect(serviceProjection.profitabilityAnalysis.roi).toBe(mockServiceProfitabilityAnalysis.roi);
      expect(serviceProjection.profitabilityAnalysis.npv).toBe(mockServiceProfitabilityAnalysis.npv);
      
      // Verify UI-specific fields are not present in service format
      expect((serviceProjection as any).formattedTotalRevenue).toBeUndefined();
      expect((serviceProjection as any).profitMargin).toBeUndefined();
      expect((serviceProjection as any).isEditable).toBeUndefined();
      expect((serviceProjection.incomeStatement as any).formattedRevenue).toBeUndefined();
    });
    
    it('should create a new financial projection with default values', () => {
      const planId = 'plan-123';
      const newProjection = adapter.createNewFinancialProjection(planId);
      
      // Check basic fields are initialized
      expect(newProjection.id).toBeDefined();
      expect(newProjection.planId).toBe(planId);
      expect(newProjection.name).toBe('Nouvelle projection financière');
      expect(newProjection.totalRevenue).toBe(0);
      expect(newProjection.totalExpenses).toBe(0);
      expect(newProjection.netProfit).toBe(0);
      
      // Check financial statements have been initialized
      expect(newProjection.incomeStatement).toBeDefined();
      expect(newProjection.cashFlowStatement).toBeDefined();
      expect(newProjection.balanceSheet).toBeDefined();
      expect(newProjection.profitabilityAnalysis).toBeDefined();
      
      // Check UI-specific fields
      expect(newProjection.formattedTotalRevenue).toBe('0 €');
      expect(newProjection.formattedNetProfit).toBe('0 €');
      expect(newProjection.isEditable).toBe(true);
    });
  });
});