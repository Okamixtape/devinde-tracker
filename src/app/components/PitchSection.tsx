import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["pitch"];
  updateData: (section: keyof BusinessPlanData, field: string, value: string | string[]) => void;
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const PitchSection: React.FC<Props> = ({ data, updateData, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Pitch de présentation</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Titre</label>
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={data.title}
        onChange={e => updateData("pitch", "title", e.target.value)}
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Résumé</label>
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        value={data.summary}
        onChange={e => updateData("pitch", "summary", e.target.value)}
        placeholder="Développeur front-end expérimenté proposant des solutions web modernes et performantes avec React/Next.js..."
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Vision</label>
      <textarea
        className="w-full p-2 border rounded"
        rows={2}
        value={data.vision}
        onChange={e => updateData("pitch", "vision", e.target.value)}
        placeholder="Créer des interfaces utilisateurs intuitives et esthétiques..."
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Valeurs</label>
      <div className="flex gap-2 mb-2">
        <input
          id="new-pitch-values"
          type="text"
          className="flex-grow p-2 border rounded"
          placeholder="Ajouter une valeur"
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => addListItem("pitch", "values")}
        >
          <Save size={18} />
        </button>
      </div>
      <ul className="list-disc pl-5">
        {data.values.map((value, index) => (
          <li key={index} className="group flex items-center">
            <span>{value}</span>
            <button
              className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeListItem("pitch", "values", index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default PitchSection;
