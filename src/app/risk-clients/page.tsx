'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiskClientService } from '../services/riskClientService';
import { RiskClient, RiskLevel, IncidentType } from '../interfaces/client-risk';
import PageHeader from '../components/common/PageHeader';

export default function RiskClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<RiskClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all');
  
  // Chargement des clients à risque
  useEffect(() => {
    const loadClients = () => {
      setLoading(true);
      const allClients = RiskClientService.getAllRiskClients();
      setClients(allClients);
      setLoading(false);
    };
    
    loadClients();
  }, []);
  
  // Filtrage des clients par niveau de risque
  const filteredClients = filterLevel === 'all' 
    ? clients 
    : clients.filter(client => client.riskLevel === filterLevel);
  
  // Naviguer vers la page de détail d'un client
  const handleViewClient = (id: string) => {
    router.push(`/risk-clients/${id}`);
  };
  
  // Naviguer vers la page d'ajout d'un client
  const handleAddClient = () => {
    router.push('/risk-clients/new');
  };
  
  // Fonction pour traduire le niveau de risque
  const getRiskLevelLabel = (level: RiskLevel): string => {
    const labels: Record<RiskLevel, string> = {
      [RiskLevel.NONE]: 'Aucun',
      [RiskLevel.LOW]: 'Faible',
      [RiskLevel.MEDIUM]: 'Modéré',
      [RiskLevel.HIGH]: 'Élevé',
      [RiskLevel.BLACKLISTED]: 'Liste noire'
    };
    return labels[level] || level;
  };
  
  // Fonction pour obtenir la couleur du niveau de risque
  const getRiskLevelColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      [RiskLevel.NONE]: 'bg-gray-100 text-gray-800',
      [RiskLevel.LOW]: 'bg-blue-100 text-blue-800',
      [RiskLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800',
      [RiskLevel.BLACKLISTED]: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };
  
  // Obtenir les statistiques globales
  const stats = RiskClientService.getRiskStats();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Clients à risque" 
        description="Suivez et gérez vos clients à risque et les incidents de paiement"
      />
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clients à risque</h3>
          <p className="text-2xl font-semibold">{stats.totalClients}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Incidents total</h3>
          <p className="text-2xl font-semibold">{stats.totalIncidents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Incidents non résolus</h3>
          <p className="text-2xl font-semibold">{stats.unresolvedIncidents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant à risque</h3>
          <p className="text-2xl font-semibold">{stats.totalAmountAtRisk.toLocaleString('fr-FR')} €</p>
        </div>
      </div>
      
      {/* Filtres et actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <div className="flex items-center space-x-4">
          <label htmlFor="risk-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrer par niveau :
          </label>
          <select 
            id="risk-filter"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as RiskLevel | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">Tous les niveaux</option>
            <option value={RiskLevel.LOW}>Risque faible</option>
            <option value={RiskLevel.MEDIUM}>Risque modéré</option>
            <option value={RiskLevel.HIGH}>Risque élevé</option>
            <option value={RiskLevel.BLACKLISTED}>Liste noire</option>
          </select>
        </div>
        <button
          onClick={handleAddClient}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Ajouter un client à risque
        </button>
      </div>
      
      {/* Liste des clients */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse text-center">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Aucun client à risque trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filterLevel === 'all' 
                ? "Vous n&apos;avez pas encore ajouté de clients à votre liste de surveillance." 
                : "Aucun client ne correspond à ce niveau de risque."}
            </p>
            <button
              onClick={handleAddClient}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Ajouter un client
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Niveau de risque
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Incidents
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière mise à jour
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleViewClient(client.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.clientName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.contactInfo.email || 'Aucun email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(client.riskLevel)}`}>
                      {getRiskLevelLabel(client.riskLevel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {client.incidents.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(client.lastUpdated).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClient(client.id);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
