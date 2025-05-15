/**
 * Cashflow Interfaces - Définition des interfaces pour la gestion des flux de trésorerie
 * 
 * Ces interfaces définissent la structure des données pour la gestion des flux de trésorerie,
 * incluant les transactions, projections et analyses.
 * Suivent le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

import { DocumentStatus } from '../invoicing';
import { ExpenseStatus, ExpenseCategory } from './expenses';

/**
 * Type d'entrée dans le flux de trésorerie
 */
export enum CashflowEntryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TAX = 'tax',
  TRANSFER = 'transfer'
}

/**
 * État de planification d'une entrée de trésorerie
 */
export enum CashflowEntryState {
  PROJECTED = 'projected',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Interface pour une entrée de trésorerie côté service
 */
export interface ServiceCashflowEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  state: string;
  sourceId?: string;
  sourceType?: string;
  destinationId?: string;
  destinationAccount?: string;
  category?: string;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une entrée de trésorerie côté UI
 */
export interface UICashflowEntry {
  id: string;
  type: CashflowEntryType;
  amount: number;
  description: string;
  date: string;
  state: CashflowEntryState;
  sourceId?: string;
  sourceType?: string;
  sourceDescription?: string;
  destinationId?: string;
  destinationAccount?: string;
  category?: string;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour un compte bancaire côté service
 */
export interface ServiceBankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  bank?: string;
  description?: string;
  isPrimary: boolean;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type de compte bancaire
 */
export enum BankAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  BUSINESS = 'business',
  TAX = 'tax',
  CREDIT = 'credit',
  OTHER = 'other'
}

/**
 * Interface pour un compte bancaire côté UI
 */
export interface UIBankAccount {
  id: string;
  name: string;
  type: BankAccountType;
  balance: number;
  currency: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  bank?: string;
  description?: string;
  isPrimary: boolean;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour une prévision de trésorerie côté service
 */
export interface ServiceCashflowForecast {
  id: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  entries: ServiceCashflowEntry[];
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une prévision de trésorerie côté UI
 */
export interface UICashflowForecast {
  id: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  entries: UICashflowEntry[];
  finalBalance: number;
  lowestBalance: number;
  highestBalance: number;
  netChange: number;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour un rapport de trésorerie mensuel côté UI
 */
export interface UIMonthlyReport {
  month: string;
  year: number;
  startingBalance: number;
  endingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<ExpenseCategory, number>;
  entries: UICashflowEntry[];
}

/**
 * Interface pour les statistiques de trésorerie côté UI
 */
export interface UICashflowStats {
  currentBalance: number;
  projectedBalance30Days: number;
  projectedBalance90Days: number;
  monthlyAvgIncome: number;
  monthlyAvgExpenses: number;
  monthlyNetCashflow: number;
  upcomingInvoices: {
    count: number;
    total: number;
    overdue: number;
  };
  upcomingExpenses: {
    count: number;
    total: number;
    recurring: number;
  };
  cashflowByMonth: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[];
}

/**
 * Interface pour un scénario de flux de trésorerie côté service
 */
export interface ServiceCashflowScenario {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  assumptions?: Record<string, any>;
  entries: ServiceCashflowEntry[];
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour un scénario de flux de trésorerie côté UI
 */
export interface UICashflowScenario {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  assumptions?: Record<string, any>;
  entries: UICashflowEntry[];
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  isFavorite?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Fonction utilitaire pour calculer le solde final d'une prévision
 */
export const calculateFinalBalance = (forecast: UICashflowForecast): number => {
  const totalIncome = forecast.entries
    .filter(entry => entry.type === CashflowEntryType.INCOME)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const totalExpenses = forecast.entries
    .filter(entry => entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX)
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  return forecast.initialBalance + totalIncome - totalExpenses;
};