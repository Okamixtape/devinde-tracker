'use client';

import React, { FormHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useResponsive } from '../../hooks/useResponsive';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  submitButton?: ReactNode;
  resetButton?: ReactNode;
  isLoading?: boolean;
  onCancel?: () => void;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  layout?: 'default' | 'compact' | 'stacked';
}

/**
 * Composant Form
 * 
 * Un formulaire réutilisable avec des options pour le titre, la description,
 * et les boutons de soumission et de réinitialisation. Supporte des layouts
 * responsifs adaptés à différentes tailles d'écran.
 * 
 * @example
 * <Form 
 *   title="Créer un compte"
 *   description="Complétez les informations ci-dessous pour créer votre compte"
 *   submitButton={<Button type="submit">S'inscrire</Button>}
 *   onSubmit={handleSubmit}
 *   layout="compact"
 * >
 *   {formFields}
 * </Form>
 */
export const Form: React.FC<FormProps> = ({
  children,
  className,
  title,
  description,
  submitButton,
  resetButton,
  isLoading = false,
  onSubmit,
  onCancel,
  footerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  layout = 'default',
  ...rest
}) => {
  const { isAtMost } = useResponsive();
  const isMobile = isAtMost('sm');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  // Applique un layout adaptatif en fonction de la taille d'écran
  const effectiveLayout = isMobile && layout !== 'compact' ? 'stacked' : layout;
  
  const formClassName = twMerge(
    'space-y-4 max-w-full',
    effectiveLayout === 'compact' && 'max-w-md mx-auto',
    effectiveLayout === 'stacked' && 'space-y-6',
    className
  );
  
  const titleClassNames = twMerge(
    'text-xl font-bold text-gray-900 dark:text-gray-100',
    effectiveLayout === 'compact' && 'text-center',
    effectiveLayout === 'stacked' && 'text-xl md:text-2xl',
    titleClassName
  );
  
  const descriptionClassNames = twMerge(
    'mt-1 text-sm text-gray-600 dark:text-gray-400',
    effectiveLayout === 'compact' && 'text-center text-xs sm:text-sm mb-4',
    effectiveLayout === 'stacked' && 'text-sm md:text-base',
    descriptionClassName
  );
  
  const contentClassNames = twMerge(
    'space-y-4',
    effectiveLayout === 'stacked' && 'space-y-6',
    contentClassName
  );
  
  const footerClassNames = twMerge(
    'mt-6 flex flex-wrap items-center gap-3',
    effectiveLayout === 'compact' && 'justify-center mt-4',
    effectiveLayout === 'stacked' && 'flex-col-reverse sm:flex-row',
    submitButton && resetButton ? (
      effectiveLayout === 'stacked' ? 'sm:justify-between' : 'justify-between'
    ) : 'justify-end',
    footerClassName
  );
  
  return (
    <form className={formClassName} onSubmit={handleSubmit} {...rest}>
      {title && <h2 className={titleClassNames}>{title}</h2>}
      {description && <p className={descriptionClassNames}>{description}</p>}
      
      <div className={contentClassNames}>
        {children}
      </div>
      
      {(submitButton || resetButton || onCancel) && (
        <div className={footerClassNames}>
          {resetButton && (
            <div className={`${effectiveLayout === 'stacked' ? 'w-full sm:w-auto mb-3 sm:mb-0' : 'order-2 sm:order-1'}`}>
              {resetButton}
            </div>
          )}
          
          <div className={`flex items-center ${effectiveLayout === 'stacked' ? 'w-full sm:w-auto' : 'space-x-3 order-1 sm:order-2'}`}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${effectiveLayout === 'stacked' ? 'w-full sm:w-auto mr-2' : ''}`}
                disabled={isLoading}
              >
                Annuler
              </button>
            )}
            <div className={effectiveLayout === 'stacked' ? 'w-full sm:w-auto' : ''}>
              {submitButton}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Form;
