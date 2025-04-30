import React from "react";
import { Edit, PieChart, Users, FileText, TrendingUp, Calendar, Home, Download, Upload } from "lucide-react";
import type { SectionKey } from "./types";

/**
 * Type pour les sections incluant le tableau de bord
 */
export type ExtendedSectionKey = SectionKey | "dashboard";

/**
 * Définition d'un élément de navigation pour la sidebar
 */
export interface NavSection {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

/**
 * Props du composant Sidebar
 */
interface SidebarProps {
  activeSection: ExtendedSectionKey;
  setActiveSection: (section: ExtendedSectionKey) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sections?: NavSection[];
}

/**
 * Sections de navigation par défaut
 */
const DEFAULT_SECTIONS: NavSection[] = [
  { key: "dashboard", label: "Tableau de bord", icon: <Home size={18} /> },
  { key: "pitch", label: "Pitch", icon: <Edit size={18} /> },
  { key: "services", label: "Services", icon: <Users size={18} /> },
  { key: "businessModel", label: "Modèle économique", icon: <PieChart size={18} /> },
  { key: "marketAnalysis", label: "Analyse de marché", icon: <TrendingUp size={18} /> },
  { key: "financials", label: "Finances", icon: <FileText size={18} /> },
  { key: "actionPlan", label: "Plan d'action", icon: <Calendar size={18} /> },
];

/**
 * Composant Sidebar pour la navigation principale
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  onExport, 
  onImport,
  sections = DEFAULT_SECTIONS
}) => {
  return (
    <aside className="w-full md:w-64 bg-slate-900 dark:bg-gray-800 text-white flex flex-col p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="mb-6">
        <ul className="space-y-1">
          {sections.map(({ key, label, icon }) => (
            <li key={key}>
              <button
                className={`flex items-center w-full px-4 py-2 rounded transition font-medium text-left ${
                  activeSection === key 
                    ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                    : 'hover:bg-slate-800 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection(key as ExtendedSectionKey)}
                aria-current={activeSection === key ? 'page' : undefined}
              >
                {icon && <span className="mr-2">{icon}</span>}
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto space-y-3 hidden md:block">
        <button 
          className={`w-full py-2 px-4 rounded bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium flex items-center justify-center transition`}
          onClick={onExport}
          aria-label="Exporter les données"
        >
          <Download size={16} className="mr-2" />
          Exporter
        </button>
        
        <label className="w-full block cursor-pointer">
          <span className="sr-only">Importer</span>
          <input 
            type="file" 
            accept="application/json" 
            className="hidden" 
            onChange={onImport} 
            aria-label="Importer des données" 
          />
          <span className={`w-full py-2 px-4 rounded bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium flex items-center justify-center transition`}>
            <Upload size={16} className="mr-2" />
            Importer
          </span>
        </label>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-400 dark:text-gray-500">
        v1.0.0 • DevIndé Tracker
      </div>
    </aside>
  );
};

export default Sidebar;