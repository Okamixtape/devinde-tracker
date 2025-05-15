import {
  ServiceFinancialProjection,
  ServiceIncomeStatement,
  ServiceCashFlowStatement,
  ServiceBalanceSheet,
  ServiceFinancialItem
} from "../../interfaces/projections/financial-projections";

/**
 * Calculate complete financial statements from projection data
 * Uses memoization for performance optimization
 */
const memoizedStatements = new Map<string, {
  incomeStatement: ServiceIncomeStatement,
  cashFlowStatement: ServiceCashFlowStatement,
  balanceSheet: ServiceBalanceSheet
}>();

export function calculateFinancialStatements(
  projection: ServiceFinancialProjection,
  revenueItems: ServiceFinancialItem[],
  expenseItems: ServiceFinancialItem[],
  assetItems: ServiceFinancialItem[],
  liabilityItems: ServiceFinancialItem[],
  equityItems: ServiceFinancialItem[],
  previousBalanceSheet?: ServiceBalanceSheet
): {
  incomeStatement: ServiceIncomeStatement,
  cashFlowStatement: ServiceCashFlowStatement,
  balanceSheet: ServiceBalanceSheet
} {
  // Create a cache key based on input items
  const cacheKey = [
    projection.id,
    revenueItems.map(i => `${i.id}-${i.amount}`).join(','),
    expenseItems.map(i => `${i.id}-${i.amount}`).join(','),
    assetItems.map(i => `${i.id}-${i.amount}`).join(','),
    liabilityItems.map(i => `${i.id}-${i.amount}`).join(','),
    equityItems.map(i => `${i.id}-${i.amount}`).join(',')
  ].join('|');
  
  // Check if we have cached results
  if (memoizedStatements.has(cacheKey)) {
    return memoizedStatements.get(cacheKey)!;
  }
  
  // Calculate statements
  const incomeStatement = calculateIncomeStatement(revenueItems, expenseItems, projection.taxRate);
  const cashFlowStatement = calculateCashFlowStatement(incomeStatement, assetItems, liabilityItems, previousBalanceSheet);
  const balanceSheet = calculateBalanceSheet(assetItems, liabilityItems, equityItems, incomeStatement.netProfit, previousBalanceSheet);
  
  // Store in cache
  const result = { incomeStatement, cashFlowStatement, balanceSheet };
  memoizedStatements.set(cacheKey, result);
  
  return result;
}

/**
 * Calculate income statement from revenue and expense items
 */
export function calculateIncomeStatement(
  revenueItems: ServiceFinancialItem[],
  expenseItems: ServiceFinancialItem[],
  taxRate: number
): ServiceIncomeStatement {
  // Calculate total revenue
  const revenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Separate costs of sales from operating expenses
  const costOfSalesItems = expenseItems.filter(item => item.category === 'costOfSales');
  const operatingExpenseItems = expenseItems.filter(item => item.category === 'operatingExpense');
  
  // Calculate totals
  const costOfSales = costOfSalesItems.reduce((sum, item) => sum + item.amount, 0);
  const operatingExpenses = operatingExpenseItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate profits
  const grossProfit = revenue - costOfSales;
  const operatingProfit = grossProfit - operatingExpenses;
  
  // Calculate taxes
  const taxes = operatingProfit > 0 ? operatingProfit * (taxRate / 100) : 0;
  
  // Calculate net profit
  const netProfit = operatingProfit - taxes;
  
  return {
    period: { startDate: '', endDate: '', periodType: 'annual' }, // Should be filled with actual period
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    operatingProfit,
    taxes,
    netProfit,
    revenueItems,
    expenseItems: [...costOfSalesItems, ...operatingExpenseItems]
  };
}

/**
 * Calculate cash flow statement from income statement and balance sheet changes
 */
