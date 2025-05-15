/**
 * InvoicingAdapter (Standardized) - Adaptateur pour les données de facturation
 * 
 * Cette version standardisée de l'adaptateur implémente pleinement les conventions
 * définies dans /docs/CONVENTIONS.md et utilise uniquement les interfaces standardisées.
 *
 * @version 1.0
 * @standardized true
 */

import {
  DocumentType,
  DocumentStatus,
  PaymentMethod,
  UIDocument,
  UIInvoiceItem,
  UIPayment,
  UIClientInfo,
  UICompanyInfo,
  ServiceDocument,
  ServiceInvoiceItem,
  ServicePayment,
  ServiceClientInfo,
  ServiceCompanyInfo,
  calculateDocumentTotals,
  calculateServiceDocumentTotals
} from '../interfaces/invoicing';

/**
 * Adaptateur pour la facturation (standardisé)
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * et le format UI standardisé, en utilisant exclusivement les interfaces standardisées.
 */
export class InvoicingAdapter {
  /**
   * Transforme un document du format service vers le format UI
   * 
   * @param serviceData Données du document provenant du service
   * @returns Document formaté pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(serviceData: ServiceDocument | null): UIDocument {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return InvoicingAdapter.createDefaultUIDocument();
    }

    // Conversion des éléments
    const items = Array.isArray(serviceData.items)
      ? serviceData.items.map(InvoicingAdapter.itemToUI)
      : [];
      
    // Conversion des paiements
    const payments = Array.isArray(serviceData.payments)
      ? serviceData.payments.map(InvoicingAdapter.paymentToUI)
      : [];

    // Document UI de base
    const uiDocument: UIDocument = {
      id: serviceData.id,
      type: InvoicingAdapter.serviceToUIDocumentType(serviceData.type),
      status: InvoicingAdapter.serviceToUIDocumentStatus(serviceData.status),
      number: serviceData.number || '',
      issueDate: serviceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: serviceData.dueDate,
      validUntil: serviceData.validUntil,
      clientInfo: InvoicingAdapter.clientInfoToUI(serviceData.clientInfo),
      companyInfo: InvoicingAdapter.companyInfoToUI(serviceData.companyInfo),
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

    // Recalculer les totaux pour s'assurer que tout est cohérent
    return calculateDocumentTotals(uiDocument);
  }

  /**
   * Transforme un élément de facture du format service vers le format UI
   * @private
   */
  private static itemToUI(item: ServiceInvoiceItem): UIInvoiceItem {
    return {
      id: item.id,
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      taxRate: item.taxRate || 0,
      discount: item.discount,
      notes: item.notes,
      serviceId: item.serviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Transforme un paiement du format service vers le format UI
   * @private
   */
  private static paymentToUI(payment: ServicePayment): UIPayment {
    return {
      id: payment.id,
      documentId: payment.documentId,
      date: payment.date || new Date().toISOString().split('T')[0],
      amount: payment.amount || 0,
      method: InvoicingAdapter.serviceToUIPaymentMethod(payment.method),
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
  private static clientInfoToUI(clientInfo: ServiceClientInfo): UIClientInfo {
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
  private static companyInfoToUI(companyInfo: ServiceCompanyInfo): UICompanyInfo {
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
      name: companyInfo.name || '',
      address: companyInfo.address || '',
      city: companyInfo.city || '',
      zipCode: companyInfo.zipCode || '',
      country: companyInfo.country || '',
      email: companyInfo.email || '',
      phone: companyInfo.phone || '',
      website: companyInfo.website || '',
      siret: companyInfo.siret || '',
      vatNumber: companyInfo.vatNumber || '',
      logo: companyInfo.logo || ''
    };
  }

  /**
   * Transforme un document du format UI vers le format service
   * 
   * @param uiData Document provenant de l'UI
   * @returns Document formaté pour le service
   */
  static toService(uiData: UIDocument | null): ServiceDocument {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return InvoicingAdapter.createDefaultServiceDocument();
    }

    // Conversion des éléments
    const items = Array.isArray(uiData.items)
      ? uiData.items.map(InvoicingAdapter.itemToService)
      : [];
      
    // Conversion des paiements
    const payments = Array.isArray(uiData.payments)
      ? uiData.payments.map(InvoicingAdapter.paymentToService)
      : [];

    // Document service de base
    const serviceDocument: ServiceDocument = {
      id: uiData.id,
      type: InvoicingAdapter.uiToServiceDocumentType(uiData.type),
      status: InvoicingAdapter.uiToServiceDocumentStatus(uiData.status),
      number: uiData.number,
      issueDate: uiData.issueDate,
      dueDate: uiData.dueDate,
      validUntil: uiData.validUntil,
      clientInfo: InvoicingAdapter.clientInfoToService(uiData.clientInfo),
      companyInfo: InvoicingAdapter.companyInfoToService(uiData.companyInfo),
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

    // Recalculer les totaux pour s'assurer que tout est cohérent
    return calculateServiceDocumentTotals(serviceDocument);
  }

  /**
   * Transforme un élément de facture du format UI vers le format service
   * @private
   */
  private static itemToService(item: UIInvoiceItem): ServiceInvoiceItem {
    return {
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      discount: item.discount,
      notes: item.notes,
      serviceId: item.serviceId
    };
  }

  /**
   * Transforme un paiement du format UI vers le format service
   * @private
   */
  private static paymentToService(payment: UIPayment): ServicePayment {
    return {
      id: payment.id,
      documentId: payment.documentId,
      date: payment.date,
      amount: payment.amount,
      method: InvoicingAdapter.uiToServicePaymentMethod(payment.method),
      reference: payment.reference,
      notes: payment.notes,
      receiptNumber: payment.receiptNumber,
      receiptSent: payment.receiptSent,
      createdAt: payment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Transforme les informations client du format UI vers le format service
   * @private
   */
  private static clientInfoToService(clientInfo: UIClientInfo): ServiceClientInfo {
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
  private static companyInfoToService(companyInfo: UICompanyInfo): ServiceCompanyInfo {
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
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * 
   * @param serviceData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    serviceData: ServiceDocument | null,
    uiChanges: Partial<UIDocument> | null
  ): ServiceDocument {
    // Protection contre les données nulles ou undefined
    if (!serviceData) return InvoicingAdapter.createDefaultServiceDocument();
    if (!uiChanges) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const result: ServiceDocument = { ...serviceData };

    // Mettre à jour les champs modifiés
    if (uiChanges.status !== undefined) {
      result.status = InvoicingAdapter.uiToServiceDocumentStatus(uiChanges.status);
    }
    if (uiChanges.notes !== undefined) result.notes = uiChanges.notes;
    if (uiChanges.dueDate !== undefined) result.dueDate = uiChanges.dueDate;
    if (uiChanges.validUntil !== undefined) result.validUntil = uiChanges.validUntil;
    if (uiChanges.paymentTerms !== undefined) result.paymentTerms = uiChanges.paymentTerms;
    if (uiChanges.clientRiskFlag !== undefined) result.clientRiskFlag = uiChanges.clientRiskFlag;

    // Mettre à jour les informations client si fournies
    if (uiChanges.clientInfo) {
      result.clientInfo = InvoicingAdapter.clientInfoToService(uiChanges.clientInfo);
    }

    // Mettre à jour les informations d'entreprise si fournies
    if (uiChanges.companyInfo) {
      result.companyInfo = InvoicingAdapter.companyInfoToService(uiChanges.companyInfo);
    }

    // Mettre à jour les éléments de la facture si fournis
    if (uiChanges.items) {
      result.items = uiChanges.items.map(InvoicingAdapter.itemToService);

      // Recalculer les totaux
      const recalculated = calculateServiceDocumentTotals(result);
      result.subtotal = recalculated.subtotal;
      result.taxAmount = recalculated.taxAmount;
      result.total = recalculated.total;
    }

    // Mettre à jour la date de modification
    result.updatedAt = new Date().toISOString();

    return result;
  }

  /**
   * Ajoute un nouveau paiement à un document
   * 
   * @param serviceData Document auquel ajouter le paiement
   * @param uiPayment Paiement à ajouter
   * @returns Document mis à jour
   */
  static addPayment(
    serviceData: ServiceDocument,
    uiPayment: UIPayment
  ): ServiceDocument {
    // Protection contre les données nulles ou undefined
    if (!serviceData || !uiPayment) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const result: ServiceDocument = { ...serviceData };
    
    // Convertir le paiement en format service
    const servicePayment = InvoicingAdapter.paymentToService(uiPayment);
    
    // Ajouter le paiement
    if (!result.payments) {
      result.payments = [];
    }
    result.payments = [...result.payments, servicePayment];
    
    // Calculer le montant total payé
    const totalPaid = result.payments.reduce((sum, payment) => sum + payment.amount, 0);
    result.amountPaid = totalPaid;
    result.remainingAmount = (result.total || 0) - totalPaid;
    result.lastPaymentDate = new Date().toISOString();
    
    // Déterminer le nouveau statut
    if (totalPaid >= (result.total || 0)) {
      result.status = DocumentStatus.PAID.toString();
    } else if (totalPaid > 0) {
      result.status = DocumentStatus.PARTIALLY_PAID.toString();
    }
    
    // Mettre à jour la date de modification
    result.updatedAt = new Date().toISOString();
    
    return result;
  }

  /**
   * Convertit le type de document du format service vers le format UI
   * @private
   */
  private static serviceToUIDocumentType(serviceType: string): DocumentType {
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
  private static uiToServiceDocumentType(uiType: DocumentType): string {
    return uiType.toString();
  }

  /**
   * Convertit le statut de document du format service vers le format UI
   * @private
   */
  private static serviceToUIDocumentStatus(serviceStatus: string): DocumentStatus {
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
  private static uiToServiceDocumentStatus(uiStatus: DocumentStatus): string {
    return uiStatus.toString();
  }

  /**
   * Convertit la méthode de paiement du format service vers le format UI
   * @private
   */
  private static serviceToUIPaymentMethod(serviceMethod: string): PaymentMethod {
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
  private static uiToServicePaymentMethod(uiMethod: PaymentMethod): string {
    return uiMethod.toString();
  }

  /**
   * Crée un document UI par défaut
   * @private 
   */
  private static createDefaultUIDocument(): UIDocument {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Créer une date d'échéance par défaut à 30 jours
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    return {
      id: '',
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
  private static createDefaultServiceDocument(): ServiceDocument {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Créer une date d'échéance par défaut à 30 jours
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    return {
      id: '',
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
}

// Export par défaut pour usage simple
export default InvoicingAdapter;