'use client';

import React, { useState } from 'react';
import { ErrorType, ErrorStatus, ErrorData } from '@/app/services/core/errorTrackingService';

// Définir l'enum ErrorSeverity ici aussi pour éviter les problèmes d'importation
enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

interface ErrorsPanelProps {
  errors: ErrorData[];
}

/**
 * Panneau d'Erreurs
 * 
 * Affiche les erreurs détectées par le service de tracking d'erreurs.
 * Permet de filtrer et d'analyser les erreurs par type, sévérité et statut.
 */
export default function ErrorsPanel({ errors }: ErrorsPanelProps) {
  const [filter, setFilter] = useState<{
    type?: ErrorType;
    severity?: ErrorSeverity;
    status?: ErrorStatus;
  }>({});

  // Appliquer les filtres aux erreurs
  const filteredErrors = errors.filter(error => {
    if (filter.type && error.type !== filter.type) return false;
    if (filter.severity && error.severity !== filter.severity) return false;
    if (filter.status && error.status !== filter.status) return false;
    return true;
  });

  // Compter les erreurs par type
  const errorCounts = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Compter les erreurs par sévérité
  const severityCounts = errors.reduce((acc, error) => {
    acc[error.severity] = (acc[error.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fonction pour formatter la date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Fonction pour obtenir la classe de couleur en fonction de la sévérité
  const getSeverityColorClass = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case ErrorSeverity.ERROR:
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case ErrorSeverity.WARNING:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case ErrorSeverity.INFO:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusColorClass = (status: ErrorStatus): string => {
    switch (status) {
      case ErrorStatus.NEW:
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case ErrorStatus.ACKNOWLEDGED:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case ErrorStatus.RESOLVED:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case ErrorStatus.IGNORED:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Suivi des Erreurs</h2>
      
      {/* Résumé */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Résumé</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribution par type */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
            <h4 className="text-lg font-medium mb-3">Distribution par Type</h4>
            {Object.keys(errorCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(errorCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{
                        backgroundColor: type === ErrorType.JAVASCRIPT ? '#3b82f6' :
                                        type === ErrorType.API ? '#8b5cf6' :
                                        type === ErrorType.NETWORK ? '#ef4444' :
                                        type === ErrorType.RESOURCE ? '#f59e0b' :
                                        type === ErrorType.PROMISE ? '#10b981' :
                                        '#6b7280'
                      }}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune erreur enregistrée</p>
            )}
          </div>
          
          {/* Distribution par sévérité */}
          <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
            <h4 className="text-lg font-medium mb-3">Distribution par Sévérité</h4>
            {Object.keys(severityCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(severityCounts).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{
                        backgroundColor: severity === ErrorSeverity.CRITICAL ? '#dc2626' :
                                        severity === ErrorSeverity.ERROR ? '#ea580c' :
                                        severity === ErrorSeverity.WARNING ? '#eab308' :
                                        severity === ErrorSeverity.INFO ? '#3b82f6' :
                                        '#6b7280'
                      }}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{severity}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune erreur enregistrée</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Filtres</h3>
        <div className="flex flex-wrap gap-4">
          {/* Filtre par type */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type-filter"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value === '' ? undefined : e.target.value as ErrorType }))}
            >
              <option value="">Tous</option>
              {Object.values(ErrorType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Filtre par sévérité */}
          <div>
            <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sévérité
            </label>
            <select
              id="severity-filter"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              value={filter.severity || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value === '' ? undefined : e.target.value as ErrorSeverity }))}
            >
              <option value="">Toutes</option>
              {Object.values(ErrorSeverity).map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>
          
          {/* Filtre par statut */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut
            </label>
            <select
              id="status-filter"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              value={filter.status || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value === '' ? undefined : e.target.value as ErrorStatus }))}
            >
              <option value="">Tous</option>
              {Object.values(ErrorStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          {/* Bouton de réinitialisation */}
          <div className="self-end">
            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des erreurs */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Liste des Erreurs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Message</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Sévérité</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Statut</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Occurrences</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Dernière occurrence</th>
              </tr>
            </thead>
            <tbody>
              {filteredErrors.length > 0 ? (
                filteredErrors.map((error, index) => (
                  <tr key={error.id || index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="truncate max-w-xs" title={error.message}>
                        {error.message}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {error.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColorClass(error.severity)}`}>
                        {error.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(error.status)}`}>
                        {error.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300">
                      {/* Nombre d'occurrences n'est plus disponible dans la nouvelle structure */}
                      1
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(error.timestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {errors.length > 0 ? 'Aucune erreur correspondant aux filtres' : 'Aucune erreur enregistrée'}
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
