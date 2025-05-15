import { renderHook, act } from '@testing-library/react';
import { useProjections } from '../../hooks/useProjections';
import { useBusinessPlan } from '../../hooks/useBusinessPlan';
import { useServices } from '../../hooks/useServices';
import { useFinances } from '../../hooks/useFinances';
import { ProjectionsAdapter } from '../../adapters/projections/ProjectionsAdapter';
import { calculateProjectedRevenue } from '../../utils/calculations/revenueCalculations';
import { calculateBreakEven } from '../../utils/calculations/breakEvenCalculations';
import { calculateProfitability } from '../../utils/calculations/profitabilityCalculations';

// Mock the imported hooks and utilities
jest.mock('../../hooks/useBusinessPlan', () => ({
  useBusinessPlan: jest.fn()
}));

jest.mock('../../hooks/useServices', () => ({
  useServices: jest.fn()
}));

jest.mock('../../hooks/useFinances', () => ({
  useFinances: jest.fn()
}));

jest.mock('../../adapters/projections/ProjectionsAdapter');
jest.mock('../../utils/calculations/revenueCalculations');
jest.mock('../../utils/calculations/breakEvenCalculations');
jest.mock('../../utils/calculations/profitabilityCalculations');

describe('useProjections', () => {
  beforeEach(() => {
    // Setup default mock behavior
    (useBusinessPlan as jest.Mock).mockReturnValue({
      businessPlan: {
        id: 'plan-1',
        projections: {
          revenueProjections: [
            {
              id: 'rev-1',
              planId: 'plan-1',
              name: 'Test Revenue Projection',
              period: { startDate: '', endDate: '', periodType: 'annual' },
              totalRevenue: 100000,
              scenarios: []
            }
          ],
          financialProjections: [
            {
              id: 'fin-1',
              planId: 'plan-1',
              name: 'Test Financial Projection',
              period: { startDate: '', endDate: '', periodType: 'annual' },
              totalRevenue: 100000,
              totalExpenses: 70000,
              netProfit: 30000,
              incomeStatement: { revenue: 100000 } as any,
              cashFlowStatement: {} as any,
              balanceSheet: {} as any,
              profitabilityAnalysis: {} as any
            }
          ]
        }
      },
      isLoading: false,
      updateBusinessPlan: jest.fn().mockResolvedValue(true)
    });
    
    (useServices as jest.Mock).mockReturnValue({
      services: [],
      isLoading: false
    });
    
    (useFinances as jest.Mock).mockReturnValue({
      finances: {},
      isLoading: false
    });
    
    // Mock ProjectionsAdapter
    (ProjectionsAdapter as jest.Mock).mockImplementation(() => ({
      toUIRevenueProjection: jest.fn(proj => ({
        ...proj,
        formattedTotalRevenue: `${proj.totalRevenue.toLocaleString('fr-FR')} €`,
        isEditable: true
      })),
      toUIFinancialProjection: jest.fn(proj => ({
        ...proj,
        formattedTotalRevenue: `${proj.totalRevenue.toLocaleString('fr-FR')} €`,
        formattedNetProfit: `${proj.netProfit.toLocaleString('fr-FR')} €`,
        isEditable: true
      })),
      toServiceRevenueProjection: jest.fn(proj => ({
        ...proj,
        formattedTotalRevenue: undefined,
        isEditable: undefined
      })),
      toServiceFinancialProjection: jest.fn(proj => ({
        ...proj,
        formattedTotalRevenue: undefined,
        formattedNetProfit: undefined,
        isEditable: undefined
      })),
      createNewRevenueProjection: jest.fn(planId => ({
        id: `rev-new-${Date.now()}`,
        planId,
        name: 'New Revenue Projection',
        totalRevenue: 0,
        formattedTotalRevenue: '0 €',
        scenarios: [],
        isEditable: true
      })),
      createNewFinancialProjection: jest.fn(planId => ({
        id: `fin-new-${Date.now()}`,
        planId,
        name: 'New Financial Projection',
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        formattedTotalRevenue: '0 €',
        formattedNetProfit: '0 €',
        incomeStatement: {},
        cashFlowStatement: {},
        balanceSheet: {},
        profitabilityAnalysis: {},
        isEditable: true
      })),
      toUIBreakEvenAnalysis: jest.fn(analysis => ({
        ...analysis,
        formattedBreakEvenPoint: `${analysis.breakEvenPoint.toLocaleString('fr-FR')} €`
      })),
      toUIIncomeStatement: jest.fn(stmt => ({
        ...stmt,
        formattedRevenue: `${stmt.revenue.toLocaleString('fr-FR')} €`
      })),
      toUICashFlowStatement: jest.fn(stmt => ({
        ...stmt,
        formattedNetCashFlow: `${stmt.netCashFlow.toLocaleString('fr-FR')} €`
      })),
      toUIBalanceSheet: jest.fn(sheet => ({
        ...sheet,
        formattedTotalAssets: `${sheet.totalAssets.toLocaleString('fr-FR')} €`
      })),
      toUIProfitabilityAnalysis: jest.fn(analysis => ({
        ...analysis,
        formattedROI: `${analysis.roi.toFixed(2)}%`,
        formattedNPV: `${analysis.npv.toLocaleString('fr-FR')} €`
      }))
    }));
    
    // Mock calculation utilities
    (calculateProjectedRevenue as jest.Mock).mockReturnValue(120000);
    (calculateBreakEven as jest.Mock).mockReturnValue({
      breakEvenPoint: 80000,
      breakEvenDate: '2023-05-01T00:00:00.000Z',
      monthsToBreakEven: 5
    });
    (calculateProfitability as jest.Mock).mockReturnValue({
      roi: 15,
      npv: 50000,
      irr: 18,
      paybackPeriod: 3.5
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should load projections from business plan', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the effect to finish
    await waitForNextUpdate();
    
    // Should have projections loaded
    expect(result.current.revenueProjections.length).toBe(1);
    expect(result.current.financialProjections.length).toBe(1);
    expect(result.current.isLoading).toBe(false);
    
    // Check that adapter was called to transform data
    expect(ProjectionsAdapter.prototype.toUIRevenueProjection).toHaveBeenCalledTimes(1);
    expect(ProjectionsAdapter.prototype.toUIFinancialProjection).toHaveBeenCalledTimes(1);
  });
  
  it('should create new revenue projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create new projection
    act(() => {
      result.current.createRevenueProjection();
    });
    
    // Should have added a new projection
    expect(result.current.revenueProjections.length).toBe(2);
    
    // Check that adapter was called
    expect(ProjectionsAdapter.prototype.createNewRevenueProjection).toHaveBeenCalledWith('plan-1');
  });
  
  it('should create new financial projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Create new projection
    act(() => {
      result.current.createFinancialProjection();
    });
    
    // Should have added a new projection
    expect(result.current.financialProjections.length).toBe(2);
    
    // Check that adapter was called
    expect(ProjectionsAdapter.prototype.createNewFinancialProjection).toHaveBeenCalledWith('plan-1');
  });
  
  it('should update a revenue projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Get initial projection
    const initialProjection = result.current.revenueProjections[0];
    
    // Update the projection
    const updatedProjection = {
      ...initialProjection,
      name: 'Updated Name',
      totalRevenue: 150000
    };
    
    act(() => {
      result.current.updateRevenueProjection(updatedProjection);
    });
    
    // Check that the projection was updated
    expect(result.current.revenueProjections[0].name).toBe('Updated Name');
    expect(result.current.revenueProjections[0].totalRevenue).toBe(150000);
  });
  
  it('should update a financial projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Get initial projection
    const initialProjection = result.current.financialProjections[0];
    
    // Update the projection
    const updatedProjection = {
      ...initialProjection,
      name: 'Updated Financial Projection',
      netProfit: 40000
    };
    
    act(() => {
      result.current.updateFinancialProjection(updatedProjection);
    });
    
    // Check that the projection was updated
    expect(result.current.financialProjections[0].name).toBe('Updated Financial Projection');
    expect(result.current.financialProjections[0].netProfit).toBe(40000);
  });
  
  it('should delete a revenue projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Get initial projection
    const initialProjection = result.current.revenueProjections[0];
    
    // Delete the projection
    act(() => {
      result.current.deleteRevenueProjection(initialProjection.id);
    });
    
    // Check that the projection was deleted
    expect(result.current.revenueProjections.length).toBe(0);
  });
  
  it('should delete a financial projection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Get initial projection
    const initialProjection = result.current.financialProjections[0];
    
    // Delete the projection
    act(() => {
      result.current.deleteFinancialProjection(initialProjection.id);
    });
    
    // Check that the projection was deleted
    expect(result.current.financialProjections.length).toBe(0);
  });
  
  it('should save projections to business plan', async () => {
    const mockUpdateBusinessPlan = jest.fn().mockResolvedValue(true);
    (useBusinessPlan as jest.Mock).mockReturnValue({
      businessPlan: {
        id: 'plan-1',
        projections: {
          revenueProjections: [],
          financialProjections: []
        }
      },
      isLoading: false,
      updateBusinessPlan: mockUpdateBusinessPlan
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Add projections
    act(() => {
      result.current.createRevenueProjection();
      result.current.createFinancialProjection();
    });
    
    // Save projections
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveProjections();
    });
    
    // Check that projections were saved
    expect(saveResult).toBe(true);
    expect(mockUpdateBusinessPlan).toHaveBeenCalledTimes(1);
    
    // Check adapter conversion methods were called
    expect(ProjectionsAdapter.prototype.toServiceRevenueProjection).toHaveBeenCalled();
    expect(ProjectionsAdapter.prototype.toServiceFinancialProjection).toHaveBeenCalled();
  });
  
  it('should calculate revenue correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Calculate revenue
    const revenueResult = result.current.calculateRevenue(
      100000, // baseRevenue
      10,     // growthRate
      'annual', // periodType
      'medium', // confidenceLevel
      'linear'  // calculationMethod
    );
    
    // Check that calculation utility was called with correct parameters
    expect(calculateProjectedRevenue).toHaveBeenCalledWith(
      100000, 10, 'annual', 'medium', 'linear', undefined
    );
    
    // Check result
    expect(revenueResult).toBe(120000);
  });
  
  it('should generate break-even analysis correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Generate break-even analysis
    const breakEvenResult = result.current.generateBreakEvenAnalysis(
      50000, // fixedCosts
      100,   // revenuePerUnit
      60,    // variableCostsPerUnit
      [100, 200, 300, 400, 500], // projectedUnitSales
      new Date('2023-01-01') // startDate
    );
    
    // Check that calculation utility was called
    expect(calculateBreakEven).toHaveBeenCalled();
    
    // Check result
    expect(breakEvenResult).toBeDefined();
    expect(breakEvenResult.formattedBreakEvenPoint).toBe('80 000 €');
  });
  
  it('should generate profitability analysis correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Generate profitability analysis
    const profitabilityResult = result.current.generateProfitabilityAnalysis(
      100000, // initialInvestment
      [30000, 35000, 40000, 45000], // cashFlows
      10 // discountRate
    );
    
    // Check that calculation utility was called
    expect(calculateProfitability).toHaveBeenCalled();
    
    // Check result
    expect(profitabilityResult).toBeDefined();
    expect(profitabilityResult.formattedROI).toBe('15.00%');
    expect(profitabilityResult.formattedNPV).toBe('50 000 €');
  });
  
  it('should get projection by ID', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjections('plan-1'));
    
    // Wait for the initial load
    await waitForNextUpdate();
    
    // Get projection by ID
    const revenueProjection = result.current.getRevenueProjectionById('rev-1');
    const financialProjection = result.current.getFinancialProjectionById('fin-1');
    
    // Check results
    expect(revenueProjection).toBeDefined();
    expect(revenueProjection?.id).toBe('rev-1');
    
    expect(financialProjection).toBeDefined();
    expect(financialProjection?.id).toBe('fin-1');
    
    // Try getting non-existent projection
    const nonExistentProjection = result.current.getRevenueProjectionById('non-existent');
    expect(nonExistentProjection).toBeUndefined();
  });
});