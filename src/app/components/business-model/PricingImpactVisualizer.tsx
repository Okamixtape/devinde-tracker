'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BusinessPlanData } from "@/app/services/interfaces/dataModels";

interface PricingImpactVisualizerProps {
  businessModel: BusinessPlanData['businessModel'];
}

interface RevenueProjection {
  monthly: number;
  yearly: number;
  hourlyContribution: number;
  packageContribution: number;
  subscriptionContribution: number;
}

interface MarketComparison {
  status: 'competitive' | 'average' | 'premium';
  message: string;
  hourlyRateComparison: number; // pourcentage par rapport à la moyenne du marché
}

interface HourlyRate {
  rate: number;
}

interface ServicePackage {
  price: number;
}

interface Subscription {
  monthlyPrice: number;
}

/**
 * PricingImpactVisualizer
 * 
 * Composant qui visualise l'impact de votre tarification sur votre modèle économique.
 * Il fournit des projections de revenus et des comparaisons avec le marché.
 */
export function PricingImpactVisualizer({
  businessModel
}: PricingImpactVisualizerProps) {
  const [revenueProjection, setRevenueProjection] = useState<RevenueProjection>({
    monthly: 0,
    yearly: 0,
    hourlyContribution: 0,
    packageContribution: 0,
    subscriptionContribution: 0
  });
  
  const [marketComparison, setMarketComparison] = useState<MarketComparison>({
    status: 'average',
    message: 'Tarifs dans la moyenne du marché',
    hourlyRateComparison: 0
  });
  
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState<number>(20);
  const [clientsPerMonth, setClientsPerMonth] = useState<number>(2);
  
  // Fonction pour calculer l'impact de la tarification (mémorisée avec useCallback)
  const calculatePricingImpact = useCallback(() => {
    // Extraction des taux horaires moyens, prix des forfaits et abonnements
    const hourlyRates = businessModel.hourlyRates || [];
    const packages = businessModel.packages || [];
    const subscriptions = businessModel.subscriptions || [];
    
    // Calcul du taux horaire moyen
    let totalHourlyRate = 0;
    let hourlyRateCount = 0;
    
    hourlyRates.forEach(rate => {
      if (typeof rate === 'string') {
        // Extraction du taux horaire depuis un format comme "Développement: 50€/h"
        const rateStr = rate as string;
        const match = rateStr.match(/(\d+)[\s€/]*h/);
        if (match && match[1]) {
          totalHourlyRate += parseInt(match[1], 10);
          hourlyRateCount++;
        }
      } else if (typeof rate === 'object' && rate && 'rate' in rate) {
        totalHourlyRate += (rate as HourlyRate).rate;
        hourlyRateCount++;
      }
    });
    
    const averageHourlyRate = hourlyRateCount > 0 ? totalHourlyRate / hourlyRateCount : 0;
    
    // Calcul du prix moyen des forfaits
    let totalPackagePrice = 0;
    let packageCount = 0;
    
    packages.forEach(pkg => {
      if (typeof pkg === 'string') {
        // Extraction du prix depuis un format comme "Site vitrine: 1500€"
        const pkgStr = pkg as string;
        const match = pkgStr.match(/(\d+)[\s€]*/);
        if (match && match[1]) {
          totalPackagePrice += parseInt(match[1], 10);
          packageCount++;
        }
      } else if (typeof pkg === 'object' && pkg && 'price' in pkg) {
        totalPackagePrice += (pkg as ServicePackage).price;
        packageCount++;
      }
    });
    
    const averagePackagePrice = packageCount > 0 ? totalPackagePrice / packageCount : 0;
    
    // Calcul du revenu mensuel des abonnements
    let totalSubscriptionPrice = 0;
    
    subscriptions.forEach(sub => {
      if (typeof sub === 'string') {
        // Extraction du prix mensuel depuis un format comme "Support: 200€/mois"
        const subStr = sub as string;
        const match = subStr.match(/(\d+)[\s€/]*mois/);
        if (match && match[1]) {
          totalSubscriptionPrice += parseInt(match[1], 10);
        }
      } else if (typeof sub === 'object' && sub && 'monthlyPrice' in sub) {
        totalSubscriptionPrice += (sub as Subscription).monthlyPrice;
      }
    });
    
    // Calcul des revenus mensuels potentiels basés sur les heures travaillées
    const hourlyMonthlyRevenue = averageHourlyRate * workHoursPerWeek * 4 * (workHoursPerWeek / 20); // 4 semaines par mois
    
    // Revenus mensuels des forfaits basés sur le nombre de clients
    const packageMonthlyRevenue = (averagePackagePrice * clientsPerMonth) / 3 * (clientsPerMonth / 2); // Répartition sur 3 mois
    
    // Revenus mensuels totaux
    const monthlyRevenue = hourlyMonthlyRevenue + packageMonthlyRevenue + totalSubscriptionPrice;
    
    // Contributions en pourcentage
    const hourlyContribution = monthlyRevenue > 0 ? (hourlyMonthlyRevenue / monthlyRevenue) * 100 : 0;
    const packageContribution = monthlyRevenue > 0 ? (packageMonthlyRevenue / monthlyRevenue) * 100 : 0;
    const subscriptionContribution = monthlyRevenue > 0 ? (totalSubscriptionPrice / monthlyRevenue) * 100 : 0;
    
    // Mise à jour des projections de revenus
    setRevenueProjection({
      monthly: Math.round(monthlyRevenue),
      yearly: Math.round(monthlyRevenue * 12),
      hourlyContribution: Math.round(hourlyContribution),
      packageContribution: Math.round(packageContribution),
      subscriptionContribution: Math.round(subscriptionContribution)
    });
    
    // Calcul de la comparaison avec le marché (valeurs moyennes fictives pour l'exemple)
    const marketAverageHourlyRate = 65; // Taux horaire moyen du marché
    const comparisonPercentage = averageHourlyRate > 0 
      ? ((averageHourlyRate - marketAverageHourlyRate) / marketAverageHourlyRate) * 100 
      : 0;
    
    let status: 'competitive' | 'average' | 'premium' = 'average';
    let message = 'Tarifs dans la moyenne du marché';
    
    if (comparisonPercentage <= -15) {
      status = 'competitive';
      message = 'Tarifs compétitifs (inférieurs à la moyenne du marché)';
    } else if (comparisonPercentage >= 15) {
      status = 'premium';
      message = 'Tarifs premium (supérieurs à la moyenne du marché)';
    }
    
    setMarketComparison({
      status,
      message,
      hourlyRateComparison: Math.round(comparisonPercentage)
    });
  }, [businessModel, workHoursPerWeek, clientsPerMonth]);
  
  // Calcul de l'impact de la tarification
  useEffect(() => {
    console.log('Recalculating pricing impact:', workHoursPerWeek, clientsPerMonth);
    calculatePricingImpact();
  }, [calculatePricingImpact, workHoursPerWeek, clientsPerMonth]);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium mb-6 text-gray-800 dark:text-white">
        Impact de votre Tarification
      </h3>
      
      {/* Paramètres de simulation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Heures travaillées par semaine
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={workHoursPerWeek}
              onChange={(e) => setWorkHoursPerWeek(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
              {workHoursPerWeek}h
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Nouveaux clients par mois (forfaits)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={clientsPerMonth}
              onChange={(e) => setClientsPerMonth(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
              {clientsPerMonth}
            </span>
          </div>
        </div>
      </div>
      
      {/* Projections de revenus */}
      <div className="mb-8">
        <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">
          Projections de Revenus
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Revenu mensuel estimé</div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(revenueProjection.monthly)}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-700 dark:text-green-300 mb-1">Revenu annuel potentiel</div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(revenueProjection.yearly)}
            </div>
          </div>
        </div>
        
        {/* Graphique de répartition des revenus */}
        <div className="mt-6">
          <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Répartition des sources de revenus
          </h5>
          
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${revenueProjection.hourlyContribution}%` }}
                title={`Taux horaires: ${revenueProjection.hourlyContribution}%`}
              ></div>
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${revenueProjection.packageContribution}%` }}
                title={`Forfaits: ${revenueProjection.packageContribution}%`}
              ></div>
              <div 
                className="bg-purple-500 h-full" 
                style={{ width: `${revenueProjection.subscriptionContribution}%` }}
                title={`Abonnements: ${revenueProjection.subscriptionContribution}%`}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Taux horaires ({revenueProjection.hourlyContribution}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Forfaits ({revenueProjection.packageContribution}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Abonnements ({revenueProjection.subscriptionContribution}%)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparaison avec le marché */}
      <div>
        <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">
          Positionnement Tarifaire
        </h4>
        
        <div className={`p-4 rounded-lg ${
          marketComparison.status === 'competitive' ? 'bg-green-50 dark:bg-green-900/20' :
          marketComparison.status === 'premium' ? 'bg-purple-50 dark:bg-purple-900/20' :
          'bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              marketComparison.status === 'competitive' ? 'bg-green-500' :
              marketComparison.status === 'premium' ? 'bg-purple-500' :
              'bg-blue-500'
            }`}></div>
            <div className={`text-sm font-medium ${
              marketComparison.status === 'competitive' ? 'text-green-700 dark:text-green-300' :
              marketComparison.status === 'premium' ? 'text-purple-700 dark:text-purple-300' :
              'text-blue-700 dark:text-blue-300'
            }`}>
              {marketComparison.message}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {marketComparison.hourlyRateComparison > 0 ? (
              <span>Vos taux sont <strong>{Math.abs(marketComparison.hourlyRateComparison)}% supérieurs</strong> à la moyenne du marché.</span>
            ) : marketComparison.hourlyRateComparison < 0 ? (
              <span>Vos taux sont <strong>{Math.abs(marketComparison.hourlyRateComparison)}% inférieurs</strong> à la moyenne du marché.</span>
            ) : (
              <span>Vos taux sont <strong>équivalents</strong> à la moyenne du marché.</span>
            )}
          </div>
          
          <div className="mt-4 text-sm">
            <p className={`${
              marketComparison.status === 'competitive' ? 'text-green-700 dark:text-green-300' :
              marketComparison.status === 'premium' ? 'text-purple-700 dark:text-purple-300' :
              'text-blue-700 dark:text-blue-300'
            }`}>
              {marketComparison.status === 'competitive' ? (
                "Stratégie compétitive: Idéale pour conquérir des parts de marché mais peut nécessiter un volume plus élevé de clients."
              ) : marketComparison.status === 'premium' ? (
                "Stratégie premium: Excellente marge, mais nécessite un positionnement d'expert et un service de très haute qualité."
              ) : (
                "Stratégie équilibrée: Bon compromis entre volume et marge, confortable pour la plupart des indépendants."
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recommandations */}
      <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-white">
          Recommandations
        </h4>
        
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {marketComparison.status === 'competitive' && (
            <>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Envisagez d&apos;augmenter progressivement vos tarifs à mesure que votre portefeuille client se remplit.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Concentrez-vous sur l&apos;efficacité et l&apos;automatisation pour gérer un volume plus important de clients.</span>
              </li>
            </>
          )}
          
          {marketComparison.status === 'premium' && (
            <>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Investissez davantage dans votre image de marque et votre positionnement expert.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Développez des services à forte valeur ajoutée pour justifier vos tarifs premium.</span>
              </li>
            </>
          )}
          
          {marketComparison.status === 'average' && (
            <>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Diversifiez vos sources de revenus pour équilibrer votre modèle économique.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Analysez la concurrence pour identifier des niches où vous pourriez pratiquer des tarifs plus élevés.</span>
              </li>
            </>
          )}
          
          <li className="flex items-start">
            <svg className="w-4 h-4 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Augmentez la part des abonnements pour stabiliser vos revenus mensuels.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
