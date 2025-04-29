import { useState, useEffect } from "react";

type SectionKey = keyof BusinessPlanData;
type FieldKey = string;

type BusinessPlanData = {
  pitch: {
    title: string;
    summary: string;
    vision: string;
    values: string[];
  };
  services: {
    offerings: string[];
    technologies: string[];
    process: string[];
  };
  businessModel: {
    hourlyRates: string[];
    packages: string[];
    subscriptions: string[];
  };
  marketAnalysis: {
    competitors: string[];
    targetClients: string[];
    trends: string[];
  };
  financials: {
    initialInvestment: number;
    quarterlyGoals: number[];
    expenses: string[];
  };
  actionPlan: {
    milestones: string[];
  };
};

const initialData: BusinessPlanData = {
  pitch: {
    title: "Développeur Front-end Indépendant",
    summary: "",
    vision: "",
    values: [],
  },
  services: {
    offerings: [],
    technologies: [],
    process: [],
  },
  businessModel: {
    hourlyRates: [],
    packages: [],
    subscriptions: [],
  },
  marketAnalysis: {
    competitors: [],
    targetClients: [],
    trends: [],
  },
  financials: {
    initialInvestment: 0,
    quarterlyGoals: [0, 0, 0, 0],
    expenses: [],
  },
  actionPlan: {
    milestones: [],
  },
};

export function useBusinessPlanData() {
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData>(initialData);

  useEffect(() => {
    const savedData = localStorage.getItem("devinde-tracker-data");
    if (savedData) {
      setBusinessPlanData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("devinde-tracker-data", JSON.stringify(businessPlanData));
  }, [businessPlanData]);

  const updateData = (section: SectionKey, field: FieldKey, value: any) => {
    setBusinessPlanData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const addListItem = (section: SectionKey, field: FieldKey) => {
    const input = document.getElementById(`new-${section}-${field}`) as HTMLInputElement;
    if (!input) return;
    const newItem = input.value;
    if (newItem.trim()) {
      setBusinessPlanData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...((prev[section][field] as any[]) || []), newItem],
        },
      }));
      input.value = "";
    }
  };

  const removeListItem = (section: SectionKey, field: FieldKey, index: number) => {
    setBusinessPlanData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: ((prev[section][field] as any[]) || []).filter((_, i) => i !== index),
      },
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(businessPlanData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = "devinde-tracker-data.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setBusinessPlanData(data);
      } catch (error) {
        alert("Le fichier importé n'est pas valide.");
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
    importData,
  };
}
