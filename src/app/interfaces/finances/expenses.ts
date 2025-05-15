/**
 * Expenses Interfaces - Définition des interfaces pour les dépenses
 * 
 * Ces interfaces définissent la structure des données pour la gestion des dépenses,
 * incluant leurs catégories, statuts, et informations fiscales.
 * Suivent le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

/**
 * Types de dépenses possibles
 */
export enum ExpenseType {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  TRAVEL = 'travel',
  MEAL = 'meal',
  ACCOMMODATION = 'accommodation',
  OFFICE = 'office',
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  SERVICE = 'service',
  TAX = 'tax',
  INSURANCE = 'insurance',
  TRAINING = 'training',
  OTHER = 'other'
}

/**
 * Statut de la dépense
 */
export enum ExpenseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  REJECTED = 'rejected',
  REIMBURSED = 'reimbursed',
  CANCELLED = 'cancelled'
}

/**
 * Catégorie de dépense pour la comptabilité
 */
export enum ExpenseCategory {
  EQUIPMENT = 'equipment',
  SUPPLIES = 'supplies',
  RENT = 'rent',
  UTILITIES = 'utilities',
  MARKETING = 'marketing',
  TRAVEL = 'travel',
  MEALS = 'meals',
  ENTERTAINMENT = 'entertainment',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  SALARIES = 'salaries',
  SOFTWARE = 'software',
  EDUCATION = 'education',
  FEES = 'fees',
  OTHER = 'other'
}

/**
 * Méthode de paiement de la dépense
 */
export enum ExpensePaymentMethod {
  BANK_TRANSFER = 'transfer',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  CHECK = 'check',
  DIRECT_DEBIT = 'direct_debit',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

/**
 * Périodicité pour les dépenses récurrentes
 */
export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

/**
 * Interface pour une dépense côté service
 */
export interface ServiceExpense {
  id: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  amount: number;
  taxAmount?: number;
  taxRate?: number;
  tax1Name?: string;
  tax1Rate?: number;
  tax1Amount?: number;
  tax2Name?: string;
  tax2Rate?: number;
  tax2Amount?: number;
  expenseDate: string;
  paymentDate?: string;
  status: string;
  paymentMethod?: string;
  recurring: boolean;
  recurrenceFrequency?: string;
  recurrenceEndDate?: string;
  vendorName?: string;
  vendorVAT?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  businessPlanId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une dépense côté UI
 */
export interface UIExpense {
  id: string;
  title: string;
  description?: string;
  type: ExpenseType;
  category: ExpenseCategory;
  amount: number;
  taxAmount?: number;
  taxRate?: number;
  tax1Name?: string;
  tax1Rate?: number;
  tax1Amount?: number;
  tax2Name?: string;
  tax2Rate?: number;
  tax2Amount?: number;
  expenseDate: string;
  paymentDate?: string;
  status: ExpenseStatus;
  paymentMethod?: ExpensePaymentMethod;
  recurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  vendorName?: string;
  vendorVAT?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  businessPlanId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  isExpanded?: boolean;
  hasReceipt?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour un budget de catégorie
 */
export interface ServiceExpenseBudget {
  id: string;
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour un budget de catégorie côté UI
 */
export interface UIExpenseBudget {
  id: string;
  category: ExpenseCategory;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  businessPlanId: string;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
}

/**
 * Interface pour les statistiques des dépenses côté UI
 */
export interface UIExpenseStats {
  totalExpenses: number;
  totalByCategory: Record<ExpenseCategory, number>;
  expensesByMonth: {
    month: string;
    amount: number;
  }[];
  largestExpenseCategories: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  recurringMonthlyTotal: number;
}

/**
 * Interface pour un filtre de dépenses côté UI
 */
export interface UIExpenseFilter {
  status?: ExpenseStatus[];
  type?: ExpenseType[];
  category?: ExpenseCategory[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  recurring?: boolean;
}

/**
 * Fonction utilitaire pour calculer le montant total d'une dépense
 * en incluant les taxes
 */
export const calculateTotalWithTaxes = (expense: UIExpense): number => {
  // Si le montant total avec taxes est déjà calculé
  if (expense.taxAmount !== undefined) {
    return expense.amount + expense.taxAmount;
  }
  
  // Sinon, calculer à partir du taux de taxe général
  if (expense.taxRate !== undefined) {
    return expense.amount * (1 + expense.taxRate);
  }
  
  // Ou calculer à partir des taxes spécifiques
  let total = expense.amount;
  if (expense.tax1Rate !== undefined) {
    total += expense.amount * expense.tax1Rate;
  }
  if (expense.tax2Rate !== undefined) {
    total += expense.amount * expense.tax2Rate;
  }
  
  return total;
};