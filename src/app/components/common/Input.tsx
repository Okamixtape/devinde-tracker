'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

// Exclure la propriété 'size' des InputHTMLAttributes pour éviter le conflit de type
type InputHTMLAttributesWithoutSize = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export interface InputProps extends InputHTMLAttributesWithoutSize {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

/**
 * Composant Input
 * 
 * Un champ de saisie de texte personnalisable avec étiquette,
 * texte d'aide, icônes et états d'erreur.
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="exemple@email.com"
 *   helperText="Nous ne partagerons jamais votre email."
 *   error={errors.email}
 *   {...register("email")}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  variant = 'outlined',
  size = 'md',
  containerClassName,
  labelClassName,
  inputClassName,
  helperTextClassName,
  errorClassName,
  id,
  ...rest
}, ref) => {
  // Générer un ID unique si non fourni
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const variantStyles = {
    outlined: 'border border-gray-500 rounded-md bg-gray-800',
    filled: 'border border-transparent bg-gray-700 rounded-md',
    underlined: 'border-b-2 border-gray-500 rounded-none bg-transparent px-0',
  };
  
  const sizeStyles = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg',
  };
  
  const baseInputStyles = 'block w-full focus:outline-none transition duration-200';
  const errorStateStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const inputClassNames = twMerge(
    baseInputStyles,
    variantStyles[variant],
    sizeStyles[size],
    errorStateStyles,
    'text-white', // Changé de text-gray-900 à text-white pour améliorer la lisibilité
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    inputClassName
  );
  
  const containerClassNames = twMerge(
    'relative',
    widthStyles,
    containerClassName
  );
  
  const labelClassNames = twMerge(
    'block mb-1 font-medium text-gray-200',
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
    labelClassName
  );
  
  const helperTextClassNames = twMerge(
    'mt-1 text-sm text-gray-500',
    helperTextClassName
  );
  
  const errorClassNames = twMerge(
    'mt-1 text-sm text-red-500',
    errorClassName
  );
  
  return (
    <div className={containerClassNames}>
      {label && (
        <label htmlFor={inputId} className={labelClassNames}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={inputClassNames}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...rest}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <div id={`${inputId}-error`} className={errorClassNames} role="alert">
          {error}
        </div>
      )}
      
      {!error && helperText && (
        <div id={`${inputId}-helper`} className={helperTextClassNames}>
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
