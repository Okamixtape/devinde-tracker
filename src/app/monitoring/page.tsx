'use client';

import { useState, useEffect } from 'react';
import MonitoringDashboard from "@/app/components/monitoring/MonitoringDashboard";

/**
 * Monitoring Page
 * 
 * Affiche le tableau de bord de monitoring pour les performances,
 * les erreurs et l'analytique utilisateur.
 */
export default function MonitoringPage() {
  const [isClient, setIsClient] = useState(false);

  // Utilisation d'un effet pour s'assurer que le code s'exécute uniquement côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord de monitoring</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualisez les performances, les erreurs et les interactions utilisateur de votre application.
        </p>
      </div>
      
      <MonitoringDashboard />
    </main>
  );
}
