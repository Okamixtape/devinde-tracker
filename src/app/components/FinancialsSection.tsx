import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["financials"];
  updateData: (section: keyof BusinessPlanData, field: string, value: any) => void;
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const FinancialsSection: React.FC<Props> = ({ data, updateData, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Prévisionnel financier</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Investissement initial (€)</label>
      <input
        type="number"
        className="w-full p-2 border rounded"
        value={data.initialInvestment}
        onChange={e => updateData("financials", "initialInvestment", Number(e.target.value))}
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Objectifs trimestriels (€)</label>
      <div className="grid grid-cols-4 gap-2">
        {data.quarterlyGoals.map((goal, index) => (
          <input
            key={index}
            type="number"
            className="p-2 border rounded"
            placeholder={`T${index + 1}`}
            value={goal}
            onChange={e => {
              const newGoals = [...data.quarterlyGoals];
              newGoals[index] = Number(e.target.value);
              updateData("financials", "quarterlyGoals", newGoals);
            }}
          />
        ))}
      </div>
      <div className="mt-2 text-right">
        <strong>Total année 1: {data.quarterlyGoals.reduce((sum, val) => sum + val, 0)}€</strong>
      </div>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Dépenses récurrentes</label>
      <div className="flex gap-2 mb-2">
        <input id="new-financials-expenses" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Logiciels: 100€/mois" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("financials", "expenses")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.expenses.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("financials", "expenses", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default FinancialsSection;
