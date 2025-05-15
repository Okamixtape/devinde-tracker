'use client';

import { v4 as uuidv4 } from 'uuid';
import { RiskClient, ClientIncident, RiskLevel, IncidentType, RiskStats } from '../interfaces/client-risk';
import { IRiskClientService } from './interfaces/service-interfaces';

// LocalStorage keys
const RISK_CLIENTS_KEY = 'devinde_risk_clients';
const INCIDENTS_KEY = 'devinde_client_incidents';

/**
 * Implementation of the Risk Client Service
 * Provides methods to manage risk clients and their incidents
 */
class RiskClientServiceImpl implements IRiskClientService {
  /**
   * Retrieves all risk clients
   * @returns Array of all risk clients
   */
  getAllRiskClients(): RiskClient[] {
    if (typeof window === 'undefined') return [];
    
    const clientsJSON = localStorage.getItem(RISK_CLIENTS_KEY);
    if (!clientsJSON) return [];
    
    try {
      return JSON.parse(clientsJSON);
    } catch (error) {
      console.error('Error retrieving risk clients:', error);
      return [];
    }
  }
  
  /**
   * Retrieves a risk client by their ID
   * @param id The ID of the risk client to retrieve
   * @returns The risk client or null if not found
   */
  getRiskClientById(id: string): RiskClient | null {
    const clients = this.getAllRiskClients();
    return clients.find(client => client.id === id) || null;
  }
  
  /**
   * Retrieves a risk client by the client ID
   * @param clientId The client ID to search for
   * @returns The risk client or null if not found
   */
  getRiskClientByClientId(clientId: string): RiskClient | null {
    const clients = this.getAllRiskClients();
    return clients.find(client => client.clientId === clientId) || null;
  }
  
  /**
   * Checks if a client is risky
   * @param clientId The client ID to check
   * @returns True if the client is risky, false otherwise
   */
  isClientRisky(clientId: string): boolean {
    return this.getRiskClientByClientId(clientId) !== null;
  }
  
  /**
   * Saves a risk client (creates new or updates existing)
   * @param client The risk client to save
   * @returns The saved risk client
   */
  saveRiskClient(riskClient: RiskClient): RiskClient {
    const clients = this.getAllRiskClients();
    const now = new Date().toISOString();
    
    // If it's a new risk client
    if (!riskClient.id) {
      riskClient.id = uuidv4();
      riskClient.addedOn = now;
      clients.push({
        ...riskClient,
        lastUpdated: now
      });
    } else {
      // Update existing client
      const index = clients.findIndex(c => c.id === riskClient.id);
      if (index >= 0) {
        clients[index] = {
          ...riskClient,
          lastUpdated: now
        };
      } else {
        // Client not found, add it
        clients.push({
          ...riskClient,
          lastUpdated: now,
          addedOn: now
        });
      }
    }
    
    localStorage.setItem(RISK_CLIENTS_KEY, JSON.stringify(clients));
    return riskClient;
  }
  
  /**
   * Removes a risk client by their ID
   * @param id The ID of the risk client to remove
   * @returns True if removal was successful, false otherwise
   */
  removeRiskClient(id: string): boolean {
    const clients = this.getAllRiskClients();
    const filteredClients = clients.filter(client => client.id !== id);
    
    localStorage.setItem(RISK_CLIENTS_KEY, JSON.stringify(filteredClients));
    return filteredClients.length < clients.length;
  }
  
  /**
   * Retrieves all client incidents
   * @returns Array of all client incidents
   */
  getAllIncidents(): ClientIncident[] {
    if (typeof window === 'undefined') return [];
    
    const incidentsJSON = localStorage.getItem(INCIDENTS_KEY);
    if (!incidentsJSON) return [];
    
    try {
      return JSON.parse(incidentsJSON);
    } catch (error) {
      console.error('Error retrieving incidents:', error);
      return [];
    }
  }
  
  /**
   * Retrieves incidents for a specific client
   * @param clientId The client ID to retrieve incidents for
   * @returns Array of client incidents
   */
  getClientIncidents(clientId: string): ClientIncident[] {
    const incidents = this.getAllIncidents();
    return incidents.filter(incident => incident.clientId === clientId);
  }
  
  /**
   * Adds an incident to a risk client
   * @param clientId The ID of the risk client
   * @param incident The incident to add
   * @returns The updated risk client or null if client not found
   */
  addIncident(clientId: string, incident: ClientIncident): RiskClient | null {
    // Ensure incident has a client ID
    incident.clientId = clientId;
    
    // Save the incident
    this.saveIncident(incident);
    
    // Return the updated client
    return this.getRiskClientByClientId(clientId);
  }
  
  /**
   * Saves an incident (creates new or updates existing)
   * @param incident The incident to save
   * @returns The saved incident
   */
  saveIncident(incident: ClientIncident): ClientIncident {
    const incidents = this.getAllIncidents();
    
    // If it's a new incident
    if (!incident.id) {
      incident.id = uuidv4();
      incidents.push(incident);
    } else {
      // Update existing incident
      const index = incidents.findIndex(i => i.id === incident.id);
      if (index >= 0) {
        incidents[index] = incident;
      } else {
        // Incident not found, add it
        incidents.push(incident);
      }
    }
    
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    
    // Automatically update the client's risk level
    this.updateClientRiskLevel(incident.clientId);
    
    return incident;
  }
  
  /**
   * Removes an incident
   * @param id The ID of the incident to remove
   * @returns True if removal was successful, false otherwise
   */
  removeIncident(id: string): boolean {
    const incidents = this.getAllIncidents();
    const incidentToRemove = incidents.find(i => i.id === id);
    const filteredIncidents = incidents.filter(incident => incident.id !== id);
    
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(filteredIncidents));
    
    // If we found and removed the incident, update the client's risk level
    if (incidentToRemove) {
      this.updateClientRiskLevel(incidentToRemove.clientId);
    }
    
    return filteredIncidents.length < incidents.length;
  }
  
  /**
   * Automatically updates a client's risk level based on their incidents
   * @param clientId The client ID to update
   */
  updateClientRiskLevel(clientId: string): void {
    const riskClient = this.getRiskClientByClientId(clientId);
    if (!riskClient) return;
    
    const incidents = this.getClientIncidents(clientId);
    
    // Calculate new risk level
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
    
    // Update risk level
    riskClient.riskLevel = newRiskLevel;
    this.saveRiskClient(riskClient);
  }
  
  /**
   * Updates the risk level of a client
   * @param clientId The ID of the risk client
   * @param riskLevel The new risk level
   * @returns The updated risk client or null if client not found
   */
  updateRiskLevel(clientId: string, riskLevel: RiskLevel): RiskClient | null {
    const riskClient = this.getRiskClientByClientId(clientId);
    if (!riskClient) return null;
    
    riskClient.riskLevel = riskLevel;
    this.saveRiskClient(riskClient);
    
    return riskClient;
  }
  
  /**
   * Gets risk statistics across all clients
   * @returns Statistics about risk clients
   */
  getRiskStats(): RiskStats {
    const clients = this.getAllRiskClients();
    const incidents = this.getAllIncidents();
    
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
    
    // Count by risk level
    clients.forEach(client => {
      stats.byRiskLevel[client.riskLevel]++;
    });
    
    // Count by incident type
    incidents.forEach(incident => {
      stats.byIncidentType[incident.type]++;
    });
    
    return stats;
  }
}

// Create singleton instance
export const RiskClientService = new RiskClientServiceImpl();

// Export both the service instance and the implementation class
export { RiskClientServiceImpl };

export default RiskClientService;