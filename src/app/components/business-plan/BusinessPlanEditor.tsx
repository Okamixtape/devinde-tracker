'use client';

import React, { useState, useEffect } from 'react';
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { BusinessPlanData } from "@/app/services/interfaces/dataModels";

interface BusinessPlanEditorProps {
  businessPlanId?: string;
  onSave?: (id: string) => void;
  onCancel?: () => void;
}

/**
 * BusinessPlanEditor Component
 * 
 * Handles the creation and editing of business plans, connecting the UI
 * with the BusinessPlanService layer.
 */
export function BusinessPlanEditor({ 
  businessPlanId,
  onSave,
  onCancel
}: BusinessPlanEditorProps) {
  // State management
  const [plan, setPlan] = useState<Partial<BusinessPlanData>>({
    name: '',
    description: '',
    pitch: { title: '', summary: '', vision: '', values: [] },
    services: { offerings: [], technologies: [], process: [] },
    businessModel: { hourlyRates: [], packages: [], subscriptions: [] },
    marketAnalysis: { competitors: [], targetClients: [], trends: [] },
    financials: { initialInvestment: 0, quarterlyGoals: [0, 0, 0, 0], expenses: [] },
    actionPlan: { milestones: [], tasks: [] }
  });
  const [loading, setLoading] = useState<boolean>(!!businessPlanId);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Service initialization
  const businessPlanService = getBusinessPlanService();
  
  // Load existing plan if we have an ID
  useEffect(() => {
    const loadBusinessPlan = async () => {
      if (!businessPlanId) return;
      
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(businessPlanId);
        if (result.success && result.data) {
          setPlan(result.data);
        } else {
          setErrors({ 
            general: result.error?.message || 'Impossible de charger le plan d\'affaires' 
          });
        }
      } catch (error) {
        setErrors({ 
          general: error instanceof Error ? error.message : 'Une erreur s\'est produite' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [businessPlanId]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlan(prev => ({ ...prev, [name]: value }));
    
    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!plan.name?.trim()) {
      newErrors.name = 'Le nom du plan est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const result = businessPlanId
        ? await businessPlanService.updateItem(businessPlanId, plan)
        : await businessPlanService.createItem(plan as BusinessPlanData);
      
      if (result.success && result.data) {
        onSave?.(result.data.id || '');
      } else {
        setErrors({ 
          general: result.error?.message || 'Échec de l\'enregistrement du plan' 
        });
      }
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Une erreur s\'est produite' 
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {businessPlanId ? 'Modifier le Plan' : 'Créer un Nouveau Plan'}
      </h2>
      
      {errors.general && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{errors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom du Plan
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={plan.name || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white ${
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={plan.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : businessPlanId ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
