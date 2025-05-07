'use client';

import React, { useState, useEffect } from 'react';
import { HourlyRate, ServicePackage, Subscription } from "../services/interfaces/dataModels";

interface RevenueProjectorProps {
  businessPlanId: string;
  hourlyRates: HourlyRate[];
  packages: ServicePackage[];
  subscriptions: Subscription[];
  onSave?: (data: RevenueProjectionData) => void;
  readOnly?: boolean;
}

interface ProjectionSettings {
  months: number;
  growthRate: number;
  clientRetentionRate: number;
  initialHoursPerWeek: number;
  maxHoursPerWeek: number;
  initialMonthlyClients: {
    hourly: number;
    packages: number;
    subscriptions: number;
  };
  acquisitionRate: {
    hourly: number;
    packages: number;
    subscriptions: number;
  };
}

interface RevenueProjectionData {
  businessPlanId: string;
  projectionSettings: ProjectionSettings;
  projectionResults: {
    cumulativeRevenue: number;
    averageMonthlyRevenue: number;
    revenueSources: {
      hourly: number;
      packages: number;
      subscriptions: number;
    };
    monthlyData: Array<{
      month: number;
      hourlyRevenue: number;
      packageRevenue: number;
      subscriptionRevenue: number;
      totalRevenue: number;
      hourlyClients: number;
      packageClients: number;
      subscriptionClients: number;
      hoursPerWeek: number;
    }>;
  };
}

interface ProjectionData {
  month: number;
  hourlyRevenue: number;
  packageRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  hourlyClients: number;
  packageClients: number;
  subscriptionClients: number;
  hoursPerWeek: number;
}

/**
 * RevenueProjector Component
 * 
 * Projects future revenue based on business model and growth assumptions.
 * Follows the service architecture pattern by connecting UI to the underlying data services.
 */
