"use client";

import React, { useState, useCallback } from "react";
import { Settings, Download, Upload } from "lucide-react";
import Header from "./Header";
import Sidebar, { ExtendedSectionKey } from "./Sidebar";

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
 */
const FloatingActions: React.FC<FloatingActionsProps> = ({ 
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

/**
 * Props du composant Layout
 */
interface LayoutProps {
  activeSection: ExtendedSectionKey;
  setActiveSection: (section: ExtendedSectionKey) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleTheme: () => void;
  sections: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  children: React.ReactNode;
}

/**
 * Composant Layout qui fournit une structure commune pour toutes les pages
 * Inclut le Header, Sidebar et les actions flottantes
 */
const Layout: React.FC<LayoutProps> = ({
  activeSection,
  setActiveSection,
  onExport,
  onImport,
  onToggleTheme,
  sections,
  children
}) => {
  // État pour gérer l'affichage de la sidebar sur mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fonction pour basculer l'état de la sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Overlay pour mobile qui apparaît lorsque la sidebar est ouverte */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar adaptative (mobile et desktop) */}
        <div 
          className={`
            fixed left-0 top-[4rem] bottom-0 w-64 z-30 transition-transform duration-300 transform 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:static md:z-0 md:translate-x-0
          `}
        >
          <Sidebar
            activeSection={activeSection}
            setActiveSection={(section) => {
              setActiveSection(section);
              setIsSidebarOpen(false); // Ferme la sidebar sur mobile après sélection
            }}
            onExport={onExport}
            onImport={onImport}
            sections={sections}
          />
        </div>
        
        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            {children}
          </div>
          
          <FloatingActions 
            onToggleTheme={onToggleTheme}
            onExport={onExport}
            onImport={onImport}
          />
        </main>
      </div>
    </div>
  );
};

export default Layout;
