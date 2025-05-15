/**
 * FinancesAdapter - Adaptateur pour les données financières
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (interfaces/finances).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

import { BusinessPlanData } from '../../services/interfaces/dataModels';
import {
  // Invoices interfaces
  ServiceDocument,
  UIDocument,
  ServiceInvoiceItem,
  UIInvoiceItem,
  ServicePayment,
  UIPayment,
  UIInvoiceStats,
  DocumentType,
  DocumentStatus,
  PaymentMethod,
  
  // Expenses interfaces
  ServiceExpense,
  UIExpense,
  ServiceExpenseBudget,
  UIExpenseBudget,
  UIExpenseStats,
  ExpenseType,
  ExpenseCategory,
  ExpenseStatus,
  ExpensePaymentMethod,
  
  // Cashflow interfaces
  ServiceCashflowEntry,
  UICashflowEntry,
  ServiceBankAccount,
  UIBankAccount,
  ServiceCashflowForecast,
  UICashflowForecast,
  UIMonthlyReport,
  UICashflowStats,
  ServiceCashflowScenario,
  UICashflowScenario,
  CashflowEntryType,
  CashflowEntryState,
  BankAccountType
} from '../../interfaces/finances';

/**
 * Adaptateur pour les finances
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI (interfaces financières).
 */
export class FinancesAdapter {
  
  /**
   * Génère un ID unique pour un nouvel élément financier
   * @private
   */
  private static _generateId(prefix: string = 'fin'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Formate une date au format ISO
   * @private
   */
  private static _formatDate(date: Date | string | null | undefined): string {
    if (!date) return new Date().toISOString();
    
    if (typeof date === 'string') {
      // Si c'est déjà une chaîne ISO
      if (date.includes('T')) return date;
      // Si c'est une date au format YYYY-MM-DD
      return `${date}T00:00:00.000Z`;
    }
    
    return date.toISOString();
  }
  
  /*****************************************
   * INVOICES - Transformation des factures
   *****************************************/
  
  /**
   * Transforme une facture du format service vers le format UI
   */
  static invoiceToUI(serviceData: ServiceDocument | null): UIDocument {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUIDocument();
    }

    // Conversion des éléments
    const items = Array.isArray(serviceData.items)
      ? serviceData.items.map(this._invoiceItemToUI)
      : [];
      
    // Conversion des paiements
    const payments = Array.isArray(serviceData.payments)
      ? serviceData.payments.map(this._paymentToUI)
      : [];

    // Document UI
    const uiDocument: UIDocument = {
      id: serviceData.id,
      type: this._serviceToUIDocumentType(serviceData.type),
      status: this._serviceToUIDocumentStatus(serviceData.status),
      number: serviceData.number || '',
      issueDate: serviceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: serviceData.dueDate,
      validUntil: serviceData.validUntil,
      clientInfo: this._clientInfoToUI(serviceData.clientInfo),
      companyInfo: this._companyInfoToUI(serviceData.companyInfo),
      items: items,
      notes: serviceData.notes || '',
      paymentTerms: serviceData.paymentTerms || '',
      businessPlanId: serviceData.businessPlanId || '',
      serviceId: serviceData.serviceId,
      payments: payments,
      amountPaid: serviceData.amountPaid || 0,
      remainingAmount: serviceData.remainingAmount,
      lastPaymentDate: serviceData.lastPaymentDate,
      lastReminderDate: serviceData.lastReminderDate,
      reminderCount: serviceData.reminderCount || 0,
      clientRiskFlag: serviceData.clientRiskFlag || false,
      subtotal: serviceData.subtotal || 0,
      taxAmount: serviceData.taxAmount || 0,
      total: serviceData.total || 0,
      createdAt: serviceData.createdAt || new Date().toISOString(),
      updatedAt: serviceData.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {},
      isExpanded: false,
      isPreviewing: false
    };

    return uiDocument;
  }

