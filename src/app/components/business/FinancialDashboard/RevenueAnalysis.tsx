import React, { useState, useEffect } from 'react';
import { DataVisualization } from '../../core/DataVisualization';
import { CardContainer } from '../../core/CardContainer';
import { TabNavigation } from '../../core/TabNavigation';
import errorService from '../../../services/core/errorService';
import { ErrorBoundary } from '../../core/ErrorBoundary';
import { chartColors } from '../../core/DataVisualization';

// Destructurer les composants de visualisation pour plus de clarté
const { BarChart, PieChart, MetricCard, ProgressBar } = DataVisualization;

// Types pour les données financières
interface RevenueData {
  totalRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  revenueGoal: number;
  revenueByPeriod: {
    period: string;
    current: number;
    previous: number;
  }[];
  revenueByService: {
    service: string;
    amount: number;
    percentage: number;
  }[];
  revenueByClient: {
    client: string;
    amount: number;
    percentage: number;
  }[];
}

interface RevenueAnalysisProps {
  businessPlanId: string;
  period?: 'month' | 'quarter' | 'year';
  onRefresh?: () => void;
}

/**
 * RevenueAnalysis - Composant d'analyse des revenus pour le tableau de bord financier
 * 
 * Ce composant démontre l'utilisation des composants DataVisualization et TabNavigation
 * pour créer une interface d'analyse financière interactive.
 */
