/**
 * MigrationManager - Gestion simplifiée des migrations
 * 
 * Ce module fournit des fonctions simples et robustes pour gérer 
 * les versions de données et les migrations, en utilisant directement 
 * localStorage pour éviter les problèmes de typage.
 */

// Clés utilisées pour le stockage
const VERSION_KEY = 'devinde-tracker-data-version-plain';
const BACKUP_PREFIX = 'devinde-tracker-backup-';

/**
 * Récupère la version actuelle des données
 * @returns La version actuelle ou '1.0.0' si aucune version n'est définie
 */
export function getCurrentVersion(): string {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    return version || '1.0.0';
  } catch (error) {
    console.error('Erreur lors de la récupération de la version:', error);
    return '1.0.0';
  }
}

/**
 * Définit la version actuelle des données
 * @param version La nouvelle version à définir
 */
export function setVersion(version: string): void {
  try {
    localStorage.setItem(VERSION_KEY, version);
    console.log(`Version mise à jour: ${version}`);
  } catch (error) {
    console.error('Erreur lors de la définition de la version:', error);
  }
}

/**
 * Compare deux versions sémantiques
 * @param v1 Première version
 * @param v2 Deuxième version
 * @returns -1 si v1 < v2, 0 si v1 === v2, 1 si v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;
    
    if (part1 !== part2) {
      return part1 < part2 ? -1 : 1;
    }
  }
  
  return 0;
}

/**
 * Crée une sauvegarde des données actuelles
 * @returns true si la sauvegarde a réussi, false sinon
 */
export function createBackup(): boolean {
  try {
    // Collecte toutes les données du localStorage
    const timestamp = new Date().toISOString();
    const backupKey = `${BACKUP_PREFIX}${timestamp}`;
    const data: Record<string, string> = {};
    
    // Sauvegarder toutes les clés pertinentes
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('devinde-tracker') && !key.startsWith(BACKUP_PREFIX)) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    
    // Stocker la sauvegarde
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // Conserver seulement les 3 dernières sauvegardes
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BACKUP_PREFIX)) {
        backupKeys.push(key);
      }
    }
    
    backupKeys.sort().reverse();
    backupKeys.slice(3).forEach(key => localStorage.removeItem(key));
    
    console.log(`Sauvegarde créée : ${backupKey}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error);
    return false;
  }
}

/**
 * Restaure la dernière sauvegarde
 * @returns true si la restauration a réussi, false sinon
 */
export function restoreLatestBackup(): boolean {
  try {
    // Trouver la dernière sauvegarde
    let latestBackupKey = '';
    let latestTimestamp = '';
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BACKUP_PREFIX)) {
        const timestamp = key.substring(BACKUP_PREFIX.length);
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestBackupKey = key;
        }
      }
    }
    
    if (!latestBackupKey) {
      console.warn('Aucune sauvegarde trouvée pour la restauration');
      return false;
    }
    
    // Restaurer à partir de la sauvegarde
    const backupData = localStorage.getItem(latestBackupKey);
    if (!backupData) {
      console.warn('Sauvegarde vide');
      return false;
    }
    
    const data = JSON.parse(backupData) as Record<string, string>;
    
    // Restaurer chaque clé
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    console.log(`Données restaurées à partir de : ${latestBackupKey}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    return false;
  }
}
