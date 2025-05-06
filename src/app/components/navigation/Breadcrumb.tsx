'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useI18n } from '@/app/hooks/useI18n';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  currentPlanName?: string;
}

/**
 * Composant Breadcrumb
 * 
 * Affiche le fil d'Ariane pour indiquer la position de l'utilisateur dans l'application
 * Peut recevoir des items personnalisés ou générer automatiquement le fil d'Ariane
 * à partir du chemin actuel
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, currentPlanName }) => {
  const pathname = usePathname();
  const { t } = useI18n();
  
  // Si des items personnalisés sont fournis, les utiliser
  // Sinon, générer automatiquement à partir du chemin
  const breadcrumbItems = items || generateBreadcrumbItems(pathname, currentPlanName, t);
  
  if (breadcrumbItems.length <= 1) {
    return null; // Ne pas afficher le fil d'Ariane sur la page d'accueil
  }
  
  return (
    <div className="bg-blue-900 text-white py-2 px-4">
      <div className="container mx-auto">
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <FiChevronRight className="mx-2 text-blue-300" aria-hidden="true" />
              )}
              
              {item.path && !item.isActive ? (
                <Link 
                  href={item.path} 
                  className="text-blue-300 hover:text-blue-200 flex items-center"
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {index === 0 && <FiHome className="mr-1" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className="text-blue-100 font-medium flex items-center"
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {index === 0 && <FiHome className="mr-1" aria-hidden="true" />}
                  <span>{item.label}</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

/**
 * Génère automatiquement les items du fil d'Ariane à partir du chemin
 */
function generateBreadcrumbItems(
  pathname: string, 
  currentPlanName?: string,
  t?: (key: string) => string
): BreadcrumbItem[] {
  const translate = t || ((key: string) => key);
  const items: BreadcrumbItem[] = [
    { label: translate('navigation.home'), path: '/' }
  ];
  
  if (!pathname || pathname === '/') {
    return items;
  }
  
  // Diviser le chemin et construire les items
  const segments = pathname.split('/').filter(Boolean);
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Cas spéciaux pour certains segments
    if (segment === 'plans') {
      items.push({ 
        label: translate('navigation.plans'), 
        path: '/plans',
        isActive: segments.length === 1
      });
    }
    else if (segment === 'dashboard' && segments[index-1] && currentPlanName) {
      items.push({ 
        label: translate('navigation.dashboard'), 
        isActive: true
      });
    }
    else if (segment === 'finances' && segments[index-1] && currentPlanName) {
      items.push({ 
        label: translate('navigation.finances'), 
        isActive: true
      });
    }
    else if (segment === 'market-analysis' && segments[index-1] && currentPlanName) {
      items.push({ 
        label: translate('navigation.marketAnalysis'), 
        isActive: true
      });
    }
    else if (segment === 'business-model' && segments[index-1] && currentPlanName) {
      items.push({ 
        label: translate('navigation.businessModel'), 
        isActive: true
      });
    }
    else if (segment === 'action-plan' && segments[index-1] && currentPlanName) {
      items.push({ 
        label: translate('navigation.actionPlan'), 
        isActive: true
      });
    }
    else if (segment === 'calculator') {
      items.push({ 
        label: translate('navigation.calculator'), 
        path: '/calculator',
        isActive: true
      });
    }
    else if (segment === 'resources') {
      items.push({ 
        label: translate('navigation.resources'), 
        path: '/resources',
        isActive: true
      });
    }
    else if (segment === 'profile') {
      items.push({ 
        label: translate('profile.title'), 
        path: '/profile',
        isActive: true
      });
    }
    else if (segment === 'login') {
      items.push({ 
        label: translate('auth.login'), 
        path: '/login',
        isActive: true
      });
    }
    else if (segment === 'register') {
      items.push({ 
        label: translate('auth.register'), 
        path: '/register',
        isActive: true
      });
    }
    // Si c'est un ID de plan (segment après 'plans' qui n'est pas un des cas spéciaux)
    else if (segments[index-1] === 'plans' && currentPlanName) {
      items.push({ 
        label: currentPlanName,
        path: currentPath,
        isActive: segments.length === 2
      });
    }
  });
  
  return items;
}

export default Breadcrumb;
