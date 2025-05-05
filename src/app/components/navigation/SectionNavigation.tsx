import React from 'react';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiGrid, FiDollarSign, FiPieChart, FiTrendingUp, FiClipboard } from 'react-icons/fi';
import Dropdown from '../common/Dropdown';

interface SectionNavigationProps {
  planId?: string;
}

/**
 * Composant de navigation pour les sections d'un plan d'affaires
 * Utilise le composant Dropdown réutilisable
 */
const SectionNavigation: React.FC<SectionNavigationProps> = ({ planId }) => {
  const pathname = usePathname();

  // Ne pas afficher le dropdown si aucun planId n'est présent
  if (!planId) {
    return (
      <div className="inline-block rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-sm text-gray-400 dark:text-gray-500">
        Aucun plan sélectionné
      </div>
    );
  }

  // Définition des sections disponibles dans un plan
  const sections = [
    { 
      id: 'dashboard', 
      label: 'Tableau de Bord', 
      path: `/plans/${planId}/dashboard`, 
      icon: <FiGrid />
    },
    { 
      id: 'business-model', 
      label: 'Modèle Économique', 
      path: `/plans/${planId}/business-model`, 
      icon: <FiDollarSign />
    },
    { 
      id: 'market-analysis', 
      label: 'Analyse Marché', 
      path: `/plans/${planId}/market-analysis`, 
      icon: <FiPieChart />
    },
    { 
      id: 'finances', 
      label: 'Finances', 
      path: `/plans/${planId}/finances`, 
      icon: <FiTrendingUp />
    },
    { 
      id: 'action-plan', 
      label: 'Plan d\'Action', 
      path: `/plans/${planId}/action-plan`, 
      icon: <FiClipboard />
    },
    { 
      id: 'revenue', 
      label: 'Projections', 
      path: `/plans/${planId}/revenue`, 
      icon: <FiTrendingUp />
    },
    // Séparateur
    { 
      id: 'separator',
      label: <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>,
    },
    // Lien vers tous les plans
    { 
      id: 'all-plans', 
      label: 'Tous les Plans', 
      path: '/plans', 
      icon: <FiGrid />
    }
  ];

  // Détermine quelle section est active
  const isActive = (path: string) => {
    if (!path) return false;
    return pathname?.includes(path.split('/').pop() || '') || false;
  };

  // Transforme nos sections en items pour le dropdown
  const dropdownItems = sections.map(section => ({
    id: section.id,
    label: section.label,
    href: section.path,
    icon: section.icon,
    active: section.path ? isActive(section.path) : false
  }));

  // Trouve la section active pour l'afficher comme titre du dropdown
  const activeSection = sections.find(section => section.path && isActive(section.path));
  const activeLabel = activeSection?.label || 'Navigation';

  // Composant trigger pour le dropdown
  const trigger = (
    <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
        {activeLabel}
      </span>
      <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
    </div>
  );

  return (
    <Dropdown 
      trigger={trigger} 
      items={dropdownItems}
      align="left"
      width="w-64" 
      className="z-50"
    />
  );
};

export default SectionNavigation;
