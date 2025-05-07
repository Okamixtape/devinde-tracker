'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsEventType, AnalyticsEvent } from '@/app/services/core/analyticsService';

interface AnalyticsPanelProps {
  events: AnalyticsEvent[];
}

/**
 * Panneau d'Analytique
 * 
 * Affiche les données d'analytique utilisateur collectées par l'application.
 * Permet de visualiser les tendances d'interaction, les pages les plus vues, et les actions des utilisateurs.
 */
export default function AnalyticsPanel({ events }: AnalyticsPanelProps) {
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  
  // Filtrer les événements par type sélectionné
  const filteredEvents = useMemo(() => {
    if (!selectedEventType) return events;
    return events.filter(event => event.type === selectedEventType);
  }, [events, selectedEventType]);
  
  // Filtrer les événements par période
  const timeFilteredEvents = useMemo(() => {
    const now = Date.now();
    const cutoffTime = timeFrame === 'day' ? now - 24 * 60 * 60 * 1000 :
                      timeFrame === 'week' ? now - 7 * 24 * 60 * 60 * 1000 :
                      now - 30 * 24 * 60 * 60 * 1000;
    
    return filteredEvents.filter(event => event.timestamp >= cutoffTime);
  }, [filteredEvents, timeFrame]);
  
  // Calculer les compteurs par type d'événement
  const eventTypeCounts = useMemo(() => {
    return timeFilteredEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [timeFilteredEvents]);
  
  // Calculer les pages les plus visitées
  const topPages = useMemo(() => {
    const pageViews = timeFilteredEvents
      .filter(event => event.type === AnalyticsEventType.PAGE_VIEW)
      .reduce((acc, event) => {
        // Obtenir le chemin depuis les propriétés ou utiliser une valeur par défaut
        const path = (event.properties?.path as string) || 'unknown';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [timeFilteredEvents]);
  
  // Calculer le nombre d'utilisateurs uniques (approximatif via sessionId)
  const uniqueUsers = useMemo(() => {
    return new Set(timeFilteredEvents.map(event => event.sessionId)).size;
  }, [timeFilteredEvents]);
  
  // Calculer les boutons les plus cliqués
  // Note: Création mais pas utilisé pour le moment - pourra être ajouté au tableau de bord plus tard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _topButtonClicks = useMemo(() => {
    const buttonClicks = timeFilteredEvents
      .filter(event => event.type === AnalyticsEventType.BUTTON_CLICK)
      .reduce((acc, event) => {
        const buttonId = event.properties?.buttonId as string || 'unknown';
        acc[buttonId] = (acc[buttonId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(buttonClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [timeFilteredEvents]);
  
  // Calculer le taux de conversion (formulaires soumis / pages vues)
  const conversionRate = useMemo(() => {
    const pageViews = timeFilteredEvents.filter(event => event.type === AnalyticsEventType.PAGE_VIEW).length;
    const formSubmits = timeFilteredEvents.filter(event => event.type === AnalyticsEventType.FORM_SUBMIT).length;
    
    if (pageViews === 0) return 0;
    return (formSubmits / pageViews) * 100;
  }, [timeFilteredEvents]);
  
  // Formater la date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytique Utilisateur</h2>
      
      {/* Filtres */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="time-frame" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Période
          </label>
          <select
            id="time-frame"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as 'day' | 'week' | 'month')}
          >
            <option value="day">Dernières 24 heures</option>
            <option value="week">Dernière semaine</option>
            <option value="month">Dernier mois</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type d&#39;événement
          </label>
          <select
            id="event-type"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
          >
            <option value="">Tous</option>
            {Object.values(AnalyticsEventType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="ml-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {timeFilteredEvents.length} événements affichés
          </p>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Nombre d'événements */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Événements
          </h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {timeFilteredEvents.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dernières 24h
          </p>
        </div>
        
        {/* Utilisateurs uniques */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Utilisateurs uniques
          </h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {uniqueUsers}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sessions distinctes
          </p>
        </div>
        
        {/* Pages vues */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pages vues
          </h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {timeFilteredEvents.filter(event => event.type === AnalyticsEventType.PAGE_VIEW).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {topPages.length > 0 ? `Top: ${topPages[0][0]}` : 'Aucune page vue'}
          </p>
        </div>
        
        {/* Taux de conversion */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Taux de conversion
          </h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Soumissions / Pages vues
          </p>
        </div>
      </div>
      
      {/* Distribution d'événements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Distribution par type */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Types d&apos;événements</h3>
          {Object.keys(eventTypeCounts).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(eventTypeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{
                      backgroundColor: type === AnalyticsEventType.PAGE_VIEW ? '#3b82f6' :
                                      type === AnalyticsEventType.BUTTON_CLICK ? '#8b5cf6' :
                                      type === AnalyticsEventType.FORM_SUBMIT ? '#ef4444' :
                                      type === AnalyticsEventType.PLAN_CREATE ? '#f59e0b' :
                                      type === AnalyticsEventType.PLAN_UPDATE ? '#10b981' :
                                      type === AnalyticsEventType.ERROR ? '#dc2626' :
                                      '#6b7280'
                    }}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucun événement enregistré</p>
          )}
        </div>
        
        {/* Top pages */}
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Pages les plus visitées</h3>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map(([page, count], index) => (
                <div key={page} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-medium mr-2">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs" title={page}>
                      {page}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune page vue enregistrée</p>
          )}
        </div>
      </div>
      
      {/* Liste des événements récents */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Événements Récents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Page</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Horodatage</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Détails</th>
              </tr>
            </thead>
            <tbody>
              {timeFilteredEvents.slice(0, 10).map((event, index) => (
                <tr key={event.id || index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {(event.properties?.path as string) || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="max-w-xs truncate">
                      {event.properties ? JSON.stringify(event.properties) : 'Aucun détail'}
                    </div>
                  </td>
                </tr>
              ))}
              {timeFilteredEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Aucun événement enregistré
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
