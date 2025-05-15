import React, { useState } from 'react';
import { BarChart2, Calendar, ChevronDown, DollarSign, FileText, PieChart, Plus, TrendingUp, Users, Briefcase } from 'lucide-react';

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState('apercu');
  const [periodSelector, setPeriodSelector] = useState('trimestre');
  
  // Données simulées pour les revenus
  const revenueData = {
    currentMonth: 2500,
    previousMonth: 2200,
    currentYear: 25000,
    lastYear: 15000,
    byMonth: [
      { month: 'Jan', value: 1800 },
      { month: 'Fév', value: 2100 },
      { month: 'Mar', value: 2300 },
      { month: 'Avr', value: 2500 },
      { month: 'Mai', value: 0 },
      { month: 'Juin', value: 0 },
      { month: 'Juil', value: 0 },
      { month: 'Aoû', value: 0 },
      { month: 'Sep', value: 0 },
      { month: 'Oct', value: 0 },
      { month: 'Nov', value: 0 },
      { month: 'Déc', value: 0 }
    ],
    byQuarter: [
      { quarter: 'T1', value: 6200 },
      { quarter: 'T2', value: 2500 },
      { quarter: 'T3', value: 0 },
      { quarter: 'T4', value: 0 }
    ],
    byType: [
      { type: 'Taux Horaire', value: 7500, percentage: 30, color: 'bg-blue-500' },
      { type: 'Forfaits', value: 12500, percentage: 50, color: 'bg-green-500' },
      { type: 'Abonnements', value: 5000, percentage: 20, color: 'bg-purple-500' }
    ]
  };
  
  // Données simulées pour les dépenses
  const expenseData = {
    currentMonth: 350,
    previousMonth: 320,
    currentYear: 3600,
    byType: [
      { type: 'Logiciels', value: 1200, percentage: 33, color: 'bg-blue-500' },
      { type: 'Services professionnels', value: 800, percentage: 22, color: 'bg-green-500' },
      { type: 'Marketing', value: 600, percentage: 17, color: 'bg-yellow-500' },
      { type: 'Équipement', value: 1000, percentage: 28, color: 'bg-red-500' }
    ]
  };
  
  // Données simulées pour les projets
  const projectsData = {
    active: 3,
    completed: 5,
    planned: 2,
    projects: [
      { id: 1, name: "Site vitrine PME", client: "Dupont SARL", budget: 2500, status: "En cours", completion: 60, dueDate: "10 mai 2025" },
      { id: 2, name: "Application React", client: "Tech Innovate", budget: 5000, status: "En cours", completion: 30, dueDate: "15 juin 2025" },
      { id: 3, name: "Maintenance mensuelle", client: "Martin & Co", budget: 400, status: "Récurrent", completion: 0, dueDate: "Mensuel" }
    ]
  };

  const calculatePerformanceIndicators = () => {
    const monthlyProfit = revenueData.currentMonth - expenseData.currentMonth;
    const profitMargin = (monthlyProfit / revenueData.currentMonth) * 100;
    const revenueGrowth = ((revenueData.currentMonth - revenueData.previousMonth) / revenueData.previousMonth) * 100;
    
    return {
      monthlyProfit,
      profitMargin: profitMargin.toFixed(1),
      revenueGrowth: revenueGrowth.toFixed(1)
    };
  };
  
  const indicators = calculatePerformanceIndicators();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finances</h1>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center">
            <Plus size={16} className="mr-2" />
            <span>Nouvelle Transaction</span>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md flex items-center">
            <FileText size={16} className="mr-2" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('apercu')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'apercu' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Aperçu Financier
          </button>
          <button
            onClick={() => setActiveTab('projets')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projets' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Gestion des Projets
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('previsions')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'previsions' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent hover:border-gray-600 text-gray-400'
            }`}
          >
            Prévisions
          </button>
        </nav>
      </div>

      {/* Aperçu Financier */}
      {activeTab === 'apercu' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 p-5 rounded-lg shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Revenu Mensuel</p>
                  <p className="text-2xl font-bold mt-1">{revenueData.currentMonth.toLocaleString('fr-FR')} €</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center ${indicators.revenueGrowth > 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  <TrendingUp size={12} className="mr-1" />
                  {indicators.revenueGrowth}%
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">vs {revenueData.previousMonth.toLocaleString('fr-FR')} € le mois dernier</p>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Dépenses Mensuelles</p>
                  <p className="text-2xl font-bold mt-1">{expenseData.currentMonth.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-gray-700 text-xs font-medium flex items-center text-gray-300">
                  <DollarSign size={12} className="mr-1" />
                  14%
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">du revenu total</p>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Profit Mensuel</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">{indicators.monthlyProfit.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-900 text-xs font-medium flex items-center text-green-400">
                  {indicators.profitMargin}%
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">marge bénéficiaire</p>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">CA Annuel</p>
                  <p className="text-2xl font-bold mt-1">{revenueData.currentYear.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-blue-900 text-xs font-medium flex items-center text-blue-400">
                  <Calendar size={12} className="mr-1" />
                  2025
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">projection basée sur les tendances actuelles</p>
            </div>
          </div>
          
          {/* Graphiques et analyses */}
          <div className="grid grid-cols-12 gap-6">
            {/* Évolution des revenus */}
            <div className="col-span-8 bg-gray-800 p-5 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Évolution des Revenus</h2>
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <button 
                      onClick={() => setPeriodSelector('mois')}
                      className={`px-3 py-1 text-xs rounded-md ${periodSelector === 'mois' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      Mois
                    </button>
                    <button 
                      onClick={() => setPeriodSelector('trimestre')}
                      className={`px-3 py-1 text-xs rounded-md ${periodSelector === 'trimestre' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      Trimestre
                    </button>
                  </div>
                  <button className="bg-gray-700 px-3 py-1 rounded-md text-sm flex items-center hover:bg-gray-600">
                    <span>Cette année</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="relative h-64">
                {/* Simulation d'un graphique à barres */}
                <div className="absolute inset-0 flex items-end justify-around pb-10">
                  {periodSelector === 'mois' 
                    ? revenueData.byMonth.map((month, index) => (
                        <div key={index} className="flex flex-col items-center w-1/12">
                          <div 
                            className={`w-8 ${month.value > 0 ? 'bg-blue-600' : 'bg-gray-700'} rounded-t-md`} 
                            style={{ height: `${month.value > 0 ? (month.value / 3000) * 100 : 10}%` }}
                          ></div>
                          <div className="mt-2 text-xs font-medium">{month.month}</div>
                          {month.value > 0 && <div className="text-xs text-gray-400">{month.value}€</div>}
                        </div>
                      ))
                    : revenueData.byQuarter.map((quarter, index) => (
                        <div key={index} className="flex flex-col items-center w-1/4">
                          <div 
                            className={`w-16 ${quarter.value > 0 ? 'bg-blue-600' : 'bg-gray-700'} rounded-t-md`}
                            style={{ height: `${quarter.value > 0 ? (quarter.value / 8000) * 100 : 10}%` }}
                          ></div>
                          <div className="mt-2 text-xs font-medium">{quarter.quarter}</div>
                          {quarter.value > 0 && <div className="text-xs text-gray-400">{quarter.value}€</div>}
                        </div>
                      ))
                  }
                </div>
                
                {/* Lignes de grille horizontales */}
                <div className="absolute inset-0 flex flex-col justify-between pb-10">
                  {periodSelector === 'mois'
                    ? [3000, 2000, 1000, 0].map((amount, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2 w-12 text-right">{amount}€</span>
                          <div className="flex-1 border-t border-gray-700"></div>
                        </div>
                      ))
                    : [8000, 6000, 4000, 2000, 0].map((amount, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2 w-12 text-right">{amount}€</span>
                          <div className="flex-1 border-t border-gray-700"></div>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
            
            {/* Répartition des revenus et dépenses */}
            <div className="col-span-4 grid grid-rows-2 gap-6">
              <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                <h2 className="text-md font-medium mb-4 flex items-center">
                  <PieChart size={16} className="mr-2 text-blue-400" />
                  Sources de Revenus
                </h2>
                
                <div className="relative h-28 mb-3">
                  {/* Simulation d'un graphique en donut */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4299e1"
                          strokeWidth="3"
                          strokeDasharray="30, 100"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#48bb78"
                          strokeWidth="3"
                          strokeDasharray="50, 100"
                          strokeDashoffset="-30"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#9f7aea"
                          strokeWidth="3"
                          strokeDasharray="20, 100"
                          strokeDashoffset="-80"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {revenueData.byType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                        <span className="text-xs">{item.type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium">{item.percentage}%</span>
                        <span className="text-xs text-gray-400 ml-2">{item.value}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg shadow-md">
                <h2 className="text-md font-medium mb-4 flex items-center">
                  <PieChart size={16} className="mr-2 text-red-400" />
                  Répartition des Dépenses
                </h2>
                
                <div className="space-y-3">
                  {expenseData.byType.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                          <span className="text-xs">{item.type}</span>
                        </div>
                        <span className="text-xs">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
                  <span className="text-xs text-gray-400">Total Dépenses Annuelles</span>
                  <span className="text-xs font-medium">{expenseData.currentYear}€</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Projets actifs */}
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Projets Actifs</h2>
              <button 
                onClick={() => setActiveTab('projets')}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                Voir tous les projets
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progression</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Échéance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {projectsData.projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">{project.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.client}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.budget.toLocaleString('fr-FR')} €</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'En cours' ? 'bg-blue-900 text-blue-400' :
                          project.status === 'Récurrent' ? 'bg-green-900 text-green-400' :
                          'bg-yellow-900 text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {project.status !== 'Récurrent' ? (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completion}%` }}
                            ></div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.dueDate}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Gestion des Projets */}
      {activeTab === 'projets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 p-5 rounded-lg shadow-md flex">
              <div className="p-3 rounded-lg bg-blue-900 bg-opacity-50 mr-4">
                <Briefcase size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Projets Actifs</p>
                <p className="text-2xl font-bold">{projectsData.active}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md flex">
              <div className="p-3 rounded-lg bg-green-900 bg-opacity-50 mr-4">
                <Users size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Projets Complétés</p>
                <p className="text-2xl font-bold">{projectsData.completed}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md flex">
              <div className="p-3 rounded-lg bg-purple-900 bg-opacity-50 mr-4">
                <Calendar size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Projets Planifiés</p>
                <p className="text-2xl font-bold">{projectsData.planned}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg shadow-md flex">
              <div className="p-3 rounded-lg bg-yellow-900 bg-opacity-50 mr-4">
                <DollarSign size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Budget Total</p>
                <p className="text-2xl font-bold">10 500 €</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Tous les Projets</h2>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm flex items-center">
                <Plus size={16} className="mr-2" />
                <span>Nouveau Projet</span>
              </button>
            </div>
            
            {/* Remplace la balise form par une div */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tous les statuts</option>
                <option>En cours</option>
                <option>Planifié</option>
                <option>Complété</option>
                <option>Récurrent</option>
              </select>
              <select className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tous les clients</option>
                <option>Dupont SARL</option>
                <option>Tech Innovate</option>
                <option>Martin & Co</option>
              </select>
            </div>
          
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progression</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Échéance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {projectsData.projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">{project.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.client}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.budget.toLocaleString('fr-FR')} €</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'En cours' ? 'bg-blue-900 text-blue-400' :
                          project.status === 'Récurrent' ? 'bg-green-900 text-green-400' :
                          'bg-yellow-900 text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {project.status !== 'Récurrent' ? (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completion}%` }}
                            ></div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">{project.dueDate}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button className="text-blue-400 hover:text-blue-300 px-2">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;