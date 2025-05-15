import React, { useState, useEffect } from 'react';
import { TabNavigation } from '../../core/TabNavigation';
import { CardContainer } from '../../core/CardContainer';
import errorService from '../../../services/core/errorService';
import { ErrorBoundary } from '../../core/ErrorBoundary';

// Interfaces for business model data
interface BusinessModelData {
  id: string;
  businessPlanId: string;
  valueProposition: ValuePropositionItem[];
  customerSegments: CustomerSegmentItem[];
  revenueStreams: RevenueStreamItem[];
  keyActivities: KeyActivityItem[];
  keyResources: KeyResourceItem[];
  keyPartners: KeyPartnerItem[];
  customerRelationships: CustomerRelationshipItem[];
  channels: ChannelItem[];
  costStructure: CostStructureItem[];
}

interface ValuePropositionItem {
  id: string;
  name: string;
  description: string;
}

interface CustomerSegmentItem {
  id: string;
  name: string;
  description: string;
  size?: 'small' | 'medium' | 'large';
  priority?: 'low' | 'medium' | 'high';
}

interface RevenueStreamItem {
  id: string;
  name: string;
  type: 'recurring' | 'one-time';
  amount: number;
  unit: string;
  description: string;
}

interface KeyActivityItem {
  id: string;
  name: string;
  description: string;
}

interface KeyResourceItem {
  id: string;
  name: string;
  type: 'physical' | 'intellectual' | 'human' | 'financial';
  description: string;
}

interface KeyPartnerItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface CustomerRelationshipItem {
  id: string;
  name: string;
  description: string;
}

interface ChannelItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface CostStructureItem {
  id: string;
  name: string;
  type: 'fixed' | 'variable';
  amount: number;
  frequency: 'one-time' | 'monthly' | 'yearly';
  description: string;
}

interface BusinessModelTabsProps {
  businessPlanId: string;
  onSave?: (data: BusinessModelData) => void;
  readOnly?: boolean;
}

/**
 * BusinessModelTabs - A tabbed interface for editing business model sections
 * 
 * This component demonstrates how to use TabNavigation with business logic,
 * multiple content sections, and integration with other core components.
 */
