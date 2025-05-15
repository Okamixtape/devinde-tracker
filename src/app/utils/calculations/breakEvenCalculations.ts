import {
  ServiceBreakEvenAnalysis
} from "../../interfaces/projections/revenue-projections";

/**
 * Calculate break-even point using the contribution margin method
 * Uses memoization for performance optimization
 */
const memoizedBreakEven = new Map<string, ServiceBreakEvenAnalysis>();

export function calculateBreakEven(
  fixedCosts: number,
  revenuePerUnit: number,
  variableCostsPerUnit: number,
  projectedUnitSales: number[],
  startDate: Date
): ServiceBreakEvenAnalysis {
  // Create a cache key
  const cacheKey = `${fixedCosts}-${revenuePerUnit}-${variableCostsPerUnit}-${projectedUnitSales.join('-')}`;
  
  // Check if result is already cached
  if (memoizedBreakEven.has(cacheKey)) {
    return memoizedBreakEven.get(cacheKey)!;
  }
  
  // Calculate contribution margin per unit
  const contributionMarginPerUnit = revenuePerUnit - variableCostsPerUnit;
  
  // Validate contribution margin is positive
  if (contributionMarginPerUnit <= 0) {
    throw new Error("Contribution margin must be positive to calculate break-even point");
  }
  
  // Calculate break-even point in units
  const unitsAtBreakEven = fixedCosts / contributionMarginPerUnit;
  
  // Calculate break-even point in revenue
  const breakEvenPoint = unitsAtBreakEven * revenuePerUnit;
  
  // Calculate months to break-even based on projected unit sales
  let cumulativeUnits = 0;
  let monthsToBreakEven = 0;
  
  for (let i = 0; i < projectedUnitSales.length; i++) {
    cumulativeUnits += projectedUnitSales[i];
    
    if (cumulativeUnits >= unitsAtBreakEven) {
      // Found the month where break-even occurs
      monthsToBreakEven = i + 1;
      break;
    }
  }
  
  // If we never reach break-even point in the projection period
  if (monthsToBreakEven === 0 && projectedUnitSales.length > 0) {
    // Calculate estimated months based on average monthly sales
    const avgMonthlySales = projectedUnitSales.reduce((sum, sales) => sum + sales, 0) / projectedUnitSales.length;
    monthsToBreakEven = Math.ceil(unitsAtBreakEven / avgMonthlySales);
  }
  
  // Calculate break-even date
  const breakEvenDate = new Date(startDate);
  breakEvenDate.setMonth(breakEvenDate.getMonth() + monthsToBreakEven - 1);
  
  // Create the break-even analysis object
  const breakEvenAnalysis: ServiceBreakEvenAnalysis = {
    breakEvenPoint,
    breakEvenDate: breakEvenDate.toISOString(),
    monthsToBreakEven,
    fixedCosts,
    variableCostsPerUnit,
    revenuePerUnit,
    unitsAtBreakEven,
    assumptions: [
      `Fixed costs: ${fixedCosts}€`,
      `Revenue per unit: ${revenuePerUnit}€`,
      `Variable costs per unit: ${variableCostsPerUnit}€`,
      `Contribution margin: ${contributionMarginPerUnit}€ per unit`
    ]
  };
  
  // Cache the result
  memoizedBreakEven.set(cacheKey, breakEvenAnalysis);
  
  return breakEvenAnalysis;
}

/**
 * Calculate multi-product break-even point
 */
export function calculateMultiProductBreakEven(
  fixedCosts: number,
  products: Array<{
    name: string,
    revenuePerUnit: number,
    variableCostsPerUnit: number,
    salesMix: number // Percentage of total sales
  }>
): {
  breakEvenRevenue: number,
  breakEvenUnits: number,
  contributionMarginRatio: number,
  breakEvenByProduct: Array<{
    name: string,
    breakEvenUnits: number,
    breakEvenRevenue: number
  }>
} {
  // Validate sales mix percentages sum to 100%
  const totalSalesMix = products.reduce((sum, product) => sum + product.salesMix, 0);
  if (Math.abs(totalSalesMix - 100) > 0.1) {
    throw new Error(`Sales mix percentages must sum to 100% (current: ${totalSalesMix}%)`);
  }
  
  // Calculate weighted contribution margin
  let weightedContributionMargin = 0;
  let weightedContributionMarginRatio = 0;
  
  products.forEach(product => {
    const contributionMargin = product.revenuePerUnit - product.variableCostsPerUnit;
    const contributionMarginRatio = contributionMargin / product.revenuePerUnit;
    
    weightedContributionMargin += contributionMargin * (product.salesMix / 100);
    weightedContributionMarginRatio += contributionMarginRatio * (product.salesMix / 100);
  });
  
  // Calculate break-even point in units
  const breakEvenUnits = fixedCosts / weightedContributionMargin;
  
  // Calculate break-even revenue
  const breakEvenRevenue = fixedCosts / weightedContributionMarginRatio;
  
  // Calculate break-even for each product
  const breakEvenByProduct = products.map(product => {
    const productBreakEvenUnits = breakEvenUnits * (product.salesMix / 100);
    const productBreakEvenRevenue = productBreakEvenUnits * product.revenuePerUnit;
    
    return {
      name: product.name,
      breakEvenUnits: productBreakEvenUnits,
      breakEvenRevenue: productBreakEvenRevenue
    };
  });
  
  return {
    breakEvenRevenue,
    breakEvenUnits,
    contributionMarginRatio: weightedContributionMarginRatio,
    breakEvenByProduct
  };
}

/**
 * Calculate break-even point for subscription-based business model
 */
export function calculateSubscriptionBreakEven(
  fixedCosts: number,
  monthlySubscriptionRevenue: number,
  variableCostsPerSubscriber: number,
  customerAcquisitionCost: number,
  churnRate: number // Monthly churn rate as a percentage
): {
  breakEvenSubscribers: number,
  breakEvenRevenue: number,
  breakEvenMonths: number,
  ltv: number, // Lifetime value
  cac: number, // Customer acquisition cost
  ltvCacRatio: number
} {
  // Calculate contribution margin per subscriber
  const contributionMarginPerSubscriber = monthlySubscriptionRevenue - variableCostsPerSubscriber;
  
  // Calculate average customer lifetime in months
  const averageLifetimeMonths = 1 / (churnRate / 100);
  
  // Calculate lifetime value (LTV)
  const ltv = contributionMarginPerSubscriber * averageLifetimeMonths;
  
  // Calculate LTV-to-CAC ratio
  const ltvCacRatio = ltv / customerAcquisitionCost;
  
  // Calculate break-even number of subscribers
  // This is simplified and assumes all fixed costs must be covered
  const breakEvenSubscribers = fixedCosts / contributionMarginPerSubscriber;
  
  // Calculate break-even revenue
  const breakEvenRevenue = breakEvenSubscribers * monthlySubscriptionRevenue;
  
  // Calculate months to break-even
  // This assumes a constant subscriber acquisition rate
  // In a real model, this would be more complex with growth curves
  const breakEvenMonths = Math.ceil(breakEvenSubscribers / (fixedCosts / customerAcquisitionCost));
  
  return {
    breakEvenSubscribers,
    breakEvenRevenue,
    breakEvenMonths,
    ltv,
    cac: customerAcquisitionCost,
    ltvCacRatio
  };
}