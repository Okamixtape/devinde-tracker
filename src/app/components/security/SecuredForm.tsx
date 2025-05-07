'use client';

import React, { useState, FormEvent } from 'react';
import { useErrorHandling } from '@/app/providers/ErrorHandlingProvider';
import { useSecurity } from '@/app/hooks/useSecurity';
import { RateLimitOperation } from "@/app/services/utils/security";

interface SecuredFormProps {
  onSubmit?: (data: Record<string, string>) => void;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'textarea';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  }>;
  submitLabel?: string;
  formTitle?: string;
}

/**
 * A security-hardened form component with input validation and sanitization
 */
export const SecuredForm: React.FC<SecuredFormProps> = ({
  onSubmit,
  fields,
  submitLabel = 'Submit',
  formTitle = 'Secured Form'
}) => {
  const { 
    validateUserInput, 
    sanitizeContent, 
    csrfToken, 
    checkOperationRateLimit 
  } = useSecurity();
  
  const { setError } = useErrorHandling();
  
  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Store sanitized value for all inputs
    const sanitizedValue = sanitizeContent(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate the entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Validate each field
    fields.forEach(field => {
      const value = formData[field.name] || '';
      
      // Configure validation options
      const validationOptions = {
        minLength: field.minLength,
        maxLength: field.maxLength,
        pattern: field.pattern,
        required: field.required,
        fieldName: field.label
      };
      
      // Run validation
      const result = validateUserInput(value, validationOptions);
      
      if (!result.valid) {
        newErrors[field.name] = result.error || `Invalid ${field.label}`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Rate limit check for form submissions
      checkOperationRateLimit(RateLimitOperation.DATA_WRITE);
      
      // Set submitting state
      setIsSubmitting(true);
      
      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }
      
      // Include CSRF token with submission
      const dataToSubmit = {
        ...formData,
        csrf_token: csrfToken
      };
      
      // Call the onSubmit handler
      if (onSubmit) {
        await onSubmit(dataToSubmit);
      }
      
      // Reset form after successful submission
      setFormData({});
    } catch (error) {
      // Error handling already managed by the useSecurity hook
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">{formTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden CSRF field */}
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        {fields.map(field => (
          <div key={field.name} className="space-y-1">
            <label 
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors[field.name] 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors[field.name] 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                pattern={field.pattern?.source}
              />
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
            )}
            
            {field.pattern && field.patternMessage && !errors[field.name] && (
              <p className="mt-1 text-xs text-gray-500">{field.patternMessage}</p>
            )}
          </div>
        ))}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuredForm;
