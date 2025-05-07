'use client';

import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useResponsive } from '@/app/hooks/useResponsive';

export interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string; 
  desktopClassName?: string;
  largeDesktopClassName?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  fullWidth?: boolean;
  fullHeight?: boolean;
  adaptDirection?: boolean;
  gapMobile?: string;
  gapTablet?: string;
  gapDesktop?: string;
}

/**
 * ResponsiveLayout Component
 * 
 * Un composant qui simplifie la création de layouts responsifs en adaptant
 * automatiquement les marges, le padding et la direction des éléments en fonction
 * de la taille de l'écran.
 * 
 * @example
 * <ResponsiveLayout 
 *   direction="row"
 *   adaptDirection={true}
 *   spacing="md"
 *   className="bg-white rounded-lg shadow-md"
 * >
 *   <div>Element 1</div>
 *   <div>Element 2</div>
 * </ResponsiveLayout>
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  largeDesktopClassName = '',
  direction = 'row',
  spacing = 'md',
  wrap = false,
  alignItems = 'start',
  justifyContent = 'start',
  fullWidth = false,
  fullHeight = false,
  adaptDirection = false,
  gapMobile,
  gapTablet,
  gapDesktop
}) => {
  const { isAtMost, isAtLeast } = useResponsive();
  const isMobile = isAtMost('sm');
  const isTablet = !isAtMost('sm') && isAtMost('md');
  const isDesktop = isAtLeast('lg');

  // Direction adaptative basée sur la taille d'écran
  const effectiveDirection = adaptDirection && isMobile
    ? (direction === 'row' || direction === 'row-reverse' ? 'column' : direction)
    : direction;

  // Classes pour les espacements
  const spacingClasses = {
    none: '',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  // Classes pour les alignements
  const alignItemsClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  // Classes pour la justification
  const justifyContentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  // Gestion du gap adaptatif
  const gapClass = isMobile && gapMobile
    ? gapMobile
    : isTablet && gapTablet
      ? gapTablet
      : isDesktop && gapDesktop
        ? gapDesktop
        : '';

  // Classes CSS conditionnelles basées sur le breakpoint
  const responsiveClassName = isMobile
    ? mobileClassName
    : isTablet
      ? tabletClassName
      : isDesktop
        ? desktopClassName
        : isAtLeast('xl')
          ? largeDesktopClassName
          : '';

  // Construire les classes finales
  const layoutClasses = twMerge(
    'flex',
    `flex-${effectiveDirection}`,
    wrap ? 'flex-wrap' : 'flex-nowrap',
    alignItemsClasses[alignItems],
    justifyContentClasses[justifyContent],
    spacingClasses[spacing],
    fullWidth ? 'w-full' : '',
    fullHeight ? 'h-full' : '',
    gapClass,
    className,
    responsiveClassName
  );

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;
