'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useAppState } from '@/app/contexts/AppStateContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

/**
 * Breadcrumb - Fil d'Ariane
 * 
 * Affiche le chemin de navigation actuel et permet de remonter facilement
 * dans la hiérarchie des pages
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const pathname = usePathname();
  const { state } = useAppState();
  
  // Générer automatiquement les éléments du fil d'Ariane si non fournis
  const breadcrumbItems = useMemo(() => {
    if (items) return items;
    
    // Toujours commencer par l'accueil
    const generatedItems: BreadcrumbItem[] = [
      { label: 'Accueil', path: '/' }
    ];
    
    if (!pathname || pathname === '/') {
      return generatedItems;
    }
    
    // Diviser le chemin et construire les items
    const segments = pathname.split('/').filter(Boolean);
    
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      // Gérer les cas spéciaux (plans/:id, etc.)
      if (segment === 'plans' && segments[i+1]) {
        generatedItems.push({ 
          label: 'Plans', 
          path: '/plans'
        });
        
        // Le segment suivant est un ID de plan
        if (segments[i+1]) {
          // On pourrait chercher le nom du plan à partir de l'ID
          const planName = state.businessPlans.find(p => p.id === segments[i+1])?.name || 'Plan d\'affaires';
          
          generatedItems.push({
            label: planName as string,
            path: `/plans/${segments[i+1]}`,
            isActive: segments.length === 2
          });
          
          // Sauter l'ID de plan puisque nous venons de le traiter
          i++;
        }
      } 
      // Gérer les autres sections (paramètres, etc.)
      else {
        const isLastSegment = i === segments.length - 1;
        
        // Transformer le segment en forme lisible
        let readableSegment = segment.charAt(0).toUpperCase() + segment.slice(1);
        
        // Remplacer les tirets par des espaces et formater correctement
        readableSegment = readableSegment.replace(/-/g, ' ');
        
        // Cas spéciaux
        switch (segment) {
          case 'settings':
            readableSegment = 'Paramètres';
            break;
          case 'dashboard':
            readableSegment = 'Tableau de bord';
            break;
          case 'profile':
            readableSegment = 'Profil';
            break;
          case 'calculator':
            readableSegment = 'Calculateur';
            break;
          case 'documents':
            readableSegment = 'Documents';
            break;
          case 'business-model':
            readableSegment = 'Modèle économique';
            break;
          case 'action-plan':
            readableSegment = 'Plan d\'action';
            break;
          case 'market-analysis':
            readableSegment = 'Analyse de marché';
            break;
        }
        
        generatedItems.push({ 
          label: readableSegment,
          path: isLastSegment ? undefined : currentPath,
          isActive: isLastSegment
        });
      }
    }
    
    return generatedItems;
  }, [pathname, items, state.businessPlans]);
  
  // Ne pas afficher le fil d'Ariane sur la page d'accueil
  if (breadcrumbItems.length <= 1 || !pathname) {
    return null;
  }
  
  return (
    <nav className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4" aria-label="Fil d'Ariane">
      <ol className="container mx-auto flex flex-wrap items-center text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            )}
            
            {item.path && !item.isActive ? (
              <Link 
                href={item.path} 
                className={`
                  flex items-center hover:text-blue-600 dark:hover:text-blue-400
                  ${index === 0 ? 'flex items-center' : ''}
                `}
              >
                {index === 0 && (
                  <Home size={14} className="mr-1" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span 
                className={`
                  font-medium text-gray-900 dark:text-white
                  ${index === 0 ? 'flex items-center' : ''}
                `}
                aria-current="page"
              >
                {index === 0 && (
                  <Home size={14} className="mr-1" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;