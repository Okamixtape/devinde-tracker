import React from "react";
import { Edit, PieChart, Users, FileText, TrendingUp, Calendar } from "lucide-react";
import type { SectionKey } from "./types";

const sections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "pitch", label: "Pitch", icon: <Edit className="mr-2" size={18} /> },
  { key: "services", label: "Services", icon: <Users className="mr-2" size={18} /> },
  { key: "businessModel", label: "Modèle économique", icon: <PieChart className="mr-2" size={18} /> },
  { key: "marketAnalysis", label: "Analyse de marché", icon: <TrendingUp className="mr-2" size={18} /> },
  { key: "financials", label: "Finances", icon: <FileText className="mr-2" size={18} /> },
  { key: "actionPlan", label: "Plan d'action", icon: <Calendar className="mr-2" size={18} /> },
];

type SidebarProps = {
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onExport, onImport }) => (
  <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-4 min-h-screen">
    <nav className="flex-1">
      <ul className="space-y-2">
        {sections.map(({ key, label, icon }) => (
          <li key={key}>
            <button
              className={`flex items-center w-full px-4 py-2 rounded transition font-medium text-left ${activeSection === key ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
              onClick={() => setActiveSection(key)}
            >
              {icon}
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
    <div className="mt-8 space-y-2">
      <button className="w-full py-2 rounded bg-green-500 text-white font-bold" onClick={onExport}>Exporter</button>
      <label className="w-full block">
        <span className="sr-only">Importer</span>
        <input type="file" accept="application/json" className="hidden" onChange={onImport} />
        <span className="w-full py-2 rounded bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer">Importer</span>
      </label>
    </div>
  </aside>
);

export default Sidebar;
