/**
 * Invoices Interfaces - Définition des interfaces pour les factures
 * 
 * Ces interfaces définissent la structure des données pour la gestion des factures,
 * incluant leurs détails, statuts, et relations avec clients et services.
 * Suivent le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

import { DocumentType, DocumentStatus, PaymentMethod } from '../invoicing';

/**
 * Interface pour un élément de facture côté service
 */
export interface ServiceInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  notes?: string;
  serviceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour un paiement côté service
 */
export interface ServicePayment {
  id: string;
  documentId: string;
  date: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  receiptNumber?: string;
  receiptSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour les informations client côté service
 */
export interface ServiceClientInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
}

/**
 * Interface pour les informations d'entreprise côté service
 */
export interface ServiceCompanyInfo {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email: string;
  phone?: string;
  website?: string;
  siret: string;
  vatNumber?: string;
  logo?: string;
}

/**
 * Interface pour une facture côté service
 */
export interface ServiceDocument {
  id: string;
  type: string;
  status: string;
  number: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  clientInfo: ServiceClientInfo;
  companyInfo: ServiceCompanyInfo;
  items: ServiceInvoiceItem[];
  notes?: string;
  paymentTerms?: string;
  businessPlanId: string;
  serviceId?: string;
  
  payments?: ServicePayment[];
  amountPaid?: number;
  remainingAmount?: number;
  lastPaymentDate?: string;
  lastReminderDate?: string;
  reminderCount?: number;
  clientRiskFlag?: boolean;
  
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour un élément de facture côté UI
 */
export interface UIInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  notes?: string;
  serviceId?: string;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour un paiement côté UI
 */
export interface UIPayment {
  id: string;
  documentId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  receiptNumber?: string;
  receiptSent?: boolean;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Interface pour les informations client côté UI
 */
export interface UIClientInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
}

/**
 * Interface pour les informations d'entreprise côté UI
 */
export interface UICompanyInfo {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email: string;
  phone?: string;
  website?: string;
  siret: string;
  vatNumber?: string;
  logo?: string;
}

/**
 * Interface pour une facture côté UI
 */
export interface UIDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  number: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  clientInfo: UIClientInfo;
  companyInfo: UICompanyInfo;
  items: UIInvoiceItem[];
  notes?: string;
  paymentTerms?: string;
  businessPlanId: string;
  serviceId?: string;
  
  payments?: UIPayment[];
  amountPaid?: number;
  remainingAmount?: number;
  lastPaymentDate?: string;
  lastReminderDate?: string;
  reminderCount?: number;
  clientRiskFlag?: boolean;
  
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  createdAt: string;
  updatedAt: string;
  
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
  isExpanded?: boolean;
  isPreviewing?: boolean;
}

/**
 * Interface pour un filtre de factures côté UI
 */
export interface UIInvoiceFilter {
  status?: DocumentStatus[];
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

/**
 * Interfaces pour les statistiques des factures côté UI
 */
export interface UIInvoiceStats {
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
  averageDaysToPayment: number;
  invoicesByStatus: Record<DocumentStatus, number>;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

/**
 * Interface pour les utilitaires de facture
 */
export const calculateUIItemTotal = (item: UIInvoiceItem): number => {
  const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
  return item.quantity * item.unitPrice * discountFactor;
};

export const calculateUIDocumentTotals = (document: UIDocument): UIDocument => {
  const subtotal = document.items.reduce((sum, item) => sum + calculateUIItemTotal(item), 0);
  const taxAmount = document.items.reduce((sum, item) => {
    const itemTotal = calculateUIItemTotal(item);
    return sum + (itemTotal * item.taxRate);
  }, 0);
  
  return {
    ...document,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};

export const calculateServiceDocumentTotals = (document: ServiceDocument): ServiceDocument => {
  const subtotal = document.items.reduce((sum, item) => {
    const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
    return sum + (item.quantity * item.unitPrice * discountFactor);
  }, 0);
  
  const taxAmount = document.items.reduce((sum, item) => {
    const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
    const itemTotal = item.quantity * item.unitPrice * discountFactor;
    return sum + (itemTotal * item.taxRate);
  }, 0);
  
  return {
    ...document,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};