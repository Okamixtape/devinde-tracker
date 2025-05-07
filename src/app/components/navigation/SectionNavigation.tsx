import React from 'react';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiGrid, FiDollarSign, FiPieChart, FiTrendingUp, FiClipboard, FiBookOpen, FiBriefcase } from 'react-icons/fi';
import Dropdown from '../common/Dropdown';
import { useDataServiceContext } from '@/app/contexts/DataServiceContext';

// Interface pour les éléments de navigation
interface NavigationItem {
  id: string;
  label: React.ReactNode;
  path: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface SectionNavigationProps {
  planId?: string;
}

/**
 * Composant de navigation pour les sections d'un plan d'affaires
 * Utilise le composant Dropdown réutilisable et le SectionService pour la gestion des sections
 */
const SectionNavigation: React.FC<SectionNavigationProps> = ({ planId }) => {
  const pathname = usePathname();
  
  // Utiliser le contexte pour accéder au service des sections (toujours au niveau supérieur)
  const { sectionService } = useDataServiceContext();

  // Ne pas afficher le dropdown si aucun planId n'est présent
  if (!planId) {
    return (
      <div className="inline-block rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-sm text-gray-400 dark:text-gray-500">
        Aucun plan sélectionné
      </div>
    );
  }

  // Mapping des icônes par clé de section
  const iconMap: Record<string, React.ReactNode> = {
    dashboard: <FiGrid />,
    pitch: <FiBookOpen />,
    services: <FiBriefcase />,
    'business-model': <FiDollarSign />,
    'market-analysis': <FiPieChart />,
    finances: <FiTrendingUp />,
    'action-plan': <FiClipboard />,
    revenue: <FiTrendingUp />
  };
  
  // Obtenir toutes les sections via le service
  const allSectionKeys = Object.keys(iconMap);
  
  // Créer les éléments de navigation à partir des sections disponibles
  const mainSections: NavigationItem[] = [];
  
  // Remplir les sections à partir des clés disponibles
  allSectionKeys.forEach(key => {
    const sectionConfig = sectionService.getSectionByKey(key);
    if (sectionConfig) {
      mainSections.push({
        id: sectionConfig.key,
        label: sectionConfig.title,
        path: `/plans/${planId}${sectionConfig.route}`,
        icon: iconMap[sectionConfig.key] || <FiGrid />
      });
    }
  });
    
  // Trier les sections selon leur ordre défini dans la configuration
  mainSections.sort((a, b) => {
    const sectionA = sectionService.getSectionByKey(a.id);
    const sectionB = sectionService.getSectionByKey(b.id);
    return (sectionA?.order || 0) - (sectionB?.order || 0);
  });
  
  // Ajouter des sections spéciales (séparateur, tous les plans)
  const sections = [
    ...mainSections,
    // Séparateur
    { 
      id: 'separator',
      label: <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>,
      path: '',
      icon: null as unknown as React.ReactNode
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
