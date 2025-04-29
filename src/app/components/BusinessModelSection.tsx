import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["businessModel"];
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const BusinessModelSection: React.FC<Props> = ({ data, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Modèle économique</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Tarifs horaires</label>
      <div className="flex gap-2 mb-2">
        <input id="new-businessModel-hourlyRates" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Développement Front-end: 35-45€/h" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("businessModel", "hourlyRates")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.hourlyRates.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("businessModel", "hourlyRates", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Forfaits par projet</label>
      <div className="flex gap-2 mb-2">
        <input id="new-businessModel-packages" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Site vitrine: 1200-2500€" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("businessModel", "packages")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.packages.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("businessModel", "packages", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Abonnements mensuels</label>
      <div className="flex gap-2 mb-2">
        <input id="new-businessModel-subscriptions" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Support basique: 400€/mois" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("businessModel", "subscriptions")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.subscriptions.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("businessModel", "subscriptions", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default BusinessModelSection;
