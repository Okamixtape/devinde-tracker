import { 
  UIRevenueProjection, 
  UIRevenueScenario,
  UIRevenueBreakdown,
  UIBreakEvenAnalysis,
  ServiceRevenueProjection,
  ServiceRevenueScenario,
  ServiceRevenueBreakdown,
  ServiceBreakEvenAnalysis
} from "../../interfaces/projections/revenue-projections";

import {
  UIFinancialProjection,
  UIIncomeStatement,
  UICashFlowStatement,
  UIBalanceSheet,
  UIProfitabilityAnalysis,
  ServiceFinancialProjection,
  ServiceIncomeStatement,
  ServiceCashFlowStatement,
  ServiceBalanceSheet,
  ServiceProfitabilityAnalysis
} from "../../interfaces/projections/financial-projections";

import { calculateProjectedRevenue } from "../../utils/calculations/revenueCalculations";
import { calculateFinancialStatements } from "../../utils/calculations/financialCalculations";
import { calculateBreakEven } from "../../utils/calculations/breakEvenCalculations";
import { calculateProfitability } from "../../utils/calculations/profitabilityCalculations";

export class ProjectionsAdapter {
  /**
   * Transform service revenue projection data to UI format
   */
  toUIRevenueProjection(serviceData: ServiceRevenueProjection): UIRevenueProjection {
    return {
      ...serviceData,
      displayCurrency: "€",
      formattedTotalRevenue: `${serviceData.totalRevenue.toLocaleString('fr-FR')} €`,
      percentGrowth: serviceData.previousPeriodRevenue 
        ? ((serviceData.totalRevenue - serviceData.previousPeriodRevenue) / serviceData.previousPeriodRevenue * 100).toFixed(1) + '%'
        : 'N/A',
      scenarios: serviceData.scenarios.map(this.toUIRevenueScenario),
      revenueBreakdown: this.toUIRevenueBreakdown(serviceData.revenueBreakdown),
      breakEvenAnalysis: serviceData.breakEvenAnalysis 
        ? this.toUIBreakEvenAnalysis(serviceData.breakEvenAnalysis)
        : undefined,
      isEditable: true
    };
  }

  /**
   * Transform UI revenue projection data to service format
   */
  toServiceRevenueProjection(uiData: UIRevenueProjection): ServiceRevenueProjection {
    return {
      id: uiData.id,
      planId: uiData.planId,
      name: uiData.name,
      description: uiData.description,
      period: uiData.period,
      totalRevenue: uiData.totalRevenue,
      previousPeriodRevenue: uiData.previousPeriodRevenue,
      calculationMethod: uiData.calculationMethod,
      confidenceLevel: uiData.confidenceLevel,
      lastUpdated: uiData.lastUpdated,
      scenarios: uiData.scenarios.map(this.toServiceRevenueScenario),
      revenueBreakdown: this.toServiceRevenueBreakdown(uiData.revenueBreakdown),
      breakEvenAnalysis: uiData.breakEvenAnalysis 
        ? this.toServiceBreakEvenAnalysis(uiData.breakEvenAnalysis)
        : undefined
    };
  }

  /**
   * Transform service revenue scenario to UI format
   */
  toUIRevenueScenario(serviceData: ServiceRevenueScenario): UIRevenueScenario {
    return {
      ...serviceData,
      formattedRevenue: `${serviceData.projectedRevenue.toLocaleString('fr-FR')} €`,
      percentChange: serviceData.baselineRevenue 
        ? ((serviceData.projectedRevenue - serviceData.baselineRevenue) / serviceData.baselineRevenue * 100).toFixed(1) + '%'
        : 'N/A',
      colorCode: serviceData.isPreferred ? '#4CAF50' : '#2196F3',
      tooltip: `${serviceData.description} (${serviceData.probabilityPercentage}% probability)`
    };
  }

  /**
   * Transform UI revenue scenario to service format
   */
  toServiceRevenueScenario(uiData: UIRevenueScenario): ServiceRevenueScenario {
    return {
      id: uiData.id,
      name: uiData.name,
      description: uiData.description,
      projectedRevenue: uiData.projectedRevenue,
      baselineRevenue: uiData.baselineRevenue,
      probabilityPercentage: uiData.probabilityPercentage,
      assumptions: uiData.assumptions,
      isPreferred: uiData.isPreferred,
      monthlyBreakdown: uiData.monthlyBreakdown
    };
  }

  /**
   * Transform service revenue breakdown to UI format
   */
  toUIRevenueBreakdown(serviceData: ServiceRevenueBreakdown): UIRevenueBreakdown {
    return {
      ...serviceData,
      categories: serviceData.categories.map(category => ({
        ...category,
        formattedAmount: `${category.amount.toLocaleString('fr-FR')} €`,
        percentage: ((category.amount / serviceData.totalAmount) * 100).toFixed(1) + '%',
        colorCode: this.getCategoryColor(category.name)
      }))
    };
  }

