/**
 * Base Interfaces for DevIndé Tracker
 * 
 * Ce fichier définit les interfaces de base qui servent de fondation
 * pour toutes les interfaces de l'application. Il établit une distinction claire
 * entre les modèles de données côté service et côté UI.
 * 
 * @version 1.0
 */

/**
 * Interface de base pour tous les modèles de données
 * Fournit les propriétés communes à tous les objets de l'application
 */
export interface BaseModel {
  /** Identifiant unique de l'objet */
  id: string;
}

/**
 * Interface de base pour tous les modèles côté service
 * Ces modèles représentent les données telles qu'elles sont stockées et manipulées
 * par les services de l'application.
 */
export interface ServiceModel extends BaseModel {
  /** Date de création de l'objet (format ISO) */
  createdAt?: string;
  
  /** Date de dernière modification de l'objet (format ISO) */
  updatedAt?: string;
}

/**
 * Interface de base pour tous les modèles côté UI
 * Ces modèles représentent les données telles qu'elles sont utilisées
 * par les composants de l'interface utilisateur.
 */
export interface UIModel extends BaseModel {
  /** Date de création de l'objet (format ISO) */
  createdAt?: string;
  
  /** Date de dernière modification de l'objet (format ISO) */
  updatedAt?: string;
  
  /** Indique si l'objet est en cours d'édition dans l'UI */
  isEditing?: boolean;
  
  /** Erreurs de validation associées aux propriétés de l'objet */
  validationErrors?: Record<string, string>;
}