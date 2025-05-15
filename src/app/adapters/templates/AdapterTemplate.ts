/**
 * [Feature]Adapter - Adaptateur pour [description]
 *
 * Transforme les données entre le format service (dataModels) et le format UI ([Feature]Interfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 1.0
 * @standardized true
 */

// Import des modèles de données service
import { BusinessPlanData, ServiceResult } from '../../services/interfaces/dataModels';
import { BusinessPlan } from '../../services/interfaces/serviceInterfaces';

// Import des interfaces UI
import { [Feature]Data, [Feature]Item, [Feature]Statistics } from '../../interfaces/[Feature]Interfaces';

/**
 * Adaptateur pour [Feature]
 * 
 * Responsable de la transformation bidirectionnelle des données entre le format service
 * (BusinessPlanData) et le format UI ([Feature]Data).
 */
export class [Feature]Adapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(businessPlanData: BusinessPlanData): [Feature]Data {
    // Extraction des données pertinentes avec valeur par défaut si undefined
    const { [featureLowerCase] = {} } = businessPlanData;
    
    // Transformation des données avec gestion des valeurs manquantes
    return {
      // Propriétés transformées avec valeurs par défaut pour gérer les undefined
      items: [Feature]Adapter.to[Feature]Items([featureLowerCase]?.items || []),
      statistics: [Feature]Adapter.calculateStatistics(businessPlanData),
      additionalData: [featureLowerCase]?.additionalData || '',
      // Autres propriétés transformées...
    };
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service (partiel BusinessPlanData)
   */
  static toService(uiData: [Feature]Data): Partial<BusinessPlanData> {
    // Validation des données entrantes
    if (!uiData) {
      return {}; // Retourner un objet vide si les données sont nulles ou undefined
    }
    
    return {
      [featureLowerCase]: {
        // Transformation des propriétés avec gestion des valeurs optionnelles
        items: Array.isArray(uiData.items) 
          ? uiData.items.map(item => ({
              id: item.id,
              name: item.name,
              // Autres propriétés transformées...
            }))
          : [],
        additionalData: uiData.additionalData || '',
        // Autres propriétés...
        lastUpdated: new Date().toISOString() // Horodatage de la modification
      }
    };
  }

  /**
   * Transforme les éléments spécifiques du format service vers le format UI
   * Cette méthode est réutilisée par toUI pour la transformation d'une sous-partie des données
   * 
   * @param items Éléments à transformer provenant du service
   * @returns Éléments transformés pour l'UI
   */
  static to[Feature]Items(items: any[] = []): [Feature]Item[] {
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => ({
      id: item.id || crypto.randomUUID(), // Génération d'ID si absent
      name: item.name || '',
      description: item.description || '',
      // Autres propriétés avec valeurs par défaut
      createdAt: item.createdAt || new Date().toISOString()
    }));
  }

  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * Méthode clé pour les mises à jour partielles qui préserve les données non modifiées
   * 
   * @param serviceData Données complètes du service
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    businessPlanData: BusinessPlanData,
    uiChanges: Partial<[Feature]Data>
  ): BusinessPlanData {
    // Protection contre les données nulles ou undefined
    if (!businessPlanData) return {} as BusinessPlanData;
    if (!uiChanges) return businessPlanData;
    
    // Extraction avec valeur par défaut pour éviter les erreurs
    const current = businessPlanData.[featureLowerCase] || {};
    
    // Construction de l'objet mis à jour avec fusion intelligente
    return {
      ...businessPlanData,
      [featureLowerCase]: {
        ...current,
        // Fusion intelligente des tableaux - mise à jour ou ajout d'éléments
        ...(uiChanges.items && {
          items: mergeArraysById(current.items || [], 
            [Feature]Adapter.from[Feature]Items(uiChanges.items))
        }),
        // Propriétés simples - remplacer si présentes
        ...(uiChanges.additionalData !== undefined && { 
          additionalData: uiChanges.additionalData 
        }),
        // Horodatage de la mise à jour
        lastUpdated: new Date().toISOString()
      }
    };
  }
  /**
   * Calcule des statistiques dérivées à partir des données
   * @param businessPlanData Données complètes du service
   * @returns Statistiques calculées pour l'UI
   */
  static calculateStatistics(businessPlanData: BusinessPlanData): [Feature]Statistics {
    // Protection contre les données nulles
    if (!businessPlanData || !businessPlanData.[featureLowerCase]) {
      return {
        totalCount: 0,
        completionRate: 0,
        averageScore: 0
      };
    }
    
    const { [featureLowerCase] } = businessPlanData;
    const items = [featureLowerCase].items || [];
    
    // Calcul des statistiques
    return {
      totalCount: items.length,
      completionRate: items.length > 0 
        ? items.filter(i => i.completed).length / items.length * 100 
        : 0,
      averageScore: items.length > 0
        ? items.reduce((sum, item) => sum + (item.score || 0), 0) / items.length
        : 0
    };
  }
  
  /**
   * Convertit les éléments UI en format service
   * Méthode inverse de to[Feature]Items
   * 
   * @param uiItems Éléments au format UI
   * @returns Éléments au format service
   */
  static from[Feature]Items(uiItems: [Feature]Item[] = []): any[] {
    if (!Array.isArray(uiItems)) {
      return [];
    }
    
    return uiItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      // Autres propriétés pour le format service...
    }));
  }
  
  /**
   * @deprecated Utiliser to[Feature]Items à la place
   */
  static transformToOldFormat(items: any[]): [Feature]Item[] {
    console.warn('[Feature]Adapter: transformToOldFormat est déprécié, utiliser to[Feature]Items à la place');
    return this.to[Feature]Items(items);
  }
}

/**
 * Fonctions utilitaires privées
 */

/**
 * Fusionne deux tableaux en se basant sur l'ID des éléments
 * Si un élément avec le même ID existe dans les deux tableaux, celui du second remplace celui du premier
 * Les éléments uniques des deux tableaux sont conservés
 * 
 * @private
 */
function mergeArraysById<T extends { id: string }>(originalArray: T[], updatedArray: T[]): T[] {
  // Créer une map des éléments originaux
  const mergedMap = new Map<string, T>();
  
  // Ajouter tous les éléments originaux
  originalArray.forEach(item => {
    if (item && item.id) {
      mergedMap.set(item.id, item);
    }
  });
  
  // Remplacer ou ajouter les éléments mis à jour
  updatedArray.forEach(item => {
    if (item && item.id) {
      mergedMap.set(item.id, item);
    }
  });
  
  // Convertir la map en tableau
  return Array.from(mergedMap.values());
}

// Export nommé principal
export { [Feature]Adapter };

// Export par défaut pour la compatibilité avec le code existant
export default [Feature]Adapter;
