import React from 'react';
import { ArrowRight, ArrowUp, BarChart2, Briefcase, Calendar, DollarSign, PieChart, Target, Users } from 'lucide-react';

const Dashboard = () => {
  const planProgress = 35; // Pourcentage global de progression

  // Données pour les métriques principales
  const keyMetrics = [
    { id: 1, title: "Revenu Mensuel Est.", value: "2 400 €", change: "+15%", color: "text-green-500" },
    { id: 2, title: "Revenu Annuel Proj.", value: "28 800 €", change: "", color: "text-white" },
    { id: 3, title: "Clés en main/mois", value: "2", change: "", color: "text-white" },
    { id: 4, title: "Point d'Équilibre", value: "3 mois", change: "-1", color: "text-green-500" },
  ];

  // Données pour les sections du plan d'affaires
  const businessPlanSections = [
    { id: "pitch", title: "Pitch", icon: <Briefcase size={20} />, progress: 80, status: "complété" },
    { id: "services", title: "Services", icon: <Users size={20} />, progress: 60, status: "en cours" },
    { id: "modele", title: "Modèle Économique", icon: <DollarSign size={20} />, progress: 40, status: "en cours" },
    { id: "marche", title: "Analyse de Marché", icon: <PieChart size={20} />, progress: 20, status: "à faire" },
    { id: "finances", title: "Finances", icon: <BarChart2 size={20} />, progress: 30, status: "en cours" },
    { id: "plan", title: "Plan d'Action", icon: <Target size={20} />, progress: 10, status: "à faire" },
    { id: "projections", title: "Projections", icon: <Calendar size={20} />, progress: 50, status: "en cours" },
  ];

  // Données pour projections de revenu trimestrielles
  const quarterlyData = [
    { quarter: "T1", target: 3000, projected: 2400 },
    { quarter: "T2", target: 4500, projected: 4200 },
    { quarter: "T3", target: 6000, projected: 5500 },
    { quarter: "T4", target: 7500, projected: 7000 },
  ];

  // Données pour activités récentes
  const recentActivities = [
    { date: "Aujourd'hui", action: "Ajout d'un nouveau service: Maintenance", section: "Services" },
    { date: "Hier", action: "Mise à jour des tarifs horaires", section: "Modèle Économique" },
    { date: "Il y a 2 jours", action: "Ajout d'un segment client: PME", section: "Analyse de Marché" },
  ];

  // Données pour suggestions intelligentes
  const smartSuggestions = [
    "Complétez votre analyse de marché pour identifier plus d'opportunités",
    "Ajoutez des jalons à votre plan d'action pour structurer votre lancement",
    "Définissez vos sources de revenus pour affiner vos projections financières",
  ];

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord: AI Développeur Next.JS</h1>
          <p className="text-gray-400">Dernière mise à jour: Aujourd'hui à 10:45</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center">
            <span>Exporter le Plan</span>
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md flex items-center">
            <span>Paramètres</span>
          </button>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Progression Globale du Plan</h2>
          <span className="font-bold text-xl">{planProgress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${planProgress}%` }}></div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {keyMetrics.map(metric => (
            <div key={metric.id} className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{metric.title}</p>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold">{metric.value}</span>
                {metric.change && (
                  <span className={`ml-2 flex items-center text-sm ${metric.color}`}>
                    <ArrowUp size={14} className="mr-1" />
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal en 2 colonnes */}
      <div className="grid grid-cols-12 gap-6">
        {/* Colonne gauche (8/12) */}
        <div className="col-span-8 space-y-6">
          {/* Sections du business plan */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Sections du Plan d'Affaires</h2>
            <div className="grid gap-4">
              {businessPlanSections.map(section => (
                <div key={section.id} className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer">
                  <div className={`p-2 rounded-md mr-3 ${
                    section.status === 'complété' ? 'bg-green-600' :
                    section.status === 'en cours' ? 'bg-blue-600' : 'bg-gray-500'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{section.title}</h3>
                      <span className="text-sm text-gray-400 capitalize">{section.status}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                      <div className={`h-2 rounded-full ${
                        section.status === 'complété' ? 'bg-green-500' :
                        section.status === 'en cours' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} style={{ width: `${section.progress}%` }}></div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Graphique projections trimestrielles */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Projections de Revenus Trimestrielles</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                <span>Voir le détail</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="relative h-64">
              {/* Simulation d'un graphique à barres */}
              <div className="absolute inset-0 flex items-end justify-around pb-10">
                {quarterlyData.map((quarter, index) => (
                  <div key={index} className="flex flex-col items-center w-1/6">
                    <div className="relative flex w-full space-x-1 h-full items-end justify-center">
                      <div 
                        className="w-2/5 bg-blue-600 rounded-t-md" 
                        style={{ height: `${(quarter.projected / 8000) * 100}%` }}
                      ></div>
                      <div 
                        className="w-2/5 bg-gray-500 opacity-30 rounded-t-md" 
                        style={{ height: `${(quarter.target / 8000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm font-medium">{quarter.quarter}</div>
                    <div className="text-xs text-gray-400">{quarter.projected}€</div>
                  </div>
                ))}
              </div>
              
              {/* Lignes de grille horizontales */}
              <div className="absolute inset-0 flex flex-col justify-between pb-10">
                {[8000, 6000, 4000, 2000, 0].map((amount, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2 w-12 text-right">{amount}€</span>
                    <div className="flex-1 border-t border-gray-700"></div>
                  </div>
                ))}
              </div>
              
              {/* Légende */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-6 pt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></div>
                  <span className="text-xs text-gray-400">Projeté</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 opacity-30 rounded-sm mr-2"></div>
                  <span className="text-xs text-gray-400">Objectif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite (4/12) */}
        <div className="col-span-4 space-y-6">
          {/* Suggestions intelligentes */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Suggestions Intelligentes</h2>
            <div className="space-y-3">
              {smartSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700 border-opacity-30">
                  <p className="text-sm">{suggestion}</p>
                  <button className="mt-2 text-blue-400 hover:text-blue-300 text-xs flex items-center">
                    <span>Appliquer</span>
                    <ArrowRight size={12} className="ml-1" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Activités Récentes</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 w-2 h-full bg-blue-600 rounded-full"></div>
                  <div>
                    <span className="text-sm text-gray-400">{activity.date}</span>
                    <p className="text-sm font-medium mt-1">{activity.action}</p>
                    <span className="text-xs text-blue-400">Section: {activity.section}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center">
              <span>Voir toutes les activités</span>
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Prochaines Étapes</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="p-2 rounded-full bg-gray-600 mr-3">
                  <Target size={16} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Finaliser l'analyse de marché</h4>
                  <p className="text-xs text-gray-400">Priorité haute • Échéance: 10 mai</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="p-2 rounded-full bg-gray-600 mr-3">
                  <DollarSign size={16} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Compléter vos sources de revenus</h4>
                  <p className="text-xs text-gray-400">Priorité moyenne • Échéance: 12 mai</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="p-2 rounded-full bg-gray-600 mr-3">
                  <Calendar size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Définir vos premiers jalons</h4>
                  <p className="text-xs text-gray-400">Priorité normale • Échéance: 15 mai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
