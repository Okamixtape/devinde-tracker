/**
 * Migration Service Implementation - Handles data schema migrations
 */
import { ServiceResult, ServiceError } from "../interfaces/dataModels";
import { Migration, MigrationService } from '../interfaces/migrationService';
import { migrations } from "../migrations/index";
import { LocalStorageService } from './localStorageService';

// Constants for storage keys
export const DATA_VERSION_KEY = 'devinde-tracker-data-version-plain';
export const DATA_BACKUP_KEY = 'devinde-tracker-data-backup';

/**
 * Implementation of MigrationService that handles data schema migrations
 * using semver-style versioning (major.minor.patch)
 */
export class MigrationServiceImpl implements MigrationService {
  private readonly versionStorage: LocalStorageService<{ id: string; value: string }>;
  private readonly migrations: Migration[] = [];

  /**
   * Create a new MigrationServiceImpl instance
   */
  constructor() {
    this.versionStorage = new LocalStorageService<{ id: string; value: string }>(DATA_VERSION_KEY);
  }
  
  /**
   * Get the current data version from storage
   * Returns the default version if none is set
   */
  async getCurrentVersion(): Promise<ServiceResult<string>> {
    try {
      const result = await this.versionStorage.getItems();
      
      if (!result.success || !result.data?.length) {
        return {
          success: true,
          data: this.getDefaultVersion()
        };
      }
      
      return {
        success: true,
        data: result.data[0].value
      };
    } catch (error) {
      console.error('Failed to get current version:', error);
      
      return {
        success: true, // Still return success to avoid blocking app startup
        data: this.getDefaultVersion()
      };
    }
  }
  
