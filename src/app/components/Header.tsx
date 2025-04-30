import React from "react";
import { Code, Menu } from "lucide-react";

type HeaderProps = {
  darkMode?: boolean;
  toggleSidebar?: () => void;
};

const Header: React.FC<HeaderProps> = ({ darkMode = false, toggleSidebar }) => (
  <header className={`${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white p-4 sticky top-0 z-10`}>
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {toggleSidebar && (
          <button 
            className="p-1 rounded-md md:hidden hover:bg-blue-500"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <Code size={24} className="text-white" />
          <div>
            <h1 className="text-xl font-bold text-white">DevIndé Tracker</h1>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center space-x-4">
        <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-blue-800' : 'bg-blue-700'} text-xs`}>
          Dernière sauvegarde : {new Date().toLocaleString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  </header>
);

export default Header;