/**
 * RiskClientAdapter (Standardized) - Adaptateur pour les données des clients à risque
 * 
 * Cette version standardisée de l'adaptateur implémente pleinement les conventions
 * définies dans /docs/CONVENTIONS.md et utilise uniquement les interfaces standardisées.
 *
 * @version 1.0
 * @standardized true
 */

import {
  RiskLevel,
  IncidentType,
  UIRiskClient,
  UIClientIncident,
  UIRiskStats,
  ServiceRiskClient,
  ServiceClientIncident
} from '../interfaces/client-risk/client-risk';

/**
 * Adaptateur pour les clients à risque (standardisé)
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * et le format UI standardisé, en utilisant exclusivement les interfaces standardisées.
 */
export class RiskClientAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(serviceData: ServiceRiskClient | null): UIRiskClient {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return RiskClientAdapter.createDefaultUIData();
    }

    // Conversion des incidents
    const incidents = Array.isArray(serviceData.incidents)
      ? serviceData.incidents.map(RiskClientAdapter.incidentToUI)
      : [];

    return {
      id: serviceData.id,
      clientId: serviceData.clientId || '',
      clientName: serviceData.clientName || '',
      riskLevel: RiskClientAdapter.serviceToUIRiskLevel(serviceData.riskLevel),
      incidents: incidents,
      notes: serviceData.notes || '',
      addedOn: serviceData.addedOn || new Date().toISOString(),
      contactInfo: {
        email: serviceData.contactInfo?.email || '',
        phone: serviceData.contactInfo?.phone || '',
        address: serviceData.contactInfo?.address || ''
      },
      isBeingTracked: true,
      isExpanded: false,
      createdAt: serviceData.createdAt || new Date().toISOString(),
      updatedAt: serviceData.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Transforme un incident du format service vers le format UI
   * @private
   */
  private static incidentToUI(incident: ServiceClientIncident): UIClientIncident {
    return {
      id: incident.id,
      clientId: incident.clientId,
      businessPlanId: incident.businessPlanId,
      documentId: incident.documentId,
      type: RiskClientAdapter.serviceToUIIncidentType(incident.type),
      description: incident.description || '',
      date: incident.date || new Date().toISOString(),
      amountInvolved: incident.amountInvolved,
      resolved: incident.resolved || false,
      resolutionDate: incident.resolutionDate,
      resolutionNotes: incident.resolutionNotes,
      createdAt: incident.createdAt || new Date().toISOString(),
      updatedAt: incident.updatedAt || new Date().toISOString(),
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service
   */
  static toService(uiData: UIRiskClient | null): ServiceRiskClient {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return RiskClientAdapter.createDefaultServiceData();
    }

    // Conversion des incidents
    const incidents = Array.isArray(uiData.incidents)
      ? uiData.incidents.map(RiskClientAdapter.incidentToService)
      : [];

    return {
      id: uiData.id,
      clientId: uiData.clientId,
      clientName: uiData.clientName,
      riskLevel: RiskClientAdapter.uiToServiceRiskLevel(uiData.riskLevel),
      incidents: incidents,
      notes: uiData.notes,
      addedOn: uiData.addedOn,
      contactInfo: {
        email: uiData.contactInfo?.email,
        phone: uiData.contactInfo?.phone,
        address: uiData.contactInfo?.address
      },
      createdAt: uiData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Transforme un incident du format UI vers le format service
   * @private
   */
  private static incidentToService(incident: UIClientIncident): ServiceClientIncident {
    return {
      id: incident.id,
      clientId: incident.clientId,
      businessPlanId: incident.businessPlanId,
      documentId: incident.documentId,
      type: RiskClientAdapter.uiToServiceIncidentType(incident.type),
      description: incident.description,
      date: incident.date,
      amountInvolved: incident.amountInvolved,
      resolved: incident.resolved,
      resolutionDate: incident.resolutionDate,
      resolutionNotes: incident.resolutionNotes,
      createdAt: incident.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    serviceData: ServiceRiskClient | null,
    uiChanges: Partial<UIRiskClient> | null
  ): ServiceRiskClient {
    // Protection contre les données nulles ou undefined
    if (!serviceData) return RiskClientAdapter.createDefaultServiceData();
    if (!uiChanges) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const updatedData: ServiceRiskClient = { ...serviceData };

    // Mettre à jour les champs modifiés
    if (uiChanges.clientName !== undefined) updatedData.clientName = uiChanges.clientName;
    if (uiChanges.notes !== undefined) updatedData.notes = uiChanges.notes;
    if (uiChanges.riskLevel !== undefined) {
      updatedData.riskLevel = RiskClientAdapter.uiToServiceRiskLevel(uiChanges.riskLevel);
    }

    // Mettre à jour les informations de contact si fournies
    if (uiChanges.contactInfo) {
      updatedData.contactInfo = {
        ...updatedData.contactInfo,
        email: uiChanges.contactInfo.email !== undefined 
          ? uiChanges.contactInfo.email 
          : updatedData.contactInfo?.email,
        phone: uiChanges.contactInfo.phone !== undefined 
          ? uiChanges.contactInfo.phone 
          : updatedData.contactInfo?.phone,
        address: uiChanges.contactInfo.address !== undefined 
          ? uiChanges.contactInfo.address 
          : updatedData.contactInfo?.address
      };
    }

    // Mettre à jour les incidents si fournis
    if (uiChanges.incidents) {
      updatedData.incidents = uiChanges.incidents.map(RiskClientAdapter.incidentToService);
    }

    // Mettre à jour la date de modification
    updatedData.updatedAt = new Date().toISOString();

    return updatedData;
  }

  /**
   * Met à jour un incident spécifique
   * 
   * @param serviceData Client à risque contenant l'incident à mettre à jour
   * @param incidentId ID de l'incident à mettre à jour
   * @param uiIncidentChanges Modifications à appliquer à l'incident
   * @returns Client à risque mis à jour
   */
  static updateIncident(
    serviceData: ServiceRiskClient,
    incidentId: string,
    uiIncidentChanges: Partial<UIClientIncident>
  ): ServiceRiskClient {
    // Protection contre les données nulles ou undefined
    if (!serviceData || !incidentId || !uiIncidentChanges) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const updatedData: ServiceRiskClient = { ...serviceData };
    
    // Trouver l'incident à mettre à jour
    const incidentIndex = updatedData.incidents.findIndex(i => i.id === incidentId);
    
    if (incidentIndex !== -1) {
      // Créer une copie de l'incident
      const updatedIncident = { ...updatedData.incidents[incidentIndex] };
      
      // Appliquer les modifications
      if (uiIncidentChanges.description !== undefined) updatedIncident.description = uiIncidentChanges.description;
      if (uiIncidentChanges.amountInvolved !== undefined) updatedIncident.amountInvolved = uiIncidentChanges.amountInvolved;
      if (uiIncidentChanges.resolved !== undefined) updatedIncident.resolved = uiIncidentChanges.resolved;
      if (uiIncidentChanges.resolutionNotes !== undefined) updatedIncident.resolutionNotes = uiIncidentChanges.resolutionNotes;
      if (uiIncidentChanges.resolutionDate !== undefined) updatedIncident.resolutionDate = uiIncidentChanges.resolutionDate;
      if (uiIncidentChanges.type !== undefined) {
        updatedIncident.type = RiskClientAdapter.uiToServiceIncidentType(uiIncidentChanges.type);
      }
      
      // Mettre à jour la date de modification
      updatedIncident.updatedAt = new Date().toISOString();
      
      // Remplacer l'incident dans le tableau
      updatedData.incidents[incidentIndex] = updatedIncident;
    }
    
    // Mettre à jour la date de modification du client
    updatedData.updatedAt = new Date().toISOString();
    
    return updatedData;
  }

  /**
   * Ajoute un nouvel incident à un client
   * 
   * @param serviceData Client à risque auquel ajouter l'incident
   * @param uiIncident Incident à ajouter
   * @returns Client à risque mis à jour
   */
  static addIncident(
    serviceData: ServiceRiskClient,
    uiIncident: UIClientIncident
  ): ServiceRiskClient {
    // Protection contre les données nulles ou undefined
    if (!serviceData || !uiIncident) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const updatedData: ServiceRiskClient = { ...serviceData };
    
    // Convertir l'incident en format service
    const serviceIncident = RiskClientAdapter.incidentToService(uiIncident);
    
    // Ajouter l'incident
    updatedData.incidents = [...updatedData.incidents, serviceIncident];
    
    // Mettre à jour la date de modification
    updatedData.updatedAt = new Date().toISOString();
    
    return updatedData;
  }

  /**
   * Supprime un incident d'un client
   * 
   * @param serviceData Client à risque duquel supprimer l'incident
   * @param incidentId ID de l'incident à supprimer
   * @returns Client à risque mis à jour
   */
  static removeIncident(
    serviceData: ServiceRiskClient,
    incidentId: string
  ): ServiceRiskClient {
    // Protection contre les données nulles ou undefined
    if (!serviceData || !incidentId) return serviceData;

    // Créer une copie pour éviter des modifications directes
    const updatedData: ServiceRiskClient = { ...serviceData };
    
    // Filtrer les incidents pour supprimer celui avec l'ID spécifié
    updatedData.incidents = updatedData.incidents.filter(i => i.id !== incidentId);
    
    // Mettre à jour la date de modification
    updatedData.updatedAt = new Date().toISOString();
    
    return updatedData;
  }

  /**
   * Convertit le niveau de risque du format service vers le format UI
   * @private
   */
  private static serviceToUIRiskLevel(serviceRiskLevel: string): RiskLevel {
    switch (serviceRiskLevel) {
      case 'low':
        return RiskLevel.LOW;
      case 'medium':
        return RiskLevel.MEDIUM;
      case 'high':
        return RiskLevel.HIGH;
      case 'blacklisted':
        return RiskLevel.BLACKLISTED;
      case 'none':
      default:
        return RiskLevel.NONE;
    }
  }

  /**
   * Convertit le niveau de risque du format UI vers le format service
   * @private
   */
  private static uiToServiceRiskLevel(uiRiskLevel: RiskLevel): string {
    return uiRiskLevel;
  }

  /**
   * Convertit le type d'incident du format service vers le format UI
   * @private
   */
  private static serviceToUIIncidentType(serviceType: string): IncidentType {
    switch (serviceType) {
      case 'payment_delay':
        return IncidentType.PAYMENT_DELAY;
      case 'partial_payment':
        return IncidentType.PARTIAL_PAYMENT;
      case 'non_payment':
        return IncidentType.NON_PAYMENT;
      case 'dispute':
        return IncidentType.DISPUTE;
      case 'communication':
        return IncidentType.COMMUNICATION;
      case 'scam_attempt':
        return IncidentType.SCAM_ATTEMPT;
      case 'legal_issue':
        return IncidentType.LEGAL_ISSUE;
      case 'other':
      default:
        return IncidentType.OTHER;
    }
  }

  /**
   * Convertit le type d'incident du format UI vers le format service
   * @private
   */
  private static uiToServiceIncidentType(uiType: IncidentType): string {
    return uiType;
  }

  /**
   * Crée un objet client à risque UI par défaut
   * @private
   */
  private static createDefaultUIData(): UIRiskClient {
    const now = new Date().toISOString();
    return {
      id: '',
      clientId: '',
      clientName: '',
      riskLevel: RiskLevel.NONE,
      incidents: [],
      notes: '',
      addedOn: now,
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      },
      isBeingTracked: false,
      isExpanded: false,
      createdAt: now,
      updatedAt: now,
      isEditing: false,
      validationErrors: {}
    };
  }

  /**
   * Crée un objet client à risque service par défaut
   * @private
   */
  private static createDefaultServiceData(): ServiceRiskClient {
    const now = new Date().toISOString();
    return {
      id: '',
      clientId: '',
      clientName: '',
      riskLevel: RiskLevel.NONE,
      incidents: [],
      notes: '',
      addedOn: now,
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      },
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Formate les statistiques des clients à risque pour l'UI
   */
  static formatRiskStats(
    clients: ServiceRiskClient[],
    incidents: ServiceClientIncident[]
  ): UIRiskStats {
    // Protection contre les données nulles ou undefined
    if (!clients) clients = [];
    if (!incidents) incidents = [];

    const stats: UIRiskStats = {
      totalClients: clients.length,
      totalIncidents: incidents.length,
      totalAmountAtRisk: incidents
        .filter(i => !i.resolved && i.amountInvolved)
        .reduce((sum, i) => sum + (i.amountInvolved || 0), 0),
      byRiskLevel: {
        [RiskLevel.NONE]: 0,
        [RiskLevel.LOW]: 0,
        [RiskLevel.MEDIUM]: 0,
        [RiskLevel.HIGH]: 0,
        [RiskLevel.BLACKLISTED]: 0
      },
      byIncidentType: {
        [IncidentType.PAYMENT_DELAY]: 0,
        [IncidentType.PARTIAL_PAYMENT]: 0,
        [IncidentType.NON_PAYMENT]: 0,
        [IncidentType.DISPUTE]: 0,
        [IncidentType.COMMUNICATION]: 0,
        [IncidentType.SCAM_ATTEMPT]: 0,
        [IncidentType.LEGAL_ISSUE]: 0,
        [IncidentType.OTHER]: 0
      },
      unresolvedIncidents: incidents.filter(i => !i.resolved).length
    };
    
    // Comptage par niveau de risque
    clients.forEach(client => {
      const riskLevel = RiskClientAdapter.serviceToUIRiskLevel(client.riskLevel);
      stats.byRiskLevel[riskLevel]++;
    });
    
    // Comptage par type d'incident
    incidents.forEach(incident => {
      const incidentType = RiskClientAdapter.serviceToUIIncidentType(incident.type);
      stats.byIncidentType[incidentType]++;
    });
    
    return stats;
  }
}

// Export par défaut pour usage simple
export default RiskClientAdapter;