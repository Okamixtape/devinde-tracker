/**
 * Interfaces standardisées pour la gestion des clients à risque
 * 
 * Ce fichier définit les interfaces normalisées pour la gestion des clients
 * présentant des risques de non-paiement ou autres problèmes commerciaux.
 * 
 * @standardized true
 * @version 1.0
 */

import { BaseModel, ServiceModel, UIModel } from '../common/base-models';

/**
 * Niveau de risque d'un client
 */
export enum RiskLevel {
  /** Client sans risque particulier */
  NONE = "none",
  /** Risque faible (1 paiement en retard) */
  LOW = "low",
  /** Risque modéré (plusieurs retards, factures impayées) */
  MEDIUM = "medium",
  /** Risque élevé (historique de non-paiement) */
  HIGH = "high",
  /** Client à éviter/bloquer */
  BLACKLISTED = "blacklisted"
}

/**
 * Type de signalement ou d'incident avec un client
 */
export enum IncidentType {
  /** Retard de paiement */
  PAYMENT_DELAY = "payment_delay",
  /** Paiement partiel */
  PARTIAL_PAYMENT = "partial_payment",
  /** Non-paiement */
  NON_PAYMENT = "non_payment",
  /** Litige */
  DISPUTE = "dispute",
  /** Problème de communication */
  COMMUNICATION = "communication",
  /** Tentative d'arnaque */
  SCAM_ATTEMPT = "scam_attempt",
  /** Problème juridique */
  LEGAL_ISSUE = "legal_issue",
  /** Autre type d'incident */
  OTHER = "other"
}

// ==================== INTERFACES UI ====================

/**
 * Information de contact pour un client (UI)
 */
export interface UIContactInfo {
  /** Adresse email */
  email?: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Adresse postale */
  address?: string;
}

/**
 * Incident avec un client (UI)
 */
export interface UIClientIncident extends UIModel {
  /** ID du client concerné */
  clientId: string;
  /** ID du plan d'affaires associé (optionnel) */
  businessPlanId?: string;
  /** ID du document associé (facture, contrat) */
  documentId?: string;
  /** Type d'incident */
  type: IncidentType;
  /** Description détaillée de l'incident */
  description: string;
  /** Date de l'incident */
  date: string;
  /** Montant impliqué dans l'incident (en devise par défaut) */
  amountInvolved?: number;
  /** Indique si l'incident est résolu */
  resolved: boolean;
  /** Date de résolution de l'incident */
  resolutionDate?: string;
  /** Notes sur la résolution de l'incident */
  resolutionNotes?: string;
}

/**
 * Client à risque (UI)
 */
export interface UIRiskClient extends UIModel {
  /** ID du client dans le système */
  clientId: string;
  /** Nom du client */
  clientName: string;
  /** Niveau de risque évalué */
  riskLevel: RiskLevel;
  /** Liste des incidents liés à ce client */
  incidents: UIClientIncident[];
  /** Notes et commentaires généraux */
  notes: string;
  /** Date d'ajout à la liste des clients à risque */
  addedOn: string;
  /** Informations de contact */
  contactInfo: UIContactInfo;
  /** Indicateur de suivi actif */
  isBeingTracked?: boolean;
  /** Indicateur pour l'interface montrant si le client est en cours d'édition */
  isExpanded?: boolean;
}

/**
 * Statistiques des clients à risque (UI)
 */
export interface UIRiskStats {
  /** Nombre total de clients à risque */
  totalClients: number;
  /** Nombre total d'incidents enregistrés */
  totalIncidents: number;
  /** Montant total à risque (somme des montants non résolus) */
  totalAmountAtRisk: number;
  /** Répartition par niveau de risque */
  byRiskLevel: {
    [key in RiskLevel]: number;
  };
  /** Répartition par type d'incident */
  byIncidentType: {
    [key in IncidentType]: number;
  };
  /** Nombre d'incidents non résolus */
  unresolvedIncidents: number;
  /** Tendance sur les 30 derniers jours (% d'augmentation/diminution) */
  trend30Days?: number;
}

/**
 * Filtres pour l'affichage des clients à risque (UI)
 */
export interface UIRiskClientFilters {
  /** Filtrer par niveaux de risque */
  riskLevels: RiskLevel[];
  /** Filtrer par types d'incidents */
  incidentTypes: IncidentType[];
  /** Montant minimum impliqué */
  minAmount?: number;
  /** Montant maximum impliqué */
  maxAmount?: number;
  /** Afficher uniquement les incidents non résolus */
  unresolvedOnly: boolean;
  /** Terme de recherche */
  searchTerm: string;
  /** Période (en jours) */
  period?: number;
}

// ==================== INTERFACES SERVICE ====================

/**
 * Information de contact pour un client (Service)
 */
export interface ServiceContactInfo {
  /** Adresse email */
  email?: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Adresse postale */
  address?: string;
}

/**
 * Incident avec un client (Service)
 */
export interface ServiceClientIncident extends ServiceModel {
  /** ID du client concerné */
  clientId: string;
  /** ID du plan d'affaires associé (optionnel) */
  businessPlanId?: string;
  /** ID du document associé (facture, contrat) */
  documentId?: string;
  /** Type d'incident */
  type: string; // Stocké comme string dans le service
  /** Description détaillée de l'incident */
  description: string;
  /** Date de l'incident */
  date: string;
  /** Montant impliqué dans l'incident (en devise par défaut) */
  amountInvolved?: number;
  /** Indique si l'incident est résolu */
  resolved: boolean;
  /** Date de résolution de l'incident */
  resolutionDate?: string;
  /** Notes sur la résolution de l'incident */
  resolutionNotes?: string;
}

/**
 * Client à risque (Service)
 */
export interface ServiceRiskClient extends ServiceModel {
  /** ID du client dans le système */
  clientId: string;
  /** Nom du client */
  clientName: string;
  /** Niveau de risque évalué */
  riskLevel: string; // Stocké comme string dans le service
  /** Liste des incidents liés à ce client */
  incidents: ServiceClientIncident[];
  /** Notes et commentaires généraux */
  notes: string;
  /** Date d'ajout à la liste des clients à risque */
  addedOn: string;
  /** Informations de contact */
  contactInfo: ServiceContactInfo;
}