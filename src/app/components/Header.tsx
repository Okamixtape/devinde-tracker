import React, { useMemo } from "react";
import { Code, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * Props du composant Header
 */
interface HeaderProps {
  toggleSidebar?: () => void;
}

/**
 * Composant d'en-tête de l'application
 * Affiche le titre de l'application et des informations supplémentaires
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  
  const formattedDate = useMemo(() => {
    return new Date().toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <header className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          {toggleSidebar && (
            <button 
              className="p-1 rounded-md md:hidden hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
              onClick={toggleSidebar}
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Code size={24} className="text-white" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold text-white">DevIndé Tracker</h1>
              <p className="text-xs text-blue-100 hidden sm:block">Votre outil pour autoentrepreneurs</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 hidden sm:block"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="px-3 py-1 rounded-full bg-blue-700 dark:bg-blue-800 text-xs hidden md:block">
            Dernière sauvegarde : {formattedDate}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;