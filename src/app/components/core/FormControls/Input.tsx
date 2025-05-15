'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { ErrorDisplay } from '../../common/ErrorDisplay';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label du champ */
  label?: string;
  /** Message d'aide affiché sous le champ */
  helpText?: string;
  /** Message d'erreur affiché sous le champ */
  error?: string;
  /** Taille du champ */
  size?: 'sm' | 'md' | 'lg';
  /** Si le champ est requis */
  required?: boolean;
  /** Si le champ est en cours de chargement */
  isLoading?: boolean;
  /** Icône à afficher à gauche du champ */
  leftIcon?: React.ReactNode;
  /** Icône à afficher à droite du champ */
  rightIcon?: React.ReactNode;
  /** Contenu à ajouter après le champ (bouton, texte, etc.) */
  addon?: React.ReactNode;
  /** Classe CSS additionnelle du conteneur */
  containerClassName?: string;
  /** Classe CSS additionnelle de l'input */
  inputClassName?: string;
}

/**
 * Composant Input réutilisable qui suit les principes SOLID
 * 
 * - Single Responsibility: Gère uniquement l'affichage et l'interaction avec un champ de saisie
 * - Open/Closed: Extensible via les props et le forwardRef
 * - Liskov Substitution: Respecte l'interface InputHTMLAttributes de base
 * - Interface Segregation: Définit une interface props spécifique
 * - Dependency Inversion: N'a pas de dépendances directes sur d'autres composants
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helpText,
  error,
  size = 'md',
  required = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  addon,
  containerClassName = '',
  inputClassName = '',
  id,
  className,
  disabled,
  ...rest
}, ref) => {
  // Générer un ID unique si non fourni
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculer les classes CSS en fonction des props
  const sizeClasses = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4'
  };
  
  const baseInputClasses = 'w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
  const stateClasses = `${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`;
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
  const iconClasses = leftIcon ? 'pl-10' : '';
  
  const computedInputClasses = `
    ${baseInputClasses}
    ${sizeClasses[size]}
    ${stateClasses}
    ${errorClasses}
    ${iconClasses}
    ${inputClassName}
  `;
  
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          disabled={disabled || isLoading}
          className={computedInputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...rest}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {addon && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {addon}
          </div>
        )}
      </div>
      
      {error ? (
        <div id={`${inputId}-error`} className="mt-1">
          <ErrorDisplay 
            error={{ message: error }}
            variant="inline" 
          />
        </div>
      ) : helpText ? (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;