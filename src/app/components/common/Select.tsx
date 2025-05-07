'use client';

import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

/**
 * Composant Select
 * 
 * Un menu déroulant personnalisable avec étiquette, texte d'aide et états d'erreur.
 * 
 * @example
 * <Select
 *   label="Pays"
 *   options={[
 *     { value: 'fr', label: 'France' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 *   error={errors.country}
 *   {...register("country")}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  fullWidth = false,
  size = 'md',
  variant = 'outlined',
  containerClassName,
  labelClassName,
  selectClassName,
  helperTextClassName,
  errorClassName,
  id,
  ...rest
}, ref) => {
  // Générer un ID unique si non fourni
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
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
  
  const baseSelectStyles = 'block w-full appearance-none focus:outline-none transition duration-200';
  const errorStateStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const selectClassNames = twMerge(
    baseSelectStyles,
    variantStyles[variant],
    sizeStyles[size],
    errorStateStyles,
    'text-white',
    selectClassName
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
        <label htmlFor={selectId} className={labelClassNames}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={selectClassNames}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...rest}
        >
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {error && (
        <div id={`${selectId}-error`} className={errorClassNames} role="alert">
          {error}
        </div>
      )}
      
      {!error && helperText && (
        <div id={`${selectId}-helper`} className={helperTextClassNames}>
          {helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