export function RevenueProjector({
  businessPlanId,
  hourlyRates,
  packages,
  subscriptions,
  onSave,
  readOnly = false
}: RevenueProjectorProps) {
  // Initialize projection settings with default values
  const [settings, setSettings] = useState<ProjectionSettings>({
    months: 12,
    growthRate: 5, // 5% monthly growth rate
    clientRetentionRate: 90, // 90% client retention
    initialHoursPerWeek: 10,
    maxHoursPerWeek: 40,
    initialMonthlyClients: {
      hourly: 2,
      packages: 1,
      subscriptions: 0
    },
    acquisitionRate: {
      hourly: 1, // New clients per month
      packages: 0.5, // New clients per month
      subscriptions: 0.2 // New clients per month
    }
  });
  
  // Projection results
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [cumulativeRevenue, setCumulativeRevenue] = useState<number>(0);
  const [averageMonthlyRevenue, setAverageMonthlyRevenue] = useState<number>(0);
  const [revenueSources, setRevenueSources] = useState<{
    hourly: number;
    packages: number;
    subscriptions: number;
  }>({ hourly: 0, packages: 0, subscriptions: 0 });
  
  // Update settings
  const handleSettingChange = (
    settingPath: string, 
    value: number | Record<string, number>
  ) => {
    // Handle nested settings (e.g., 'initialMonthlyClients.hourly')
    if (settingPath.includes('.')) {
      const [parent, child] = settingPath.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProjectionSettings] as Record<string, number>,
          [child]: typeof value === 'number' ? value : 0
        }
      }));
    } else {
      // Handle top-level settings
      setSettings(prev => ({
        ...prev,
        [settingPath]: value
      }));
    }
  };

  // Calculate revenue projections based on current settings
  useEffect(() => {
    // Skip calculation if there's no business data
    if (hourlyRates.length === 0 && packages.length === 0 && subscriptions.length === 0) {
      setProjectionData([]);
      setCumulativeRevenue(0);
      setAverageMonthlyRevenue(0);
      setRevenueSources({ hourly: 0, packages: 0, subscriptions: 0 });
      return;
    }
    
    // Calculate average rates
    const avgHourlyRate = hourlyRates.length > 0
      ? hourlyRates.reduce((sum, rate) => sum + rate.rate, 0) / hourlyRates.length
      : 0;
    
    const avgPackagePrice = packages.length > 0
      ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length
      : 0;
    
    const avgSubscriptionPrice = subscriptions.length > 0
      ? subscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0) / subscriptions.length
      : 0;
    
    // Initialize clients
    let hourlyClients = settings.initialMonthlyClients.hourly;
    let packageClients = settings.initialMonthlyClients.packages;
    let subscriptionClients = settings.initialMonthlyClients.subscriptions;
    
    // Initialize hours per week
    let hoursPerWeek = settings.initialHoursPerWeek;
    
    // Generate projection data for each month
    const projections: ProjectionData[] = [];
    let hourlyTotal = 0;
    let packagesTotal = 0;
    let subscriptionsTotal = 0;
    let totalRevenue = 0;
    
    for (let month = 1; month <= settings.months; month++) {
      // Calculate revenue for each service type
      const hoursPerMonth = hoursPerWeek * 4; // 4 weeks per month
      const hourlyRevenue = avgHourlyRate * hoursPerMonth * hourlyClients;
      const packageRevenue = avgPackagePrice * packageClients;
      const subscriptionRevenue = avgSubscriptionPrice * subscriptionClients;
      
      // Calculate total monthly revenue
      const monthlyRevenue = hourlyRevenue + packageRevenue + subscriptionRevenue;
      
      // Add to projection data
      projections.push({
        month,
        hourlyRevenue,
        packageRevenue,
        subscriptionRevenue,
        totalRevenue: monthlyRevenue,
        hourlyClients,
        packageClients,
        subscriptionClients,
        hoursPerWeek
      });
      
      // Update running totals
      hourlyTotal += hourlyRevenue;
      packagesTotal += packageRevenue;
      subscriptionsTotal += subscriptionRevenue;
      totalRevenue += monthlyRevenue;
      
      // Apply growth and retention for next month
      // 1. Apply client retention
      hourlyClients *= (settings.clientRetentionRate / 100);
      packageClients *= (settings.clientRetentionRate / 100);
      subscriptionClients *= (settings.clientRetentionRate / 100);
      
      // 2. Add new clients based on acquisition rate
      hourlyClients += settings.acquisitionRate.hourly;
      packageClients += settings.acquisitionRate.packages;
      subscriptionClients += settings.acquisitionRate.subscriptions;
      
      // 3. Apply overall growth rate to acquisition rates for next month
      settings.acquisitionRate.hourly *= (1 + settings.growthRate / 100);
      settings.acquisitionRate.packages *= (1 + settings.growthRate / 100);
      settings.acquisitionRate.subscriptions *= (1 + settings.growthRate / 100);
      
      // 4. Increase hours per week up to max
      if (hoursPerWeek < settings.maxHoursPerWeek) {
        hoursPerWeek = Math.min(
          settings.maxHoursPerWeek, 
          hoursPerWeek * (1 + settings.growthRate / 200) // Slower growth for hours
        );
      }
    }
    
    // Update state with calculation results
    setProjectionData(projections);
    setCumulativeRevenue(totalRevenue);
    setAverageMonthlyRevenue(totalRevenue / settings.months);
    setRevenueSources({
      hourly: hourlyTotal / totalRevenue * 100,
      packages: packagesTotal / totalRevenue * 100,
      subscriptions: subscriptionsTotal / totalRevenue * 100
    });
    
  }, [
    settings, 
    hourlyRates, 
    packages, 
    subscriptions
  ]);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  };
  
  // Handle saving projection settings
  const handleSave = () => {
    if (onSave) {
      onSave({
        businessPlanId,
        projectionSettings: settings,
        projectionResults: {
          cumulativeRevenue,
          averageMonthlyRevenue,
          revenueSources,
          monthlyData: projectionData
        }
      });
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Projecteur de Revenus</h2>
        
        {/* Settings Panel */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-4">Paramètres de Projection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Période de Projection (mois)
              </label>
              <input
                type="number"
                value={settings.months}
                onChange={(e) => handleSettingChange('months', parseInt(e.target.value) || 0)}
                min="1"
                max="60"
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux de Croissance Mensuel (%)
              </label>
              <input
                type="number"
                value={settings.growthRate}
                onChange={(e) => handleSettingChange('growthRate', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.5"
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taux de Fidélisation Client (%)
              </label>
              <input
                type="number"
                value={settings.clientRetentionRate}
                onChange={(e) => handleSettingChange('clientRetentionRate', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="1"
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heures Initiales / Semaine
              </label>
              <input
                type="number"
                value={settings.initialHoursPerWeek}
                onChange={(e) => handleSettingChange('initialHoursPerWeek', parseInt(e.target.value) || 0)}
                min="1"
                max="80"
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heures Max / Semaine
              </label>
              <input
                type="number"
                value={settings.maxHoursPerWeek}
                onChange={(e) => handleSettingChange('maxHoursPerWeek', parseInt(e.target.value) || 0)}
                min="1"
                max="80"
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Clients Initiaux (par mois)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Facturation Horaire
                </label>
                <input
                  type="number"
                  value={settings.initialMonthlyClients.hourly}
                  onChange={(e) => handleSettingChange('initialMonthlyClients.hourly', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forfaits
                </label>
                <input
                  type="number"
                  value={settings.initialMonthlyClients.packages}
                  onChange={(e) => handleSettingChange('initialMonthlyClients.packages', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Abonnements
                </label>
                <input
                  type="number"
                  value={settings.initialMonthlyClients.subscriptions}
                  onChange={(e) => handleSettingChange('initialMonthlyClients.subscriptions', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taux d&apos;Acquisition (nouveaux clients/mois)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Facturation Horaire
                </label>
                <input
                  type="number"
                  value={settings.acquisitionRate.hourly}
                  onChange={(e) => handleSettingChange('acquisitionRate.hourly', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forfaits
                </label>
                <input
                  type="number"
                  value={settings.acquisitionRate.packages}
                  onChange={(e) => handleSettingChange('acquisitionRate.packages', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Abonnements
                </label>
                <input
                  type="number"
                  value={settings.acquisitionRate.subscriptions}
                  onChange={(e) => handleSettingChange('acquisitionRate.subscriptions', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
              Revenu Cumulé
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(cumulativeRevenue)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sur {settings.months} mois
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
              Revenu Mensuel Moyen
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(averageMonthlyRevenue)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Évoluant avec le temps
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
              Sources de Revenu
            </h3>
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Horaire:</span>
                <span className="text-sm font-medium">{revenueSources.hourly.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Forfaits:</span>
                <span className="text-sm font-medium">{revenueSources.packages.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Abonnements:</span>
                <span className="text-sm font-medium">{revenueSources.subscriptions.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projection Table */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Projection Mensuelle</h3>
          
          {projectionData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Ajoutez des services à votre modèle économique et définissez les paramètres de projection pour voir les résultats.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mois
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenu Horaire
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenu Forfaits
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenu Abonnements
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenu Total
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Clients
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projectionData.map((month, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {month.month}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(month.hourlyRevenue)}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(month.packageRevenue)}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(month.subscriptionRevenue)}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(month.totalRevenue)}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        <span title="Clients facturation horaire">{month.hourlyClients.toFixed(1)}</span> / 
                        <span title="Clients forfaits">{month.packageClients.toFixed(1)}</span> / 
                        <span title="Clients abonnements">{month.subscriptionClients.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Save Button */}
        {!readOnly && onSave && (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enregistrer les Projections
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
