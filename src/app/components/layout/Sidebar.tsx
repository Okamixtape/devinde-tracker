'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BarChart2, Target, Users, DollarSign, Briefcase, 
  PieChart, FileText, Settings, ChevronLeft, ChevronRight,
  Calculator, FileSearch, HelpCircle, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppState } from '@/app/contexts/AppStateContext';
import { Section } from '@/app/services/interfaces/service-interfaces';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavItemClick?: () => void;
  loading?: boolean;
}

/**
 * Sidebar - Barre latérale de navigation
 * 
 * Affiche la navigation principale de l'application
 * Peut être étendue ou réduite (icônes uniquement)
 * Contient des indicateurs de progression pour chaque section
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggleCollapse,
  onNavItemClick,
  loading = false
}) => {
  const pathname = usePathname();
  const { state } = useAppState();
  const [sections, setSections] = useState<Section[]>([]);
  const [utilityItems, setUtilityItems] = useState<Section[]>([]);
  
  // Séparer les sections normales et les utilitaires (paramètres, etc.)
  useEffect(() => {
    if (state.sections) {
      // Définir quelles sections sont considérées comme des utilitaires
      const utilityKeys = ['settings', 'help'];
      
      setSections(state.sections.filter(s => !utilityKeys.includes(s.key))
        .sort((a, b) => a.order - b.order));
        
      setUtilityItems(state.sections.filter(s => utilityKeys.includes(s.key))
        .sort((a, b) => a.order - b.order));
    }
  }, [state.sections]);

  // Obtenir l'icône appropriée pour chaque section
  const getIconForSection = (key: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      dashboard: <Home size={20} />,
      pitch: <FileText size={20} />,
      services: <Briefcase size={20} />,
      businessModel: <DollarSign size={20} />,
      marketAnalysis: <PieChart size={20} />,
      finances: <BarChart2 size={20} />,
      actionPlan: <Target size={20} />,
      customers: <Users size={20} />,
      calculator: <Calculator size={20} />,
      documents: <FileSearch size={20} />,
      settings: <Settings size={20} />,
      help: <HelpCircle size={20} />
    };
    
    return iconMap[key] || <Layers size={20} />;
  };

  // Vérifier si un lien est actif
  const isLinkActive = (sectionKey: string) => {
    return pathname?.includes(`/${sectionKey}`) || 
      (sectionKey === 'dashboard' && pathname === '/') ||
      pathname === `/${sectionKey}`;
  };
  
  // Fallback sections si aucune n'est chargée
  const fallbackSections = [
    { key: 'dashboard', title: 'Tableau de bord', completion: 0, order: 0 },
    { key: 'pitch', title: 'Pitch', completion: 0, order: 1 },
    { key: 'services', title: 'Services', completion: 0, order: 2 },
    { key: 'businessModel', title: 'Modèle économique', completion: 0, order: 3 },
    { key: 'marketAnalysis', title: 'Analyse de marché', completion: 0, order: 4 },
    { key: 'finances', title: 'Finances', completion: 0, order: 5 },
    { key: 'actionPlan', title: 'Plan d\'action', completion: 0, order: 6 }
  ] as Section[];

  // Animation variants pour les transitions
  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };
  
  const displaySections = sections.length > 0 ? sections : fallbackSections;

  return (
    <motion.div 
      className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm"
      initial={collapsed ? "collapsed" : "expanded"}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      {/* En-tête de la sidebar */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link href="/" className="text-lg font-semibold truncate">
            DevIndé Tracker
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className={`${collapsed ? 'mx-auto' : 'ml-auto'} p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      {/* Plan actuel - Afficher seulement quand un plan est sélectionné */}
      {state.currentPlanId && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan actuel</p>
              <p className="font-medium truncate">{state.currentPlanId}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                P
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className={`${collapsed ? 'px-2' : 'px-4'}`}>
          {!collapsed && (
            <h2 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
              Navigation
            </h2>
          )}
          <ul className="space-y-1">
            {displaySections.map((section) => {
              const isActive = isLinkActive(section.key);
              return (
                <li key={section.key}>
                  <Link
                    href={`/${section.key}`}
                    className={`
                      flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-md
                      ${isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      transition-colors duration-200
                    `}
                    onClick={onNavItemClick}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex-shrink-0">
                      {getIconForSection(section.key)}
                    </span>
                    
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 truncate">{section.title}</span>
                        {section.completion !== undefined && (
                          <div 
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs
                              ${
                                section.completion >= 100 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                  : section.completion > 0 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }
                            `}
                            title={`${section.completion}% complété`}
                          >
                            {section.completion}%
                          </div>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Outils (second niveau de navigation) */}
        <div className={`mt-6 ${collapsed ? 'px-2' : 'px-4'}`}>
          {!collapsed && (
            <h2 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
              Outils
            </h2>
          )}
          <ul className="space-y-1">
            <li>
              <Link
                href="/calculator"
                className={`
                  flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-md
                  ${isLinkActive('calculator') 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200
                `}
                onClick={onNavItemClick}
                aria-current={isLinkActive('calculator') ? 'page' : undefined}
              >
                <Calculator size={20} />
                {!collapsed && <span className="ml-3">Calculateur</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/documents"
                className={`
                  flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-md
                  ${isLinkActive('documents') 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200
                `}
                onClick={onNavItemClick}
                aria-current={isLinkActive('documents') ? 'page' : undefined}
              >
                <FileSearch size={20} />
                {!collapsed && <span className="ml-3">Documents</span>}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Footer de la sidebar */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'px-2' : 'px-4'}`}>
        <ul className="space-y-1">
          {utilityItems.map((item) => (
            <li key={item.key}>
              <Link
                href={`/${item.key}`}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-md
                  ${isLinkActive(item.key) 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200
                `}
                onClick={onNavItemClick}
                aria-current={isLinkActive(item.key) ? 'page' : undefined}
              >
                {getIconForSection(item.key)}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
          
          {/* Si aucun élément d'utilitaire, afficher au moins paramètres */}
          {utilityItems.length === 0 && (
            <li>
              <Link
                href="/settings"
                className={`
                  flex items-center ${collapsed ? 'justify-center' : ''} ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-md
                  ${isLinkActive('settings') 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  transition-colors duration-200
                `}
                onClick={onNavItemClick}
                aria-current={isLinkActive('settings') ? 'page' : undefined}
              >
                <Settings size={20} />
                {!collapsed && <span className="ml-3">Paramètres</span>}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export default Sidebar;