  /**
   * Set the current data version in storage after successful migration
   */
  async setVersion(version: string): Promise<ServiceResult<boolean>> {
    try {
      // Clear all existing version entries first
      await this.versionStorage.getItems().then(async result => {
        if (result.success && result.data && result.data.length > 0) {
          for (const item of result.data) {
            if (item && item.id) {
              await this.versionStorage.deleteItem(item.id);
            }
          }
        }
      });
      
      // Store the new version 
      const saveResult = await this.versionStorage.createItem({
        id: 'current',
        value: version
      });
      
      return {
        success: saveResult.success,
        data: saveResult.success,
        error: saveResult.error
      };
    } catch (error) {
      console.error('Failed to save current version:', error);
      
      return {
        success: false,
        data: false,
        error: {
          code: 'VERSION_SAVE_ERROR',
          message: 'Failed to save data version',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Register a new migration to be applied when needed
   */
  registerMigration(migration: Migration): void {
    if (!migration) {
      return;
    }
    
    this.migrations.push(migration);
    
    // Sort migrations by version (oldest first)
    this.migrations.sort((a, b) => {
      return this.compareVersions(a.targetVersion, b.targetVersion);
    });
  }
  
  /**
   * Register multiple migrations to be run when needed (helper method)
   */
  registerMigrations(migrations: Migration[]): void {
    if (!migrations || !Array.isArray(migrations)) {
      return;
    }
    
    this.migrations.push(...migrations);
    
    // Sort migrations by version (oldest first)
    this.migrations.sort((a, b) => {
      return this.compareVersions(a.targetVersion, b.targetVersion);
    });
  }
  
  /**
   * Apply all necessary migrations from current version to target version
   */
  async applyMigrations(currentVersion?: string, targetVersion?: string): Promise<ServiceResult<boolean>> {
    try {
      // If no current version provided, get it from storage
      if (!currentVersion) {
        const versionResult = await this.getCurrentVersion();
        if (!versionResult.success) {
          return {
            success: false,
            data: false,
            error: versionResult.error
          };
        }
        currentVersion = versionResult.data;
      }
      
      // Find migrations that need to be run
      let migrationsToRun = this.migrations.filter(migration => {
        return this.compareVersions(migration.targetVersion, currentVersion!) > 0;
      });
      
      // If target version specified, only run migrations up to that version
      if (targetVersion) {
        migrationsToRun = migrationsToRun.filter(migration => {
          return this.compareVersions(migration.targetVersion, targetVersion) <= 0;
        });
      }
      
      // If no migrations needed
      if (migrationsToRun.length === 0) {
        return { success: true, data: false };
      }
      
      console.log(`Running ${migrationsToRun.length} migrations from ${currentVersion}...`);
      
      // Create backup before running migrations
      const backupResult = await this.createBackup();
      if (!backupResult.success) {
        console.warn('Failed to create backup before migrations');
      }
      
      // Run migrations in order
      let migrationsRun = false;
      for (const migration of migrationsToRun) {
        try {
          console.log(`Migrating to ${migration.targetVersion}: ${migration.description || 'No description'}`);
          const result = await migration.migrationFn({});
          
          if (!result.success) {
            return {
              success: false,
              data: migrationsRun,
              error: result.error || {
                code: 'MIGRATION_FUNCTION_ERROR',
                message: `Migration to ${migration.targetVersion} function failed`,
                details: 'No detailed error provided'
              }
            };
          }
          
          migrationsRun = true;
          
          // Update version after each successful migration
          await this.setVersion(migration.targetVersion);
        } catch (error) {
          console.error(`Migration to ${migration.targetVersion} failed:`, error);
          
          return {
            success: false,
            data: migrationsRun,
            error: {
              code: 'MIGRATION_ERROR',
              message: `Migration to version ${migration.targetVersion} failed`,
              details: error instanceof Error ? error.message : String(error)
            }
          };
        }
      }
      
      return {
        success: true,
        data: migrationsRun
      };
    } catch (error) {
      console.error('Migration process failed:', error);
      
      return {
        success: false,
        data: false,
        error: {
          code: 'MIGRATION_PROCESS_ERROR',
          message: 'Migration process failed',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Run all pending migrations (wrapper for applyMigrations)
   */
  async runPendingMigrations(): Promise<ServiceResult<boolean>> {
    return this.applyMigrations();
  }
  
  /**
   * Create a backup of data before applying migrations
   */
  async createBackup(): Promise<ServiceResult<boolean>> {
    try {
      // Simple implementation - could be extended to back up all app data
      const backupStorage = new LocalStorageService<{ id: string; value: string }>(DATA_BACKUP_KEY);
      
      // Store all localStorage keys and values
      const backup: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          backup[key] = localStorage.getItem(key) || '';
        }
      }
      
      // Save backup
      await backupStorage.createItem({
        id: `backup-${Date.now()}`,
        value: JSON.stringify(backup)
      });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      
      return {
        success: false,
        data: false,
        error: {
          code: 'BACKUP_ERROR',
          message: 'Failed to create data backup',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Restore data from the most recent backup
   */
  async restoreFromBackup(): Promise<ServiceResult<boolean>> {
    try {
      const backupStorage = new LocalStorageService<{ id: string; value: string }>(DATA_BACKUP_KEY);
      const backupsResult = await backupStorage.getItems();
      
      if (!backupsResult.success || !backupsResult.data?.length) {
        return {
          success: false,
          data: false,
          error: {
            code: 'NO_BACKUP',
            message: 'No backup found to restore from',
            details: ''
          }
        };
      }
      
      // Find the most recent backup
      const latestBackup = backupsResult.data
        .sort((a, b) => b.id.localeCompare(a.id))[0];
      
      if (!latestBackup || !latestBackup.value) {
        return {
          success: false,
          data: false,
          error: {
            code: 'INVALID_BACKUP',
            message: 'Backup data is invalid',
            details: ''
          }
        };
      }
      
      // Parse backup data
      const backupData = JSON.parse(latestBackup.value);
      
      // Restore data from backup
      Object.keys(backupData).forEach(key => {
        localStorage.setItem(key, backupData[key]);
      });
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      
      return {
        success: false,
        data: false,
        error: {
          code: 'RESTORE_ERROR',
          message: 'Failed to restore from backup',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Check if migrations need to be run and run them if needed (legacy method)
   * @deprecated Use runPendingMigrations instead
   */
  async checkAndRunMigrations(): Promise<ServiceResult<boolean>> {
    try {
      // Initialize built-in migrations
      this.registerMigrations(migrations);
      
      // Get current version
      const versionResult = await this.getCurrentVersion();
      if (!versionResult.success) {
        return {
          success: false,
          data: false,
          error: versionResult.error
        };
      }
      
      const currentVersion = versionResult.data || this.getDefaultVersion();
      let migrationsRun = false;
      
      // Find migrations that need to be run
      const pendingMigrations = this.migrations.filter(migration => {
        return this.compareVersions(migration.targetVersion, currentVersion) > 0;
      });
      
      // If no migrations needed
      if (pendingMigrations.length === 0) {
        return { success: true, data: false };
      }
      
      console.log(`Running ${pendingMigrations.length} migrations from ${currentVersion}...`);
      
      // Run migrations in order
      for (const migration of pendingMigrations) {
        try {
          console.log(`Migrating to ${migration.targetVersion}: ${migration.description || 'No description'}`);
          const result = await migration.migrationFn({});
          if (!result.success) {
            return {
              success: false,
              data: migrationsRun,
              error: result.error || {
                code: 'MIGRATION_FUNCTION_ERROR',
                message: `Migration to ${migration.targetVersion} function failed`,
                details: 'No detailed error provided'
              }
            };
          }
          migrationsRun = true;
          
          // Update version after each successful migration
          await this.setVersion(migration.targetVersion);
        } catch (error) {
          console.error(`Migration to ${migration.targetVersion} failed:`, error);
          
          return {
            success: false,
            data: migrationsRun,
            error: {
              code: 'MIGRATION_ERROR',
              message: `Migration to version ${migration.targetVersion} failed`,
              details: error instanceof Error ? error.message : String(error)
            }
          };
        }
      }
      
      return {
        success: true,
        data: migrationsRun
      };
    } catch (error) {
      console.error('Migration process failed:', error);
      
      return {
        success: false,
        data: false,
        error: {
          code: 'MIGRATION_PROCESS_ERROR',
          message: 'Migration process failed',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Get the default data version (used when no version is stored)
   */
  private getDefaultVersion(): string {
    return '0.0.0';
  }
  
  /**
   * Compare two semantic versions
   * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);
    
    // Compare major
    if (v1Parts[0] < v2Parts[0]) return -1;
    if (v1Parts[0] > v2Parts[0]) return 1;
    
    // Compare minor
    if (v1Parts[1] < v2Parts[1]) return -1;
    if (v1Parts[1] > v2Parts[1]) return 1;
    
    // Compare patch
    if (v1Parts[2] < v2Parts[2]) return -1;
    if (v1Parts[2] > v2Parts[2]) return 1;
    
    // Versions are equal
    return 0;
  }
}
