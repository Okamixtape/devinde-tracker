import React, { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CircleDollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { UI_CLASSES } from "../styles/ui-classes";
import type { BusinessPlanData, SectionKey } from "./types";

// Types pour les projets
type Project = {
  id: string;
  name: string;
  amount: number;
  date: string; // Format YYYY-MM
  status: "completed" | "ongoing" | "planned";
};

// Types pour les dépenses récurrentes
type Expense = {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
};

// Props du composant
type Props = {
  data: BusinessPlanData["financials"];
  updateData?: (section: SectionKey, field: string, value: number | string | string[]) => void;
};

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#4CAF50"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FinancialDashboard: React.FC<Props> = ({ data, ...props }) => {
  // État pour les projets (simulés pour l'exemple)
  const [projects] = useState<Project[]>([
    { id: "p1", name: "Site vitrine Restaurant", amount: 1500, date: "2025-06", status: "planned" },
    { id: "p2", name: "Application React pour PME", amount: 3000, date: "2025-07", status: "planned" },
    { id: "p3", name: "Maintenance E-commerce", amount: 400, date: "2025-06", status: "planned" },
    { id: "p4", name: "Refonte UX Startup", amount: 2200, date: "2025-08", status: "planned" },
  ]);
  
  // Gestion des dépenses récurrentes
  const parseExpenses = (): Expense[] => {
    return data.expenses.map((item, index) => {
      const parts = item.split(':');
      const name = parts[0].trim();
      
      // Extraction du montant et de la fréquence
      const amountMatch = parts[1]?.match(/(\d+)€\/(mois|an|trimestre)/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
      
      // Détermination de la fréquence
      let frequency: "monthly" | "quarterly" | "annual" = "monthly";
      if (parts[1]?.includes("/an")) frequency = "annual";
      else if (parts[1]?.includes("/trimestre")) frequency = "quarterly";
      
      return {
        id: `expense-${index}`,
        name,
        amount,
        frequency,
      };
    });
  };
  
  const expenses = parseExpenses();

  // Calcul des totaux annuels
  const calculateAnnualTotals = () => {
    const yearlyRevenue = data.quarterlyGoals.reduce((sum, val) => sum + val, 0);
    
    // Calcul des dépenses annuelles
    let yearlyExpenses = 0;
    expenses.forEach(expense => {
      switch (expense.frequency) {
        case "monthly":
          yearlyExpenses += expense.amount * 12;
          break;
        case "quarterly":
          yearlyExpenses += expense.amount * 4;
          break;
        case "annual":
          yearlyExpenses += expense.amount;
          break;
      }
    });
    
    // Ajout de l'investissement initial
    yearlyExpenses += data.initialInvestment;
    
    return {
      revenue: yearlyRevenue,
      expenses: yearlyExpenses,
      profit: yearlyRevenue - yearlyExpenses
    };
  };

  // Préparation des données pour le graphique trimestriel
  const getQuarterlyData = () => {
    return [
      { name: 'T1', revenue: data.quarterlyGoals[0] || 0 },
      { name: 'T2', revenue: data.quarterlyGoals[1] || 0 },
      { name: 'T3', revenue: data.quarterlyGoals[2] || 0 },
      { name: 'T4', revenue: data.quarterlyGoals[3] || 0 },
    ];
  };

  // Préparation des données pour le graphique de répartition des revenus
  const getRevenueDistributionData = () => {
    // Calcul des répartitions (exemple simplifié)
    const totalRevenue = data.quarterlyGoals.reduce((sum, val) => sum + val, 0);
    const hourlyRate = 0.4 * totalRevenue; // 40% du revenu provient des taux horaires
    const packages = 0.5 * totalRevenue; // 50% du revenu provient des forfaits
    const subscriptions = 0.1 * totalRevenue; // 10% du revenu provient des abonnements
    
    return [
      { name: 'Taux horaire', value: hourlyRate },
      { name: 'Forfaits', value: packages },
      { name: 'Abonnements', value: subscriptions },
    ];
  };

  // Préparation des données pour le graphique des dépenses
  const getExpensesData = () => {
    // Regrouper les dépenses par catégorie et calculer les totaux annuels
    const expensesByCategory: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const yearlyAmount = expense.frequency === "monthly" 
        ? expense.amount * 12 
        : expense.frequency === "quarterly" 
          ? expense.amount * 4 
          : expense.amount;
          
      expensesByCategory[expense.name] = (expensesByCategory[expense.name] || 0) + yearlyAmount;
    });
    
    // Ajouter l'investissement initial comme une catégorie
    if (data.initialInvestment > 0) {
      expensesByCategory["Investissement initial"] = data.initialInvestment;
    }
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  // Calcul des totaux annuels
  const annualTotals = calculateAnnualTotals();
  
  // Filtrer les projets par statut
  const plannedProjects = projects.filter(p => p.status === "planned");
  const totalPlannedRevenue = plannedProjects.reduce((sum, p) => sum + p.amount, 0);

  // Préparation des prévisions de trésorerie (sur 12 mois)
  const getCashFlowForecast = () => {
    const startMonth = 5; // Juin 2025 (0-indexé)
    const forecast = [];
    
    let cumulativeCashflow = 0;
    const monthlyExpense = expenses
      .filter(e => e.frequency === "monthly")
      .reduce((sum, e) => sum + e.amount, 0);
      
    // Répartir l'investissement initial sur le premier mois
    const initialInvestmentPerMonth = data.initialInvestment;
    
    // Répartir les objectifs trimestriels en revenus mensuels
    const monthlyRevenues = data.quarterlyGoals.map(quarter => quarter / 3);
    
    for (let i = 0; i < 12; i++) {
      const month = (startMonth + i) % 12;
      const quarter = Math.floor(month / 3);
      
      // Revenus pour ce mois (basé sur l'objectif trimestriel)
      const monthlyRevenue = monthlyRevenues[quarter] || 0;
      
      // Dépenses pour ce mois
      let monthlyExpenses = monthlyExpense;
      
      // Ajouter les dépenses trimestrielles si c'est un mois de début de trimestre
      if (month % 3 === 0) {
        monthlyExpenses += expenses
          .filter(e => e.frequency === "quarterly")
          .reduce((sum, e) => sum + e.amount, 0);
      }
      
      // Ajouter les dépenses annuelles si c'est le premier mois
      if (i === 0) {
        monthlyExpenses += expenses
          .filter(e => e.frequency === "annual")
          .reduce((sum, e) => sum + e.amount, 0);
          
        // Ajouter l'investissement initial
        monthlyExpenses += initialInvestmentPerMonth;
      }
      
      // Ajouter des revenus de projets (si applicable)
      const monthYear = `2025-${(month + 1).toString().padStart(2, '0')}`;
      const projectRevenue = projects
        .filter(p => p.date === monthYear)
        .reduce((sum, p) => sum + p.amount, 0);
        
      // Calcul du cashflow mensuel et cumulatif
      const monthlyNet = monthlyRevenue + projectRevenue - monthlyExpenses;
      cumulativeCashflow += monthlyNet;
      
      // Création de l'entrée pour le mois
      forecast.push({
        name: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][month],
        revenu: monthlyRevenue + projectRevenue,
        dépense: monthlyExpenses,
        cashflow: monthlyNet,
        cumulatif: cumulativeCashflow
      });
    }
    
    return forecast;
  };

  return (
    <div className="space-y-6">
      <h2 className={UI_CLASSES.HEADING_2}>Tableau de bord financier</h2>
      
      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.TEXT_SMALL}>CA prévisionnel (année 1)</h3>
          <div className="flex items-center justify-between">
            <div className="mt-2">
              <p className={`text-xl font-bold ${UI_CLASSES.TEXT}`}>{annualTotals.revenue.toLocaleString()}€</p>
              <p className="text-sm text-green-500">Objectif: {(annualTotals.revenue * 1.1).toLocaleString()}€</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <CircleDollarSign size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.TEXT_SMALL}>Dépenses (année 1)</h3>
          <div className="flex items-center justify-between">
            <div className="mt-2">
              <p className={`text-xl font-bold ${UI_CLASSES.TEXT}`}>{annualTotals.expenses.toLocaleString()}€</p>
              <p className="text-sm">Dont {data.initialInvestment.toLocaleString()}€ d'investissement</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <ArrowDownCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.TEXT_SMALL}>Bénéfice prévisionnel</h3>
          <div className="flex items-center justify-between">
            <div className="mt-2">
              <p className={`text-xl font-bold ${UI_CLASSES.TEXT}`}>{annualTotals.profit.toLocaleString()}€</p>
              <p className="text-sm">Marge: {(annualTotals.revenue > 0 ? (annualTotals.profit / annualTotals.revenue * 100).toFixed(1) : 0)}%</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.TEXT_SMALL}>Projets planifiés</h3>
          <div className="flex items-center justify-between">
            <div className="mt-2">
              <p className={`text-xl font-bold ${UI_CLASSES.TEXT}`}>{totalPlannedRevenue.toLocaleString()}€</p>
              <p className="text-sm">{plannedProjects.length} projets à venir</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <ArrowUpCircle size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des objectifs trimestriels */}
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.HEADING_3}>Objectifs trimestriels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getQuarterlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Graphique de répartition des revenus */}
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.HEADING_3}>Répartition des revenus</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getRevenueDistributionData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getRevenueDistributionData().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                  color: '#333',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                }}
                itemStyle={{ color: '#333' }}
                labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}
                formatter={(value: number) => [`${value.toLocaleString()}€`, 'Montant']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Légende du graphique avec de meilleurs contrastes */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {getRevenueDistributionData().map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 select-text">
                  {entry.name}: {entry.value.toLocaleString()}€
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Graphique des dépenses */}
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.HEADING_3}>Répartition des dépenses</h3>
          {expenses.length > 0 || data.initialInvestment > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getExpensesData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getExpensesData().map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune dépense définie. Ajoutez des dépenses dans la section &quot;Dépenses récurrentes&quot;.
            </div>
          )}
        </div>
        
        {/* Graphique de prévision de trésorerie */}
        <div className={UI_CLASSES.CARD}>
          <h3 className={UI_CLASSES.HEADING_3}>Prévision de trésorerie (12 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getCashFlowForecast()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
              <Legend />
              <Line type="monotone" dataKey="revenu" stroke="#4CAF50" />
              <Line type="monotone" dataKey="dépense" stroke="#F44336" />
              <Line type="monotone" dataKey="cumulatif" stroke="#2196F3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Projets planifiés */}
      <div className={UI_CLASSES.CARD}>
        <h3 className={UI_CLASSES.HEADING_3}>Projets planifiés</h3>
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={UI_CLASSES.TABLE}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className={UI_CLASSES.TABLE_HEADER}>Projet</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Montant</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Date prévue</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                {projects.map((project) => (
                  <tr key={project.id} className={`${UI_CLASSES.TABLE_ROW} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                    <td className={UI_CLASSES.TABLE_CELL}>{project.name}</td>
                    <td className={UI_CLASSES.TABLE_CELL_HIGHLIGHT}>{project.amount.toLocaleString()}€</td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      {new Date(project.date + "-01").toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      <span 
                        className={`${UI_CLASSES.BADGE} ${
                          project.status === 'completed' ? UI_CLASSES.BADGE_SUCCESS :
                          project.status === 'ongoing' ? UI_CLASSES.BADGE_INFO :
                          UI_CLASSES.BADGE_WARNING
                        }`}
                      >
                        {project.status === 'completed' ? 'Terminé' :
                         project.status === 'ongoing' ? 'En cours' : 'Planifié'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`text-center py-8 ${UI_CLASSES.TEXT_SMALL}`}>
            Aucun projet planifié. Cette section se remplira automatiquement lorsque vous ajouterez des projets.
          </div>
        )}
      </div>
      
      {/* Simulation ARCE */}
      <div className={UI_CLASSES.CARD}>
        <h3 className={UI_CLASSES.HEADING_3}>Simulation ARCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300 select-text">Montant estimé ARCE</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 select-text">
              Basé sur 45% des droits ARE restants (1100€/mois jusqu&apos;au 22/06/2025)
            </p>
            
            {/* Calcul du nombre de jours restants jusqu'au 22/06/2025 */}
            {(() => {
              const today = new Date();
              const endDate = new Date('2025-06-22');
              const diffTime = endDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // Calcul du montant ARCE
              const monthsRemaining = diffDays / 30;
              const arceAmount = 1100 * monthsRemaining * 0.45;
              
              return (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-700 dark:text-blue-400 select-text">Jours restants:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200 select-text">{diffDays} jours</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-700 dark:text-blue-400 select-text">Équivalent en mois:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200 select-text">{monthsRemaining.toFixed(1)} mois</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-700 dark:text-blue-400 select-text">Droits ARE restants:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200 select-text">{(1100 * monthsRemaining).toLocaleString()}€</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400 select-text">Montant ARCE estimé (45%):</span>
                      <span className="text-xl font-bold text-blue-700 dark:text-blue-300 select-text">{arceAmount.toLocaleString()}€</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200 select-text">Utilisation recommandée</h4>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-gradient-to-r from-transparent to-green-50 dark:to-green-900/20 border-l-4 border-green-500">
                <ArrowUpCircle size={18} className="text-green-500 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300 select-text">Équipement informatique: 1500€</span>
              </div>
              <div className="flex items-center p-2 bg-gradient-to-r from-transparent to-blue-50 dark:to-blue-900/20 border-l-4 border-blue-500">
                <TrendingUp size={18} className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300 select-text">Formation complémentaire: 900€</span>
              </div>
              <div className="flex items-center p-2 bg-gradient-to-r from-transparent to-purple-50 dark:to-purple-900/20 border-l-4 border-purple-500">
                <CircleDollarSign size={18} className="text-purple-500 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300 select-text">Marketing & acquisition clients: 600€</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-300 select-text">
              N&apos;oubliez pas que l&apos;ARCE est versée en deux fois : 50% à l&apos;approbation, 50% six mois plus tard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;