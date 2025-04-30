import { useState, useEffect, ChangeEvent } from "react";
import type { BusinessPlanData, SectionKey } from "../components/types";

// Type pour les valeurs de champs génériques
type FieldValue = string | number | string[] | number[];

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

export const useBusinessPlanData = () => {
  // État pour les données du plan d'affaires
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData>(getInitialData());
  
  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedData = localStorage.getItem("devinde-tracker-data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as BusinessPlanData;
        setBusinessPlanData(parsedData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    }
  }, []);
  
  // Fonction pour mettre à jour les données
  const updateData = (section: keyof BusinessPlanData, field: string, value: FieldValue) => {
    setBusinessPlanData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem("devinde-tracker-data", JSON.stringify(newData));
      
      return newData;
    });
  };
  
  // Fonction pour ajouter un élément à une liste
  // Adaptée pour correspondre à la signature attendue dans les composants
  const addListItem = (section: keyof BusinessPlanData, field: string) => {
    const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
    
    if (input && input.value.trim()) {
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
        
        // Sauvegarder dans localStorage
        localStorage.setItem("devinde-tracker-data", JSON.stringify(newData));
        
        // Réinitialiser le champ de saisie
        input.value = "";
        
        return newData;
      });
    }
  };
  
  // Fonction pour supprimer un élément d'une liste
  const removeListItem = (section: keyof BusinessPlanData, field: string, index: number) => {
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
      
      // Sauvegarder dans localStorage
      localStorage.setItem("devinde-tracker-data", JSON.stringify(newData));
      
      return newData;
    });
  };
  
  // Fonction pour exporter les données
  const exportData = () => {
    const dataStr = JSON.stringify(businessPlanData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `business-plan-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  };
  
  // Fonction pour importer des données
  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const parsedData = JSON.parse(jsonData) as BusinessPlanData;
        setBusinessPlanData(parsedData);
        localStorage.setItem("devinde-tracker-data", jsonData);
      } catch (error) {
        console.error("Erreur lors de l'importation des données:", error);
      }
    };
    reader.readAsText(file);
  };
  
  return {
    businessPlanData,
    updateData,
    addListItem,
    removeListItem,
    exportData,
    importData
  };
};

export default useBusinessPlanData;