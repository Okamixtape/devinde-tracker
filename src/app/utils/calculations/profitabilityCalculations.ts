import {
  ServiceProfitabilityAnalysis
} from "../../interfaces/projections/financial-projections";

/**
 * Calculate profitability metrics (ROI, NPV, IRR, Payback Period)
 * Uses memoization for performance optimization
 */
const memoizedProfitability = new Map<string, ServiceProfitabilityAnalysis>();

export function calculateProfitability(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number,
  annualizedRate: boolean = true
): ServiceProfitabilityAnalysis {
  // Create a cache key
  const cacheKey = `${initialInvestment}-${cashFlows.join('-')}-${discountRate}-${annualizedRate}`;
  
  // Check if result is already cached
  if (memoizedProfitability.has(cacheKey)) {
    return memoizedProfitability.get(cacheKey)!;
  }
  
  // Calculate ROI (Return on Investment)
  const totalCashFlow = cashFlows.reduce((sum, value) => sum + value, 0);
  const roi = ((totalCashFlow - initialInvestment) / initialInvestment) * 100;
  
  // Calculate NPV (Net Present Value)
  const npv = calculateNPV(initialInvestment, cashFlows, discountRate, annualizedRate);
  
  // Calculate IRR (Internal Rate of Return)
  const irr = calculateIRR(initialInvestment, cashFlows);
  
  // Calculate Payback Period
  const paybackPeriod = calculatePaybackPeriod(initialInvestment, cashFlows);
  
  // Create the profitability analysis result
  const profitabilityAnalysis: ServiceProfitabilityAnalysis = {
    roi,
    npv,
    irr,
    paybackPeriod,
    discountRate,
    initialInvestment,
    cashFlows
  };
  
  // Cache the result
  memoizedProfitability.set(cacheKey, profitabilityAnalysis);
  
  return profitabilityAnalysis;
}

/**
 * Calculate Net Present Value (NPV)
 */
export function calculateNPV(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number,
  annualizedRate: boolean = true
): number {
  // Convert annual discount rate to period rate if needed
  const periodRate = annualizedRate ? discountRate / 100 : discountRate / 1200;
  
  // Calculate the present value of each cash flow
  let npv = -initialInvestment;
  
  cashFlows.forEach((cashFlow, index) => {
    // Calculate present value factor
    const presentValueFactor = 1 / Math.pow(1 + periodRate, index + 1);
    
    // Add present value of this cash flow
    npv += cashFlow * presentValueFactor;
  });
  
  return npv;
}

/**
 * Calculate Internal Rate of Return (IRR) using numerical approximation
 */
export function calculateIRR(initialInvestment: number, cashFlows: number[]): number {
  // Create a function that calculates NPV for a given rate
  const npvAtRate = (rate: number): number => {
    return calculateNPV(initialInvestment, cashFlows, rate, false);
  };
  
  // Use numerical method to find IRR (rate where NPV = 0)
  // Start with two guesses and use bisection method
  let lowerRate = 0;           // 0%
  let upperRate = 100;         // 100%
  let lowerNPV = npvAtRate(lowerRate);
  let upperNPV = npvAtRate(upperRate);
  
  // Check if IRR exists in our range
  if (lowerNPV * upperNPV > 0) {
    // Same sign means no root in this interval
    return lowerNPV > 0 ? upperRate : lowerRate; // Return boundary rate
  }
  
  // Bisection method - find rate where NPV = 0
  const maxIterations = 20;
  const tolerance = 0.01;
  
  for (let i = 0; i < maxIterations; i++) {
    // Try a new rate halfway between bounds
    const midRate = (lowerRate + upperRate) / 2;
    const midNPV = npvAtRate(midRate);
    
    // Check if we're close enough to zero
    if (Math.abs(midNPV) < tolerance) {
      return midRate;
    }
    
    // Update bounds
    if (midNPV * lowerNPV < 0) {
      // Root is between lower and mid
      upperRate = midRate;
      upperNPV = midNPV;
    } else {
      // Root is between mid and upper
      lowerRate = midRate;
      lowerNPV = midNPV;
    }
  }
  
  // Return best approximation after max iterations
  return (lowerRate + upperRate) / 2;
}

/**
 * Calculate Payback Period in months
 */
export function calculatePaybackPeriod(initialInvestment: number, cashFlows: number[]): number {
  let remainingInvestment = initialInvestment;
  let periodsPassed = 0;
  
  // Full periods until final payback period
  for (let i = 0; i < cashFlows.length; i++) {
    remainingInvestment -= cashFlows[i];
    periodsPassed++;
    
    if (remainingInvestment <= 0) {
      // If exactly 0, return the current period
      if (remainingInvestment === 0) {
        return periodsPassed;
      }
      
      // We've recovered more than the investment in this period
      // Calculate the partial period for exact payback
      const previousRemaining = remainingInvestment + cashFlows[i];
      const partialPeriod = previousRemaining / cashFlows[i];
      
      // Subtract 1 from periodsPassed and add the partial period
      return (periodsPassed - 1) + partialPeriod;
    }
  }
  
  // If we never fully recover the investment, return -1 or the total periods
  return -1;
}

/**
 * Calculate Profitability Index (PI)
 */
export function calculateProfitabilityIndex(
  initialInvestment: number,
  npv: number
): number {
  return (npv + initialInvestment) / initialInvestment;
}

/**
 * Calculate Modified Internal Rate of Return (MIRR)
 */
export function calculateMIRR(
  initialInvestment: number,
  cashFlows: number[],
  financingRate: number,
  reinvestmentRate: number
): number {
  // Separate positive and negative cash flows
  const negativeCashFlows = cashFlows.map(cf => cf < 0 ? cf : 0);
  const positiveCashFlows = cashFlows.map(cf => cf > 0 ? cf : 0);
  
  // Include initial investment in negative cash flows
  negativeCashFlows.unshift(-initialInvestment);
  
  // Calculate present value of negative cash flows
  const presentValueNegative = -calculateNPV(0, negativeCashFlows, financingRate);
  
  // Calculate future value of positive cash flows
  const n = positiveCashFlows.length;
  let futureValuePositive = 0;
  
  positiveCashFlows.forEach((cf, index) => {
    // Calculate future value factor
    const futureValueFactor = Math.pow(1 + reinvestmentRate / 100, n - index);
    
    // Add future value of this cash flow
    futureValuePositive += cf * futureValueFactor;
  });
  
  // Calculate MIRR
  return (Math.pow(futureValuePositive / presentValueNegative, 1 / n) - 1) * 100;
}