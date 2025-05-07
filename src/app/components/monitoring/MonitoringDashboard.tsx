'use client';

import React, { useState, useEffect } from 'react';
import * as TabsUI from '@headlessui/react';
import { performanceService, WebVitals, PerformanceEntry, PerformanceMetricType } from '@/app/services/core/performanceService';
import { errorTrackingService, ErrorData, ErrorType, ErrorStatus } from '@/app/services/core/errorTrackingService';
import { analyticsService, AnalyticsEvent, AnalyticsEventType } from '@/app/services/core/analyticsService';
import PerformancePanel from './PerformancePanel';
import ErrorsPanel from './ErrorsPanel';
import AnalyticsPanel from './AnalyticsPanel';

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
  // Utilisation de types spécifiques pour les données de monitoring
  const [performanceEntries, setPerformanceEntries] = useState<PerformanceEntry[]>([]);
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
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
      LCP: 2450,
      FID: 70,
      CLS: 0.12,
      TTFB: 280,
      FCP: 950
    };
    
    // Simuler des entrées de performance
    const mockEntries: PerformanceEntry[] = [
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
    const mockErrors: ErrorData[] = [
      {
        id: 'e1',
        timestamp: Date.now() - 500000,
        type: ErrorType.JAVASCRIPT,
        message: "Cannot read property 'value' of undefined",
        stack: "TypeError: Cannot read property 'value' of undefined at getData (app.js:123)",
        url: 'https://devinde-tracker.app',
        path: '/dashboard',
        severity: ErrorSeverity.HIGH,
        status: ErrorStatus.NEW,
        occurrence: 3,
        sessionId: 'test-session-1',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      },
      {
        id: 'e2',
        timestamp: Date.now() - 450000,
        type: ErrorType.NETWORK,
        message: "Failed to fetch data: Network error",
        stack: "Error: Failed to fetch at fetchData (api.js:45)",
        url: 'https://devinde-tracker.app',
        path: '/plans',
        severity: ErrorSeverity.MEDIUM,
        status: ErrorStatus.RESOLVED,
        occurrence: 1,
        sessionId: 'test-session-1',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      }
    ];
    
    setErrors(mockErrors);
  };

  const generateTestAnalyticsData = () => {
    // Simuler des données d'analytics
    const mockAnalytics: AnalyticsEvent[] = [
      {
        id: 'a1',
        type: AnalyticsEventType.PAGE_VIEW,
        timestamp: Date.now() - 400000,
        path: '/dashboard',
        sessionId: 'test-session-1',
        anonymousId: 'anon-123'
      },
      {
        id: 'a2',
        type: AnalyticsEventType.BUTTON_CLICK,
        timestamp: Date.now() - 390000,
        properties: {
          buttonId: 'create-plan',
          buttonText: 'Créer un plan'
        },
        path: '/dashboard',
        sessionId: 'test-session-1',
        anonymousId: 'anon-123'
      },
      {
        id: 'a3',
        type: AnalyticsEventType.FORM_SUBMIT,
        timestamp: Date.now() - 380000,
        properties: {
          formId: 'plan-form',
          success: true
        },
        path: '/plans/new',
        sessionId: 'test-session-1',
        anonymousId: 'anon-123'
      }
    ];
    
    setAnalytics(mockAnalytics);
  };

  // Fonction pour gérer le changement d'onglet via headlessUI Tabs
  const handleTabChange = (index: number) => {
    if (index === 0) setActiveTab('performance');
    else if (index === 1) setActiveTab('errors');
    else setActiveTab('analytics');
  };
  
  // Conversion de l'activeTab string en index pour headlessUI
  const tabIndex = activeTab === 'performance' ? 0 : activeTab === 'errors' ? 1 : 2;
  
  // Map des noms d'onglets
  const tabs = {
    performance: 'Performance',
    errors: 'Erreurs',
    analytics: 'Analytique'
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <TabsUI.Tab.Group selectedIndex={tabIndex} onChange={handleTabChange}>
          <TabsUI.Tab.List className="flex space-x-1 p-1">
            {Object.entries(tabs).map(([key, label]) => (
              <TabsUI.Tab
                key={key}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
                  ${selected ? 'bg-blue-100 dark:bg-blue-900 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`
                }
              >
                {label}
              </TabsUI.Tab>
            ))}
          </TabsUI.Tab.List>
          <TabsUI.Tab.Panels className="p-4">
            <TabsUI.Tab.Panel>
              <PerformancePanel 
                webVitals={webVitals} 
                performanceEntries={performanceEntries}
              />
            </TabsUI.Tab.Panel>
            <TabsUI.Tab.Panel>
              <ErrorsPanel errors={errors} />
            </TabsUI.Tab.Panel>
            <TabsUI.Tab.Panel>
              <AnalyticsPanel events={analytics} />
            </TabsUI.Tab.Panel>
          </TabsUI.Tab.Panels>
        </TabsUI.Tab.Group>
      </div>
    </div>
  );
}
