import { 
  calculateProjectedRevenue,
  generateMonthlyRevenue,
  calculateBreakEvenPoint,
  calculateBreakEvenDate,
  validateRevenueProjection
} from '../../../utils/calculations/revenueCalculations';
import { CalculationMethod, ConfidenceLevel, PeriodType } from '../../../interfaces/projections/revenue-projections';

describe('revenueCalculations', () => {
  describe('calculateProjectedRevenue', () => {
    it('should calculate linear revenue correctly', () => {
      const baseRevenue = 10000;
      const growthRate = 5;
      const periodType: PeriodType = 'annual';
      const confidenceLevel: ConfidenceLevel = 'medium';
      const calculationMethod: CalculationMethod = 'linear';
      
      const result = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        confidenceLevel,
        calculationMethod
      );
      
      // Expected result: 10000 * (1 + (5/100) * 1.0) = 10500
      expect(result).toBeCloseTo(10500);
    });
    
    it('should apply confidence factors correctly', () => {
      const baseRevenue = 10000;
      const growthRate = 10;
      const periodType: PeriodType = 'annual';
      const calculationMethod: CalculationMethod = 'linear';
      
      // Low confidence - factor 0.8
      const lowConfidenceResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        'low',
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100) * 0.8) = 10800
      expect(lowConfidenceResult).toBeCloseTo(10800);
      
      // Medium confidence - factor 1.0
      const mediumConfidenceResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        'medium',
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100) * 1.0) = 11000
      expect(mediumConfidenceResult).toBeCloseTo(11000);
      
      // High confidence - factor 1.2
      const highConfidenceResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        'high',
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100) * 1.2) = 11200
      expect(highConfidenceResult).toBeCloseTo(11200);
    });
    
    it('should calculate compound growth correctly', () => {
      const baseRevenue = 10000;
      const growthRate = 10;
      const confidenceLevel: ConfidenceLevel = 'medium';
      const calculationMethod: CalculationMethod = 'compound';
      
      // Annual period
      const annualResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        'annual',
        confidenceLevel,
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100))^1 = 11000
      expect(annualResult).toBeCloseTo(11000);
      
      // Quarterly period
      const quarterlyResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        'quarterly',
        confidenceLevel,
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100))^(1/4) ≈ 10241
      expect(quarterlyResult).toBeCloseTo(10241, 0);
      
      // Monthly period
      const monthlyResult = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        'monthly',
        confidenceLevel,
        calculationMethod
      );
      // Expected: 10000 * (1 + (10/100))^(1/12) ≈ 10080
      expect(monthlyResult).toBeCloseTo(10080, 0);
    });
    
    it('should use historical data when available', () => {
      const baseRevenue = 10000;
      const growthRate = 10;
      const periodType: PeriodType = 'annual';
      const confidenceLevel: ConfidenceLevel = 'medium';
      const calculationMethod: CalculationMethod = 'historical';
      const historicalData = [5, 8, 12]; // Growth rates for past periods
      
      const result = calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        confidenceLevel,
        calculationMethod,
        historicalData
      );
      
      // Expected weighted average: (5*1 + 8*2 + 12*3) / (1+2+3) = 9.5
      // Result: 10000 * (1 + (9.5/100)) = 10950
      expect(result).toBeCloseTo(10950, 0);
    });
    
    it('should apply memoization for performance optimization', () => {
      // First call will compute
      const result1 = calculateProjectedRevenue(
        10000,
        5,
        'annual',
        'medium',
        'linear'
      );
      
      // Spy on console.time/timeEnd to verify it's not computing again
      const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
      const consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();
      
      // Second call with same params should return memoized result
      const result2 = calculateProjectedRevenue(
        10000,
        5,
        'annual',
        'medium',
        'linear'
      );
      
      // Results should be the same
      expect(result2).toBe(result1);
      
      // Clean up
      consoleTimeSpy.mockRestore();
      consoleTimeEndSpy.mockRestore();
    });
  });
  
  describe('generateMonthlyRevenue', () => {
    it('should generate monthly breakdown with seasonality', () => {
      const annualRevenue = 120000;
      const seasonalityFactors = [0.7, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.5, 1.2, 1.0, 0.9, 0.7];
      const startDate = new Date('2023-01-01');
      
      const monthlyRevenue = generateMonthlyRevenue(
        annualRevenue,
        seasonalityFactors,
        startDate
      );
      
      // Verify we have 12 months
      expect(monthlyRevenue.length).toBe(12);
      
      // Verify total equals annual revenue
      const total = monthlyRevenue.reduce((sum, amount) => sum + amount, 0);
      expect(total).toBeCloseTo(annualRevenue);
      
      // Verify proportional distribution
      // Expected for January: 120000 * (0.7 * 12) / (12 * 12) ≈ 7000
      expect(monthlyRevenue[0]).toBeCloseTo(7000, 0);
      
      // Expected for July (peak): 120000 * (1.4 * 12) / (12 * 12) ≈ 14000
      expect(monthlyRevenue[6]).toBeCloseTo(14000, 0);
    });
    
    it('should handle missing seasonality factors', () => {
      const annualRevenue = 120000;
      const startDate = new Date('2023-01-01');
      
      // No seasonality factors provided
      const monthlyRevenue = generateMonthlyRevenue(
        annualRevenue,
        [],
        startDate
      );
      
      // Should default to equal distribution
      expect(monthlyRevenue.length).toBe(12);
      expect(monthlyRevenue[0]).toBeCloseTo(10000); // 120000 / 12
      expect(monthlyRevenue[11]).toBeCloseTo(10000);
      
      const total = monthlyRevenue.reduce((sum, amount) => sum + amount, 0);
      expect(total).toBeCloseTo(annualRevenue);
    });
  });
  
  describe('calculateBreakEvenPoint', () => {
    it('should calculate break-even point correctly', () => {
      const fixedCosts = 50000;
      const revenuePerUnit = 100;
      const variableCostPerUnit = 60;
      
      const breakEvenPoint = calculateBreakEvenPoint(
        fixedCosts,
        revenuePerUnit,
        variableCostPerUnit
      );
      
      // Break-even units = 50000 / (100 - 60) = 1250
      // Break-even revenue = 1250 * 100 = 125000
      expect(breakEvenPoint).toBeCloseTo(125000);
    });
  });
  
  describe('calculateBreakEvenDate', () => {
    it('should calculate break-even date correctly', () => {
      const fixedCosts = 50000;
      const monthlyRevenue = [10000, 12000, 15000, 20000, 25000];
      const monthlyCosts = [5000, 6000, 7000, 8000, 9000];
      const startDate = new Date('2023-01-01');
      
      const result = calculateBreakEvenDate(
        fixedCosts,
        monthlyRevenue,
        monthlyCosts,
        startDate
      );
      
      // Month 1: -50000 + (10000 - 5000) = -45000
      // Month 2: -45000 + (12000 - 6000) = -39000
      // Month 3: -39000 + (15000 - 7000) = -31000
      // Month 4: -31000 + (20000 - 8000) = -19000
      // Month 5: -19000 + (25000 - 9000) = -3000
      // Doesn't break even in the provided timeframe
      
      expect(result.monthsToBreakEven).toBe(-1);
      
      // Should estimate break-even at 1 year later
      const expectedDate = new Date('2024-01-01');
      expect(result.date.getFullYear()).toBe(expectedDate.getFullYear());
    });
    
    it('should handle break-even within timeframe', () => {
      const fixedCosts = 10000;
      const monthlyRevenue = [5000, 6000, 7000, 8000];
      const monthlyCosts = [2000, 2000, 2000, 2000];
      const startDate = new Date('2023-01-01');
      
      const result = calculateBreakEvenDate(
        fixedCosts,
        monthlyRevenue,
        monthlyCosts,
        startDate
      );
      
      // Month 1: -10000 + (5000 - 2000) = -7000
      // Month 2: -7000 + (6000 - 2000) = -3000
      // Month 3: -3000 + (7000 - 2000) = +2000 (break-even in month 3)
      
      expect(result.monthsToBreakEven).toBe(3);
      
      // Break-even date should be March 2023
      const expectedDate = new Date('2023-03-01');
      expect(result.date.getMonth()).toBe(expectedDate.getMonth());
      expect(result.date.getFullYear()).toBe(expectedDate.getFullYear());
    });
  });
  
  describe('validateRevenueProjection', () => {
    it('should validate a correct projection', () => {
      const projection = {
        id: 'proj-123',
        planId: 'plan-123',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: 120000,
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Baseline',
            description: 'Base scenario',
            projectedRevenue: 120000,
            probabilityPercentage: 60,
            isPreferred: true,
            assumptions: [],
            monthlyBreakdown: []
          },
          {
            id: 'scenario-2',
            name: 'Optimistic',
            description: 'Optimistic scenario',
            projectedRevenue: 150000,
            probabilityPercentage: 40,
            isPreferred: false,
            assumptions: [],
            monthlyBreakdown: []
          }
        ],
        revenueBreakdown: {
          totalAmount: 120000,
          period: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            periodType: 'annual' as PeriodType
          },
          categories: []
        }
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    it('should catch missing required fields', () => {
      const projection = {
        // Missing id and planId
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: 120000,
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Baseline',
            description: 'Base scenario',
            projectedRevenue: 120000,
            probabilityPercentage: 100,
            isPreferred: true,
            assumptions: [],
            monthlyBreakdown: []
          }
        ]
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing projection ID');
      expect(result.errors).toContain('Missing plan ID');
    });
    
    it('should catch negative revenue', () => {
      const projection = {
        id: 'proj-123',
        planId: 'plan-123',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: -5000, // Negative revenue
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Baseline',
            description: 'Base scenario',
            projectedRevenue: -5000,
            probabilityPercentage: 100,
            isPreferred: true,
            assumptions: [],
            monthlyBreakdown: []
          }
        ],
        revenueBreakdown: {
          totalAmount: -5000,
          period: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            periodType: 'annual' as PeriodType
          },
          categories: []
        }
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total revenue cannot be negative');
    });
    
    it('should catch missing scenarios', () => {
      const projection = {
        id: 'proj-123',
        planId: 'plan-123',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: 120000,
        scenarios: [], // Empty scenarios
        revenueBreakdown: {
          totalAmount: 120000,
          period: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            periodType: 'annual' as PeriodType
          },
          categories: []
        }
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one scenario is required');
    });
    
    it('should catch missing preferred scenario', () => {
      const projection = {
        id: 'proj-123',
        planId: 'plan-123',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: 120000,
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Baseline',
            description: 'Base scenario',
            projectedRevenue: 120000,
            probabilityPercentage: 60,
            isPreferred: false, // No preferred scenario
            assumptions: [],
            monthlyBreakdown: []
          },
          {
            id: 'scenario-2',
            name: 'Optimistic',
            description: 'Optimistic scenario',
            projectedRevenue: 150000,
            probabilityPercentage: 40,
            isPreferred: false, // No preferred scenario
            assumptions: [],
            monthlyBreakdown: []
          }
        ],
        revenueBreakdown: {
          totalAmount: 120000,
          period: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            periodType: 'annual' as PeriodType
          },
          categories: []
        }
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one scenario must be marked as preferred');
    });
    
    it('should catch incorrect probability total', () => {
      const projection = {
        id: 'proj-123',
        planId: 'plan-123',
        period: {
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          periodType: 'annual' as PeriodType
        },
        totalRevenue: 120000,
        scenarios: [
          {
            id: 'scenario-1',
            name: 'Baseline',
            description: 'Base scenario',
            projectedRevenue: 120000,
            probabilityPercentage: 60,
            isPreferred: true,
            assumptions: [],
            monthlyBreakdown: []
          },
          {
            id: 'scenario-2',
            name: 'Optimistic',
            description: 'Optimistic scenario',
            projectedRevenue: 150000,
            probabilityPercentage: 20, // Total 80% instead of 100%
            isPreferred: false,
            assumptions: [],
            monthlyBreakdown: []
          }
        ],
        revenueBreakdown: {
          totalAmount: 120000,
          period: {
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            periodType: 'annual' as PeriodType
          },
          categories: []
        }
      };
      
      const result = validateRevenueProjection(projection as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Scenario probabilities should sum to 100%');
    });
  });
});