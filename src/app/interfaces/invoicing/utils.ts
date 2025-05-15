/**
 * Utilitaires standardisés pour la gestion de la facturation
 * 
 * Ce fichier contient les fonctions utilitaires pour les calculs
 * et traitements liés aux factures et devis.
 * 
 * @standardized true
 * @version 1.0
 */

import { 
  UIInvoiceItem, 
  UIDocument, 
  DocumentType, 
  ServiceDocument,
  ServiceInvoiceItem
} from './invoicing';

/**
 * Calcule le montant total d'une ligne de facture
 * 
 * @param item Ligne de facture
 * @returns Montant total de la ligne hors taxes
 */
export const calculateItemTotal = (item: UIInvoiceItem | ServiceInvoiceItem): number => {
  if (!item) return 0;
  
  const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
  return item.quantity * item.unitPrice * discountFactor;
};

/**
 * Calcule les montants totaux d'un document (HT, TVA, TTC)
 * 
 * @param document Document à calculer
 * @returns Document avec les montants calculés
 */
export const calculateDocumentTotals = (document: UIDocument): UIDocument => {
  if (!document || !document.items) {
    return document;
  }
  
  const subtotal = document.items.reduce((sum, item) => 
    sum + calculateItemTotal(item), 0);
  
  const taxAmount = document.items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item);
    return sum + (itemTotal * item.taxRate);
  }, 0);
  
  // Calculer le sous-total de chaque ligne
  const itemsWithTotals = document.items.map(item => ({
    ...item,
    lineTotal: calculateItemTotal(item)
  }));
  
  return {
    ...document,
    items: itemsWithTotals,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};

/**
 * Calcule les montants totaux d'un document service (HT, TVA, TTC)
 * 
 * @param document Document service à calculer
 * @returns Document service avec les montants calculés
 */
export const calculateServiceDocumentTotals = (document: ServiceDocument): ServiceDocument => {
  if (!document || !document.items) {
    return document;
  }
  
  const subtotal = document.items.reduce((sum, item) => 
    sum + calculateItemTotal(item), 0);
  
  const taxAmount = document.items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item);
    return sum + (itemTotal * item.taxRate);
  }, 0);
  
  return {
    ...document,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};

/**
 * Génère un numéro de document unique
 * 
 * @param type Type de document (facture ou devis)
 * @param count Numéro séquentiel
 * @returns Numéro de document formaté
 */
export const generateDocumentNumber = (type: DocumentType, count: number): string => {
  const date = new Date();
  const year = date.getFullYear();
  const prefix = type === DocumentType.INVOICE ? 'F' : 'D';
  const paddedCount = String(count).padStart(3, '0');
  
  return `${prefix}${year}-${paddedCount}`;
};

/**
 * Génère un numéro de reçu pour un paiement
 * 
 * @param receiptCount Numéro séquentiel du reçu
 * @returns Numéro de reçu formaté
 */
export const generateReceiptNumber = (receiptCount: number): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const paddedCount = receiptCount.toString().padStart(3, '0');
  
  return `RECU-${year}${month}-${paddedCount}`;
};

/**
 * Vérifie si un document est en retard de paiement
 * 
 * @param document Document à vérifier
 * @returns true si le document est en retard de paiement
 */
export const isDocumentOverdue = (document: UIDocument | ServiceDocument): boolean => {
  if (!document.dueDate) return false;
  if (document.type !== DocumentType.INVOICE && document.type !== 'invoice') return false;
  if (document.status === 'paid' || document.status === 'accepted') return false;
  
  const now = new Date();
  const dueDate = new Date(document.dueDate);
  
  return dueDate < now;
};

/**
 * Calcule le montant restant à payer pour un document
 * 
 * @param document Document à calculer
 * @param payments Liste des paiements associés
 * @returns Montant restant à payer
 */
export const calculateRemainingAmount = (
  document: UIDocument | ServiceDocument, 
  payments: any[]
): number => {
  if (!document || !document.total) return 0;
  
  const totalPaid = payments?.reduce((sum, payment) => 
    sum + (payment.amount || 0), 0) || 0;
  
  return Math.max(0, document.total - totalPaid);
};

/**
 * Calcule la ventilation TVA par taux pour un document
 * 
 * @param document Document à analyser
 * @returns Objet avec les montants de TVA par taux
 */
export const calculateTaxBreakdown = (document: UIDocument): Record<string, number> => {
  if (!document?.items?.length) return {};
  
  const taxBreakdown: Record<string, number> = {};
  
  document.items.forEach(item => {
    const taxRate = item.taxRate;
    const taxRateKey = `${(taxRate * 100).toFixed(1)}%`;
    const itemTotal = calculateItemTotal(item);
    const itemTax = itemTotal * taxRate;
    
    taxBreakdown[taxRateKey] = (taxBreakdown[taxRateKey] || 0) + itemTax;
  });
  
  return taxBreakdown;
};

/**
 * Calcule le nombre de jours de retard pour un document
 * 
 * @param document Document à analyser
 * @returns Nombre de jours de retard (0 si pas en retard)
 */
export const calculateOverdueDays = (document: UIDocument | ServiceDocument): number => {
  if (!isDocumentOverdue(document) || !document.dueDate) return 0;
  
  const now = new Date();
  const dueDate = new Date(document.dueDate);
  const diffTime = Math.abs(now.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};