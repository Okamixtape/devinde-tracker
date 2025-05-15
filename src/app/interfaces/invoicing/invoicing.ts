/**
 * Interfaces standardisées pour la gestion de la facturation
 * 
 * Ce fichier définit les interfaces normalisées pour la gestion des factures,
 * devis et paiements dans l'application.
 * 
 * @standardized true
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';

/**
 * Type de document: facture ou devis
 */
export enum DocumentType {
  /** Facture */
  INVOICE = 'invoice',
  /** Devis */
  QUOTE = 'quote'
}

/**
 * Statut d'un document
 */
export enum DocumentStatus {
  /** Brouillon */
  DRAFT = 'draft',
  /** Envoyé au client */
  SENT = 'sent',
  /** Accepté (pour les devis) */
  ACCEPTED = 'accepted',
  /** Partiellement payé (pour les factures) */
  PARTIALLY_PAID = 'partial',
  /** Entièrement payé (pour les factures) */
  PAID = 'paid',
  /** Rejeté (pour les devis) */
  REJECTED = 'rejected',
  /** Paiement en retard */
  OVERDUE = 'overdue',
  /** Litige en cours */
  IN_DISPUTE = 'dispute',
  /** En procédure de recouvrement */
  IN_COLLECTION = 'collection'
}

/**
 * Méthodes de paiement supportées
 */
export enum PaymentMethod {
  /** Virement bancaire */
  BANK_TRANSFER = 'transfer',
  /** Carte de crédit */
  CREDIT_CARD = 'card',
  /** Chèque */
  CHECK = 'check',
  /** Espèces */
  CASH = 'cash',
  /** PayPal */
  PAYPAL = 'paypal',
  /** Autre méthode */
  OTHER = 'other'
}

// ==================== INTERFACES UI ====================

/**
 * Information sur le client (UI)
 */
export interface UIClientInfo {
  /** Identifiant unique du client */
  id?: string;
  /** Nom du client (entreprise ou particulier) */
  name: string;
  /** Adresse postale */
  address: string;
  /** Ville */
  city: string;
  /** Code postal */
  zipCode: string;
  /** Pays */
  country: string;
  /** Adresse email */
  email?: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Numéro de TVA intracommunautaire (si applicable) */
  vatNumber?: string;
}

/**
 * Information sur l'entreprise émettrice (UI)
 */
export interface UICompanyInfo {
  /** Nom de l'entreprise */
  name: string;
  /** Adresse postale */
  address: string;
  /** Ville */
  city: string;
  /** Code postal */
  zipCode: string;
  /** Pays */
  country: string;
  /** Adresse email */
  email: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Site web */
  website?: string;
  /** Numéro SIRET (pour les entreprises françaises) */
  siret: string;
  /** Numéro de TVA intracommunautaire */
  vatNumber?: string;
  /** URL du logo de l'entreprise */
  logo?: string;
}

/**
 * Ligne d'article sur une facture ou un devis (UI)
 */
export interface UIInvoiceItem extends UIModel {
  /** Description de l'article ou du service */
  description: string;
  /** Quantité */
  quantity: number;
  /** Prix unitaire HT */
  unitPrice: number;
  /** Taux de TVA (ex: 0.2 pour 20%) */
  taxRate: number;
  /** Remise éventuelle en pourcentage */
  discount?: number;
  /** Sous-total de la ligne (calculé) */
  lineTotal?: number;
  /** Notes additionnelles sur cette ligne */
  notes?: string;
  /** Lien vers le service associé */
  serviceId?: string;
}

/**
 * Enregistrement d'un paiement (UI)
 */
export interface UIPayment extends UIModel {
  /** ID du document associé */
  documentId: string;
  /** Date du paiement */
  date: string;
  /** Montant du paiement */
  amount: number;
  /** Méthode de paiement utilisée */
  method: PaymentMethod;
  /** Référence du paiement (numéro de transaction, etc.) */
  reference?: string;
  /** Notes relatives au paiement */
  notes?: string;
  /** Numéro de reçu généré */
  receiptNumber?: string;
  /** Indication si le reçu a été envoyé */
  receiptSent?: boolean;
}

