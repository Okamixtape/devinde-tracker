import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusinessPlan } from './useBusinessPlan';
import { useServices } from './useServices';
import { useFinances } from './useFinances';

import { ProjectionsAdapter } from '../adapters/projections/ProjectionsAdapter';
import { calculateProjectedRevenue, validateRevenueProjection } from '../utils/calculations/revenueCalculations';
import { calculateFinancialStatements } from '../utils/calculations/financialCalculations';
import { calculateBreakEven } from '../utils/calculations/breakEvenCalculations';
import { calculateProfitability } from '../utils/calculations/profitabilityCalculations';

import { 
  UIRevenueProjection, 
  UIRevenueScenario,
  UIRevenueBreakdown,
  UIBreakEvenAnalysis,
  ServiceRevenueProjection,
  PeriodType,
  CalculationMethod,
  ConfidenceLevel
} from '../interfaces/projections/revenue-projections';

import {
  UIFinancialProjection,
  UIIncomeStatement,
  UICashFlowStatement,
  UIBalanceSheet,
  UIProfitabilityAnalysis,
  ServiceFinancialProjection
} from '../interfaces/projections/financial-projections';

/**
 * Hook for managing business projections data
 */
export function useProjections(planId?: string) {
  // Get data from other hooks
  const { businessPlan, isLoading: isPlanLoading, updateBusinessPlan } = useBusinessPlan(planId);
  const { services, isLoading: isServicesLoading } = useServices(planId);
  const { finances, isLoading: isFinancesLoading } = useFinances(planId);
  
  // Initialize adapter
  const projectionsAdapter = useMemo(() => new ProjectionsAdapter(), []);
  
  // State for projections
  const [revenueProjections, setRevenueProjections] = useState<UIRevenueProjection[]>([]);
  const [financialProjections, setFinancialProjections] = useState<UIFinancialProjection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load projections from business plan
  useEffect(() => {
    if (isPlanLoading || isServicesLoading || isFinancesLoading || !businessPlan) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get projections from business plan (or initialize if they don't exist)
      const planRevenueProjections = businessPlan.projections?.revenueProjections || [];
      const planFinancialProjections = businessPlan.projections?.financialProjections || [];
      
      // Transform to UI format
      const transformedRevenueProjections = planRevenueProjections.map(proj => 
        projectionsAdapter.toUIRevenueProjection(proj)
      );
      
      const transformedFinancialProjections = planFinancialProjections.map(proj => 
        projectionsAdapter.toUIFinancialProjection(proj)
      );
      
      // Update state
      setRevenueProjections(transformedRevenueProjections);
      setFinancialProjections(transformedFinancialProjections);
      setError(null);
    } catch (err) {
      setError(`Error loading projections: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlan, isPlanLoading, isServicesLoading, isFinancesLoading, projectionsAdapter]);
  
  /**
   * Save projections back to business plan
   */
  const saveProjections = useCallback(async () => {
    if (!businessPlan || !planId) return;
    
    try {
      // Transform UI projections to service format
      const serviceRevenueProjections = revenueProjections.map(proj => 
        projectionsAdapter.toServiceRevenueProjection(proj)
      );
      
      const serviceFinancialProjections = financialProjections.map(proj => 
        projectionsAdapter.toServiceFinancialProjection(proj)
      );
      
      // Update business plan with new projections
      const updatedPlan = {
        ...businessPlan,
        projections: {
          ...businessPlan.projections,
          revenueProjections: serviceRevenueProjections,
          financialProjections: serviceFinancialProjections
        }
      };
      
      // Save updated business plan
      await updateBusinessPlan(updatedPlan);
      
      return true;
    } catch (err) {
      setError(`Error saving projections: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [businessPlan, planId, revenueProjections, financialProjections, projectionsAdapter, updateBusinessPlan]);
  
  /**
   * Create a new revenue projection
   */
  const createRevenueProjection = useCallback(() => {
    if (!planId) return;
    
    const newProjection = projectionsAdapter.createNewRevenueProjection(planId);
    setRevenueProjections(prev => [...prev, newProjection]);
    return newProjection;
  }, [planId, projectionsAdapter]);
  
  /**
   * Create a new financial projection
   */
  const createFinancialProjection = useCallback(() => {
    if (!planId) return;
    
    const newProjection = projectionsAdapter.createNewFinancialProjection(planId);
    setFinancialProjections(prev => [...prev, newProjection]);
    return newProjection;
  }, [planId, projectionsAdapter]);
  
  /**
   * Update a revenue projection
   */
  const updateRevenueProjection = useCallback((updatedProjection: UIRevenueProjection) => {
    setRevenueProjections(prev => 
      prev.map(proj => proj.id === updatedProjection.id ? updatedProjection : proj)
    );
  }, []);
  
  /**
   * Update a financial projection
   */
  const updateFinancialProjection = useCallback((updatedProjection: UIFinancialProjection) => {
    setFinancialProjections(prev => 
      prev.map(proj => proj.id === updatedProjection.id ? updatedProjection : proj)
    );
  }, []);
  
  /**
   * Delete a revenue projection
   */
  const deleteRevenueProjection = useCallback((projectionId: string) => {
    setRevenueProjections(prev => 
      prev.filter(proj => proj.id !== projectionId)
    );
  }, []);
  
  /**
   * Delete a financial projection
   */
  const deleteFinancialProjection = useCallback((projectionId: string) => {
    setFinancialProjections(prev => 
      prev.filter(proj => proj.id !== projectionId)
    );
  }, []);
  
  /**
   * Calculate projected revenue based on services and historical data
   */
  const calculateRevenue = useCallback((
    baseRevenue: number,
    growthRate: number,
    periodType: PeriodType,
    confidenceLevel: ConfidenceLevel,
    calculationMethod: CalculationMethod,
    historicalData?: number[]
  ): number => {
    try {
      return calculateProjectedRevenue(
        baseRevenue,
        growthRate,
        periodType,
        confidenceLevel,
        calculationMethod,
        historicalData
      );
    } catch (err) {
      setError(`Error calculating revenue: ${err instanceof Error ? err.message : String(err)}`);
      return 0;
    }
  }, []);
  
  /**
   * Create financial statements based on inputs
   */
  const generateFinancialStatements = useCallback((
    financialProjection: UIFinancialProjection
  ): {
    incomeStatement: UIIncomeStatement;
    cashFlowStatement: UICashFlowStatement;
    balanceSheet: UIBalanceSheet;
  } => {
    try {
      // Transform to service format
      const serviceProjection = projectionsAdapter.toServiceFinancialProjection(financialProjection);
      
      // Calculate financial statements
      const { 
        incomeStatement,
        cashFlowStatement,
        balanceSheet
      } = calculateFinancialStatements(
        serviceProjection,
        serviceProjection.incomeStatement.revenueItems,
        serviceProjection.incomeStatement.expenseItems,
        serviceProjection.balanceSheet.assetItems,
        serviceProjection.balanceSheet.liabilityItems,
        serviceProjection.balanceSheet.equityItems
      );
      
      // Transform back to UI format
      return {
        incomeStatement: projectionsAdapter.toUIIncomeStatement(incomeStatement),
        cashFlowStatement: projectionsAdapter.toUICashFlowStatement(cashFlowStatement),
        balanceSheet: projectionsAdapter.toUIBalanceSheet(balanceSheet)
      };
    } catch (err) {
      setError(`Error generating financial statements: ${err instanceof Error ? err.message : String(err)}`);
      return {
        incomeStatement: financialProjection.incomeStatement,
        cashFlowStatement: financialProjection.cashFlowStatement,
        balanceSheet: financialProjection.balanceSheet
      };
    }
  }, [projectionsAdapter]);
  
  /**
   * Calculate break even analysis
   */
  const generateBreakEvenAnalysis = useCallback((
    fixedCosts: number,
    revenuePerUnit: number,
    variableCostsPerUnit: number,
    projectedUnitSales: number[],
    startDate: Date
  ): UIBreakEvenAnalysis => {
    try {
      // Calculate break even analysis
      const serviceBreakEven = calculateBreakEven(
        fixedCosts,
        revenuePerUnit,
        variableCostsPerUnit,
        projectedUnitSales,
        startDate
      );
      
      // Transform to UI format
      return projectionsAdapter.toUIBreakEvenAnalysis(serviceBreakEven);
    } catch (err) {
      setError(`Error calculating break-even: ${err instanceof Error ? err.message : String(err)}`);
      
      // Return default values in case of error
      return {
        breakEvenPoint: 0,
        formattedBreakEvenPoint: "0 €",
        breakEvenDate: new Date().toISOString(),
        formattedBreakEvenDate: new Date().toLocaleDateString('fr-FR'),
        monthsToBreakEven: 0,
        formattedMonthsToBreakEven: "0",
        statusColor: "#F44336",
        fixedCosts: 0,
        variableCostsPerUnit: 0,
        revenuePerUnit: 0,
        unitsAtBreakEven: 0,
        assumptions: ["Calcul d'équilibre impossible avec les données fournies"]
      };
    }
  }, [projectionsAdapter]);
  
  /**
   * Calculate profitability analysis
   */
  const generateProfitabilityAnalysis = useCallback((
    initialInvestment: number,
    cashFlows: number[],
    discountRate: number
  ): UIProfitabilityAnalysis => {
    try {
      // Calculate profitability metrics
      const serviceProfitability = calculateProfitability(
        initialInvestment,
        cashFlows,
        discountRate
      );
      
      // Transform to UI format
      return projectionsAdapter.toUIProfitabilityAnalysis(serviceProfitability);
    } catch (err) {
      setError(`Error calculating profitability: ${err instanceof Error ? err.message : String(err)}`);
      
      // Return default values in case of error
      return {
        roi: 0,
        formattedROI: "0%",
        npv: 0,
        formattedNPV: "0 €",
        irr: 0,
        formattedIRR: "0%",
        paybackPeriod: 0,
        formattedPaybackPeriod: "0 mois",
        npvStatus: "negative",
        roiComparison: "poor",
        discountRate: 0,
        initialInvestment: 0,
        cashFlows: []
      };
    }
  }, [projectionsAdapter]);
  
  /**
   * Validate a revenue projection for data consistency
   */
  const validateRevenueData = useCallback((projection: UIRevenueProjection): {
    isValid: boolean;
    errors: string[];
  } => {
    // Transform to service format
    const serviceProjection = projectionsAdapter.toServiceRevenueProjection(projection);
    
    // Validate using the utility function
    return validateRevenueProjection(serviceProjection);
  }, [projectionsAdapter]);
  
  /**
   * Get a revenue projection by ID
   */
  const getRevenueProjectionById = useCallback((projectionId: string): UIRevenueProjection | undefined => {
    return revenueProjections.find(proj => proj.id === projectionId);
  }, [revenueProjections]);
  
  /**
   * Get a financial projection by ID
   */
  const getFinancialProjectionById = useCallback((projectionId: string): UIFinancialProjection | undefined => {
    return financialProjections.find(proj => proj.id === projectionId);
  }, [financialProjections]);
  
  return {
    revenueProjections,
    financialProjections,
    isLoading,
    error,
    createRevenueProjection,
    createFinancialProjection,
    updateRevenueProjection,
    updateFinancialProjection,
    deleteRevenueProjection,
    deleteFinancialProjection,
    saveProjections,
    calculateRevenue,
    generateFinancialStatements,
    generateBreakEvenAnalysis,
    generateProfitabilityAnalysis,
    validateRevenueData,
    getRevenueProjectionById,
    getFinancialProjectionById
  };
}