  /**
   * Transform UI revenue breakdown to service format
   */
  toServiceRevenueBreakdown(uiData: UIRevenueBreakdown): ServiceRevenueBreakdown {
    return {
      totalAmount: uiData.totalAmount,
      period: uiData.period,
      categories: uiData.categories.map(category => ({
        id: category.id,
        name: category.name,
        amount: category.amount,
        source: category.source
      }))
    };
  }

  /**
   * Transform service break-even analysis to UI format
   */
  toUIBreakEvenAnalysis(serviceData: ServiceBreakEvenAnalysis): UIBreakEvenAnalysis {
    return {
      ...serviceData,
      formattedBreakEvenPoint: `${serviceData.breakEvenPoint.toLocaleString('fr-FR')} €`,
      formattedBreakEvenDate: new Date(serviceData.breakEvenDate).toLocaleDateString('fr-FR'),
      formattedMonthsToBreakEven: serviceData.monthsToBreakEven.toString(),
      statusColor: serviceData.monthsToBreakEven <= 6 ? '#4CAF50' : serviceData.monthsToBreakEven <= 12 ? '#FFC107' : '#F44336'
    };
  }

  /**
   * Transform UI break-even analysis to service format
   */
  toServiceBreakEvenAnalysis(uiData: UIBreakEvenAnalysis): ServiceBreakEvenAnalysis {
    return {
      breakEvenPoint: uiData.breakEvenPoint,
      breakEvenDate: uiData.breakEvenDate,
      monthsToBreakEven: uiData.monthsToBreakEven,
      fixedCosts: uiData.fixedCosts,
      variableCostsPerUnit: uiData.variableCostsPerUnit,
      revenuePerUnit: uiData.revenuePerUnit,
      unitsAtBreakEven: uiData.unitsAtBreakEven,
      assumptions: uiData.assumptions
    };
  }

  /**
   * Transform service financial projection to UI format
   */
  toUIFinancialProjection(serviceData: ServiceFinancialProjection): UIFinancialProjection {
    return {
      ...serviceData,
      formattedTotalRevenue: `${serviceData.totalRevenue.toLocaleString('fr-FR')} €`,
      formattedTotalExpenses: `${serviceData.totalExpenses.toLocaleString('fr-FR')} €`,
      formattedNetProfit: `${serviceData.netProfit.toLocaleString('fr-FR')} €`,
      profitMargin: ((serviceData.netProfit / serviceData.totalRevenue) * 100).toFixed(1) + '%',
      incomeStatement: this.toUIIncomeStatement(serviceData.incomeStatement),
      cashFlowStatement: this.toUICashFlowStatement(serviceData.cashFlowStatement),
      balanceSheet: this.toUIBalanceSheet(serviceData.balanceSheet),
      profitabilityAnalysis: this.toUIProfitabilityAnalysis(serviceData.profitabilityAnalysis),
      isEditable: true
    };
  }

  /**
   * Transform UI financial projection to service format
   */
  toServiceFinancialProjection(uiData: UIFinancialProjection): ServiceFinancialProjection {
    return {
      id: uiData.id,
      planId: uiData.planId,
      name: uiData.name,
      description: uiData.description,
      period: uiData.period,
      totalRevenue: uiData.totalRevenue,
      totalExpenses: uiData.totalExpenses,
      netProfit: uiData.netProfit,
      taxRate: uiData.taxRate,
      lastUpdated: uiData.lastUpdated,
      incomeStatement: this.toServiceIncomeStatement(uiData.incomeStatement),
      cashFlowStatement: this.toServiceCashFlowStatement(uiData.cashFlowStatement),
      balanceSheet: this.toServiceBalanceSheet(uiData.balanceSheet),
      profitabilityAnalysis: this.toServiceProfitabilityAnalysis(uiData.profitabilityAnalysis)
    };
  }

  /**
   * Transform service income statement to UI format
   */
  toUIIncomeStatement(serviceData: ServiceIncomeStatement): UIIncomeStatement {
    return {
      ...serviceData,
      formattedRevenue: `${serviceData.revenue.toLocaleString('fr-FR')} €`,
      formattedCostOfSales: `${serviceData.costOfSales.toLocaleString('fr-FR')} €`,
      formattedGrossProfit: `${serviceData.grossProfit.toLocaleString('fr-FR')} €`,
      formattedOperatingExpenses: `${serviceData.operatingExpenses.toLocaleString('fr-FR')} €`,
      formattedOperatingProfit: `${serviceData.operatingProfit.toLocaleString('fr-FR')} €`,
      formattedTaxes: `${serviceData.taxes.toLocaleString('fr-FR')} €`,
      formattedNetProfit: `${serviceData.netProfit.toLocaleString('fr-FR')} €`,
      grossProfitMargin: ((serviceData.grossProfit / serviceData.revenue) * 100).toFixed(1) + '%',
      operatingProfitMargin: ((serviceData.operatingProfit / serviceData.revenue) * 100).toFixed(1) + '%',
      netProfitMargin: ((serviceData.netProfit / serviceData.revenue) * 100).toFixed(1) + '%'
    };
  }

