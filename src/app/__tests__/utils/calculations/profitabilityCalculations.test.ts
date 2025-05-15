import {
  calculateProfitability,
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod,
  calculateProfitabilityIndex,
  calculateMIRR
} from '../../../utils/calculations/profitabilityCalculations';

describe('profitabilityCalculations', () => {
  describe('calculateProfitability', () => {
    it('should calculate ROI, NPV, IRR, and Payback Period correctly', () => {
      const initialInvestment = 100000;
      const cashFlows = [20000, 25000, 30000, 35000, 40000];
      const discountRate = 10;
      
      const result = calculateProfitability(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // ROI calculation: ((20000 + 25000 + 30000 + 35000 + 40000) - 100000) / 100000 * 100 = 50%
      expect(result.roi).toBeCloseTo(50);
      
      // NPV calculation is more complex, but we can verify it's positive for this example
      expect(result.npv).toBeGreaterThan(0);
      
      // IRR should be positive for this cash flow series
      expect(result.irr).toBeGreaterThan(0);
      
      // Payback period should be between 3-4 years for this example
      expect(result.paybackPeriod).toBeGreaterThan(3);
      expect(result.paybackPeriod).toBeLessThan(4);
    });
    
    it('should handle negative NPV cases', () => {
      const initialInvestment = 100000;
      const cashFlows = [10000, 10000, 10000, 10000, 10000]; // Insufficient returns
      const discountRate = 10;
      
      const result = calculateProfitability(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // ROI calculation: ((10000 * 5) - 100000) / 100000 * 100 = -50%
      expect(result.roi).toBeCloseTo(-50);
      
      // NPV should be negative
      expect(result.npv).toBeLessThan(0);
      
      // IRR would be negative or undefined for this case
      expect(result.irr).toBeLessThanOrEqual(0);
      
      // Should indicate project never reaches payback
      expect(result.paybackPeriod).toBe(-1);
    });
    
    it('should use memoization for performance optimization', () => {
      const initialInvestment = 100000;
      const cashFlows = [20000, 25000, 30000, 35000, 40000];
      const discountRate = 10;
      
      // First call will compute
      const result1 = calculateProfitability(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // Spy on console functions to verify it's not computing again
      const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
      const consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();
      
      // Second call with same params should return memoized result
      const result2 = calculateProfitability(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // Results should be exactly the same object
      expect(result2).toBe(result1);
      
      // Clean up
      consoleTimeSpy.mockRestore();
      consoleTimeEndSpy.mockRestore();
    });
  });
  
  describe('calculateNPV', () => {
    it('should calculate NPV correctly for positive case', () => {
      const initialInvestment = 10000;
      const cashFlows = [4000, 4000, 4000, 4000];
      const discountRate = 10; // 10%
      
      const npv = calculateNPV(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // Manual NPV calculation:
      // PV of CF1: 4000 / (1.1)^1 = 3636.36
      // PV of CF2: 4000 / (1.1)^2 = 3305.79
      // PV of CF3: 4000 / (1.1)^3 = 3005.26
      // PV of CF4: 4000 / (1.1)^4 = 2731.15
      // NPV = -10000 + 3636.36 + 3305.79 + 3005.26 + 2731.15 = 2678.56
      expect(npv).toBeCloseTo(2678.56, 0);
    });
    
    it('should calculate NPV correctly for negative case', () => {
      const initialInvestment = 10000;
      const cashFlows = [2000, 2000, 2000, 2000];
      const discountRate = 10; // 10%
      
      const npv = calculateNPV(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // NPV should be negative in this case
      expect(npv).toBeLessThan(0);
      
      // Manual NPV calculation:
      // NPV = -10000 + (2000 / 1.1) + (2000 / 1.1^2) + (2000 / 1.1^3) + (2000 / 1.1^4)
      // NPV = -10000 + 1818.18 + 1652.89 + 1502.63 + 1365.57 = -3660.73
      expect(npv).toBeCloseTo(-3660.72, 0);
    });
    
    it('should handle different annualization rates', () => {
      const initialInvestment = 10000;
      const cashFlows = [4000, 4000, 4000, 4000];
      
      // When annualizedRate is true, rate should be treated as percentage (10%)
      const npvAnnualized = calculateNPV(
        initialInvestment,
        cashFlows,
        10,
        true
      );
      
      // When annualizedRate is false, rate should be treated as decimal (10% => 0.10)
      const npvDecimal = calculateNPV(
        initialInvestment,
        cashFlows,
        10,
        false
      );
      
      // Results should be different because of different rate interpretation
      expect(npvAnnualized).not.toEqual(npvDecimal);
      
      // Verify the calculations are as expected
      expect(npvAnnualized).toBeCloseTo(2678.56, 0);
      
      // For the decimal interpretation, discount rate is 10/1200 per period (monthly)
      // NPV should be much higher due to lower effective discount rate
      expect(npvDecimal).toBeGreaterThan(npvAnnualized);
    });
  });
  
  describe('calculateIRR', () => {
    it('should calculate IRR correctly for a positive NPV project', () => {
      const initialInvestment = 100000;
      const cashFlows = [30000, 35000, 40000, 45000, 50000];
      
      const irr = calculateIRR(initialInvestment, cashFlows);
      
      // IRR for this cash flow profile should be around 24-25%
      expect(irr).toBeGreaterThan(20);
      expect(irr).toBeLessThan(30);
      
      // Cross-check: NPV at this IRR rate should be close to zero
      const npvAtIRR = calculateNPV(initialInvestment, cashFlows, irr, false);
      expect(Math.abs(npvAtIRR)).toBeLessThan(0.1);
    });
    
    it('should handle negative IRR cases correctly', () => {
      const initialInvestment = 100000;
      const cashFlows = [10000, 10000, 10000, 10000, 10000]; // Insufficient returns
      
      const irr = calculateIRR(initialInvestment, cashFlows);
      
      // IRR for this should be negative/unattractive
      expect(irr).toBeLessThan(0);
    });
    
    it('should handle edge case with no IRR solution', () => {
      // Cash flows that never flip sign don't have an IRR solution
      const initialInvestment = 10000;
      const cashFlows = [20000, 30000, 40000]; // All positive, no negative period
      
      // The function should return a boundary value
      const irr = calculateIRR(initialInvestment, cashFlows);
      
      // Should return an upper boundary value since NPV will always be positive
      expect(irr).toBe(100); // Upper boundary in our implementation
    });
  });
  
  describe('calculatePaybackPeriod', () => {
    it('should calculate exact payback period correctly', () => {
      const initialInvestment = 10000;
      const cashFlows = [4000, 4000, 4000]; // Exact payback at period 2.5
      
      const paybackPeriod = calculatePaybackPeriod(initialInvestment, cashFlows);
      
      // Period 1: 10000 - 4000 = 6000 remaining
      // Period 2: 6000 - 4000 = 2000 remaining
      // Period 3: 2000 - 4000 = -2000 (overpaid)
      // Interpolation: 2 + (2000/4000) = 2.5
      expect(paybackPeriod).toBeCloseTo(2.5);
    });
    
    it('should handle exact payback at end of period', () => {
      const initialInvestment = 12000;
      const cashFlows = [4000, 4000, 4000]; // Exact payback at period 3
      
      const paybackPeriod = calculatePaybackPeriod(initialInvestment, cashFlows);
      
      // Should be exactly 3 periods
      expect(paybackPeriod).toBe(3);
    });
    
    it('should indicate when project never reaches payback', () => {
      const initialInvestment = 20000;
      const cashFlows = [4000, 4000, 4000]; // Never reaches payback
      
      const paybackPeriod = calculatePaybackPeriod(initialInvestment, cashFlows);
      
      // Should return -1 indicating no payback
      expect(paybackPeriod).toBe(-1);
    });
  });
  
  describe('calculateProfitabilityIndex', () => {
    it('should calculate profitability index correctly', () => {
      const initialInvestment = 10000;
      const npv = 5000;
      
      const pi = calculateProfitabilityIndex(initialInvestment, npv);
      
      // PI = (NPV + InitialInvestment) / InitialInvestment
      // PI = (5000 + 10000) / 10000 = 1.5
      expect(pi).toBe(1.5);
    });
    
    it('should handle negative NPV cases', () => {
      const initialInvestment = 10000;
      const npv = -2000;
      
      const pi = calculateProfitabilityIndex(initialInvestment, npv);
      
      // PI = ((-2000) + 10000) / 10000 = 0.8
      expect(pi).toBe(0.8);
    });
  });
  
  describe('calculateMIRR', () => {
    it('should calculate MIRR correctly', () => {
      const initialInvestment = 100000;
      const cashFlows = [30000, 35000, 40000, 45000, 50000];
      const financingRate = 10;  // 10%
      const reinvestmentRate = 8; // 8%
      
      const mirr = calculateMIRR(
        initialInvestment,
        cashFlows,
        financingRate,
        reinvestmentRate
      );
      
      // MIRR should be between 15-20% for this example
      expect(mirr).toBeGreaterThan(15);
      expect(mirr).toBeLessThan(20);
    });
    
    it('should handle all positive cash flows', () => {
      const initialInvestment = 100000;
      const cashFlows = [30000, 35000, 40000, 45000, 50000];
      const financingRate = 10; 
      const reinvestmentRate = 8;
      
      const mirr = calculateMIRR(
        initialInvestment,
        cashFlows,
        financingRate,
        reinvestmentRate
      );
      
      // Result should be reasonable and positive
      expect(mirr).toBeGreaterThan(0);
    });
    
    it('should handle mixed cash flows with negative values', () => {
      const initialInvestment = 100000;
      // Some negative cash flows in the mix
      const cashFlows = [30000, -10000, 40000, 45000, 50000];
      const financingRate = 10;
      const reinvestmentRate = 8;
      
      const mirr = calculateMIRR(
        initialInvestment,
        cashFlows,
        financingRate,
        reinvestmentRate
      );
      
      // Result should still be reasonable
      expect(mirr).toBeGreaterThan(0);
    });
  });
});