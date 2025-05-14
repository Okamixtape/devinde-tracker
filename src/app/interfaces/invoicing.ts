export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;  // Prix unitaire HT
  taxRate: number;    // Taux de TVA (ex: 0.2 pour 20%)
  discount?: number;  // Remise éventuelle en pourcentage
}

export interface ClientInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email?: string;
  phone?: string;
  vatNumber?: string;  // Numéro de TVA intracommunautaire si applicable
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  email: string;
  phone?: string;
  website?: string;
  siret: string;        // SIRET pour les entreprises françaises
  vatNumber?: string;   // Numéro de TVA
  logo?: string;        // URL du logo
}

export enum DocumentType {
  INVOICE = 'invoice',
  QUOTE = 'quote'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',      // Pour les devis
  PARTIALLY_PAID = 'partial', // Paiement partiel (factures)
  PAID = 'paid',              // Factures entièrement payées
  REJECTED = 'rejected',      // Pour les devis
  OVERDUE = 'overdue',        // Paiement en retard
  IN_DISPUTE = 'dispute',     // Litige en cours
  IN_COLLECTION = 'collection' // En procédure de recouvrement
}

// Méthodes de paiement supportées
export enum PaymentMethod {
  BANK_TRANSFER = 'transfer',
  CREDIT_CARD = 'card',
  CHECK = 'check',
  CASH = 'cash',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

// Enregistrement d'un paiement
export interface Payment {
  id: string;
  documentId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  receiptNumber?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  number: string;        // Numéro de la facture ou du devis (ex: F2023-001)
  issueDate: string;     // Date d'émission
  dueDate?: string;      // Date d'échéance (pour les factures)
  validUntil?: string;   // Date de validité (pour les devis)
  clientInfo: ClientInfo;
  companyInfo: CompanyInfo;
  items: InvoiceItem[];
  notes?: string;        // Notes ou conditions particulières
  paymentTerms?: string; // Conditions de paiement
  businessPlanId: string; // Lien vers le plan d'affaires associé
  serviceId?: string;     // Lien vers le service associé si applicable
  
  // Informations de paiement
  payments?: Payment[];    // Historique des paiements
  amountPaid?: number;     // Montant déjà payé
  remainingAmount?: number; // Montant restant à payer
  lastPaymentDate?: string; // Date du dernier paiement
  lastReminderDate?: string; // Date de la dernière relance
  reminderCount?: number;    // Nombre de relances envoyées
  clientRiskFlag?: boolean;  // Indicateur de client à risque
  
  // Champs calculés
  subtotal?: number;     // Montant HT
  taxAmount?: number;    // Montant de la TVA
  total?: number;        // Montant TTC
}

// Utilitaires pour les calculs
export const calculateItemTotal = (item: InvoiceItem): number => {
  const discountFactor = item.discount ? 1 - (item.discount / 100) : 1;
  return item.quantity * item.unitPrice * discountFactor;
};

export const calculateDocumentTotals = (document: Document): Document => {
  const subtotal = document.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
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

// Génération des numéros de document
export const generateDocumentNumber = (type: DocumentType, count: number): string => {
  const date = new Date();
  const year = date.getFullYear();
  const prefix = type === DocumentType.INVOICE ? 'F' : 'D';
  const paddedCount = String(count).padStart(3, '0');
  
  return `${prefix}${year}-${paddedCount}`;
};