  /**
   * Transform UI income statement to service format
   */
  toServiceIncomeStatement(uiData: UIIncomeStatement): ServiceIncomeStatement {
    return {
      period: uiData.period,
      revenue: uiData.revenue,
      costOfSales: uiData.costOfSales,
      grossProfit: uiData.grossProfit,
      operatingExpenses: uiData.operatingExpenses,
      operatingProfit: uiData.operatingProfit,
      taxes: uiData.taxes,
      netProfit: uiData.netProfit,
      revenueItems: uiData.revenueItems,
      expenseItems: uiData.expenseItems
    };
  }

  /**
   * Transform service cash flow statement to UI format
   */
  toUICashFlowStatement(serviceData: ServiceCashFlowStatement): UICashFlowStatement {
    return {
      ...serviceData,
      formattedOperatingCashFlow: `${serviceData.operatingCashFlow.toLocaleString('fr-FR')} €`,
      formattedInvestingCashFlow: `${serviceData.investingCashFlow.toLocaleString('fr-FR')} €`,
      formattedFinancingCashFlow: `${serviceData.financingCashFlow.toLocaleString('fr-FR')} €`,
      formattedNetCashFlow: `${serviceData.netCashFlow.toLocaleString('fr-FR')} €`,
      formattedBeginningCashBalance: `${serviceData.beginningCashBalance.toLocaleString('fr-FR')} €`,
      formattedEndingCashBalance: `${serviceData.endingCashBalance.toLocaleString('fr-FR')} €`,
      cashFlowTrend: serviceData.netCashFlow > 0 ? 'positive' : serviceData.netCashFlow < 0 ? 'negative' : 'neutral'
    };
  }

  /**
   * Transform UI cash flow statement to service format
   */
  toServiceCashFlowStatement(uiData: UICashFlowStatement): ServiceCashFlowStatement {
    return {
      period: uiData.period,
      operatingCashFlow: uiData.operatingCashFlow,
      investingCashFlow: uiData.investingCashFlow,
      financingCashFlow: uiData.financingCashFlow,
      netCashFlow: uiData.netCashFlow,
      beginningCashBalance: uiData.beginningCashBalance,
      endingCashBalance: uiData.endingCashBalance,
      operatingActivities: uiData.operatingActivities,
      investingActivities: uiData.investingActivities,
      financingActivities: uiData.financingActivities
    };
  }

  /**
   * Transform service balance sheet to UI format
   */
  toUIBalanceSheet(serviceData: ServiceBalanceSheet): UIBalanceSheet {
    return {
      ...serviceData,
      formattedTotalAssets: `${serviceData.totalAssets.toLocaleString('fr-FR')} €`,
      formattedTotalLiabilities: `${serviceData.totalLiabilities.toLocaleString('fr-FR')} €`,
      formattedEquity: `${serviceData.equity.toLocaleString('fr-FR')} €`,
      debtToEquityRatio: (serviceData.totalLiabilities / serviceData.equity).toFixed(2),
      currentRatio: (serviceData.currentAssets / serviceData.currentLiabilities).toFixed(2)
    };
  }

  /**
   * Transform UI balance sheet to service format
   */
  toServiceBalanceSheet(uiData: UIBalanceSheet): ServiceBalanceSheet {
    return {
      period: uiData.period,
      currentAssets: uiData.currentAssets,
      nonCurrentAssets: uiData.nonCurrentAssets,
      totalAssets: uiData.totalAssets,
      currentLiabilities: uiData.currentLiabilities,
      nonCurrentLiabilities: uiData.nonCurrentLiabilities,
      totalLiabilities: uiData.totalLiabilities,
      equity: uiData.equity,
      assetItems: uiData.assetItems,
      liabilityItems: uiData.liabilityItems,
      equityItems: uiData.equityItems
    };
  }

  /**
   * Transform service profitability analysis to UI format
   */
  toUIProfitabilityAnalysis(serviceData: ServiceProfitabilityAnalysis): UIProfitabilityAnalysis {
    return {
      ...serviceData,
      formattedROI: serviceData.roi.toFixed(2) + '%',
      formattedNPV: `${serviceData.npv.toLocaleString('fr-FR')} €`,
      formattedIRR: serviceData.irr.toFixed(2) + '%',
      formattedPaybackPeriod: serviceData.paybackPeriod.toFixed(1) + ' mois',
      npvStatus: serviceData.npv > 0 ? 'positive' : 'negative',
      roiComparison: serviceData.roi > 15 ? 'excellent' : serviceData.roi > 10 ? 'good' : serviceData.roi > 5 ? 'average' : 'poor'
    };
  }

