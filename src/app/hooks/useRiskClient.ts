/**
 * useRiskClient - Hook standardisé pour la gestion des clients à risque
 * 
 * Ce hook facilite l'interaction avec les données des clients à risque
 * en utilisant les interfaces standardisées et l'adaptateur correspondant.
 * 
 * @version 1.0
 * @standardized true
 */

import { useState, useEffect, useCallback } from 'react';
import RiskClientService from '../services/riskClientService';
import RiskClientAdapter from '../adapters/RiskClientAdapter.standardized';
import { 
  UIRiskClient, 
  UIClientIncident, 
  UIRiskStats,
  UIRiskClientFilters,
  RiskLevel,
  IncidentType
} from '../interfaces/client-risk/client-risk';

interface UseRiskClientResult {
  // Données
  clients: UIRiskClient[];
  filteredClients: UIRiskClient[];
  selectedClient: UIRiskClient | null;
  stats: UIRiskStats;
  
  // État
  isLoading: boolean;
  error: string | null;
  
  // Filtres
  filters: UIRiskClientFilters;
  
  // Actions pour les clients
  loadClients: () => void;
  getClientById: (id: string) => UIRiskClient | null;
  getClientByClientId: (clientId: string) => UIRiskClient | null;
  isClientRisky: (clientId: string) => boolean;
  saveClient: (client: UIRiskClient) => Promise<UIRiskClient>;
  removeClient: (id: string) => Promise<boolean>;
  selectClient: (id: string) => void;
  updateClientNotes: (id: string, notes: string) => Promise<UIRiskClient>;
  updateClientRiskLevel: (id: string, riskLevel: RiskLevel) => Promise<UIRiskClient>;
  
  // Actions pour les incidents
  getAllIncidents: () => UIClientIncident[];
  getClientIncidents: (clientId: string) => UIClientIncident[];
  saveIncident: (incident: UIClientIncident) => Promise<UIClientIncident>;
  removeIncident: (id: string) => Promise<boolean>;
  markIncidentResolved: (id: string, resolutionNotes?: string) => Promise<UIClientIncident>;
  
  // Actions pour les filtres
  setFilters: (filters: Partial<UIRiskClientFilters>) => void;
  resetFilters: () => void;
}

/**
 * Valeurs par défaut pour les filtres
 */
const defaultFilters: UIRiskClientFilters = {
  riskLevels: Object.values(RiskLevel),
  incidentTypes: Object.values(IncidentType),
  unresolvedOnly: false,
  searchTerm: ''
};

/**
 * Hook pour gérer les clients à risque avec les interfaces standardisées
 */