export const BusinessModelTabs: React.FC<BusinessModelTabsProps> = ({
  businessPlanId,
  onSave,
  readOnly = false
}) => {
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample business model data (would come from a hook in real implementation)
  const [modelData, setModelData] = useState<BusinessModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data (simulated API call)
  useEffect(() => {
    const loadBusinessModel = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would be an API call using a service
        // Something like: const result = await businessModelService.getBusinessModel(businessPlanId);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data
        const sampleData: BusinessModelData = {
          id: 'bm-123456',
          businessPlanId,
          valueProposition: [
            { id: 'vp-1', name: 'Modern Web Solutions', description: 'High-quality, responsive websites and web applications' },
            { id: 'vp-2', name: 'Rapid Development', description: 'Faster time-to-market using modern frameworks and tools' }
          ],
          customerSegments: [
            { id: 'cs-1', name: 'SMBs', description: 'Small and medium businesses needing web presence', size: 'medium', priority: 'high' },
            { id: 'cs-2', name: 'Startups', description: 'Tech startups needing MVPs and product development', size: 'small', priority: 'medium' }
          ],
          revenueStreams: [
            { id: 'rs-1', name: 'Project Development', type: 'one-time', amount: 2500, unit: '€', description: 'One-time project fees' },
            { id: 'rs-2', name: 'Maintenance', type: 'recurring', amount: 500, unit: '€', description: 'Monthly maintenance fees' }
          ],
          keyActivities: [
            { id: 'ka-1', name: 'Web Development', description: 'Creating websites and web applications' },
            { id: 'ka-2', name: 'Client Consulting', description: 'Advising clients on technical solutions' }
          ],
          keyResources: [
            { id: 'kr-1', name: 'Technical Expertise', type: 'human', description: 'Knowledge of modern web frameworks' },
            { id: 'kr-2', name: 'Development Tools', type: 'physical', description: 'Software and hardware for development' }
          ],
          keyPartners: [
            { id: 'kp-1', name: 'Design Studios', type: 'service provider', description: 'Partners for UI/UX design' },
            { id: 'kp-2', name: 'Hosting Providers', type: 'service provider', description: 'Cloud hosting partners' }
          ],
          customerRelationships: [
            { id: 'cr-1', name: 'Personalized Support', description: 'Direct communication and support' }
          ],
          channels: [
            { id: 'ch-1', name: 'Website', type: 'digital', description: 'Company website showcasing services' },
            { id: 'ch-2', name: 'Referrals', type: 'personal', description: 'Word-of-mouth and client referrals' }
          ],
          costStructure: [
            { id: 'cs-1', name: 'Software Subscriptions', type: 'fixed', amount: 200, frequency: 'monthly', description: 'Monthly software costs' },
            { id: 'cs-2', name: 'Marketing', type: 'variable', amount: 300, frequency: 'monthly', description: 'Variable marketing expenses' }
          ]
        };
        
        setModelData(sampleData);
        setIsLoading(false);
      } catch (err) {
        errorService.handleError(err, {
          context: { businessPlanId, component: 'BusinessModelTabs' }
        });
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    loadBusinessModel();
  }, [businessPlanId]);

  // Custom save function (would use a service in real implementation)
  const handleSave = () => {
    if (modelData && onSave) {
      onSave(modelData);
    }
  };

  // Define tabs for the business model
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'canvas', label: 'Business Model Canvas' },
    { id: 'value-proposition', label: 'Proposition de Valeur', badge: modelData?.valueProposition.length || 0, badgeColor: 'blue' },
    { id: 'customers', label: 'Clients', badge: modelData?.customerSegments.length || 0, badgeColor: 'green' },
    { id: 'revenue', label: 'Revenus', badge: modelData?.revenueStreams.length || 0, badgeColor: 'purple' },
  ];

  // Render overview content
  const renderOverview = () => {
    if (!modelData) return null;
    
    // Calculate total monthly revenue
    const monthlyRevenue = modelData.revenueStreams.reduce((total, stream) => {
      if (stream.type === 'recurring') {
        return total + stream.amount;
      }
      // Convert one-time revenue to monthly equivalent (simple approximation)
      return total + (stream.amount / 12);
    }, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-400 text-sm">Sources de revenus</div>
            <div className="text-2xl font-bold mt-1">{modelData.revenueStreams.length}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-400 text-sm">Segments clients</div>
            <div className="text-2xl font-bold mt-1">{modelData.customerSegments.length}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-gray-400 text-sm">Revenu mensuel est.</div>
            <div className="text-2xl font-bold mt-1">{monthlyRevenue.toLocaleString('fr-FR')} €</div>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Proposition de valeur principale</h3>
          {modelData.valueProposition.length > 0 ? (
            <div className="space-y-2">
              {modelData.valueProposition.map(item => (
                <div key={item.id} className="bg-gray-800 p-3 rounded">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Aucune proposition de valeur définie</div>
          )}
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Répartition des revenus</h3>
          <div className="space-y-3">
            {modelData.revenueStreams.map(stream => (
              <div key={stream.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{stream.name}</div>
                  <div className="text-xs text-gray-400">
                    {stream.type === 'recurring' ? 'Récurrent' : 'Ponctuel'}
                  </div>
                </div>
                <div className="text-lg font-medium">
                  {stream.amount.toLocaleString('fr-FR')} {stream.unit}
                  <span className="text-xs text-gray-400 ml-1">
                    {stream.type === 'recurring' ? '/mois' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render canvas content
  const renderCanvas = () => {
    if (!modelData) return null;
    
    return (
      <div className="grid grid-cols-10 gap-2 h-[500px]">
        {/* Key Partners */}
        <div className="col-span-2 row-span-2 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Partenaires clés</h3>
          <div className="space-y-2">
            {modelData.keyPartners.map(partner => (
              <div key={partner.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{partner.name}</div>
                <div className="text-gray-400 mt-1">{partner.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key Activities */}
        <div className="col-span-2 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Activités clés</h3>
          <div className="space-y-2">
            {modelData.keyActivities.map(activity => (
              <div key={activity.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{activity.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Value Proposition */}
        <div className="col-span-2 row-span-2 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Proposition de valeur</h3>
          <div className="space-y-2">
            {modelData.valueProposition.map(item => (
              <div key={item.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-400 mt-1">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customer Relationships */}
        <div className="col-span-2 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Relations clients</h3>
          <div className="space-y-2">
            {modelData.customerRelationships.map(item => (
              <div key={item.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customer Segments */}
        <div className="col-span-2 row-span-2 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Segments clients</h3>
          <div className="space-y-2">
            {modelData.customerSegments.map(segment => (
              <div key={segment.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{segment.name}</div>
                <div className="text-gray-400 mt-1">{segment.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key Resources */}
        <div className="col-span-2 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Ressources clés</h3>
          <div className="space-y-2">
            {modelData.keyResources.map(resource => (
              <div key={resource.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{resource.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Channels */}
        <div className="col-span-2 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Canaux</h3>
          <div className="space-y-2">
            {modelData.channels.map(channel => (
              <div key={channel.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{channel.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cost Structure */}
        <div className="col-span-5 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Structure de coûts</h3>
          <div className="grid grid-cols-2 gap-2">
            {modelData.costStructure.map(cost => (
              <div key={cost.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{cost.name}</div>
                <div className="text-gray-400 mt-1">
                  {cost.amount.toLocaleString('fr-FR')} €
                  {cost.frequency === 'monthly' && '/mois'}
                  {cost.frequency === 'yearly' && '/an'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Revenue Streams */}
        <div className="col-span-5 row-span-1 bg-gray-700 p-3 rounded overflow-auto">
          <h3 className="font-medium text-sm mb-2">Sources de revenus</h3>
          <div className="grid grid-cols-2 gap-2">
            {modelData.revenueStreams.map(stream => (
              <div key={stream.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="font-medium">{stream.name}</div>
                <div className="text-gray-400 mt-1">
                  {stream.amount.toLocaleString('fr-FR')} {stream.unit}
                  {stream.type === 'recurring' && '/mois'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render value proposition content
  const renderValueProposition = () => {
    if (!modelData) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Propositions de Valeur</h3>
          {!readOnly && (
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Ajouter une proposition
            </button>
          )}
        </div>
        
        {modelData.valueProposition.length > 0 ? (
          <div className="space-y-3">
            {modelData.valueProposition.map(item => (
              <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.name}</h4>
                  {!readOnly && (
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 p-6 text-center rounded-lg">
            <p className="text-gray-400">
              Aucune proposition de valeur définie.
              {!readOnly && " Cliquez sur \"Ajouter une proposition\" pour commencer."}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render customer segments content
  const renderCustomerSegments = () => {
    if (!modelData) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Segments de Clientèle</h3>
          {!readOnly && (
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Ajouter un segment
            </button>
          )}
        </div>
        
        {modelData.customerSegments.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {modelData.customerSegments.map(segment => (
              <div key={segment.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between">
                  <h4 className="font-medium">{segment.name}</h4>
                  {!readOnly && (
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mt-2">{segment.description}</p>
                <div className="flex space-x-3 mt-3">
                  {segment.size && (
                    <div className="bg-gray-800 px-2 py-1 rounded text-xs">
                      Taille: {segment.size === 'small' ? 'Petite' : segment.size === 'medium' ? 'Moyenne' : 'Grande'}
                    </div>
                  )}
                  {segment.priority && (
                    <div className={`px-2 py-1 rounded text-xs ${
                      segment.priority === 'high' ? 'bg-green-900 text-green-400' :
                      segment.priority === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      Priorité: {segment.priority === 'high' ? 'Haute' : segment.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 p-6 text-center rounded-lg">
            <p className="text-gray-400">
              Aucun segment de clientèle défini.
              {!readOnly && " Cliquez sur \"Ajouter un segment\" pour commencer."}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render revenue streams content
  const renderRevenueStreams = () => {
    if (!modelData) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Sources de Revenus</h3>
          {!readOnly && (
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Ajouter une source
            </button>
          )}
        </div>
        
        {modelData.revenueStreams.length > 0 ? (
          <div className="space-y-3">
            {modelData.revenueStreams.map(stream => (
              <div key={stream.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between">
                  <h4 className="font-medium">{stream.name}</h4>
                  {!readOnly && (
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-400">{stream.description}</div>
                  <div className="font-medium text-lg">
                    {stream.amount.toLocaleString('fr-FR')} {stream.unit}
                    <span className="text-sm text-gray-400 ml-1">
                      {stream.type === 'recurring' ? '/mois' : ''}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    stream.type === 'recurring' ? 'bg-green-900 text-green-400' : 
                    'bg-blue-900 text-blue-400'
                  }`}>
                    {stream.type === 'recurring' ? 'Récurrent' : 'Ponctuel'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 p-6 text-center rounded-lg">
            <p className="text-gray-400">
              Aucune source de revenus définie.
              {!readOnly && " Cliquez sur \"Ajouter une source\" pour commencer."}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'canvas':
        return renderCanvas();
      case 'value-proposition':
        return renderValueProposition();
      case 'customers':
        return renderCustomerSegments();
      case 'revenue':
        return renderRevenueStreams();
      default:
        return <div>Contenu non disponible</div>;
    }
  };

  return (
    <ErrorBoundary>
      <CardContainer
        title="Modèle Économique"
        actions={!readOnly && (
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
            onClick={handleSave}
          >
            Enregistrer
          </button>
        )}
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

export default BusinessModelTabs;