  /**
   * Transforme un élément de facture du format service vers le format UI
   * @private
   */
  private static _invoiceItemToUI(item: ServiceInvoiceItem): UIInvoiceItem {
    return {
      id: item.id,
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      taxRate: item.taxRate || 0,
      discount: item.discount,
      notes: item.notes,
      serviceId: item.serviceId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Transforme un paiement du format service vers le format UI
   * @private
   */
  private static _paymentToUI(payment: ServicePayment): UIPayment {
    return {
      id: payment.id,
      documentId: payment.documentId,
      date: payment.date || new Date().toISOString().split('T')[0],
      amount: payment.amount || 0,
      method: this._serviceToUIPaymentMethod(payment.method),
      reference: payment.reference || '',
      notes: payment.notes || '',
      receiptNumber: payment.receiptNumber || '',
      receiptSent: payment.receiptSent || false,
      createdAt: payment.createdAt || new Date().toISOString(),
      updatedAt: payment.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Transforme les informations client du format service vers le format UI
   * @private
   */
  private static _clientInfoToUI(clientInfo: any): UIClientInfo {
    if (!clientInfo) {
      return {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: ''
      };
    }

    return {
      id: clientInfo.id,
      name: clientInfo.name || '',
      address: clientInfo.address || '',
      city: clientInfo.city || '',
      zipCode: clientInfo.zipCode || '',
      country: clientInfo.country || '',
      email: clientInfo.email || '',
      phone: clientInfo.phone || '',
      vatNumber: clientInfo.vatNumber || ''
    };
  }

  /**
   * Transforme les informations d'entreprise du format service vers le format UI
   * @private
   */
  private static _companyInfoToUI(companyInfo: any): UIClientInfo {
    if (!companyInfo) {
      return {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: ''
      };
    }

    return {
      name: companyInfo.name || '',
      address: companyInfo.address || '',
      city: companyInfo.city || '',
      zipCode: companyInfo.zipCode || '',
      country: companyInfo.country || '',
      email: companyInfo.email || '',
      phone: companyInfo.phone || '',
      vatNumber: companyInfo.vatNumber || ''
    };
  }
  
  /**
   * Transforme une facture du format UI vers le format service
   */
  static invoiceToService(uiData: UIDocument | null): ServiceDocument {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceDocument();
    }

    // Conversion des éléments
    const items = Array.isArray(uiData.items)
      ? uiData.items.map(this._invoiceItemToService)
      : [];
      
    // Conversion des paiements
    const payments = Array.isArray(uiData.payments)
      ? uiData.payments.map(this._paymentToService)
      : [];

    // Document service
    const serviceDocument: ServiceDocument = {
      id: uiData.id,
      type: this._uiToServiceDocumentType(uiData.type),
      status: this._uiToServiceDocumentStatus(uiData.status),
      number: uiData.number,
      issueDate: uiData.issueDate,
      dueDate: uiData.dueDate,
      validUntil: uiData.validUntil,
      clientInfo: this._clientInfoToService(uiData.clientInfo),
      companyInfo: this._companyInfoToService(uiData.companyInfo),
      items: items,
      notes: uiData.notes,
      paymentTerms: uiData.paymentTerms,
      businessPlanId: uiData.businessPlanId,
      serviceId: uiData.serviceId,
      payments: payments,
      amountPaid: uiData.amountPaid,
      remainingAmount: uiData.remainingAmount,
      lastPaymentDate: uiData.lastPaymentDate,
      lastReminderDate: uiData.lastReminderDate,
      reminderCount: uiData.reminderCount,
      clientRiskFlag: uiData.clientRiskFlag,
      subtotal: uiData.subtotal,
      taxAmount: uiData.taxAmount,
      total: uiData.total,
      createdAt: uiData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return serviceDocument;
  }

  /**
   * Transforme un élément de facture du format UI vers le format service
   * @private
   */
  private static _invoiceItemToService(item: UIInvoiceItem): ServiceInvoiceItem {
    return {
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      discount: item.discount,
      notes: item.notes,
      serviceId: item.serviceId,
      createdAt: item.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Transforme un paiement du format UI vers le format service
   * @private
   */
  private static _paymentToService(payment: UIPayment): ServicePayment {
    return {
      id: payment.id,
      documentId: payment.documentId,
      date: payment.date,
      amount: payment.amount,
      method: this._uiToServicePaymentMethod(payment.method),
      reference: payment.reference,
      notes: payment.notes,
      receiptNumber: payment.receiptNumber,
      receiptSent: payment.receiptSent,
      createdAt: payment.createdAt,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Transforme les informations client du format UI vers le format service
   * @private
   */
  private static _clientInfoToService(clientInfo: UIClientInfo): any {
    if (!clientInfo) {
      return {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: ''
      };
    }

    return {
      id: clientInfo.id,
      name: clientInfo.name,
      address: clientInfo.address,
      city: clientInfo.city,
      zipCode: clientInfo.zipCode,
      country: clientInfo.country,
      email: clientInfo.email,
      phone: clientInfo.phone,
      vatNumber: clientInfo.vatNumber
    };
  }

  /**
   * Transforme les informations d'entreprise du format UI vers le format service
   * @private
   */
  private static _companyInfoToService(companyInfo: any): any {
    if (!companyInfo) {
      return {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        email: '',
        siret: ''
      };
    }

    return {
      name: companyInfo.name,
      address: companyInfo.address,
      city: companyInfo.city,
      zipCode: companyInfo.zipCode,
      country: companyInfo.country,
      email: companyInfo.email,
      phone: companyInfo.phone,
      website: companyInfo.website,
      siret: companyInfo.siret,
      vatNumber: companyInfo.vatNumber,
      logo: companyInfo.logo
    };
  }
  
  /**
   * Convertit le type de document du format service vers le format UI
   * @private
   */
  private static _serviceToUIDocumentType(serviceType: string): DocumentType {
    switch (serviceType) {
      case 'quote':
        return DocumentType.QUOTE;
      case 'invoice':
      default:
        return DocumentType.INVOICE;
    }
  }

  /**
   * Convertit le type de document du format UI vers le format service
   * @private
   */
  private static _uiToServiceDocumentType(uiType: DocumentType): string {
    return uiType.toString();
  }

  /**
   * Convertit le statut de document du format service vers le format UI
   * @private
   */
  private static _serviceToUIDocumentStatus(serviceStatus: string): DocumentStatus {
    switch (serviceStatus) {
      case 'draft':
        return DocumentStatus.DRAFT;
      case 'sent':
        return DocumentStatus.SENT;
      case 'accepted':
        return DocumentStatus.ACCEPTED;
      case 'partial':
        return DocumentStatus.PARTIALLY_PAID;
      case 'paid':
        return DocumentStatus.PAID;
      case 'rejected':
        return DocumentStatus.REJECTED;
      case 'overdue':
        return DocumentStatus.OVERDUE;
      case 'dispute':
        return DocumentStatus.IN_DISPUTE;
      case 'collection':
        return DocumentStatus.IN_COLLECTION;
      default:
        return DocumentStatus.DRAFT;
    }
  }

  /**
   * Convertit le statut de document du format UI vers le format service
   * @private
   */
  private static _uiToServiceDocumentStatus(uiStatus: DocumentStatus): string {
    return uiStatus.toString();
  }

  /**
   * Convertit la méthode de paiement du format service vers le format UI
   * @private
   */
  private static _serviceToUIPaymentMethod(serviceMethod: string): PaymentMethod {
    switch (serviceMethod) {
      case 'transfer':
        return PaymentMethod.BANK_TRANSFER;
      case 'card':
        return PaymentMethod.CREDIT_CARD;
      case 'check':
        return PaymentMethod.CHECK;
      case 'cash':
        return PaymentMethod.CASH;
      case 'paypal':
        return PaymentMethod.PAYPAL;
      case 'other':
      default:
        return PaymentMethod.OTHER;
    }
  }

  /**
   * Convertit la méthode de paiement du format UI vers le format service
   * @private
   */
  private static _uiToServicePaymentMethod(uiMethod: PaymentMethod): string {
    return uiMethod.toString();
  }
  
  /**
   * Crée un document UI par défaut
   * @private 
   */
  private static _createDefaultUIDocument(): UIDocument {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Créer une date d'échéance par défaut à 30 jours
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    return {
      id: this._generateId('invoice'),
      type: DocumentType.INVOICE,
      status: DocumentStatus.DRAFT,
      number: '',
      issueDate: today,
      dueDate: dueDateStr,
      clientInfo: {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
      },
      companyInfo: {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        email: '',
        siret: '',
      },
      items: [],
      businessPlanId: '',
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
      isEditing: false,
      validationErrors: {},
      isExpanded: true
    };
  }

  /**
   * Crée un document service par défaut
   * @private
   */
  private static _createDefaultServiceDocument(): ServiceDocument {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Créer une date d'échéance par défaut à 30 jours
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    return {
      id: this._generateId('invoice'),
      type: DocumentType.INVOICE.toString(),
      status: DocumentStatus.DRAFT.toString(),
      number: '',
      issueDate: today,
      dueDate: dueDateStr,
      clientInfo: {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
      },
      companyInfo: {
        name: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        email: '',
        siret: '',
      },
      items: [],
      businessPlanId: '',
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /*****************************************
   * EXPENSES - Transformation des dépenses
   *****************************************/
  
  /**
   * Transforme une dépense du format service vers le format UI
   */
  static expenseToUI(serviceData: ServiceExpense | null): UIExpense {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUIExpense();
    }

    return {
      id: serviceData.id,
      title: serviceData.title,
      description: serviceData.description,
      type: this._serviceToUIExpenseType(serviceData.type),
      category: this._serviceToUIExpenseCategory(serviceData.category),
      amount: serviceData.amount,
      taxAmount: serviceData.taxAmount,
      taxRate: serviceData.taxRate,
      tax1Name: serviceData.tax1Name,
      tax1Rate: serviceData.tax1Rate,
      tax1Amount: serviceData.tax1Amount,
      tax2Name: serviceData.tax2Name,
      tax2Rate: serviceData.tax2Rate,
      tax2Amount: serviceData.tax2Amount,
      expenseDate: serviceData.expenseDate,
      paymentDate: serviceData.paymentDate,
      status: this._serviceToUIExpenseStatus(serviceData.status),
      paymentMethod: serviceData.paymentMethod ? this._serviceToUIExpensePaymentMethod(serviceData.paymentMethod) : undefined,
      recurring: serviceData.recurring,
      recurrenceFrequency: serviceData.recurrenceFrequency ? this._serviceToUIRecurrenceFrequency(serviceData.recurrenceFrequency) : undefined,
      recurrenceEndDate: serviceData.recurrenceEndDate,
      vendorName: serviceData.vendorName,
      vendorVAT: serviceData.vendorVAT,
      invoiceNumber: serviceData.invoiceNumber,
      receiptUrl: serviceData.receiptUrl,
      notes: serviceData.notes,
      businessPlanId: serviceData.businessPlanId,
      projectId: serviceData.projectId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false,
      isExpanded: false,
      hasReceipt: !!serviceData.receiptUrl,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme une dépense du format UI vers le format service
   */
  static expenseToService(uiData: UIExpense | null): ServiceExpense {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceExpense();
    }

    return {
      id: uiData.id,
      title: uiData.title,
      description: uiData.description,
      type: this._uiToServiceExpenseType(uiData.type),
      category: this._uiToServiceExpenseCategory(uiData.category),
      amount: uiData.amount,
      taxAmount: uiData.taxAmount,
      taxRate: uiData.taxRate,
      tax1Name: uiData.tax1Name,
      tax1Rate: uiData.tax1Rate,
      tax1Amount: uiData.tax1Amount,
      tax2Name: uiData.tax2Name,
      tax2Rate: uiData.tax2Rate,
      tax2Amount: uiData.tax2Amount,
      expenseDate: uiData.expenseDate,
      paymentDate: uiData.paymentDate,
      status: this._uiToServiceExpenseStatus(uiData.status),
      paymentMethod: uiData.paymentMethod ? this._uiToServiceExpensePaymentMethod(uiData.paymentMethod) : undefined,
      recurring: uiData.recurring,
      recurrenceFrequency: uiData.recurrenceFrequency ? this._uiToServiceRecurrenceFrequency(uiData.recurrenceFrequency) : undefined,
      recurrenceEndDate: uiData.recurrenceEndDate,
      vendorName: uiData.vendorName,
      vendorVAT: uiData.vendorVAT,
      invoiceNumber: uiData.invoiceNumber,
      receiptUrl: uiData.receiptUrl,
      notes: uiData.notes,
      businessPlanId: uiData.businessPlanId,
      projectId: uiData.projectId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme un budget de dépenses du format service vers le format UI
   */
  static expenseBudgetToUI(serviceData: ServiceExpenseBudget | null): UIExpenseBudget {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUIExpenseBudget();
    }

    return {
      id: serviceData.id,
      category: this._serviceToUIExpenseCategory(serviceData.category),
      amount: serviceData.amount,
      period: serviceData.period,
      startDate: serviceData.startDate,
      endDate: serviceData.endDate,
      spent: 0, // Sera calculé ultérieurement
      remaining: serviceData.amount, // Sera calculé ultérieurement
      percentUsed: 0, // Sera calculé ultérieurement
      businessPlanId: serviceData.businessPlanId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false
    };
  }
  
  /**
   * Transforme un budget de dépenses du format UI vers le format service
   */
  static expenseBudgetToService(uiData: UIExpenseBudget | null): ServiceExpenseBudget {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceExpenseBudget();
    }

    return {
      id: uiData.id,
      category: this._uiToServiceExpenseCategory(uiData.category),
      amount: uiData.amount,
      period: uiData.period,
      startDate: uiData.startDate,
      endDate: uiData.endDate,
      businessPlanId: uiData.businessPlanId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Convertit le type de dépense du format service vers le format UI
   * @private
   */
  private static _serviceToUIExpenseType(serviceType: string): ExpenseType {
    switch (serviceType) {
      case 'purchase': return ExpenseType.PURCHASE;
      case 'subscription': return ExpenseType.SUBSCRIPTION;
      case 'travel': return ExpenseType.TRAVEL;
      case 'meal': return ExpenseType.MEAL;
      case 'accommodation': return ExpenseType.ACCOMMODATION;
      case 'office': return ExpenseType.OFFICE;
      case 'software': return ExpenseType.SOFTWARE;
      case 'hardware': return ExpenseType.HARDWARE;
      case 'service': return ExpenseType.SERVICE;
      case 'tax': return ExpenseType.TAX;
      case 'insurance': return ExpenseType.INSURANCE;
      case 'training': return ExpenseType.TRAINING;
      default: return ExpenseType.OTHER;
    }
  }
  
  /**
   * Convertit le type de dépense du format UI vers le format service
   * @private
   */
  private static _uiToServiceExpenseType(uiType: ExpenseType): string {
    return uiType.toString();
  }
  
  /**
   * Convertit la catégorie de dépense du format service vers le format UI
   * @private
   */
  private static _serviceToUIExpenseCategory(serviceCategory: string): ExpenseCategory {
    switch (serviceCategory) {
      case 'equipment': return ExpenseCategory.EQUIPMENT;
      case 'supplies': return ExpenseCategory.SUPPLIES;
      case 'rent': return ExpenseCategory.RENT;
      case 'utilities': return ExpenseCategory.UTILITIES;
      case 'marketing': return ExpenseCategory.MARKETING;
      case 'travel': return ExpenseCategory.TRAVEL;
      case 'meals': return ExpenseCategory.MEALS;
      case 'entertainment': return ExpenseCategory.ENTERTAINMENT;
      case 'insurance': return ExpenseCategory.INSURANCE;
      case 'taxes': return ExpenseCategory.TAXES;
      case 'salaries': return ExpenseCategory.SALARIES;
      case 'software': return ExpenseCategory.SOFTWARE;
      case 'education': return ExpenseCategory.EDUCATION;
      case 'fees': return ExpenseCategory.FEES;
      default: return ExpenseCategory.OTHER;
    }
  }
  
  /**
   * Convertit la catégorie de dépense du format UI vers le format service
   * @private
   */
  private static _uiToServiceExpenseCategory(uiCategory: ExpenseCategory): string {
    return uiCategory.toString();
  }
  
  /**
   * Convertit le statut de dépense du format service vers le format UI
   * @private
   */
  private static _serviceToUIExpenseStatus(serviceStatus: string): ExpenseStatus {
    switch (serviceStatus) {
      case 'draft': return ExpenseStatus.DRAFT;
      case 'pending': return ExpenseStatus.PENDING;
      case 'paid': return ExpenseStatus.PAID;
      case 'rejected': return ExpenseStatus.REJECTED;
      case 'reimbursed': return ExpenseStatus.REIMBURSED;
      case 'cancelled': return ExpenseStatus.CANCELLED;
      default: return ExpenseStatus.DRAFT;
    }
  }
  
  /**
   * Convertit le statut de dépense du format UI vers le format service
   * @private
   */
  private static _uiToServiceExpenseStatus(uiStatus: ExpenseStatus): string {
    return uiStatus.toString();
  }
  
  /**
   * Convertit la méthode de paiement du format service vers le format UI
   * @private
   */
  private static _serviceToUIExpensePaymentMethod(serviceMethod: string): ExpensePaymentMethod {
    switch (serviceMethod) {
      case 'transfer': return ExpensePaymentMethod.BANK_TRANSFER;
      case 'credit_card': return ExpensePaymentMethod.CREDIT_CARD;
      case 'cash': return ExpensePaymentMethod.CASH;
      case 'check': return ExpensePaymentMethod.CHECK;
      case 'direct_debit': return ExpensePaymentMethod.DIRECT_DEBIT;
      case 'paypal': return ExpensePaymentMethod.PAYPAL;
      default: return ExpensePaymentMethod.OTHER;
    }
  }
  
  /**
   * Convertit la méthode de paiement du format UI vers le format service
   * @private
   */
  private static _uiToServiceExpensePaymentMethod(uiMethod: ExpensePaymentMethod): string {
    return uiMethod.toString();
  }
  
  /**
   * Convertit la fréquence de récurrence du format service vers le format UI
   * @private
   */
  private static _serviceToUIRecurrenceFrequency(serviceFrequency: string): any {
    switch (serviceFrequency) {
      case 'daily': return 'daily';
      case 'weekly': return 'weekly';
      case 'monthly': return 'monthly';
      case 'quarterly': return 'quarterly';
      case 'annually': return 'annually';
      case 'custom': return 'custom';
      default: return 'monthly';
    }
  }
  
  /**
   * Convertit la fréquence de récurrence du format UI vers le format service
   * @private
   */
  private static _uiToServiceRecurrenceFrequency(uiFrequency: any): string {
    return uiFrequency.toString();
  }
  
  /**
   * Crée une dépense UI par défaut
   * @private
   */
  private static _createDefaultUIExpense(): UIExpense {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    return {
      id: this._generateId('expense'),
      title: '',
      description: '',
      type: ExpenseType.OTHER,
      category: ExpenseCategory.OTHER,
      amount: 0,
      expenseDate: today,
      status: ExpenseStatus.DRAFT,
      recurring: false,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true,
      isExpanded: true,
      hasReceipt: false,
      validationErrors: {}
    };
  }
  
  /**
   * Crée une dépense service par défaut
   * @private
   */
  private static _createDefaultServiceExpense(): ServiceExpense {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    return {
      id: this._generateId('expense'),
      title: '',
      description: '',
      type: ExpenseType.OTHER.toString(),
      category: ExpenseCategory.OTHER.toString(),
      amount: 0,
      expenseDate: today,
      status: ExpenseStatus.DRAFT.toString(),
      recurring: false,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Crée un budget de dépenses UI par défaut
   * @private
   */
  private static _createDefaultUIExpenseBudget(): UIExpenseBudget {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    return {
      id: this._generateId('budget'),
      category: ExpenseCategory.OTHER,
      amount: 0,
      period: 'monthly',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      spent: 0,
      remaining: 0,
      percentUsed: 0,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true
    };
  }
  
  /**
   * Crée un budget de dépenses service par défaut
   * @private
   */
  private static _createDefaultServiceExpenseBudget(): ServiceExpenseBudget {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    return {
      id: this._generateId('budget'),
      category: ExpenseCategory.OTHER.toString(),
      amount: 0,
      period: 'monthly',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /*****************************************
   * CASHFLOW - Transformation des flux de trésorerie
   *****************************************/
  
  /**
   * Transforme une entrée de flux de trésorerie du format service vers le format UI
   */
  static cashflowEntryToUI(serviceData: ServiceCashflowEntry | null): UICashflowEntry {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUICashflowEntry();
    }

    return {
      id: serviceData.id,
      type: this._serviceToUICashflowEntryType(serviceData.type),
      amount: serviceData.amount,
      description: serviceData.description,
      date: serviceData.date,
      state: this._serviceToUICashflowEntryState(serviceData.state),
      sourceId: serviceData.sourceId,
      sourceType: serviceData.sourceType,
      destinationId: serviceData.destinationId,
      destinationAccount: serviceData.destinationAccount,
      category: serviceData.category,
      businessPlanId: serviceData.businessPlanId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme une entrée de flux de trésorerie du format UI vers le format service
   */
  static cashflowEntryToService(uiData: UICashflowEntry | null): ServiceCashflowEntry {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceCashflowEntry();
    }

    return {
      id: uiData.id,
      type: this._uiToServiceCashflowEntryType(uiData.type),
      amount: uiData.amount,
      description: uiData.description,
      date: uiData.date,
      state: this._uiToServiceCashflowEntryState(uiData.state),
      sourceId: uiData.sourceId,
      sourceType: uiData.sourceType,
      destinationId: uiData.destinationId,
      destinationAccount: uiData.destinationAccount,
      category: uiData.category,
      businessPlanId: uiData.businessPlanId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme un compte bancaire du format service vers le format UI
   */
  static bankAccountToUI(serviceData: ServiceBankAccount | null): UIBankAccount {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUIBankAccount();
    }

    return {
      id: serviceData.id,
      name: serviceData.name,
      type: this._serviceToUIBankAccountType(serviceData.type),
      balance: serviceData.balance,
      currency: serviceData.currency,
      accountNumber: serviceData.accountNumber,
      iban: serviceData.iban,
      swift: serviceData.swift,
      bank: serviceData.bank,
      description: serviceData.description,
      isPrimary: serviceData.isPrimary,
      businessPlanId: serviceData.businessPlanId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme un compte bancaire du format UI vers le format service
   */
  static bankAccountToService(uiData: UIBankAccount | null): ServiceBankAccount {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceBankAccount();
    }

    return {
      id: uiData.id,
      name: uiData.name,
      type: this._uiToServiceBankAccountType(uiData.type),
      balance: uiData.balance,
      currency: uiData.currency,
      accountNumber: uiData.accountNumber,
      iban: uiData.iban,
      swift: uiData.swift,
      bank: uiData.bank,
      description: uiData.description,
      isPrimary: uiData.isPrimary,
      businessPlanId: uiData.businessPlanId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme une prévision de flux de trésorerie du format service vers le format UI
   */
  static cashflowForecastToUI(serviceData: ServiceCashflowForecast | null): UICashflowForecast {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUICashflowForecast();
    }

    // Convertir les entrées
    const entries = Array.isArray(serviceData.entries)
      ? serviceData.entries.map(this.cashflowEntryToUI)
      : [];
    
    // Calculer les statistiques
    const totalIncome = entries
      .filter(entry => entry.type === CashflowEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const totalExpenses = entries
      .filter(entry => entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const finalBalance = serviceData.initialBalance + totalIncome - totalExpenses;
    
    // Calculer le solde le plus bas et le plus élevé
    let currentBalance = serviceData.initialBalance;
    let lowestBalance = currentBalance;
    let highestBalance = currentBalance;
    
    // Trier les entrées par date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const entry of sortedEntries) {
      if (entry.type === CashflowEntryType.INCOME) {
        currentBalance += entry.amount;
      } else if (entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX) {
        currentBalance -= entry.amount;
      }
      
      lowestBalance = Math.min(lowestBalance, currentBalance);
      highestBalance = Math.max(highestBalance, currentBalance);
    }

    return {
      id: serviceData.id,
      startDate: serviceData.startDate,
      endDate: serviceData.endDate,
      initialBalance: serviceData.initialBalance,
      entries: entries,
      finalBalance: finalBalance,
      lowestBalance: lowestBalance,
      highestBalance: highestBalance,
      netChange: finalBalance - serviceData.initialBalance,
      businessPlanId: serviceData.businessPlanId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme une prévision de flux de trésorerie du format UI vers le format service
   */
  static cashflowForecastToService(uiData: UICashflowForecast | null): ServiceCashflowForecast {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceCashflowForecast();
    }

    // Convertir les entrées
    const entries = Array.isArray(uiData.entries)
      ? uiData.entries.map(this.cashflowEntryToService)
      : [];

    return {
      id: uiData.id,
      startDate: uiData.startDate,
      endDate: uiData.endDate,
      initialBalance: uiData.initialBalance,
      entries: entries,
      businessPlanId: uiData.businessPlanId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Transforme un scénario de flux de trésorerie du format service vers le format UI
   */
  static cashflowScenarioToUI(serviceData: ServiceCashflowScenario | null): UICashflowScenario {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return this._createDefaultUICashflowScenario();
    }

    // Convertir les entrées
    const entries = Array.isArray(serviceData.entries)
      ? serviceData.entries.map(this.cashflowEntryToUI)
      : [];
    
    // Calculer le solde final
    const totalIncome = entries
      .filter(entry => entry.type === CashflowEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const totalExpenses = entries
      .filter(entry => entry.type === CashflowEntryType.EXPENSE || entry.type === CashflowEntryType.TAX)
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const finalBalance = serviceData.initialBalance + totalIncome - totalExpenses;

    return {
      id: serviceData.id,
      name: serviceData.name,
      description: serviceData.description,
      startDate: serviceData.startDate,
      endDate: serviceData.endDate,
      initialBalance: serviceData.initialBalance,
      finalBalance: finalBalance,
      assumptions: serviceData.assumptions,
      entries: entries,
      businessPlanId: serviceData.businessPlanId,
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      
      isEditing: false,
      isFavorite: false,
      validationErrors: {}
    };
  }
  
  /**
   * Transforme un scénario de flux de trésorerie du format UI vers le format service
   */
  static cashflowScenarioToService(uiData: UICashflowScenario | null): ServiceCashflowScenario {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return this._createDefaultServiceCashflowScenario();
    }

    // Convertir les entrées
    const entries = Array.isArray(uiData.entries)
      ? uiData.entries.map(this.cashflowEntryToService)
      : [];

    return {
      id: uiData.id,
      name: uiData.name,
      description: uiData.description,
      startDate: uiData.startDate,
      endDate: uiData.endDate,
      initialBalance: uiData.initialBalance,
      assumptions: uiData.assumptions,
      entries: entries,
      businessPlanId: uiData.businessPlanId,
      createdAt: uiData.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Convertit le type d'entrée de flux de trésorerie du format service vers le format UI
   * @private
   */
  private static _serviceToUICashflowEntryType(serviceType: string): CashflowEntryType {
    switch (serviceType) {
      case 'income': return CashflowEntryType.INCOME;
      case 'expense': return CashflowEntryType.EXPENSE;
      case 'tax': return CashflowEntryType.TAX;
      case 'transfer': return CashflowEntryType.TRANSFER;
      default: return CashflowEntryType.EXPENSE;
    }
  }
  
  /**
   * Convertit le type d'entrée de flux de trésorerie du format UI vers le format service
   * @private
   */
  private static _uiToServiceCashflowEntryType(uiType: CashflowEntryType): string {
    return uiType.toString();
  }
  
  /**
   * Convertit l'état d'entrée de flux de trésorerie du format service vers le format UI
   * @private
   */
  private static _serviceToUICashflowEntryState(serviceState: string): CashflowEntryState {
    switch (serviceState) {
      case 'projected': return CashflowEntryState.PROJECTED;
      case 'confirmed': return CashflowEntryState.CONFIRMED;
      case 'completed': return CashflowEntryState.COMPLETED;
      case 'cancelled': return CashflowEntryState.CANCELLED;
      default: return CashflowEntryState.PROJECTED;
    }
  }
  
  /**
   * Convertit l'état d'entrée de flux de trésorerie du format UI vers le format service
   * @private
   */
  private static _uiToServiceCashflowEntryState(uiState: CashflowEntryState): string {
    return uiState.toString();
  }
  
  /**
   * Convertit le type de compte bancaire du format service vers le format UI
   * @private
   */
  private static _serviceToUIBankAccountType(serviceType: string): BankAccountType {
    switch (serviceType) {
      case 'checking': return BankAccountType.CHECKING;
      case 'savings': return BankAccountType.SAVINGS;
      case 'business': return BankAccountType.BUSINESS;
      case 'tax': return BankAccountType.TAX;
      case 'credit': return BankAccountType.CREDIT;
      default: return BankAccountType.OTHER;
    }
  }
  
  /**
   * Convertit le type de compte bancaire du format UI vers le format service
   * @private
   */
  private static _uiToServiceBankAccountType(uiType: BankAccountType): string {
    return uiType.toString();
  }
  
  /**
   * Crée une entrée de flux de trésorerie UI par défaut
   * @private
   */
  private static _createDefaultUICashflowEntry(): UICashflowEntry {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    return {
      id: this._generateId('entry'),
      type: CashflowEntryType.INCOME,
      amount: 0,
      description: '',
      date: today,
      state: CashflowEntryState.PROJECTED,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true,
      validationErrors: {}
    };
  }
  
  /**
   * Crée une entrée de flux de trésorerie service par défaut
   * @private
   */
  private static _createDefaultServiceCashflowEntry(): ServiceCashflowEntry {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    return {
      id: this._generateId('entry'),
      type: CashflowEntryType.INCOME.toString(),
      amount: 0,
      description: '',
      date: today,
      state: CashflowEntryState.PROJECTED.toString(),
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Crée un compte bancaire UI par défaut
   * @private
   */
  private static _createDefaultUIBankAccount(): UIBankAccount {
    const now = new Date().toISOString();
    
    return {
      id: this._generateId('account'),
      name: '',
      type: BankAccountType.CHECKING,
      balance: 0,
      currency: 'EUR',
      isPrimary: false,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true,
      validationErrors: {}
    };
  }
  
  /**
   * Crée un compte bancaire service par défaut
   * @private
   */
  private static _createDefaultServiceBankAccount(): ServiceBankAccount {
    const now = new Date().toISOString();
    
    return {
      id: this._generateId('account'),
      name: '',
      type: BankAccountType.CHECKING.toString(),
      balance: 0,
      currency: 'EUR',
      isPrimary: false,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Crée une prévision de flux de trésorerie UI par défaut
   * @private
   */
  private static _createDefaultUICashflowForecast(): UICashflowForecast {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Prévision sur 3 mois par défaut
    
    return {
      id: this._generateId('forecast'),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      initialBalance: 0,
      entries: [],
      finalBalance: 0,
      lowestBalance: 0,
      highestBalance: 0,
      netChange: 0,
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true,
      validationErrors: {}
    };
  }
  
  /**
   * Crée une prévision de flux de trésorerie service par défaut
   * @private
   */
  private static _createDefaultServiceCashflowForecast(): ServiceCashflowForecast {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Prévision sur 3 mois par défaut
    
    return {
      id: this._generateId('forecast'),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      initialBalance: 0,
      entries: [],
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Crée un scénario de flux de trésorerie UI par défaut
   * @private
   */
  private static _createDefaultUICashflowScenario(): UICashflowScenario {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Scénario sur 1 an par défaut
    
    return {
      id: this._generateId('scenario'),
      name: '',
      description: '',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      initialBalance: 0,
      finalBalance: 0,
      assumptions: {},
      entries: [],
      businessPlanId: '',
      createdAt: now,
      updatedAt: now,
      
      isEditing: true,
      isFavorite: false,
      validationErrors: {}
    };
  }
  
  /**
   * Crée un scénario de flux de trésorerie service par défaut
   * @private
   */
  private static _createDefaultServiceCashflowScenario(): ServiceCashflowScenario {
    const now = new Date().toISOString();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Scénario sur 1 an par défaut
    
    return {
      id: this._generateId('scenario'),
      name: '',
      description: '',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      initialBalance: 0,
      assumptions: {},
      entries: [],
      businessPlanId: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /*****************************************
   * BusinessPlan Integration Functions
   *****************************************/
  
  /**
   * Extrait les données financières à partir des données d'un plan d'affaires
   * 
   * @param businessPlanData Données du plan d'affaires
   * @returns Données financières
   */
  static extractFinancesFromBusinessPlan(businessPlanData: BusinessPlanData | null): any {
    if (!businessPlanData) {
      return {
        invoices: [],
        expenses: [],
        cashflow: {
          entries: [],
          accounts: [],
          forecasts: [],
          scenarios: []
        }
      };
    }
    
    // Pour l'instant, extraction minimaliste - sera enrichie dans des versions futures
    // Vérifier si des données standardisées existent
    if (businessPlanData.standardized && businessPlanData.standardized.finances) {
      return businessPlanData.standardized.finances;
    }
    
    // Structure de base pour les données financières
    return {
      invoices: [],
      expenses: [],
      cashflow: {
        entries: [],
        accounts: [],
        forecasts: [],
        scenarios: []
      }
    };
  }
  
  /**
   * Met à jour le plan d'affaires avec les données financières
   * 
   * @param businessPlanData Données du plan d'affaires
   * @param financesData Données financières
   * @returns Plan d'affaires mis à jour
   */
  static updateBusinessPlanWithFinances(
    businessPlanData: BusinessPlanData | null,
    financesData: any
  ): BusinessPlanData {
    if (!businessPlanData) {
      return {} as BusinessPlanData;
    }

    // Créer une copie des données du plan d'affaires
    const updatedBusinessPlan = { ...businessPlanData };

    // Assurer que l'objet standardized existe
    if (!updatedBusinessPlan.standardized) {
      updatedBusinessPlan.standardized = {};
    }

    // Mettre à jour les données financières
    updatedBusinessPlan.standardized.finances = financesData;

    return updatedBusinessPlan;
  }
}

export default FinancesAdapter;