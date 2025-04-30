import React from "react";
import { Edit, PieChart, Users, FileText, TrendingUp, Calendar, Home, Download, Upload } from "lucide-react";
import type { SectionKey } from "./types";

// Type pour les sections incluant le tableau de bord
type ExtendedSectionKey = SectionKey | "dashboard";

// Props du composant
type SidebarProps = {
  activeSection: ExtendedSectionKey;
  setActiveSection: (section: ExtendedSectionKey) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sections?: Array<{ key: string; label: string; icon?: React.ReactNode }>;
  darkMode?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  onExport, 
  onImport,
  sections,
  darkMode = false
}) => {
  // Si aucune section n'est fournie, utiliser les sections par défaut
  const defaultSections = [
    { key: "dashboard", label: "Tableau de bord", icon: <Home className="mr-2" size={18} /> },
    { key: "pitch", label: "Pitch", icon: <Edit className="mr-2" size={18} /> },
    { key: "services", label: "Services", icon: <Users className="mr-2" size={18} /> },
    { key: "businessModel", label: "Modèle économique", icon: <PieChart className="mr-2" size={18} /> },
    { key: "marketAnalysis", label: "Analyse de marché", icon: <TrendingUp className="mr-2" size={18} /> },
    { key: "financials", label: "Finances", icon: <FileText className="mr-2" size={18} /> },
    { key: "actionPlan", label: "Plan d'action", icon: <Calendar className="mr-2" size={18} /> },
  ];
  
  const navSections = sections || defaultSections;

  // Obtenir l'icône pour une section
  const getIconForSection = (key: string): React.ReactNode => {
    const section = navSections.find(s => s.key === key);
    if (section?.icon) return section.icon;
    
    // Icônes par défaut si non fournies
    switch (key) {
      case "dashboard": return <Home className="mr-2" size={18} />;
      case "pitch": return <Edit className="mr-2" size={18} />;
      case "services": return <Users className="mr-2" size={18} />;
      case "businessModel": return <PieChart className="mr-2" size={18} />;
      case "marketAnalysis": return <TrendingUp className="mr-2" size={18} />;
      case "financials": return <FileText className="mr-2" size={18} />;
      case "actionPlan": return <Calendar className="mr-2" size={18} />;
      default: return null;
    }
  };

  return (
    <aside className={`w-full md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-slate-900'} text-white flex flex-col p-4 md:min-h-screen`}>
      
      <nav>
        <ul className="space-y-1">
          {navSections.map(({ key, label }) => (
            <li key={key}>
              <button
                className={`flex items-center w-full px-4 py-2 rounded transition font-medium text-left ${
                  activeSection === key 
                    ? darkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white' 
                    : darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-800'
                }`}
                onClick={() => setActiveSection(key as ExtendedSectionKey)}
              >
                {getIconForSection(key)}
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-8 space-y-2 hidden md:block">
        <button 
          className={`w-full py-2 rounded ${darkMode ? 'bg-green-600' : 'bg-green-500'} text-white font-bold flex items-center justify-center`} 
          onClick={onExport}
        >
          <Download size={16} className="mr-2" />
          Exporter
        </button>
        <label className={`w-full block cursor-pointer`}>
          <span className="sr-only">Importer</span>
          <input type="file" accept="application/json" className="hidden" onChange={onImport} />
          <span className={`w-full py-2 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-700'} text-white font-bold flex items-center justify-center`}>
            <Upload size={16} className="mr-2" />
            Importer
          </span>
        </label>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
        v1.0.0 • Créé avec ❤️
      </div>
    </aside>
  );
};

export default Sidebar;