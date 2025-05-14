'use client';

import React, { useState, useEffect } from 'react';
import { FinancialsData, HourlyRate, ServicePackage, Subscription, Expense, FinancialProject } from "@/app/services/interfaces/dataModels";
import { FinancialProjectsManager } from './FinancialProjectsManager';

interface FinancialCalculatorProps {
  businessPlanId: string;
  financialsData?: FinancialsData;
  onSave?: (data: FinancialsData) => void;
  hourlyRates: HourlyRate[];
  packages: ServicePackage[];
  subscriptions: Subscription[];
  readOnly?: boolean;
  initialActiveTab?: 'calculator' | 'projects';
}

// Tab enumeration
type TabType = 'calculator' | 'projects';

/**
 * FinancialCalculator Component
 * 
 * Provides financial calculations and projections based on the business model data.
 * Follows the service architecture pattern by connecting UI to the underlying data services.
 */
export function FinancialCalculator({
  businessPlanId,
  financialsData,
  onSave,
  hourlyRates,
  packages,
  subscriptions,
  readOnly = false,
  initialActiveTab = 'calculator'
}: FinancialCalculatorProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>(initialActiveTab);
  
  // Initialize financial data
  const [financials, setFinancials] = useState<FinancialsData>(financialsData || {
    initialInvestment: 0,
    quarterlyGoals: [0, 0, 0, 0],
    expenses: [],
    projects: []
  });
  
  // Calculation states
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [annualRevenue, setAnnualRevenue] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [breakEvenMonths, setBreakEvenMonths] = useState(0);
  
  // Usage assumptions
  const [assumptions, setAssumptions] = useState({
    hourlyRateUtilization: 20, // 20 hours per week average
    packageSalesPerMonth: 2,   // 2 package sales per month
    subscriptionCustomers: 5    // 5 subscription customers
  });
  
  // Calculate financial projections based on business model and assumptions
  useEffect(() => {
    // Calculate revenue from hourly rates
    const hourlyRateRevenue = hourlyRates.reduce((total, rate) => {
      return total + (rate.rate * assumptions.hourlyRateUtilization * 4); // 4 weeks per month
    }, 0);
    
    // Calculate revenue from package sales
    const packageRevenue = packages.reduce((total, pkg) => {
      return total + (pkg.price * assumptions.packageSalesPerMonth);
    }, 0);
    
    // Calculate revenue from subscriptions
    const subscriptionRevenue = subscriptions.reduce((total, sub) => {
      return total + (sub.monthlyPrice * assumptions.subscriptionCustomers);
    }, 0);
    
    // Calculate total monthly revenue
    const calculatedMonthlyRevenue = hourlyRateRevenue + packageRevenue + subscriptionRevenue;
    setMonthlyRevenue(calculatedMonthlyRevenue);
    setAnnualRevenue(calculatedMonthlyRevenue * 12);
    
    // Calculate monthly expenses
    let monthlyExp = 0;
    let annualExp = 0;
    let oneTimeExp = 0;
    
    financials.expenses.forEach(expense => {
      switch (expense.frequency) {
        case 'monthly':
          monthlyExp += expense.amount;
          break;
        case 'quarterly':
          monthlyExp += expense.amount / 3;
          break;
        case 'annual':
          annualExp += expense.amount;
          break;
        case 'one-time':
          oneTimeExp += expense.amount;
          break;
      }
    });
    
    setMonthlyExpenses(monthlyExp);
    setAnnualExpenses(monthlyExp * 12 + annualExp);
    
    // Calculate profit margin
    if (calculatedMonthlyRevenue > 0) {
      setProfitMargin(((calculatedMonthlyRevenue - monthlyExp) / calculatedMonthlyRevenue) * 100);
    } else {
      setProfitMargin(0);
    }
    
    // Calculate break-even point in months
    const initialInvestment = financials.initialInvestment + oneTimeExp;
    const monthlyProfit = calculatedMonthlyRevenue - monthlyExp - (annualExp / 12);
    
    if (monthlyProfit > 0) {
      setBreakEvenMonths(Math.ceil(initialInvestment / monthlyProfit));
    } else {
      setBreakEvenMonths(0);
    }
    
  }, [hourlyRates, packages, subscriptions, financials, assumptions]);
  
  // Handle changes to the assumptions
  const handleAssumptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAssumptions(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Handle expense changes
  const handleExpenseChange = (index: number, field: keyof Expense, value: string | number) => {
    const updatedExpenses = [...financials.expenses];
    
    // Handle numeric values
    if (field === 'amount') {
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: parseFloat(value as string) || 0
      };
    } else {
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: value
      };
    }
    
    setFinancials(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };
  
  // Add a new expense
  const handleAddExpense = () => {
    const newExpense: Expense = {
      category: 'Opérations',
      name: 'Nouvelle dépense',
      amount: 0,
      frequency: 'monthly'
    };
    
    setFinancials(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
  };
  
  // Remove an expense
  const handleRemoveExpense = (index: number) => {
    const updatedExpenses = [...financials.expenses];
    updatedExpenses.splice(index, 1);
    
    setFinancials(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };
  
  // Handle saving the financial data
  const handleSave = () => {
    if (onSave) {
      onSave(financials);
    }
  };

  // Handle project changes
  const handleProjectsChange = (projects: FinancialProject[]) => {
    const updatedFinancials = {
      ...financials,
      projects
    };
    
    setFinancials(updatedFinancials);
    if (onSave) {
      onSave(updatedFinancials);
    }
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calculator'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Calculateur Financier
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Gestion des Projets
          </button>
        </nav>
      </div>
    );
  };

  // Render calculator content
  const renderCalculator = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Financial Summary Cards */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Revenu Mensuel Estimé</h3>
            <p className="text-2xl font-bold">{monthlyRevenue.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Annuel: {annualRevenue.toLocaleString('fr-FR')} €</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Dépenses Mensuelles</h3>
            <p className="text-2xl font-bold">{monthlyExpenses.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Annuel: {annualExpenses.toLocaleString('fr-FR')} €</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">Marge Bénéficiaire</h3>
            <p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Profit mensuel: {(monthlyRevenue - monthlyExpenses).toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Point d&apos;Équilibre</h3>
            <p className="text-2xl font-bold">{breakEvenMonths} mois</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Investissement initial: {financials.initialInvestment.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
        
        {!readOnly && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Hypothèses d&apos;Utilisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Utilisation Taux Horaire (heures/semaine)
                </label>
                <input
                  type="number"
                  name="hourlyRateUtilization"
                  value={assumptions.hourlyRateUtilization}
                  onChange={handleAssumptionChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ventes de Packages (par mois)
                </label>
                <input
                  type="number"
                  name="packageSalesPerMonth"
                  value={assumptions.packageSalesPerMonth}
                  onChange={handleAssumptionChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clients Abonnés
                </label>
                <input
                  type="number"
                  name="subscriptionCustomers"
                  value={assumptions.subscriptionCustomers}
                  onChange={handleAssumptionChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Expenses Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Dépenses</h3>
            {!readOnly && (
              <button
                type="button"
                onClick={handleAddExpense}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Ajouter une dépense
              </button>
            )}
          </div>
          
          {financials.expenses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">Aucune dépense enregistrée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Nom</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Montant</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Fréquence</th>
                    {!readOnly && (
                      <th className="text-right py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {financials.expenses.map((expense, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-2">
                        {readOnly ? (
                          expense.category
                        ) : (
                          <select
                            value={expense.category}
                            onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          >
                            <option value="Opérations">Opérations</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Équipement">Équipement</option>
                            <option value="Services">Services</option>
                            <option value="Taxes">Taxes</option>
                            <option value="Autre">Autre</option>
                          </select>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {readOnly ? (
                          expense.name
                        ) : (
                          <input
                            type="text"
                            value={expense.name}
                            onChange={(e) => handleExpenseChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {readOnly ? (
                          `${expense.amount.toLocaleString('fr-FR')} €`
                        ) : (
                          <input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {readOnly ? (
                          (() => {
                            switch (expense.frequency) {
                              case 'monthly': return 'Mensuel';
                              case 'quarterly': return 'Trimestriel';
                              case 'annual': return 'Annuel';
                              case 'one-time': return 'Unique';
                              default: return expense.frequency;
                            }
                          })()
                        ) : (
                          <select
                            value={expense.frequency}
                            onChange={(e) => handleExpenseChange(index, 'frequency', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                          >
                            <option value="monthly">Mensuel</option>
                            <option value="quarterly">Trimestriel</option>
                            <option value="annual">Annuel</option>
                            <option value="one-time">Unique</option>
                          </select>
                        )}
                      </td>
                      {!readOnly && (
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveExpense(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Initial Investment */}
        {!readOnly && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Investissement Initial</h3>
            <div className="flex items-center">
              <div className="w-full max-w-xs">
                <input
                  type="number"
                  value={financials.initialInvestment}
                  onChange={(e) => setFinancials(prev => ({ ...prev, initialInvestment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <span className="ml-2">€</span>
            </div>
          </div>
        )}
        
        {/* Save Button */}
        {!readOnly && onSave && (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer les Modifications
            </button>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Finances</h2>
      
      {renderTabs()}
      
      {activeTab === 'calculator' ? (
        renderCalculator()
      ) : (
        <FinancialProjectsManager
          businessPlanId={businessPlanId}
          projects={financials.projects || []}
          onProjectsChange={handleProjectsChange}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
