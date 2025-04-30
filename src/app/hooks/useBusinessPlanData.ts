import { useState, useEffect, ChangeEvent, useCallback } from "react";
import type { BusinessPlanData } from "../components/types";

// Type pour les valeurs de champs génériques
type FieldValue = string | number | string[] | number[];

// Clé pour le stockage local
const LOCAL_STORAGE_KEY = "devinde-tracker-data";

/**
 * Structure initiale des données du business plan
 */
const getInitialData = (): BusinessPlanData => {
  return {
    pitch: {
      title: "",
      summary: "",
      vision: "",
      values: []
    },
    services: {
      offerings: [],
      technologies: [],
      process: []
    },
    businessModel: {
      hourlyRates: [],
      packages: [],
      subscriptions: []
    },
    marketAnalysis: {
      competitors: [],
      targetClients: [],
      trends: []
    },
    financials: {
      initialInvestment: 0,
      quarterlyGoals: [0, 0, 0, 0],
      expenses: []
    },
    actionPlan: {
      milestones: []
    }
  };
};

/**
 * Hook personnalisé pour gérer les données du business plan
 * Fournit des méthodes pour charger, mettre à jour, ajouter, supprimer et sauvegarder les données
 */
export const useBusinessPlanData = () => {
  // État pour les données du plan d'affaires
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData>(getInitialData());
  
  // Sauvegarder les données dans localStorage
  const saveToLocalStorage = useCallback((data: BusinessPlanData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, []);
  
  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const loadFromLocalStorage = () => {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedData) return;
      
      try {
        const parsedData = JSON.parse(savedData) as BusinessPlanData;
        setBusinessPlanData(parsedData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    
    loadFromLocalStorage();
  }, []);
  
  /**
   * Met à jour un champ spécifique dans une section du business plan
   */
  const updateData = useCallback((section: keyof BusinessPlanData, field: string, value: FieldValue) => {
    setBusinessPlanData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
      
      saveToLocalStorage(newData);
      return newData;
    });
  }, [saveToLocalStorage]);
  
  /**
   * Ajoute un élément à une liste dans le business plan
   */
  const addListItem = useCallback((section: keyof BusinessPlanData, field: string) => {
    const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
    
    if (!input || !input.value.trim()) return;
    
    const value = input.value.trim();
    
    setBusinessPlanData(prev => {
      // Type guard pour vérifier si le champ est un tableau
      const currentField = prev[section][field as keyof typeof prev[typeof section]];
      if (!Array.isArray(currentField)) {
        console.error(`Le champ ${field} n'est pas un tableau.`);
        return prev;
      }
      
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...currentField, value],
        },
      };
      
      saveToLocalStorage(newData);
      
      // Réinitialiser le champ de saisie
      input.value = "";
      
      return newData;
    });
  }, [saveToLocalStorage]);
  
  /**
   * Supprime un élément d'une liste dans le business plan
   */
  const removeListItem = useCallback((section: keyof BusinessPlanData, field: string, index: number) => {
    setBusinessPlanData(prev => {
      // Type guard pour vérifier si le champ est un tableau
      const currentField = prev[section][field as keyof typeof prev[typeof section]];
      if (!Array.isArray(currentField)) {
        console.error(`Le champ ${field} n'est pas un tableau.`);
        return prev;
      }
      
      const newArray = [...currentField];
      newArray.splice(index, 1);
      
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
      
      saveToLocalStorage(newData);
      return newData;
    });
  }, [saveToLocalStorage]);
  
  /**
   * Importe des données de business plan à partir d'un fichier JSON
   * @returns Un objet indiquant le succès ou l'échec de l'importation
   */
  const importData = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return { success: false, error: "Aucun fichier sélectionné" };
    }
    
    const reader = new FileReader();
    
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const parsedData = JSON.parse(jsonData) as BusinessPlanData;
          setBusinessPlanData(parsedData);
          saveToLocalStorage(parsedData);
          resolve({ success: true });
        } catch (error) {
          console.error("Erreur lors de l'importation des données:", error);
          resolve({ 
            success: false, 
            error: error instanceof Error ? error.message : "Erreur inconnue lors de l'importation" 
          });
        }
      };
      
      reader.onerror = () => {
        resolve({ success: false, error: "Erreur de lecture du fichier" });
      };
      
      reader.readAsText(file);
    });
  }, [saveToLocalStorage]);
  
  /**
   * Exporte les données du business plan sous forme de fichier JSON
   */
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(businessPlanData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `business-plan-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  }, [businessPlanData]);
  
  /**
   * Charge des données de démonstration
   */
  const loadDemoData = useCallback((demoData: BusinessPlanData) => {
    setBusinessPlanData(demoData);
    saveToLocalStorage(demoData);
  }, [saveToLocalStorage]);
  
  return {
    businessPlanData,
    updateData,
    addListItem,
    removeListItem,
    exportData,
    importData,
    loadDemoData
  };
};

export default useBusinessPlanData;