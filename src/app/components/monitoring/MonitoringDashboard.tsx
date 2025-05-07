'use client';

import React, { useState, useEffect } from 'react';
import PerformancePanel from './PerformancePanel';
import ErrorsPanel from './ErrorsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import { analyticsService, AnalyticsEventType } from '@/app/services/core/analyticsService';
import { performanceService, PerformanceMetricType, WebVitals } from '@/app/services/core/performanceService';
import { errorTrackingService, ErrorType, ErrorStatus } from '@/app/services/core/errorTrackingService';

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

/**
 * Tableau de bord de monitoring
 * 
 * Affiche trois panneaux principaux :
 * 1. Performance - Affiche les métriques de performance de l'application
 * 2. Erreurs - Affiche les erreurs détectées et leur distribution
 * 3. Analytique - Affiche les statistiques d'utilisation
 */
export default function MonitoringDashboard() {
  // État pour les données de chaque panneau
  const [webVitals, setWebVitals] = useState<WebVitals>({});
  const [performanceEntries, setPerformanceEntries] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'performance' | 'errors' | 'analytics'>('performance');

  // Charger les données lors du montage du composant
  useEffect(() => {
    // Charger les données de performance
    const vitals = performanceService.getWebVitals();
    setWebVitals(vitals);
    setPerformanceEntries(performanceService.getEntries());

    // Charger les erreurs
    setErrors(errorTrackingService.getErrors());

    // Charger les données analytiques
    setAnalytics(analyticsService.getEvents());

    // Mettre à jour périodiquement (toutes les 30 secondes)
    const interval = setInterval(() => {
      setWebVitals(performanceService.getWebVitals());
      setPerformanceEntries(performanceService.getEntries());
      setErrors(errorTrackingService.getErrors());
      setAnalytics(analyticsService.getEvents());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Générer des données de test si aucune donnée réelle n'est disponible
  useEffect(() => {
    if (performanceEntries.length === 0) {
      generateTestPerformanceData();
    }

    if (errors.length === 0) {
      generateTestErrorData();
    }

    if (analytics.length === 0) {
      generateTestAnalyticsData();
    }
  }, [performanceEntries, errors, analytics]);

  // Génère des données de test pour la démonstration
  const generateTestPerformanceData = () => {
    // Simuler des données Web Vitals
    const mockWebVitals = {
      lcp: 2450,
      fid: 70,
      cls: 0.12,
      ttfb: 280,
      fcp: 950
    };
    
    // Simuler des entrées de performance
    const mockEntries = [
      {
        id: '1',
        type: PerformanceMetricType.PAGE_LOAD,
        name: 'page-load',
        timestamp: Date.now() - 600000,
        duration: 1250,
        session: 'test-session',
        page: '/plans/1',
        details: { url: '/plans/1' }
      },
      {
        id: '2',
        type: PerformanceMetricType.RESOURCE_LOAD,
        name: 'main.js',
        timestamp: Date.now() - 590000,
        duration: 350,
        session: 'test-session',
        page: '/plans/1',
        details: { initiatorType: 'script', size: 245000 }
      },
      {
        id: '3',
        type: PerformanceMetricType.API_CALL,
        name: '/api/plans',
        timestamp: Date.now() - 580000,
        duration: 520,
        session: 'test-session',
        page: '/plans/1',
        details: { status: 200, success: true }
      }
    ];
    
    setWebVitals(mockWebVitals);
    setPerformanceEntries(mockEntries);
  };

  const generateTestErrorData = () => {
    // Simuler des erreurs
    const mockErrors = [
      {
        id: '1',
        timestamp: Date.now() - 300000,
        type: ErrorType.JAVASCRIPT,
        message: "Cannot read property 'length' of undefined",
        stack: "TypeError: Cannot read property 'length' of undefined\n    at processData (app.js:143)\n    at handleClick (app.js:89)",
        url: '/plans/1',
        path: '/plans/1',
        severity: ErrorSeverity.ERROR,
        status: ErrorStatus.NEW,
        occurrence: 3,
        browserInfo: { userAgent: navigator.userAgent }
      },
      {
        id: '2',
        timestamp: Date.now() - 150000,
        type: ErrorType.API,
        message: "API Error: Failed to fetch data",
        url: '/plans/2',
        path: '/plans/2',
        severity: ErrorSeverity.WARNING,
        status: ErrorStatus.NEW,
        occurrence: 1,
        browserInfo: { userAgent: navigator.userAgent }
      }
    ];
    
    setErrors(mockErrors);
  };

  const generateTestAnalyticsData = () => {
    // Simuler des données analytiques
    const mockAnalytics = [
      {
        id: '1',
        type: AnalyticsEventType.PAGE_VIEW,
        timestamp: Date.now() - 600000,
        path: '/plans/1',
      },
      {
        id: '2',
        type: AnalyticsEventType.BUTTON_CLICK,
        timestamp: Date.now() - 590000,
        properties: {
          buttonId: 'save-plan',
          buttonText: 'Enregistrer'
        },
        path: '/plans/1'
      },
      {
        id: '3',
        type: AnalyticsEventType.FORM_SUBMIT,
        timestamp: Date.now() - 580000,
        properties: {
          formId: 'plan-form'
        },
        path: '/plans/1'
      }
    ];
    
    setAnalytics(mockAnalytics);
  };

  // Fonction pour changer l'onglet actif
  const changeTab = (tab: 'performance' | 'errors' | 'analytics') => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Onglets de navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => changeTab('performance')}
          className={`flex-1 py-4 px-6 text-center font-medium ${
            activeTab === 'performance'
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => changeTab('errors')}
          className={`flex-1 py-4 px-6 text-center font-medium ${
            activeTab === 'errors'
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Erreurs
        </button>
        <button
          onClick={() => changeTab('analytics')}
          className={`flex-1 py-4 px-6 text-center font-medium ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Analytique
        </button>
      </div>

      {/* Contenu du tableau de bord */}
      <div className="p-6">
        {activeTab === 'performance' && (
          <PerformancePanel webVitals={webVitals} performanceEntries={performanceEntries} />
        )}

        {activeTab === 'errors' && (
          <ErrorsPanel errors={errors} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel analytics={analytics} />
        )}
      </div>
    </div>
  );
}
