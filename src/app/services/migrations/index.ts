/**
 * Migration Registry
 * 
 * Ce module centralise toutes les migrations de données disponibles
 * et contient les fonctions permettant de les initialiser au démarrage de l'application.
 */
import { Migration, MigrationService } from '../interfaces/migrationService';
import { ServiceResult } from "../interfaces/dataModels";

/**
 * Collection des migrations disponibles par ordre chronologique
 */
export const migrations: Migration[] = [];

/**
 * Ajoute une nouvelle migration à la version 1.1.0
 * Cette migration ajoute un champ 'active' aux sections
 */
migrations.push({
  targetVersion: '1.1.0',
  description: 'Ajoute le champ active aux sections',
  migrationFn: async (data: any): Promise<ServiceResult<any>> => {
    try {
      // Récupérer toutes les données de sections dans localStorage
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('devinde-tracker-sections')
      );
      
      for (const key of storageKeys) {
        try {
          const sectionsJson = localStorage.getItem(key);
          if (sectionsJson) {
            const sections = JSON.parse(sectionsJson);
            
            // Ajouter le champ 'active' à chaque section si manquant
            if (Array.isArray(sections)) {
              const updatedSections = sections.map(section => ({
                ...section,
                active: section.active !== undefined ? section.active : true
              }));
              
              // Sauvegarder les sections mises à jour
              localStorage.setItem(key, JSON.stringify(updatedSections));
            }
          }
        } catch (error) {
          console.warn(`Erreur lors de la migration de ${key}:`, error);
        }
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: `Échec de la migration 1.1.0: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          details: error
        }
      };
    }
  }
});

/**
 * Ajoute une nouvelle migration à la version 1.2.0
 * Cette migration ajoute un timestamp de dernière modification aux plans d'affaires
 */
migrations.push({
  targetVersion: '1.2.0',
  description: 'Ajoute un timestamp de dernière modification aux plans d\'affaires',
  migrationFn: async (data: any): Promise<ServiceResult<any>> => {
    try {
      // Récupérer toutes les données des plans d'affaires dans localStorage
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('devinde-tracker-business-plans')
      );
      
      for (const key of storageKeys) {
        try {
          const plansJson = localStorage.getItem(key);
          if (plansJson) {
            const plans = JSON.parse(plansJson);
            
            // Ajouter le champ 'lastModified' à chaque plan si manquant
            if (Array.isArray(plans)) {
              const updatedPlans = plans.map(plan => ({
                ...plan,
                lastModified: plan.lastModified || plan.createdAt || new Date().toISOString()
              }));
              
              // Sauvegarder les plans mis à jour
              localStorage.setItem(key, JSON.stringify(updatedPlans));
            }
          }
        } catch (error) {
          console.warn(`Erreur lors de la migration de ${key}:`, error);
        }
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: `Échec de la migration 1.2.0: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          details: error
        }
      };
    }
  }
});

/**
 * Ajoute une nouvelle migration à la version 1.3.0
 * Cette migration ajoute un champ 'version' aux projets financiers
 */
migrations.push({
  targetVersion: '1.3.0',
  description: 'Ajoute un champ version aux projets financiers',
  migrationFn: async (data: any): Promise<ServiceResult<any>> => {
    try {
      // Récupérer toutes les données des projets financiers dans localStorage
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('devinde-tracker-financial-projects')
      );
      
      for (const key of storageKeys) {
        try {
          const projectsJson = localStorage.getItem(key);
          if (projectsJson) {
            const projects = JSON.parse(projectsJson);
            
            // Ajouter le champ 'version' à chaque projet si manquant
            if (Array.isArray(projects)) {
              const updatedProjects = projects.map(project => ({
                ...project,
                version: project.version || '1.0'
              }));
              
              // Sauvegarder les projets mis à jour
              localStorage.setItem(key, JSON.stringify(updatedProjects));
            }
          }
        } catch (error) {
          console.warn(`Erreur lors de la migration de ${key}:`, error);
        }
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: `Échec de la migration 1.3.0: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          details: error
        }
      };
    }
  }
});

/**
 * Enregistre toutes les migrations disponibles auprès du service de migration
 */
export function registerMigrations(migrationService: MigrationService): void {
  migrations.forEach(migration => {
    migrationService.registerMigration(migration);
  });
}

/**
 * Retourne la dernière version de migration disponible
 */
export function getLatestMigrationVersion(): string {
  if (migrations.length === 0) {
    return '1.0.0';
  }
  
  return migrations[migrations.length - 1].targetVersion;
}

/**
 * Retourne toutes les migrations disponibles
 */
export function getAvailableMigrations(): Migration[] {
  return [...migrations];
}
