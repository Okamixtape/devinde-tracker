import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["marketAnalysis"];
  addListItem: (section: keyof BusinessPlanData, field: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const MarketAnalysisSection: React.FC<Props> = ({ data, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Analyse de marché</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Concurrents</label>
      <div className="flex gap-2 mb-2">
        <input id="new-marketAnalysis-competitors" type="text" className="flex-grow p-2 border rounded" placeholder="Nom, spécialité, tarifs" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("marketAnalysis", "competitors")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.competitors.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("marketAnalysis", "competitors", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Clients cibles</label>
      <div className="flex gap-2 mb-2">
        <input id="new-marketAnalysis-targetClients" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: PME du secteur..." />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("marketAnalysis", "targetClients")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.targetClients.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("marketAnalysis", "targetClients", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Tendances du marché</label>
      <div className="flex gap-2 mb-2">
        <input id="new-marketAnalysis-trends" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Demande croissante pour..." />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => addListItem("marketAnalysis", "trends")}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.trends.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("marketAnalysis", "trends", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default MarketAnalysisSection;
