'use client';

import React, { ReactNode } from 'react';
import { useResponsive, ScreenSize } from '@/app/hooks/useResponsive';

export interface ResponsiveContainerProps {
  /**
   * Contenu à afficher sur les écrans mobiles (xs et sm)
   */
  mobile?: ReactNode;
  
  /**
   * Contenu à afficher sur les écrans tablettes (md)
   */
  tablet?: ReactNode;
  
  /**
   * Contenu à afficher sur les écrans desktop (lg, xl, 2xl)
   */
  desktop?: ReactNode;
  
  /**
   * Contenu à afficher comme fallback si un contenu spécifique n'est pas fourni pour la taille d'écran actuelle
   */
  fallback?: ReactNode;
  
  /**
   * Option pour personnaliser à partir de quelle taille un écran est considéré comme tablette
   * @default 'md'
   */
  tabletBreakpoint?: ScreenSize;
  
  /**
   * Option pour personnaliser à partir de quelle taille un écran est considéré comme desktop
   * @default 'lg'
   */
  desktopBreakpoint?: ScreenSize;
}

/**
 * Composant ResponsiveContainer
 * 
 * Permet d'afficher du contenu différent selon la taille de l'écran (mobile, tablette, desktop).
 * 
 * @example
 * <ResponsiveContainer
 *   mobile={<MobileView />}
 *   tablet={<TabletView />}
 *   desktop={<DesktopView />}
 *   fallback={<DefaultView />}
 * />
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  mobile,
  tablet,
  desktop,
  fallback,
  tabletBreakpoint = 'md',
  desktopBreakpoint = 'lg'
}) => {
  const { isAtLeast } = useResponsive();
  
  // Déterminer le contenu à afficher
  let content: ReactNode = null;
  
  if (isAtLeast(desktopBreakpoint) && desktop) {
    // Écran desktop
    content = desktop;
  } else if (isAtLeast(tabletBreakpoint) && tablet) {
    // Écran tablette
    content = tablet;
  } else if (mobile) {
    // Écran mobile
    content = mobile;
  } else {
    // Fallback si aucun contenu spécifique n'est fourni pour la taille d'écran actuelle
    content = fallback;
  }
  
  return <>{content}</>;
};

/**
 * Hook useResponsiveRender
 * 
 * Hook simplifié qui retourne une fonction pour choisir le contenu à afficher selon la taille d'écran.
 * 
 * @example
 * const responsiveRender = useResponsiveRender();
 * 
 * return (
 *   <div>
 *     {responsiveRender({
 *       mobile: <MobileView />,
 *       tablet: <TabletView />,
 *       desktop: <DesktopView />
 *     })}
 *   </div>
 * );
 */
export const useResponsiveRender = () => {
  const { isAtLeast } = useResponsive();
  
  return ({
    mobile,
    tablet,
    desktop,
    fallback,
    tabletBreakpoint = 'md',
    desktopBreakpoint = 'lg'
  }: ResponsiveContainerProps): ReactNode => {
    if (isAtLeast(desktopBreakpoint) && desktop) {
      return desktop;
    } else if (isAtLeast(tabletBreakpoint) && tablet) {
      return tablet;
    } else if (mobile) {
      return mobile;
    } else {
      return fallback;
    }
  };
};

export default ResponsiveContainer;
