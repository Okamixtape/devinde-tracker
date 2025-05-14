/**
 * Types et interfaces pour la gestion des clients à risque
 */

/**
 * Niveau de risque d'un client
 */
export enum RiskLevel {
  NONE = "none",           // Client sans risque particulier
  LOW = "low",             // Risque faible (1 paiement en retard)
  MEDIUM = "medium",       // Risque modéré (plusieurs retards, factures impayées)
  HIGH = "high",           // Risque élevé (historique de non-paiement)
  BLACKLISTED = "blacklisted" // Client à éviter/bloquer
}

/**
 * Type de signalement ou d'incident avec un client
 */
export enum IncidentType {
  PAYMENT_DELAY = "payment_delay",     // Retard de paiement
  PARTIAL_PAYMENT = "partial_payment", // Paiement partiel
  NON_PAYMENT = "non_payment",         // Non-paiement
  DISPUTE = "dispute",                 // Litige 
  COMMUNICATION = "communication",     // Problème de communication
  SCAM_ATTEMPT = "scam_attempt",       // Tentative d'arnaque
  LEGAL_ISSUE = "legal_issue",         // Problème juridique
  OTHER = "other"                      // Autre type d'incident
}

/**
 * Interface pour un incident avec un client
 */
export interface ClientIncident {
  id: string;
  clientId: string;
  businessPlanId?: string;
  documentId?: string;
  type: IncidentType;
  description: string;
  date: string;
  amountInvolved?: number;
  resolved: boolean;
  resolutionDate?: string;
  resolutionNotes?: string;
}

/**
 * Interface pour un client à risque
 */
export interface RiskClient {
  id: string;
  clientId: string;
  clientName: string;
  riskLevel: RiskLevel;
  incidents: ClientIncident[];
  notes: string;
  lastUpdated: string;
  addedOn: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Interface pour les statistiques des clients à risque
 */
export interface RiskStats {
  totalClients: number;
  totalIncidents: number;
  totalAmountAtRisk: number;
  byRiskLevel: {
    [key in RiskLevel]: number;
  };
  byIncidentType: {
    [key in IncidentType]: number;
  };
  unresolvedIncidents: number;
}
