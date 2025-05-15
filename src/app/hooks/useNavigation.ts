'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useAppState } from '@/app/contexts/AppStateContext';
import { Section } from '@/app/services/interfaces/service-interfaces';

/**
 * Hook pour gérer la navigation et les routes dans l'application
 * Fournit des méthodes utiles pour la navigation et la gestion des sections
 */
export function useNavigation() {
  const { state, loadSections, setActivePlan } = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  // Extraire l'ID du plan de l'URL (si on est sur une page de plan)
  const currentPlanId = useMemo(() => {
    const match = pathname?.match(/\/plans\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : state.currentPlanId;
  }, [pathname, state.currentPlanId]);
  
  // Obtenir le nom de la section active à partir de l'URL
  const activeSection = useMemo(() => {
    // Si on est sur une page de plan, regarder le dernier segment
    if (pathname?.startsWith('/plans/') && pathname.split('/').length > 3) {
      return pathname.split('/').pop();
    }
    
    // Sinon, prendre le premier segment après la racine
    const segments = pathname?.split('/').filter(Boolean);
    return segments && segments.length > 0 ? segments[0] : 'dashboard';
  }, [pathname]);

  // Trouver la section active complète
  const activeSectionData = useMemo(() => {
    return state.sections.find(s => s.key === activeSection) || null;
  }, [state.sections, activeSection]);

  // Obtenir toutes les sections de navigation pour le plan courant
  const navigationSections = useMemo(() => {
    if (!currentPlanId) return [];
    
    return state.sections
      .filter(s => s.businessPlanId === currentPlanId)
      .sort((a, b) => a.order - b.order);
  }, [state.sections, currentPlanId]);

  // Grouper les sections par catégorie
  const groupedSections = useMemo(() => {
    const groups: Record<string, Section[]> = {
      'main': [],
      'tools': [],
      'settings': []
    };
    
    navigationSections.forEach(section => {
      // Logique pour déterminer le groupe
      if (['settings', 'help', 'profile'].includes(section.key)) {
        groups.settings.push(section);
      } else if (['calculator', 'documents', 'resources'].includes(section.key)) {
        groups.tools.push(section);
      } else {
        groups.main.push(section);
      }
    });
    
    return groups;
  }, [navigationSections]);

  // Vérifier si un chemin est actif
  const isPathActive = useCallback((path: string) => {
    if (!pathname) return false;
    
    // Gestion exacte ou partielle selon le besoin
    if (path === '/') {
      return pathname === '/';
    }
    
    return pathname.startsWith(path);
  }, [pathname]);

  // Naviguer vers une section d'un plan spécifique
  const navigateToSection = useCallback((planId: string, sectionKey: string) => {
    // Si on est déjà sur ce plan, changer juste la section
    if (currentPlanId === planId) {
      router.push(`/plans/${planId}/${sectionKey}`);
    } else {
      // Sinon, charger le plan puis naviguer
      setActivePlan(planId).then(() => {
        router.push(`/plans/${planId}/${sectionKey}`);
      });
    }
  }, [currentPlanId, router, setActivePlan]);

  // Charger les sections pour un plan
  const loadPlanSections = useCallback((planId: string) => {
    return loadSections(planId);
  }, [loadSections]);

  return {
    // État
    currentPlanId,
    activeSection,
    activeSectionData,
    navigationSections,
    groupedSections,
    
    // Actions
    navigateToSection,
    loadPlanSections,
    isPathActive,
    
    // Navigation native
    router,
    pathname
  };
}

export default useNavigation;