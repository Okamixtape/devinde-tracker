'use client';

import React from 'react';
import { WebVitals, PerformanceMetricType } from '../../services/core/performance-service';

interface PerformancePanelProps {
  webVitals: WebVitals;
  performanceEntries: any[];
}

/**
 * Panneau de Performance
 * 
 * Affiche les métriques Core Web Vitals et d'autres données de performance.
 */
export default function PerformancePanel({ webVitals, performanceEntries }: PerformancePanelProps) {
  // Filtrer les entrées par type
  const pageLoads = performanceEntries.filter(entry => entry.type === PerformanceMetricType.PAGE_LOAD);
  const resourceLoads = performanceEntries.filter(entry => entry.type === PerformanceMetricType.RESOURCE_LOAD);
  const apiCalls = performanceEntries.filter(entry => entry.type === PerformanceMetricType.API_CALL);

  // Fonction pour formater les millisecondes
  const formatTime = (ms?: number): string => {
    if (ms === undefined) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Fonction pour déterminer la classe de couleur en fonction de la valeur
  const getColorClass = (value: number | undefined, good: number, medium: number): string => {
    if (value === undefined) return 'text-gray-500';
    if (value <= good) return 'text-green-500';
    if (value <= medium) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Fonction pour obtenir l'évaluation basée sur Core Web Vitals
  const getWebVitalRating = (type: keyof WebVitals): string => {
    const value = webVitals[type];
    if (value === undefined) return 'N/A';
    
    switch (type) {
      case 'lcp':
        return value <= 2500 ? 'Bon' : value <= 4000 ? 'Amélioration nécessaire' : 'Faible';
      case 'fid':
        return value <= 100 ? 'Bon' : value <= 300 ? 'Amélioration nécessaire' : 'Faible';
      case 'cls':
        return value <= 0.1 ? 'Bon' : value <= 0.25 ? 'Amélioration nécessaire' : 'Faible';
      case 'ttfb':
        return value <= 300 ? 'Bon' : value <= 600 ? 'Amélioration nécessaire' : 'Faible';
      case 'fcp':
        return value <= 1000 ? 'Bon' : value <= 2500 ? 'Amélioration nécessaire' : 'Faible';
      default:
        return 'N/A';
    }
  };

  // Fonction pour calculer la moyenne des durées
  const calculateAverage = (entries: any[]): number => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Métriques de Performance</h2>
      
      {/* Web Vitals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Core Web Vitals</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Métriques clés qui mesurent la qualité de l'expérience utilisateur sur le web.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* LCP Card */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Largest Contentful Paint
                </h4>
                <p className={`text-2xl font-bold ${getColorClass(webVitals.lcp, 2500, 4000)}`}>
                  {formatTime(webVitals.lcp)}
                </p>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                webVitals.lcp ? 
                  webVitals.lcp <= 2500 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  webVitals.lcp <= 4000 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {getWebVitalRating('lcp')}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Mesure le temps de chargement de l'élément le plus volumineux à l'écran.
            </p>
          </div>
          
          {/* FID Card */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  First Input Delay
                </h4>
                <p className={`text-2xl font-bold ${getColorClass(webVitals.fid, 100, 300)}`}>
                  {formatTime(webVitals.fid)}
                </p>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                webVitals.fid ? 
                  webVitals.fid <= 100 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  webVitals.fid <= 300 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {getWebVitalRating('fid')}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Mesure le délai entre la première interaction et la réponse du navigateur.
            </p>
          </div>
          
          {/* CLS Card */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cumulative Layout Shift
                </h4>
                <p className={`text-2xl font-bold ${getColorClass(webVitals.cls, 0.1, 0.25)}`}>
                  {webVitals.cls !== undefined ? webVitals.cls.toFixed(2) : 'N/A'}
                </p>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                webVitals.cls !== undefined ? 
                  webVitals.cls <= 0.1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  webVitals.cls <= 0.25 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {getWebVitalRating('cls')}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Mesure la stabilité visuelle pendant le chargement.
            </p>
          </div>
        </div>
      </div>
      
      {/* Métriques additionnelles */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Métriques additionnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chargement de page */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Chargement de Page
            </h4>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatTime(calculateAverage(pageLoads))}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Moyenne ({pageLoads.length} pages)
            </p>
          </div>
          
          {/* Chargement des ressources */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
              Ressources
            </h4>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatTime(calculateAverage(resourceLoads))}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Moyenne ({resourceLoads.length} ressources)
            </p>
          </div>
          
          {/* API Calls */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Appels API
            </h4>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {formatTime(calculateAverage(apiCalls))}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Moyenne ({apiCalls.length} appels)
            </p>
          </div>
          
          {/* TTFB */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
              Time to First Byte
            </h4>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {formatTime(webVitals.ttfb)}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {getWebVitalRating('ttfb')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tableau des entrées récentes */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Entrées Récentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nom</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Page</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Durée</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {performanceEntries.slice(0, 5).map((entry, index) => (
                <tr key={entry.id || index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{entry.type}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{entry.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{entry.page}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatTime(entry.duration)}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {performanceEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Aucune donnée disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
