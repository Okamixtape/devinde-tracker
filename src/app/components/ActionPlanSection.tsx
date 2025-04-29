import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["actionPlan"];
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const ActionPlanSection: React.FC<Props> = ({ data, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Plan d'action</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Jalons importants</label>
      <div className="flex gap-2 mb-2">
        <input id="new-actionPlan-milestones" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Mai 2025 - Dépôt demande ARCE" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("actionPlan", "milestones")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.milestones.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("actionPlan", "milestones", index)}>&#39;×&#39;</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ActionPlanSection;
