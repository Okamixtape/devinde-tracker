'use client';

import { useState, useEffect, useCallback } from 'react';
import { ILocalStorageService } from '../services/interfaces/ILocalStorageService';
import { getLocalStorageService } from '../services/serviceFactory';
import { useErrorHandling } from './useErrorHandling';

interface UseLocalStorageOptions<T> {
  /** Clé de stockage */
  key: string;
  /** Valeur initiale */
  initialValue?: T;
  /** Service de stockage local à utiliser */
  storageService?: ILocalStorageService<{id?: string, value: T}>;
}

/**
 * Hook personnalisé pour gérer le stockage local
 * 
 * Utilise ILocalStorageService standardisé et intègre la gestion d'erreur
 * 
 * @example
 * // Utilisation basique
 * const [value, setValue, loading, error] = useLocalStorage({
 *   key: 'user-preferences',
 *   initialValue: { theme: 'light' }
 * });
 */
export function useLocalStorage<T>({
  key,
  initialValue,
  storageService
}: UseLocalStorageOptions<T>) {
  // Récupérer ou créer un service de stockage
  const storage = storageService || 
    getLocalStorageService<{id?: string, value: T}>(key);
  
  // Utiliser notre hook de gestion d'erreur
  const { handleError, error, clearError } = useErrorHandling();

  // État local pour la valeur actuelle
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        clearError();
        
        // Récupérer toutes les entrées (il ne devrait y en avoir qu'une)
        const result = await storage.getItems();
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Impossible de charger les données');
        }
        
        // Trouver l'entrée qui contient la valeur
        const item = result.data.find(item => item.id === key) || result.data[0];
        
        if (item) {
          setValue(item.value);
        } else if (initialValue !== undefined) {
          // Si aucune valeur n'est trouvée, utiliser la valeur initiale
          setValue(initialValue);
          // Et la sauvegarder
          await saveValue(initialValue);
        }
      } catch (err) {
        handleError(err, { context: { operation: 'load', key } });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Fonction pour sauvegarder une nouvelle valeur
  const saveValue = useCallback(async (newValue: T) => {
    try {
      setLoading(true);
      clearError();
      
      // Vérifier si une entrée existe déjà
      const existingResult = await storage.getItems();
      
      if (!existingResult.success) {
        throw new Error(existingResult.error?.message || 'Impossible de vérifier les données existantes');
      }
      
      const existingItem = existingResult.data.find(item => item.id === key);
      
      let result;
      
      if (existingItem) {
        // Mettre à jour l'entrée existante
        result = await storage.updateItem(existingItem.id, { value: newValue });
      } else {
        // Créer une nouvelle entrée
        result = await storage.createItem({ id: key, value: newValue });
      }
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Impossible de sauvegarder les données');
      }
      
      setValue(newValue);
    } catch (err) {
      handleError(err, { context: { operation: 'save', key, value: newValue } });
      // Retourner false pour indiquer l'échec
      return false;
    } finally {
      setLoading(false);
    }
    
    // Retourner true pour indiquer le succès
    return true;
  }, [key, storage, handleError, clearError]);

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      // Récupérer l'entrée existante
      const existingResult = await storage.getItems();
      
      if (!existingResult.success) {
        throw new Error(existingResult.error?.message || 'Impossible de vérifier les données existantes');
      }
      
      const existingItem = existingResult.data.find(item => item.id === key);
      
      if (existingItem) {
        // Supprimer l'entrée
        const result = await storage.deleteItem(existingItem.id);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Impossible de supprimer les données');
        }
      }
      
      setValue(undefined);
    } catch (err) {
      handleError(err, { context: { operation: 'remove', key } });
      // Retourner false pour indiquer l'échec
      return false;
    } finally {
      setLoading(false);
    }
    
    // Retourner true pour indiquer le succès
    return true;
  }, [key, storage, handleError, clearError]);

  return { value, setValue: saveValue, removeValue, loading, error };
}

export default useLocalStorage;