/**
 * useFinances - Hook React pour la gestion des finances
 * 
 * Ce hook encapsule toute la logique nécessaire pour interagir avec les finances,
 * incluant les factures, dépenses et flux de trésorerie.
 * 
 * @module hooks/useFinances
 * @version 1.0
 * @standardized true
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessPlanServiceImpl } from '../services/core/businessPlanService';
import { BusinessPlanData } from '../services/interfaces/dataModels';
import FinancesAdapter from '../adapters/finances/FinancesAdapter';

// Import des interfaces nécessaires
import {
  // Invoices
  UIDocument, ServiceDocument, UIInvoiceItem, UIPayment, UIInvoiceStats, UIInvoiceFilter,
  DocumentType, DocumentStatus, PaymentMethod,
  
  // Expenses
  UIExpense, ServiceExpense, UIExpenseBudget, ServiceExpenseBudget, 
  UIExpenseStats, UIExpenseFilter, ExpenseType, ExpenseCategory, ExpenseStatus,
  
  // Cashflow
  UICashflowEntry, ServiceCashflowEntry, UIBankAccount, ServiceBankAccount,
  UICashflowForecast, ServiceCashflowForecast, UIMonthlyReport, UICashflowStats,
  UICashflowScenario, ServiceCashflowScenario, CashflowEntryType, CashflowEntryState
} from '../interfaces/finances';

/**
 * Paramètres du hook
 */
interface UseFinancesParams {
  planId?: string;
  autoLoad?: boolean;
}

/**
 * Résultat du hook
 */
interface UseFinancesResult {
  // Données
  businessPlanData: BusinessPlanData | null;
  invoices: UIDocument[];
  expenses: UIExpense[];
  expenseBudgets: UIExpenseBudget[];
  cashflowEntries: UICashflowEntry[];
  bankAccounts: UIBankAccount[];
  cashflowForecasts: UICashflowForecast[];
  cashflowScenarios: UICashflowScenario[];
  
  // Statistiques
  invoiceStats: UIInvoiceStats | null;
  expenseStats: UIExpenseStats | null;
  cashflowStats: UICashflowStats | null;
  
  // États
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  dirty: boolean;
  
  // Actions pour les factures
  loadInvoices: (planId: string) => Promise<void>;
  saveInvoice: (invoice: UIDocument) => Promise<boolean>;
  deleteInvoice: (invoiceId: string) => Promise<boolean>;
  addPayment: (invoiceId: string, payment: UIPayment) => Promise<boolean>;
  filterInvoices: (filter: UIInvoiceFilter) => UIDocument[];
  
  // Actions pour les dépenses
  loadExpenses: (planId: string) => Promise<void>;
  saveExpense: (expense: UIExpense) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  saveBudget: (budget: UIExpenseBudget) => Promise<boolean>;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  filterExpenses: (filter: UIExpenseFilter) => UIExpense[];
  
  // Actions pour les flux de trésorerie
  loadCashflow: (planId: string) => Promise<void>;
  saveCashflowEntry: (entry: UICashflowEntry) => Promise<boolean>;
  deleteCashflowEntry: (entryId: string) => Promise<boolean>;
  saveBankAccount: (account: UIBankAccount) => Promise<boolean>;
  deleteBankAccount: (accountId: string) => Promise<boolean>;
  saveCashflowForecast: (forecast: UICashflowForecast) => Promise<boolean>;
  saveCashflowScenario: (scenario: UICashflowScenario) => Promise<boolean>;
  deleteCashflowScenario: (scenarioId: string) => Promise<boolean>;
  getMonthlyReport: (year: number, month: number) => UIMonthlyReport;
}

/**
 * Hook pour la gestion des finances
 */
