import React from "react";
import type { BusinessPlanData } from "./types";
import ListManager from "./common/ListManager";

type Props = {
  data: BusinessPlanData["pitch"];
  updateData: (section: keyof BusinessPlanData, field: string, value: string | string[]) => void;
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

/**
 * Section Pitch qui comprend titre, résumé, vision et valeurs
 * Utilise le composant ListManager pour la gestion des valeurs
 */
const PitchSection: React.FC<Props> = ({ data, updateData, addListItem, removeListItem }) => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pitch de présentation</h2>
      
      <div className="mb-6">
        <label className="block text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Titre</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-md
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={data.title}
          onChange={e => updateData("pitch", "title", e.target.value)}
          placeholder="Votre titre accrocheur"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Résumé</label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          value={data.summary}
          onChange={e => updateData("pitch", "summary", e.target.value)}
          placeholder="Développeur front-end expérimenté proposant des solutions web modernes et performantes avec React/Next.js..."
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Vision</label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          value={data.vision}
          onChange={e => updateData("pitch", "vision", e.target.value)}
          placeholder="Créer des interfaces utilisateurs intuitives et esthétiques..."
        />
      </div>
      
      <ListManager 
        section="pitch"
        field="values"
        items={data.values}
        label="Valeurs"
        placeholder="Ex: Qualité, Innovation, Excellence..."
        addListItem={addListItem}
        removeListItem={removeListItem}
      />
    </div>
  );
};

export default PitchSection;
