'use client';

import React, { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useResponsive } from '@/app/hooks/useResponsive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  footerClassName?: string;
  bodyClassName?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  width?: 'auto' | 'full' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  adaptivePadding?: boolean;
  collapseOnMobile?: boolean;
}

/**
 * Composant Card
 * 
 * Un conteneur en forme de carte pour afficher du contenu, avec options pour l'en-tête et le pied de page.
 * Supporte des options responsives pour s'adapter aux différentes tailles d'écran.
 * 
 * @example
 * <Card 
 *   header={<h2 className="text-xl font-bold">Titre de la carte</h2>}
 *   footer={<p className="text-sm text-gray-500">Dernière mise à jour: aujourd'hui</p>}
 *   adaptivePadding={true}
 *   collapseOnMobile={true}
 * >
 *   Contenu de la carte
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  header,
  footer,
  headerClassName,
  footerClassName,
  bodyClassName,
  borderRadius = 'md',
  width = 'auto',
  adaptivePadding = false,
  collapseOnMobile = false,
  ...rest
}) => {
  const { isAtMost } = useResponsive();
  const isMobile = isAtMost('sm');
  
  // Ajuster le padding en fonction de la taille d'écran si adaptivePadding est activé
  let effectivePadding = padding;
  if (adaptivePadding && isMobile) {
    if (padding === 'lg') effectivePadding = 'md';
    if (padding === 'md') effectivePadding = 'sm';
  }
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    flat: 'bg-gray-50 dark:bg-gray-900',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4',
    lg: 'p-4 sm:p-6',
  };
  
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };
  
  const borderRadiusStyles = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-3xl',
  };
  
  const widthStyles = {
    auto: '',
    full: 'w-full',
    xs: 'max-w-xs mx-auto',
    sm: 'max-w-sm mx-auto',
    md: 'max-w-md mx-auto',
    lg: 'max-w-lg mx-auto',
    xl: 'max-w-xl mx-auto',
  };
  
  // Adapter le style de la carte pour les petits écrans si collapseOnMobile est activé
  const mobileCardStyle = collapseOnMobile && isMobile 
    ? 'border-x-0 rounded-none w-full shadow-none px-2 sm:px-0' 
    : '';
  
  const cardClassName = twMerge(
    variantStyles[variant],
    shadowStyles[shadow],
    borderRadiusStyles[borderRadius],
    widthStyles[width],
    mobileCardStyle,
    className
  );
  
  const headerClasses = twMerge(
    'border-b border-gray-200 dark:border-gray-700 mb-3',
    paddingStyles[effectivePadding],
    collapseOnMobile && isMobile ? 'border-b-0 mb-2 pb-0' : '',
    headerClassName
  );
  
  const bodyClasses = twMerge(
    paddingStyles[effectivePadding],
    bodyClassName
  );
  
  const footerClasses = twMerge(
    'border-t border-gray-200 dark:border-gray-700 mt-3',
    paddingStyles[effectivePadding],
    collapseOnMobile && isMobile ? 'border-t-0 mt-2 pt-0' : '',
    footerClassName
  );
  
  return (
    <div className={cardClassName} {...rest}>
      {header && <div className={headerClasses}>{header}</div>}
      <div className={bodyClasses}>{children}</div>
      {footer && <div className={footerClasses}>{footer}</div>}
    </div>
  );
};

export default Card;
