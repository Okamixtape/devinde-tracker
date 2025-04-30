import React from "react";
import { Settings, Download, Upload } from "lucide-react";

/**
 * Props pour le composant FloatingActions
 */
interface FloatingActionsProps {
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Composant pour les actions flottantes (boutons d'action rapide)
 * Affiche des boutons pour changer le thème, exporter et importer des données
 */
export const FloatingActions: React.FC<FloatingActionsProps> = ({ 
  onToggleTheme,
  onExport,
  onImport
}) => (
  <div className="fixed bottom-6 right-6 flex space-x-2">
    <button 
      className="p-3 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
      onClick={onToggleTheme}
      title="Changer le thème"
      aria-label="Changer le thème"
    >
      <Settings size={20} />
    </button>
    
    <button 
      className="p-3 rounded-full shadow-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white transition-colors"
      onClick={onExport}
      title="Exporter les données"
      aria-label="Exporter les données"
    >
      <Download size={20} />
    </button>
    
    <label 
      className="p-3 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white cursor-pointer transition-colors" 
      title="Importer des données"
      aria-label="Importer des données"
    >
      <Upload size={20} />
      <input 
        type="file" 
        accept="application/json" 
        className="hidden" 
        onChange={onImport} 
        aria-hidden="true"
      />
    </label>
  </div>
);

export default FloatingActions;
