import { 
  ServiceRevenueProjection,
  ServiceRevenueScenario,
  ServiceRevenueBreakdown,
  CalculationMethod,
  ConfidenceLevel,
  PeriodType
} from "../../interfaces/projections/revenue-projections";

/**
 * Calculate projected revenue based on provided parameters and historical data
 * Uses memoization for performance optimization
 */
const memoizedResults = new Map<string, number>();

export function calculateProjectedRevenue(
  baseRevenue: number,
  growthRate: number,
  periodType: PeriodType,
  confidenceLevel: ConfidenceLevel,
  calculationMethod: CalculationMethod,
  historicalData?: number[]
): number {
  // Create a cache key
  const cacheKey = `${baseRevenue}-${growthRate}-${periodType}-${confidenceLevel}-${calculationMethod}`;
  
  // Check if result is already cached
  if (memoizedResults.has(cacheKey)) {
    return memoizedResults.get(cacheKey)!;
  }
  
  let result = 0;
  
  // Apply confidence level adjustment factors
  const confidenceFactors = {
    low: 0.8,
    medium: 1.0,
    high: 1.2
  };
  
  const confidenceFactor = confidenceFactors[confidenceLevel];
  
  // Calculate based on the specified method
  switch (calculationMethod) {
    case "linear":
      result = baseRevenue * (1 + (growthRate / 100) * confidenceFactor);
      break;
      
    case "compound":
      // Determine period factor for compound growth
      const periodFactors = {
        monthly: 1/12,
        quarterly: 1/4,
        annual: 1
      };
      const periodFactor = periodFactors[periodType];
      
      result = baseRevenue * Math.pow(1 + ((growthRate / 100) * confidenceFactor), periodFactor);
      break;
      
    case "historical":
      if (historicalData && historicalData.length > 0) {
        // Use historical data to create a weighted average growth
        const weights = historicalData.map((_, index) => index + 1);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        const weightedGrowth = historicalData.reduce((sum, value, index) => {
          return sum + (value * weights[index]);
        }, 0) / totalWeight;
        
        result = baseRevenue * (1 + (weightedGrowth / 100) * confidenceFactor);
      } else {
        // Fallback to linear if no historical data
        result = baseRevenue * (1 + (growthRate / 100) * confidenceFactor);
      }
      break;
      
    case "custom":
      // In a real implementation, this would include custom logic
      // For now, just applying a default calculation with confidence
      result = baseRevenue * (1 + (growthRate / 100)) * confidenceFactor;
      break;
      
    default:
      result = baseRevenue;
  }
  
  // Cache the result
  memoizedResults.set(cacheKey, result);
  
  return result;
}

/**
 * Generate monthly revenue breakdown from a projected annual value
 */
export function generateMonthlyRevenue(
  annualRevenue: number,
  seasonalityFactors: number[],
  startDate: Date
): number[] {
  // Ensure we have 12 seasonality factors (one per month)
  const normalizedFactors = seasonalityFactors && seasonalityFactors.length === 12
    ? seasonalityFactors
    : Array(12).fill(1);
    
  // Calculate the total of factors to ensure they sum to 12
  const factorSum = normalizedFactors.reduce((sum, factor) => sum + factor, 0);
  const adjustedFactors = normalizedFactors.map(factor => (factor * 12) / factorSum);
  
  // Generate monthly values
  return adjustedFactors.map(factor => (annualRevenue * factor) / 12);
}

/**
 * Calculate break-even point based on financial inputs
 */
export function calculateBreakEvenPoint(
  fixedCosts: number,
  revenuePerUnit: number,
  variableCostPerUnit: number
): number {
  // Break-even quantity
  const breakEvenUnits = fixedCosts / (revenuePerUnit - variableCostPerUnit);
  
  // Break-even revenue
  return breakEvenUnits * revenuePerUnit;
}

/**
 * Calculate the estimated date when break-even will be reached
 */
export function calculateBreakEvenDate(
  fixedCosts: number,
  monthlyRevenue: number[],
  monthlyCosts: number[],
  startDate: Date
): { date: Date, monthsToBreakEven: number } {
  let cumulativeProfit = -fixedCosts;
  let monthsToBreakEven = 0;
  
  // Calculate cumulative monthly profits until break-even
  for (let i = 0; i < monthlyRevenue.length; i++) {
    const monthlyProfit = monthlyRevenue[i] - monthlyCosts[i];
    cumulativeProfit += monthlyProfit;
    
    if (cumulativeProfit >= 0 && monthsToBreakEven === 0) {
      monthsToBreakEven = i + 1;
      break;
    }
  }
  
  // If we never break even in the provided data
  if (monthsToBreakEven === 0 && monthlyRevenue.length > 0) {
    monthsToBreakEven = -1; // -1 indicates we don't break even in the provided timeframe
  }
  
  // Calculate the actual date
  const breakEvenDate = new Date(startDate);
  if (monthsToBreakEven > 0) {
    breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven - 1);
  } else {
    // If we don't break even, set to end date + 1 year as estimate
    breakEvenDate.setFullYear(breakEvenDate.getFullYear() + 1);
  }
  
  return { 
    date: breakEvenDate, 
    monthsToBreakEven: monthsToBreakEven > 0 ? monthsToBreakEven : 24 // Default to 24 if unknown
  };
}

/**
 * Update a revenue projection with recalculated values
 */
export function updateRevenueProjection(
  projection: ServiceRevenueProjection,
  services: any[], // Would be actual service interfaces in real implementation
  expenses: any[]  // Would be actual expense interfaces in real implementation
): ServiceRevenueProjection {
  // This would be a complex implementation integrating data from services and expenses
  // For now, this is a stub that would be completed in a real implementation
  return {
    ...projection,
    // Recalculate based on updated service and expense data
    // Each implementation would be specific to business requirements
  };
}

/**
 * Validate revenue projection data for consistency
 */
export function validateRevenueProjection(
  projection: ServiceRevenueProjection
): { isValid: boolean, errors: string[] } {
  const errors: string[] = [];
  
  // Check for required fields
  if (!projection.id) errors.push("Missing projection ID");
  if (!projection.planId) errors.push("Missing plan ID");
  if (!projection.period) errors.push("Missing period information");
  
  // Check for valid totals
  if (projection.totalRevenue < 0) {
    errors.push("Total revenue cannot be negative");
  }
  
  // Check scenarios
  if (!projection.scenarios || projection.scenarios.length === 0) {
    errors.push("At least one scenario is required");
  } else {
    // Check for a preferred scenario
    const hasPreferred = projection.scenarios.some(s => s.isPreferred);
    if (!hasPreferred) {
      errors.push("At least one scenario must be marked as preferred");
    }
    
    // Validate probabilities sum to 100%
    const totalProbability = projection.scenarios.reduce(
      (sum, scenario) => sum + scenario.probabilityPercentage, 0);
      
    if (Math.abs(totalProbability - 100) > 0.1) { // Allow small floating point errors
      errors.push(`Scenario probabilities should sum to 100% (current: ${totalProbability}%)`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}