export const RevenueAnalysis: React.FC<RevenueAnalysisProps> = ({
  businessPlanId,
  period = 'month',
  onRefresh
}) => {
  // États pour gérer les données et l'interface
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fonction simulée pour charger les données de revenus
  useEffect(() => {
    const loadRevenueData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // En production, ceci serait un appel API réel
        // await financialService.getRevenueData(businessPlanId, period);
        
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Données simulées
        const mockData: RevenueData = {
          totalRevenue: 8500,
          previousRevenue: 7200,
          revenueChange: 18.05,
          revenueGoal: 10000,
          revenueByPeriod: [
            { period: 'Jan', current: 6200, previous: 5000 },
            { period: 'Feb', current: 7100, previous: 5500 },
            { period: 'Mar', current: 7800, previous: 6300 },
            { period: 'Apr', current: 8500, previous: 7200 },
          ],
          revenueByService: [
            { service: 'Développement Web', amount: 3825, percentage: 45 },
            { service: 'Applications Mobile', amount: 2125, percentage: 25 },
            { service: 'Maintenance', amount: 1700, percentage: 20 },
            { service: 'Conseil', amount: 850, percentage: 10 },
          ],
          revenueByClient: [
            { client: 'TechStartup SAS', amount: 2550, percentage: 30 },
            { client: 'Commerce Plus', amount: 1700, percentage: 20 },
            { client: 'Agence Digitale', amount: 1275, percentage: 15 },
            { client: 'Cabinet Conseil', amount: 1020, percentage: 12 },
            { client: 'Autres clients', amount: 1955, percentage: 23 },
          ]
        };
        
        setRevenueData(mockData);
        setIsLoading(false);
      } catch (err) {
        errorService.handleError(err, {
          context: { component: 'RevenueAnalysis', businessPlanId, period }
        });
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    loadRevenueData();
  }, [businessPlanId, period]);

  // Préparer les données pour les graphiques
  const prepareBarChartData = () => {
    if (!revenueData) return [];
    
    return revenueData.revenueByPeriod.map(item => ({
      label: item.period,
      value: item.current,
      secondaryValue: item.previous,
      secondaryLabel: 'Période précédente'
    }));
  };
  
  const preparePieChartData = (dataType: 'service' | 'client') => {
    if (!revenueData) return [];
    
    const sourceData = dataType === 'service' 
      ? revenueData.revenueByService 
      : revenueData.revenueByClient;
    
    // Correspondance des couleurs pour les services
    const serviceColors: Record<string, string> = {
      'Développement Web': chartColors.blue,
      'Applications Mobile': chartColors.green,
      'Maintenance': chartColors.purple,
      'Conseil': chartColors.yellow,
    };
    
    return sourceData.map((item, index) => ({
      label: dataType === 'service' ? item.service : item.client,
      value: item.amount,
      percentage: item.percentage,
      // Utiliser les couleurs prédéfinies pour les services, sinon des couleurs par défaut
      color: dataType === 'service' 
        ? serviceColors[item.service] || chartColors.gray
        : Object.values(chartColors)[index % Object.values(chartColors).length]
    }));
  };
  
  // Préparer les métriques
  const prepareMetricData = () => {
    if (!revenueData) return null;
    
    return {
      title: 'Revenu Mensuel',
      value: revenueData.totalRevenue,
      unit: '€',
      change: {
        value: revenueData.revenueChange,
        percentage: true,
        direction: revenueData.revenueChange >= 0 ? 'up' : 'down',
        label: 'vs période précédente'
      },
      status: revenueData.revenueChange >= 0 ? 'positive' : 'negative'
    };
  };

  // Définir les onglets pour la navigation
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'by-service', label: 'Par Service' },
    { id: 'by-client', label: 'Par Client' },
    { id: 'trends', label: 'Tendances' },
  ];

  // Formateur pour les valeurs monétaires
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Rendre le contenu en fonction de l'onglet actif
  const renderContent = () => {
    if (!revenueData) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                data={prepareMetricData() || {
                  title: 'Revenu Mensuel',
                  value: 0,
                  unit: '€'
                }}
                formatValue={formatCurrency}
              />
              
              <MetricCard
                data={{
                  title: 'Objectif Atteint',
                  value: Math.round((revenueData.totalRevenue / revenueData.revenueGoal) * 100),
                  unit: '%',
                  description: `Objectif: ${formatCurrency(revenueData.revenueGoal)}`
                }}
              />
            </div>
            
            {/* Graphique d'évolution */}
            <BarChart
              title="Évolution des Revenus"
              description="Comparaison période actuelle vs précédente"
              data={prepareBarChartData()}
              showComparison={true}
              height={250}
              formatValue={formatCurrency}
            />
            
            {/* Progression vers l'objectif */}
            <ProgressBar
              title="Progression vers l'Objectif"
              description={`Objectif: ${formatCurrency(revenueData.revenueGoal)}`}
              value={Math.min(100, Math.round((revenueData.totalRevenue / revenueData.revenueGoal) * 100))}
              target={83} // Cible de progression (par exemple 83% de l'objectif pour être sur la bonne voie)
              color={revenueData.totalRevenue >= revenueData.revenueGoal * 0.8 ? 'green' : 'blue'}
            />
            
            {/* Répartition des revenus */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Top Services</h3>
                <div className="space-y-2">
                  {revenueData.revenueByService.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${Object.values(chartColors)[index]} mr-2`}></div>
                        <span className="text-sm">{service.service}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(service.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Top Clients</h3>
                <div className="space-y-2">
                  {revenueData.revenueByClient.slice(0, 3).map((client, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${Object.values(chartColors)[index]} mr-2`}></div>
                        <span className="text-sm">{client.client}</span>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(client.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'by-service':
        return (
          <div className="space-y-6">
            <PieChart
              title="Répartition des Revenus par Service"
              description={`Total: ${formatCurrency(revenueData.totalRevenue)}`}
              data={preparePieChartData('service')}
              height={300}
              donut={true}
              showDataLabels={true}
            />
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Détail par Service</h3>
              <div className="space-y-3">
                {revenueData.revenueByService.map((service, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${Object.values(chartColors)[index]} mr-2`}></div>
                        <span className="font-medium">{service.service}</span>
                      </div>
                      <div className="font-medium">{formatCurrency(service.amount)}</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Part du revenu total</span>
                        <span>{service.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${service.percentage}%`, backgroundColor: Object.values(chartColors)[index] }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'by-client':
        return (
          <div className="space-y-6">
            <PieChart
              title="Répartition des Revenus par Client"
              description={`Total: ${formatCurrency(revenueData.totalRevenue)}`}
              data={preparePieChartData('client')}
              height={300}
            />
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Détail par Client</h3>
              <div className="space-y-3">
                {revenueData.revenueByClient.map((client, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${Object.values(chartColors)[index % Object.values(chartColors).length]} mr-2`}></div>
                        <span className="font-medium">{client.client}</span>
                      </div>
                      <div className="font-medium">{formatCurrency(client.amount)}</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Part du revenu total</span>
                        <span>{client.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ 
                            width: `${client.percentage}%`, 
                            backgroundColor: Object.values(chartColors)[index % Object.values(chartColors).length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'trends':
        return (
          <div className="space-y-6">
            <BarChart
              title="Évolution des Revenus"
              description="Tendance sur les 4 derniers mois"
              data={prepareBarChartData()}
              height={250}
              formatValue={formatCurrency}
            />
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Analyse des Tendances</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 border border-blue-700 border-opacity-30 p-3 rounded-lg">
                  <div className="flex">
                    <div className="p-2 bg-blue-700 bg-opacity-30 rounded-full mr-3">
                      <TrendingUp size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Croissance Globale</h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Les revenus ont augmenté de {revenueData.revenueChange.toFixed(1)}% par rapport à la période précédente, 
                        indiquant une tendance positive stable.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900 bg-opacity-30 border border-green-700 border-opacity-30 p-3 rounded-lg">
                  <div className="flex">
                    <div className="p-2 bg-green-700 bg-opacity-30 rounded-full mr-3">
                      <BarChart size={16} className="text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Performance par Service</h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Le service "{revenueData.revenueByService[0].service}" représente la 
                        plus grande partie des revenus ({revenueData.revenueByService[0].percentage}%).
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-900 bg-opacity-30 border border-purple-700 border-opacity-30 p-3 rounded-lg">
                  <div className="flex">
                    <div className="p-2 bg-purple-700 bg-opacity-30 rounded-full mr-3">
                      <Users size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Concentration Clients</h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Les 3 principaux clients représentent {
                          revenueData.revenueByClient.slice(0, 3).reduce((sum, client) => sum + client.percentage, 0)
                        }% du revenu total. {
                          revenueData.revenueByClient.slice(0, 3).reduce((sum, client) => sum + client.percentage, 0) > 60
                            ? 'Une diversification pourrait réduire les risques.'
                            : 'La diversification client est bonne.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Contenu non disponible</div>;
    }
  };

  return (
    <ErrorBoundary>
      <CardContainer
        title="Analyse des Revenus"
        actions={
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
            onClick={onRefresh}
          >
            Actualiser
          </button>
        }
        isLoading={isLoading}
        error={error}
        onRetry={() => setIsLoading(true)}
      >
        <div className="space-y-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            errorService={errorService}
          />
          
          <div className="pt-4">
            {renderContent()}
          </div>
        </div>
      </CardContainer>
    </ErrorBoundary>
  );
};

export default RevenueAnalysis;