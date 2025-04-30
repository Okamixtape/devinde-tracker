import React from "react";
import type { BusinessPlanData } from "./types";
import ListManager from "./common/ListManager";

type Props = {
  data: BusinessPlanData["services"];
  addListItem: (field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

/**
 * Section des services proposés
 * Utilise le composant réutilisable ListManager pour gérer les listes
 */
const ServicesSection: React.FC<Props> = ({ data, addListItem, removeListItem }) => {
  // Adapter la fonction addListItem pour qu'elle soit compatible avec ListManager
  const handleAddListItem = (section: keyof BusinessPlanData, field: string) => {
    addListItem(field);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Services proposés</h2>
      
      <ListManager 
        section="services"
        field="offerings"
        items={data.offerings}
        label="Offres de service"
        placeholder="Ex: Développement de sites web"
        addListItem={handleAddListItem}
        removeListItem={removeListItem}
      />
      
      <ListManager 
        section="services"
        field="technologies"
        items={data.technologies}
        label="Technologies maîtrisées"
        placeholder="Ex: React, Next.js"
        addListItem={handleAddListItem}
        removeListItem={removeListItem}
      />
      
      <ListManager 
        section="services"
        field="process"
        items={data.process}
        label="Processus de travail"
        placeholder="Ex: Analyse des besoins"
        addListItem={handleAddListItem}
        removeListItem={removeListItem}
      />
    </div>
  );
};

export default ServicesSection;
