'use client';

import { v4 as uuidv4 } from 'uuid';
import { RiskClient, ClientIncident, RiskLevel, IncidentType, RiskStats } from '../interfaces/client-risk';

// Clés LocalStorage
const RISK_CLIENTS_KEY = 'devinde_risk_clients';
const INCIDENTS_KEY = 'devinde_client_incidents';

/**
 * Service de gestion des clients à risque
 */
export const RiskClientService = {
  /**
   * Récupère tous les clients à risque
   */
  getAllRiskClients: (): RiskClient[] => {
    if (typeof window === 'undefined') return [];
    
    const clientsJSON = localStorage.getItem(RISK_CLIENTS_KEY);
    if (!clientsJSON) return [];
    
    try {
      return JSON.parse(clientsJSON);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients à risque:', error);
      return [];
    }
  },
  
  /**
   * Récupère un client à risque par son ID
   */
  getRiskClientById: (id: string): RiskClient | null => {
    const clients = RiskClientService.getAllRiskClients();
    return clients.find(client => client.id === id) || null;
  },
  
  /**
   * Récupère un client à risque par l'ID du client
   */
  getRiskClientByClientId: (clientId: string): RiskClient | null => {
    const clients = RiskClientService.getAllRiskClients();
    return clients.find(client => client.clientId === clientId) || null;
  },
  
  /**
   * Vérifie si un client est à risque
   */
  isClientRisky: (clientId: string): boolean => {
    return RiskClientService.getRiskClientByClientId(clientId) !== null;
  },
  
  /**
   * Ajoute ou met à jour un client à risque
   */
  saveRiskClient: (riskClient: RiskClient): RiskClient => {
    const clients = RiskClientService.getAllRiskClients();
    const now = new Date().toISOString();
    
    // Si c'est un nouveau client à risque
    if (!riskClient.id) {
      riskClient.id = uuidv4();
      riskClient.addedOn = now;
      clients.push({
        ...riskClient,
        lastUpdated: now
      });
    } else {
      // Mise à jour d'un client existant
      const index = clients.findIndex(c => c.id === riskClient.id);
      if (index >= 0) {
        clients[index] = {
          ...riskClient,
          lastUpdated: now
        };
      } else {
        // Client non trouvé, on l'ajoute
        clients.push({
          ...riskClient,
          lastUpdated: now,
          addedOn: now
        });
      }
    }
    
    localStorage.setItem(RISK_CLIENTS_KEY, JSON.stringify(clients));
    return riskClient;
  },
  
  /**
   * Supprime un client de la liste des clients à risque
   */
  removeRiskClient: (id: string): boolean => {
    const clients = RiskClientService.getAllRiskClients();
    const filteredClients = clients.filter(client => client.id !== id);
    
    localStorage.setItem(RISK_CLIENTS_KEY, JSON.stringify(filteredClients));
    return filteredClients.length < clients.length;
  },
  
  /**
   * Récupère tous les incidents clients
   */
  getAllIncidents: (): ClientIncident[] => {
    if (typeof window === 'undefined') return [];
    
    const incidentsJSON = localStorage.getItem(INCIDENTS_KEY);
    if (!incidentsJSON) return [];
    
    try {
      return JSON.parse(incidentsJSON);
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents:', error);
      return [];
    }
  },
  
  /**
   * Récupère les incidents d'un client spécifique
   */
  getClientIncidents: (clientId: string): ClientIncident[] => {
    const incidents = RiskClientService.getAllIncidents();
    return incidents.filter(incident => incident.clientId === clientId);
  },
  
  /**
   * Ajoute ou met à jour un incident
   */
  saveIncident: (incident: ClientIncident): ClientIncident => {
    const incidents = RiskClientService.getAllIncidents();
    
    // Si c'est un nouvel incident
    if (!incident.id) {
      incident.id = uuidv4();
      incidents.push(incident);
    } else {
      // Mise à jour d'un incident existant
      const index = incidents.findIndex(i => i.id === incident.id);
      if (index >= 0) {
        incidents[index] = incident;
      } else {
        // Incident non trouvé, on l'ajoute
        incidents.push(incident);
      }
    }
    
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    
    // Mise à jour automatique du niveau de risque du client
    RiskClientService.updateClientRiskLevel(incident.clientId);
    
    return incident;
  },
  
  /**
   * Supprime un incident
   */
  removeIncident: (id: string): boolean => {
    const incidents = RiskClientService.getAllIncidents();
    const incidentToRemove = incidents.find(i => i.id === id);
    const filteredIncidents = incidents.filter(incident => incident.id !== id);
    
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(filteredIncidents));
    
    // Si on a trouvé et supprimé l'incident, mettre à jour le niveau de risque du client
    if (incidentToRemove) {
      RiskClientService.updateClientRiskLevel(incidentToRemove.clientId);
    }
    
    return filteredIncidents.length < incidents.length;
  },
  
  /**
   * Met à jour automatiquement le niveau de risque d'un client 
   * en fonction de ses incidents
   */
  updateClientRiskLevel: (clientId: string): void => {
    const riskClient = RiskClientService.getRiskClientByClientId(clientId);
    if (!riskClient) return;
    
    const incidents = RiskClientService.getClientIncidents(clientId);
    
    // Calcul du nouveau niveau de risque
    let newRiskLevel = RiskLevel.NONE;
    
    const nonPaymentCount = incidents.filter(i => 
      i.type === IncidentType.NON_PAYMENT && !i.resolved
    ).length;
    
    const partialPaymentCount = incidents.filter(i => 
      i.type === IncidentType.PARTIAL_PAYMENT && !i.resolved
    ).length;
    
    const delayCount = incidents.filter(i => 
      i.type === IncidentType.PAYMENT_DELAY && !i.resolved
    ).length;
    
    const scamAttemptCount = incidents.filter(i => 
      i.type === IncidentType.SCAM_ATTEMPT
    ).length;
    
    if (scamAttemptCount > 0) {
      newRiskLevel = RiskLevel.BLACKLISTED;
    } else if (nonPaymentCount >= 2) {
      newRiskLevel = RiskLevel.HIGH;
    } else if (nonPaymentCount === 1 || partialPaymentCount >= 2) {
      newRiskLevel = RiskLevel.MEDIUM;
    } else if (delayCount >= 2 || partialPaymentCount === 1) {
      newRiskLevel = RiskLevel.LOW;
    }
    
    // Mise à jour du niveau de risque
    riskClient.riskLevel = newRiskLevel;
    RiskClientService.saveRiskClient(riskClient);
  },
  
  /**
   * Calcule les statistiques générales des clients à risque
   */
  getRiskStats: (): RiskStats => {
    const clients = RiskClientService.getAllRiskClients();
    const incidents = RiskClientService.getAllIncidents();
    
    const stats: RiskStats = {
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
      stats.byRiskLevel[client.riskLevel]++;
    });
    
    // Comptage par type d'incident
    incidents.forEach(incident => {
      stats.byIncidentType[incident.type]++;
    });
    
    return stats;
  }
};

export default RiskClientService;