  /**
   * Transform UI profitability analysis to service format
   */
  toServiceProfitabilityAnalysis(uiData: UIProfitabilityAnalysis): ServiceProfitabilityAnalysis {
    return {
      roi: uiData.roi,
      npv: uiData.npv,
      irr: uiData.irr,
      paybackPeriod: uiData.paybackPeriod,
      discountRate: uiData.discountRate,
      initialInvestment: uiData.initialInvestment,
      cashFlows: uiData.cashFlows
    };
  }

  /**
   * Create new projection for a business plan
   */
  createNewRevenueProjection(planId: string): UIRevenueProjection {
    const serviceProjection = this.initializeNewServiceRevenueProjection(planId);
    return this.toUIRevenueProjection(serviceProjection);
  }

  /**
   * Create new financial projection for a business plan
   */
  createNewFinancialProjection(planId: string): UIFinancialProjection {
    const serviceProjection = this.initializeNewServiceFinancialProjection(planId);
    return this.toUIFinancialProjection(serviceProjection);
  }

  /**
   * Initialize a new service revenue projection with default values
   */
  private initializeNewServiceRevenueProjection(planId: string): ServiceRevenueProjection {
    const currentDate = new Date();
    const id = `rev-proj-${Date.now()}`;
    
    return {
      id,
      planId,
      name: "Nouvelle projection de revenus",
      description: "Projection par défaut",
      period: {
        startDate: currentDate.toISOString(),
        endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
        periodType: "annual"
      },
      totalRevenue: 0,
      previousPeriodRevenue: 0,
      calculationMethod: "historical",
      confidenceLevel: "medium",
      lastUpdated: currentDate.toISOString(),
      scenarios: [
        {
          id: `scenario-${Date.now()}-1`,
          name: "Scénario de base",
          description: "Projection avec paramètres standards",
          projectedRevenue: 0,
          baselineRevenue: 0,
          probabilityPercentage: 100,
          assumptions: ["Croissance standard du marché"],
          isPreferred: true,
          monthlyBreakdown: []
        }
      ],
      revenueBreakdown: {
        totalAmount: 0,
        period: {
          startDate: currentDate.toISOString(),
          endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
          periodType: "annual"
        },
        categories: []
      },
      breakEvenAnalysis: undefined
    };
  }

  /**
   * Initialize a new service financial projection with default values
   */
  private initializeNewServiceFinancialProjection(planId: string): ServiceFinancialProjection {
    const currentDate = new Date();
    const id = `fin-proj-${Date.now()}`;
    
    return {
      id,
      planId,
      name: "Nouvelle projection financière",
      description: "Projection financière par défaut",
      period: {
        startDate: currentDate.toISOString(),
        endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
        periodType: "annual"
      },
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      taxRate: 25,
      lastUpdated: currentDate.toISOString(),
      incomeStatement: {
        period: {
          startDate: currentDate.toISOString(),
          endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
          periodType: "annual"
        },
        revenue: 0,
        costOfSales: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        operatingProfit: 0,
        taxes: 0,
        netProfit: 0,
        revenueItems: [],
        expenseItems: []
      },
      cashFlowStatement: {
        period: {
          startDate: currentDate.toISOString(),
          endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
          periodType: "annual"
        },
        operatingCashFlow: 0,
        investingCashFlow: 0,
        financingCashFlow: 0,
        netCashFlow: 0,
        beginningCashBalance: 0,
        endingCashBalance: 0,
        operatingActivities: [],
        investingActivities: [],
        financingActivities: []
      },
      balanceSheet: {
        period: {
          startDate: currentDate.toISOString(),
          endDate: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).toISOString(),
          periodType: "annual"
        },
        currentAssets: 0,
        nonCurrentAssets: 0,
        totalAssets: 0,
        currentLiabilities: 0,
        nonCurrentLiabilities: 0,
        totalLiabilities: 0,
        equity: 0,
        assetItems: [],
        liabilityItems: [],
        equityItems: []
      },
      profitabilityAnalysis: {
        roi: 0,
        npv: 0,
        irr: 0,
        paybackPeriod: 0,
        discountRate: 5,
        initialInvestment: 0,
        cashFlows: []
      }
    };
  }

  /**
   * Generate a color code for revenue categories
   */
  private getCategoryColor(categoryName: string): string {
    const colors = {
      'Services': '#4CAF50',
      'Produits': '#2196F3',
      'Abonnements': '#FF9800',
      'Conseil': '#9C27B0',
      'Formation': '#F44336',
      'Support': '#607D8B'
    };
    
    return colors[categoryName as keyof typeof colors] || '#757575';
  }
}