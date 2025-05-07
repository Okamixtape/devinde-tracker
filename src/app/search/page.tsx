'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/app/components/search/SearchBar';
import SearchFilters from '@/app/components/search/SearchFilters';
import SearchResults from '@/app/components/search/SearchResults';
import {
  SearchServiceImpl,
  SearchQuery,
  SearchResults as SearchResultsType,
  FilterOption
} from '@/app/services/core/searchService';
import { useDebounce } from '@/app/hooks/useDebounce';

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const searchService = new SearchServiceImpl();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Récupération des options de filtrage disponibles
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await searchService.getFilterOptions();
        if (response.success && response.data) {
          setFilterOptions(response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des options de filtrage:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fonction de recherche qui sera appelée à chaque modification des critères
  const performSearch = useCallback(async () => {
    if (!debouncedSearchTerm) {
      setResults(null);
      return;
    }

    setIsLoading(true);

    try {
      const searchQuery: SearchQuery = {
        term: debouncedSearchTerm,
        filters,
        page: currentPage,
        limit: 10,
        sortBy: filters.sortBy,
        sortOrder: 'desc'
      };

      const response = await searchService.search(searchQuery);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        console.error('Erreur de recherche:', response.error);
        setResults(null);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, filters, currentPage]);

  // Exécuter la recherche lorsque les critères changent
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Réinitialiser la page lorsque les termes de recherche ou filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Recherche</h1>
        
        <div className="mb-6">
          <SearchBar
            placeholder="Rechercher des plans, tâches, projets..."
            onSearch={handleSearch}
            autoFocus={!initialSearchTerm}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchFilters
              filterOptions={filterOptions}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          <div className="lg:col-span-3">
            {results && (
              <SearchResults
                results={results.items}
                totalCount={results.totalCount}
                isLoading={isLoading}
                searchTerm={debouncedSearchTerm}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={results.totalPages}
              />
            )}
            
            {!results && !isLoading && debouncedSearchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Commencez votre recherche en tapant un terme ci-dessus.
                </p>
              </div>
            )}
            
            {!debouncedSearchTerm && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Que recherchez-vous aujourd'hui ?
                </h3>
                <p className="text-gray-500">
                  Saisissez un terme de recherche pour trouver des plans, tâches, projets et utilisateurs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
