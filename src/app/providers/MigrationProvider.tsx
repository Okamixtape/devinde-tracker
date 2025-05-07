'use client';

import React, { useEffect, useState } from 'react';
import { migrationSystem } from "@/app/services/migrations/migrationInit";

interface MigrationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider responsable de l'initialisation du système de migration
 * et de l'application des migrations au démarrage de l'application
 */
export function MigrationProvider({ children }: MigrationProviderProps) {
  const [migrationsInitialized, setMigrationsInitialized] = useState(false);
  const [migrationError, setMigrationError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialiser les migrations au montage du composant
    async function runMigrations() {
      try {
        await migrationSystem.init();
        setMigrationsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des migrations:', error);
        setMigrationError(error instanceof Error ? error : new Error('Erreur inconnue'));
      }
    }

    runMigrations();
  }, []);

  // Afficher un indicateur de chargement pendant l'initialisation des migrations
  if (!migrationsInitialized && !migrationError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Vérification et mise à jour de la structure des données...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur en cas d'échec des migrations
  if (migrationError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">
            Erreur de migration des données
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Une erreur est survenue lors de la mise à jour de la structure des données. 
            Certaines fonctionnalités pourraient ne pas fonctionner correctement.
          </p>
          <pre className="text-sm bg-red-100 dark:bg-red-900/50 p-3 rounded overflow-auto max-h-32 text-left">
            {migrationError.message}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Migrations réussies, afficher les enfants
  return <>{children}</>;
}
