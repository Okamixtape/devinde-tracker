/**
 * Migration Initialization
 * 
 * Ce module initialise le système de migration et s'exécute automatiquement
 * au démarrage de l'application pour appliquer les migrations si nécessaire.
 */
import { Migration } from '../interfaces/migrationService';
import { 
  getCurrentVersion, 
  setVersion, 
  compareVersions, 
  createBackup,
  restoreLatestBackup 
} from "./migrationManager";
import { migrations, getLatestMigrationVersion } from './index';

/**
 * Initialise le système de migration et applique les migrations si nécessaire
 * Cette fonction est appelée au démarrage de l'application
 */
export async function initMigrations(): Promise<void> {
  console.log('Initialisation du système de migration...');
  
  try {
    // Récupérer la version actuelle et la version cible
    const currentVersion = getCurrentVersion();
    const latestVersion = getLatestMigrationVersion();
    
    // Vérifier si des migrations sont nécessaires
    if (compareVersions(currentVersion, latestVersion) < 0) {
      console.log(`Des migrations sont disponibles (${currentVersion} -> ${latestVersion}). Création d'une sauvegarde...`);
      
      // Créer une sauvegarde avant de commencer les migrations
      const backupSuccess = createBackup();
      
      if (!backupSuccess) {
        console.warn('Échec de la création de la sauvegarde. Abandon des migrations.');
        return;
      }
      
      console.log('Sauvegarde créée. Application des migrations...');
      
      // Filtrer les migrations à appliquer
      const migrationsToApply = migrations.filter((migration: Migration) =>
        compareVersions(migration.targetVersion, currentVersion) > 0 &&
        compareVersions(migration.targetVersion, latestVersion) <= 0
      );

      // Appliquer chaque migration séquentiellement
      let success = true;
      let currentData: unknown = null;
      let appliedCount = 0;
      
      for (const migration of migrationsToApply) {
        try {
          console.log(`Applying migration to version ${migration.targetVersion}`);
          
          // Appliquer la migration
          const result = await migration.migrationFn(currentData);
          
          if (!result.success) {
            console.error(`Échec de la migration vers ${migration.targetVersion}:`);
            success = false;
            break;
          }
          
          // Mettre à jour les données courantes et la version
          currentData = result.data;
          setVersion(migration.targetVersion);
          console.log(`Successfully migrated to version ${migration.targetVersion}`);
          appliedCount++;
        } catch (error) {
          console.error(`Erreur pendant la migration vers ${migration.targetVersion}:`, error);
          success = false;
          break;
        }
      }
      
      // Vérifier si toutes les migrations ont réussi
      if (success) {
        console.log(`Migrations appliquées avec succès! (${appliedCount} migration(s))`);
      } else {
        console.error('Échec de l\'application des migrations. Restauration...');
        const restored = restoreLatestBackup();
        if (restored) {
          console.log('Données restaurées avec succès depuis la sauvegarde.');
        } else {
          console.error('Échec de la restauration depuis la sauvegarde.');
        }
      }
    } else {
      console.log(`Aucune migration nécessaire. Version des données à jour (${currentVersion}).`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des migrations:', error);
  }
}

// Exporter une instance singleton pour faciliter l'accès
export const migrationSystem = {
  init: initMigrations
};