export function calculateCashFlowStatement(
  incomeStatement: ServiceIncomeStatement,
  assetItems: ServiceFinancialItem[],
  liabilityItems: ServiceFinancialItem[],
  previousBalanceSheet?: ServiceBalanceSheet
): ServiceCashFlowStatement {
  // Default values if no previous balance sheet
  const prevCurrentAssets = previousBalanceSheet?.currentAssets || 0;
  const prevNonCurrentAssets = previousBalanceSheet?.nonCurrentAssets || 0;
  const prevCurrentLiabilities = previousBalanceSheet?.currentLiabilities || 0;
  const prevNonCurrentLiabilities = previousBalanceSheet?.nonCurrentLiabilities || 0;
  
  // Calculate current totals
  const currentAssets = assetItems
    .filter(item => item.category === 'currentAsset')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const nonCurrentAssets = assetItems
    .filter(item => item.category === 'nonCurrentAsset')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const currentLiabilities = liabilityItems
    .filter(item => item.category === 'currentLiability')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const nonCurrentLiabilities = liabilityItems
    .filter(item => item.category === 'nonCurrentLiability')
    .reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate changes for cash flow
  const changeInCurrentAssets = currentAssets - prevCurrentAssets;
  const changeInCurrentLiabilities = currentLiabilities - prevCurrentLiabilities;
  const changeInNonCurrentAssets = nonCurrentAssets - prevNonCurrentAssets;
  const changeInNonCurrentLiabilities = nonCurrentLiabilities - prevNonCurrentLiabilities;
  
  // Operating cash flows (using net profit + adjustments)
  // Negative change in current assets means cash outflow
  // Positive change in current liabilities means cash inflow
  const operatingCashFlow = incomeStatement.netProfit - changeInCurrentAssets + changeInCurrentLiabilities;
  
  // Investing cash flows (primarily from non-current assets)
  // Negative change means cash outflow (buying assets)
  const investingCashFlow = -changeInNonCurrentAssets;
  
  // Financing cash flows (primarily from non-current liabilities and equity)
  // Positive change means cash inflow (taking on debt)
  const financingCashFlow = changeInNonCurrentLiabilities;
  
  // Net change in cash
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
  
  // Beginning and ending cash balances
  const cashAsset = assetItems.find(item => item.name === 'Cash' || item.name === 'cash');
  const prevCashAsset = previousBalanceSheet?.assetItems?.find(item => item.name === 'Cash' || item.name === 'cash');
  
  const beginningCashBalance = prevCashAsset?.amount || 0;
  const endingCashBalance = cashAsset?.amount || beginningCashBalance + netCashFlow;
  
  // Build detailed cash flow items for each category
  const operatingActivities = [
    { name: 'Net Profit', amount: incomeStatement.netProfit, description: 'Net profit from income statement' },
    { name: 'Changes in Current Assets', amount: -changeInCurrentAssets, description: 'Changes in accounts receivable, inventory, etc.' },
    { name: 'Changes in Current Liabilities', amount: changeInCurrentLiabilities, description: 'Changes in accounts payable, accruals, etc.' }
  ];
  
  const investingActivities = [
    { name: 'Purchase of Non-Current Assets', amount: -changeInNonCurrentAssets, description: 'Net investment in long-term assets' }
  ];
  
  const financingActivities = [
    { name: 'Changes in Long-term Debt', amount: changeInNonCurrentLiabilities, description: 'Net changes in long-term loans and debt' }
  ];
  
  return {
    period: incomeStatement.period,
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    beginningCashBalance,
    endingCashBalance,
    operatingActivities,
    investingActivities,
    financingActivities
  };
}

/**
 * Calculate balance sheet from assets, liabilities, and income
 */
export function calculateBalanceSheet(
  assetItems: ServiceFinancialItem[],
  liabilityItems: ServiceFinancialItem[],
  equityItems: ServiceFinancialItem[],
  netProfit: number,
  previousBalanceSheet?: ServiceBalanceSheet
): ServiceBalanceSheet {
  // Categorize assets
  const currentAssetItems = assetItems.filter(item => item.category === 'currentAsset');
  const nonCurrentAssetItems = assetItems.filter(item => item.category === 'nonCurrentAsset');
  
  // Categorize liabilities
  const currentLiabilityItems = liabilityItems.filter(item => item.category === 'currentLiability');
  const nonCurrentLiabilityItems = liabilityItems.filter(item => item.category === 'nonCurrentLiability');
  
  // Calculate totals
  const currentAssets = currentAssetItems.reduce((sum, item) => sum + item.amount, 0);
  const nonCurrentAssets = nonCurrentAssetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = currentAssets + nonCurrentAssets;
  
  const currentLiabilities = currentLiabilityItems.reduce((sum, item) => sum + item.amount, 0);
  const nonCurrentLiabilities = nonCurrentLiabilityItems.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = currentLiabilities + nonCurrentLiabilities;
  
  // Calculate equity (including current period's profit)
  let equityTotal = equityItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Add retained earnings from current period
  const retainedEarningsItem = equityItems.find(item => item.name === 'Retained Earnings');
  if (retainedEarningsItem) {
    // Update retained earnings with new profit
    retainedEarningsItem.amount += netProfit;
    equityTotal += netProfit;
  } else {
    // Add new retained earnings item
    equityItems.push({
      id: 'retained-earnings',
      name: 'Retained Earnings',
      category: 'equity',
      amount: netProfit,
      description: 'Accumulated profits from current and previous periods'
    });
    equityTotal += netProfit;
  }
  
  // Validate balance sheet equation: Assets = Liabilities + Equity
  const equity = totalAssets - totalLiabilities;
  if (Math.abs(equity - equityTotal) > 0.01) {
    // Adjust for any rounding errors
    const adjustment = equity - equityTotal;
    
    // Add a balancing item if necessary
    if (Math.abs(adjustment) > 1) {
      equityItems.push({
        id: 'balancing-adjustment',
        name: 'Balancing Adjustment',
        category: 'equity',
        amount: adjustment,
        description: 'Adjustment to ensure accounting equation balance'
      });
      equityTotal = equity;
    }
  }
  
  return {
    period: { startDate: '', endDate: '', periodType: 'annual' }, // Should be filled with actual period
    currentAssets,
    nonCurrentAssets,
    totalAssets,
    currentLiabilities,
    nonCurrentLiabilities,
    totalLiabilities,
    equity: equityTotal,
    assetItems: [...currentAssetItems, ...nonCurrentAssetItems],
    liabilityItems: [...currentLiabilityItems, ...nonCurrentLiabilityItems],
    equityItems
  };
}