/**
 * Document de facturation (facture ou devis) (UI)
 */
export interface UIDocument extends UIModel {
  /** Type de document (facture ou devis) */
  type: DocumentType;
  /** Statut actuel du document */
  status: DocumentStatus;
  /** Numéro du document (ex: F2023-001) */
  number: string;
  /** Date d'émission */
  issueDate: string;
  /** Date d'échéance (pour les factures) */
  dueDate?: string;
  /** Date de validité (pour les devis) */
  validUntil?: string;
  /** Informations sur le client */
  clientInfo: UIClientInfo;
  /** Informations sur l'entreprise émettrice */
  companyInfo: UICompanyInfo;
  /** Liste des articles */
  items: UIInvoiceItem[];
  /** Notes ou conditions particulières */
  notes?: string;
  /** Conditions de paiement */
  paymentTerms?: string;
  /** Lien vers le plan d'affaires associé */
  businessPlanId: string;
  /** Lien vers le service associé (si applicable) */
  serviceId?: string;
  
  /** Historique des paiements */
  payments?: UIPayment[];
  /** Montant déjà payé (calculé) */
  amountPaid?: number;
  /** Montant restant à payer (calculé) */
  remainingAmount?: number;
  /** Date du dernier paiement */
  lastPaymentDate?: string;
  /** Date de la dernière relance */
  lastReminderDate?: string;
  /** Nombre de relances envoyées */
  reminderCount?: number;
  /** Indicateur de client à risque */
  clientRiskFlag?: boolean;
  
  /** Montant HT (calculé) */
  subtotal?: number;
  /** Montant de la TVA (calculé) */
  taxAmount?: number;
  /** Montant TTC (calculé) */
  total?: number;
  
  /** Affichage dans l'interface : document déplié */
  isExpanded?: boolean;
  /** État de prévisualisation */
  isPreviewing?: boolean;
}

/**
 * Filtres pour les documents de facturation (UI)
 */
export interface UIDocumentFilters {
  /** Types de documents à afficher */
  documentTypes: DocumentType[];
  /** Statuts à afficher */
  statuses: DocumentStatus[];
  /** Filtrer par date d'émission (début) */
  issueDateFrom?: string;
  /** Filtrer par date d'émission (fin) */
  issueDateTo?: string;
  /** Filtrer par montant minimum */
  minAmount?: number;
  /** Filtrer par montant maximum */
  maxAmount?: number;
  /** Terme de recherche */
  searchTerm: string;
  /** Client spécifique */
  clientId?: string;
  /** Plan d'affaires spécifique */
  businessPlanId?: string;
}

/**
 * Statistiques de facturation (UI)
 */
export interface UIInvoicingStats {
  /** Nombre total de documents */
  totalDocuments: number;
  /** Chiffre d'affaires total */
  totalRevenue: number;
  /** Total des factures impayées */
  unpaidInvoicesAmount: number;
  /** Nombre de factures impayées */
  unpaidInvoicesCount: number;
  /** Nombre de factures en retard */
  overdueInvoicesCount: number;
  /** Montant en retard */
  overdueAmount: number;
  /** Documents par type */
  byType: {
    [key in DocumentType]: number;
  };
  /** Documents par statut */
  byStatus: {
    [key in DocumentStatus]: number;
  };
  /** Montant par méthode de paiement */
  byPaymentMethod: {
    [key in PaymentMethod]: number;
  };
  /** Évolution mensuelle du chiffre d'affaires */
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
}

// ==================== INTERFACES SERVICE ====================

/**
 * Information sur le client (Service)
 */
