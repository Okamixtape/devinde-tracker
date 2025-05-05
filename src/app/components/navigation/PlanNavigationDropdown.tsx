import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiGrid, FiDollarSign, FiPieChart, FiTrendingUp, FiClipboard } from 'react-icons/fi';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface PlanNavigationDropdownProps {
  planId: string;
  currentView?: string;
}

/**
 * Composant de menu déroulant pour la navigation entre les différentes vues d'un plan d'affaires
 * Version complètement recodée pour résoudre les problèmes de fonctionnement
 */
const PlanNavigationDropdown: React.FC<PlanNavigationDropdownProps> = ({ planId, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Définir les éléments de navigation
  const navigationItems: NavigationItem[] = [
    { name: 'Tableau de Bord', path: `/plans/${planId}/dashboard`, icon: <FiGrid className="mr-2" /> },
    { name: 'Modèle Économique', path: `/plans/${planId}/business-model`, icon: <FiDollarSign className="mr-2" /> },
    { name: 'Analyse Marché', path: `/plans/${planId}/market-analysis`, icon: <FiPieChart className="mr-2" /> },
    { name: 'Finances', path: `/plans/${planId}/finances`, icon: <FiTrendingUp className="mr-2" /> },
    { name: 'Plan d\'Action', path: `/plans/${planId}/action-plan`, icon: <FiClipboard className="mr-2" /> },
    { name: 'Projections', path: `/plans/${planId}/revenue`, icon: <FiTrendingUp className="mr-2" /> },
  ];

  // Déterminer quel élément est actif
  const isActive = (path: string) => {
    return pathname?.includes(path.split('/').pop() || '') || false;
  };
  
  // Trouver la vue actuelle pour l'afficher sur le bouton
  const activeItem = navigationItems.find(item => isActive(item.path));
  const activeView = currentView || activeItem?.name || 'Plan';

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Seulement ajouter l'écouteur si le dropdown est ouvert
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fonction pour ouvrir/fermer le menu
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        id="options-menu"
        aria-expanded="true"
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {activeView}
        <FiChevronDown className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-2 text-sm w-full text-left
                  ${isActive(item.path) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <Link
              href="/plans"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <FiGrid className="mr-2" />
              Tous les Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanNavigationDropdown;
