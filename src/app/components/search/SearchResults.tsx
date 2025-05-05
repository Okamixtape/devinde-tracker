'use client';

import React from 'react';
import { SearchResultItem } from '@/app/services/core/search-service';
import { FiFolder, FiCheckCircle, FiClock, FiUser, FiFileText, FiTag } from 'react-icons/fi';
import Link from 'next/link';

interface SearchResultsProps {
  results: SearchResultItem[];
  totalCount: number;
  isLoading: boolean;
  searchTerm: string;
  onPageChange?: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalCount,
  isLoading,
  searchTerm,
  onPageChange,
  currentPage,
  totalPages
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun résultat trouvé</h3>
        <p className="text-gray-500">
          Aucun résultat ne correspond à votre recherche "{searchTerm}".
          <br />
          Essayez de modifier vos termes de recherche ou vos filtres.
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plan':
        return <FiFileText className="text-blue-600" />;
      case 'task':
        return <FiCheckCircle className="text-green-600" />;
      case 'project':
        return <FiFolder className="text-yellow-600" />;
      case 'user':
        return <FiUser className="text-purple-600" />;
      default:
        return <FiFileText className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'plan':
        return 'Plan';
      case 'task':
        return 'Tâche';
      case 'project':
        return 'Projet';
      case 'user':
        return 'Utilisateur';
      default:
        return type;
    }
  };

  const getTypeLink = (item: SearchResultItem) => {
    switch (item.type) {
      case 'plan':
        return `/plans/${item.id}`;
      case 'task':
        return `/tasks/${item.id}`;
      case 'project':
        return `/projects/${item.id}`;
      case 'user':
        return `/profile/${item.id}`;
      default:
        return `#`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;

    let colorClass = '';
    switch (status) {
      case 'active':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'completed':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'in-progress':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'pending':
        colorClass = 'bg-gray-100 text-gray-800';
        break;
      case 'draft':
        colorClass = 'bg-purple-100 text-purple-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <p className="text-gray-600 mb-4">
        {totalCount} résultat{totalCount !== 1 ? 's' : ''} pour "{searchTerm}"
      </p>

      <div className="space-y-4">
        {results.map((item) => (
          <div 
            key={`${item.type}-${item.id}`} 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <Link 
              href={getTypeLink(item)}
              className="block p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase text-gray-500">
                      {getTypeLabel(item.type)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {renderStatusBadge(item.status)}
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center mt-2">
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500 mr-4">
                        <FiTag className="mr-1" />
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, i) => (
                            <span 
                              key={i}
                              className="bg-gray-100 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.owner && (
                      <div className="flex items-center text-xs text-gray-500 mr-4">
                        <FiUser className="mr-1" />
                        {item.owner}
                      </div>
                    )}
                    
                    {item.updatedAt && (
                      <div className="flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1" />
                        Mis à jour le {formatDate(item.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange && onPageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Suivant
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