export const useFinances = ({
  planId,
  autoLoad = false
}: UseFinancesParams = {}): UseFinancesResult => {
  // Singleton du service
  const businessPlanService = useMemo(() => new BusinessPlanServiceImpl(), []);
  
  // État principal
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [financesData, setFinancesData] = useState<any>(null);
  
  // État des données financières
  const [invoices, setInvoices] = useState<UIDocument[]>([]);
  const [expenses, setExpenses] = useState<UIExpense[]>([]);
  const [expenseBudgets, setExpenseBudgets] = useState<UIExpenseBudget[]>([]);
  const [cashflowEntries, setCashflowEntries] = useState<UICashflowEntry[]>([]);
  const [bankAccounts, setBankAccounts] = useState<UIBankAccount[]>([]);
  const [cashflowForecasts, setCashflowForecasts] = useState<UICashflowForecast[]>([]);
  const [cashflowScenarios, setCashflowScenarios] = useState<UICashflowScenario[]>([]);
  
  // État des statistiques
  const [invoiceStats, setInvoiceStats] = useState<UIInvoiceStats | null>(null);
  const [expenseStats, setExpenseStats] = useState<UIExpenseStats | null>(null);
  const [cashflowStats, setCashflowStats] = useState<UICashflowStats | null>(null);
  
  // État de l'interface utilisateur
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  
  /**
   * Fonction utilitaire pour calculer les statistiques de facturation
   */
  const calculateInvoiceStats = useCallback((invoiceList: UIDocument[]): UIInvoiceStats => {
    // Total des montants en attente
    const totalOutstanding = invoiceList
      .filter(inv => inv.status !== DocumentStatus.PAID && inv.status !== DocumentStatus.CANCELLED)
      .reduce((sum, inv) => sum + (inv.total || 0) - (inv.amountPaid || 0), 0);
      
    // Total des montants payés
    const totalPaid = invoiceList
      .filter(inv => inv.status === DocumentStatus.PAID || inv.amountPaid)
      .reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
      
    // Total des montants en retard
    const totalOverdue = invoiceList
      .filter(inv => inv.status === DocumentStatus.OVERDUE)
      .reduce((sum, inv) => sum + (inv.total || 0) - (inv.amountPaid || 0), 0);
      
    // Délai moyen de paiement en jours
    const paidInvoices = invoiceList.filter(inv => 
      inv.status === DocumentStatus.PAID && inv.lastPaymentDate && inv.issueDate
    );
    
    let averageDaysToPayment = 0;
    if (paidInvoices.length > 0) {
      const totalDays = paidInvoices.reduce((sum, inv) => {
        const issueDate = new Date(inv.issueDate);
        const paymentDate = new Date(inv.lastPaymentDate!);
        const days = Math.floor((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageDaysToPayment = Math.round(totalDays / paidInvoices.length);
    }
    
    // Nombre de factures par statut
    const invoicesByStatus: Record<DocumentStatus, number> = {} as Record<DocumentStatus, number>;
    Object.values(DocumentStatus).forEach(status => {
      invoicesByStatus[status] = invoiceList.filter(inv => inv.status === status).length;
    });
    
    // Chiffre d'affaires par mois
    const revenueByMonth: { month: string; revenue: number }[] = [];
    const monthMap: Map<string, number> = new Map();
    
    invoiceList.forEach(inv => {
      if (inv.issueDate) {
        const month = inv.issueDate.substring(0, 7); // Format: 'YYYY-MM'
        const currentRevenue = monthMap.get(month) || 0;
        monthMap.set(month, currentRevenue + (inv.total || 0));
      }
    });
    
    // Convertir la Map en tableau trié par date
    Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([month, revenue]) => {
        revenueByMonth.push({ month, revenue });
      });
    
    return {
      totalOutstanding,
      totalPaid,
      totalOverdue,
      averageDaysToPayment,
      invoicesByStatus,
      revenueByMonth
    };
  }, []);
  
  /**
   * Fonction utilitaire pour calculer les statistiques de dépenses
   */
  const calculateExpenseStats = useCallback((expenseList: UIExpense[]): UIExpenseStats => {
    // Total des dépenses
    const totalExpenses = expenseList
      .filter(exp => exp.status !== ExpenseStatus.CANCELLED)
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    // Total par catégorie
    const totalByCategory: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
    Object.values(ExpenseCategory).forEach(category => {
      totalByCategory[category] = expenseList
        .filter(exp => exp.status !== ExpenseStatus.CANCELLED && exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
    
    // Dépenses par mois
    const expensesByMonth: { month: string; amount: number }[] = [];
    const monthMap: Map<string, number> = new Map();
    
    expenseList.forEach(exp => {
      if (exp.expenseDate) {
        const month = exp.expenseDate.substring(0, 7); // Format: 'YYYY-MM'
        const currentAmount = monthMap.get(month) || 0;
        monthMap.set(month, currentAmount + exp.amount);
      }
    });
    
    // Convertir la Map en tableau trié par date
    Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([month, amount]) => {
        expensesByMonth.push({ month, amount });
      });
    
    // Catégories de dépenses les plus importantes
    const categories = Object.entries(totalByCategory)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Les 5 catégories les plus importantes
    
    // Total mensuel récurrent
    const recurringMonthlyTotal = expenseList
      .filter(exp => exp.recurring && exp.status !== ExpenseStatus.CANCELLED)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      totalExpenses,
      totalByCategory,
      expensesByMonth,
      largestExpenseCategories: categories,
      recurringMonthlyTotal
    };
  }, []);
  
  /**
   * Fonction utilitaire pour calculer les statistiques de flux de trésorerie
   */
  const calculateCashflowStats = useCallback((
    entries: UICashflowEntry[],
    accounts: UIBankAccount[],
    forecasts: UICashflowForecast[]
  ): UICashflowStats => {
    // Solde actuel total de tous les comptes
    const currentBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Prévisions à 30 et 90 jours
    let projectedBalance30Days = currentBalance;
    let projectedBalance90Days = currentBalance;
    
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    const in90Days = new Date();
    in90Days.setDate(today.getDate() + 90);
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      
      if (entryDate > today) {
        if (entry.type === CashflowEntryType.INCOME) {
          if (entryDate <= in30Days) {
            projectedBalance30Days += entry.amount;
          }
          if (entryDate <= in90Days) {
            projectedBalance90Days += entry.amount;
          }
        } else if (entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX) {
          if (entryDate <= in30Days) {
            projectedBalance30Days -= entry.amount;
          }
          if (entryDate <= in90Days) {
            projectedBalance90Days -= entry.amount;
          }
        }
      }
    });
    
    // Moyennes mensuelles
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const recentEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= sixMonthsAgo && entryDate <= today;
    });
    
    const incomeEntries = recentEntries.filter(entry => entry.type === CashflowEntryType.INCOME);
    const expenseEntries = recentEntries.filter(entry => 
      entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX
    );
    
    const monthlyAvgIncome = incomeEntries.length > 0 
      ? incomeEntries.reduce((sum, entry) => sum + entry.amount, 0) / 6 
      : 0;
      
    const monthlyAvgExpenses = expenseEntries.length > 0
      ? expenseEntries.reduce((sum, entry) => sum + entry.amount, 0) / 6
      : 0;
      
    const monthlyNetCashflow = monthlyAvgIncome - monthlyAvgExpenses;
    
    // Factures et dépenses à venir
    const upcomingEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate > today && entryDate <= in30Days;
    });
    
    const upcomingIncomeEntries = upcomingEntries.filter(entry => entry.type === CashflowEntryType.INCOME);
    const upcomingExpenseEntries = upcomingEntries.filter(entry => 
      entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX
    );
    
    const upcomingInvoices = {
      count: upcomingIncomeEntries.length,
      total: upcomingIncomeEntries.reduce((sum, entry) => sum + entry.amount, 0),
      overdue: 0 // Nécessiterait des informations additionnelles
    };
    
    const upcomingExpenses = {
      count: upcomingExpenseEntries.length,
      total: upcomingExpenseEntries.reduce((sum, entry) => sum + entry.amount, 0),
      recurring: 0 // Nécessiterait des informations additionnelles
    };
    
    // Flux de trésorerie par mois
    const cashflowByMonth: { month: string; income: number; expenses: number; net: number }[] = [];
    const incomeByMonth: Map<string, number> = new Map();
    const expensesByMonth: Map<string, number> = new Map();
    
    recentEntries.forEach(entry => {
      if (entry.date) {
        const month = entry.date.substring(0, 7); // Format: 'YYYY-MM'
        
        if (entry.type === CashflowEntryType.INCOME) {
          const currentIncome = incomeByMonth.get(month) || 0;
          incomeByMonth.set(month, currentIncome + entry.amount);
        } else if (entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX) {
          const currentExpense = expensesByMonth.get(month) || 0;
          expensesByMonth.set(month, currentExpense + entry.amount);
        }
      }
    });
    
    // Fusionner les maps pour obtenir le flux net par mois
    const allMonths = new Set([...incomeByMonth.keys(), ...expensesByMonth.keys()]);
    Array.from(allMonths)
      .sort()
      .forEach(month => {
        const income = incomeByMonth.get(month) || 0;
        const expenses = expensesByMonth.get(month) || 0;
        const net = income - expenses;
        
        cashflowByMonth.push({ month, income, expenses, net });
      });
    
    return {
      currentBalance,
      projectedBalance30Days,
      projectedBalance90Days,
      monthlyAvgIncome,
      monthlyAvgExpenses,
      monthlyNetCashflow,
      upcomingInvoices,
      upcomingExpenses,
      cashflowByMonth
    };
  }, []);
  
  /**
   * Charge toutes les données financières
   */
  const loadFinances = useCallback(async (id: string): Promise<void> => {
    if (!id) {
      setError('No business plan ID provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await businessPlanService.getItem(id);
      
      if (result.success && result.data) {
        // Convertir BusinessPlan to BusinessPlanData pour backward compatibility
        const businessPlanDataFromService = result.data as any as BusinessPlanData;
        setBusinessPlanData(businessPlanDataFromService);
        
        // Extraire les données financières
        const extractedFinances = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanDataFromService);
        setFinancesData(extractedFinances);
        
        // Mettre à jour les états des différentes sections financières
        
        // Factures
        const uiInvoices = Array.isArray(extractedFinances.invoices)
          ? extractedFinances.invoices.map((invoice: ServiceDocument) => FinancesAdapter.invoiceToUI(invoice))
          : [];
        setInvoices(uiInvoices);
        setInvoiceStats(uiInvoices.length > 0 ? calculateInvoiceStats(uiInvoices) : null);
        
        // Dépenses
        const uiExpenses = Array.isArray(extractedFinances.expenses)
          ? extractedFinances.expenses.map((expense: ServiceExpense) => FinancesAdapter.expenseToUI(expense))
          : [];
        setExpenses(uiExpenses);
        setExpenseStats(uiExpenses.length > 0 ? calculateExpenseStats(uiExpenses) : null);
        
        // Budgets de dépenses
        const uiBudgets = Array.isArray(extractedFinances.expenseBudgets)
          ? extractedFinances.expenseBudgets.map((budget: ServiceExpenseBudget) => FinancesAdapter.expenseBudgetToUI(budget))
          : [];
        setExpenseBudgets(uiBudgets);
        
        // Flux de trésorerie
        const cashflow = extractedFinances.cashflow || {};
        
        // Entrées de flux de trésorerie
        const uiEntries = Array.isArray(cashflow.entries)
          ? cashflow.entries.map((entry: ServiceCashflowEntry) => FinancesAdapter.cashflowEntryToUI(entry))
          : [];
        setCashflowEntries(uiEntries);
        
        // Comptes bancaires
        const uiAccounts = Array.isArray(cashflow.accounts)
          ? cashflow.accounts.map((account: ServiceBankAccount) => FinancesAdapter.bankAccountToUI(account))
          : [];
        setBankAccounts(uiAccounts);
        
        // Prévisions
        const uiForecasts = Array.isArray(cashflow.forecasts)
          ? cashflow.forecasts.map((forecast: ServiceCashflowForecast) => FinancesAdapter.cashflowForecastToUI(forecast))
          : [];
        setCashflowForecasts(uiForecasts);
        
        // Scénarios
        const uiScenarios = Array.isArray(cashflow.scenarios)
          ? cashflow.scenarios.map((scenario: ServiceCashflowScenario) => FinancesAdapter.cashflowScenarioToUI(scenario))
          : [];
        setCashflowScenarios(uiScenarios);
        
        // Statistiques de flux de trésorerie
        setCashflowStats(calculateCashflowStats(uiEntries, uiAccounts, uiForecasts));
        
        setDirty(false);
      } else {
        setError(result.error?.message || 'Unknown error while loading data');
      }
    } catch (err) {
      setError(`Loading error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading finances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessPlanService, calculateInvoiceStats, calculateExpenseStats, calculateCashflowStats]);
  
  // Alias pour les différents chargements de données
  const loadInvoices = loadFinances;
  const loadExpenses = loadFinances;
  const loadCashflow = loadFinances;
  
  /**
   * Crée ou met à jour une facture
   */
  const saveInvoice = useCallback(async (invoice: UIDocument): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Convertir la facture UI en facture service
      const serviceInvoice = FinancesAdapter.invoiceToService(invoice);
      
      // Mettre à jour la liste des factures
      let updatedInvoices = [...(currentFinancesData.invoices || [])];
      
      if (invoice.id) {
        // Mettre à jour une facture existante
        const index = updatedInvoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
          updatedInvoices[index] = serviceInvoice;
        } else {
          updatedInvoices.push(serviceInvoice);
        }
      } else {
        // Ajouter une nouvelle facture
        updatedInvoices.push(serviceInvoice);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        invoices: updatedInvoices
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des factures
        const uiInvoices = updatedInvoices.map(inv => FinancesAdapter.invoiceToUI(inv));
        setInvoices(uiInvoices);
        setInvoiceStats(calculateInvoiceStats(uiInvoices));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving invoice');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving invoice:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, calculateInvoiceStats]);
  
  /**
   * Supprime une facture
   */
  const deleteInvoice = useCallback(async (invoiceId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Supprimer la facture
      const updatedInvoices = (currentFinancesData.invoices || []).filter(inv => inv.id !== invoiceId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        invoices: updatedInvoices
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des factures
        const uiInvoices = updatedInvoices.map(inv => FinancesAdapter.invoiceToUI(inv));
        setInvoices(uiInvoices);
        setInvoiceStats(calculateInvoiceStats(uiInvoices));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting invoice');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting invoice:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, calculateInvoiceStats]);
  
  /**
   * Ajoute un paiement à une facture
   */
  const addPayment = useCallback(async (invoiceId: string, payment: UIPayment): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Trouver la facture
      const invoiceIndex = (currentFinancesData.invoices || []).findIndex(inv => inv.id === invoiceId);
      
      if (invoiceIndex === -1) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      
      // Convertir le paiement UI en paiement service
      const servicePayment = {
        ...FinancesAdapter['_paymentToService'](payment),
        documentId: invoiceId
      };
      
      // Copier les factures
      const updatedInvoices = [...(currentFinancesData.invoices || [])];
      
      // Mettre à jour la facture avec le nouveau paiement
      const invoice = updatedInvoices[invoiceIndex];
      
      if (!invoice.payments) {
        invoice.payments = [];
      }
      
      invoice.payments.push(servicePayment);
      
      // Mettre à jour le montant payé
      const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      invoice.amountPaid = amountPaid;
      invoice.remainingAmount = (invoice.total || 0) - amountPaid;
      invoice.lastPaymentDate = servicePayment.date;
      
      // Mettre à jour le statut de la facture
      if (amountPaid >= (invoice.total || 0)) {
        invoice.status = DocumentStatus.PAID.toString();
      } else if (amountPaid > 0) {
        invoice.status = DocumentStatus.PARTIALLY_PAID.toString();
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        invoices: updatedInvoices
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des factures
        const uiInvoices = updatedInvoices.map(inv => FinancesAdapter.invoiceToUI(inv));
        setInvoices(uiInvoices);
        setInvoiceStats(calculateInvoiceStats(uiInvoices));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error adding payment');
      }
    } catch (err) {
      setError(`Payment error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error adding payment:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, calculateInvoiceStats]);
  
  /**
   * Filtre les factures selon les critères spécifiés
   */
  const filterInvoices = useCallback((filter: UIInvoiceFilter): UIDocument[] => {
    return invoices.filter(invoice => {
      // Filtrer par statut
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(invoice.status)) {
          return false;
        }
      }
      
      // Filtrer par client
      if (filter.clientId && invoice.clientInfo.id !== filter.clientId) {
        return false;
      }
      
      // Filtrer par date
      if (filter.dateFrom && invoice.issueDate < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && invoice.issueDate > filter.dateTo) {
        return false;
      }
      
      // Filtrer par montant
      if (filter.minAmount !== undefined && (invoice.total || 0) < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount !== undefined && (invoice.total || 0) > filter.maxAmount) {
        return false;
      }
      
      // Filtrer par terme de recherche
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const isMatch = 
          invoice.number.toLowerCase().includes(searchLower) ||
          invoice.clientInfo.name.toLowerCase().includes(searchLower) ||
          (invoice.notes && invoice.notes.toLowerCase().includes(searchLower));
        
        if (!isMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [invoices]);
  
  /**
   * Crée ou met à jour une dépense
   */
  const saveExpense = useCallback(async (expense: UIExpense): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Convertir la dépense UI en dépense service
      const serviceExpense = FinancesAdapter.expenseToService(expense);
      
      // Mettre à jour la liste des dépenses
      let updatedExpenses = [...(currentFinancesData.expenses || [])];
      
      if (expense.id) {
        // Mettre à jour une dépense existante
        const index = updatedExpenses.findIndex(exp => exp.id === expense.id);
        if (index !== -1) {
          updatedExpenses[index] = serviceExpense;
        } else {
          updatedExpenses.push(serviceExpense);
        }
      } else {
        // Ajouter une nouvelle dépense
        updatedExpenses.push(serviceExpense);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        expenses: updatedExpenses
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des dépenses
        const uiExpenses = updatedExpenses.map(exp => FinancesAdapter.expenseToUI(exp));
        setExpenses(uiExpenses);
        setExpenseStats(calculateExpenseStats(uiExpenses));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving expense');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving expense:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, calculateExpenseStats]);
  
  /**
   * Supprime une dépense
   */
  const deleteExpense = useCallback(async (expenseId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Supprimer la dépense
      const updatedExpenses = (currentFinancesData.expenses || []).filter(exp => exp.id !== expenseId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        expenses: updatedExpenses
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des dépenses
        const uiExpenses = updatedExpenses.map(exp => FinancesAdapter.expenseToUI(exp));
        setExpenses(uiExpenses);
        setExpenseStats(calculateExpenseStats(uiExpenses));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting expense');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting expense:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, calculateExpenseStats]);
  
  /**
   * Crée ou met à jour un budget de dépenses
   */
  const saveBudget = useCallback(async (budget: UIExpenseBudget): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Convertir le budget UI en budget service
      const serviceBudget = FinancesAdapter.expenseBudgetToService(budget);
      
      // Mettre à jour la liste des budgets
      let updatedBudgets = [...(currentFinancesData.expenseBudgets || [])];
      
      if (budget.id) {
        // Mettre à jour un budget existant
        const index = updatedBudgets.findIndex(b => b.id === budget.id);
        if (index !== -1) {
          updatedBudgets[index] = serviceBudget;
        } else {
          updatedBudgets.push(serviceBudget);
        }
      } else {
        // Ajouter un nouveau budget
        updatedBudgets.push(serviceBudget);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        expenseBudgets: updatedBudgets
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des budgets
        const uiBudgets = updatedBudgets.map(b => FinancesAdapter.expenseBudgetToUI(b));
        setExpenseBudgets(uiBudgets);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving budget');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving budget:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Supprime un budget de dépenses
   */
  const deleteBudget = useCallback(async (budgetId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // Supprimer le budget
      const updatedBudgets = (currentFinancesData.expenseBudgets || []).filter(b => b.id !== budgetId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        expenseBudgets: updatedBudgets
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des budgets
        const uiBudgets = updatedBudgets.map(b => FinancesAdapter.expenseBudgetToUI(b));
        setExpenseBudgets(uiBudgets);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting budget');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting budget:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Filtre les dépenses selon les critères spécifiés
   */
  const filterExpenses = useCallback((filter: UIExpenseFilter): UIExpense[] => {
    return expenses.filter(expense => {
      // Filtrer par statut
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(expense.status)) {
          return false;
        }
      }
      
      // Filtrer par type
      if (filter.type && filter.type.length > 0) {
        if (!filter.type.includes(expense.type)) {
          return false;
        }
      }
      
      // Filtrer par catégorie
      if (filter.category && filter.category.length > 0) {
        if (!filter.category.includes(expense.category)) {
          return false;
        }
      }
      
      // Filtrer par date
      if (filter.dateFrom && expense.expenseDate < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && expense.expenseDate > filter.dateTo) {
        return false;
      }
      
      // Filtrer par montant
      if (filter.minAmount !== undefined && expense.amount < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount !== undefined && expense.amount > filter.maxAmount) {
        return false;
      }
      
      // Filtrer par récurrence
      if (filter.recurring !== undefined && expense.recurring !== filter.recurring) {
        return false;
      }
      
      // Filtrer par terme de recherche
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const isMatch = 
          expense.title.toLowerCase().includes(searchLower) ||
          (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
          (expense.vendorName && expense.vendorName.toLowerCase().includes(searchLower));
        
        if (!isMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [expenses]);
  
  /**
   * Crée ou met à jour une entrée de flux de trésorerie
   */
  const saveCashflowEntry = useCallback(async (entry: UICashflowEntry): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        currentFinancesData.cashflow = {
          entries: [],
          accounts: [],
          forecasts: [],
          scenarios: []
        };
      }
      
      // Convertir l'entrée UI en entrée service
      const serviceEntry = FinancesAdapter.cashflowEntryToService(entry);
      
      // Mettre à jour la liste des entrées
      let updatedEntries = [...(currentFinancesData.cashflow.entries || [])];
      
      if (entry.id) {
        // Mettre à jour une entrée existante
        const index = updatedEntries.findIndex(e => e.id === entry.id);
        if (index !== -1) {
          updatedEntries[index] = serviceEntry;
        } else {
          updatedEntries.push(serviceEntry);
        }
      } else {
        // Ajouter une nouvelle entrée
        updatedEntries.push(serviceEntry);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          entries: updatedEntries
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des entrées
        const uiEntries = updatedEntries.map(e => FinancesAdapter.cashflowEntryToUI(e));
        setCashflowEntries(uiEntries);
        
        // Mettre à jour les statistiques
        setCashflowStats(calculateCashflowStats(uiEntries, bankAccounts, cashflowForecasts));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving cashflow entry');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving cashflow entry:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, bankAccounts, cashflowForecasts, calculateCashflowStats]);
  
  /**
   * Supprime une entrée de flux de trésorerie
   */
  const deleteCashflowEntry = useCallback(async (entryId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        return false; // Rien à supprimer
      }
      
      // Supprimer l'entrée
      const updatedEntries = (currentFinancesData.cashflow.entries || []).filter(e => e.id !== entryId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          entries: updatedEntries
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des entrées
        const uiEntries = updatedEntries.map(e => FinancesAdapter.cashflowEntryToUI(e));
        setCashflowEntries(uiEntries);
        
        // Mettre à jour les statistiques
        setCashflowStats(calculateCashflowStats(uiEntries, bankAccounts, cashflowForecasts));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting cashflow entry');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting cashflow entry:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, bankAccounts, cashflowForecasts, calculateCashflowStats]);
  
  /**
   * Crée ou met à jour un compte bancaire
   */
  const saveBankAccount = useCallback(async (account: UIBankAccount): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        currentFinancesData.cashflow = {
          entries: [],
          accounts: [],
          forecasts: [],
          scenarios: []
        };
      }
      
      // Convertir le compte UI en compte service
      const serviceAccount = FinancesAdapter.bankAccountToService(account);
      
      // Mettre à jour la liste des comptes
      let updatedAccounts = [...(currentFinancesData.cashflow.accounts || [])];
      
      if (account.id) {
        // Mettre à jour un compte existant
        const index = updatedAccounts.findIndex(a => a.id === account.id);
        if (index !== -1) {
          updatedAccounts[index] = serviceAccount;
        } else {
          updatedAccounts.push(serviceAccount);
        }
      } else {
        // Ajouter un nouveau compte
        updatedAccounts.push(serviceAccount);
      }
      
      // Si ce compte est marqué comme principal, mettre à jour les autres
      if (serviceAccount.isPrimary) {
        updatedAccounts = updatedAccounts.map(a => 
          a.id !== serviceAccount.id ? { ...a, isPrimary: false } : a
        );
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          accounts: updatedAccounts
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des comptes
        const uiAccounts = updatedAccounts.map(a => FinancesAdapter.bankAccountToUI(a));
        setBankAccounts(uiAccounts);
        
        // Mettre à jour les statistiques
        setCashflowStats(calculateCashflowStats(cashflowEntries, uiAccounts, cashflowForecasts));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving bank account');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving bank account:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, cashflowEntries, cashflowForecasts, calculateCashflowStats]);
  
  /**
   * Supprime un compte bancaire
   */
  const deleteBankAccount = useCallback(async (accountId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        return false; // Rien à supprimer
      }
      
      // Supprimer le compte
      const updatedAccounts = (currentFinancesData.cashflow.accounts || []).filter(a => a.id !== accountId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          accounts: updatedAccounts
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des comptes
        const uiAccounts = updatedAccounts.map(a => FinancesAdapter.bankAccountToUI(a));
        setBankAccounts(uiAccounts);
        
        // Mettre à jour les statistiques
        setCashflowStats(calculateCashflowStats(cashflowEntries, uiAccounts, cashflowForecasts));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting bank account');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting bank account:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, cashflowEntries, cashflowForecasts, calculateCashflowStats]);
  
  /**
   * Crée ou met à jour une prévision de flux de trésorerie
   */
  const saveCashflowForecast = useCallback(async (forecast: UICashflowForecast): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        currentFinancesData.cashflow = {
          entries: [],
          accounts: [],
          forecasts: [],
          scenarios: []
        };
      }
      
      // Convertir la prévision UI en prévision service
      const serviceForecast = FinancesAdapter.cashflowForecastToService(forecast);
      
      // Mettre à jour la liste des prévisions
      let updatedForecasts = [...(currentFinancesData.cashflow.forecasts || [])];
      
      if (forecast.id) {
        // Mettre à jour une prévision existante
        const index = updatedForecasts.findIndex(f => f.id === forecast.id);
        if (index !== -1) {
          updatedForecasts[index] = serviceForecast;
        } else {
          updatedForecasts.push(serviceForecast);
        }
      } else {
        // Ajouter une nouvelle prévision
        updatedForecasts.push(serviceForecast);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          forecasts: updatedForecasts
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des prévisions
        const uiForecasts = updatedForecasts.map(f => FinancesAdapter.cashflowForecastToUI(f));
        setCashflowForecasts(uiForecasts);
        
        // Mettre à jour les statistiques
        setCashflowStats(calculateCashflowStats(cashflowEntries, bankAccounts, uiForecasts));
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving cashflow forecast');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving cashflow forecast:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService, cashflowEntries, bankAccounts, calculateCashflowStats]);
  
  /**
   * Crée ou met à jour un scénario de flux de trésorerie
   */
  const saveCashflowScenario = useCallback(async (scenario: UICashflowScenario): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        currentFinancesData.cashflow = {
          entries: [],
          accounts: [],
          forecasts: [],
          scenarios: []
        };
      }
      
      // Convertir le scénario UI en scénario service
      const serviceScenario = FinancesAdapter.cashflowScenarioToService(scenario);
      
      // Mettre à jour la liste des scénarios
      let updatedScenarios = [...(currentFinancesData.cashflow.scenarios || [])];
      
      if (scenario.id) {
        // Mettre à jour un scénario existant
        const index = updatedScenarios.findIndex(s => s.id === scenario.id);
        if (index !== -1) {
          updatedScenarios[index] = serviceScenario;
        } else {
          updatedScenarios.push(serviceScenario);
        }
      } else {
        // Ajouter un nouveau scénario
        updatedScenarios.push(serviceScenario);
      }
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          scenarios: updatedScenarios
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des scénarios
        const uiScenarios = updatedScenarios.map(s => FinancesAdapter.cashflowScenarioToUI(s));
        setCashflowScenarios(uiScenarios);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error saving cashflow scenario');
      }
    } catch (err) {
      setError(`Save error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error saving cashflow scenario:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Supprime un scénario de flux de trésorerie
   */
  const deleteCashflowScenario = useCallback(async (scenarioId: string): Promise<boolean> => {
    if (!businessPlanData) {
      setError('No business plan data available');
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Extraire les données financières actuelles
      const currentFinancesData = FinancesAdapter.extractFinancesFromBusinessPlan(businessPlanData);
      
      // S'assurer que la structure cashflow existe
      if (!currentFinancesData.cashflow) {
        return false; // Rien à supprimer
      }
      
      // Supprimer le scénario
      const updatedScenarios = (currentFinancesData.cashflow.scenarios || []).filter(s => s.id !== scenarioId);
      
      // Créer un nouvel objet de données financières
      const updatedFinancesData = {
        ...currentFinancesData,
        cashflow: {
          ...currentFinancesData.cashflow,
          scenarios: updatedScenarios
        }
      };
      
      // Mettre à jour le plan d'affaires
      const updatedBusinessPlan = FinancesAdapter.updateBusinessPlanWithFinances(
        businessPlanData,
        updatedFinancesData
      );
      
      // Sauvegarder les modifications
      const result = await businessPlanService.updateItem(
        businessPlanData.id || '',
        updatedBusinessPlan
      );
      
      if (result.success) {
        // Mettre à jour l'état local
        setBusinessPlanData(updatedBusinessPlan);
        setFinancesData(updatedFinancesData);
        
        // Mettre à jour la liste des scénarios
        const uiScenarios = updatedScenarios.map(s => FinancesAdapter.cashflowScenarioToUI(s));
        setCashflowScenarios(uiScenarios);
        
        setDirty(false);
        return true;
      } else {
        throw new Error(result.error?.message || 'Error deleting cashflow scenario');
      }
    } catch (err) {
      setError(`Delete error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting cashflow scenario:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [businessPlanData, businessPlanService]);
  
  /**
   * Génère un rapport mensuel
   */
  const getMonthlyReport = useCallback((year: number, month: number): UIMonthlyReport => {
    // Dates de début et de fin du mois
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Formatage des dates ISO
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Filtrer les entrées pour ce mois
    const monthEntries = cashflowEntries.filter(entry => {
      return entry.date >= startDateStr && entry.date <= endDateStr;
    });
    
    // Calculer les revenus et dépenses totaux
    const totalIncome = monthEntries
      .filter(entry => entry.type === CashflowEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const totalExpenses = monthEntries
      .filter(entry => entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    // Calculer par catégorie
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
    
    monthEntries.forEach(entry => {
      if (entry.type === CashflowEntryType.INCOME && entry.category) {
        incomeByCategory[entry.category] = (incomeByCategory[entry.category] || 0) + entry.amount;
      } else if ((entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX) && entry.category) {
        const category = entry.category as ExpenseCategory;
        expensesByCategory[category] = (expensesByCategory[category] || 0) + entry.amount;
      }
    });
    
    // Déterminer le solde initial et final
    let startingBalance = 0;
    let endingBalance = 0;
    
    // Si nous avons des comptes, utiliser leur solde actuel
    if (bankAccounts.length > 0) {
      startingBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
    }
    
    // Calculer le solde final
    endingBalance = startingBalance + totalIncome - totalExpenses;
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    return {
      month: monthNames[month - 1],
      year,
      startingBalance,
      endingBalance,
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      incomeByCategory,
      expensesByCategory,
      entries: monthEntries
    };
  }, [cashflowEntries, bankAccounts]);
  
  // Charger automatiquement les données si un planId est fourni
  useEffect(() => {
    if (autoLoad && planId) {
      loadFinances(planId);
    }
  }, [autoLoad, planId, loadFinances]);
  
  return {
    // Données
    businessPlanData,
    invoices,
    expenses,
    expenseBudgets,
    cashflowEntries,
    bankAccounts,
    cashflowForecasts,
    cashflowScenarios,
    
    // Statistiques
    invoiceStats,
    expenseStats,
    cashflowStats,
    
    // États
    isLoading,
    isSaving,
    error,
    dirty,
    
    // Actions pour les factures
    loadInvoices,
    saveInvoice,
    deleteInvoice,
    addPayment,
    filterInvoices,
    
    // Actions pour les dépenses
    loadExpenses,
    saveExpense,
    deleteExpense,
    saveBudget,
    deleteBudget,
    filterExpenses,
    
    // Actions pour les flux de trésorerie
    loadCashflow,
    saveCashflowEntry,
    deleteCashflowEntry,
    saveBankAccount,
    deleteBankAccount,
    saveCashflowForecast,
    saveCashflowScenario,
    deleteCashflowScenario,
    getMonthlyReport
  };
};

export default useFinances;