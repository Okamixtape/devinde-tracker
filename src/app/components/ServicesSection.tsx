import React from "react";
import { Save } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Props = {
  data: BusinessPlanData["services"];
  addListItem: (section: keyof BusinessPlanData, field: string, value: string) => void;
  removeListItem: (section: keyof BusinessPlanData, field: string, index: number) => void;
};

const ServicesSection: React.FC<Props> = ({ data, addListItem, removeListItem }) => (
  <div className="space-y-4 p-4">
    <h2 className="text-xl font-bold mb-4">Services proposés</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Offres de service</label>
      <div className="flex gap-2 mb-2">
        <input id="new-services-offerings" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Développement de sites web" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => {
          const input = document.getElementById("new-services-offerings") as HTMLInputElement;
          if (input && input.value) addListItem("services", "offerings", input.value);
        }}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.offerings.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("services", "offerings", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Technologies maîtrisées</label>
      <div className="flex gap-2 mb-2">
        <input id="new-services-technologies" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: React, Next.js" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => {
          const input = document.getElementById("new-services-technologies") as HTMLInputElement;
          if (input && input.value) addListItem("services", "technologies", input.value);
        }}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.technologies.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("services", "technologies", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Processus de travail</label>
      <div className="flex gap-2 mb-2">
        <input id="new-services-process" type="text" className="flex-grow p-2 border rounded" placeholder="Ex: Analyse des besoins" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => {
          const input = document.getElementById("new-services-process") as HTMLInputElement;
          if (input && input.value) addListItem("services", "process", input.value);
        }}> <Save size={18} /> </button>
      </div>
      <ul className="list-disc pl-5">
        {data.process.map((item, index) => (
          <li key={index} className="group flex items-center">
            <span>{item}</span>
            <button className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeListItem("services", "process", index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ServicesSection;
