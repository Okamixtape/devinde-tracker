import React, { useState } from 'react';
import { ArrowRight, Edit, Plus, Save, Trash, Users, Briefcase, DollarSign, TrendingUp, Target, ShoppingBag } from 'lucide-react';

const BusinessModelCanvas = () => {
  const [activeTab, setActiveTab] = useState('vue-ensemble');
  const [sliderValues, setSliderValues] = useState({
    hoursPerWeek: 20,
    newClientsPerMonth: 2,
    hourlyRate: 45,
    packageRate: 1500,
    subscriptionRate: 400
  });
  
  // Données pour les revenus simulés
  const projectedMonthlyRevenue = 
    (sliderValues.hoursPerWeek * 4 * sliderValues.hourlyRate * 0.3) + 
    (sliderValues.newClientsPerMonth * sliderValues.packageRate * 0.5) +
    (sliderValues.newClientsPerMonth * 0.5 * sliderValues.subscriptionRate);
    
  const projectedAnnualRevenue = projectedMonthlyRevenue * 12;
  
  // Données du Business Model Canvas
  const [canvasData, setCanvasData] = useState({
    partners: [
      { id: 1, name: "Agences Web", description: "Collaboration pour projets communs" },
      { id: 2, name: "Designers Freelance", description: "Fourniture de maquettes UX/UI" }
    ],
    activities: [
      { id: 1, name: "Développement Frontend", description: "Sites et applications React/Next.js" },
      { id: 2, name: "Maintenance", description: "Support technique et évolutions" }
    ],
    resources: [
      { id: 1, name: "Expertise technique", description: "React, Next.js, TypeScript" },
      { id: 2, name: "Outils IA", description: "Assistance au développement" }
    ],
    valueProposition: [
      { id: 1, name: "Solutions web élégantes", description: "Sites performants et esthétiques" },
      { id: 2, name: "Développement agile", description: "Adaptation rapide aux besoins" }
    ],
    customerRelations: [
      { id: 1, name: "Suivi personnalisé", description: "Point hebdomadaire avec les clients" }
    ],
    channels: [
      { id: 1, name: "LinkedIn", description: "Présence et réseautage professionnel" },
      { id: 2, name: "Bouche à oreille", description: "Recommandations clients" }
    ],
    customerSegments: [
      { id: 1, name: "PME", description: "Besoin de présence web professionnelle" },
      { id: 2, name: "Startups", description: "Applications web innovantes" }
    ],
    costStructure: [
      { id: 1, name: "Équipement informatique", description: "1500€ initial, renouvellement tous les 3 ans" },
      { id: 2, name: "Logiciels/SaaS", description: "100€/mois pour les outils professionnels" }
    ],
    revenueStreams: [
      { id: 1, name: "Facturation horaire", description: "35-55€/h selon prestations" },
      { id: 2, name: "Forfaits projets", description: "1200-5000€ selon complexité" },
      { id: 3, name: "Abonnements maintenance", description: "400-1500€/mois" }
    ],
  });

  const handleSliderChange = (event) => {
    setSliderValues({
      ...sliderValues,
      [event.target.name]: parseInt(event.target.value)
    });
  };
  
  const addCanvasItem = (category) => {
    // Logique pour ajouter un élément au canvas
    console.log(`Ajout d'un élément à ${category}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modèle Économique</h1>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center">
            <Save size={16} className="mr-2" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('vue-ensemble')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vue-ensemble' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'canvas' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Business Model Canvas
          </button>
          <button
            onClick={() => setActiveTab('tarification')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tarification' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Impact de Tarification
          </button>
        </nav>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'vue-ensemble' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-green-500" />
              Aperçu du Modèle Économique
            </h2>
            <p className="text-gray-300 mb-4">
              Votre modèle économique est basé sur trois sources de revenus principales,
              avec une approche équilibrée entre projets ponctuels et revenus récurrents.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-blue-400 text-xl font-bold">35-55€</div>
                <div className="text-sm mt-1">Taux Horaire</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-blue-400 text-xl font-bold">1.2-5K€</div>
                <div className="text-sm mt-1">Forfaits</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-blue-400 text-xl font-bold">400-1.5K€</div>
                <div className="text-sm mt-1">Abonnements</div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Répartition des revenus</h3>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '30%' }}></div>
                <div className="bg-green-500 h-full" style={{ width: '50%' }}></div>
                <div className="bg-purple-500 h-full" style={{ width: '20%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mr-1"></div>
                  <span>Taux horaires (30%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Forfaits (50%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                  <span>Abonnements (20%)</span>
                </div>
              </div>
            </div>
            <button className="mt-6 text-blue-400 hover:text-blue-300 flex items-center text-sm">
              <span>Modifier les sources de revenus</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Target size={20} className="mr-2 text-blue-500" />
              Segments de Clientèle Cibles
            </h2>
            <div className="space-y-4">
              {canvasData.customerSegments.map(segment => (
                <div key={segment.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{segment.name}</h3>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400">
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{segment.description}</p>
                </div>
              ))}
              <button 
                className="w-full p-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-400 flex items-center justify-center"
                onClick={() => addCanvasItem('customerSegments')}
              >
                <Plus size={16} className="mr-2" />
                <span>Ajouter un segment</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Briefcase size={20} className="mr-2 text-yellow-500" />
              Proposition de Valeur
            </h2>
            <div className="space-y-4">
              {canvasData.valueProposition.map(item => (
                <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-blue-400">
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-400">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
              ))}
              <button 
                className="w-full p-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-400 flex items-center justify-center"
                onClick={() => addCanvasItem('valueProposition')}
              >
                <Plus size={16} className="mr-2" />
                <span>Ajouter une proposition</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-500" />
              Projections de Revenus
            </h2>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-md">Revenu Mensuel Estimé</h3>
                  <p className="text-xs text-gray-400">Basé sur vos paramètres actuels</p>
                </div>
                <div className="text-xl font-bold text-green-500">{projectedMonthlyRevenue.toLocaleString('fr-FR')} €</div>
              </div>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-md">Revenu Annuel Potentiel</h3>
                  <p className="text-xs text-gray-400">Projection sur 12 mois</p>
                </div>
                <div className="text-xl font-bold">{projectedAnnualRevenue.toLocaleString('fr-FR')} €</div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Répartition par activité</h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Développement (60%)</span>
                    <span>{Math.round(projectedMonthlyRevenue * 0.6).toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Maintenance (25%)</span>
                    <span>{Math.round(projectedMonthlyRevenue * 0.25).toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conseil (15%)</span>
                    <span>{Math.round(projectedMonthlyRevenue * 0.15).toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-6 text-blue-400 hover:text-blue-300 flex items-center text-sm">
              <span>Voir les projections détaillées</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Business Model Canvas */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-250px)]">
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-2 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <Users size={16} className="mr-2 text-blue-400" />
              Partenaires Clés
            </h3>
            <div className="space-y-2">
              {canvasData.partners.map(partner => (
                <div key={partner.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{partner.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{partner.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('partners')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <Briefcase size={16} className="mr-2 text-green-400" />
              Activités Clés
            </h3>
            <div className="space-y-2">
              {canvasData.activities.map(activity => (
                <div key={activity.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{activity.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{activity.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('activities')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-2 row-span-2 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <Target size={16} className="mr-2 text-yellow-400" />
              Proposition de Valeur
            </h3>
            <div className="space-y-2">
              {canvasData.valueProposition.map(value => (
                <div key={value.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{value.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{value.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('valueProposition')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <Users size={16} className="mr-2 text-purple-400" />
              Relations Clients
            </h3>
            <div className="space-y-2">
              {canvasData.customerRelations.map(relation => (
                <div key={relation.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{relation.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{relation.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('customerRelations')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <ShoppingBag size={16} className="mr-2 text-red-400" />
              Ressources Clés
            </h3>
            <div className="space-y-2">
              {canvasData.resources.map(resource => (
                <div key={resource.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{resource.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{resource.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('resources')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <Target size={16} className="mr-2 text-blue-400" />
              Segments de Clientèle
            </h3>
            <div className="space-y-2">
              {canvasData.customerSegments.map(segment => (
                <div key={segment.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{segment.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{segment.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('customerSegments')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-1 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <ShoppingBag size={16} className="mr-2 text-green-400" />
              Canaux
            </h3>
            <div className="space-y-2">
              {canvasData.channels.map(channel => (
                <div key={channel.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{channel.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{channel.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('channels')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-2 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <DollarSign size={16} className="mr-2 text-red-400" />
              Structure de Coûts
            </h3>
            <div className="space-y-2">
              {canvasData.costStructure.map(cost => (
                <div key={cost.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{cost.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{cost.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('costStructure')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 col-span-2 row-span-1 overflow-y-auto">
            <h3 className="font-medium mb-3 flex items-center">
              <DollarSign size={16} className="mr-2 text-green-400" />
              Sources de Revenus
            </h3>
            <div className="space-y-2">
              {canvasData.revenueStreams.map(revenue => (
                <div key={revenue.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <div className="font-medium">{revenue.name}</div>
                    <button className="text-gray-400 hover:text-blue-400">
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{revenue.description}</div>
                </div>
              ))}
              <button onClick={() => addCanvasItem('revenueStreams')} className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-600 rounded flex items-center justify-center hover:text-blue-400 hover:border-blue-400">
                <Plus size={14} className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Impact de Tarification */}
      {activeTab === 'tarification' && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-6">Impact de votre Tarification</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-4">Hypothèses de Travail</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Heures travaillées par semaine</label>
                      <span className="text-sm font-medium">{sliderValues.hoursPerWeek}h</span>
                    </div>
                    <input
                      type="range"
                      name="hoursPerWeek"
                      min="5"
                      max="40"
                      value={sliderValues.hoursPerWeek}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5h</span>
                      <span>40h</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Nouveaux clients par mois (forfaits)</label>
                      <span className="text-sm font-medium">{sliderValues.newClientsPerMonth}</span>
                    </div>
                    <input
                      type="range"
                      name="newClientsPerMonth"
                      min="0"
                      max="5"
                      value={sliderValues.newClientsPerMonth}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium mt-8 mb-4">Tarifs Moyens</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Taux horaire moyen</label>
                      <span className="text-sm font-medium">{sliderValues.hourlyRate}€/h</span>
                    </div>
                    <input
                      type="range"
                      name="hourlyRate"
                      min="30"
                      max="60"
                      value={sliderValues.hourlyRate}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30€</span>
                      <span>60€</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Forfait moyen</label>
                      <span className="text-sm font-medium">{sliderValues.packageRate}€</span>
                    </div>
                    <input
                      type="range"
                      name="packageRate"
                      min="500"
                      max="5000"
                      step="100"
                      value={sliderValues.packageRate}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>500€</span>
                      <span>5000€</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-400">Abonnement mensuel moyen</label>
                      <span className="text-sm font-medium">{sliderValues.subscriptionRate}€/mois</span>
                    </div>
                    <input
                      type="range"
                      name="subscriptionRate"
                      min="200"
                      max="1500"
                      step="50"
                      value={sliderValues.subscriptionRate}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>200€</span>
                      <span>1500€</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Projections de Revenus</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm">Revenu mensuel estimé</h4>
                        <p className="text-xs text-gray-400">Basé sur vos paramètres actuels</p>
                      </div>
                      <div className="text-2xl font-bold text-green-500">{projectedMonthlyRevenue.toLocaleString('fr-FR')} €</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm">Revenu annuel potentiel</h4>
                        <p className="text-xs text-gray-400">Projection sur 12 mois</p>
                      </div>
                      <div className="text-2xl font-bold">{projectedAnnualRevenue.toLocaleString('fr-FR')} €</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm mb-4">Répartition des sources de revenus</h4>
                    <div className="w-full h-4 bg-gray-600 rounded-full overflow-hidden flex">
                      <div className="bg-blue-600 h-full" style={{ width: '30%' }}></div>
                      <div className="bg-green-500 h-full" style={{ width: '50%' }}></div>
                      <div className="bg-purple-500 h-full" style={{ width: '20%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mr-1"></div>
                        <span>Taux horaires (30%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        <span>Forfaits (50%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                        <span>Abonnements (20%)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm mb-4">Positionnement Tarifaire</h4>
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-sm">Tarifs dans la moyenne du marché</span>
                    </div>
                    <p className="text-xs text-gray-400">Vos taux sont équivalents à la moyenne du marché.</p>
                    <p className="text-xs text-gray-400 mt-2">Stratégie équilibrée: Bon compromis entre volume et marge, confortable pour la plupart des indépendants.</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm mb-3">Recommandations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex">
                        <div className="text-blue-400 mr-2">•</div>
                        <p>Diversifiez vos sources de revenus pour équilibrer votre modèle économique.</p>
                      </li>
                      <li className="flex">
                        <div className="text-blue-400 mr-2">•</div>
                        <p>Analysez la concurrence pour identifier des niches où vous pourriez pratiquer des tarifs plus élevés.</p>
                      </li>
                      <li className="flex">
                        <div className="text-blue-400 mr-2">•</div>
                        <p>Augmentez la part des abonnements pour stabiliser vos revenus mensuels.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessModelCanvas;