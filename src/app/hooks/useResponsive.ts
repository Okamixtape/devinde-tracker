'use client';

import { useState, useEffect } from 'react';

/**
 * Types de tailles d'écran suivant les breakpoints Tailwind
 */
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Points de rupture correspondant aux breakpoints de Tailwind
 */
export const breakpoints = {
  xs: 0,      // Extra small (mobile)
  sm: 640,    // Small (mobile landscape)
  md: 768,    // Medium (tablette)
  lg: 1024,   // Large (desktop)
  xl: 1280,   // Extra large (large desktop)
  '2xl': 1536 // 2X large (très grands écrans)
};

/**
 * Options pour le hook useResponsive
 */
interface UseResponsiveOptions {
  /**
   * Délai en millisecondes avant de mettre à jour le state après un redimensionnement
   * Cela optimise les performances en évitant de mettre à jour trop fréquemment
   */
  debounceDelay?: number;
}

/**
 * Résultat retourné par le hook useResponsive
 */
export interface UseResponsiveReturn {
  /**
   * Taille d'écran actuelle
   */
  screenSize: ScreenSize;
  
  /**
   * Largeur de la fenêtre en pixels
   */
  width: number;
  
  /**
   * Hauteur de la fenêtre en pixels
   */
  height: number;
  
  /**
   * Vérifie si la taille d'écran actuelle est égale à la taille spécifiée
   */
  is: (size: ScreenSize) => boolean;
  
  /**
   * Vérifie si la taille d'écran actuelle est supérieure ou égale à la taille spécifiée
   */
  isAtLeast: (size: ScreenSize) => boolean;
  
  /**
   * Vérifie si la taille d'écran actuelle est inférieure ou égale à la taille spécifiée
   */
  isAtMost: (size: ScreenSize) => boolean;
  
  /**
   * Vérifie si l'appareil est en orientation portrait (hauteur > largeur)
   */
  isPortrait: boolean;
  
  /**
   * Vérifie si l'appareil est en orientation paysage (largeur > hauteur)
   */
  isLandscape: boolean;
  
  /**
   * Vérifie si le média "prefers-reduced-motion" est activé
   */
  prefersReducedMotion: boolean;
}

/**
 * Hook useResponsive
 * 
 * Fournit des informations sur la taille de l'écran et des utilitaires pour le design responsive.
 * Suit les breakpoints de Tailwind CSS.
 * 
 * @example
 * // Dans un composant
 * const { screenSize, is, isAtLeast } = useResponsive();
 * 
 * // Conditionner le rendu selon la taille d'écran
 * return (
 *   <div>
 *     {isAtLeast('lg') ? (
 *       <DesktopComponent />
 *     ) : (
 *       <MobileComponent />
 *     )}
 *   </div>
 * );
 */
export function useResponsive({
  debounceDelay = 200
}: UseResponsiveOptions = {}): UseResponsiveReturn {
  // Valeurs par défaut pour le SSR
  const [state, setState] = useState({
    width: 0,
    height: 0,
    screenSize: 'xs' as ScreenSize,
    isPortrait: false,
    isLandscape: true,
    prefersReducedMotion: false
  });
  
  useEffect(() => {
    // Fonction pour déterminer la taille d'écran actuelle
    const getScreenSize = (width: number): ScreenSize => {
      if (width >= breakpoints['2xl']) return '2xl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };
    
    // Fonction pour mettre à jour l'état
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize = getScreenSize(width);
      const isPortrait = height > width;
      const isLandscape = width > height;
      
      setState({
        width,
        height,
        screenSize,
        isPortrait,
        isLandscape,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    };
    
    // Pour la première exécution
    updateSize();
    
    // Gestionnaire d'événement pour le redimensionnement avec debounce
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(updateSize, debounceDelay);
    };
    
    // Écoute des changements de taille d'écran
    window.addEventListener('resize', handleResize);
    
    // Écoute des changements d'orientation
    window.addEventListener('orientationchange', updateSize);
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateSize);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debounceDelay]);
  
  // Fonctions utilitaires
  const is = (size: ScreenSize): boolean => state.screenSize === size;
  
  const isAtLeast = (size: ScreenSize): boolean => {
    const sizes: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(state.screenSize);
    const targetIndex = sizes.indexOf(size);
    
    return currentIndex >= targetIndex;
  };
  
  const isAtMost = (size: ScreenSize): boolean => {
    const sizes: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(state.screenSize);
    const targetIndex = sizes.indexOf(size);
    
    return currentIndex <= targetIndex;
  };
  
  return {
    ...state,
    is,
    isAtLeast,
    isAtMost
  };
}

export default useResponsive;
