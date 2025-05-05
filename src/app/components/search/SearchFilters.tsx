'use client';

import React, { useState, useEffect } from 'react';
import { FilterOption } from '@/app/services/core/search-service';
import { FiChevronDown, FiChevronUp, FiFilter } from 'react-icons/fi';

interface SearchFiltersProps {
  filterOptions: FilterOption[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filterOptions,
  selectedFilters,
  onFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(selectedFilters);

  // Mettre à jour les filtres locaux quand les filtres sélectionnés changent
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCheckboxChange = (filterId: string, value: string, checked: boolean) => {
    const currentValues = Array.isArray(localFilters[filterId]) 
      ? [...localFilters[filterId]] 
      : [];
    
    let newValues;
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    // Si aucune option n'est sélectionnée, supprimer la clé de filtre
    const updatedFilters = {
      ...localFilters,
      [filterId]: newValues.length > 0 ? newValues : undefined
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSelectChange = (filterId: string, value: string) => {
    const updatedFilters = {
      ...localFilters,
      [filterId]: value || undefined
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleDateChange = (filterId: string, rangeType: 'from' | 'to', value: string) => {
    const updatedFilters = {
      ...localFilters,
      [`date${rangeType === 'from' ? 'From' : 'To'}`]: value || undefined
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    }).length;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg border border-gray-300 mb-4">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <FiFilter className="mr-2 text-gray-600" />
          <span className="font-medium">Filtres</span>
          {activeCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div>
          {isExpanded ? (
            <FiChevronUp className="text-gray-600" />
          ) : (
            <FiChevronDown className="text-gray-600" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map(filter => (
              <div key={filter.id} className="mb-4">
                <h3 className="font-medium mb-2">{filter.label}</h3>
                
                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map(option => {
                      const isChecked = Array.isArray(localFilters[filter.id]) && 
                        localFilters[filter.id]?.includes(option.value);
                      
                      return (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${filter.id}-${option.value}`}
                            checked={isChecked || false}
                            onChange={(e) => handleCheckboxChange(filter.id, option.value, e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <label 
                            htmlFor={`${filter.id}-${option.value}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filter.type === 'select' && filter.options && (
                  <select
                    value={localFilters[filter.id] || ''}
                    onChange={(e) => handleSelectChange(filter.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  >
                    <option value="">Tous</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'dateRange' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">De</label>
                      <input
                        type="date"
                        value={localFilters.dateFrom || ''}
                        onChange={(e) => handleDateChange(filter.id, 'from', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">À</label>
                      <input
                        type="date"
                        value={localFilters.dateTo || ''}
                        onChange={(e) => handleDateChange(filter.id, 'to', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
