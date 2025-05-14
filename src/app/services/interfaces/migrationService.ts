/**
 * Migration Service Interface - Defines the contract for data migration operations
 */
import { ServiceResult } from "../interfaces/dataModels";

/**
 * Migration Function Type - Function signature for migration operations
 * Takes the current data state and transforms it to the new version
 */
/**
 * Generic type for application data storage
 */
export type ApplicationDataState = Record<string, unknown>;

/**
 * Migration Function Type - Function signature for migration operations
 * Takes the current data state and transforms it to the new version
 */
export type MigrationFunction = (data: ApplicationDataState) => Promise<ServiceResult<ApplicationDataState>>;

/**
 * Migration Definition - Represents a single migration step
 */
export interface Migration {
  /**
   * Target version this migration upgrades to
   */
  targetVersion: string;
  
  /**
   * Migration function that transforms the data
   */
  migrationFn: MigrationFunction;
  
  /**
   * Optional description of what the migration does
   */
  description?: string;
}

/**
 * Migration Service - Manages data schema migrations
 */
export interface MigrationService {
  /**
   * Get the current data version from storage
   */
  getCurrentVersion(): Promise<ServiceResult<string>>;
  
  /**
   * Set the current data version in storage after successful migration
   */
  setVersion(version: string): Promise<ServiceResult<boolean>>;
  
  /**
   * Apply all necessary migrations from current version to target version
   */
  applyMigrations(currentVersion?: string, targetVersion?: string): Promise<ServiceResult<boolean>>;
  
  /**
   * Register a new migration to be applied when needed
   */
  registerMigration(migration: Migration): void;
  
  /**
   * Create a backup of data before applying migrations
   */
  createBackup(): Promise<ServiceResult<boolean>>;
  
  /**
   * Restore data from the most recent backup
   */
  restoreFromBackup(): Promise<ServiceResult<boolean>>;
  
  /**
   * Run all pending migrations
   */
  runPendingMigrations(): Promise<ServiceResult<boolean>>;
  
  /**
   * Get the default version when no version is found in storage
   */
  getDefaultVersion(): string;
}