export interface ServiceClientInfo {
  /** Identifiant unique du client */
  id?: string;
  /** Nom du client (entreprise ou particulier) */
  name: string;
  /** Adresse postale */
  address: string;
  /** Ville */
  city: string;
  /** Code postal */
  zipCode: string;
  /** Pays */
  country: string;
  /** Adresse email */
  email?: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Numéro de TVA intracommunautaire (si applicable) */
  vatNumber?: string;
}

/**
 * Information sur l'entreprise émettrice (Service)
 */
export interface ServiceCompanyInfo {
  /** Nom de l'entreprise */
  name: string;
  /** Adresse postale */
  address: string;
  /** Ville */
  city: string;
  /** Code postal */
  zipCode: string;
  /** Pays */
  country: string;
  /** Adresse email */
  email: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Site web */
  website?: string;
  /** Numéro SIRET (pour les entreprises françaises) */
  siret: string;
  /** Numéro de TVA intracommunautaire */
  vatNumber?: string;
  /** URL du logo de l'entreprise */
  logo?: string;
}

/**
 * Ligne d'article sur une facture ou un devis (Service)
 */
export interface ServiceInvoiceItem {
  /** Identifiant unique de l'article */
  id: string;
  /** Description de l'article ou du service */
  description: string;
  /** Quantité */
  quantity: number;
  /** Prix unitaire HT */
  unitPrice: number;
  /** Taux de TVA (ex: 0.2 pour 20%) */
  taxRate: number;
  /** Remise éventuelle en pourcentage */
  discount?: number;
  /** Notes additionnelles sur cette ligne */
  notes?: string;
  /** Lien vers le service associé */
  serviceId?: string;
}

/**
 * Enregistrement d'un paiement (Service)
 */
export interface ServicePayment extends ServiceModel {
  /** ID du document associé */
  documentId: string;
  /** Date du paiement */
  date: string;
  /** Montant du paiement */
  amount: number;
  /** Méthode de paiement utilisée */
  method: string;
  /** Référence du paiement (numéro de transaction, etc.) */
  reference?: string;
  /** Notes relatives au paiement */
  notes?: string;
  /** Numéro de reçu généré */
  receiptNumber?: string;
  /** Indication si le reçu a été envoyé */
  receiptSent?: boolean;
}

/**
 * Document de facturation (facture ou devis) (Service)
 */
export interface ServiceDocument extends ServiceModel {
  /** Type de document (facture ou devis) */
  type: string;
  /** Statut actuel du document */
  status: string;
  /** Numéro du document (ex: F2023-001) */
  number: string;
  /** Date d'émission */
  issueDate: string;
  /** Date d'échéance (pour les factures) */
  dueDate?: string;
  /** Date de validité (pour les devis) */
  validUntil?: string;
  /** Informations sur le client */
  clientInfo: ServiceClientInfo;
  /** Informations sur l'entreprise émettrice */
  companyInfo: ServiceCompanyInfo;
  /** Liste des articles */
  items: ServiceInvoiceItem[];
  /** Notes ou conditions particulières */
  notes?: string;
  /** Conditions de paiement */
  paymentTerms?: string;
  /** Lien vers le plan d'affaires associé */
  businessPlanId: string;
  /** Lien vers le service associé (si applicable) */
  serviceId?: string;
  
  /** Historique des paiements */
  payments?: ServicePayment[];
  /** Montant déjà payé (calculé) */
  amountPaid?: number;
  /** Montant restant à payer (calculé) */
  remainingAmount?: number;
  /** Date du dernier paiement */
  lastPaymentDate?: string;
  /** Date de la dernière relance */
  lastReminderDate?: string;
  /** Nombre de relances envoyées */
  reminderCount?: number;
  /** Indicateur de client à risque */
  clientRiskFlag?: boolean;
  
  /** Montant HT (calculé) */
  subtotal?: number;
  /** Montant de la TVA (calculé) */
  taxAmount?: number;
  /** Montant TTC (calculé) */
  total?: number;
}