export const useRiskClient = (): UseRiskClientResult => {
  // État
  const [clients, setClients] = useState<UIRiskClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<UIRiskClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<UIRiskClient | null>(null);
  const [incidents, setIncidents] = useState<UIClientIncident[]>([]);
  const [stats, setStats] = useState<UIRiskStats>({
    totalClients: 0,
    totalIncidents: 0,
    totalAmountAtRisk: 0,
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
    unresolvedIncidents: 0
  });
  
  const [filters, setFiltersState] = useState<UIRiskClientFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charger tous les clients à risque
   */
  const loadClients = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les données brutes
      const rawClients = RiskClientService.getAllRiskClients();
      const rawIncidents = RiskClientService.getAllIncidents();
      
      // Transformer en format UI
      const uiClients = rawClients.map(client => RiskClientAdapter.toUI(client));
      const uiIncidents = rawIncidents.map(incident => {
        const serviceIncident = {
          ...incident,
          createdAt: incident.date, // Simuler la propriété createdAt
          updatedAt: incident.resolved ? incident.resolutionDate || incident.date : incident.date
        };
        return RiskClientAdapter.incidentToUI(serviceIncident);
      });
      
      // Calculer les statistiques
      const uiStats = RiskClientAdapter.formatRiskStats(rawClients, rawIncidents);
      
      // Mettre à jour l'état
      setClients(uiClients);
      setIncidents(uiIncidents);
      setStats(uiStats);
      applyFilters(uiClients, filters);
    } catch (err) {
      setError('Erreur lors du chargement des clients à risque: ' + 
        (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  /**
   * Récupérer un client par son ID
   */
  const getClientById = useCallback((id: string): UIRiskClient | null => {
    const client = clients.find(c => c.id === id) || null;
    return client;
  }, [clients]);
  
  /**
   * Récupérer un client par l'ID du client
   */
  const getClientByClientId = useCallback((clientId: string): UIRiskClient | null => {
    const client = clients.find(c => c.clientId === clientId) || null;
    return client;
  }, [clients]);
  
  /**
   * Vérifier si un client est à risque
   */
  const isClientRisky = useCallback((clientId: string): boolean => {
    return clients.some(c => c.clientId === clientId);
  }, [clients]);
  
  /**
   * Sauvegarder un client
   */
  const saveClient = useCallback(async (client: UIRiskClient): Promise<UIRiskClient> => {
    setIsLoading(true);
    
    try {
      // Convertir en format service
      const serviceClient = RiskClientAdapter.toService(client);
      
      // Sauvegarder via le service
      const savedClient = RiskClientService.saveRiskClient(serviceClient);
      
      // Reconvertir en format UI
      const uiClient = RiskClientAdapter.toUI(savedClient);
      
      // Mettre à jour l'état local
      setClients(prev => {
        const index = prev.findIndex(c => c.id === uiClient.id);
        if (index >= 0) {
          return [...prev.slice(0, index), uiClient, ...prev.slice(index + 1)];
        } else {
          return [...prev, uiClient];
        }
      });
      
      // Recharger pour mettre à jour les statistiques
      loadClients();
      
      return uiClient;
    } catch (err) {
      setError('Erreur lors de la sauvegarde du client: ' +
        (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadClients]);
  
  /**
   * Supprimer un client
   */
  const removeClient = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Supprimer via le service
      const success = RiskClientService.removeRiskClient(id);
      
      if (success) {
        // Mettre à jour l'état local
        setClients(prev => prev.filter(c => c.id !== id));
        if (selectedClient?.id === id) {
          setSelectedClient(null);
        }
        
        // Recharger pour mettre à jour les statistiques
        loadClients();
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression du client: ' +
        (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadClients, selectedClient]);
  
  /**
   * Sélectionner un client
   */
  const selectClient = useCallback((id: string) => {
    const client = clients.find(c => c.id === id) || null;
    setSelectedClient(client);
  }, [clients]);
  
  /**
   * Mettre à jour les notes d'un client
   */
  const updateClientNotes = useCallback(async (id: string, notes: string): Promise<UIRiskClient> => {
    const client = getClientById(id);
    if (!client) {
      throw new Error(`Client avec ID ${id} non trouvé`);
    }
    
    const updatedClient: UIRiskClient = {
      ...client,
      notes,
      updatedAt: new Date().toISOString()
    };
    
    return saveClient(updatedClient);
  }, [getClientById, saveClient]);
  
  /**
   * Mettre à jour le niveau de risque d'un client
   */
  const updateClientRiskLevel = useCallback(async (id: string, riskLevel: RiskLevel): Promise<UIRiskClient> => {
    const client = getClientById(id);
    if (!client) {
      throw new Error(`Client avec ID ${id} non trouvé`);
    }
    
    const updatedClient: UIRiskClient = {
      ...client,
      riskLevel,
      updatedAt: new Date().toISOString()
    };
    
    return saveClient(updatedClient);
  }, [getClientById, saveClient]);
  
  /**
   * Récupérer tous les incidents
   */
  const getAllIncidents = useCallback((): UIClientIncident[] => {
    return incidents;
  }, [incidents]);
  
  /**
   * Récupérer les incidents d'un client spécifique
   */
  const getClientIncidents = useCallback((clientId: string): UIClientIncident[] => {
    return incidents.filter(incident => incident.clientId === clientId);
  }, [incidents]);
  
  /**
   * Sauvegarder un incident
   */
  const saveIncident = useCallback(async (incident: UIClientIncident): Promise<UIClientIncident> => {
    setIsLoading(true);
    
    try {
      // Convertir en format service
      const serviceIncident = {
        id: incident.id,
        clientId: incident.clientId,
        businessPlanId: incident.businessPlanId,
        documentId: incident.documentId,
        type: incident.type,
        description: incident.description,
        date: incident.date,
        amountInvolved: incident.amountInvolved,
        resolved: incident.resolved,
        resolutionDate: incident.resolutionDate,
        resolutionNotes: incident.resolutionNotes
      };
      
      // Sauvegarder via le service
      const savedIncident = RiskClientService.saveIncident(serviceIncident);
      
      // Reconvertir en format UI
      const uiIncident = {
        ...incident,
        id: savedIncident.id,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour l'état local
      setIncidents(prev => {
        const index = prev.findIndex(i => i.id === uiIncident.id);
        if (index >= 0) {
          return [...prev.slice(0, index), uiIncident, ...prev.slice(index + 1)];
        } else {
          return [...prev, uiIncident];
        }
      });
      
      // Recharger pour mettre à jour les statistiques et les clients
      loadClients();
      
      return uiIncident;
    } catch (err) {
      setError('Erreur lors de la sauvegarde de l\'incident: ' +
        (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadClients]);
  
  /**
   * Supprimer un incident
   */
  const removeIncident = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Supprimer via le service
      const success = RiskClientService.removeIncident(id);
      
      if (success) {
        // Mettre à jour l'état local
        setIncidents(prev => prev.filter(i => i.id !== id));
        
        // Recharger pour mettre à jour les statistiques et les clients
        loadClients();
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression de l\'incident: ' +
        (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadClients]);
  
  /**
   * Marquer un incident comme résolu
   */
  const markIncidentResolved = useCallback(async (
    id: string, 
    resolutionNotes?: string
  ): Promise<UIClientIncident> => {
    // Trouver l'incident
    const incident = incidents.find(i => i.id === id);
    if (!incident) {
      throw new Error(`Incident avec ID ${id} non trouvé`);
    }
    
    // Mettre à jour l'incident
    const updatedIncident: UIClientIncident = {
      ...incident,
      resolved: true,
      resolutionDate: new Date().toISOString(),
      resolutionNotes: resolutionNotes || incident.resolutionNotes,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder l'incident mis à jour
    return saveIncident(updatedIncident);
  }, [incidents, saveIncident]);
  
  /**
   * Appliquer les filtres aux clients
   */
  const applyFilters = useCallback((clientsList: UIRiskClient[], currentFilters: UIRiskClientFilters) => {
    // Filtrer les clients selon les critères
    let filtered = [...clientsList];
    
    // Filtrer par niveau de risque
    if (currentFilters.riskLevels.length > 0) {
      filtered = filtered.filter(client => 
        currentFilters.riskLevels.includes(client.riskLevel)
      );
    }
    
    // Filtrer par type d'incident
    if (currentFilters.incidentTypes.length > 0) {
      filtered = filtered.filter(client => 
        client.incidents.some(incident => 
          currentFilters.incidentTypes.includes(incident.type)
        )
      );
    }
    
    // Filtrer par montant
    if (currentFilters.minAmount !== undefined) {
      filtered = filtered.filter(client => 
        client.incidents.some(incident => 
          (incident.amountInvolved || 0) >= (currentFilters.minAmount || 0)
        )
      );
    }
    
    if (currentFilters.maxAmount !== undefined) {
      filtered = filtered.filter(client => 
        client.incidents.some(incident => 
          (incident.amountInvolved || 0) <= (currentFilters.maxAmount || Infinity)
        )
      );
    }
    
    // Filtrer par incidents non résolus
    if (currentFilters.unresolvedOnly) {
      filtered = filtered.filter(client => 
        client.incidents.some(incident => !incident.resolved)
      );
    }
    
    // Filtrer par terme de recherche
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.clientName.toLowerCase().includes(searchLower) ||
        client.notes.toLowerCase().includes(searchLower) ||
        client.contactInfo.email?.toLowerCase().includes(searchLower) ||
        client.contactInfo.phone?.toLowerCase().includes(searchLower) ||
        client.incidents.some(incident => 
          incident.description.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Filtrer par période
    if (currentFilters.period) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - currentFilters.period);
      const cutoffString = cutoffDate.toISOString();
      
      filtered = filtered.filter(client => 
        client.updatedAt >= cutoffString || 
        client.incidents.some(incident => incident.date >= cutoffString)
      );
    }
    
    // Mettre à jour l'état des clients filtrés
    setFilteredClients(filtered);
  }, []);
  
  /**
   * Mettre à jour les filtres
   */
  const setFilters = useCallback((newFilters: Partial<UIRiskClientFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      // Appliquer les nouveaux filtres
      applyFilters(clients, updated);
      return updated;
    });
  }, [clients, applyFilters]);
  
  /**
   * Réinitialiser les filtres
   */
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    applyFilters(clients, defaultFilters);
  }, [clients, applyFilters]);
  
  // Charger les données initiales
  useEffect(() => {
    loadClients();
  }, [loadClients]);
  
  // Appliquer les filtres quand les clients changent
  useEffect(() => {
    applyFilters(clients, filters);
  }, [clients, filters, applyFilters]);
  
  return {
    clients,
    filteredClients,
    selectedClient,
    stats,
    isLoading,
    error,
    filters,
    loadClients,
    getClientById,
    getClientByClientId,
    isClientRisky,
    saveClient,
    removeClient,
    selectClient,
    updateClientNotes,
    updateClientRiskLevel,
    getAllIncidents,
    getClientIncidents,
    saveIncident,
    removeIncident,
    markIncidentResolved,
    setFilters,
    resetFilters
  };
};

export default useRiskClient;